import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const readEnvFile = (envPath) => {
  try {
    const raw = fs.readFileSync(envPath, 'utf8');
    const lines = raw.split(/\r?\n/);
    const env = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }

    return env;
  } catch {
    return {};
  }
};

const root = process.cwd();
const envPath = path.join(root, '.env');
const fileEnv = readEnvFile(envPath);

const supabaseUrl = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to .env first.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const check = async (label, fn) => {
  try {
    const result = await fn();
    console.log(`✅ ${label}`);
    return result;
  } catch (e) {
    console.error(`❌ ${label}`);
    console.error(e?.message || e);
    process.exit(1);
  }
};

await check('Supabase reachable', async () => {
  // This is public by policy in our schema
  const { error } = await supabase.from('badges').select('badge_key').limit(1);
  if (error) throw error;
});

await check('Schema: courses readable', async () => {
  const { error } = await supabase.from('courses').select('id,title').limit(1);
  if (error) throw error;
});

await check('Schema: lessons readable', async () => {
  const { error } = await supabase.from('lessons').select('id,course_id,title').limit(1);
  if (error) throw error;
});

await check('Schema: profiles readable (public select policy)', async () => {
  const { error } = await supabase.from('profiles').select('id,role,points').limit(1);
  if (error) throw error;
});

console.log('\nBackend checks passed. Next: run the app and log in to verify RLS-protected tables (enrollments/progress/point_transactions).');
