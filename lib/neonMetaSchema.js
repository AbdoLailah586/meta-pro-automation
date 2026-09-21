import pg from 'pg';
const { Pool } = pg;

let pool = null;

export function getMetaDbPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

let isInitialized = false;

export async function initMetaTables() {
  if (isInitialized) return true;
  const p = getMetaDbPool();
  if (!p) return false;

  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS public.meta_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.meta_campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        objective TEXT,
        budget TEXT,
        start_date TEXT,
        end_date TEXT,
        status TEXT DEFAULT 'active',
        color TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.meta_posts (
        id TEXT PRIMARY KEY,
        campaign_id TEXT,
        content TEXT,
        platforms JSONB,
        media_urls JSONB,
        status TEXT DEFAULT 'draft',
        scheduled_at TIMESTAMP WITH TIME ZONE,
        published_at TIMESTAMP WITH TIME ZONE,
        metrics JSONB,
        meta_post_ids JSONB,
        error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_meta_posts_status ON public.meta_posts(status);
      CREATE INDEX IF NOT EXISTS idx_meta_posts_campaign ON public.meta_posts(campaign_id);
    `);
    isInitialized = true;
    return true;
  } catch (err) {
    console.warn('[Neon Meta] Schema init warning:', err.message);
    return false;
  }
}

export async function fetchMetaFromDb() {
  const p = getMetaDbPool();
  if (!p) return null;

  try {
    await initMetaTables();

    // 1. Fetch settings
    const settingsRes = await p.query('SELECT key, value FROM public.meta_settings');
    const settings = {};
    for (const r of settingsRes.rows) {
      settings[r.key] = r.value;
    }

    // 2. Fetch campaigns
    const campRes = await p.query('SELECT * FROM public.meta_campaigns ORDER BY created_at DESC');
    const campaigns = campRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      objective: r.objective,
      budget: r.budget,
      startDate: r.start_date,
      endDate: r.end_date,
      status: r.status,
      color: r.color,
      createdAt: r.created_at,
    }));

    // 3. Fetch posts
    const postsRes = await p.query('SELECT * FROM public.meta_posts ORDER BY created_at DESC');
    const posts = postsRes.rows.map(r => ({
      id: r.id,
      campaignId: r.campaign_id,
      content: r.content,
      platforms: r.platforms || [],
      mediaUrls: r.media_urls || [],
      status: r.status,
      scheduledAt: r.scheduled_at,
      publishedAt: r.published_at,
      metrics: r.metrics || { likes: 0, comments: 0, shares: 0, reach: 0 },
      metaPostIds: r.meta_post_ids || {},
      error: r.error,
      createdAt: r.created_at,
    }));

    if (postsRes.rowCount === 0 && campRes.rowCount === 0 && settingsRes.rowCount === 0) {
      return null; // DB is empty, needs seeding
    }

    return {
      settings: {
        meta: settings.meta || {},
        ai: settings.ai || {},
      },
      campaigns,
      posts,
    };
  } catch (err) {
    console.warn('[Neon Meta] Fetch error, falling back to local storage:', err.message);
    return null;
  }
}

export async function saveMetaToDb(data) {
  const p = getMetaDbPool();
  if (!p || !data) return false;

  try {
    await initMetaTables();

    // 1. Save settings
    if (data.settings) {
      if (data.settings.meta) {
        await p.query(
          `INSERT INTO public.meta_settings (key, value, updated_at)
           VALUES ('meta', $1, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [JSON.stringify(data.settings.meta)]
        );
      }
      if (data.settings.ai) {
        await p.query(
          `INSERT INTO public.meta_settings (key, value, updated_at)
           VALUES ('ai', $1, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [JSON.stringify(data.settings.ai)]
        );
      }
    }

    // 2. Save campaigns
    if (Array.isArray(data.campaigns)) {
      for (const c of data.campaigns) {
        await p.query(
          `INSERT INTO public.meta_campaigns (id, name, objective, budget, start_date, end_date, status, color)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             objective = EXCLUDED.objective,
             budget = EXCLUDED.budget,
             start_date = EXCLUDED.start_date,
             end_date = EXCLUDED.end_date,
             status = EXCLUDED.status,
             color = EXCLUDED.color`,
          [c.id, c.name, c.objective, c.budget, c.startDate, c.endDate, c.status || 'active', c.color]
        );
      }
    }

    // 3. Save posts
    if (Array.isArray(data.posts)) {
      for (const post of data.posts) {
        await p.query(
          `INSERT INTO public.meta_posts (id, campaign_id, content, platforms, media_urls, status, scheduled_at, published_at, metrics, meta_post_ids, error)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             campaign_id = EXCLUDED.campaign_id,
             content = EXCLUDED.content,
             platforms = EXCLUDED.platforms,
             media_urls = EXCLUDED.media_urls,
             status = EXCLUDED.status,
             scheduled_at = EXCLUDED.scheduled_at,
             published_at = EXCLUDED.published_at,
             metrics = EXCLUDED.metrics,
             meta_post_ids = EXCLUDED.meta_post_ids,
             error = EXCLUDED.error`,
          [
            post.id,
            post.campaignId,
            post.content,
            JSON.stringify(post.platforms || []),
            JSON.stringify(post.mediaUrls || []),
            post.status || 'draft',
            post.scheduledAt || null,
            post.publishedAt || null,
            JSON.stringify(post.metrics || {}),
            JSON.stringify(post.metaPostIds || {}),
            post.error || null,
          ]
        );
      }
    }

    return true;
  } catch (err) {
    console.warn('[Neon Meta] Save to DB error:', err.message);
    return false;
  }
}
