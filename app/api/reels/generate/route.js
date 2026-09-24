import { NextResponse } from 'next/server';
import { getStorageAsync } from '@/lib/storage';

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic = 'Gemini Pro 18 شهر بـ 150 ج.م', product = 'gemini-pro', targetAudience = 'المهتمين بالذكاء الاصطناعي والتخزين' } = body;

    const storage = await getStorageAsync();
    const apiKey = storage?.settings?.ai?.openRouterApiKey || process.env.OPENROUTER_API_KEY || '';
    const model = storage?.settings?.ai?.preferredModel || 'meta-llama/llama-3-8b-instruct:free';

    let reelData = null;

    if (apiKey) {
      try {
        const prompt = `أنت خبير صناعة محتوى تسويقي فيروسي (Viral Reels Expert) متخصص في ريلز إنستغرام وفيسبوك وتيك توك عالية التحويل والمشاهدات.
المطلوب كتابة سكريبت فيديو ريلز قصير (من 20 إلى 30 ثانية) تسويقي ومقنع جداً للمنتج التالي:
المنتج: ${topic}
الجمهور المستهدف: ${targetAudience}

مزايا المنتج الأساسية:
- اشتراك Google Gemini Pro لمدة 18 شهر كاملة.
- مساحة تخزين سحابية Google One ضخمة: 5 تيرابايت (5,000GB) بدلاً من 15 جيجا.
- ذكاء جوجل المتطور لتحليل الملفات والبرمجة وصناعة المحتوى.
- أداة الأبحاث والـ PDF الذكية NotebookLM وتوليد الفيديو Veo.
- تفعيل رسمي على الإيميل الشخصي مع خصوصية 100% وضمان ذهبي كامل.
- السعر: 150 جنيه مصري فقط بدل آلاف الجنيهات!
- الطلب فوري عبر متجر سوق الاشتراكات والواتساب، والدفع فودافون كاش وإنستاباي.

يجب إخراج الرد بصيغة JSON حصراً بهذا الهيكل الدقيق:
{
  "title": "عنوان الريلز الجذاب",
  "hook": "الخطاف في أول 3 ثواني لإيقاف التمرير (Scroll-Stopping Hook)",
  "problem": "المشكلة في 3-8 ثواني (نفاد مساحة التخزين أو غلاء الاشتراكات)",
  "solution": "الحل والعرض الخرافي في 8-20 ثانية",
  "cta": "الدعوة لاتخاذ إجراء واضحة للواتساب والمتجر في 20-30 ثانية",
  "scenes": [
    {
      "time": "00:00 - 00:03",
      "visual": "وصف المشهد البصري (B-roll footage description)",
      "textOverlay": "النص المكتوب على الشاشة بلون أصفر/أبيض متحرك",
      "voiceover": "ما يقوله المعلق الصوتي"
    },
    {
      "time": "00:03 - 00:08",
      "visual": "وصف المشهد البصري",
      "textOverlay": "النص المكتوب على الشاشة",
      "voiceover": "ما يقوله المعلق الصوتي"
    },
    {
      "time": "00:08 - 00:20",
      "visual": "وصف المشهد البصري",
      "textOverlay": "النص المكتوب على الشاشة",
      "voiceover": "ما يقوله المعلق الصوتي"
    },
    {
      "time": "00:20 - 00:30",
      "visual": "وصف المشهد البصري",
      "textOverlay": "النص المكتوب على الشاشة",
      "voiceover": "ما يقوله المعلق الصوتي"
    }
  ],
  "fullVoiceover": "النص الصوتي الكامل المتصل للتعليق الصوتي (Voiceover)",
  "hashtags": "#جيميني_برو #ذكاء_اصطناعي #مساحة_تخزين #سوق_الاشتراكات #GoogleOne #Reels"
}`;

        const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://souq-al-ishtirakat-xi.vercel.app',
            'X-Title': 'Souq Al-Ishtirakat Reels AI Studio',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1500,
          }),
        });

        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          const rawContent = aiJson.choices?.[0]?.message?.content || '';
          const match = rawContent.match(/\{[\s\S]*\}/);
          if (match) {
            reelData = JSON.parse(match[0]);
          }
        }
      } catch (err) {
        console.error('OpenRouter Reels generation error:', err);
      }
    }

    // High quality fallback if AI is slow or token limit reached
    if (!reelData) {
      reelData = {
        title: 'عرض الصدمة: 5 تيرابايت مساحة + Gemini Pro لسنة ونص بـ 150 ج.م فقط! 🚀',
        hook: 'لو موبايلك بيقولك «مساحة التخزين ممتلئة»، الفيديو ده هينقذك حرفياً!',
        problem: 'جوجل قفلت عليك الإيميل، وجوجل فوتوز مش لاقية مكان لصورك، والاشتراك بالدولار بقى غالي ومستحيل؟',
        solution: 'سوق الاشتراكات وفرلك اشتراك Google Gemini Pro لمدة 18 شهر كاملة مع 5000 جيجابايت مساحة على Google One وإيميلك الشخصي، بـ 150 جنيه مصري فقط!',
        cta: 'الكمية محدودة جداً! اكتب كلمة «جيميني» في التعليقات أو اضغط على رابط الواتساب واستلم في أقل من 5 دقائق.',
        scenes: [
          {
            time: '00:00 - 00:03',
            visual: 'شخص ماسك موبايله وعلامة تعجب حمراء وتنبيه Storage Full يملأ الشاشة مع صوت تنبيه عالي',
            textOverlay: 'مساحة الموبايل خلصت ومفيش مكان لصورك؟ 🚨',
            voiceover: 'لو موبايلك دايماً باعتلك التنبيه ده، اسمع الكلمتين دول وافتكرني بدعوة!',
          },
          {
            time: '00:03 - 00:08',
            visual: 'لقطة سريعة لملفات وصور متكدسة وإيميل جوجل محظور من استقبال الرسايل',
            textOverlay: 'جوجل قفلت الجيميل والاشتراك بالدولار؟ 💸',
            voiceover: 'ليه تدفع آلاف الجنيهات في اشتراكات جوجل بالدولار عشان 100 جيجا بس؟',
          },
          {
            time: '00:08 - 00:20',
            visual: 'ظهور واجهة Gemini Pro الفخمة مع عداد 5000 GB Google One وأيقونة Veo وNotebookLM بتصميم نيون أنيق',
            textOverlay: '5,000 جيجا تخزين + ذكاء جوجل لسنة ونص بـ 150 ج.م فقط! ⚡',
            voiceover: 'جبنالك اشتراك جوجل جيميني برو الرسمي لمدة 18 شهر، مع 5 تيرابايت تخزين Google One على إيميلك الشخصي وبضمان ذهبي كامل بـ 150 جنيه بس!',
          },
          {
            time: '00:20 - 00:30',
            visual: 'شاشة متجر سوق الاشتراكات مع زر فودافون كاش وإنستاباي وشات واتساب بيتأكد فيه الطلب في ثوانٍ',
            textOverlay: 'الدفع فودافون كاش أو إنستاباي - راسلنا واتساب الآن 📲',
            voiceover: 'التسليم فوري والتفعيل على إيميلك الشخصي! ابعتلنا على الواتساب أو اطلب من الرابط في البايو قبل انتهاء العرض.',
          },
        ],
        fullVoiceover: 'لو موبايلك دايماً باعتلك تنبيه Storage Full، اسمع الكلمتين دول! ليه تدفع آلاف الجنيهات في اشتراكات التخزين بالدولار؟ في سوق الاشتراكات وفرنالك اشتراك Google Gemini Pro لمدة 18 شهر كاملة، مع 5 تيرابايت مساحة تخزين على Google One وإيميلك الشخصي، بـ 150 جنيه مصري فقط! تفعيل رسمي، خصوصية تامة، وضمان كامل طوال المدة. الدفع سهل بفودافون كاش وإنستاباي، راسلنا واتساب الآن واستلم حسابك فوراً!',
        hashtags: '#سوق_الاشتراكات #GeminiPro #جوجل_جيميني #ذكاء_اصطناعي #تخزين_سحابي #GoogleOne #ريلز_مصر #عروض_2026',
      };
    }

    return NextResponse.json({
      success: true,
      topic,
      reel: reelData,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
