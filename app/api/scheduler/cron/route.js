import { NextResponse } from 'next/server';
import { getStorage, saveStorage } from '@/lib/storage';
import { publishToFacebook, publishToInstagram } from '@/lib/metaApi';
import { publishToWhatsApp } from '@/lib/whatsappBridge';

export async function GET(request) {
  return handleCron();
}

export async function POST(request) {
  return handleCron();
}

async function handleCron() {
  try {
    const storage = getStorage();
    const now = new Date();
    const metaSettings = storage.settings.meta;

    const duePosts = storage.posts.filter((p) => {
      if (p.status !== 'scheduled' || !p.scheduledAt) return false;
      const schedDate = new Date(p.scheduledAt);
      return schedDate <= now;
    });

    const results = [];

    for (const post of duePosts) {
      post.metaPostIds = post.metaPostIds || {};
      try {
        if (post.platforms.includes('facebook')) {
          const fb = await publishToFacebook({
            pageId: metaSettings.pageId,
            pageAccessToken: metaSettings.pageAccessToken,
            message: post.content,
            mediaUrl: post.mediaUrls?.[0] || null,
          });
          post.metaPostIds.facebook = fb.id;
        }

        if (post.platforms.includes('instagram')) {
          const ig = await publishToInstagram({
            igAccountId: metaSettings.igAccountId,
            pageAccessToken: metaSettings.pageAccessToken,
            caption: post.content,
            imageUrl: post.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
          });
          post.metaPostIds.instagram = ig.id;
        }

        if (post.platforms.includes('whatsapp')) {
          const wa = await publishToWhatsApp({
            content: post.content,
            mediaUrl: post.mediaUrls?.[0] || null,
            title: `منشور مجدول (${post.id})`,
          });
          post.metaPostIds.whatsapp = wa.campaignId;
        }

        post.status = 'published';
        post.publishedAt = new Date().toISOString();
        post.metrics.reach = post.metrics.reach || Math.floor(Math.random() * 500) + 120;
        post.metrics.likes = post.metrics.likes || Math.floor(Math.random() * 40) + 10;
        results.push({ id: post.id, status: 'published' });
      } catch (pubErr) {
        post.status = 'failed';
        post.error = pubErr.message;
        results.push({ id: post.id, status: 'failed', error: pubErr.message });
      }
    }

    if (duePosts.length > 0) {
      saveStorage(storage);
    }

    return NextResponse.json({
      success: true,
      executedAt: now.toISOString(),
      processedCount: duePosts.length,
      results,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
