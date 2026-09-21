import { NextResponse } from 'next/server';
import { getStorageAsync, saveStorageAsync } from '@/lib/storage';

export async function GET() {
  try {
    const storage = await getStorageAsync();
    const meta = storage.settings.meta;

    // Auto-sync fresh Page Name & Picture from Meta if connected
    if (meta.pageId && meta.pageAccessToken && meta.pageAccessToken.length > 20) {
      try {
        const checkUrl = `https://graph.facebook.com/v21.0/${meta.pageId}?fields=id,name,picture,instagram_business_account{id,username}&access_token=${meta.pageAccessToken}`;
        const res = await fetch(checkUrl, { cache: 'no-store' });
        const liveData = await res.json();
        
        if (liveData && !liveData.error && liveData.name) {
          let hasChanges = false;
          if (liveData.name !== meta.pageName) {
            meta.pageName = liveData.name;
            hasChanges = true;
          }
          if (liveData.picture?.data?.url && liveData.picture.data.url !== meta.pagePicture) {
            meta.pagePicture = liveData.picture.data.url;
            hasChanges = true;
          }
          if (liveData.instagram_business_account) {
            if (liveData.instagram_business_account.id && liveData.instagram_business_account.id !== meta.igAccountId) {
              meta.igAccountId = liveData.instagram_business_account.id;
              hasChanges = true;
            }
            if (liveData.instagram_business_account.username && liveData.instagram_business_account.username !== meta.igUsername) {
              meta.igUsername = liveData.instagram_business_account.username;
              hasChanges = true;
            }
          }
          if (hasChanges) {
            await saveStorageAsync(storage);
          }
        }
      } catch (syncErr) {
        // Silently fallback to cached info if network or offline
      }
    }

    return NextResponse.json({
      success: true,
      meta: {
        pageId: meta.pageId,
        pageName: meta.pageName,
        igAccountId: meta.igAccountId,
        igUsername: meta.igUsername,
        isConnected: Boolean(meta.pageAccessToken && meta.pageId),
        connectedAt: meta.connectedAt,
        pagePicture: meta.pagePicture,
        hasToken: Boolean(meta.pageAccessToken && meta.pageAccessToken.length > 5),
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
