import { NextResponse } from 'next/server';
import {
  getWhatsAppHubStatus,
  loginWhatsAppAccount,
  createWhatsAppClientAccount,
  listWhatsAppSavedUsers,
  disconnectWhatsAppSession,
  saveWhatsAppConfig,
} from '@/lib/whatsappHubService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getWhatsAppHubStatus();
    const savedUsers = await listWhatsAppSavedUsers();
    return NextResponse.json({ success: true, ...status, savedUsers });
  } catch (err) {
    console.error('Error fetching WhatsApp config:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Sign in with WhatsApp Pro CRM Account (Email/Phone + Password)
    if (action === 'login') {
      const { emailOrPhone, password } = body;
      const result = await loginWhatsAppAccount({ emailOrPhone, password });
      const status = await getWhatsAppHubStatus();
      return NextResponse.json({ success: true, ...result, status });
    }

    // 2. Create new Client Account directly with custom duration plan (Trial 24h, Month, 3 Months, Lifetime)
    if (action === 'create_client') {
      const { displayName, phone, email, password, planDuration, notes } = body;
      const result = await createWhatsAppClientAccount({
        displayName,
        phone,
        email,
        password,
        planDuration,
        notes,
      });
      const savedUsers = await listWhatsAppSavedUsers();
      return NextResponse.json({ success: true, ...result, savedUsers });
    }

    // 3. List saved platform users
    if (action === 'list_users') {
      const savedUsers = await listWhatsAppSavedUsers();
      return NextResponse.json({ success: true, savedUsers });
    }

    // 4. Logout / Disconnect current WhatsApp Pro account
    if (action === 'disconnect') {
      const result = await disconnectWhatsAppSession();
      const status = await getWhatsAppHubStatus();
      return NextResponse.json({ success: true, ...result, status });
    }

    // 5. Update Server configuration
    if (action === 'update_server') {
      const { serverUrl, webhookUrl } = body;
      const config = await saveWhatsAppConfig({ serverUrl, webhookUrl });
      const status = await getWhatsAppHubStatus();
      return NextResponse.json({ success: true, config, status, message: 'تم حفظ إعدادات سيرفر واتساب بنجاح.' });
    }

    // Default: Refresh status
    const status = await getWhatsAppHubStatus();
    const savedUsers = await listWhatsAppSavedUsers();
    return NextResponse.json({ success: true, status, savedUsers });
  } catch (err) {
    console.error('Error in WhatsApp config action:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
