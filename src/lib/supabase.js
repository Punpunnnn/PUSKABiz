import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://yhjwcriumhfmkwqbxziz.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inloandjcml1bWhmbWt3cWJ4eml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NDM4MjksImV4cCI6MjA1MDQxOTgyOX0.8ApfZnLK2VJofRkz1Qzjnu1-n-c108HPc8u1MbEoevk"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})