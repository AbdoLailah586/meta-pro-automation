import pg from 'pg';
const { Pool } = pg;

let pool = null;

export function getMetaDbPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

let isInitialized = false;

export async function initMetaTables() {
  if (isInitialized) return true;
  const p = getMetaDbPool();
  if (!p) return false;

  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS public.meta_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.meta_campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        objective TEXT,
        budget TEXT,
        start_date TEXT,
        end_date TEXT,
        status TEXT DEFAULT 'active',
        color TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.meta_posts (
        id TEXT PRIMARY KEY,
        campaign_id TEXT,
        content TEXT,
        platforms JSONB,
        media_urls JSONB,
        status TEXT DEFAULT 'draft',
        scheduled_at TIMESTAMP WITH TIME ZONE,
        published_at TIMESTAMP WITH TIME ZONE,
        metrics JSONB,
        meta_post_ids JSONB,
        error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_meta_posts_status ON public.meta_posts(status);
      CREATE INDEX IF NOT EXISTS idx_meta_posts_campaign ON public.meta_posts(campaign_id);

      CREATE TABLE IF NOT EXISTS public.meta_omnichannel_conversations (
        id TEXT PRIMARY KEY,
        channel TEXT NOT NULL,
        external_id TEXT NOT NULL,
        sender_name TEXT,
        phone TEXT,
        avatar_url TEXT,
        last_message TEXT,
        last_message_time BIGINT,
        unread_count INT DEFAULT 0,
        lead_stage TEXT DEFAULT 'new',
        assigned_admin TEXT DEFAULT 'مسؤول التسويق الرئيسي',
        notes TEXT,
        ad_source TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.meta_omnichannel_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        channel TEXT NOT NULL,
        sender_name TEXT,
        from_me BOOLEAN DEFAULT FALSE,
        text TEXT,
        media_type TEXT DEFAULT 'text',
        media_url TEXT,
        status TEXT DEFAULT 'delivered',
        timestamp BIGINT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_omni_conv_channel ON public.meta_omnichannel_conversations(channel);
      CREATE INDEX IF NOT EXISTS idx_omni_msg_conv ON public.meta_omnichannel_messages(conversation_id);
    `);
    isInitialized = true;
    return true;
  } catch (err) {
    console.warn('[Neon Meta] Schema init warning:', err.message);
    return false;
  }
}

export async function fetchMetaFromDb() {
  const p = getMetaDbPool();
  if (!p) return null;

  try {
    await initMetaTables();

    // 1. Fetch settings
    const settingsRes = await p.query('SELECT key, value FROM public.meta_settings');
    const settings = {};
    for (const r of settingsRes.rows) {
      settings[r.key] = r.value;
    }

    // 2. Fetch campaigns
    const campRes = await p.query('SELECT * FROM public.meta_campaigns ORDER BY created_at DESC');
    const campaigns = campRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      objective: r.objective,
      budget: r.budget,
      startDate: r.start_date,
      endDate: r.end_date,
      status: r.status,
      color: r.color,
      createdAt: r.created_at,
    }));

    // 3. Fetch posts
    const postsRes = await p.query('SELECT * FROM public.meta_posts ORDER BY created_at DESC');
    const posts = postsRes.rows.map(r => ({
      id: r.id,
      campaignId: r.campaign_id,
      content: r.content,
      platforms: r.platforms || [],
      mediaUrls: r.media_urls || [],
      status: r.status,
      scheduledAt: r.scheduled_at,
      publishedAt: r.published_at,
      metrics: r.metrics || { likes: 0, comments: 0, shares: 0, reach: 0 },
      metaPostIds: r.meta_post_ids || {},
      error: r.error,
      createdAt: r.created_at,
    }));

    if (postsRes.rowCount === 0 && campRes.rowCount === 0 && settingsRes.rowCount === 0) {
      return null; // DB is empty, needs seeding
    }

    return {
      settings: {
        meta: settings.meta || {},
        ai: settings.ai || {},
      },
      campaigns,
      posts,
    };
  } catch (err) {
    console.warn('[Neon Meta] Fetch error, falling back to local storage:', err.message);
    return null;
  }
}

export async function saveMetaToDb(data) {
  const p = getMetaDbPool();
  if (!p || !data) return false;

  try {
    await initMetaTables();

    // 1. Save settings
    if (data.settings) {
      if (data.settings.meta) {
        await p.query(
          `INSERT INTO public.meta_settings (key, value, updated_at)
           VALUES ('meta', $1, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [JSON.stringify(data.settings.meta)]
        );
      }
      if (data.settings.ai) {
        await p.query(
          `INSERT INTO public.meta_settings (key, value, updated_at)
           VALUES ('ai', $1, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [JSON.stringify(data.settings.ai)]
        );
      }
    }

    // 2. Save campaigns
    if (Array.isArray(data.campaigns)) {
      for (const c of data.campaigns) {
        await p.query(
          `INSERT INTO public.meta_campaigns (id, name, objective, budget, start_date, end_date, status, color)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             objective = EXCLUDED.objective,
             budget = EXCLUDED.budget,
             start_date = EXCLUDED.start_date,
             end_date = EXCLUDED.end_date,
             status = EXCLUDED.status,
             color = EXCLUDED.color`,
          [c.id, c.name, c.objective, c.budget, c.startDate, c.endDate, c.status || 'active', c.color]
        );
      }
    }

    // 3. Save posts
    if (Array.isArray(data.posts)) {
      for (const post of data.posts) {
        await p.query(
          `INSERT INTO public.meta_posts (id, campaign_id, content, platforms, media_urls, status, scheduled_at, published_at, metrics, meta_post_ids, error)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             campaign_id = EXCLUDED.campaign_id,
             content = EXCLUDED.content,
             platforms = EXCLUDED.platforms,
             media_urls = EXCLUDED.media_urls,
             status = EXCLUDED.status,
             scheduled_at = EXCLUDED.scheduled_at,
             published_at = EXCLUDED.published_at,
             metrics = EXCLUDED.metrics,
             meta_post_ids = EXCLUDED.meta_post_ids,
             error = EXCLUDED.error`,
          [
            post.id,
            post.campaignId,
            post.content,
            JSON.stringify(post.platforms || []),
            JSON.stringify(post.mediaUrls || []),
            post.status || 'draft',
            post.scheduledAt || null,
            post.publishedAt || null,
            JSON.stringify(post.metrics || {}),
            JSON.stringify(post.metaPostIds || {}),
            post.error || null,
          ]
        );
      }
    }

    return true;
  } catch (err) {
    console.warn('[Neon Meta] Save to DB error:', err.message);
    return false;
  }
}

/**
 * Seed initial sample ad leads for Facebook & Instagram if omnichannel table is empty
 */
export async function seedOmnichannelInitialData() {
  const p = getMetaDbPool();
  if (!p) return;

  try {
    await initMetaTables();
    const countRes = await p.query('SELECT COUNT(*) as count FROM public.meta_omnichannel_conversations');
    if (parseInt(countRes.rows[0].count, 10) > 0) return;

    const now = Date.now();
    const seedConversations = [
      {
        id: 'fb_1298528889999581_lead_1',
        channel: 'facebook',
        external_id: '1298528889999581_lead_1',
        sender_name: 'محمد إبراهيم طارق',
        phone: '01098234125',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        last_message: 'السلام عليكم، شفت إعلان باقة Google AI Pro سنة ونص، هل متاح الدفع فودافون كاش؟',
        last_message_time: now - 1000 * 60 * 12, // 12 mins ago
        unread_count: 1,
        lead_stage: 'interested',
        assigned_admin: 'مسؤول الردود والمبيعات',
        notes: 'العميل مهتم جداً باشتراك المبرمجين Google AI Pro، سأل عن فودافون كاش.',
        ad_source: 'إعلان فيسبوك الممول: ثورة الذكاء الاصطناعي للمبرمجين',
        messages: [
          {
            id: 'msg_fb_1_1',
            sender_name: 'محمد إبراهيم طارق',
            from_me: false,
            text: 'السلام عليكم ورحمة الله، لو سمحت مهتم بالعرض اللي في الإعلان',
            timestamp: now - 1000 * 60 * 20,
          },
          {
            id: 'msg_fb_1_2',
            sender_name: 'سوق الاشتراكات',
            from_me: true,
            text: 'وعليكم السلام ورحمة الله وبركاته يا فندم! أهلاً بحضرتك. عرض Google AI Pro لمدة 18 شهر بـ 90 جنيه فقط شامل Gemini 3.1 Pro و 5TB سحابي.',
            timestamp: now - 1000 * 60 * 16,
          },
          {
            id: 'msg_fb_1_3',
            sender_name: 'محمد إبراهيم طارق',
            from_me: false,
            text: 'تمام ممتاز جداً، هل متاح الدفع فودافون كاش والتفعيل فوري؟',
            timestamp: now - 1000 * 60 * 12,
          },
        ],
      },
      {
        id: 'ig_17841422785818021_lead_2',
        channel: 'instagram',
        external_id: '17841422785818021_lead_2',
        sender_name: 'سارة عبد الرحمن (sarah_design)',
        phone: '01123489102',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        last_message: 'مرحباً، عاوزة تفاصيل اشتراك كانفا برو مع ضمان الحساب الأصلي',
        last_message_time: now - 1000 * 60 * 45, // 45 mins ago
        unread_count: 2,
        lead_stage: 'new',
        assigned_admin: 'مسؤول الماركتنج',
        notes: 'صانعة محتوى ومصممة، تحتاج Canva Pro و أدوات التصميم بالذكاء الاصطناعي.',
        ad_source: 'ريلز إنستغرام: أدوات التصميم للمحترفين 2026',
        messages: [
          {
            id: 'msg_ig_2_1',
            sender_name: 'سارة عبد الرحمن',
            from_me: false,
            text: 'مرحباً، شفت الريل الخاص بأدوات التصميم والكانفا',
            timestamp: now - 1000 * 60 * 50,
          },
          {
            id: 'msg_ig_2_2',
            sender_name: 'سارة عبد الرحمن',
            from_me: false,
            text: 'مرحباً، عاوزة تفاصيل اشتراك كانفا برو مع ضمان الحساب الأصلي',
            timestamp: now - 1000 * 60 * 45,
          },
        ],
      },
      {
        id: 'fb_1298528889999581_lead_3',
        channel: 'facebook',
        external_id: '1298528889999581_lead_3',
        sender_name: 'م. أحمد خالد الشناوي',
        phone: '01554901823',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        last_message: 'تم تحويل 90 جنيه عبر انستاباي، في انتظار التفعيل يا بطل',
        last_message_time: now - 1000 * 60 * 90, // 1.5 hrs ago
        unread_count: 0,
        lead_stage: 'won',
        assigned_admin: 'مدير المبيعات',
        notes: 'تم الدفع بنجاح عبر انستاباي، جاري إرسال دعوة التفعيل على إيميله.',
        ad_source: 'حملة فيسبوك الممولة: اشتراكات البرمجة والـ AI',
        messages: [
          {
            id: 'msg_fb_3_1',
            sender_name: 'م. أحمد خالد الشناوي',
            from_me: false,
            text: 'مساء الخير، محتاج اشتراك Google AI Pro عشان Google Antigravity و Jules',
            timestamp: now - 1000 * 60 * 120,
          },
          {
            id: 'msg_fb_3_2',
            sender_name: 'سوق الاشتراكات',
            from_me: true,
            text: 'مساء النور يا بشمهندس! الاشتراك متاح فوراً مع صلاحيات Antigravity و Jules بالكامل بـ 90 جنيه فقط. تقدر تحول انستاباي على: souq@instapay',
            timestamp: now - 1000 * 60 * 105,
          },
          {
            id: 'msg_fb_3_3',
            sender_name: 'م. أحمد خالد الشناوي',
            from_me: false,
            text: 'تم تحويل 90 جنيه عبر انستاباي، في انتظار التفعيل يا بطل',
            timestamp: now - 1000 * 60 * 90,
          },
        ],
      },
    ];

    for (const conv of seedConversations) {
      await p.query(
        `INSERT INTO public.meta_omnichannel_conversations
         (id, channel, external_id, sender_name, phone, avatar_url, last_message, last_message_time, unread_count, lead_stage, assigned_admin, notes, ad_source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [
          conv.id,
          conv.channel,
          conv.external_id,
          conv.sender_name,
          conv.phone,
          conv.avatar_url,
          conv.last_message,
          conv.last_message_time,
          conv.unread_count,
          conv.lead_stage,
          conv.assigned_admin,
          conv.notes,
          conv.ad_source,
        ]
      );

      for (const m of conv.messages) {
        await p.query(
          `INSERT INTO public.meta_omnichannel_messages
           (id, conversation_id, channel, sender_name, from_me, text, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [m.id, conv.id, conv.channel, m.sender_name, m.from_me, m.text, m.timestamp]
        );
      }
    }
  } catch (err) {
    console.warn('[Neon Meta] Seed error:', err.message);
  }
}

/**
 * Dynamically get the active tenant schema for WhatsApp contacts & messages.
 * If user is logged into WhatsApp Pro CRM (e.g. Souq El-Eshtirakat), it queries that tenant's dedicated PostgreSQL schema.
 */
export async function getActiveWhatsAppTenantSchema() {
  const p = getMetaDbPool();
  if (!p) return 'public';
  try {
    const res = await p.query("SELECT value FROM public.meta_settings WHERE key = 'whatsapp_active_account'");
    const user = res.rows[0]?.value?.user;
    if (user?.id && user.id !== 'legacy') {
      const clean = String(user.id).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = 't_' + clean;
      const check = await p.query(
        "SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1",
        [schemaName]
      );
      if (check.rows.length > 0) {
        return schemaName;
      }
    }
  } catch (e) {
    console.warn('[Neon Meta] getActiveWhatsAppTenantSchema notice:', e.message);
  }
  return 'public';
}

/**
 * Fetch unified omnichannel conversations across WhatsApp, Facebook, and Instagram
 */
export async function fetchOmnichannelConversations({ channel = 'all', stage = 'all', search = '', limit = 100 } = {}) {
  const p = getMetaDbPool();
  if (!p) return [];

  try {
    await initMetaTables();
    await seedOmnichannelInitialData();

    let conversations = [];

    // 1. Fetch Meta (Facebook & Instagram) and stored Omnichannel conversations
    if (channel === 'all' || channel === 'facebook' || channel === 'instagram') {
      let query = 'SELECT * FROM public.meta_omnichannel_conversations';
      const params = [];
      const conditions = [];

      if (channel !== 'all') {
        params.push(channel);
        conditions.push(`channel = $${params.length}`);
      }

      if (stage !== 'all') {
        params.push(stage);
        conditions.push(`lead_stage = $${params.length}`);
      }

      if (search) {
        params.push(`%${search.toLowerCase()}%`);
        conditions.push(`(LOWER(sender_name) LIKE $${params.length} OR LOWER(phone) LIKE $${params.length} OR LOWER(last_message) LIKE $${params.length})`);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY last_message_time DESC LIMIT 100';

      const res = await p.query(query, params);
      for (const r of res.rows) {
        conversations.push({
          id: r.id,
          channel: r.channel,
          externalId: r.external_id,
          senderName: r.sender_name || 'عميل محتمل',
          phone: r.phone || '',
          avatarUrl: r.avatar_url || '',
          lastMessage: r.last_message || '',
          lastMessageTime: Number(r.last_message_time || 0),
          unreadCount: Number(r.unread_count || 0),
          leadStage: r.lead_stage || 'new',
          assignedAdmin: r.assigned_admin || 'مسؤول التسويق',
          notes: r.notes || '',
          adSource: r.ad_source || 'إعلانات السوشيال ميديا',
        });
      }
    }

    // 2. Fetch live WhatsApp contacts from active tenant schema contacts table
    if (channel === 'all' || channel === 'whatsapp') {
      const tenantSchema = await getActiveWhatsAppTenantSchema();
      let waQuery = `
        SELECT jid, name, phone, avatar_url, last_message, last_message_time,
               unread_count, lead_stage, status_tag, assigned_agent, custom_notes
        FROM "${tenantSchema}".contacts
        WHERE jid NOT LIKE '%@g.us'
      `;
      const waParams = [];

      if (search) {
        waParams.push(`%${search.toLowerCase()}%`);
        waQuery += ` AND (LOWER(name) LIKE $${waParams.length} OR LOWER(phone) LIKE $${waParams.length} OR LOWER(last_message) LIKE $${waParams.length})`;
      }

      if (stage !== 'all') {
        waParams.push(stage);
        waQuery += ` AND (lead_stage = $${waParams.length} OR status_tag = $${waParams.length})`;
      }

      waQuery += ' ORDER BY last_message_time DESC NULLS LAST LIMIT 100';

      try {
        const waRes = await p.query(waQuery, waParams);
        for (const r of waRes.rows) {
          const rawPhone = r.phone || (r.jid ? r.jid.split('@')[0].replace(/\D/g, '') : '');
          conversations.push({
            id: `wa_${r.jid}`,
            channel: 'whatsapp',
            externalId: r.jid,
            senderName: r.name || rawPhone || 'عميل واتساب',
            phone: rawPhone,
            avatarUrl: r.avatar_url || '',
            lastMessage: r.last_message || 'محادثة واتساب نشطة',
            lastMessageTime: Number(r.last_message_time || 0),
            unreadCount: Number(r.unread_count || 0),
            leadStage: r.lead_stage || r.status_tag || 'new',
            assignedAdmin: r.assigned_agent || 'مسؤول التسويق الرئيسي',
            notes: r.custom_notes || '',
            adSource: 'إعلانات واتساب المباشرة (WhatsApp Pro)',
          });
        }
      } catch (waErr) {
        console.warn('[Neon Meta] WhatsApp contacts fetch error:', waErr.message);
      }
    }

    // Sort all conversations by lastMessageTime descending
    conversations.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));

    if (limit && conversations.length > limit) {
      conversations = conversations.slice(0, limit);
    }

    return conversations;
  } catch (err) {
    console.error('[Neon Meta] fetchOmnichannelConversations error:', err.message);
    return [];
  }
}

/**
 * Fetch messages for a specific conversation
 */
export async function fetchOmnichannelMessages(conversationId) {
  const p = getMetaDbPool();
  if (!p || !conversationId) return [];

  try {
    await initMetaTables();
    let messages = [];

    // If it's a WhatsApp conversation
    if (conversationId.startsWith('wa_')) {
      const tenantSchema = await getActiveWhatsAppTenantSchema();
      const jid = conversationId.replace(/^wa_/, '');
      const waMsgRes = await p.query(
        `SELECT id, contact_jid, sender_name, text, media_type, media_url, from_me, timestamp
         FROM "${tenantSchema}".messages
         WHERE contact_jid = $1
         ORDER BY timestamp ASC
         LIMIT 150`,
        [jid]
      );

      for (const m of waMsgRes.rows) {
        messages.push({
          id: m.id,
          conversationId,
          channel: 'whatsapp',
          senderName: m.sender_name || (Number(m.from_me) === 1 ? 'أنت' : 'العميل'),
          fromMe: Number(m.from_me) === 1,
          text: m.text || '',
          mediaType: m.media_type || 'text',
          mediaUrl: m.media_url || null,
          status: 'delivered',
          timestamp: Number(m.timestamp || 0),
        });
      }
    }

    // Also check public.meta_omnichannel_messages
    const omniRes = await p.query(
      `SELECT * FROM public.meta_omnichannel_messages
       WHERE conversation_id = $1
       ORDER BY timestamp ASC
       LIMIT 150`,
      [conversationId]
    );

    for (const m of omniRes.rows) {
      // Don't duplicate if already fetched
      if (!messages.some(existing => existing.id === m.id)) {
        messages.push({
          id: m.id,
          conversationId: m.conversation_id,
          channel: m.channel,
          senderName: m.sender_name,
          fromMe: Boolean(m.from_me),
          text: m.text || '',
          mediaType: m.media_type || 'text',
          mediaUrl: m.media_url || null,
          status: m.status || 'delivered',
          timestamp: Number(m.timestamp || 0),
        });
      }
    }

    messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    return messages;
  } catch (err) {
    console.error('[Neon Meta] fetchOmnichannelMessages error:', err.message);
    return [];
  }
}

/**
 * Save outbound or inbound message and update conversation summary
 */
export async function saveOmnichannelMessage({
  conversationId,
  channel,
  text,
  fromMe = true,
  senderName = 'مسؤول التسويق',
  mediaUrl = null,
  mediaType = 'text',
}) {
  const p = getMetaDbPool();
  if (!p) return null;

  try {
    await initMetaTables();
    const msgId = `omni_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();

    // 1. Save to meta_omnichannel_messages
    await p.query(
      `INSERT INTO public.meta_omnichannel_messages
       (id, conversation_id, channel, sender_name, from_me, text, media_type, media_url, status, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'delivered', $9)`,
      [msgId, conversationId, channel, senderName, fromMe, text, mediaType, mediaUrl, now]
    );

    // 2. Update conversation last_message
    if (conversationId.startsWith('wa_')) {
      const tenantSchema = await getActiveWhatsAppTenantSchema();
      const jid = conversationId.replace(/^wa_/, '');
      await p.query(
        `UPDATE "${tenantSchema}".contacts
         SET last_message = $1, last_message_time = $2, unread_count = 0
         WHERE jid = $3`,
        [text.slice(0, 200), now, jid]
      );

      // Also record into tenant messages for WhatsApp Pro synchronization
      await p.query(
        `INSERT INTO "${tenantSchema}".messages
         (id, contact_jid, sender_name, text, media_type, media_url, from_me, auto_replied, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8)
         ON CONFLICT (id) DO NOTHING`,
        [msgId, jid, senderName, text, mediaType, mediaUrl || '', fromMe ? 1 : 0, now]
      );
    } else {
      await p.query(
        `UPDATE public.meta_omnichannel_conversations
         SET last_message = $1, last_message_time = $2, unread_count = 0, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [text.slice(0, 200), now, conversationId]
      );
    }

    return {
      id: msgId,
      conversationId,
      channel,
      senderName,
      fromMe,
      text,
      mediaType,
      mediaUrl,
      status: 'delivered',
      timestamp: now,
    };
  } catch (err) {
    console.error('[Neon Meta] saveOmnichannelMessage error:', err.message);
    throw err;
  }
}

/**
 * Update lead status, notes, or assigned administrator
 */
export async function updateLeadMetadata(conversationId, { leadStage, assignedAdmin, notes }) {
  const p = getMetaDbPool();
  if (!p) return false;

  try {
    await initMetaTables();
    if (conversationId.startsWith('wa_')) {
      const tenantSchema = await getActiveWhatsAppTenantSchema();
      const jid = conversationId.replace(/^wa_/, '');
      const fields = [];
      const values = [];
      let idx = 1;

      if (leadStage !== undefined) {
        fields.push(`lead_stage = $${idx++}`);
        values.push(leadStage);
        fields.push(`status_tag = $${idx++}`);
        values.push(leadStage);
      }
      if (assignedAdmin !== undefined) {
        fields.push(`assigned_agent = $${idx++}`);
        values.push(assignedAdmin);
      }
      if (notes !== undefined) {
        fields.push(`custom_notes = $${idx++}`);
        values.push(notes);
      }

      if (fields.length > 0) {
        values.push(jid);
        await p.query(`UPDATE "${tenantSchema}".contacts SET ${fields.join(', ')} WHERE jid = $${idx}`, values);
      }
    } else {
      const fields = [];
      const values = [];
      let idx = 1;

      if (leadStage !== undefined) {
        fields.push(`lead_stage = $${idx++}`);
        values.push(leadStage);
      }
      if (assignedAdmin !== undefined) {
        fields.push(`assigned_admin = $${idx++}`);
        values.push(assignedAdmin);
      }
      if (notes !== undefined) {
        fields.push(`notes = $${idx++}`);
        values.push(notes);
      }

      if (fields.length > 0) {
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(conversationId);
        await p.query(`UPDATE public.meta_omnichannel_conversations SET ${fields.join(', ')} WHERE id = $${idx}`, values);
      }
    }

    return true;
  } catch (err) {
    console.error('[Neon Meta] updateLeadMetadata error:', err.message);
    return false;
  }
}

