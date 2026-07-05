// アカウント同期層。localStorage（UIの実行時ソース）と Supabase（永続・複数端末同期）を橋渡しする。
//
// モデル:
//   * UI は今まで通り localStorage を読む（オフラインでも動く）
//   * ログイン時: サーバーとローカルをマージ（回答=新しい方 / 出るかも=和集合）して両側へ反映
//   * ログイン中: 変更イベント（回答/出るかも）をデバウンスしてサーバーへプッシュ
//
// テーブルと RLS は supabase/schema_auth.sql。本人の行しか読み書きできない。

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Difficulty } from "./types";
import type { Area } from "./categories";
import {
  getProfile,
  saveProfile,
  type Profile,
  type ProfileCat,
} from "./profile";
import { getMaybeIds, setMaybeIds } from "./maybe";

interface ProfileRow {
  user_id: string;
  cats: ProfileCat[];
  areas: Area[];
  level: Difficulty | null;
  updated_at: string;
}

/** ログイン直後の双方向マージ。戻り値は表示用の同期結果。 */
export async function mergeOnLogin(
  sb: SupabaseClient,
  userId: string,
): Promise<{ maybeCount: number; profileSynced: boolean }> {
  // --- 回答（プロフィール）: 新しい方を採用 ---
  const { data: serverProfile } = await sb
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  const local = getProfile();
  let winner: Profile | null = local;
  if (serverProfile) {
    const serverAsProfile: Profile = {
      cats: serverProfile.cats ?? [],
      areas: serverProfile.areas ?? [],
      level: serverProfile.level,
      updatedAt: serverProfile.updated_at,
    };
    winner =
      local && local.updatedAt > serverProfile.updated_at
        ? local
        : serverAsProfile;
  }
  if (winner) {
    saveProfile({ cats: winner.cats, areas: winner.areas, level: winner.level });
    await sb.from("user_profiles").upsert({
      user_id: userId,
      cats: winner.cats,
      areas: winner.areas,
      level: winner.level,
    });
  }

  // --- 出るかも: ローカルとサーバーの和集合 ---
  const { data: serverMaybe } = await sb
    .from("user_maybe")
    .select("event_id")
    .eq("user_id", userId);
  const serverIds = (serverMaybe ?? []).map((r) => r.event_id as string);
  const union = [...new Set([...getMaybeIds(), ...serverIds])];
  setMaybeIds(union);
  const missing = union.filter((id) => !serverIds.includes(id));
  if (missing.length > 0) {
    await sb
      .from("user_maybe")
      .upsert(missing.map((event_id) => ({ user_id: userId, event_id })));
  }

  return { maybeCount: union.length, profileSynced: Boolean(winner) };
}

/** ログイン中の変更をサーバーへ反映（回答は上書き、出るかもは差分適用）。 */
export async function pushToServer(
  sb: SupabaseClient,
  userId: string,
): Promise<void> {
  const p = getProfile();
  if (p) {
    await sb.from("user_profiles").upsert({
      user_id: userId,
      cats: p.cats,
      areas: p.areas,
      level: p.level,
    });
  }
  const localIds = getMaybeIds();
  const { data: serverMaybe } = await sb
    .from("user_maybe")
    .select("event_id")
    .eq("user_id", userId);
  const serverIds = (serverMaybe ?? []).map((r) => r.event_id as string);
  const toAdd = localIds.filter((id) => !serverIds.includes(id));
  const toRemove = serverIds.filter((id) => !localIds.includes(id));
  if (toAdd.length > 0) {
    await sb
      .from("user_maybe")
      .upsert(toAdd.map((event_id) => ({ user_id: userId, event_id })));
  }
  if (toRemove.length > 0) {
    await sb
      .from("user_maybe")
      .delete()
      .eq("user_id", userId)
      .in("event_id", toRemove);
  }
}

/** アカウントに保存された自分のデータを完全削除（RLSにより本人の行のみ消せる）。 */
export async function deleteAccountData(
  sb: SupabaseClient,
  userId: string,
): Promise<void> {
  await sb.from("user_maybe").delete().eq("user_id", userId);
  await sb.from("user_profiles").delete().eq("user_id", userId);
}
