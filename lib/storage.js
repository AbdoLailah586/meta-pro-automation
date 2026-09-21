import fs from 'fs';
import path from 'path';
import { fetchMetaFromDb, saveMetaToDb } from './neonMetaSchema';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(DATA_DIR, 'local-storage.json');

// Initial default state
const initialData = {
  settings: {
    meta: {
      pageId: '',
      pageName: 'صفحة شركتي (Demo Mode)',
      pageAccessToken: '',
      igAccountId: '',
      igUsername: 'my_company_demo',
      isConnected: false,
      connectedAt: null,
      pagePicture: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    },
    ai: {
      openRouterApiKey: '',
      preferredModel: 'meta-llama/llama-3-8b-instruct:free',
      defaultTone: 'marketing',
      defaultLanguage: 'ar',
    },
  },
  campaigns: [],
  posts: [],
};

// Memory cache for serverless & low-latency execution
let memoryCache = null;
let isDbSynced = false;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // In serverless read-only environments (like Vercel), fall back to memory
  }
}

// Background sync from Neon PostgreSQL
async function syncFromDbInBackground() {
  if (isDbSynced) return;
  try {
    const dbData = await fetchMetaFromDb();
    if (dbData && dbData.posts && dbData.posts.length > 0) {
      memoryCache = {
        ...memoryCache,
        ...dbData,
        settings: {
          ...memoryCache?.settings,
          ...dbData.settings,
        },
      };
      isDbSynced = true;
    }
  } catch (e) {
    console.warn('[Storage] DB background sync notice:', e.message);
  }
}

export function getStorage() {
  ensureDataDir();

  if (memoryCache) {
    // Trigger background sync if not yet done
    if (!isDbSynced) {
      syncFromDbInBackground().catch(() => {});
    }
    return memoryCache;
  }

  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, 'utf-8');
      memoryCache = JSON.parse(content);
      syncFromDbInBackground().catch(() => {});
      return memoryCache;
    }
  } catch (err) {
    // Fall back to memoryCache if file system is restricted
  }

  memoryCache = JSON.parse(JSON.stringify(initialData));
  syncFromDbInBackground().catch(() => {});
  return memoryCache;
}

export async function getStorageAsync() {
  if (!isDbSynced) {
    const dbData = await fetchMetaFromDb();
    if (dbData) {
      memoryCache = dbData;
      isDbSynced = true;
      return memoryCache;
    }
  }
  return getStorage();
}

export function saveStorage(data) {
  memoryCache = data;
  ensureDataDir();

  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Read-only filesystem warning
  }

  // Persist to Neon PostgreSQL asynchronously
  saveMetaToDb(data).catch((err) => {
    console.warn('[Storage] Asynchronous DB save warning:', err.message);
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
