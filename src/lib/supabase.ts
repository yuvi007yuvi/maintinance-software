import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ogzwkbhlzooblecqjowf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_TZyig_pH9ybVEf1_K12O5g_rbkYoeAz';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const storedUrl = localStorage.getItem('vwfms_supabase_url');
  const storedKey = localStorage.getItem('vwfms_supabase_anon_key');
  
  const url = storedUrl || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = storedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  
  return { url, anonKey };
}

let supabaseInstance: SupabaseClient | null = null;
let currentClientUrl = '';
let currentClientKey = '';

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem('vwfms_supabase_url', config.url);
  localStorage.setItem('vwfms_supabase_anon_key', config.anonKey);
  try {
    supabaseInstance = createClient(config.url, config.anonKey);
    currentClientUrl = config.url;
    currentClientKey = config.anonKey;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    supabaseInstance = null;
  }
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem('vwfms_supabase_anon_key');
  supabaseInstance = null;
  currentClientUrl = '';
  currentClientKey = '';
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }

  if (!supabaseInstance || currentClientUrl !== url || currentClientKey !== anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey);
      currentClientUrl = url;
      currentClientKey = anonKey;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url, anonKey);
    const { error } = await testClient.from('vehicles').select('id').limit(1);
    if (error) {
      // Table might not exist yet if migrations haven't run, but connection is valid
      if (error.code === '42P01' || error.message.includes('relation "vehicles" does not exist')) {
        return { 
          success: true, 
          message: 'Connected to Supabase! (Database tables need migration: run the provided schema.sql in Supabase SQL editor)' 
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected and verified database tables!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
  }
}
