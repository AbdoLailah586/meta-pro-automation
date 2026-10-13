import { NextResponse } from 'next/server';
import {
  getWhatsAppHubStatus,
  switchWhatsAppNumber,
  disconnectWhatsAppSession,
  saveWhatsAppConfig,
} from '@/lib/whatsappHubService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getWhatsAppHubStatus();
    return NextResponse.json({ success: true, ...status });
  } catch (err) {
    console.error('Error fetching WhatsApp config:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'switch_number') {
      const { newPhone, method } = body;
      const result = await switchWhatsAppNumber({ newPhone, method });
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'disconnect') {
      const result = await disconnectWhatsAppSession();
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'update_server') {
      const { serverUrl, webhookUrl } = body;
      const config = await saveWhatsAppConfig({ serverUrl, webhookUrl });
      const status = await getWhatsAppHubStatus();
      return NextResponse.json({ success: true, config, status, message: 'تم حفظ إعدادات سيرفر واتساب بنجاح.' });
    }

    // Default: Refresh status
    const status = await getWhatsAppHubStatus();
    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error('Error in WhatsApp config action:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
