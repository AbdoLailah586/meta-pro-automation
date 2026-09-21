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
  if (!pageId || !pageAccessToken) {
    // Simulated demo publish
    return {
      success: true,
      demo: true,
      id: `fb_sim_${Date.now()}`,
      postUrl: `https://facebook.com/${pageId || 'demo'}/posts/${Date.now()}`,
    };
  }

  try {
    let endpoint = `${GRAPH_API_BASE}/${pageId}/feed`;
    let body = {
      message,
      access_token: pageAccessToken,
    };

    if (mediaUrl) {
      endpoint = `${GRAPH_API_BASE}/${pageId}/photos`;
      body = {
        caption: message,
        url: mediaUrl,
        access_token: pageAccessToken,
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
 * Instagram Content Publishing API requires 2 steps:
 * 1. Create Media Container (POST /{ig-user-id}/media)
 * 2. Publish Media Container (POST /{ig-user-id}/media_publish)
 */
export async function publishToInstagram({ igAccountId, pageAccessToken, caption, imageUrl, autoSanitizeLinks = true }) {
  if (!igAccountId || !pageAccessToken || !imageUrl) {
    // Instagram requires an image/video URL
    return {
      success: true,
      demo: true,
      id: `ig_sim_${Date.now()}`,
      postUrl: `https://instagram.com/p/${Date.now()}`,
    };
  }

  // Instagram Graph API rejects or blocks captions with raw URLs for standard accounts
  let cleanCaption = caption || '';
  if (autoSanitizeLinks) {
    cleanCaption = cleanCaption.replace(/https?:\/\/[^\s]+/gi, '🔗 (الرابط في البايو)');
  }

  try {
    // Step 1: Create Container
    let containerRes = await fetch(`${GRAPH_API_BASE}/${igAccountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: cleanCaption,
        access_token: pageAccessToken,
      }),
    });

    let containerData = await containerRes.json();
    
    // If failed due to caption/links, retry with fully stripped links
    if (containerData.error && containerData.error.message?.toLowerCase().includes('link') || containerData.error?.code === 368) {
      const strippedCaption = (caption || '').replace(/https?:\/\/[^\s]+/gi, '').trim();
      containerRes = await fetch(`${GRAPH_API_BASE}/${igAccountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: strippedCaption,
          access_token: pageAccessToken,
        }),
      });
      containerData = await containerRes.json();
    }

    if (containerData.error) {
      throw new Error(`Instagram Container Error: ${containerData.error.message}`);
    }

    const creationId = containerData.id;

    // Step 2: Publish Container
    const publishRes = await fetch(`${GRAPH_API_BASE}/${igAccountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: pageAccessToken,
      }),
    });

    const publishData = await publishRes.json();
    if (publishData.error) {
      throw new Error(`Instagram Publish Error: ${publishData.error.message}`);
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
