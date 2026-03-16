// Supabase client setup (browser-friendly, no bundler required)
// Requires: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
const SUPABASE_URL = "https://jbuogljwwixyibbikozj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WsIYv61QMOdLtGTCQmJFUw_VSodnGmi";

// Tracking Prevention can block third‑party storage access when loaded from a CDN.
// Use in-memory storage by default to avoid warnings during local testing.
// Set to true when serving from your own domain to persist sessions.
const PERSIST_SESSION = true;

function createMemoryStorage() {
  const memory = {};
  return {
    getItem: (key) => (key in memory ? memory[key] : null),
    setItem: (key, value) => {
      memory[key] = String(value);
    },
    removeItem: (key) => {
      delete memory[key];
    }
  };
}

function resolveStorage(preferPersistent) {
  if (!preferPersistent) {
    return createMemoryStorage();
  }
  try {
    const testKey = "__sb_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (error) {
    console.warn("Persistent storage blocked; falling back to memory.", error);
    return createMemoryStorage();
  }
}

// DEBUG: Log script load order and window.supabase status
console.log('[DEBUG] supabaseClient.js loaded');
console.log('[DEBUG] window.supabase:', window.supabase);

if (!window.supabase) {
  console.error('[DEBUG] Supabase SDK not loaded. Include the @supabase/supabase-js script before supabaseClient.js.');
} else {
  console.log('[DEBUG] Supabase SDK loaded successfully.');
}

const storage = resolveStorage(PERSIST_SESSION);
const shouldPersist = PERSIST_SESSION && storage === window.localStorage;

const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage,
        persistSession: shouldPersist,
        autoRefreshToken: shouldPersist
      }
    })
  : null;

window.supabaseClient = supabaseClient;
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_FUNCTIONS_URL = SUPABASE_URL.replace(".supabase.co", ".functions.supabase.co");
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
