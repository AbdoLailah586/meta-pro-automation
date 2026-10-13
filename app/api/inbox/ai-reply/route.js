import { NextResponse } from 'next/server';
import { generateSmartCustomerReply } from '@/lib/aiService';
import { getStorageAsync } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { customerName, lastMessage, channel, adSource } = body;

    const storage = await getStorageAsync();
    const apiKey = storage?.settings?.ai?.openRouterApiKey || process.env.OPENROUTER_API_KEY || '';
    const model = storage?.settings?.ai?.preferredModel || process.env.DEFAULT_AI_MODEL || 'meta-llama/llama-3-8b-instruct:free';

    const reply = await generateSmartCustomerReply({
      customerName: customerName || 'العميل',
      lastMessage: lastMessage || '',
      channel: channel || 'whatsapp',
      adSource: adSource || '',
      apiKey,
      model,
    });

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (err) {
    console.error('Error generating AI reply:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
