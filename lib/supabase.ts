import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type LeadRecord = {
  id?: string;
  audit_id: string;
  email: string;
  company_name?: string;
  role?: string;
  team_size?: number;
  monthly_savings: number;
  annual_savings: number;
  audit_data: object;
  created_at?: string;
};
