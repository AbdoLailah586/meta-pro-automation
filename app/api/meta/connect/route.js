import { NextResponse } from 'next/server';
import { getStorageAsync, saveStorageAsync } from '@/lib/storage';
import { testMetaConnection } from '@/lib/metaApi';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pageId, pageAccessToken, igAccountId, igUsername, isDemoMode } = body;

    const storage = await getStorageAsync();

    if (isDemoMode) {
      storage.settings.meta = {
        ...storage.settings.meta,
        pageId: pageId || 'demo_page_101',
        pageName: 'صفحة متجري الرسمية (تجريبي)',
        pageAccessToken: 'demo_token',
        igAccountId: igAccountId || 'demo_ig_202',
        igUsername: igUsername || 'my_brand_official',
        isConnected: true,
        connectedAt: new Date().toISOString(),
        pagePicture: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      };
      await saveStorageAsync(storage);
      return NextResponse.json({ success: true, meta: storage.settings.meta, message: 'تم تفعيل الوضع التجريبي بنجاح' });
    }

    if (!pageId || !pageAccessToken) {
      return NextResponse.json({ success: false, error: 'يجب إدخال Page ID و Page Access Token' }, { status: 400 });
    }

    const testRes = await testMetaConnection({ pageId, pageAccessToken });

    storage.settings.meta = {
      pageId: testRes.pageId,
      pageName: testRes.pageName,
      pageAccessToken,
      igAccountId: testRes.instagram?.id || igAccountId || process.env.META_IG_ACCOUNT_ID || '',
      igUsername: testRes.instagram?.username || igUsername || 'souq_eleshtraqat',
      isConnected: true,
      connectedAt: new Date().toISOString(),
      pagePicture: testRes.pagePicture || '',
    };

    await saveStorageAsync(storage);
    return NextResponse.json({
      success: true,
      meta: storage.settings.meta,
      message: `تم ربط الصفحة بنجاح: ${testRes.pageName}${testRes.instagram ? ` وحساب إنستغرام @${testRes.instagram.username}` : ''}`,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
