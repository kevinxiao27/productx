import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log(supabaseUrl);
  console.log(supabaseKey);
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
