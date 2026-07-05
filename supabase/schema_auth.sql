-- STEP & RIDE — ユーザーデータ（Google ログイン）スキーマ
-- Supabase の SQL Editor にこのファイルをそのまま貼り付けて実行する。
--
-- セキュリティ方針:
--   * RLS（行レベルセキュリティ）を必ず有効化し、「本人の行しか読み書きできない」をDB層で強制。
--   * クライアントに渡るのは anon キーのみ。RLS が守るので anon キーは公開されても安全な設計。
--   * 保存するのは最小限（回答・出るかもリスト）。イベント本体は今まで通り events.json。

-- =====================================================================
-- user_profiles : オンボーディング回答（1ユーザー1行）
-- =====================================================================
create table if not exists public.user_profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  cats       jsonb not null default '[]'::jsonb,  -- ProfileCat[] 例 ["cyclocross","hillclimb"]
  areas      jsonb not null default '[]'::jsonb,  -- Area[]       例 ["関東","中部"]
  level      text check (level in ('beginner','intermediate','advanced')), -- null=どれでも
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "own profile select" on public.user_profiles;
drop policy if exists "own profile insert" on public.user_profiles;
drop policy if exists "own profile update" on public.user_profiles;
drop policy if exists "own profile delete" on public.user_profiles;

create policy "own profile select" on public.user_profiles
  for select using (auth.uid() = user_id);
create policy "own profile insert" on public.user_profiles
  for insert with check (auth.uid() = user_id);
create policy "own profile update" on public.user_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own profile delete" on public.user_profiles
  for delete using (auth.uid() = user_id);

-- =====================================================================
-- user_maybe : 出るかもリスト（1ユーザー×1イベントで1行）
-- =====================================================================
create table if not exists public.user_maybe (
  user_id    uuid not null references auth.users (id) on delete cascade,
  event_id   text not null,             -- events.json の id（例 "fuji-hillclimb-2026"）
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.user_maybe enable row level security;

drop policy if exists "own maybe select" on public.user_maybe;
drop policy if exists "own maybe insert" on public.user_maybe;
drop policy if exists "own maybe delete" on public.user_maybe;

create policy "own maybe select" on public.user_maybe
  for select using (auth.uid() = user_id);
create policy "own maybe insert" on public.user_maybe
  for insert with check (auth.uid() = user_id);
create policy "own maybe delete" on public.user_maybe
  for delete using (auth.uid() = user_id);

-- updated_at 自動更新
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_user_profiles_touch on public.user_profiles;
create trigger trg_user_profiles_touch
  before update on public.user_profiles
  for each row execute function public.touch_updated_at();
