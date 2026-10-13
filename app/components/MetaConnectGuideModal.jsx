'use client';

import React, { useState } from 'react';
import { 
  X, 
  Instagram, 
  Facebook, 
  Smartphone, 
  Key, 
  Webhook, 
  Database, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertTriangle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

export default function MetaConnectGuideModal({ isOpen, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const webhookUrl = 'https://meta-auto-pro.vercel.app/api/webhooks/meta';
  const verifyToken = 'meta_pro_secret_token_2026';
  const neonDatabaseUrl = 'postgresql://neondb_owner:npg_9MyClUOc3sKe@ep-sweet-glitter-b1ma20y9-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 7, 15, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, rgba(16, 20, 36, 0.98), rgba(20, 26, 48, 0.98))',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(24, 119, 242, 0.15)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: 'rgba(16, 20, 36, 0.95)',
            backdropFilter: 'blur(12px)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0084FF, #E1306C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(225, 48, 108, 0.25)',
              }}
            >
              <HelpCircle size={26} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                دليل تفعيل رسائل إنستغرام وفيسبوك وقاعدة البيانات
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
                حل مشكلة عدم ظهور رسائل إنستغرام ورسائل الواتساب على Vercel بالتفصيل
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#94A3B8',
              transition: 'all 0.2s',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SECTION 1: WHATSAPP SOLUTION (THE VERCEL DB FIX) */}
          <div
            style={{
              background: 'rgba(37, 211, 102, 0.06)',
              border: '1px solid rgba(37, 211, 102, 0.25)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span
                style={{
                  background: '#25D366',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                1. حل مشكلة رسائل الواتساب
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                لماذا ظهرت الرسالة في موقع الواتساب ولم تظهر في meta-auto-pro.vercel.app؟
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.6', margin: '0 0 12px 0' }}>
              <strong>السبب:</strong> سيرفر الواتساب على Railway يكتب الرسائل فوراً في قاعدة بيانات Neon النشطة، بينما موقع Vercel مربوط بمتغير قديم في لوحة تحكمه. محلياً ظهرت رسالتك التجريبية (&quot;السلام عليكم&quot; من عبده) فور تحديث الرابط.
            </p>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '8px' }}>
              <strong>الحل بنقرة واحدة:</strong> افتح إعدادات <strong>Vercel &rarr; Settings &rarr; Environment Variables</strong> وعدّل قيمة <code style={{ color: '#25D366' }}>DATABASE_URL</code> إلى:
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <input
                readOnly
                value={neonDatabaseUrl}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#38BDF8',
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                  direction: 'ltr',
                }}
              />
              <button
                onClick={() => copyToClipboard(neonDatabaseUrl, 'neon_db')}
                style={{
                  background: copiedKey === 'neon_db' ? '#10B981' : '#25D366',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {copiedKey === 'neon_db' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey === 'neon_db' ? 'تم النسخ!' : 'نسخ الرابط'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: INSTAGRAM MOBILE APP TOGGLE */}
          <div
            style={{
              background: 'rgba(225, 48, 108, 0.06)',
              border: '1px solid rgba(225, 48, 108, 0.25)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span
                style={{
                  background: '#E1306C',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                2. إعداد إنستغرام الإلزامي
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={18} color="#E1306C" />
                تفعيل إذن قراءة الرسائل في تطبيق Instagram على الهاتف
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.6', margin: '0 0 14px 0' }}>
              إنستغرام <strong>يحجب افتراضياً</strong> وصول أي تطبيق أو API إلى رسائل الـ Direct Messages لأسباب الخصوصية حتى تقوم بتفعيله يدوياً من هاتفك:
            </p>
            <ol style={{ margin: 0, paddingRight: '22px', color: '#E2E8F0', fontSize: '0.88rem', lineHeight: '1.8' }}>
              <li>افتح تطبيق <strong>Instagram</strong> على هاتفك بنفس الحساب التجاري المربوط بالصفحة.</li>
              <li>انتقل إلى <strong>الملف الشخصي (Profile)</strong> ثم اضغط على القائمة العلوية <strong>(☰)</strong>.</li>
              <li>اختر <strong>الإعدادات والخصوصية (Settings and privacy)</strong>.</li>
              <li>انزل إلى <strong>الرسائل والردود على القصص (Messages and story replies)</strong> &rarr; ثم <strong>أدوات التحكم بالرسائل (Message controls)</strong>.</li>
              <li>انزل للأسفل واضغط على <strong>الأدوات المتصلة (Connected tools)</strong>.</li>
              <li>قم بتفعيل خيار: <strong style={{ color: '#F43F5E' }}>السماح بالوصول إلى الرسائل (Allow access to messages)</strong>.</li>
            </ol>
          </div>

          {/* SECTION 3: META GRAPH API PERMISSIONS */}
          <div
            style={{
              background: 'rgba(24, 119, 242, 0.06)',
              border: '1px solid rgba(24, 119, 242, 0.25)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span
                style={{
                  background: '#1877F2',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                3. أذونات توكن Meta Graph
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="#1877F2" />
                الصلاحيات المطلوبة في Meta Developers / Graph API Explorer
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.6', margin: '0 0 12px 0' }}>
              التوكن الحالي يملك صلاحيات النشر فقط. عند فحص استدعاء الرسائل قبل قليل أرجع Meta الخطأ:
              <br />
              <code style={{ color: '#EF4444', fontSize: '0.8rem', background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                (#200) Requires permission: pages_messaging or (#3) Application does not have capability
              </code>
            </p>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '10px' }}>
              يجب توليد أو تجديد التوكن مع تحديد التصريحين التاليين:
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(24, 119, 242, 0.2)', border: '1px solid #1877F2', color: '#60A5FA', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, direction: 'ltr' }}>
                instagram_manage_messages
              </span>
              <span style={{ background: 'rgba(24, 119, 242, 0.2)', border: '1px solid #1877F2', color: '#60A5FA', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, direction: 'ltr' }}>
                pages_messaging
              </span>
            </div>
          </div>

          {/* SECTION 4: META WEBHOOK SETUP */}
          <div
            style={{
              background: 'rgba(168, 85, 247, 0.06)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span
                style={{
                  background: '#A855F7',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                4. إعداد الويب هوك (Meta Webhook)
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Webhook size={18} color="#A855F7" />
                استقبال رسائل إنستغرام وفيسبوك اللحظية على المنصة
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.6', margin: '0 0 14px 0' }}>
              في لوحة تحكم تطبيقك في <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" style={{ color: '#C084FC', textDecoration: 'underline' }}>Meta App Dashboard</a> &rarr; ادخل إلى قسم <strong>Webhooks</strong> &rarr; اختر كائن <strong>Instagram</strong> وكائن <strong>Page</strong> واشترك في حدث <strong>messages</strong>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>
                  رابط الـ Callback URL (منصة Vercel):
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    readOnly
                    value={webhookUrl}
                    style={{
                      flex: 1,
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#C084FC',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      fontFamily: 'monospace',
                      direction: 'ltr',
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(webhookUrl, 'wh_url')}
                    style={{
                      background: copiedKey === 'wh_url' ? '#10B981' : 'rgba(168, 85, 247, 0.25)',
                      color: copiedKey === 'wh_url' ? '#000' : '#E9D5FF',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      borderRadius: '8px',
                      padding: '0 14px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {copiedKey === 'wh_url' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'wh_url' ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>
                  رمز التحقق (Verify Token):
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    readOnly
                    value={verifyToken}
                    style={{
                      flex: 1,
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#F472B6',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      fontFamily: 'monospace',
                      direction: 'ltr',
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(verifyToken, 'verify_token')}
                    style={{
                      background: copiedKey === 'verify_token' ? '#10B981' : 'rgba(236, 72, 153, 0.25)',
                      color: copiedKey === 'verify_token' ? '#000' : '#FCE7F3',
                      border: '1px solid rgba(236, 72, 153, 0.4)',
                      borderRadius: '8px',
                      padding: '0 14px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {copiedKey === 'verify_token' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'verify_token' ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div
          style={{
            padding: '18px 28px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(16, 20, 36, 0.95)',
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #1877F2, #0084FF)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 24px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            فهمت المطلوب، سأقوم بالتطبيق الآن
          </button>
        </div>
      </div>
    </div>
  );
}
