import { createClient } from "@supabase/supabase-js";

function cleanUrl(raw?: string): string {
  const fallback = "https://nnmnrqwuixssirzmecya.supabase.co";
  if (!raw) return fallback;
  let url = raw.trim().replace(/^["'`]|["'`]$/g, "");
  url = url.replace(/\/+$/, "");
  url = url.replace(/\/rest\/v1\/?$/i, "");
  url = url.replace(/\/+$/, "");
  return url || fallback;
}

function cleanKey(raw?: string): string {
  const fallback = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubW5ycXd1aXhzc2lyem1lY3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTMzNDAsImV4cCI6MjEwNDA2OTM0MH0.nJXcJTgUlWqVnc3wP9mSheYvRDtvckeJ_0kDK8Gw-XM";
  if (!raw) return fallback;
  const key = raw.trim().replace(/^["'`]|["'`]$/g, "");
  return key || fallback;
}

export const SUPABASE_URL = cleanUrl(import.meta.env.VITE_SUPABASE_URL);
export const SUPABASE_ANON_KEY = cleanKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const isSupabaseConfigured = () => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
};
