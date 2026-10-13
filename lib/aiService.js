/**
 * AI Marketing Content Generator (OpenRouter API + Built-in Fallback)
 */

export const FREE_AI_MODELS = [
  {
    id: 'meta-llama/llama-3-8b-instruct:free',
    name: 'Meta Llama 3 8B Instruct (مجاني)',
    badge: 'Free',
    provider: 'Meta',
    desc: 'سريع ودقيق ومثالي لمنشورات السوشيال ميديا وصياغة الإعلانات',
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Google Gemini 2.0 Flash (مجاني)',
    badge: 'Free',
    provider: 'Google',
    desc: 'فائق السرعة وممتاز في الإبداع التسويقي وتوليد الهاشتاجات',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 Reasoning (مجاني)',
    badge: 'Free',
    provider: 'DeepSeek',
    desc: 'تفكير استراتيجي عميق لصياغة حملات تسويقية معقدة',
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    name: 'Qwen 2.5 72B Instruct (مجاني)',
    badge: 'Free',
    provider: 'Alibaba',
    desc: 'نموذج ضخم وعالي الدقة في فهم النصوص العربية والخليجية',
  },
];

export async function generateMarketingPost({
  topic,
  tone = 'marketing',
  postType = 'offer',
  platforms = ['facebook', 'instagram'],
  targetAudience = 'العملاء المهتمين',
  apiKey = '',
  model = 'meta-llama/llama-3-8b-instruct:free',
}) {
  const toneNames = {
    marketing: 'تسويقي مقنع وحماسي (Persuasive & High Energy)',
    corporate: 'احترافي، موثوق، ورسمي للشركات (B2B & Professional)',
    casual: 'ودي، عفوي، وسهل الفهم للجميع (Friendly & Relatable)',
    storytelling: 'قصصي، ملهم، ويجذب القارئ حتى النهاية (Storytelling)',
    urgent: 'عاجل، يركز على الفرصة المحدودة وندرة العرض (FOMO & Urgent)',
  };

  const typeNames = {
    offer: 'عرض ترويجي وخصم مع دعوة لاتخاذ إجراء واضحة (Call-To-Action)',
    hook: 'صائد انتباه فيروسي (Viral Scroll-Stopping Hook)',
    value: 'محتوى تعليمي وقيمة مضافة مع نصائح عملية',
    question: 'سؤال تفاعلي ومناقشة لتحفيز التعليقات ومعدل الوصول',
    product: 'إعلان عن منتج أو خدمة جديدة مع استعراض أهم المزايا',
  };

  const systemPrompt = `أنت خبير تسويق رقمي متخصص في كتابة المحتوى الإعلاني وإدارة حسابات فيسبوك وإنستغرام للشركات الناجحة.
مهمتك كتابة منشور تسويقي عالي التحويل (High-Converting Copy) باللغة العربية.

إرشادات الصياغة:
1. ابدأ المنشور بجملة افتتاحية قوية وجذابة (Hook) تجعل القارئ يتوقف عن التمرير.
2. استخدم تنسيقاً مريحاً للعين، فقرات قصيرة، وإيموجي جذابة في أماكنها المناسبة.
3. ركز على الفوائد الملموسة للعميل وليس مجرد الميزات الجافة.
4. أضف دعوة واضحة لاتخاذ إجراء (Call To Action - CTA) في نهاية المنشور (مثل: راسلنا، علّق بكلمة مهتم، الرابط في البايو).
5. في نهاية المنشور، ضع مجموعة هاشتاجات قوية ومستهدفة (5 إلى 10 هاشتاجات).
6. النبرة المطلوبة: ${toneNames[tone] || tone}.
7. نوع المنشور: ${typeNames[postType] || postType}.
8. المنصات المستهدفة: ${platforms.join(' و ')}.
9. الجمهور المستهدف: ${targetAudience}.

أخرج نص المنشور النهائي مباشرة بدون مقدمات تمهيدية أو جمل مساعدة.`;

  // 1. If user provided an OpenRouter key, call OpenRouter API
  if (apiKey && apiKey.trim().length > 5) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://metapro.local',
          'X-Title': 'Meta Pro Marketing Suite',
        },
        body: JSON.stringify({
          model: model || 'meta-llama/llama-3-8b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `الموضوع أو الفكرة المراد كتابة المنشور عنها: ${topic}` },
          ],
          temperature: 0.75,
          max_tokens: 1200,
        }),
      });

      const data = await res.json();
      if (data.choices && data.choices[0]?.message?.content) {
        return {
          content: data.choices[0].message.content.trim(),
          modelUsed: model,
          source: 'openrouter',
        };
      } else if (data.error) {
        console.warn('OpenRouter API returned error, falling back to local engine:', data.error);
      }
    } catch (err) {
      console.warn('OpenRouter network error, using fallback engine:', err.message);
    }
  }

  // 2. Intelligent Built-in Fallback Generator
  return {
    content: generateFallbackCopy(topic, tone, postType, platforms),
    modelUsed: 'MetaPro Smart Engine (Built-in)',
    source: 'builtin',
  };
}

function generateFallbackCopy(topic, tone, postType, platforms) {
  const cleanTopic = topic || 'خدماتنا ومنتجاتنا المميزة';

  if (postType === 'offer') {
    return `🔥 فرصة حصرية لا تتكرر! هل تبحث عن أفضل حل لـ ${cleanTopic}؟

لقد قمنا بتطوير باقة متكاملة تضمن لك أعلى جودة وأفضل عائد على استثمارك مع توفير أكثر من 30% من التكاليف المعتادة! 💼✨

ما الذي ستحصل عليه معنا؟
✅ تنفيذ احترافي وفق أعلى معايير السوق.
✅ متابعة ودعم مستمر من فريقنا المتخصص.
✅ نتائج ملموسة يمكنك قياسها منذ الأسبوع الأول.

⏳ العرض ساري لفترة محدودة جداً لأول 10 عملاء فقط!
👇 تواصل معنا الآن عبر الرسائل الخاصة أو من خلال الرابط في البايو لتفاصيل العرض!

#عروض #تسويق #خصومات #${cleanTopic.replace(/\s+/g, '_')} #ريادة_أعمال #شركتك #نجاح`;
  }

  if (postType === 'hook') {
    return `🚨 90% من الشركات تقع في هذا الخطأ عند التعامل مع ${cleanTopic}!

السر لا يكمن في إنفاق ميزانيات ضخمة، بل في الاستراتيجية الذكية التي تحوّل كل تفاعل إلى عميل حقيقي مهتم! 📈💡

إليك 3 خطوات نطبقها دائماً مع عملائنا:
1️⃣ تحديد الفئة المستهدفة بدقة متناهية.
2️⃣ صياغة رسالة تخاطب حاجة العميل الفعلية وتزيل أي تردد.
3️⃣ أتمتة عمليات المتابعة والرد الفوري.

💬 هل تواجه هذا التحدي في شركتك؟ اكتب لنا في التعليقات وسنشاركك الحل المناسب!

#أسرار_التسويق #تطوير_الأعمال #استراتيجيات_ناجحة #بزنس #${cleanTopic.replace(/\s+/g, '_')}`;
  }

  // Default Value / General
  return `✨ خطوة للأمام نحو تحقيق أهدافك في ${cleanTopic}!

النجاح في عالم الأعمال اليوم يتطلب سرعة في التكيف، وأدوات رقمية ذكية توفر وقتك وتضاعف إنتاجية فريقك. 🎯

نحن هنا لنكون شريكك الموثوق في كل خطوة:
🔹 حلول مخصصة تناسب حجم ونشاط عملك.
🔹 تجربة سلسة تضمن راحة عملائك وثقتهم.
🔹 ابتكار مستمر يحافظ على تقدمك أمام المنافسين.

📩 لا تتردد في حجز جلستك الاستشارية معنا اليوم وابدأ رحلة التميز!

#ريادة_أعمال #حلول_ذكية #تطوير_مستمر #ابتكار #${cleanTopic.replace(/\s+/g, '_')} #فيسبوك #انستغرام`;
}

/**
 * Generate a smart, persuasive Arabic sales reply for an ad inquiry
 */
export async function generateSmartCustomerReply({
  customerName = 'العميل',
  lastMessage = '',
  channel = 'whatsapp',
  adSource = '',
  apiKey = '',
  model = 'meta-llama/llama-3-8b-instruct:free',
}) {
  const cleanMsg = lastMessage.trim().toLowerCase();

  // If OpenRouter API key provided, attempt LLM generation
  if (apiKey && apiKey.startsWith('sk-')) {
    try {
      const systemPrompt = `أنت مساعد مبيعات وتواصل احترافي لمنصة "سوق الاشتراكات" (Souq Al-Ishtirakat).
هدفك كتابة رد احترافي، مهذب، جذاب ومقنع باللغة العربية (اللهجة المصرية المهذبة والمألوفة في التجارة الإلكترونية) للرد على استفسار العميل القادم من إعلاناتنا الممولة على ${channel}.
احرص على الإيجاز والوضوح، الإجابة على السؤال مباشرة، وتقديم خطوة الدفع أو التفعيل (CTA) بأسلوب ودود.`;

      const userPrompt = `اسم العميل: ${customerName}
مصدر الإعلان: ${adSource || 'إعلانات السوشيال ميديا'}
آخر رسالة من العميل: "${lastMessage}"

اكتب رداً مباشراً يمكن إرساله له الآن فوراً.`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://meta-auto-pro.vercel.app',
          'X-Title': 'Meta Pro Automation Omnichannel',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) return reply;
      }
    } catch (e) {
      console.warn('[AI Service] LLM generation error, falling back to smart rule engine:', e.message);
    }
  }

  // Intelligent Context-Aware Presets (Fallback Engine)
  if (cleanMsg.includes('سعر') || cleanMsg.includes('بكام') || cleanMsg.includes('كام') || cleanMsg.includes('تكلفة')) {
    return `أهلاً بحضرتك يا ${customerName}! 🌸
عرض باقة Google AI Pro سنة ونصف (18 شهر) متاح حالياً بسعر ترويجي 90 جنيه فقط بدلاً من 450 ج! 🔥
الاشتراك شامل Gemini 3.1 Pro، مساحة 5 تيرابايت، صلاحيات Google Antigravity & Jules للمبرمجين مع ضمان كامل طوال الفترة.
لو حابب تبدأ التفعيل ابعتلي "تم" وهبعتلك بيانات الدفع فوراً ⚡`;
  }

  if (cleanMsg.includes('كاش') || cleanMsg.includes('دفع') || cleanMsg.includes('فودافون') || cleanMsg.includes('انستاباي') || cleanMsg.includes('تحويل')) {
    return `أهلاً بحضرتك! طرق الدفع المتاحة بكل سهولة: 💳
📱 فودافون كاش: 010xxxxxxxx (يرجى التأكيد قبل التحويل)
💸 انستاباي: souq@instapay
القيمة للعرض الحالي: 90 جنيه فقط.
بعد التحويل برجاء إرسال سكرين شوت برقم العملية مع الإيميل المراد التفعيل عليه، وهيتم التفعيل في خلال دقائق بإذن الله! ✨`;
  }

  if (cleanMsg.includes('ضمان') || cleanMsg.includes('شغال') || cleanMsg.includes('مضمون') || cleanMsg.includes('أصلي')) {
    return `أهلاً بك يا فندم! 🛡️
الاشتراك رسمي 100% ويتم تفعيله على حسابك الشخصي في جوجل مباشرة (مش حساب مشترك أو إيميل جاهز).
معاك ضمان كامل طوال فترة الاشتراك، وفي حال وجود أي استفسار فريق الدعم الفني معاك خطوة بخطوة.`;
  }

  if (cleanMsg.includes('كانفا') || cleanMsg.includes('canva') || cleanMsg.includes('تصميم')) {
    return `أهلاً بحضرتك! اشتراك Canva Pro متاح بأعلى صلاحيات (Team Pro) مع جميع الخطوط والقوالب المدفوعة وإمكانية إزالة الخلفيات بنقرة واحدة بالذكاء الاصطناعي 🎨
التفعيل على إيميلك الشخصي مباشرة وضمان رسمي. حابب أبعتلك تفاصيل الاشتراك والأسعار؟`;
  }

  // Generic welcoming & persuasive closing
  return `أهلاً بحضرتك يا ${customerName}! 🌸 سعيد جداً بتواصلك معنا.
بخصوص استفسارك، العرض متاح وجاهز للتفعيل الفوري بأفضل سعر وضمان كامل.
حضرتك حابب تبدأ التفعيل ولا عندك أي استفسار إضافي تحب أوضحهولك؟ في خدمتك دائماً! 😊`;
}

