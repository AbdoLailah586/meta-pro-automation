/**
 * Meta Graph API Client for Facebook Pages & Instagram Content Publishing
 * Meta Graph API Version: v21.0
 */

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

/**
 * Validate Page Token and fetch linked Instagram Business Account
 */
export async function testMetaConnection({ pageId, pageAccessToken }) {
  if (!pageId || !pageAccessToken) {
    throw new Error('يجب توفير معرف الصفحة (Page ID) ورمز الوصول (Page Access Token)');
  }

  try {
    const url = `${GRAPH_API_BASE}/${pageId}?fields=id,name,picture,fan_count,instagram_business_account{id,username,profile_picture_url}&access_token=${pageAccessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      throw new Error(`خطأ من Meta Graph API: ${data.error.message}`);
    }

    return {
      success: true,
      pageId: data.id,
      pageName: data.name,
      pagePicture: data.picture?.data?.url || '',
      followersCount: data.fan_count || 0,
      instagram: data.instagram_business_account
        ? {
            id: data.instagram_business_account.id,
            username: data.instagram_business_account.username,
            profilePicture: data.instagram_business_account.profile_picture_url || '',
          }
        : null,
    };
  } catch (err) {
    throw new Error(err.message || 'فشل الاتصال بـ Meta Graph API');
  }
}

/**
 * Publish post to Facebook Page
 */
export async function publishToFacebook({ pageId, pageAccessToken, message, mediaUrl }) {
  const pId = pageId || process.env.META_PAGE_ID;
  const token = pageAccessToken || process.env.META_PAGE_ACCESS_TOKEN;

  if (!pId || !token) {
    throw new Error('لم يتم العثور على معرف صفحة فيسبوك أو رمز الوصول (Token)');
  }

  try {
    let endpoint = `${GRAPH_API_BASE}/${pId}/feed`;
    let body = {
      message: message || '',
      access_token: token,
    };

    if (mediaUrl) {
      let finalMediaUrl = mediaUrl;
      if (finalMediaUrl.startsWith('/')) {
        finalMediaUrl = `https://meta-auto-pro.vercel.app${finalMediaUrl}`;
      }
      endpoint = `${GRAPH_API_BASE}/${pId}/photos`;
      body = {
        url: finalMediaUrl,
        caption: message || '',
        access_token: token,
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.error) {
      throw new Error(`Facebook API Error: ${data.error.message}`);
    }

    return {
      success: true,
      id: data.id || data.post_id,
      postUrl: `https://facebook.com/${data.id || data.post_id}`,
    };
  } catch (err) {
    throw new Error(err.message || 'فشل النشر على فيسبوك');
  }
}

/**
 * Publish post to Instagram Business Account
 * Instagram Content Publishing API requires:
 * 1. Create Media Container (POST /{ig-user-id}/media)
 * 2. Poll container status until FINISHED
 * 3. Publish Media Container (POST /{ig-user-id}/media_publish)
 */
export async function publishToInstagram({ igAccountId, pageAccessToken, caption, imageUrl, autoSanitizeLinks = true }) {
  const token = pageAccessToken || process.env.META_PAGE_ACCESS_TOKEN;
  const accountId = igAccountId || process.env.META_IG_ACCOUNT_ID;

  if (!accountId || !token) {
    throw new Error('لم يتم العثور على معرف حساب إنستغرام أو رمز الوصول (Token). يرجى التأكد من ربط حساب إنستغرام.');
  }

  // Ensure high quality public image for Instagram
  let finalImageUrl = imageUrl;
  if (!finalImageUrl || typeof finalImageUrl !== 'string' || finalImageUrl.trim() === '') {
    finalImageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80';
  } else if (finalImageUrl.startsWith('/')) {
    finalImageUrl = `https://meta-auto-pro.vercel.app${finalImageUrl}`;
  }

  // Instagram Graph API rejects or blocks captions with raw URLs for standard accounts
  let cleanCaption = caption || '';
  if (autoSanitizeLinks) {
    cleanCaption = cleanCaption.replace(/https?:\/\/[^\s]+/gi, '🔗 (الرابط في البايو)');
  }

  try {
    // Step 1: Create Container
    let containerRes = await fetch(`${GRAPH_API_BASE}/${accountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: finalImageUrl,
        caption: cleanCaption,
        access_token: token,
      }),
    });

    let containerData = await containerRes.json();

    // If failed due to caption/links, retry with fully stripped links
    if (containerData.error && (containerData.error.message?.toLowerCase().includes('link') || containerData.error?.code === 368)) {
      const strippedCaption = (caption || '').replace(/https?:\/\/[^\s]+/gi, '').trim();
      containerRes = await fetch(`${GRAPH_API_BASE}/${accountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: finalImageUrl,
          caption: strippedCaption,
          access_token: token,
        }),
      });
      containerData = await containerRes.json();
    }

    if (containerData.error) {
      throw new Error(`خطأ إنشاء منشور إنستغرام: ${containerData.error.message}`);
    }

    const creationId = containerData.id;

    // Step 2: Poll Container Status until FINISHED
    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const statusRes = await fetch(
        `${GRAPH_API_BASE}/${creationId}?fields=status_code,status&access_token=${token}`
      );
      const statusData = await statusRes.json();
      if (statusData.status_code === 'FINISHED') {
        break;
      }
      if (statusData.status_code === 'ERROR') {
        throw new Error(`فشل معالجة صورة إنستغرام: ${statusData.status || 'خطأ غير معروف في الصورة'}`);
      }
    }

    // Step 3: Publish Container
    const publishRes = await fetch(`${GRAPH_API_BASE}/${accountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: token,
      }),
    });

    const publishData = await publishRes.json();
    if (publishData.error) {
      throw new Error(`خطأ نشر إنستغرام: ${publishData.error.message}`);
    }

    return {
      success: true,
      id: publishData.id,
      postUrl: `https://instagram.com/p/${publishData.id}`,
    };
  } catch (err) {
    throw new Error(err.message || 'فشل النشر على إنستغرام');
  }
}
