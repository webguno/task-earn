import { createClient } from '@supabase/supabase-js';

// Support both Vite (import.meta.env) and legacy/standard (process.env)
const getEnv = (key: string) => {
  // Cast import.meta to any to avoid TypeScript errors if vite types aren't loaded
  const meta = import.meta as any;
  if (typeof meta !== 'undefined' && meta.env) {
    return meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

// For this demo to work, we have added your provided credentials below.
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('REACT_APP_SUPABASE_URL') || 'https://adoxykmujrsemrsqbmgh.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('REACT_APP_SUPABASE_ANON_KEY') || 'sb_publishable_KH-gQg0jfvcvrjiGd0TcwQ_mf-gD5DA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);