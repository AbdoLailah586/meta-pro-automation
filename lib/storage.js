import fs from 'fs';
import path from 'path';
import { fetchMetaFromDb, saveMetaToDb } from './neonMetaSchema';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(DATA_DIR, 'local-storage.json');

// Default initial state populated from environment variables
function getDefaultData() {
  const token = process.env.META_PAGE_ACCESS_TOKEN || '';
  const pageId = process.env.META_PAGE_ID || '';
  const igId = process.env.META_IG_ACCOUNT_ID || '';

  return {
    settings: {
      meta: {
        pageId: pageId,
        pageName: 'سوق الاشتراكات - Souq Al-Ishtirakat',
        pageAccessToken: token,
        igAccountId: igId,
        igUsername: 'souq_eleshtraqat',
        isConnected: Boolean(token && pageId),
        connectedAt: token ? new Date().toISOString() : null,
        pagePicture: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      },
      ai: {
        openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
        preferredModel: process.env.DEFAULT_AI_MODEL || 'meta-llama/llama-3-8b-instruct:free',
        defaultTone: 'marketing',
        defaultLanguage: 'ar',
      },
    },
    campaigns: [],
    posts: [],
  };
}

let memoryCache = null;
let isDbSynced = false;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // In serverless environments like Vercel, read-only is normal
  }
}

export function getStorage() {
  if (memoryCache) {
    return memoryCache;
  }

  ensureDataDir();
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, 'utf-8');
      memoryCache = JSON.parse(content);
      return memoryCache;
    }
  } catch (err) {}

  memoryCache = getDefaultData();
  return memoryCache;
}

export async function getStorageAsync() {
  try {
    const dbData = await fetchMetaFromDb();
    if (dbData) {
      const defaults = getDefaultData();
      memoryCache = {
        ...defaults,
        ...dbData,
        settings: {
          meta: {
            ...defaults.settings.meta,
            ...dbData.settings?.meta,
            // Fallback to defaults/env if DB value is empty
            pageId: dbData.settings?.meta?.pageId || defaults.settings.meta.pageId,
            pageAccessToken: dbData.settings?.meta?.pageAccessToken || defaults.settings.meta.pageAccessToken,
            igAccountId: dbData.settings?.meta?.igAccountId || defaults.settings.meta.igAccountId,
            igUsername: dbData.settings?.meta?.igUsername || defaults.settings.meta.igUsername,
            isConnected: Boolean(dbData.settings?.meta?.pageAccessToken || defaults.settings.meta.pageAccessToken),
          },
          ai: {
            ...defaults.settings.ai,
            ...dbData.settings?.ai,
            openRouterApiKey: dbData.settings?.ai?.openRouterApiKey || defaults.settings.ai.openRouterApiKey,
          },
        },
        campaigns: dbData.campaigns || [],
        posts: dbData.posts || [],
      };
      isDbSynced = true;
      return memoryCache;
    }
  } catch (err) {
    console.warn('[Storage] DB async load notice:', err.message);
  }

  return getStorage();
}

export function saveStorage(data) {
  memoryCache = data;
  ensureDataDir();

  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {}

  // Trigger DB save in background
  saveMetaToDb(data).catch((err) => {
    console.warn('[Storage] DB save notice:', err.message);
  });

  return memoryCache;
}

export async function saveStorageAsync(data) {
  memoryCache = data;
  ensureDataDir();

  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {}

  await saveMetaToDb(data);
  return memoryCache;
}
