'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Send,
  Sparkles,
  Phone,
  RefreshCw,
  Clock,
  CheckCheck,
  User,
  Tag,
  Share2,
  ExternalLink,
  ChevronDown,
  Smile,
  Paperclip,
  CheckCircle,
  AlertCircle,
  Settings,
  Flame,
  Lightbulb,
  Handshake,
  DollarSign,
  HelpCircle,
  Bot,
  Copy,
  Check,
} from 'lucide-react';

export default function OmnichannelInbox({ onOpenWhatsAppModal, whatsAppInfo }) {
  // State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [summaryStats, setSummaryStats] = useState({ total: 0, unread: 0, whatsappCount: 0, facebookCount: 0, instagramCount: 0 });

  // Filters
  const [channelFilter, setChannelFilter] = useState('all'); // 'all' | 'whatsapp' | 'facebook' | 'instagram'
  const [stageFilter, setStageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Lead metadata editing
  const [leadNotes, setLeadNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);

  const messagesEndRef = useRef(null);

  // Quick Reply Presets tailored for the advertising campaigns
  const QUICK_REPLY_PRESETS = [
    {
      id: 'ai_pro_offer',
      label: '🔥 عرض Google AI Pro',
      text: 'أهلاً بحضرتك يا فندم! 🌸 عرض Google AI Pro سنة ونصف (18 شهر) متاح حالياً بـ 90 جنيه فقط بدلاً من 450 ج! العرض شامل Gemini 3.1 Pro، مساحة 5TB سحابي، وصلاحيات Antigravity للمبرمجين مع ضمان كامل. لو حابب تبدأ التفعيل ابعتلي "تم" وهبعتلك خطوات الدفع فوراً ⚡',
    },
    {
      id: 'payment_methods',
      label: '💳 فودافون كاش & انستاباي',
      text: 'طرق الدفع المتاحة بكل سهولة: 💳\n📱 فودافون كاش: 010xxxxxxxx\n💸 انستاباي: souq@instapay\nالقيمة: 90 جنيه فقط.\nبعد التحويل برجاء إرسال صورة الإيصال مع الإيميل المراد التفعيل عليه وهيتم التفعيل خلال دقائق! ✨',
    },
    {
      id: 'welcome_greeting',
      label: '👋 رسالة ترحيبية',
      text: 'وعليكم السلام ورحمة الله وبركاته! أهلاً بحضرتك في سوق الاشتراكات 🌸 شرفتنا ونورتنا، تفضل بسؤالك وفريق خدمة العملاء جاهز لمساعدتك فوراً!',
    },
    {
      id: 'guarantee_info',
      label: '🛡️ الضمان والتفعيل الرسمي',
      text: 'الاشتراك رسمي وقانوني 100% ويتم تفعيله مباشرة على حسابك الشخصي في جوجل (مش حساب مشترك) مع ضمان كامل طوال فترة الـ 18 شهر ودعم فني مخصص. ✨',
    },
  ];

  // Fetch conversations
  const fetchConversations = async (autoSelect = false) => {
    try {
      const params = new URLSearchParams();
      if (channelFilter !== 'all') params.append('channel', channelFilter);
      if (stageFilter !== 'all') params.append('stage', stageFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/inbox/conversations?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
        if (data.stats) setSummaryStats(data.stats);

        // Auto select first conversation if none selected
        if ((autoSelect || !selectedConversation) && data.conversations?.length > 0) {
          selectConversation(data.conversations[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    fetchConversations(true);
  }, [channelFilter, stageFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select a conversation and fetch its messages
  const selectConversation = async (conv) => {
    setSelectedConversation(conv);
    setLeadNotes(conv.notes || '');
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/inbox/messages?conversationId=${encodeURIComponent(conv.id)}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMsgs(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send reply
  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedConversation || sendingReply) return;

    const textToSend = replyText.trim();
    setSendingReply(true);

    try {
      const res = await fetch('/api/inbox/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          channel: selectedConversation.channel,
          text: textToSend,
          senderName: 'مسؤول التسويق',
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setReplyText('');

        // Update last message in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? { ...c, lastMessage: textToSend, lastMessageTime: Date.now() }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  // AI Smart Response Generator
  const handleGenerateAiReply = async () => {
    if (!selectedConversation || generatingAi) return;
    setGeneratingAi(true);
    try {
      const lastCustMsg = messages.filter((m) => !m.fromMe).slice(-1)[0]?.text || selectedConversation.lastMessage;
      const res = await fetch('/api/inbox/ai-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: selectedConversation.senderName,
          lastMessage: lastCustMsg,
          channel: selectedConversation.channel,
          adSource: selectedConversation.adSource,
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setReplyText(data.reply);
      }
    } catch (err) {
      console.error('AI reply error:', err);
    } finally {
      setGeneratingAi(false);
    }
  };

  // Update lead stage
  const handleUpdateStage = async (newStage) => {
    if (!selectedConversation) return;
    try {
      await fetch('/api/inbox/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          leadStage: newStage,
        }),
      });
      setSelectedConversation((prev) => ({ ...prev, leadStage: newStage }));
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedConversation.id ? { ...c, leadStage: newStage } : c))
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Update lead administrator
  const handleUpdateAdmin = async (newAdmin) => {
    if (!selectedConversation) return;
    try {
      await fetch('/api/inbox/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          assignedAdmin: newAdmin,
        }),
      });
      setSelectedConversation((prev) => ({ ...prev, assignedAdmin: newAdmin }));
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedConversation.id ? { ...c, assignedAdmin: newAdmin } : c))
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!selectedConversation || savingNotes) return;
    setSavingNotes(true);
    try {
      await fetch('/api/inbox/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          notes: leadNotes,
        }),
      });
      setNotesSavedNotice(true);
      setTimeout(() => setNotesSavedNotice(false), 2000);
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedConversation.id ? { ...c, notes: leadNotes } : c))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotes(false);
    }
  };

  // Helper formatting time ago
  const formatTimeAgo = (ts) => {
    if (!ts) return '';
    const diff = Date.now() - Number(ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `${mins} د`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} س`;
    const days = Math.floor(hours / 24);
    return `${days} ي`;
  };

  const getChannelBadge = (ch) => {
    if (ch === 'whatsapp') {
      return (
        <span className="badge badge-whatsapp" style={{ padding: '3px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span>🟢</span> واتساب
        </span>
      );
    }
    if (ch === 'facebook') {
      return (
        <span className="badge badge-facebook" style={{ padding: '3px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span>🔵</span> فيسبوك ماسنجر
        </span>
      );
    }
    if (ch === 'instagram') {
      return (
        <span className="badge badge-instagram" style={{ padding: '3px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span>🟣</span> إنستغرام ديركت
        </span>
      );
    }
    return null;
  };

  const getStageBadge = (st) => {
    const map = {
      new: { label: 'عميل جديد 🔥', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
      interested: { label: 'مهتم 💡', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.12)' },
      negotiating: { label: 'جاري التفاوض 🤝', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' },
      won: { label: 'تم الشراء 💰', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
      lost: { label: 'غير مهتم ❌', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
    };
    const s = map[st] || map.new;
    return (
      <span style={{
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.7rem',
        fontWeight: 700,
        color: s.color,
        background: s.bg,
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* TOP BAR & OMNICHANNEL STATS */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        backdropFilter: 'blur(16px)',
      }}>
        {/* Title & Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={22} style={{ color: 'var(--meta-blue)' }} />
              مركز رسائل ومحادثات الإعلانات الموحد (Omnichannel Inbox)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              استقبال وإدارة جميع رسائل العملاء الواردة من إعلانات فيسبوك، إنستغرام، وواتساب في صندوق واحد لمديري التسويق
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-meta" style={{ padding: '4px 10px' }}>
              إجمالي المحادثات: {summaryStats.total}
            </span>
            <span className="badge badge-whatsapp" style={{ padding: '4px 10px' }}>
              واتساب: {summaryStats.whatsappCount}
            </span>
            <span className="badge badge-facebook" style={{ padding: '4px 10px' }}>
              فيسبوك: {summaryStats.facebookCount}
            </span>
            <span className="badge badge-instagram" style={{ padding: '4px 10px' }}>
              إنستغرام: {summaryStats.instagramCount}
            </span>
          </div>
        </div>

        {/* Active WhatsApp Number Hub Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            onClick={onOpenWhatsAppModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(37, 211, 102, 0.1)',
              border: '1px solid rgba(37, 211, 102, 0.35)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
            title="انقر لتعديل أو تغيير رقم الواتساب المستقبل للرسائل"
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25D366' }}></span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
              واتساب الاستقبال: <strong style={{ color: '#25D366', direction: 'ltr', display: 'inline-block' }}>{whatsAppInfo?.formattedPhone || '+20 155 482 6209'}</strong>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '2px 6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
              تعديل الرقم ⚙️
            </span>
          </div>

          <button
            onClick={() => fetchConversations(false)}
            className="btn btn-secondary btn-sm"
            title="تحديث صندوق الرسائل"
          >
            <RefreshCw size={15} className={loadingConvs ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 3-COLUMN INBOX WORKSPACE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr 280px',
        gap: '16px',
        height: 'calc(100vh - 210px)',
        minHeight: '680px',
      }}>
        {/* COLUMN 1: CONVERSATIONS LIST */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Channel Filter Pills */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            <button
              onClick={() => setChannelFilter('all')}
              className={`btn btn-xs ${channelFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '4px 10px' }}
            >
              الكل
            </button>
            <button
              onClick={() => setChannelFilter('whatsapp')}
              className={`btn btn-xs ${channelFilter === 'whatsapp' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '4px 10px', background: channelFilter === 'whatsapp' ? '#25D366' : 'transparent' }}
            >
              واتساب
            </button>
            <button
              onClick={() => setChannelFilter('facebook')}
              className={`btn btn-xs ${channelFilter === 'facebook' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '4px 10px', background: channelFilter === 'facebook' ? '#0866FF' : 'transparent' }}
            >
              فيسبوك
            </button>
            <button
              onClick={() => setChannelFilter('instagram')}
              className={`btn btn-xs ${channelFilter === 'instagram' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '4px 10px', background: channelFilter === 'instagram' ? 'var(--ig-gradient)' : 'transparent' }}
            >
              إنستغرام
            </button>
          </div>

          {/* Search & Lead Stage Filters */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input input-sm"
                placeholder="بحث بالاسم أو الرقم أو الرسالة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingRight: '32px', fontSize: '0.82rem' }}
              />
              <Search size={15} style={{ position: 'absolute', right: '10px', top: '10px', color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={13} style={{ color: 'var(--text-muted)' }} />
              <select
                className="select select-sm"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                style={{ fontSize: '0.78rem', flex: 1, padding: '4px 8px' }}
              >
                <option value="all">جميع المراحل التسويقية</option>
                <option value="new">عميل جديد 🔥</option>
                <option value="interested">مهتم 💡</option>
                <option value="negotiating">جاري التفاوض 🤝</option>
                <option value="won">تم الشراء 💰</option>
                <option value="lost">غير مهتم ❌</option>
              </select>
            </div>
          </div>

          {/* Conversations Items Scroll */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {loadingConvs ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px', color: 'var(--text-muted)', gap: '8px' }}>
                <RefreshCw size={18} className="animate-spin" /> جاري تحميل المحادثات...
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                لا توجد محادثات تطابق الفلتر المحدد
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(8, 102, 255, 0.12)' : 'transparent',
                      borderRight: isSelected ? '3px solid var(--meta-blue)' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: conv.channel === 'whatsapp' ? 'rgba(37, 211, 102, 0.2)' : conv.channel === 'facebook' ? 'rgba(8, 102, 255, 0.2)' : 'rgba(225, 48, 108, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: '#fff',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}>
                          {conv.avatarUrl ? (
                            <img src={conv.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            conv.senderName.slice(0, 1)
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            {conv.senderName}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                            {getChannelBadge(conv.channel)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {formatTimeAgo(conv.lastMessageTime)}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span style={{
                            background: '#25D366',
                            color: '#000',
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-full)',
                          }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '4px',
                    }}>
                      {conv.lastMessage || 'بدء المحادثة...'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      {getStageBadge(conv.leadStage)}
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {conv.assignedAdmin || 'مسؤول التسويق'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: LIVE CHAT & CONVERSION STUDIO */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-surface-elevated)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--meta-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    overflow: 'hidden',
                  }}>
                    {selectedConversation.avatarUrl ? (
                      <img src={selectedConversation.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      selectedConversation.senderName.slice(0, 1)
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                      {selectedConversation.senderName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {getChannelBadge(selectedConversation.channel)}
                      {selectedConversation.phone && (
                        <span style={{ direction: 'ltr' }}>📞 {selectedConversation.phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stage and Admin Pickers */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    className="select select-sm"
                    value={selectedConversation.leadStage || 'new'}
                    onChange={(e) => handleUpdateStage(e.target.value)}
                    style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                  >
                    <option value="new">عميل جديد 🔥</option>
                    <option value="interested">مهتم 💡</option>
                    <option value="negotiating">جاري التفاوض 🤝</option>
                    <option value="won">تم الشراء 💰</option>
                    <option value="lost">غير مهتم ❌</option>
                  </select>

                  <select
                    className="select select-sm"
                    value={selectedConversation.assignedAdmin || 'مسؤول التسويق الرئيسي'}
                    onChange={(e) => handleUpdateAdmin(e.target.value)}
                    style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                  >
                    <option value="مسؤول التسويق الرئيسي">المشرف: مسؤول التسويق الرئيسي</option>
                    <option value="مسؤول الردود والمبيعات">المشرف: مسؤول الردود والمبيعات</option>
                    <option value="مدير المبيعات">المشرف: مدير المبيعات</option>
                  </select>
                </div>
              </div>

              {/* Messages Feed */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: 'rgba(7, 9, 13, 0.65)',
              }}>
                {loadingMsgs ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    <RefreshCw size={20} className="animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    لا توجد رسائل سابقة في هذه المحادثة. يمكنك إرسال أول رسالة ترحيبية الآن!
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.fromMe ? 'flex-start' : 'flex-end',
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: m.fromMe ? 'flex-start' : 'flex-end',
                      }}
                    >
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '16px',
                        borderBottomRightRadius: !m.fromMe ? '4px' : '16px',
                        borderBottomLeftRadius: m.fromMe ? '4px' : '16px',
                        background: m.fromMe
                          ? (selectedConversation.channel === 'whatsapp' ? '#005C4B' : 'var(--meta-blue)')
                          : 'var(--bg-surface-elevated)',
                        color: '#fff',
                        fontSize: '0.88rem',
                        lineHeight: '1.5',
                        boxShadow: 'var(--shadow-sm)',
                        border: m.fromMe ? 'none' : '1px solid var(--border-subtle)',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {m.text}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '3px',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                      }}>
                        <span>{m.senderName}</span>
                        <span>•</span>
                        <span>{m.timestamp ? new Date(Number(m.timestamp)).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        {m.fromMe && <CheckCheck size={14} style={{ color: '#53bdeb' }} />}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Marketing Reply Presets Bar */}
              <div style={{
                padding: '8px 14px',
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-sidebar)',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
                  ردود تسويقية جاهزة:
                </span>
                {QUICK_REPLY_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setReplyText(p.text)}
                    className="btn btn-ghost btn-xs"
                    style={{
                      borderRadius: 'var(--radius-full)',
                      padding: '3px 10px',
                      fontSize: '0.74rem',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      flexShrink: 0,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Reply Studio & AI Copilot */}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={handleGenerateAiReply}
                    className="btn btn-secondary btn-xs"
                    disabled={generatingAi}
                    style={{
                      gap: '6px',
                      color: '#a855f7',
                      borderColor: 'rgba(168, 85, 247, 0.3)',
                      background: 'rgba(168, 85, 247, 0.08)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    <Sparkles size={14} className={generatingAi ? 'animate-spin' : ''} />
                    {generatingAi ? 'جاري صياغة الرد بالذكاء الاصطناعي...' : '🤖 صياغة رد بيعي ذكي (AI Copilot)'}
                  </button>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    اضغط Enter للإرسال
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <textarea
                    rows={2}
                    className="input"
                    placeholder="اكتب الرد التسويقي هنا للعميل..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    style={{ flex: 1, resize: 'none', fontSize: '0.88rem', padding: '10px' }}
                  />

                  <button
                    onClick={handleSendReply}
                    className="btn btn-primary"
                    disabled={sendingReply || !replyText.trim()}
                    style={{
                      height: '44px',
                      padding: '0 18px',
                      background: selectedConversation.channel === 'whatsapp' ? '#25D366' : 'var(--meta-blue)',
                      borderColor: selectedConversation.channel === 'whatsapp' ? '#25D366' : 'var(--meta-blue)',
                    }}
                  >
                    {sendingReply ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
              <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p>اختر محادثة من القائمة للبدء في الرد على استفسارات الإعلانات</p>
            </div>
          )}
        </div>

        {/* COLUMN 3: LEAD DETAILS & AD INTELLIGENCE */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
        }}>
          {selectedConversation ? (
            <>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  بطاقة العميل وسياق الإعلان
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  بيانات العميل المستهدف للحملات
                </span>
              </div>

              {/* Ad Attribution Box */}
              <div style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(8, 102, 255, 0.08)',
                border: '1px solid rgba(8, 102, 255, 0.25)',
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--meta-blue)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  🎯 مصدر الحملة الإعلانية:
                </span>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {selectedConversation.adSource || 'إعلانات السوشيال ميديا الممولة'}
                </p>
              </div>

              {/* Contact Info Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>القناة:</span>
                  <span>{getChannelBadge(selectedConversation.channel)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>رقم الهاتف:</span>
                  <span style={{ direction: 'ltr', fontWeight: 700 }}>{selectedConversation.phone || 'غير مسجل'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>المشرف المسؤول:</span>
                  <span style={{ fontWeight: 600 }}>{selectedConversation.assignedAdmin || 'مسؤول التسويق'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>المرحلة البيعية:</span>
                  <span>{getStageBadge(selectedConversation.leadStage)}</span>
                </div>
              </div>

              {/* Marketing Notes Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', margin: 0 }}>
                    ملاحظات مسؤول التسويق:
                  </label>
                  {notesSavedNotice && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 700 }}>
                      ✓ تم الحفظ
                    </span>
                  )}
                </div>
                <textarea
                  rows={4}
                  className="input"
                  placeholder="سجل تفاصيل العميل، كود الدفع، ملاحظات العرض..."
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  style={{ fontSize: '0.82rem', resize: 'vertical' }}
                />
                <button
                  onClick={handleSaveNotes}
                  className="btn btn-secondary btn-xs"
                  disabled={savingNotes}
                  style={{ alignSelf: 'flex-start', marginTop: '2px' }}
                >
                  {savingNotes ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
                </button>
              </div>

              {/* Direct External Actions */}
              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedConversation.phone && (
                  <a
                    href={`https://wa.me/${selectedConversation.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '6px', fontSize: '0.78rem', justifyContent: 'center', background: 'rgba(37, 211, 102, 0.1)', color: '#25D366' }}
                  >
                    <ExternalLink size={14} /> فتح مباشرة في تطبيق واتساب
                  </a>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              اختر محادثة لعرض بيانات العميل وسياق الحملة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
