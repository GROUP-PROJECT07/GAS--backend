import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseDbUrl = process.env.SUPABASE_DB_URL;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !supabaseDbUrl) {
  throw new Error("One or more Supabase environment variables are missing!");
}

// Default client (for public operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Secure client (for server-side operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Database URL (can be used if you connect directly to Postgres with a library like pg)
export const databaseUrl = supabaseDbUrl;
