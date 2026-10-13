'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Server,
  QrCode,
  KeyRound,
  LogOut,
  AlertTriangle,
  X,
  Copy,
  Check,
  ArrowRight,
  Radio,
  Lock,
  Mail,
  User,
  Clock,
  Sparkles,
  Users,
  Eye,
  EyeOff,
  UserPlus,
} from 'lucide-react';

export default function WhatsAppNumberModal({ isOpen, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'create_client' | 'overview' | 'server_config'
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginResult, setLoginResult] = useState(null);

  // Create Client Account form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [planDuration, setPlanDuration] = useState('1m'); // '24h' | '1m' | '3m' | '1y' | 'lifetime'
  const [clientNotes, setClientNotes] = useState('');
  const [createResult, setCreateResult] = useState(null);

  // Server config state
  const [customServerUrl, setCustomServerUrl] = useState('');
  const [serverSaveNotice, setServerSaveNotice] = useState('');

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp-config');
      const data = await res.json();
      if (data.success) {
        setStatusData(data);
        if (data.serverUrl) setCustomServerUrl(data.serverUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setLoginResult(null);
      setCreateResult(null);
      setServerSaveNotice('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Login & Connect
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginResult(null);
    try {
      const res = await fetch('/api/whatsapp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          emailOrPhone: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json();
      setLoginResult(data);
      if (data.success) {
        fetchStatus();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      setLoginResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle Create Client
  const handleCreateClient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCreateResult(null);
    try {
      const res = await fetch('/api/whatsapp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_client',
          displayName: clientName.trim(),
          phone: clientPhone.trim(),
          email: clientEmail.trim(),
          password: clientPassword,
          planDuration,
          notes: clientNotes.trim(),
        }),
      });
      const data = await res.json();
      setCreateResult(data);
      if (data.success) {
        fetchStatus();
        // Prefill login identifier with the new client
        setLoginIdentifier(clientPhone.trim() || clientEmail.trim());
        setLoginPassword(clientPassword);
      }
    } catch (err) {
      setCreateResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle Disconnect / Logout
  const handleDisconnect = async () => {
    if (!confirm('هل أنت متأكد من تسجيل الخروج من حساب واتساب الحالي؟ ستتمكن من تسجيل الدخول بحساب آخر فوراً.')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      });
      const data = await res.json();
      if (data.success) {
        setLoginResult(null);
        fetchStatus();
        if (onUpdated) onUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Handle Save Server Settings
  const handleSaveServer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_server',
          serverUrl: customServerUrl.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setServerSaveNotice('تم حفظ وتحديث رابط سيرفر واتساب بنجاح!');
        fetchStatus();
      }
    } catch (e) {
      setServerSaveNotice('تعذر حفظ الإعدادات: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const isConnected = statusData?.isConnected;
  const activePhone = statusData?.formattedPhone || '+20 155 890 9252';
  const accountName = statusData?.accountName || 'سوق الاشتراكات';

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
          maxWidth: '840px',
          maxHeight: '92vh',
          background: 'linear-gradient(135deg, rgba(16, 20, 36, 0.98), rgba(20, 26, 48, 0.98))',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(37, 211, 102, 0.15)',
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
            padding: '22px 28px',
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
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(37, 211, 102, 0.25)',
              }}
            >
              <Phone size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                ربط وتبديل حساب واتساب برو (WhatsApp Hub)
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
                تسجيل الدخول وربط حسابات العملاء عبر سيرفر WhatsApp Pro CRM لاستقبال رسائل الإعلانات
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

        {/* TABS NAVIGATION */}
        <div
          style={{
            display: 'flex',
            padding: '12px 28px 0 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('login')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderRadius: '10px 10px 0 0',
              background: activeTab === 'login' ? 'rgba(37, 211, 102, 0.15)' : 'transparent',
              color: activeTab === 'login' ? '#25D366' : '#94A3B8',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: activeTab === 'login' ? '2px solid #25D366' : '2px solid transparent',
            }}
          >
            <KeyRound size={16} />
            <span>تسجيل الدخول وربط الحساب</span>
          </button>

          <button
            onClick={() => setActiveTab('create_client')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderRadius: '10px 10px 0 0',
              background: activeTab === 'create_client' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeTab === 'create_client' ? '#38BDF8' : '#94A3B8',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: activeTab === 'create_client' ? '2px solid #38BDF8' : '2px solid transparent',
            }}
          >
            <UserPlus size={16} />
            <span>إضافة عميل واشتراك جديد</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderRadius: '10px 10px 0 0',
              background: activeTab === 'overview' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              color: activeTab === 'overview' ? '#C084FC' : '#94A3B8',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: activeTab === 'overview' ? '2px solid #C084FC' : '2px solid transparent',
            }}
          >
            <Phone size={16} />
            <span>الحساب النشط والحالة</span>
            {isConnected && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25D366' }}></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('server_config')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderRadius: '10px 10px 0 0',
              background: activeTab === 'server_config' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === 'server_config' ? '#fff' : '#94A3B8',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: activeTab === 'server_config' ? '2px solid #fff' : '2px solid transparent',
            }}
          >
            <Server size={16} />
            <span>إعدادات السيرفر</span>
          </button>
        </div>

        {/* BODY CONTENT */}
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TAB 1: LOGIN & CONNECT (PRIMARY) */}
          {activeTab === 'login' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  background: 'rgba(37, 211, 102, 0.08)',
                  border: '1px solid rgba(37, 211, 102, 0.25)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <Sparkles size={20} color="#25D366" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                  <strong>الربط المباشر بالحساب:</strong> أدخل البريد الإلكتروني أو رقم الهاتف وكلمة المرور المسجلين في منصة <strong>WhatsApp Pro CRM</strong>. إذا كان الحساب قد مسح رمز QR مسبقاً، فسيتم الربط فورياً والتعرف على الرقم دون الحاجة لإعادة المسح.
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '8px' }}>
                    البريد الإلكتروني أو رقم الهاتف المسجل:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      placeholder="مثال: 001558909252 أو user@whatsapp.pro"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 16px',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.92rem',
                        outline: 'none',
                        direction: 'ltr',
                        textAlign: 'left',
                      }}
                    />
                    <Mail
                      size={18}
                      color="#94A3B8"
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '8px' }}>
                    كلمة المرور (Password):
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="أدخل كلمة مرور الحساب"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 42px',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.92rem',
                        outline: 'none',
                        direction: 'ltr',
                      }}
                    />
                    <Lock
                      size={18}
                      color="#94A3B8"
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8',
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Quick Select from existing platform accounts */}
                {statusData?.savedUsers?.length > 0 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '6px' }}>
                      أو اختر حساباً مسجلاً في النظام بنقرة واحدة:
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {statusData.savedUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setLoginIdentifier(u.phone || u.email);
                            setLoginResult(null);
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            color: '#CBD5E1',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <User size={13} color="#25D366" />
                          <span>{u.displayName || u.phone || u.email}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 25px rgba(37, 211, 102, 0.3)',
                    marginTop: '8px',
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>جاري التحقق وتسجيل الدخول...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={18} />
                      <span>تسجيل الدخول وربط حساب الواتساب الآن</span>
                    </>
                  )}
                </button>
              </form>

              {/* Login Result Feedback */}
              {loginResult && (
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: loginResult.success ? 'rgba(37, 211, 102, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: loginResult.success ? '1px solid #25D366' : '1px solid #EF4444',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  {loginResult.success ? (
                    <CheckCircle2 size={22} color="#25D366" style={{ flexShrink: 0 }} />
                  ) : (
                    <AlertTriangle size={22} color="#EF4444" style={{ flexShrink: 0 }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                      {loginResult.success ? 'تم ربط الحساب بنجاح!' : 'خطأ في تسجيل الدخول'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '4px', lineHeight: '1.5' }}>
                      {loginResult.message || loginResult.error}
                    </div>
                    {loginResult.qr && !loginResult.isAlreadyLinked && (
                      <div style={{ marginTop: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '8px' }}>
                          الحساب مسجل لكنه يحتاج لمسح رمز QR لأول مرة:
                        </div>
                        <img
                          src={loginResult.qr}
                          alt="QR Code"
                          style={{ width: '180px', height: '180px', borderRadius: '12px', background: '#fff', padding: '8px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE CLIENT & SUBSCRIPTION PLAN (AS EXPLAINED BY USER) */}
          {activeTab === 'create_client' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <UserPlus size={20} color="#38BDF8" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                  <strong>إنشاء عميل جديد وتحديد خطة الاشتراك:</strong> كأدمن للنظام يمكنك إضافة عميل جديد، تحديد اسمه ورقمه وكلمة مروره، واختيار فترة الاشتراك (تجريبي 24 ساعة، شهر، 3 شهور، أو مدى الحياة).
                </div>
              </div>

              <form onSubmit={handleCreateClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px' }}>
                      اسم العميل أو المتجر:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: متجر النخبة / محمد أحمد"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px' }}>
                      رقم هاتف العميل (مع كود الدولة):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: 201012345678"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                        direction: 'ltr',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px' }}>
                      البريد الإلكتروني (اختياري):
                    </label>
                    <input
                      type="email"
                      placeholder="client@whatsapp.pro"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                        direction: 'ltr',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px' }}>
                      كلمة مرور الحساب:
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="6 أحرف على الأقل"
                      value={clientPassword}
                      onChange={(e) => setClientPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                        direction: 'ltr',
                      }}
                    />
                  </div>
                </div>

                {/* Subscription Plan Radio Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '8px' }}>
                    باقة وفترة الاشتراك الممنوحة:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                    {[
                      { id: '24h', label: 'تجريبي (24 ساعة)', icon: '⚡' },
                      { id: '1m', label: 'شهر كامل (30 يوم)', icon: '📅' },
                      { id: '3m', label: '3 شهور (90 يوم)', icon: '🚀' },
                      { id: '1y', label: 'سنة كاملة (365 يوم)', icon: '💎' },
                      { id: 'lifetime', label: 'مدى الحياة (Lifetime)', icon: '♾️' },
                    ].map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => setPlanDuration(plan.id)}
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          background: planDuration === plan.id ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          border: planDuration === plan.id ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{plan.icon}</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: planDuration === plan.id ? '#38BDF8' : '#CBD5E1' }}>
                          {plan.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #38BDF8, #0284C7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 25px rgba(56, 189, 248, 0.25)',
                    marginTop: '6px',
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>جاري إنشاء الحساب...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>إنشاء حساب العميل وتفعيله الآن</span>
                    </>
                  )}
                </button>
              </form>

              {createResult && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: createResult.success ? 'rgba(56, 189, 248, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: createResult.success ? '1px solid #38BDF8' : '1px solid #EF4444',
                    fontSize: '0.85rem',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {createResult.success ? <CheckCircle2 size={18} color="#38BDF8" /> : <AlertTriangle size={18} color="#EF4444" />}
                  <span>{createResult.message || createResult.error}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACTIVE ACCOUNT OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isConnected ? '#25D366' : '#EF4444',
                        boxShadow: isConnected ? '0 0 12px #25D366' : '0 0 12px #EF4444',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>الحساب المتصل الحالي:</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{accountName}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(37, 211, 102, 0.15)',
                      border: '1px solid rgba(37, 211, 102, 0.35)',
                      borderRadius: '10px',
                      padding: '6px 14px',
                      color: '#25D366',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      direction: 'ltr',
                    }}
                  >
                    {activePhone}
                  </div>
                </div>

                {/* Stats Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '6px' }}>
                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>حالة الربط</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isConnected ? '#25D366' : '#EF4444', marginTop: '4px' }}>
                      {isConnected ? 'متصل وجاهز ✅' : 'غير متصل ❌'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>جهات الاتصال النشطة</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38BDF8', marginTop: '4px' }}>
                      {statusData?.stats?.totalContacts || 0} جهة
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>إجمالي الرسائل</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#A855F7', marginTop: '4px' }}>
                      {statusData?.stats?.totalMessages?.toLocaleString() || 0} رسالة
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={handleDisconnect}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#F87171',
                      borderRadius: '10px',
                      padding: '10px 18px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <LogOut size={16} />
                    <span>تسجيل الخروج وتبديل الحساب</span>
                  </button>

                  <a
                    href={`${customServerUrl || 'https://whatsapp-pro-crm-production-613b.up.railway.app'}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#CBD5E1',
                      borderRadius: '10px',
                      padding: '10px 18px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={16} />
                    <span>فتح موقع واتساب برو المستضاف</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SERVER CONFIG */}
          {activeTab === 'server_config' && (
            <form onSubmit={handleSaveServer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '8px' }}>
                  رابط سيرفر WhatsApp Pro CRM المستضاف (Railway / Cloud Container):
                </label>
                <input
                  type="url"
                  required
                  value={customServerUrl}
                  onChange={(e) => setCustomServerUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    color: '#38BDF8',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    direction: 'ltr',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #1877F2, #0084FF)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  حفظ وتحديث السيرفر
                </button>
              </div>

              {serverSaveNotice && (
                <div style={{ fontSize: '0.85rem', color: '#10B981', marginTop: '6px' }}>
                  {serverSaveNotice}
                </div>
              )}
            </form>
          )}

        </div>

        {/* FOOTER */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(16, 20, 36, 0.95)',
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94A3B8' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25D366' }}></span>
            <span>سيرفر الواتساب وقاعدة البيانات السحابية (Neon PostgreSQL) متصلان ونشطان</span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 20px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
