import { NextResponse } from 'next/server';
import { getStorageAsync, saveStorageAsync } from '@/lib/storage';
import { publishToFacebook, publishToInstagram } from '@/lib/metaApi';
import { publishToWhatsApp } from '@/lib/whatsappBridge';

export async function GET(request) {
  try {
    const storage = await getStorageAsync();
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const campaignId = searchParams.get('campaignId');

    let posts = [...storage.posts];

    if (platform && platform !== 'all') {
      posts = posts.filter((p) => p.platforms.includes(platform));
    }
    if (status && status !== 'all') {
      posts = posts.filter((p) => p.status === status);
    }
    if (campaignId && campaignId !== 'all') {
      posts = posts.filter((p) => p.campaignId === campaignId);
    }

    // Sort newest scheduled / published first
    posts.sort((a, b) => new Date(b.scheduledAt || b.publishedAt || 0) - new Date(a.scheduledAt || a.publishedAt || 0));

    return NextResponse.json({ success: true, posts });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { content, platforms, mediaUrls, scheduledAt, publishNow, campaignId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'محتوى المنشور مطلوب' }, { status: 400 });
    }

    const storage = await getStorageAsync();
    const metaSettings = storage.settings.meta;

    const newPost = {
      id: `post_${Date.now()}`,
      campaignId: campaignId || null,
      content: content.trim(),
      platforms: platforms && platforms.length > 0 ? platforms : ['facebook'],
      mediaUrls: mediaUrls || [],
      status: publishNow ? 'publishing' : 'scheduled',
      scheduledAt: scheduledAt || new Date().toISOString(),
      publishedAt: null,
      metaPostIds: {},
      metrics: {
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
      },
    };

    // If immediate publish
    if (publishNow) {
      const publishErrors = [];
      if (newPost.platforms.includes('facebook')) {
        try {
          const fbRes = await publishToFacebook({
            pageId: metaSettings.pageId,
            pageAccessToken: metaSettings.pageAccessToken,
            message: newPost.content,
            mediaUrl: newPost.mediaUrls[0] || null,
          });
          newPost.metaPostIds.facebook = fbRes.id;
        } catch (fbErr) {
          publishErrors.push(`فيسبوك: ${fbErr.message}`);
        }
      }

      if (newPost.platforms.includes('instagram')) {
        try {
          const igRes = await publishToInstagram({
            igAccountId: metaSettings.igAccountId,
            pageAccessToken: metaSettings.pageAccessToken,
            caption: newPost.content,
            imageUrl: newPost.mediaUrls[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
            autoSanitizeLinks: true,
          });
          newPost.metaPostIds.instagram = igRes.id;
        } catch (igErr) {
          publishErrors.push(`إنستغرام: ${igErr.message}`);
        }
      }

      if (newPost.platforms.includes('whatsapp')) {
        try {
          const waRes = await publishToWhatsApp({
            content: newPost.content,
            mediaUrl: newPost.mediaUrls[0] || null,
            title: `منشور تسويقي (${newPost.id})`,
          });
          newPost.metaPostIds.whatsapp = waRes.campaignId;
        } catch (waErr) {
          publishErrors.push(`واتساب: ${waErr.message}`);
        }
      }

      if (publishErrors.length > 0) {
        if (Object.keys(newPost.metaPostIds).length > 0) {
          newPost.status = 'published';
          newPost.error = `تم النشر جزئياً: ${publishErrors.join(' | ')}`;
        } else {
          newPost.status = 'failed';
          newPost.error = publishErrors.join(' | ');
        }
      } else {
        newPost.status = 'published';
        newPost.error = null;
      }

      newPost.publishedAt = new Date().toISOString();
      newPost.metrics = {
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
        lastSyncedAt: new Date().toISOString(),
      };
    }

    storage.posts.unshift(newPost);
    await saveStorageAsync(storage);

    return NextResponse.json({ success: true, post: newPost });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
