import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sanitize URL if user accidentally pasted the dashboard URL
if (supabaseUrl && supabaseUrl.includes('supabase.com/dashboard/project/')) {
  const projectId = supabaseUrl.split('/project/')[1]?.split('/')[0];
  if (projectId) {
    supabaseUrl = `https://${projectId}.supabase.co`;
    console.warn(`Detected Supabase Dashboard URL. Automatically converted to API URL: ${supabaseUrl}`);
  }
}

// Check if the values are missing or still set to placeholders
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your-project-url.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key' &&
  !supabaseUrl.includes('supabase.com/dashboard'); // Ensure it's not the dashboard URL

if (!isSupabaseConfigured) {
  console.warn('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Secrets panel.');
}

export const supabase = createClient(
  isSupabaseConfigured && supabaseUrl ? supabaseUrl : 'https://placeholder-url.supabase.co', 
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);
