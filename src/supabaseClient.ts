import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iccafwhcwnzadztiswpe.supabase.co';
const supabaseAnonKey = 'Bsb_publishable_AhjZ6XYgTIG7a_fSFzvzlg_kHM0FX9Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);