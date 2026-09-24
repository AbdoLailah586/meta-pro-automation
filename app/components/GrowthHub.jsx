'use client';

import React, { useState } from 'react';
import {
  Rocket,
  Copy,
  Check,
  Send,
  MessageSquare,
  Facebook,
  ExternalLink,
  ShieldCheck,
  Zap,
  Users,
  Sparkles,
  Flame,
} from 'lucide-react';

export default function GrowthHub({ showToast, onSendToComposer, onPublishLiveNow }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('تم نسخ المحتوى بنجاح إلى الحافظة!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const geminiBroadcastText = `🚨 عرض الصدمة من سوق الاشتراكات | Souq Al-Ishtirakat 🚀
اشتراك Google Gemini Pro لمدة 18 شهر كاملة (سنة ونصف) مع 5000 جيجابايت مساحة تخزين على Google One بـ 150 جنيه مصري فقط! ⚡

هل موبايلك دايماً باعتلك تنبيه «مساحة التخزين ممتلئة»؟ وجيميل وجوجل فوتوز مش لاقيين مكان لصورك وفايلاتك؟ 📱
انسى المشكلة دي تماماً ووفر آلاف الجنيهات مع أقوى باقة إنتاجية وذكاء اصطناعي في مصر:

🔥 ماذا ستحصل في هذا العرض الاستثنائي؟
━━━━━━━━━━━━━━━━━━━━
1️⃣ مساحة تخزين سحابية عملاقة 5 تيرابايت (5,000GB) على Google One لصورك وملفاتك وجوجل درايف وجيميل.
2️⃣ نموذج Gemini Advanced فائق الذكاء (تحليل ملفات وبيانات، كتابة أكواد برمجية، وتوليد نصوص تسويقية).
3️⃣ أداة الأبحاث وتلخيص ملفات الـ PDF الكبيرة والمناقشة الذكية NotebookLM.
4️⃣ أداة توليد الفيديو بالذكاء الاصطناعي Veo وتحويل النصوص لمقاطع واقعية.
5️⃣ تعديل وتحسين جودة الصور واستوديو Google Flow بضغطة زر.
6️⃣ تكامل مدمج داخل تطبيقاتك اليومية: Gmail و Drive و Docs و Sheets و Meet.

🛡️ مزايا الأمان والضمان:
✅ تفعيل فوري رسمي على إيميلك الشخصي (بياناتك وخصوصيتك في أمان 100%).
✅ ضمان ذهبي وشامل طوال مدة الاشتراك (18 شهر كاملة).
✅ طرق دفع سهلة وفورية: فودافون كاش ومحافظ المحمول • إنستاباي (InstaPay).

💰 السعر: 150 ج.م فقط بدلاً من 1,800 ج.م لفترة محدودة جداً!

📲 للطلب والاستلام الفوري خلال دقائق:
تواصل معنا عبر رسائل الصفحة أو الواتساب المباشر:
📞 واتساب: 01554826209
🌐 رابط المتجر الرسمي: https://souq-al-ishtirakat-xi.vercel.app/

#سوق_الاشتراكات #جيميني_برو #GoogleGemini #GoogleOne #ذكاء_اصطناعي #تخزين_سحابي #مصر #عروض_2026 #Instapay`;

  const groupTemplates = [
    {
      id: 'grp_students',
      target: 'جروبات طلبة الجامعات، الباحثين، وأصحاب الدراسات العليا',
      title: 'بوست موجه للطلبة والباحثين (مساحة + تلخيص أبحاث)',
      content: `لكل الناس اللي بتعمل ماجستير أو دكتوراه أو محتاسة في أبحاث التخرج 🎓
لو ملفاتك وPDFs مالية الموبايل واللاب ومفيش مساحة في جوجل، في ميزة خرافية اسمها NotebookLM من جوجل بترفع عليها أي مرجع أو كتاب وتلخصه وتناقشه بالعربي في ثواني!

والأحلى إننا وفرنالك اشتراك Google Gemini Pro كامل لمدة 18 شهر مع 5 تيرابايت مساحة سحابية على إيميلك الشخصي بـ 150 جنيه بس بدل ما تدفع بالدولار.
التفعيل على إيميلك ومعاك ضمان كامل طوال المدة.

📲 للطلب والتفاصيل تواصل معنا واتساب: 01554826209
أو من المتجر: https://souq-al-ishtirakat-xi.vercel.app/`,
    },
    {
      id: 'grp_coders',
      target: 'جروبات المبرمجين والفريلانسرز ومجتمعات Tech',
      title: 'بوست موجه للمبرمجين وصناع المحتوى (كودينج + مساحة ضخمة)',
      content: `يا شباب المبرمجين وصناع المحتوى 💻🚀
لو بتستخدم نماذج الذكاء الاصطناعي لكتابة الأكواد ومراجعتها وبتعاني من الليميت الصغير ومشاكل التخزين لمشاريعك:
Google Gemini Pro مع نافذة سياق ضخمة جداً لتحليل مستودعات الكود + 5000GB مساحة سحابية كاملة Google One لمدة سنة ونصف (18 شهر) متاح الآن بـ 150 ج.م فقط!

تفعيل شخصي على حسابك بضمان رسمي ودفع إنستاباي أو فودافون كاش.
رابط المتجر: https://souq-al-ishtirakat-xi.vercel.app/
أو واتساب مباشر: 01554826209`,
    },
    {
      id: 'grp_deals',
      target: 'جروبات العروض والخصومات ومجتمعات البيع والشراء',
      title: 'بوست عروض وتخفيضات قوي ومباشر (FOMO & Deal)',
      content: `🔥 عرض التوفير الحقيقي لكل بيت وموبايل في مصر:
5000 جيجابايت مساحة تخزين Google One + ذكاء جوجل Gemini Pro لمدة 18 شهر كاملة بـ 150 جنيه فقط! 📱✨

انسى رسالة "مساحة التخزين ممتلئة" على صورك وجيميل نهائياً، تفعيل رسمي على إيميلك الشخصي وضمان استبدال ذهبي.
احجز مكانك قبل انتهاء الكمية المتاحة:
📲 واتساب: 01554826209
🌐 المتجر: https://souq-al-ishtirakat-xi.vercel.app/`,
    },
  ];

  return (
    <div>
      {/* Banner */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(8, 102, 255, 0.12) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981' }}>
              <Rocket size={22} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
              مركز الانتشار المجاني وعروض الواتساب (Organic Growth Hub)
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '800px', lineHeight: '1.6' }}>
            استراتيجيات النشر العضوي المجاني للوصول إلى آلاف العملاء دون إنفاق مليم على الإعلانات الممولة.
            قوالب مهيأة لجروبات فيسبوك، نصوص برودكاست الواتساب، وروابط المحادثة الفورية مع العملاء.
          </p>
        </div>

        <div style={{ textAlign: 'left' }}>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(37, 211, 102, 0.15)',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              color: '#25D366',
              fontSize: '0.82rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <MessageSquare size={16} />
            <span>حملات واتساب المباشرة نشطة</span>
          </span>
        </div>
      </div>

      {/* FEATURED CAMPAIGN: GEMINI PRO 18M */}
      <div
        className="glass-card"
        style={{
          padding: '28px',
          marginBottom: '32px',
          border: '1px solid rgba(0, 229, 153, 0.4)',
          background: 'linear-gradient(135deg, rgba(0, 229, 153, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)',
          boxShadow: '0 12px 36px rgba(0, 229, 153, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-published" style={{ background: 'rgba(0, 229, 153, 0.2)', color: '#00E599', borderColor: '#00E599' }}>
                ● الحملة الرسمية النشطة الآن
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>معرف الحملة: <code>camp_gemini_pro_18m</code></span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0 }}>
              عرض Google Gemini Pro (18 شهر) + 5TB مساحة تخزين Google One بـ 150 ج.م فقط! 🚀
            </h3>
          </div>

          <div
            style={{
              padding: '8px 18px',
              borderRadius: '12px',
              background: 'rgba(0, 229, 153, 0.15)',
              border: '1px solid rgba(0, 229, 153, 0.4)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#00E599', fontWeight: '700' }}>السعر الحصري</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>150 ج.م</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>لمدة سنة ونصف كاملة</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'center', marginBottom: '22px' }}>
          {/* Ad Image Preview */}
          <div style={{ textAlign: 'center' }}>
            <img
              src="/gemini_pro.png"
              alt="Gemini Pro Ad"
              style={{
                width: '100%',
                maxHeight: '260px',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
            />
          </div>

          {/* Campaign Details & Features */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: '#00E599', fontSize: '0.85rem' }}>⚡ التخزين السحابي:</strong>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>5000 جيجا Google One للصور والجيميل</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: '#38BDF8', fontSize: '0.85rem' }}>🧠 الذكاء الاصطناعي:</strong>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Gemini Advanced + NotebookLM + Veo</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: '#F59E0B', fontSize: '0.85rem' }}>🔒 الأمان والخصوصية:</strong>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>تفعيل رسمي 100% على إيميلك الشخصي</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: '#A855F7', fontSize: '0.85rem' }}>🛡️ الضمان والدفع:</strong>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>ضمان ذهبي كامل + فودافون كاش وإنستاباي</div>
              </div>
            </div>

            {/* Quick Actions for this campaign */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleCopy(geminiBroadcastText, 'gemini_main')}
                className="btn btn-ai"
                style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {copiedId === 'gemini_main' ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedId === 'gemini_main' ? 'تم نسخ البرودكاست!' : 'نسخ نص الواتساب برودكاست'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSendToComposer(geminiBroadcastText, '/gemini_pro.png')}
                className="btn btn-primary"
                style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={16} />
                <span>فتح في استوديو النشر والجدولة</span>
              </button>

              <a
                href="https://wa.me/201554826209?text=أريد_طلب_عرض_Gemini_Pro_18_شهر_بـ_150_جنيه"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#25D366',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '700',
                  fontSize: '0.86rem',
                }}
              >
                <MessageSquare size={16} />
                <span>تجربة رابط الطلب واتساب</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FACEBOOK GROUPS SPINTAX TEMPLATES */}
      <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Users size={20} color="#0866FF" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
            قوالب النشر في جروبات فيسبوك والمجتمعات (Facebook Groups Viral Copy)
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '20px' }}>
          منشورات مصممة بأسلوب السرد الطبيعي (Soft-selling) لتجنب حظر الجروبات، وموجهة بدقة لكل فئة:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {groupTemplates.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(8, 102, 255, 0.1)',
                    color: '#38BDF8',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                  }}
                >
                  🎯 {item.target}
                </span>
                <h4 style={{ fontSize: '0.98rem', fontWeight: '700', marginBottom: '12px' }}>{item.title}</h4>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '170px',
                    overflowY: 'auto',
                    marginBottom: '16px',
                  }}
                >
                  {item.content}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => handleCopy(item.content, item.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {copiedId === item.id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  <span>{copiedId === item.id ? 'تم النسخ!' : 'نسخ للجروبات'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSendToComposer(item.content, '/gemini_pro.png')}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '6px 14px' }}
                >
                  <span>نشر في المحرر</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
