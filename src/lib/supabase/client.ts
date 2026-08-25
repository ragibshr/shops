import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
      (process.env.NODE_ENV !== "production"
        ? "http://localhost:54321"
        : ""),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      (process.env.NODE_ENV !== "production" ? "anon" : ""),
  )
}
