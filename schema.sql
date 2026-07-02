-- STEP & RIDE イベントDB — スキーマ定義（DB_SPEC.md の唯一の正のDDL）
-- TRYCLE合同会社 / v1.0 / 2026-07-02
--
-- 現行の実体は data/events.json（SSGが読む正のDB）。
-- 将来 Supabase(Postgres) へ移行する際は、このDDLをそのまま流用する。
-- events.json の各レコードは events テーブルの1行に1:1対応する（列名は snake_case）。
--
-- カテゴリ呼称の対応（DB_SPEC.md §5 ↔ アプリ表示ラベル）:
--   road=race / longride=cycling / granfondo=fondo。
--   gravel は仕様書10種に加えたアプリ拡張（近年の独立カテゴリのため）。

-- =====================================================================
-- events : 公開イベント本体（main=公式大会 / local=草イベント）
-- =====================================================================
CREATE TABLE IF NOT EXISTS events (
  id              TEXT PRIMARY KEY,                 -- slug 例: "nobeyama-cx-2026"
  mode            TEXT NOT NULL DEFAULT 'main'
                    CHECK (mode IN ('main','local')),
  name            TEXT NOT NULL,
  name_normalized TEXT NOT NULL,                    -- 名寄せキー（記号/空白/回次除去・全半角統一・小文字化）
  category        TEXT NOT NULL
                    CHECK (category IN (
                      'road','enduro','hillclimb','granfondo','longride',
                      'mtb_xc','mtb_dh','cyclocross','gravel','local_ride','other',
                      -- アプリ表示ラベル（road/longride/granfondo の別名）を許容
                      'race','cycling','fondo'
                    )),
  event_date      DATE NOT NULL,                    -- 開催日（初日）
  date_end        DATE,                             -- 複数日開催の最終日
  entry_deadline  DATE,                             -- エントリー締切
  prefecture      TEXT NOT NULL,                    -- 例: "長野県"
  location        TEXT NOT NULL,                    -- 会場・市区町村（先頭は都道府県）
  lat             DOUBLE PRECISION,                 -- 地図ピン（無ければ県centroid）
  lng             DOUBLE PRECISION,
  region_tag      TEXT NOT NULL DEFAULT 'national'
                    CHECK (region_tag IN ('tama','kanto','national')),
  -- 以下、main のみ埋める「フル事実」。local は NULL のまま（DB_SPEC.md §2）。
  distance        TEXT,
  elevation       TEXT,
  capacity        TEXT,
  fee             TEXT,
  difficulty      TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
  description     TEXT,                             -- 独自要約2〜3文。local は NULL。
  editor_comment  TEXT,
  editor_attended BOOLEAN NOT NULL DEFAULT FALSE,
  -- 送客リンク（DB_SPEC.md §2）: main→official_url / local→source_url。
  official_url    TEXT,
  source_url      TEXT,
  link_target     TEXT NOT NULL DEFAULT 'official'
                    CHECK (link_target IN ('official','source')),
  source_id       TEXT REFERENCES sources(id),      -- どのソース由来か
  tags            JSONB NOT NULL DEFAULT '[]'::jsonb,-- 自由タグ（"JBCF","要確認" 等）
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,    -- enrichment で付与
  confidence      TEXT NOT NULL DEFAULT 'high'
                    CHECK (confidence IN ('high','medium','low')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 事実ガードレール（DB_SPEC.md §2）:
  --   local は description/editor_* を埋めない。link 先は必ず存在する。
  CHECK (mode = 'main' OR description IS NULL),
  CHECK (
    (link_target = 'official' AND official_url IS NOT NULL) OR
    (link_target = 'source'   AND source_url   IS NOT NULL)
  )
);

-- 名寄せキー（DB_SPEC.md §4）: name_normalized + event_date + prefecture で一意。
CREATE UNIQUE INDEX IF NOT EXISTS uq_events_dedupe
  ON events (name_normalized, event_date, prefecture);

CREATE INDEX IF NOT EXISTS ix_events_mode        ON events (mode);
CREATE INDEX IF NOT EXISTS ix_events_category    ON events (category);
CREATE INDEX IF NOT EXISTS ix_events_region_tag  ON events (region_tag);
CREATE INDEX IF NOT EXISTS ix_events_event_date  ON events (event_date);

-- =====================================================================
-- sources : 読み込み元レジストリ（sources.json と同構造。唯一の正）
-- =====================================================================
CREATE TABLE IF NOT EXISTS sources (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  mode               TEXT NOT NULL
                       CHECK (mode IN ('main','local','enrichment')),
  kind               TEXT NOT NULL
                       CHECK (kind IN ('official','federation','aggregator','media')),
  base_url           TEXT NOT NULL,
  enabled            BOOLEAN NOT NULL DEFAULT TRUE,
  html_detail_only   BOOLEAN NOT NULL DEFAULT FALSE,  -- 検索ページ禁止・詳細ページのみ
  robots_disallow    JSONB NOT NULL DEFAULT '[]'::jsonb, -- 叩いてはいけないパス
  tos_risk           TEXT NOT NULL DEFAULT 'low'
                       CHECK (tos_risk IN ('low','medium','high')),
  link_policy        TEXT NOT NULL
                       CHECK (link_policy IN ('official','source')),
  rate_limit_seconds INTEGER NOT NULL DEFAULT 5,       -- リクエスト間隔（最低5秒）
  user_agent         TEXT NOT NULL,
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- fetch_log : 週次バッチの取得結果（DB_SPEC.md §3-7）
-- =====================================================================
CREATE TABLE IF NOT EXISTS fetch_log (
  id            BIGSERIAL PRIMARY KEY,
  source_id     TEXT NOT NULL,
  run_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  status        TEXT NOT NULL CHECK (status IN ('ok','partial','error','skipped')),
  fetched_count INTEGER NOT NULL DEFAULT 0,
  upserted_count INTEGER NOT NULL DEFAULT 0,
  duration_ms   INTEGER,
  error         TEXT
);

CREATE INDEX IF NOT EXISTS ix_fetch_log_source ON fetch_log (source_id, run_at DESC);
