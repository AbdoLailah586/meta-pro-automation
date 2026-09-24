'use client';

import React, { useState } from 'react';
import {
  Video,
  Sparkles,
  Flame,
  Copy,
  Check,
  Send,
  Play,
  Film,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function ViralReelsStudio({ showToast, onSendToComposer }) {
  const [topic, setTopic] = useState('عرض Google Gemini Pro 18 شهر مع 5TB تخزين بـ 150 ج.م');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reel, setReel] = useState({
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
  });
  const [copiedVoiceover, setCopiedVoiceover] = useState(false);

  const handleGenerate = async (customTopic = topic) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/reels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: customTopic }),
      });
      const data = await res.json();
      if (data.success) {
        setReel(data.reel);
        showToast('تم توليد سكريبت الريلز الفيروسي بنجاح!');
      } else {
        showToast(data.error || 'تعذر توليد السكريبت', 'error');
      }
    } catch (e) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyVoiceover = () => {
    if (!reel) return;
    navigator.clipboard.writeText(reel.fullVoiceover);
    setCopiedVoiceover(true);
    showToast('تم نسخ النص الصوتي الكامل للريلز!');
    setTimeout(() => setCopiedVoiceover(false), 2500);
  };

  return (
    <div>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
          border: '1px solid rgba(236, 72, 153, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.2)', color: '#EC4899' }}>
              <Video size={22} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
              استوديو الريلز الفيروسي بالذكاء الاصطناعي (AI Viral Reels Studio)
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '800px', lineHeight: '1.6' }}>
            مستوحى من أقوى أدوات صناعة المحتوى العالمية (ShortGPT & MoneyPrinter). يقوم بتوليد سكريبتات فيديو ريلز قصيرة
            (30 ثانية) بهيكل نفسي محكم (خطاف في أول 3 ثوانٍ + إثارة المشكلة + العرض الخرافي + دعوة لاتخاذ إجراء).
          </p>
        </div>

        <div style={{ textAlign: 'left' }}>
          <button
            onClick={() => onSendToComposer(reel)}
            className="btn btn-ai"
            style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Send size={16} />
            <span>نقل إلى استوديو النشر فوراً</span>
          </button>
        </div>
      </div>

      {/* Generator Box */}
      <div className="glass-card" style={{ padding: '22px 26px', marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-secondary)' }}>
          موضوع أو منتج الفيديو (Topic / Offer):
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="input"
            style={{ fontSize: '0.95rem' }}
            placeholder="مثال: عرض Google Gemini Pro 18 شهر بـ 150 ج.م"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => handleGenerate()}
            className="btn btn-ai"
            style={{ padding: '10px 24px', whiteSpace: 'nowrap' }}
          >
            <Sparkles size={17} />
            <span>{isGenerating ? 'جاري التأليف والتوليد...' : 'توليد سكريبت ريلز فيروسي 🚀'}</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>قوالب جاهزة للعروض:</span>
          {[
            'عرض Google Gemini Pro 18 شهر مع 5TB تخزين بـ 150 ج.م',
            'باقة صانع المحتوى (Canva Pro + CapCut Pro)',
            'برنامج WhatsApp Bulk Sender بدون حظر + شات بوت',
            'باقة المبرمجين (Claude Pro 5X + Gemini Pro)',
          ].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTopic(t);
                handleGenerate(t);
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Reel Breakdown */}
      {reel && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Hook Banner */}
          <div
            className="glass-card"
            style={{
              padding: '20px 24px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#F59E0B' }}>
              <Flame size={20} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0 }}>
                الخطاف الفيروسي (Scroll-Stopping Hook - أول 3 ثوانٍ)
              </h3>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff', lineHeight: '1.5' }}>
              "{reel.hook}"
            </div>
          </div>

          {/* 4 Scenes Storyboard Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {reel.scenes?.map((scene, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  position: 'relative',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: '800',
                        color: idx === 0 ? '#F59E0B' : idx === 3 ? '#10B981' : '#38BDF8',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      المشهد {idx + 1}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {scene.time}
                    </span>
                  </div>

                  {/* Visual Cue */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '700' }}>
                      🎬 اللقطة البصرية (B-Roll):
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {scene.visual}
                    </div>
                  </div>

                  {/* Text Overlay */}
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#FFD700', marginBottom: '2px', fontWeight: '700' }}>
                      📝 النص المتحرك على الشاشة:
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#fff' }}>
                      {scene.textOverlay}
                    </div>
                  </div>
                </div>

                {/* Voiceover line */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    🗣️ التعليق الصوتي:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{scene.voiceover}"
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full Voiceover Script Box */}
          <div className="glass-card" style={{ padding: '22px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={20} color="#38BDF8" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>
                  النص الصوتي الكامل للريلز (Voiceover Script)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopyVoiceover}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedVoiceover ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                <span>{copiedVoiceover ? 'تم النسخ!' : 'نسخ النص للتعليق الصوتي'}</span>
              </button>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                fontSize: '0.94rem',
                lineHeight: '1.8',
                color: '#fff',
                marginBottom: '18px',
              }}
            >
              {reel.fullVoiceover}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.84rem', color: '#38BDF8' }}>
                {reel.hashtags}
              </div>

              <button
                type="button"
                onClick={() => onSendToComposer(reel)}
                className="btn btn-primary"
                style={{ padding: '10px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={16} />
                <span>إرسال الريلز لاستوديو النشر والجدولة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
