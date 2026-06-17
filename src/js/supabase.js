// src/js/supabase.js
import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export function getSupabase() {
    if (!supabaseInstance) {
        const SUPABASE_URL =
    import.meta.env.VITE_SUPABASE_URL || '';

const SUPABASE_KEY =
    import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {

    console.error(
        '[Supabase] Missing environment variables'
    );
}
        supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return supabaseInstance;
}

export const supabase = getSupabase();