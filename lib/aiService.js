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
