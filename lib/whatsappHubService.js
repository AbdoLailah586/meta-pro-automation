import { getMetaDbPool } from './neonMetaSchema.js';

const DEFAULT_SERVER_URL = (process.env.WHATSAPP_SERVER_URL || 'https://whatsapp-pro-crm-production-613b.up.railway.app').replace(/\/+$/, '');

/**
 * Get current configured WhatsApp server URL
 */
export async function getWhatsAppServerUrl() {
  const pool = getMetaDbPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT value FROM public.meta_settings WHERE key = 'whatsapp_config'");
      if (res.rows[0]?.value?.serverUrl) {
        return res.rows[0].value.serverUrl.replace(/\/+$/, '');
      }
    } catch (e) {}
  }
  return DEFAULT_SERVER_URL;
}

/**
 * Save custom WhatsApp server URL or settings
 */
export async function saveWhatsAppConfig({ serverUrl, webhookUrl }) {
  const pool = getMetaDbPool();
  if (!pool) return false;

  const currentUrl = serverUrl ? serverUrl.replace(/\/+$/, '') : DEFAULT_SERVER_URL;
  const config = {
    serverUrl: currentUrl,
    webhookUrl: webhookUrl || '',
    updatedAt: new Date().toISOString(),
  };

  await pool.query(
    `INSERT INTO public.meta_settings (key, value, updated_at)
     VALUES ('whatsapp_config', $1, CURRENT_TIMESTAMP)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
    [JSON.stringify(config)]
  );

  return config;
}

/**
 * Get the currently connected / authenticated WhatsApp Pro CRM account
 */
export async function getActiveWhatsAppAccount() {
  const pool = getMetaDbPool();
  if (!pool) return null;
  try {
    const res = await pool.query("SELECT value FROM public.meta_settings WHERE key = 'whatsapp_active_account'");
    if (res.rows[0]?.value) {
      return res.rows[0].value;
    }
  } catch (e) {
    console.warn('[WhatsAppHub] getActiveWhatsAppAccount notice:', e.message);
  }
  return null;
}

/**
 * Save authenticated WhatsApp Pro CRM account
 */
export async function saveActiveWhatsAppAccount(accountData) {
  const pool = getMetaDbPool();
  if (!pool) return false;
  await pool.query(
    `INSERT INTO public.meta_settings (key, value, updated_at)
     VALUES ('whatsapp_active_account', $1, CURRENT_TIMESTAMP)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
    [JSON.stringify(accountData)]
  );
  return true;
}

/**
 * Login with WhatsApp Pro CRM Account (Email/Phone + Password)
 * Authenticates against WhatsApp Pro CRM server and links the session.
 * If user already scanned QR before, it connects immediately!
 */
export async function loginWhatsAppAccount({ emailOrPhone, password }) {
  const serverUrl = await getWhatsAppServerUrl();
  let cleanIdentifier = String(emailOrPhone || '').trim();

  if (!cleanIdentifier || !password) {
    throw new Error('البريد الإلكتروني / رقم الهاتف وكلمة المرور مطلوبان لتسجيل الدخول.');
  }

  // 1. Call WhatsApp Pro CRM /api/auth/login
  let loginRes;
  try {
    loginRes = await fetch(`${serverUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanIdentifier, password }),
    });
  } catch (err) {
    throw new Error(`تعذر الاتصال بسيرفر واتساب المستضاف (${serverUrl}): ${err.message}`);
  }

  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success) {
    throw new Error(loginData.error || 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.');
  }

  const user = loginData.user;
  const token = loginData.token;

  // 2. Query Neon DB to check if this user already has an active Baileys session
  let isAlreadyLinked = false;
  let linkedPhone = user.phone || '';
  let linkedName = user.displayName || '';

  const pool = getMetaDbPool();
  if (pool) {
    try {
      const authRes = await pool.query(
        "SELECT value FROM public.baileys_auth_store WHERE user_id = $1 AND key = 'creds' LIMIT 1",
        [user.id]
      );
      if (authRes.rows[0]) {
        try {
          const creds = JSON.parse(authRes.rows[0].value);
          if (creds.me?.id) {
            isAlreadyLinked = true;
            linkedPhone = creds.me.id.split('@')[0].split(':')[0].replace(/\D/g, '');
            if (creds.me.name) linkedName = creds.me.name;
          }
        } catch (parseE) {}
      }
    } catch (dbE) {
      console.warn('[WhatsAppHub] Auth check error:', dbE.message);
    }
  }

  // 3. Check WhatsApp live status on the server for this user
  let serverQr = null;
  let serverStatus = 'disconnected';
  try {
    const statusRes = await fetch(`${serverUrl}/api/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (statusRes.ok) {
      const st = await statusRes.json();
      serverStatus = st.status || (isAlreadyLinked ? 'connected' : 'disconnected');
      serverQr = st.qr || null;
      if (st.user?.id) {
        isAlreadyLinked = true;
        linkedPhone = st.user.id.split('@')[0].split(':')[0].replace(/\D/g, '');
        if (st.user.name) linkedName = st.user.name;
      }
    }
  } catch (e) {}

  // 4. Save active account state in meta_settings
  const activeAccount = {
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isAdmin: user.isAdmin,
      status: user.status,
      expiresAt: user.expiresAt,
      phone: linkedPhone || user.phone,
    },
    linkedPhone,
    linkedName,
    isAlreadyLinked,
    loggedInAt: new Date().toISOString(),
    serverUrl,
  };

  await saveActiveWhatsAppAccount(activeAccount);

  return {
    success: true,
    user: activeAccount.user,
    isAlreadyLinked,
    serverStatus,
    qr: serverQr,
    phone: linkedPhone,
    message: isAlreadyLinked
      ? `تم تسجيل الدخول بنجاح! تم التعرف على جلسة الواتساب النشطة للرقم (+${linkedPhone}) وجاهز لاستقبال رسائل الإعلانات.`
      : `تم تسجيل الدخول بنجاح بحساب (${user.displayName || user.email}). يرجى مسح الـ QR للربط لأول مرة.`,
  };
}

/**
 * Create a new Client Account in WhatsApp Pro CRM (Admin feature)
 */
export async function createWhatsAppClientAccount({
  displayName,
  phone,
  email,
  password,
  planDuration = '1m',
  notes = '',
}) {
  const serverUrl = await getWhatsAppServerUrl();
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  let targetEmail = email ? String(email).trim() : '';

  if (!targetEmail && cleanPhone) {
    targetEmail = `${cleanPhone}@whatsapp.pro`;
  }

  if (!displayName || !password || (!targetEmail && !cleanPhone)) {
    throw new Error('يرجى إدخال اسم العميل، رقم الهاتف أو البريد، وكلمة المرور.');
  }

  // Calculate duration days
  let durationDays = 30; // default 1 month
  let expiresAt = null;
  const now = Date.now();

  if (planDuration === '24h') {
    durationDays = 1;
    expiresAt = now + 24 * 60 * 60 * 1000;
  } else if (planDuration === '1m') {
    durationDays = 30;
    expiresAt = now + 30 * 24 * 60 * 60 * 1000;
  } else if (planDuration === '3m') {
    durationDays = 90;
    expiresAt = now + 90 * 24 * 60 * 60 * 1000;
  } else if (planDuration === '1y') {
    durationDays = 365;
    expiresAt = now + 365 * 24 * 60 * 60 * 1000;
  } else if (planDuration === 'lifetime') {
    durationDays = null;
    expiresAt = null; // null = lifetime
  }

  // Try calling Admin endpoint on Railway
  const activeAccount = await getActiveWhatsAppAccount();
  const adminToken = activeAccount?.token;

  try {
    const res = await fetch(`${serverUrl}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}),
      },
      body: JSON.stringify({
        displayName,
        phone: cleanPhone,
        email: targetEmail,
        password,
        durationDays,
        expiresAt,
        notes: notes || `حساب عميل تم إنشاؤه عبر Meta Pro Suite - باقة: ${planDuration}`,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        user: data.user,
        message: 'تم إنشاء حساب العميل بنجاح في منصة WhatsApp Pro CRM.',
      };
    }
  } catch (err) {
    console.warn('[WhatsAppHub] Admin create error:', err.message);
  }

  // If server admin endpoint returned 401 or failed, self-register via /api/auth/register
  try {
    const regRes = await fetch(`${serverUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: targetEmail,
        password,
        displayName: displayName || `عميل (${cleanPhone})`,
      }),
    });

    const regData = await regRes.json();
    if (regRes.ok && regData.success) {
      return {
        success: true,
        user: regData.user,
        message: 'تم تسجيل حساب العميل الجديد بنجاح ويمكنه الآن تسجيل الدخول وربط الواتساب.',
      };
    } else {
      throw new Error(regData.error || 'تعذر إنشاء الحساب.');
    }
  } catch (regErr) {
    throw new Error(`خطأ في إنشاء الحساب: ${regErr.message}`);
  }
}

/**
 * List existing platform users for quick selection
 */
export async function listWhatsAppSavedUsers() {
  const pool = getMetaDbPool();
  if (!pool) return [];
  try {
    const res = await pool.query(
      `SELECT id, email, display_name, phone, is_admin, status, expires_at
       FROM public.platform_users
       ORDER BY created_at DESC NULLS LAST LIMIT 20`
    );
    return res.rows.map(r => ({
      id: r.id,
      email: r.email,
      displayName: r.display_name || r.email,
      phone: r.phone || '',
      isAdmin: Boolean(r.is_admin),
      status: r.status,
      expiresAt: r.expires_at ? Number(r.expires_at) : null,
    }));
  } catch (e) {
    return [];
  }
}

/**
 * Retrieve comprehensive status of the WhatsApp Pro platform, receiving phone number, and database
 */
export async function getWhatsAppHubStatus() {
  const serverUrl = await getWhatsAppServerUrl();
  const activeAccount = await getActiveWhatsAppAccount();
  const targetUserId = activeAccount?.user?.id;

  let serverOnline = false;
  let serverStatus = 'disconnected';
  let serverPhone = '';
  let serverUser = null;
  let serverQr = null;

  // 1. Try checking live Railway / Hosted server
  const startTime = Date.now();
  let latencyMs = 0;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const headers = { 'Accept': 'application/json' };
    if (activeAccount?.token) {
      headers['Authorization'] = `Bearer ${activeAccount.token}`;
    }

    const res = await fetch(`${serverUrl}/api/status`, {
      method: 'GET',
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    latencyMs = Date.now() - startTime;

    if (res.ok) {
      serverOnline = true;
      const data = await res.json();
      serverStatus = data.status || 'connected';
      serverQr = data.qr || null;
      serverUser = data.user || null;
      if (data.user?.id) {
        serverPhone = data.user.id.split('@')[0].split(':')[0].replace(/\D/g, '');
      }
    } else {
      // 401 or other response means server is alive and running!
      serverOnline = true;
    }
  } catch (err) {
    serverOnline = false;
    latencyMs = Date.now() - startTime;
  }

  // 2. Query Neon DB for exact persistent session, active receiving phone number, and CRM statistics
  let dbRegistered = false;
  let activePhone = serverPhone;
  let accountName = activeAccount?.user?.displayName || 'سوق الاشتراكات (WhatsApp Pro)';
  let totalContacts = 0;
  let totalMessages = 0;
  let lastMessageAt = null;

  const pool = getMetaDbPool();
  if (pool) {
    try {
      // Check Baileys auth session for the specific user if logged in, or fallback to any active user
      let authQuery = "SELECT user_id, value FROM public.baileys_auth_store WHERE key = 'creds'";
      const authParams = [];
      if (targetUserId) {
        authQuery += " AND user_id = $1";
        authParams.push(targetUserId);
      }
      authQuery += " LIMIT 1";

      const authRes = await pool.query(authQuery, authParams);
      if (authRes.rows[0]) {
        try {
          const creds = JSON.parse(authRes.rows[0].value);
          dbRegistered = Boolean(creds.registered || creds.me);
          if (creds.me?.id) {
            activePhone = creds.me.id.split('@')[0].split(':')[0].replace(/\D/g, '');
          }
          if (creds.me?.name) {
            accountName = creds.me.name;
          }
        } catch (parseErr) {}
      }

      // If still no phone found and no specific user logged in, check user 7f95e1ac (سوق الاشتراكات)
      if (!activePhone) {
        const fallbackRes = await pool.query(
          "SELECT value FROM public.baileys_auth_store WHERE user_id = '7f95e1ac-65f1-4dd2-9ea6-153df44b2395' AND key = 'creds' LIMIT 1"
        );
        if (fallbackRes.rows[0]) {
          try {
            const creds = JSON.parse(fallbackRes.rows[0].value);
            if (creds.me?.id) {
              activePhone = creds.me.id.split('@')[0].split(':')[0].replace(/\D/g, '');
              accountName = creds.me.name || accountName;
              dbRegistered = true;
            }
          } catch (e) {}
        }
      }

      // Check CRM counts
      const countRes = await pool.query(
        "SELECT COUNT(*) as count FROM public.contacts WHERE jid NOT LIKE '%@g.us'"
      );
      totalContacts = parseInt(countRes.rows[0]?.count || 0, 10);

      const msgCountRes = await pool.query("SELECT COUNT(*) as count FROM public.messages");
      totalMessages = parseInt(msgCountRes.rows[0]?.count || 0, 10);

      const lastMsgRes = await pool.query("SELECT timestamp FROM public.messages ORDER BY timestamp DESC LIMIT 1");
      if (lastMsgRes.rows[0]?.timestamp) {
        lastMessageAt = Number(lastMsgRes.rows[0].timestamp);
      }
    } catch (dbErr) {
      console.warn('[WhatsAppHub] DB stats error:', dbErr.message);
    }
  }

  // Format phone display
  let formattedPhone = activePhone;
  if (activePhone) {
    if (activePhone.startsWith('20') && activePhone.length >= 12) {
      formattedPhone = `+${activePhone.slice(0, 2)} ${activePhone.slice(2, 5)} ${activePhone.slice(5, 8)} ${activePhone.slice(8)}`;
    } else {
      formattedPhone = `+${activePhone}`;
    }
  }

  const isConnected = dbRegistered || serverStatus === 'connected';

  return {
    isOnline: serverOnline || dbRegistered,
    isConnected,
    serverUrl,
    latencyMs,
    status: isConnected ? 'connected' : (serverQr ? 'qr_ready' : serverStatus),
    activePhone,
    formattedPhone: formattedPhone || 'غير متصل حالياً',
    accountName,
    activeAccount: activeAccount?.user || null,
    qrCode: serverQr,
    stats: {
      totalContacts,
      totalMessages,
      lastMessageAt,
    },
    serviceHost: 'Railway Cloud Container',
    databaseCluster: 'Neon Cloud PostgreSQL (Shared Multi-Tenant)',
  };
}

/**
 * Logout / Disconnect current WhatsApp Pro CRM Account
 */
export async function disconnectWhatsAppSession() {
  const pool = getMetaDbPool();
  if (pool) {
    try {
      await pool.query("DELETE FROM public.meta_settings WHERE key = 'whatsapp_active_account'");
    } catch (e) {}
  }

  return {
    success: true,
    message: 'تم تسجيل الخروج وإلغاء ربط الحساب الحالي بنجاح. يمكنك الآن تسجيل الدخول بحساب عميل آخر.',
  };
}
