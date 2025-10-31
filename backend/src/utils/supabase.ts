import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Do not throw at import time in case non-upload flows run; upload path will validate and throw a clear error.
  // This module centralizes client creation.
}

export const getSupabase = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

export const getPublicUrlForKey = (bucket: string, key: string) => {
  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured.')
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${key}`
}


