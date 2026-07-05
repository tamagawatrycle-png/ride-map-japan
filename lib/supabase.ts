// Supabase クライアント（ブラウザ専用・シングルトン）。
// 環境変数が未設定の間は null を返し、ログインUIは「近日公開」表示に自動フォールバックする
// （＝キー投入だけで機能が有効化される設計）。
//
// セキュリティ: ここで使うのは公開前提の anon キーのみ。行の保護は
// supabase/schema_auth.sql の RLS が担う。service_role キーは絶対に使わない。

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anon);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (typeof window === "undefined") return null; // クライアント専用
  if (!client) {
    client = createClient(url!, anon!, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
