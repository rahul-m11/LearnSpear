
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const looksLikePlaceholder = (value) => {
  const v = String(value || '').trim();
  if (!v) return true;
  return (
    v.includes('your-project-ref') ||
    v.includes('your_supabase_anon_key_here') ||
    v.includes('your-supabase-anon-key')
  );
};

const supabaseEnvValid =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !looksLikePlaceholder(supabaseUrl) &&
  !looksLikePlaceholder(supabaseAnonKey);

if (!supabaseEnvValid) {
  console.warn('⚠️ Supabase is not configured (missing or placeholder env vars). Using local demo mode.');
}

export const supabase = supabaseEnvValid
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => supabaseEnvValid;
