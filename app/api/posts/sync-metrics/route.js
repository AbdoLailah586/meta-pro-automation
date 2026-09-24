import { NextResponse } from 'next/server';
import { getStorageAsync, saveStorageAsync } from '@/lib/storage';
import { fetchMetaPostMetrics } from '@/lib/metaApi';

export async function POST(request) {
  try {
    let postId = null;
    try {
      const body = await request.json();
      postId = body.postId;
    } catch {
      // Body may be empty
    }

    const storage = await getStorageAsync();
    const token = storage.settings?.meta?.pageAccessToken || process.env.META_PAGE_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json({ success: false, error: 'رمز وصول Meta غير متوفر للاتصال المباشر' }, { status: 400 });
    }

    let postsToSync = [];
    if (postId) {
      const target = storage.posts.find((p) => p.id === postId);
      if (!target) {
        return NextResponse.json({ success: false, error: 'المنشور غير موجود' }, { status: 404 });
      }
      postsToSync = [target];
    } else {
      postsToSync = storage.posts.filter(
        (p) => p.status === 'published' && (p.metaPostIds?.facebook || p.metaPostIds?.instagram)
      );
    }

    const updatedPosts = [];

    for (const post of postsToSync) {
      const fbId = post.metaPostIds?.facebook || null;
      const igId = post.metaPostIds?.instagram || null;

      if (!fbId && !igId) {
        post.metrics = {
          likes: 0,
          comments: 0,
          shares: 0,
          reach: 0,
          lastSyncedAt: new Date().toISOString(),
        };
        updatedPosts.push(post);
        continue;
      }

      const realMetrics = await fetchMetaPostMetrics({
        pageAccessToken: token,
        facebookPostId: fbId,
        instagramMediaId: igId,
      });

      post.metrics = {
        likes: realMetrics.likes,
        comments: realMetrics.comments,
        shares: realMetrics.shares || 0,
        reach: realMetrics.reach,
        lastSyncedAt: realMetrics.lastSyncedAt,
        breakdown: realMetrics.breakdown,
      };

      updatedPosts.push(post);
    }

    await saveStorageAsync(storage);

    return NextResponse.json({
      success: true,
      syncedCount: updatedPosts.length,
      posts: updatedPosts,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    const storage = await getStorageAsync();
    const token = storage.settings?.meta?.pageAccessToken || process.env.META_PAGE_ACCESS_TOKEN;

    let postsToSync = [];
    if (postId) {
      const target = storage.posts.find((p) => p.id === postId);
      if (!target) {
        return NextResponse.json({ success: false, error: 'المنشور غير موجود' }, { status: 404 });
      }
      postsToSync = [target];
    } else {
      postsToSync = storage.posts.filter(
        (p) => p.status === 'published' && (p.metaPostIds?.facebook || p.metaPostIds?.instagram)
      );
    }

    if (token) {
      for (const post of postsToSync) {
        const fbId = post.metaPostIds?.facebook || null;
        const igId = post.metaPostIds?.instagram || null;

        if (fbId || igId) {
          const realMetrics = await fetchMetaPostMetrics({
            pageAccessToken: token,
            facebookPostId: fbId,
            instagramMediaId: igId,
          });

          post.metrics = {
            likes: realMetrics.likes,
            comments: realMetrics.comments,
            shares: realMetrics.shares || 0,
            reach: realMetrics.reach,
            lastSyncedAt: realMetrics.lastSyncedAt,
            breakdown: realMetrics.breakdown,
          };
        }
      }
      await saveStorageAsync(storage);
    }

    return NextResponse.json({
      success: true,
      syncedCount: postsToSync.length,
      posts: postsToSync,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
