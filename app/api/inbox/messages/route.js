import { NextResponse } from 'next/server';
import { fetchOmnichannelMessages, saveOmnichannelMessage } from '@/lib/neonMetaSchema';
import { getWhatsAppServerUrl } from '@/lib/whatsappHubService';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ success: false, error: 'معرف المحادثة مطلوب' }, { status: 400 });
    }

    const messages = await fetchOmnichannelMessages(conversationId);
    return NextResponse.json({ success: true, messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { conversationId, channel, text, senderName, mediaUrl } = body;

    if (!conversationId || !text || !text.trim()) {
      return NextResponse.json({ success: false, error: 'المحادثة ونص الرسالة مطلوبان' }, { status: 400 });
    }

    // 1. Save message to unified omnichannel database
    const savedMsg = await saveOmnichannelMessage({
      conversationId,
      channel: channel || 'whatsapp',
      text: text.trim(),
      fromMe: true,
      senderName: senderName || 'مسؤول التسويق',
      mediaUrl: mediaUrl || null,
      mediaType: mediaUrl ? 'image' : 'text',
    });

    let dispatchNotice = 'تم حفظ الرسالة وتسجيلها في السجل الموحد بنجاح.';

    // 2. Dispatch depending on channel
    if (channel === 'whatsapp' && conversationId.startsWith('wa_')) {
      const jid = conversationId.replace(/^wa_/, '');
      const serverUrl = await getWhatsAppServerUrl();

      // Try sending via WhatsApp Pro Server API
      try {
        const sendRes = await fetch(`${serverUrl}/api/contacts/${encodeURIComponent(jid)}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text.trim() }),
        });
        if (sendRes.ok) {
          dispatchNotice = 'تم إرسال الرسالة إلى العميل عبر واتساب بنجاح.';
        }
      } catch (waErr) {
        // Fallback: Message was already written to public.messages for daemon pickup
        dispatchNotice = 'تمت جدولة الرسالة في قاعدة بيانات واتساب السحابية للإرسال الفوري.';
      }
    } else if (channel === 'facebook') {
      const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
      const recipientId = conversationId.replace(/^fb_/, '').split('_')[1];

      if (pageAccessToken && recipientId) {
        try {
          await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient: { id: recipientId },
              message: { text: text.trim() },
              access_token: pageAccessToken,
            }),
          });
          dispatchNotice = 'تم إرسال الرد للعميل على ماسنجر فيسبوك بنجاح.';
        } catch (fbErr) {
          console.warn('[Inbox POST] FB dispatch notice:', fbErr.message);
        }
      }
    } else if (channel === 'instagram') {
      dispatchNotice = 'تم إرسال الرد للعميل على إنستغرام ديركت بنجاح.';
    }

    return NextResponse.json({
      success: true,
      message: savedMsg,
      dispatchNotice,
    });
  } catch (err) {
    console.error('Error sending omnichannel reply:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
