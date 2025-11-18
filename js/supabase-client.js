// js/supabase-client.js

// 👉 Supabase 콘솔의 Settings → API에서 복붙
const SUPABASE_URL = "https://kxbyfldxcrdegnfmzgrm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4YnlmbGR4Y3JkZWduZm16Z3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDU4MDMsImV4cCI6MjA3OTAyMTgwM30.Fj_TNEHxWnHY4TbmGEFzowUJp-5X9Gn7-0eynr8cVr4";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
