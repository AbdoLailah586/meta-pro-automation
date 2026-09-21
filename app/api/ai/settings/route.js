import { NextResponse } from 'next/server';
import { getStorage, saveStorage } from '@/lib/storage';
import { FREE_AI_MODELS } from '@/lib/aiService';

export async function GET() {
  try {
    const storage = getStorage();
    const ai = storage.settings.ai;
    return NextResponse.json({
      success: true,
      settings: {
        hasApiKey: Boolean(ai.openRouterApiKey && ai.openRouterApiKey.length > 5),
        preferredModel: ai.preferredModel,
        defaultTone: ai.defaultTone,
        defaultLanguage: ai.defaultLanguage,
      },
      availableModels: FREE_AI_MODELS,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { openRouterApiKey, preferredModel, defaultTone, defaultLanguage } = body;

    const storage = getStorage();

    if (openRouterApiKey !== undefined) {
      storage.settings.ai.openRouterApiKey = openRouterApiKey.trim();
    }
    if (preferredModel) {
      storage.settings.ai.preferredModel = preferredModel;
    }
    if (defaultTone) {
      storage.settings.ai.defaultTone = defaultTone;
    }
    if (defaultLanguage) {
      storage.settings.ai.defaultLanguage = defaultLanguage;
    }

    saveStorage(storage);

    return NextResponse.json({
      success: true,
      message: 'تم حفظ إعدادات الذكاء الاصطناعي بنجاح',
      settings: {
        hasApiKey: Boolean(storage.settings.ai.openRouterApiKey && storage.settings.ai.openRouterApiKey.length > 5),
        preferredModel: storage.settings.ai.preferredModel,
        defaultTone: storage.settings.ai.defaultTone,
        defaultLanguage: storage.settings.ai.defaultLanguage,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
