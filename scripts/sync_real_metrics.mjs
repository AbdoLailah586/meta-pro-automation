import { getStorageAsync, saveStorageAsync } from '../lib/storage.js';
import { fetchMetaPostMetrics } from '../lib/metaApi.js';

async function main() {
  console.log('--- Starting Real Live Metrics Sync ---');
  const storage = await getStorageAsync();
  const token = storage.settings?.meta?.pageAccessToken || process.env.META_PAGE_ACCESS_TOKEN;

  console.log(`Found ${storage.posts.length} posts to inspect.`);

  let updatedCount = 0;

  for (const post of storage.posts) {
    const fbId = post.metaPostIds?.facebook || null;
    const igId = post.metaPostIds?.instagram || null;

    if (!fbId && !igId) {
      // If it's a test or local post with fake mock numbers, reset to 0
      post.metrics = {
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
        lastSyncedAt: new Date().toISOString(),
      };
      updatedCount++;
      continue;
    }

    console.log(`Syncing post ${post.id} (FB: ${fbId || 'none'}, IG: ${igId || 'none'})...`);

    const realMetrics = await fetchMetaPostMetrics({
      pageAccessToken: token,
      facebookPostId: fbId,
      instagramMediaId: igId,
    });

    console.log(`-> Result for ${post.id}: Likes=${realMetrics.likes}, Comments=${realMetrics.comments}, Reach=${realMetrics.reach}`);

    post.metrics = {
      likes: realMetrics.likes,
      comments: realMetrics.comments,
      shares: realMetrics.shares || 0,
      reach: realMetrics.reach,
      lastSyncedAt: realMetrics.lastSyncedAt,
      breakdown: realMetrics.breakdown,
    };
    updatedCount++;
  }

  await saveStorageAsync(storage);
  console.log(`--- Sync completed! Updated ${updatedCount} posts in Neon DB & storage ---`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
