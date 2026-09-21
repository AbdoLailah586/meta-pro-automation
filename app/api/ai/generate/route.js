import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { generateMarketingPost, FREE_AI_MODELS } from '@/lib/aiService';

export async function GET() {
  return NextResponse.json({
    success: true,
    freeModels: FREE_AI_MODELS,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, tone, postType, platforms, targetAudience, customModel } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json({ success: false, error: 'يرجى كتابة فكرة أو موضوع المنشور' }, { status: 400 });
    }

    const storage = getStorage();
    const aiSettings = storage.settings.ai;

    const apiKey = aiSettings.openRouterApiKey || process.env.OPENROUTER_API_KEY || '';
    const model = customModel || aiSettings.preferredModel || process.env.DEFAULT_AI_MODEL || 'meta-llama/llama-3-8b-instruct:free';

    const result = await generateMarketingPost({
      topic: topic.trim(),
      tone: tone || aiSettings.defaultTone || 'marketing',
      postType: postType || 'offer',
      platforms: platforms || ['facebook', 'instagram'],
      targetAudience: targetAudience || 'العملاء المستهدفين',
      apiKey,
      model,
    });

    return NextResponse.json({
      success: true,
      content: result.content,
      modelUsed: result.modelUsed,
      source: result.source,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
