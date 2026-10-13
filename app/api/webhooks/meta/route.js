import { NextResponse } from 'next/server';
import { saveOmnichannelMessage, getMetaDbPool, initMetaTables } from '@/lib/neonMetaSchema';

export const dynamic = 'force-dynamic';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'meta_pro_secret_token_2026';

/**
 * Meta Webhook Verification (Facebook & Instagram)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && (token === VERIFY_TOKEN || token === process.env.META_PAGE_ACCESS_TOKEN)) {
      console.log('[Meta Webhook] Verified successfully!');
      return new Response(challenge, { status: 200 });
    }

    return new Response('Forbidden', { status: 403 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}

/**
 * Meta Inbound Messages Receiver (Facebook Messenger & Instagram Direct)
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const objectType = body.object; // 'page' or 'instagram'

    if (objectType === 'page' || objectType === 'instagram') {
      const channel = objectType === 'page' ? 'facebook' : 'instagram';
      const p = getMetaDbPool();
      if (p) await initMetaTables();

      for (const entry of body.entry || []) {
        for (const event of entry.messaging || []) {
          const senderId = event.sender?.id;
          const message = event.message;

          if (senderId && message && message.text) {
            const conversationId = `${channel === 'facebook' ? 'fb' : 'ig'}_${entry.id}_${senderId}`;
            const text = message.text;
            const now = Date.now();

            if (p) {
              // Upsert conversation
              await p.query(
                `INSERT INTO public.meta_omnichannel_conversations
                 (id, channel, external_id, sender_name, last_message, last_message_time, unread_count, lead_stage, ad_source)
                 VALUES ($1, $2, $3, $4, $5, $6, 1, 'new', $7)
                 ON CONFLICT (id) DO UPDATE SET
                   last_message = EXCLUDED.last_message,
                   last_message_time = EXCLUDED.last_message_time,
                   unread_count = public.meta_omnichannel_conversations.unread_count + 1,
                   updated_at = CURRENT_TIMESTAMP`,
                [
                  conversationId,
                  channel,
                  senderId,
                  `${channel === 'facebook' ? 'عميل فيسبوك' : 'عميل إنستغرام'} (${senderId.slice(-4)})`,
                  text.slice(0, 200),
                  now,
                  `رسالة إعلان ${channel === 'facebook' ? 'فيسبوك' : 'إنستغرام'} المباشرة`,
                ]
              );
            }

            // Save message
            await saveOmnichannelMessage({
              conversationId,
              channel,
              text,
              fromMe: false,
              senderName: `${channel === 'facebook' ? 'عميل فيسبوك' : 'عميل إنستغرام'}`,
            });
          }
        }
      }

      return NextResponse.json({ success: true, status: 'EVENT_RECEIVED' });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Meta Webhook] Processing error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
