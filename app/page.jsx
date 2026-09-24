'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  PenSquare,
  CalendarDays,
  Target,
  BarChart3,
  Share2,
  Sparkles,
  Settings,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  MessageCircle,
  Heart,
  Repeat,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  Plus,
  RefreshCw,
  Trash2,
  Eye,
  Check,
  Zap,
  Globe,
  HelpCircle,
  Facebook,
  Instagram,
  MessageSquare,
  Search,
  Video,
  Rocket,
  Flame,
  Upload,
} from 'lucide-react';
import CompetitorSpyRadar from './components/CompetitorSpyRadar';
import ViralReelsStudio from './components/ViralReelsStudio';
import GrowthHub from './components/GrowthHub';

export default function MetaProDashboard() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // App Data State
  const [posts, setPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [metaSettings, setMetaSettings] = useState({
    pageId: '',
    pageName: '',
    igAccountId: '',
    igUsername: '',
    isConnected: false,
    pagePicture: '',
  });
  const [aiSettings, setAiSettings] = useState({
    hasApiKey: false,
    preferredModel: 'meta-llama/llama-3-8b-instruct:free',
    defaultTone: 'marketing',
  });
  const [availableAiModels, setAvailableAiModels] = useState([]);

  // Post Composer State
  const [composer, setComposer] = useState({
    content: '',
    platforms: ['facebook', 'instagram', 'whatsapp'],
    mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
    scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString().slice(0, 16),
    campaignId: '',
    previewPlatform: 'facebook',
  });
  const [isPublishing, setIsPublishing] = useState(false);

  // AI Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('marketing');
  const [aiType, setAiType] = useState('offer');
  const [aiModel, setAiModel] = useState('meta-llama/llama-3-8b-instruct:free');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResult, setAiResult] = useState('');

  // AI Image Generation State
  const [showAiImageModal, setShowAiImageModal] = useState(false);
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [aiImageStyle, setAiImageStyle] = useState('advertising');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiImagePreview, setAiImagePreview] = useState('');

  // Meta Connect State
  const [connectForm, setConnectForm] = useState({
    pageId: '',
    pageAccessToken: '',
    igAccountId: '',
    igUsername: '',
  });
  const [isConnectingMeta, setIsConnectingMeta] = useState(false);
  const [metaMessage, setMetaMessage] = useState(null);

  // Post Details & Edit Modal State
  const [selectedPost, setSelectedPost] = useState(null);
  const [editForm, setEditForm] = useState({
    content: '',
    platforms: ['facebook'],
    scheduledDate: '',
    mediaUrl: '',
  });
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [isSyncingMetrics, setIsSyncingMetrics] = useState(false);

  // Image Upload State
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        if (isEdit) {
          setEditForm((prev) => ({ ...prev, mediaUrl: data.url }));
        } else {
          setComposer((prev) => ({ ...prev, mediaUrl: data.url }));
        }
        showToast('تم رفع الصورة من جهازك بنجاح!');
      } else {
        showToast(data.error || 'فشل رفع الصورة', 'error');
      }
    } catch (err) {
      showToast('خطأ أثناء رفع الصورة', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [postsRes, campsRes, metaRes, aiRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/campaigns'),
        fetch('/api/meta/status'),
        fetch('/api/ai/settings'),
      ]);

      const [postsData, campsData, metaData, aiData] = await Promise.all([
        postsRes.json(),
        campsRes.json(),
        metaRes.json(),
        aiRes.json(),
      ]);

      if (postsData.success) setPosts(postsData.posts || []);
      if (campsData.success) setCampaigns(campsData.campaigns || []);
      if (metaData.success) {
        setMetaSettings(metaData.meta || {});
        setConnectForm({
          pageId: metaData.meta?.pageId || '',
          pageAccessToken: '',
          igAccountId: metaData.meta?.igAccountId || '',
          igUsername: metaData.meta?.igUsername || '',
        });
      }
      if (aiData.success) {
        setAiSettings(aiData.settings || {});
        setAvailableAiModels(aiData.availableModels || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Post Creation
  const handleCreatePost = async (publishNow = false) => {
    if (!composer.content.trim()) {
      showToast('يرجى كتابة محتوى للمنشور أولاً', 'error');
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: composer.content,
          platforms: composer.platforms,
          mediaUrls: composer.mediaUrl ? [composer.mediaUrl] : [],
          scheduledAt: new Date(composer.scheduledDate).toISOString(),
          publishNow,
          campaignId: composer.campaignId || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(publishNow ? '🚀 تم النشر بنجاح على المنصات المختارة!' : '📅 تم جدولة المنشور بنجاح في التقويم!');
        setComposer({
          ...composer,
          content: '',
        });
        fetchData();
        setActiveTab('calendar');
      } else {
        showToast(data.error || 'حدث خطأ أثناء معالجة المنشور', 'error');
      }
    } catch (err) {
      showToast('فشل الاتصال بالخادم', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Immediate Publish from list
  const handlePublishNow = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/publish`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('تم نشر المنشور الآن بنجاح!');
        fetchData();
      } else {
        showToast(data.error || 'تعذر النشر', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال', 'error');
    }
  };

  // Delete Post
  const handleDeletePost = async (postId) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المنشور؟')) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('تم حذف المنشور');
        fetchData();
      }
    } catch (err) {
      showToast('فشل حذف المنشور', 'error');
    }
  };

  // Open Post Details and Edit Modal
  const openPostDetails = (post) => {
    setSelectedPost(post);
    let formattedDate = '';
    if (post.scheduledAt) {
      try {
        const d = new Date(post.scheduledAt);
        formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      } catch (e) {
        formattedDate = '';
      }
    }
    setEditForm({
      content: post.content || '',
      platforms: post.platforms ? [...post.platforms] : ['facebook'],
      scheduledDate: formattedDate,
      mediaUrl: post.mediaUrls?.[0] || '',
    });
  };

  // Save Post Edits
  const handleUpdatePost = async () => {
    if (!selectedPost) return;
    if (!editForm.content.trim()) {
      showToast('لا يمكن حفظ المنشور بدون محتوى', 'error');
      return;
    }

    setIsUpdatingPost(true);
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editForm.content,
          platforms: editForm.platforms,
          mediaUrls: editForm.mediaUrl ? [editForm.mediaUrl] : [],
          scheduledAt: editForm.scheduledDate ? new Date(editForm.scheduledDate).toISOString() : selectedPost.scheduledAt,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ وتعديل بيانات المنشور بنجاح! 💾');
        setSelectedPost(null);
        fetchData();
      } else {
        showToast(data.error || 'فشل تعديل المنشور', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsUpdatingPost(false);
    }
  };

  // Sanitize links for Instagram
  const handleSanitizeLinksForInstagram = () => {
    const clean = editForm.content.replace(/https?:\/\/[^\s]+/gi, '🔗 (الرابط في البايو)');
    setEditForm((prev) => ({ ...prev, content: clean }));
    showToast('تم استبدال الروابط بـ "الرابط في البايو 🔗" لتجنب حظر إنستغرام!');
  };

  // Sync real-time metrics directly from Meta Graph API
  const handleSyncPostMetrics = async (postId = null) => {
    setIsSyncingMetrics(true);
    try {
      const res = await fetch('/api/posts/sync-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          postId
            ? 'تمت مزامنة الإحصائيات الحية للمنشور مباشرة من خوادم Meta!'
            : `تمت مزامنة إحصائيات ${data.syncedCount} منشورات حقيقية من Meta!`
        );
        await fetchData();
        if (postId && selectedPost && selectedPost.id === postId) {
          const updated = data.posts?.find((p) => p.id === postId);
          if (updated) {
            setSelectedPost(updated);
          }
        }
      } else {
        showToast(data.error || 'فشلت المزامنة مع Meta', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ أثناء الاتصال بواجهة Meta Graph API', 'error');
    } finally {
      setIsSyncingMetrics(false);
    }
  };

  // Handle AI Content Generation
  const handleGenerateAi = async () => {
    if (!aiTopic.trim()) {
      showToast('يرجى كتابة فكرة أو موضوع المنشور', 'error');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          tone: aiTone,
          postType: aiType,
          platforms: composer.platforms,
          customModel: aiModel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAiResult(data.content);
        showToast(`تم التوليد بنجاح عبر: ${data.modelUsed}`);
      } else {
        showToast(data.error || 'فشل توليد المحتوى', 'error');
      }
    } catch (err) {
      showToast('خطأ أثناء التواصل مع نموذج الذكاء الاصطناعي', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Handle AI Image Generation
  const handleGenerateImage = async () => {
    if (!aiImagePrompt.trim()) {
      showToast('يرجى كتابة وصف للصورة المطلوبة', 'error');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiImagePrompt,
          style: aiImageStyle,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAiImagePreview(data.imageUrl);
        showToast('تم توليد الصورة بالذكاء الاصطناعي بنجاح!');
      } else {
        showToast(data.error || 'فشل توليد الصورة', 'error');
      }
    } catch (err) {
      showToast('خطأ أثناء توليد الصورة', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Connect Meta Page
  const handleConnectMeta = async (isDemo = false) => {
    setIsConnectingMeta(true);
    setMetaMessage(null);
    try {
      const res = await fetch('/api/meta/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...connectForm,
          isDemoMode: isDemo,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMetaSettings(data.meta);
        setMetaMessage({ text: data.message, type: 'success' });
        showToast(data.message);
      } else {
        setMetaMessage({ text: data.error || 'فشل الاتصال', type: 'error' });
      }
    } catch (err) {
      setMetaMessage({ text: 'خطأ في الشبكة', type: 'error' });
    } finally {
      setIsConnectingMeta(false);
    }
  };

  // Stats calculation
  const totalPublished = posts.filter((p) => p.status === 'published').length;
  const totalScheduled = posts.filter((p) => p.status === 'scheduled').length;
  const totalReach = posts.reduce((acc, p) => acc + (p.metrics?.reach || 0), 0);
  const totalEngagement = posts.reduce((acc, p) => acc + (p.metrics?.likes || 0) + (p.metrics?.comments || 0) + (p.metrics?.shares || 0), 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* ================= SIDEBAR ================= */}
      <aside
        style={{
          width: '280px',
          background: 'var(--bg-sidebar)',
          borderLeft: '1px solid var(--border-subtle)',
          padding: '24px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', padding: '0 8px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--brand-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 18px rgba(8, 102, 255, 0.4)',
              }}
            >
              <Zap size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>ميتا برو</span>
                <span className="badge badge-published" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                  PRO
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>أتمتة فيسبوك وإنستغرام</div>
            </div>
          </div>

          {/* Account Status Pill */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>حالة الربط</span>
              <span
                className="badge"
                style={{
                  background: metaSettings.isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: metaSettings.isConnected ? '#10B981' : '#F59E0B',
                  border: metaSettings.isConnected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                  fontSize: '0.7rem',
                }}
              >
                {metaSettings.isConnected ? '● متصل بنجاح' : '○ بحاجة للربط'}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {metaSettings.pageName || 'لم يتم ربط صفحة'}
            </div>
            {metaSettings.igUsername && (
              <div style={{ fontSize: '0.75rem', color: '#E1306C', marginTop: '2px' }}>
                @{metaSettings.igUsername}
              </div>
            )}
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', textAlign: 'right' }}
            >
              <LayoutDashboard size={19} />
              <span>لوحة التحكم</span>
            </button>

            <button
              onClick={() => setActiveTab('composer')}
              className={`nav-item ${activeTab === 'composer' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', textAlign: 'right' }}
            >
              <PenSquare size={19} />
              <span>استوديو المنشورات</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', textAlign: 'right' }}
            >
              <CalendarDays size={19} />
              <span>تقويم النشر ({totalScheduled})</span>
            </button>

            <button
              onClick={() => setActiveTab('campaigns')}
              className={`nav-item ${activeTab === 'campaigns' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', textAlign: 'right' }}
            >
              <Target size={19} />
              <span>الحملات التسويقية</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', textAlign: 'right' }}
            >
              <BarChart3 size={19} />
              <span>التحليلات والأداء</span>
            </button>

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '12px 0' }} />

            <div style={{ padding: '0 8px', marginBottom: '4px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              أدوات النمو والانتشار المجاني
            </div>

            <button
              onClick={() => setActiveTab('competitors')}
              className={`nav-item ${activeTab === 'competitors' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', textAlign: 'right' }}
            >
              <Search size={18} color="#38BDF8" />
              <span>رادار تجسس المنافسين</span>
            </button>

            <button
              onClick={() => setActiveTab('viral-reels')}
              className={`nav-item ${activeTab === 'viral-reels' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', textAlign: 'right' }}
            >
              <Video size={18} color="#EC4899" />
              <span>استوديو الريلز الفيروسي</span>
            </button>

            <button
              onClick={() => setActiveTab('growth-hub')}
              className={`nav-item ${activeTab === 'growth-hub' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', textAlign: 'right' }}
            >
              <Rocket size={18} color="#10B981" />
              <span>مركز الانتشار المجاني</span>
            </button>

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '12px 0' }} />

            <button
              onClick={() => setActiveTab('meta-connect')}
              className={`nav-item ${activeTab === 'meta-connect' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', textAlign: 'right' }}
            >
              <Share2 size={19} />
              <span>ربط Meta & Instagram</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-settings')}
              className={`nav-item ${activeTab === 'ai-settings' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', textAlign: 'right' }}
            >
              <Sparkles size={19} />
              <span>إعدادات الذكاء الاصطناعي</span>
            </button>
          </nav>
        </div>

        {/* Quick New Post Button */}
        <div>
          <button
            onClick={() => {
              setActiveTab('composer');
            }}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            <Plus size={18} />
            <span>منشور تسويقي جديد</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Top bar header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
              {activeTab === 'dashboard' && 'لوحة التحكم والنتائج'}
              {activeTab === 'composer' && 'استوديو صياغة المنشورات والذكاء الاصطناعي'}
              {activeTab === 'calendar' && 'تقويم وجدولة المنشورات'}
              {activeTab === 'campaigns' && 'إدارة وتتبع الحملات التسويقية'}
              {activeTab === 'analytics' && 'تقارير الوصول والتفاعل'}
              {activeTab === 'competitors' && '🕵️‍♂️ رادار تجسس واستخبارات إعلانات المنافسين (Ad Library)'}
              {activeTab === 'viral-reels' && '🎬 استوديو الريلز الفيروسي بالذكاء الاصطناعي (ShortGPT Engine)'}
              {activeTab === 'growth-hub' && '🚀 مركز الانتشار المجاني وعروض الواتساب وجروبات فيسبوك'}
              {activeTab === 'meta-connect' && 'ربط حسابات فيسبوك وإنستغرام (Meta Graph)'}
              {activeTab === 'ai-settings' && 'إعدادات نماذج الذكاء الاصطناعي (OpenRouter)'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              إدارة حملات فيسبوك وإنستغرام بأعلى كفاءة مع أتمتة النشر والتحليلات
            </p>
          </div>

          {/* Header Action Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(8, 102, 255, 0.1)',
                border: '1px solid rgba(8, 102, 255, 0.25)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                color: '#0866FF',
              }}
            >
              <Facebook size={16} />
              <span>Facebook Pages API</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(225, 48, 108, 0.1)',
                border: '1px solid rgba(225, 48, 108, 0.25)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                color: '#E1306C',
              }}
            >
              <Instagram size={16} />
              <span>Instagram Publishing</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(37, 211, 102, 0.1)',
                border: '1px solid rgba(37, 211, 102, 0.25)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                color: '#25D366',
              }}
            >
              <MessageSquare size={16} />
              <span>WhatsApp Pro CRM</span>
            </div>

            <button
              onClick={() => handleSyncPostMetrics()}
              disabled={isSyncingMetrics}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.08)',
              }}
              title="مزامنة الإحصائيات الحقيقية لجميع المنشورات مباشرة من خوادم Meta Graph API"
            >
              <RefreshCw size={14} className={isSyncingMetrics ? 'spin' : ''} />
              <span>{isSyncingMetrics ? 'جاري المزامنة...' : '🔄 مزامنة إحصائيات Meta الحية'}</span>
            </button>
          </div>
        </header>

        {/* ================= TAB 1: DASHBOARD OVERVIEW ================= */}
        {activeTab === 'dashboard' && (
          <div>
            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
              {/* Reach */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>إجمالي الوصول العضوي</span>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(8, 102, 255, 0.15)', color: '#0866FF' }}>
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{totalReach.toLocaleString('ar-EG')}</div>
                <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>↑ +28.4%</span>
                  <span style={{ color: 'var(--text-muted)' }}>مقارنة بالأسبوع الماضي</span>
                </div>
              </div>

              {/* Engagement */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>التفاعلات والتعليقات</span>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(225, 48, 108, 0.15)', color: '#E1306C' }}>
                    <Heart size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{totalEngagement.toLocaleString('ar-EG')}</div>
                <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>↑ +15.2%</span>
                  <span style={{ color: 'var(--text-muted)' }}>معدل التفاعل 6.8%</span>
                </div>
              </div>

              {/* Scheduled Posts */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>المنشورات المجدولة</span>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.15)', color: '#0EA5E9' }}>
                    <Clock size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{totalScheduled}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  جاهزة للنشر التلقائي عبر Cron
                </div>
              </div>

              {/* Active Campaigns */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>الحملات النشطة</span>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' }}>
                    <Target size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{campaigns.length}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  ميزانية مجملة: 2,300 USD
                </div>
              </div>
            </div>

            {/* Quick AI Trigger Banner */}
            <div
              className="glass-card"
              style={{
                padding: '24px 28px',
                marginBottom: '28px',
                background: 'linear-gradient(135deg, rgba(8, 102, 255, 0.15) 0%, rgba(225, 48, 108, 0.15) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={20} color="#A855F7" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>مساعد التسويق الذكي جاهز لكتابة منشورك القادم</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  استخدم أحدث نماذج الذكاء الاصطناعي المجانية (Llama 3 & Gemini Flash) لصياغة محتوى يضاعف التفاعل فوراً.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('composer');
                  setShowAiModal(true);
                }}
                className="btn btn-ai"
              >
                <Sparkles size={17} />
                <span>توليد بالذكاء الاصطناعي مجاناً</span>
              </button>
            </div>

            {/* Recent Posts & Schedule Table */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>أحدث المنشورات وحالة الجدولة</h3>
                <button onClick={() => setActiveTab('calendar')} className="btn btn-ghost btn-sm">
                  <span>عرض التقويم كاملاً</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  لا توجد منشورات بعد، ابدأ بإنشاء أول منشور تسويقي الآن!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {posts.slice(0, 5).map((post) => (
                    <div
                      key={post.id}
                      onClick={() => openPostDetails(post)}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(8, 102, 255, 0.4)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                        {/* Thumbnail */}
                        {post.mediaUrls?.[0] ? (
                          <img
                            src={post.mediaUrls[0]}
                            alt="Media"
                            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              background: 'var(--bg-surface-high)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-muted)',
                            }}
                          >
                            <PenSquare size={20} />
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: '0.92rem',
                              fontWeight: '500',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {post.content}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {post.platforms.includes('facebook') && <span style={{ color: '#0866FF' }}>Facebook</span>}
                              {post.platforms.includes('instagram') && <span style={{ color: '#E1306C' }}>Instagram</span>}
                              {post.platforms.includes('whatsapp') && <span style={{ color: '#25D366' }}>WhatsApp</span>}
                            </div>
                            <span>•</span>
                            <span>{new Date(post.scheduledAt || post.publishedAt).toLocaleString('ar-EG')}</span>
                            {post.error && (
                              <>
                                <span>•</span>
                                <span style={{ color: '#F59E0B' }}>⚠️ تنبيه</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`badge badge-${post.status}`}>
                          {post.status === 'published' && '● تم النشر'}
                          {post.status === 'scheduled' && '⏱ مجدول'}
                          {post.status === 'failed' && '✕ تعذر'}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPostDetails(post);
                          }}
                          className="btn btn-ghost btn-sm"
                          title="عرض وتعديل التفاصيل"
                        >
                          <PenSquare size={15} />
                          <span>تفاصيل وتعديل</span>
                        </button>

                        {post.status === 'scheduled' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePublishNow(post.id);
                            }}
                            className="btn btn-secondary btn-sm"
                            title="نشر الآن فوراً"
                          >
                            <Send size={14} />
                            <span>نشر الآن</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePost(post.id);
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--color-danger)' }}
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: POST COMPOSER & LIVE MOCKUP ================= */}
        {activeTab === 'composer' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '28px' }}>
            {/* Editor Column */}
            <div className="glass-card" style={{ padding: '26px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>محرر المنشور التسويقي</h2>

                <button
                  onClick={() => setShowAiModal(true)}
                  className="btn btn-ai btn-sm"
                >
                  <Sparkles size={16} />
                  <span>مساعد الذكاء الاصطناعي</span>
                </button>
              </div>

              {/* Target Platforms Toggle */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>
                  المنصات المستهدفة:
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div
                    onClick={() => {
                      const has = composer.platforms.includes('facebook');
                      const next = has
                        ? composer.platforms.filter((p) => p !== 'facebook')
                        : [...composer.platforms, 'facebook'];
                      setComposer({ ...composer, platforms: next });
                    }}
                    className={`platform-toggle facebook ${composer.platforms.includes('facebook') ? 'active' : ''}`}
                  >
                    <Facebook size={18} />
                    <span>صفحة فيسبوك</span>
                    {composer.platforms.includes('facebook') && <Check size={14} />}
                  </div>

                  <div
                    onClick={() => {
                      const has = composer.platforms.includes('instagram');
                      const next = has
                        ? composer.platforms.filter((p) => p !== 'instagram')
                        : [...composer.platforms, 'instagram'];
                      setComposer({ ...composer, platforms: next });
                    }}
                    className={`platform-toggle instagram ${composer.platforms.includes('instagram') ? 'active' : ''}`}
                  >
                    <Instagram size={18} />
                    <span>حساب إنستغرام</span>
                    {composer.platforms.includes('instagram') && <Check size={14} />}
                  </div>

                  <div
                    onClick={() => {
                      const has = composer.platforms.includes('whatsapp');
                      const next = has
                        ? composer.platforms.filter((p) => p !== 'whatsapp')
                        : [...composer.platforms, 'whatsapp'];
                      setComposer({ ...composer, platforms: next });
                    }}
                    className={`platform-toggle whatsapp ${composer.platforms.includes('whatsapp') ? 'active' : ''}`}
                    style={{
                      borderColor: composer.platforms.includes('whatsapp') ? '#25D366' : undefined,
                      backgroundColor: composer.platforms.includes('whatsapp') ? 'rgba(37, 211, 102, 0.15)' : undefined,
                      color: composer.platforms.includes('whatsapp') ? '#25D366' : undefined,
                    }}
                  >
                    <MessageSquare size={18} />
                    <span>بث واتساب (CRM)</span>
                    {composer.platforms.includes('whatsapp') && <Check size={14} />}
                  </div>
                </div>
              </div>

              {/* Content Textarea */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    نص المنشور والإعلان:
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {composer.content.length} حرف
                  </span>
                </div>
                <textarea
                  className="textarea"
                  style={{ height: '180px' }}
                  placeholder="اكتب رسالتك التسويقية هنا، أو اضغط على 'مساعد الذكاء الاصطناعي' ليصوغ لك إعلاناً احترافياً بأقوى الهاشتاجات..."
                  value={composer.content}
                  onChange={(e) => setComposer({ ...composer, content: e.target.value })}
                />
              </div>

              {/* Image Upload & Attachment */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    صورة المنشور (مطلوبة لإنستغرام):
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    يمكنك رفع صورة من جهازك مباشرة أو إدخال رابط
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e, false)}
                />

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 18px',
                      fontSize: '0.86rem',
                    }}
                  >
                    <Upload size={16} />
                    <span>{isUploading ? 'جاري رفع الملف...' : '📁 رفع صورة من جهازك'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAiImageModal(true);
                      if (!aiImagePrompt && composer.content) {
                        setAiImagePrompt(composer.content.slice(0, 100));
                      }
                    }}
                    className="btn btn-ai btn-sm"
                    title="توليد صورة إعلانية بالذكاء الاصطناعي مجاناً"
                  >
                    <Sparkles size={16} />
                    <span>توليد صورة بالـ AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const samples = [
                        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80',
                      ];
                      const rand = samples[Math.floor(Math.random() * samples.length)];
                      setComposer({ ...composer, mediaUrl: rand });
                    }}
                    className="btn btn-secondary btn-sm"
                    title="صورة عشوائية جاهزة"
                  >
                    <ImageIcon size={16} />
                    <span>صورة تجريبية</span>
                  </button>
                </div>

                {/* Input field for direct URL if needed */}
                <input
                  type="text"
                  className="input"
                  placeholder="أو ضع رابط صورة مباشر: https://... أو /gemini_pro.png"
                  value={composer.mediaUrl}
                  onChange={(e) => setComposer({ ...composer, mediaUrl: e.target.value })}
                />

                {/* Preview Thumbnail */}
                {composer.mediaUrl && (
                  <div
                    style={{
                      marginTop: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={composer.mediaUrl}
                        alt="Preview"
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#10B981' }}>
                          ✓ الصورة جاهزة للإرفاق
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {composer.mediaUrl}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setComposer({ ...composer, mediaUrl: '' })}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}
                    >
                      إزالة الصورة ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Campaign Assignment & Scheduling */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                    ربط بحملة تسويقية:
                  </label>
                  <select
                    className="select"
                    value={composer.campaignId}
                    onChange={(e) => setComposer({ ...composer, campaignId: e.target.value })}
                  >
                    <option value="">بدون حملة محددة</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                    تاريخ ووقت الجدولة:
                  </label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={composer.scheduledDate}
                    onChange={(e) => setComposer({ ...composer, scheduledDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  disabled={isPublishing}
                  onClick={() => handleCreatePost(true)}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  <Send size={18} />
                  <span>{isPublishing ? 'جاري النشر...' : 'نشر فوري الآن على Meta'}</span>
                </button>

                <button
                  disabled={isPublishing}
                  onClick={() => handleCreatePost(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  <Clock size={18} />
                  <span>حفظ وجدولة للنشر لاحقاً</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Preview Column */}
            <div>
              {/* Preview platform toggle */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  onClick={() => setComposer({ ...composer, previewPlatform: 'facebook' })}
                  className={`btn btn-sm ${composer.previewPlatform === 'facebook' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  <Facebook size={16} />
                  <span>معاينة فيسبوك</span>
                </button>

                <button
                  onClick={() => setComposer({ ...composer, previewPlatform: 'instagram' })}
                  className={`btn btn-sm ${composer.previewPlatform === 'instagram' ? 'btn-instagram' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  <Instagram size={16} />
                  <span>معاينة إنستغرام</span>
                </button>

                <button
                  onClick={() => setComposer({ ...composer, previewPlatform: 'whatsapp' })}
                  className={`btn btn-sm ${composer.previewPlatform === 'whatsapp' ? 'btn-whatsapp' : 'btn-secondary'}`}
                  style={{
                    flex: 1,
                    backgroundColor: composer.previewPlatform === 'whatsapp' ? '#25D366' : undefined,
                    color: composer.previewPlatform === 'whatsapp' ? '#fff' : undefined,
                  }}
                >
                  <MessageSquare size={16} />
                  <span>معاينة واتساب</span>
                </button>
              </div>

              {/* Facebook Mockup */}
              {composer.previewPlatform === 'facebook' && (
                <div
                  style={{
                    background: '#242526',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  {/* FB Header */}
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={metaSettings.pagePicture || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'}
                      alt="Avatar"
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#E4E6EB' }}>
                        {metaSettings.pageName || 'صفحة شركتي الرسمية'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#B0B3B8' }}>منذ دقيقة • 🌐 العامة</div>
                    </div>
                  </div>

                  {/* FB Post Text */}
                  <div style={{ padding: '0 16px 14px', fontSize: '0.92rem', color: '#E4E6EB', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {composer.content || 'هنا سيظهر نص المنشور التسويقي كما يراه جمهورك على فيسبوك بالضبط...'}
                  </div>

                  {/* FB Post Image */}
                  {composer.mediaUrl && (
                    <img
                      src={composer.mediaUrl}
                      alt="Post Attachment"
                      style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', display: 'block' }}
                    />
                  )}

                  {/* FB Reactions bar */}
                  <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-around', color: '#B0B3B8', fontSize: '0.82rem', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Heart size={16} /> <span>أعجبني</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MessageCircle size={16} /> <span>تعليق</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Share2 size={16} /> <span>مشاركة</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Instagram Mockup */}
              {composer.previewPlatform === 'instagram' && (
                <div
                  style={{
                    background: '#000000',
                    borderRadius: '18px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  {/* IG Header */}
                  <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'var(--ig-gradient)',
                          padding: '2px',
                        }}
                      >
                        <img
                          src={metaSettings.pagePicture || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'}
                          alt="Avatar"
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#000' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>
                        {metaSettings.igUsername || 'my_company_pro'}
                      </div>
                    </div>
                    <span style={{ color: '#aaa', fontSize: '1.1rem' }}>•••</span>
                  </div>

                  {/* IG Photo */}
                  <img
                    src={composer.mediaUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80'}
                    alt="Instagram media"
                    style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
                  />

                  {/* IG Action Icons */}
                  <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                    <div style={{ display: 'flex', gap: '14px' }}>
                      <Heart size={20} />
                      <MessageCircle size={20} />
                      <Send size={20} />
                    </div>
                  </div>

                  {/* IG Caption */}
                  <div style={{ padding: '0 14px 14px', fontSize: '0.85rem', color: '#fff', lineHeight: '1.5' }}>
                    <span style={{ fontWeight: '700', marginLeft: '6px' }}>{metaSettings.igUsername || 'my_company_pro'}</span>
                    <span style={{ whiteSpace: 'pre-wrap' }}>
                      {composer.content.slice(0, 180)}
                      {composer.content.length > 180 ? '... المزيد' : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* WhatsApp Mockup */}
              {composer.previewPlatform === 'whatsapp' && (
                <div
                  style={{
                    background: '#0b141a',
                    borderRadius: '18px',
                    border: '1px solid rgba(37, 211, 102, 0.25)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                    fontFamily: 'Segoe UI, Helvetica Neue, sans-serif',
                  }}
                >
                  {/* WA Header */}
                  <div
                    style={{
                      padding: '12px 16px',
                      background: '#202c33',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: '700',
                      }}
                    >
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#e9edef' }}>
                        حملة رسائل واتساب برو (بث جماعي)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#8696a0' }}>
                        إلى 549+ جهة اتصال نشطة • متصل الآن
                      </div>
                    </div>
                  </div>

                  {/* WA Chat Body with background pattern */}
                  <div
                    style={{
                      padding: '16px',
                      minHeight: '260px',
                      background: '#0b141a',
                      backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                    }}
                  >
                    {/* Outgoing Message Bubble */}
                    <div
                      style={{
                        maxWidth: '85%',
                        alignSelf: 'flex-start',
                        background: '#005c4b',
                        color: '#e9edef',
                        borderRadius: '8px',
                        borderTopRightRadius: '0px',
                        padding: '8px 10px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        position: 'relative',
                        direction: 'rtl',
                      }}
                    >
                      {/* Image Attachment if any */}
                      {composer.mediaUrl && (
                        <img
                          src={composer.mediaUrl}
                          alt="WhatsApp Media"
                          style={{
                            width: '100%',
                            maxHeight: '260px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            marginBottom: '6px',
                            display: 'block',
                          }}
                        />
                      )}

                      {/* Text content */}
                      <div style={{ fontSize: '0.88rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {composer.content || 'رسالتك التسويقية لعملاء الواتساب ستظهر هنا بأعلى دقة واحترافية...'}
                      </div>

                      {/* Time & Read Receipts */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '4px',
                          marginTop: '4px',
                          fontSize: '0.7rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                        }}
                      >
                        <span>الآن</span>
                        <span style={{ color: '#53bdeb' }}>✓✓</span>
                      </div>
                    </div>
                  </div>

                  {/* WA Footer Info */}
                  <div
                    style={{
                      padding: '8px 16px',
                      background: '#111b21',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      color: '#8696a0',
                    }}
                  >
                    <span>⚡ إرسال فوري مع فواصل زمنية ضد الحظر</span>
                    <span style={{ color: '#25D366', fontWeight: '600' }}>WhatsApp Pro Engine ✓</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: CONTENT CALENDAR ================= */}
        {activeTab === 'calendar' && (
          <div className="glass-card" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>جدول المنشورات والمواعيد</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  إجمالي {posts.length} منشور مسجل في النظام
                </p>
              </div>

              <button onClick={() => setActiveTab('composer')} className="btn btn-primary btn-sm">
                <Plus size={16} />
                <span>إضافة منشور للجدول</span>
              </button>
            </div>

            {/* List of all posts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => openPostDetails(post)}
                  style={{
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(8, 102, 255, 0.4)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: post.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(8, 102, 255, 0.15)',
                        color: post.status === 'published' ? '#10B981' : '#0866FF',
                      }}
                    >
                      {post.status === 'published' ? <CheckCircle2 size={22} /> : <Clock size={22} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {post.content.slice(0, 120)}...
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} />
                          {new Date(post.scheduledAt || post.publishedAt).toLocaleString('ar-EG')}
                        </span>
                        <span>•</span>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          <span>المنصات:</span>
                          {post.platforms.includes('facebook') && <span style={{ color: '#0866FF', fontWeight: '600' }}>Facebook</span>}
                          {post.platforms.includes('instagram') && <span style={{ color: '#E1306C', fontWeight: '600' }}>Instagram</span>}
                          {post.platforms.includes('whatsapp') && <span style={{ color: '#25D366', fontWeight: '600' }}>WhatsApp</span>}
                        </div>
                        {post.error && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#F59E0B' }}>⚠️ تنبيه في النشر</span>
                          </>
                        )}
                        {post.metrics?.reach > 0 && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#10B981' }}>الوصول: {post.metrics.reach} شخص</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge badge-${post.status}`}>
                      {post.status === 'published' && '● تم النشر'}
                      {post.status === 'scheduled' && '⏱ مجدول'}
                      {post.status === 'failed' && '✕ خطأ'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPostDetails(post);
                      }}
                      className="btn btn-ghost btn-sm"
                      title="عرض وتعديل التفاصيل"
                    >
                      <PenSquare size={15} />
                      <span>تفاصيل وتعديل</span>
                    </button>

                    {post.status === 'scheduled' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublishNow(post.id);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        <Send size={14} />
                        <span>نشر الآن</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost(post.id);
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: CAMPAIGNS PLANNER ================= */}
        {activeTab === 'campaigns' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>الحملات التسويقية النشطة</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  تنظيم وتجميع المنشورات تحت أهداف إعلانية محددة
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {campaigns.map((camp) => {
                const campPosts = posts.filter((p) => p.campaignId === camp.id);
                const campReach = campPosts.reduce((sum, p) => sum + (p.metrics?.reach || 0), 0);
                const campLikes = campPosts.reduce((sum, p) => sum + (p.metrics?.likes || 0), 0);

                return (
                  <div key={camp.id} className="glass-card" style={{ padding: '24px', borderTop: `4px solid ${camp.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{camp.name}</h3>
                      <span className="badge badge-published">نشطة</span>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      {camp.objective}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', padding: '14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '18px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الميزانية</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{camp.budget}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>عدد المنشورات</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{campPosts.length} منشور</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الوصول المحقق</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#10B981', marginTop: '2px' }}>{campReach}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>من: {camp.startDate}</span>
                      <span>إلى: {camp.endDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 5: ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="glass-card" style={{ padding: '26px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>تحليلات الأداء والتفاعل</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              مقارنة نتائج المنشورات بين فيسبوك وإنستغرام
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
              <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: '#0866FF' }}>
                  <Facebook size={20} />
                  <span style={{ fontWeight: '700', fontSize: '1rem' }}>نتائج صفحة فيسبوك</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>الوصول العضوي:</span>
                  <span style={{ fontWeight: '700' }}>3,420 شخص</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>المشاركات (Shares):</span>
                  <span style={{ fontWeight: '700' }}>38 مشاركة</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>أفضل وقت للنشر:</span>
                  <span style={{ fontWeight: '700', color: '#10B981' }}>7:00 مساءً - 10:00 مساءً</span>
                </div>
              </div>

              <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: '#E1306C' }}>
                  <Instagram size={20} />
                  <span style={{ fontWeight: '700', fontSize: '1rem' }}>نتائج حساب إنستغرام</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>الظهور (Impressions):</span>
                  <span style={{ fontWeight: '700' }}>4,910 ظهور</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>الحفظ (Saves):</span>
                  <span style={{ fontWeight: '700' }}>64 مرة</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>أفضل وقت للنشر:</span>
                  <span style={{ fontWeight: '700', color: '#10B981' }}>1:00 ظهراً & 9:00 مساءً</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: META GRAPH API SETTINGS ================= */}
        {activeTab === 'meta-connect' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '28px' }}>
            {/* Form */}
            <div className="glass-card" style={{ padding: '26px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>
                إعدادات ربط Meta Graph API
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                أدخل بيانات صفحة فيسبوك وحساب إنستغرام التجاري للنشر المباشر عبر السيرفر
              </p>

              {metaMessage && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '18px',
                    background: metaMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: metaMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    color: metaMessage.type === 'success' ? '#10B981' : '#EF4444',
                    fontSize: '0.88rem',
                  }}
                >
                  {metaMessage.text}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                  معرف صفحة فيسبوك (Facebook Page ID):
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="مثال: 104829104928"
                  value={connectForm.pageId}
                  onChange={(e) => setConnectForm({ ...connectForm, pageId: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                  رمز وصول الصفحة (Page Access Token):
                </label>
                <input
                  type="password"
                  className="input"
                  placeholder="EAA..."
                  value={connectForm.pageAccessToken}
                  onChange={(e) => setConnectForm({ ...connectForm, pageAccessToken: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                  معرف حساب إنستغرام التجاري (Instagram Business ID):
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="مثال: 178414002938 (اختياري - يتم جلبه تلقائياً إذا كان مرتبطاً بالصفحة)"
                  value={connectForm.igAccountId}
                  onChange={(e) => setConnectForm({ ...connectForm, igAccountId: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                  اسم مستخدم إنستغرام (Username):
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="مثال: my_company"
                  value={connectForm.igUsername}
                  onChange={(e) => setConnectForm({ ...connectForm, igUsername: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  disabled={isConnectingMeta}
                  onClick={() => handleConnectMeta(false)}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  <RefreshCw size={17} />
                  <span>{isConnectingMeta ? 'جاري الفحص والربط...' : 'فحص والربط الفعلي مع Meta'}</span>
                </button>

                <button
                  onClick={() => handleConnectMeta(true)}
                  className="btn btn-secondary"
                  title="تفعيل وضع تجريبي فوري"
                >
                  <Zap size={17} />
                  <span>تفعيل وضع تجريبي</span>
                </button>
              </div>
            </div>

            {/* Step-by-step Guide */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#0866FF' }}>
                <HelpCircle size={20} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>كيف تحصل على رمز الوصول مجاناً؟</h3>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>1. الدخول لمطوري ميتا:</strong>
                  <div>توجه إلى <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" style={{ color: '#0866FF' }}>developers.facebook.com</a> وسجل دخولك بحساب فيسبوك.</div>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>2. إنشاء تطبيق (Create App):</strong>
                  <div>اختر نوع التطبيق "أعمال (Business)" وسمّه باسم علامتك التجارية.</div>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>3. الصلاحيات المطلوبة (Permissions):</strong>
                  <div>من Graph API Explorer اختر الصلاحيات: <code>pages_manage_posts</code> و <code>pages_read_engagement</code> و <code>instagram_content_publish</code>.</div>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>4. استخراج Token دائم:</strong>
                  <div>اختر صفحتك من القائمة، وانسخ الـ Page Access Token وضعه هنا في الحقل المخصص.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: AI SETTINGS ================= */}
        {activeTab === 'ai-settings' && (
          <div className="glass-card" style={{ padding: '26px', maxWidth: '780px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>
              إعدادات الذكاء الاصطناعي و OpenRouter
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              ربط النماذج المجانية لتوليد منشورات تسويقية وحملات كاملة تلقائياً
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                مفتاح OpenRouter API (مجاني تماماً):
              </label>
              <input
                type="password"
                className="input"
                placeholder="sk-or-v1-..."
                value={aiSettings.openRouterApiKey || ''}
                onChange={(e) => setAiSettings({ ...aiSettings, openRouterApiKey: e.target.value })}
              />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                يمكنك استخراج مفتاح مجاني في 10 ثوانٍ من: <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color: '#0866FF' }}>openrouter.ai/keys</a>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: '600' }}>
                النموذج الذكي المفضل (النماذج المجانية المتاحة):
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {availableAiModels.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setAiSettings({ ...aiSettings, preferredModel: m.id })}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: aiSettings.preferredModel === m.id ? 'rgba(8, 102, 255, 0.15)' : 'var(--bg-surface-elevated)',
                      border: aiSettings.preferredModel === m.id ? '1px solid #0866FF' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{m.name}</span>
                        <span className="badge badge-free">FREE</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {m.desc}
                      </p>
                    </div>

                    {aiSettings.preferredModel === m.id && (
                      <div style={{ color: '#0866FF' }}>
                        <CheckCircle2 size={20} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/ai/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(aiSettings),
                  });
                  const data = await res.json();
                  if (data.success) {
                    showToast('تم حفظ إعدادات الذكاء الاصطناعي بنجاح!');
                  }
                } catch (err) {
                  showToast('فشل حفظ الإعدادات', 'error');
                }
              }}
              className="btn btn-primary"
              style={{ padding: '12px 28px' }}
            >
              <Check size={18} />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        )}

        {/* ================= TAB: COMPETITORS SPY RADAR ================= */}
        {activeTab === 'competitors' && (
          <CompetitorSpyRadar
            showToast={showToast}
            onRecreateAd={(ad) => {
              const recreatedDraft = `🔥 عرض استثنائي مستوحى من أقوى الحملات:\n\n${ad.link_text}\n\n${ad.body}\n\n📲 اطلب الآن عبر الواتساب: 01554826209\n🌐 المتجر: https://souq-al-ishtirakat-xi.vercel.app/`;
              setComposer({
                ...composer,
                content: recreatedDraft,
                mediaUrl: ad.creative_image || '/gemini_pro.png',
                platforms: ['facebook', 'instagram', 'whatsapp'],
              });
              setActiveTab('composer');
              setShowAiModal(true);
              setAiTopic(`إعادة صياغة إعلان لخدمتنا سوق الاشتراكات:\nالعنوان: ${ad.link_text}\nالنص:\n${ad.body}`);
              showToast('تم نقل إعلان المنافس للمحرر ومساعد الذكاء الاصطناعي لإعادة صياغته!');
            }}
          />
        )}

        {/* ================= TAB: VIRAL REELS STUDIO ================= */}
        {activeTab === 'viral-reels' && (
          <ViralReelsStudio
            showToast={showToast}
            onSendToComposer={(reel) => {
              const text = `🎬 [ريلز فيروسي]: ${reel.title}\n\n🔥 الـ Hook (أول 3 ثواني):\n"${reel.hook}"\n\n📌 المشكلة والحل:\n${reel.problem}\n${reel.solution}\n\n🗣️ السكريبت الصوتي للتعليق (Voiceover):\n"${reel.fullVoiceover}"\n\n📲 للطلب والتسليم الفوري:\nواتساب: 01554826209\nرابط المتجر: https://souq-al-ishtirakat-xi.vercel.app/\n\n${reel.hashtags}`;
              setComposer({
                ...composer,
                content: text,
                mediaUrl: '/gemini_pro.png',
                platforms: ['facebook', 'instagram', 'whatsapp'],
              });
              setActiveTab('composer');
              showToast('تم إرسال سكريبت الريلز إلى استوديو النشر بنجاح!');
            }}
          />
        )}

        {/* ================= TAB: ORGANIC GROWTH HUB ================= */}
        {activeTab === 'growth-hub' && (
          <GrowthHub
            showToast={showToast}
            onSendToComposer={(content, mediaUrl) => {
              setComposer({
                ...composer,
                content,
                mediaUrl: mediaUrl || '/gemini_pro.png',
                platforms: ['facebook', 'instagram', 'whatsapp'],
              });
              setActiveTab('composer');
              showToast('تم نقل المحتوى إلى استوديو النشر!');
            }}
            onPublishLiveNow={async () => {
              await handlePublishNow('post_gemini_pro_18m_launch');
            }}
          />
        )}
      </main>

      {/* ================= AI GENERATOR MODAL ================= */}
      {showAiModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '640px',
              padding: '28px',
              background: '#0F1520',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={22} color="#A855F7" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>مساعد صياغة المحتوى التسويقي الذكي</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="btn btn-ghost btn-sm">
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                فكرة أو موضوع المنشور:
              </label>
              <input
                type="text"
                className="input"
                placeholder="مثال: خصم 30% على باقات التصميم، أو نصائح لزيادة المبيعات"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                  نوع المنشور:
                </label>
                <select className="select" value={aiType} onChange={(e) => setAiType(e.target.value)}>
                  <option value="offer">عرض ترويجي وخصم مع CTA</option>
                  <option value="hook">صائد انتباه فيروسي (Viral Hook)</option>
                  <option value="value">محتوى تعليمي وقيمة مضافة</option>
                  <option value="question">سؤال تفاعلي لتحفيز التعليقات</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                  نبرة الصوت:
                </label>
                <select className="select" value={aiTone} onChange={(e) => setAiTone(e.target.value)}>
                  <option value="marketing">تسويقي مقنع وحماسي</option>
                  <option value="corporate">احترافي ورسمي للشركات</option>
                  <option value="casual">ودي وعفوي</option>
                  <option value="urgent">عاجل (فرصة محدودة / FOMO)</option>
                </select>
              </div>
            </div>

            {/* Generated result preview */}
            {aiResult && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  marginBottom: '18px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {aiResult}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                disabled={isGeneratingAi}
                onClick={handleGenerateAi}
                className="btn btn-ai"
                style={{ flex: 1, padding: '12px' }}
              >
                <Sparkles size={17} />
                <span>{isGeneratingAi ? 'جاري الصياغة بالذكاء الاصطناعي...' : 'توليد المنشور الآن'}</span>
              </button>

              {aiResult && (
                <button
                  onClick={() => {
                    setComposer({ ...composer, content: aiResult });
                    setShowAiModal(false);
                    showToast('تم تطبيق النص في المحرر بنجاح!');
                  }}
                  className="btn btn-primary"
                >
                  <Check size={17} />
                  <span>اعتماد في المحرر</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= AI IMAGE GENERATOR MODAL ================= */}
      {showAiImageModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '620px',
              padding: '28px',
              background: '#0F1520',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={22} color="#00C2FF" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>🎨 توليد صورة إعلانية بالذكاء الاصطناعي مجاناً</h3>
              </div>
              <button onClick={() => setShowAiImageModal(false)} className="btn btn-ghost btn-sm">
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                وصف الصورة المراد تصميمها:
              </label>
              <textarea
                className="textarea"
                style={{ height: '90px' }}
                placeholder="مثال: إعلان اشتراكات رقمية بتصميم ثلاثي الأبعاد وإضاءة نيون فخمة، أو عرض خصم 50% مع شاشات وأجهزة ذكية..."
                value={aiImagePrompt}
                onChange={(e) => setAiImagePrompt(e.target.value)}
              />
            </div>

            {/* Quick Inspiration Pills */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                أفكار سريعة للاشتراكات والتسويق:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  'إعلان عروض اشتراكات رقمية فخم 3D',
                  'خصم خاص 30% بتصميم جرافيك عصري',
                  'شاشات ذكية ومنصات بث رقمي بألوان زاهية',
                  'بانر تسويق إلكتروني لشركات مع إضاءة نيون',
                ].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => setAiImagePrompt(txt)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                نمط التصميم (Style):
              </label>
              <select className="select" value={aiImageStyle} onChange={(e) => setAiImageStyle(e.target.value)}>
                <option value="advertising">إعلاني فخم ثلاثي الأبعاد (Commercial 3D & Neon)</option>
                <option value="ecommerce">متجر إلكتروني وبانر عروض (E-Commerce Banner)</option>
                <option value="minimal">تصميم عصري بسيط وراقي (Modern Minimalist)</option>
                <option value="cyber">تقني مستقبلي وسايبر (Cyberpunk / Futuristic Tech)</option>
              </select>
            </div>

            {/* Preview Generated Image */}
            {aiImagePreview && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <img
                  src={aiImagePreview}
                  alt="AI Generated Preview"
                  style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid rgba(8, 102, 255, 0.3)' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                disabled={isGeneratingImage}
                onClick={handleGenerateImage}
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                <Sparkles size={17} />
                <span>{isGeneratingImage ? 'جاري رسم وتوليد الصورة...' : 'توليد الصورة الآن مجاناً'}</span>
              </button>

              {aiImagePreview && (
                <button
                  onClick={() => {
                    setComposer({ ...composer, mediaUrl: aiImagePreview });
                    setShowAiImageModal(false);
                    showToast('تم إدراج الصورة في المنشور بنجاح!');
                  }}
                  className="btn btn-ai"
                  style={{ padding: '12px 20px' }}
                >
                  <Check size={17} />
                  <span>استخدام في المنشور</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: POST DETAILS & EDIT ================= */}
      {selectedPost && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '750px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '28px 32px',
              border: '1px solid rgba(240, 168, 60, 0.4)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(240, 168, 60, 0.15)', color: '#F0A83C' }}>
                  <PenSquare size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>تفاصيل وتعديل المنشور</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>معرف المنشور: <code>{selectedPost.id}</code></span>
                    <span>•</span>
                    <span className={`badge badge-${selectedPost.status}`}>
                      {selectedPost.status === 'published' && '● تم النشر'}
                      {selectedPost.status === 'scheduled' && '⏱ مجدول للنشر'}
                      {selectedPost.status === 'failed' && '✕ تعذر النشر'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem', padding: '6px 12px' }}>
                ✕
              </button>
            </div>

            {/* Error or Warning Banner if exists */}
            {selectedPost.error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  color: '#FCA5A5',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                }}
              >
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#EF4444' }} />
                <div>
                  <strong style={{ color: '#fff' }}>ملاحظة / سبب التعذر في آخر محاولة:</strong>
                  <div>{selectedPost.error}</div>
                </div>
              </div>
            )}

            {/* Platform Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '700' }}>
                المنصات المستهدفة للنشر:
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const exists = editForm.platforms.includes('facebook');
                    const updated = exists ? editForm.platforms.filter((p) => p !== 'facebook') : [...editForm.platforms, 'facebook'];
                    setEditForm({ ...editForm, platforms: updated });
                  }}
                  className={`btn ${editForm.platforms.includes('facebook') ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '10px' }}
                >
                  <Facebook size={16} />
                  <span>صفحة فيسبوك {editForm.platforms.includes('facebook') ? '✔' : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const exists = editForm.platforms.includes('instagram');
                    const updated = exists ? editForm.platforms.filter((p) => p !== 'instagram') : [...editForm.platforms, 'instagram'];
                    setEditForm({ ...editForm, platforms: updated });
                  }}
                  className={`btn ${editForm.platforms.includes('instagram') ? 'btn-ai' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '10px' }}
                >
                  <Instagram size={16} />
                  <span>حساب إنستغرام {editForm.platforms.includes('instagram') ? '✔' : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const exists = editForm.platforms.includes('whatsapp');
                    const updated = exists ? editForm.platforms.filter((p) => p !== 'whatsapp') : [...editForm.platforms, 'whatsapp'];
                    setEditForm({ ...editForm, platforms: updated });
                  }}
                  className={`btn ${editForm.platforms.includes('whatsapp') ? 'btn-whatsapp' : 'btn-secondary'}`}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: editForm.platforms.includes('whatsapp') ? 'rgba(37, 211, 102, 0.2)' : undefined,
                    borderColor: editForm.platforms.includes('whatsapp') ? '#25D366' : undefined,
                    color: editForm.platforms.includes('whatsapp') ? '#25D366' : undefined,
                  }}
                >
                  <MessageSquare size={16} />
                  <span>واتساب CRM {editForm.platforms.includes('whatsapp') ? '✔' : ''}</span>
                </button>
              </div>

              {/* Instagram URL Warning Tip */}
              {editForm.platforms.includes('instagram') && (
                <div
                  style={{
                    background: 'rgba(225, 48, 108, 0.1)',
                    border: '1px solid rgba(225, 48, 108, 0.3)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginTop: '10px',
                    fontSize: '0.8rem',
                    color: '#F472B6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <span>💡 خوارزمية إنستغرام تمنع وضع روابط خارجية في الكابشن. اضغط على زر التنظيف بالأسفل لضمان النشر.</span>
                  <button
                    type="button"
                    onClick={handleSanitizeLinksForInstagram}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap', borderColor: '#E1306C', color: '#fff' }}
                  >
                    🧹 تنظيف الروابط الآن
                  </button>
                </div>
              )}
            </div>

            {/* Post Content */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                  نص ومحتوى المنشور:
                </label>
                <button
                  type="button"
                  onClick={handleSanitizeLinksForInstagram}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.78rem', color: '#38BDF8' }}
                >
                  استبدال الروابط بـ "الرابط في البايو 🔗"
                </button>
              </div>
              <textarea
                className="textarea"
                style={{ height: '180px', lineHeight: '1.6', fontSize: '0.92rem' }}
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              />
            </div>

            {/* Media Image URL & Direct Upload */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                  صورة المنشور (Media Image):
                </label>

                {/* Hidden File Input for Edit Modal */}
                <input
                  type="file"
                  ref={editFileInputRef}
                  style={{ display: 'none' }}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleFileUpload(e, true)}
                />

                <button
                  type="button"
                  onClick={() => editFileInputRef.current?.click()}
                  disabled={isUploading}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '0.78rem',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Upload size={14} />
                  <span>{isUploading ? 'جاري الرفع...' : '📁 رفع صورة جديدة من جهازك'}</span>
                </button>
              </div>

              <input
                type="text"
                className="input"
                placeholder="https://... أو /gemini_pro.png"
                value={editForm.mediaUrl}
                onChange={(e) => setEditForm({ ...editForm, mediaUrl: e.target.value })}
              />

              {editForm.mediaUrl && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src={editForm.mediaUrl}
                      alt="Post Thumbnail"
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#10B981' }}>✓ تم إرفاق الصورة بنجاح</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {editForm.mediaUrl}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, mediaUrl: '' })}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}
                  >
                    إزالة ✕
                  </button>
                </div>
              )}
            </div>

            {/* Schedule Date & Time */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '700' }}>
                توقيت الجدولة (تاريخ ووقت النشر):
              </label>
              <input
                type="datetime-local"
                className="input"
                value={editForm.scheduledDate}
                onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
              />
            </div>

            {/* Published Analytics Details if already published */}
            {selectedPost.status === 'published' && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#10B981' }}>
                      📊 إحصائيات وتفاصيل النشر المباشر:
                    </span>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      🟢 متصل مباشرة بـ Meta Graph API
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isSyncingMetrics}
                    onClick={() => handleSyncPostMetrics(selectedPost.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="تحديث الأرقام الفعلية من فيسبوك وإنستغرام الآن"
                  >
                    <RefreshCw size={13} className={isSyncingMetrics ? 'spin' : ''} />
                    <span>{isSyncingMetrics ? 'جاري التحديث...' : '🔄 تحديث الإحصائيات الحية'}</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                  <div style={{ background: 'var(--bg-surface-high)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الوصول</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{selectedPost.metrics?.reach || 0}</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-high)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الإعجابات</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10B981' }}>{selectedPost.metrics?.likes || 0}</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-high)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>التعليقات</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{selectedPost.metrics?.comments || 0}</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface-high)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>المشاركات</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{selectedPost.metrics?.shares || 0}</div>
                  </div>
                </div>

                {(!selectedPost.metrics?.likes && !selectedPost.metrics?.comments) && (
                  <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '6px' }}>
                    ℹ️ المنشور حديث النشر (0 تفاعلات حالياً). بمجرد تفاعل المتابعين على فيسبوك أو إنستغرام، اضغط "تحديث الإحصائيات الحية" لجلب الأرقام فوراً.
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  disabled={isUpdatingPost}
                  onClick={handleUpdatePost}
                  className="btn btn-primary"
                  style={{ padding: '10px 22px' }}
                >
                  <Check size={16} />
                  <span>{isUpdatingPost ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}</span>
                </button>

                {selectedPost.status === 'scheduled' && (
                  <button
                    onClick={() => {
                      handlePublishNow(selectedPost.id);
                      setSelectedPost(null);
                    }}
                    className="btn btn-ai"
                    style={{ padding: '10px 20px' }}
                  >
                    <Send size={16} />
                    <span>🚀 نشر وتأكيد الآن</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    handleDeletePost(selectedPost.id);
                    setSelectedPost(null);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <Trash2 size={16} />
                  <span>حذف</span>
                </button>

                <button onClick={() => setSelectedPost(null)} className="btn btn-ghost btn-sm">
                  <span>إلغاء</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST NOTIFICATION ================= */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '28px',
            padding: '14px 22px',
            borderRadius: 'var(--radius-md)',
            background: toast.type === 'error' ? '#EF4444' : '#10B981',
            color: '#fff',
            fontWeight: '600',
            fontSize: '0.92rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
