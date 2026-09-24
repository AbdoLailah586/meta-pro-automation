'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Flame,
  MessageSquare,
  Sparkles,
  Copy,
  ExternalLink,
  ShieldCheck,
  Check,
  Globe,
  TrendingUp,
  RefreshCw,
  Layers,
} from 'lucide-react';

export default function CompetitorSpyRadar({ showToast, onRecreateAd }) {
  const [query, setQuery] = useState('اشتراكات');
  const [country, setCountry] = useState('EG');
  const [filter, setFilter] = useState('all'); // all | winning | whatsapp
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchAds = async (searchQuery = query) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/competitors/search?q=${encodeURIComponent(searchQuery)}&country=${country}`);
      const data = await res.json();
      if (data.success) {
        setAds(data.ads || []);
      } else {
        showToast(data.error || 'تعذر جلب إعلانات المنافسين', 'error');
      }
    } catch (e) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAds('اشتراكات');
  }, [country]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('تم نسخ نص الإعلان بنجاح!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredAds = ads.filter((ad) => {
    if (filter === 'winning') return ad.is_winning;
    if (filter === 'whatsapp') return ad.cta && ad.cta.toLowerCase().includes('whatsapp');
    return true;
  });

  return (
    <div>
      {/* Banner */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(8, 102, 255, 0.12) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8' }}>
              <Search size={22} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
              رادار استخبارات وتجسس إعلانات فيسبوك (Facebook Ad Library Spy)
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '800px', lineHeight: '1.6' }}>
            ابحث مباشرة في مكتبة إعلانات فيسبوك عن إعلانات المنافسين النشطة بدون الحاجة لأي توكن أو حساب معقد.
            اكتشف النصوص الرابحة (Winning Creatives)، صفحات الهبوط، وحوّلها بضغطة زر إلى إعلانات مخصصة لمنتجاتك بالذكاء الاصطناعي!
          </p>
        </div>

        <div style={{ textAlign: 'left' }}>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10B981',
              fontSize: '0.82rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={16} />
            <span>بدون توكن إعلاني (No Token)</span>
          </span>
        </div>
      </div>

      {/* Search Bar & Controls */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '28px' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchAds();
          }}
          style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="input"
              style={{ paddingRight: '42px', fontSize: '0.95rem' }}
              placeholder="ابحث بكلمة مفتاحية أو اسم صفحة منافسة (مثال: Gemini, اشتراكات, كانفا, واتساب...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            className="select"
            style={{ width: '150px' }}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="EG">🇪🇬 مصر (EG)</option>
            <option value="SA">🇸🇦 السعودية (SA)</option>
            <option value="AE">🇦🇪 الإمارات (AE)</option>
            <option value="ALL">🌐 جميع الدول</option>
          </select>

          <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ padding: '10px 22px' }}>
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'جاري البحث...' : 'بحث في الإعلانات'}</span>
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>أفكار بحث سريعة:</span>
          {['اشتراكات رقمية', 'Gemini Pro', 'ChatGPT Plus', 'Canva Pro', 'واتساب سندر', 'كاب كات'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuery(tag);
                fetchAds(tag);
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '3px 10px' }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <span>جميع الإعلانات ({ads.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('winning')}
            className={`btn btn-sm ${filter === 'winning' ? 'btn-ai' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Flame size={15} color={filter === 'winning' ? '#fff' : '#F59E0B'} />
            <span>الإعلانات الرابحة المقاسة 🔥 ({ads.filter((a) => a.is_winning).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('whatsapp')}
            className={`btn btn-sm ${filter === 'whatsapp' ? 'btn-whatsapp' : 'btn-secondary'}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: filter === 'whatsapp' ? 'rgba(37, 211, 102, 0.2)' : undefined,
              borderColor: filter === 'whatsapp' ? '#25D366' : undefined,
              color: filter === 'whatsapp' ? '#25D366' : undefined,
            }}
          >
            <MessageSquare size={15} />
            <span>إعلانات تحويل واتساب ({ads.filter((a) => a.cta?.toLowerCase().includes('whatsapp')).length})</span>
          </button>
        </div>
      </div>

      {/* Ads Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '22px' }}>
        {filteredAds.map((ad) => (
          <div
            key={ad.id}
            className="glass-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: ad.is_winning ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
              position: 'relative',
              boxShadow: ad.is_winning ? '0 8px 24px rgba(245, 158, 11, 0.08)' : undefined,
            }}
          >
            {/* Winning Badge */}
            {ad.is_winning && (
              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: '#F59E0B',
                  borderRadius: 'var(--radius-full)',
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                }}
              >
                <Flame size={13} />
                <span>إعلان رابح مقاس</span>
              </div>
            )}

            <div>
              {/* Advertiser Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'var(--brand-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '1.1rem',
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {ad.advertiser.slice(0, 1)}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.98rem' }}>{ad.advertiser}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {ad.started_running} • {ad.ads_using_creative} نسخ إعلانية
                  </div>
                </div>
              </div>

              {/* Headline */}
              {ad.link_text && (
                <div
                  style={{
                    fontWeight: '700',
                    fontSize: '0.92rem',
                    color: '#38BDF8',
                    marginBottom: '10px',
                    lineHeight: '1.4',
                  }}
                >
                  {ad.link_text}
                </div>
              )}

              {/* Ad Body */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  fontSize: '0.86rem',
                  lineHeight: '1.6',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  marginBottom: '16px',
                }}
              >
                {ad.body}
              </div>

              {/* Metadata Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                <span
                  style={{
                    background: 'rgba(37, 211, 102, 0.12)',
                    color: '#25D366',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                  }}
                >
                  CTA: {ad.cta || 'Send message'}
                </span>

                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-muted)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Globe size={12} />
                  <span>{ad.landing_domain}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={() => onRecreateAd(ad)}
                className="btn btn-ai"
                style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem' }}
              >
                <Sparkles size={15} />
                <span>إعادة صياغة بـ AI لمنتجاتي</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(ad.body, ad.id)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '9px 12px' }}
                title="نسخ نص الإعلان"
              >
                {copiedId === ad.id ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
              </button>

              {ad.landing_url && (
                <a
                  href={ad.landing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '9px 10px' }}
                  title="زيارة صفحة الهبوط"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
