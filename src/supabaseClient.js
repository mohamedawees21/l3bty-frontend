import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");

}
console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY:", supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);