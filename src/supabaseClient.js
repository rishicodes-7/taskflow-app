// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kncaiwgkawmudjzyqgji.supabase.co';
const supabaseAnonKey = 'sb_publishable_NtVEq5z3xH7zi76CFwq5Ew_fRPGJluj';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);