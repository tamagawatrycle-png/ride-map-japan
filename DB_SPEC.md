# STEP & RIDE イベントDB — 実装仕様

TRYCLE合同会社 / v1.0 / 2026-07-02

このリポジトリに `sources.json`（読み込み元レジストリ）と `schema.sql`（DBスキーマ）を同梱している。
週次でイベントを取得して events（＝現行は `data/events.json`）へ UPSERT する。

## 1. モード分け（最重要）

| モード | 中身 | データソース | リンク先 | DB保持データ |
|---|---|---|---|---|
| **main**（メイン大会） | 連盟・主催の公式大会 | JBCF / AJOCC / MTBリーグ / JCF / 個別大会公式 | 公式HP（`official_url`） | フル事実（会場・費用・締切等） |
| **local**（草イベント） | アグリゲーターにしか無い小規模ライド | スポエンCYCLE / moshicom | 取得元ページ（`source_url`）へ送客 | 最小限の事実のみ（名前・日付・県・リンク） |

`events.mode` 列で判定し、UI側でタブ/モード切替する。ローカル的なUX（近所の草イベント発見）は
local モード側に寄せる。

## 2. 法的ガードレール（実装で必ず守る）

- **事実のみ扱う**：日程・会場・大会名・県などの「事実」だけを保持。紹介文・記事本文・写真・ロゴは複製/保存しない（著作権・商標）。
- **local は最小限**：local は `name / event_date / prefecture / source_url / link_target` のみ。`description` を埋めない。
- **リンク方針を守る**：`link_target` に従い、main は `official_url`、local は `source_url` へ送客。
- **robots.txt 厳守**：`sources.json` の `robots_disallow` パスは絶対に叩かない。
- **moshicom**：`/search` は禁止。個別イベント詳細ページのみ取得（`html_detail_only`）。
- **cyclowired**：`/search/` 禁止。カレンダー/記事ページのみ。
- **低速・週次**：週1回、リクエスト間隔 5秒以上、時間分散。同時大量アクセス禁止。
- **User-Agent 明示**：`sources.json` の `user_agent_default`（`STEPandRIDE-bot ...`）を設定。
- **スポエン系は高リスク**：`tos_risk: high`。規約第8条(8)で再利用に承認が必要。当面は「最小限＋送客」に限定し、将来は掲載許諾/提携を取ってからフル活用に切替。

## 3. 取得フロー（週次バッチ）

1. `sources.json` を読む（`enabled=true` のみ）
2. main ソース群を取得 → `events(mode='main')` に UPSERT（フル事実＋`official_url`）
3. local ソース群を取得 → `events(mode='local')` に UPSERT（最小限＋`source_url`）
4. 名寄せ（dedup）: `name_normalized + event_date + prefecture` で重複統合。main と local が重複した場合は main を優先（mainに昇格）
5. enrichment ソース（cyclesports/cyclowired）で `is_featured` を付与
6. `region_tag` を付与（会場県から tama/kanto/national を判定）
7. `fetch_log` に結果記録

## 4. 名寄せ（dedup）ルール

- キー: `name_normalized + event_date + prefecture`
- `name_normalized` = 大会名から記号・空白・回次（「第12回」等）を除去し全半角統一・小文字化
- スポエンCYCLE と スポーツエントリーは同一運営で重複多 → `sportsentry` は既定で `enabled:false`
- 重複時の優先度: main > local、一次ソース > アグリゲーター

## 5. カテゴリ正規化

`road / enduro / hillclimb / granfondo / longride / mtb_xc / mtb_dh / cyclocross / local_ride / other`
の10種に正規化して `category` へ格納。

> 実装補足：アプリの表示ラベルは既存の `EventCategory`（`lib/types.ts`）を正の語彙とし、
> `road=race` / `longride=cycling` / `granfondo=fondo` を別名として同一視する。
> `gravel` は近年の独立カテゴリのため10種に加えた拡張。`schema.sql` の CHECK は両表記を許容。

## 6. 地域タグ（TRYCLE活用）

`region_tag` で 多摩(`tama`)・関東(`kanto`)・全国(`national`) を判定（`lib/categories.ts: regionTagFromLocation`）。
矢野口店（川崎市多摩区）・宮ヶ瀬店（神奈川県清川村）近郊を tama とし、宮ヶ瀬店のライド企画・
週次レコメンドの「近郊フィルタ」に使う。

## 7. 同梱ファイル

- `sources.json` … 読み込み元レジストリ（「どこから取るか」の唯一の正）
- `schema.sql` … events / sources / fetch_log の DDL（将来 Supabase 移行時に流用）
- 本ファイル（`DB_SPEC.md`）… 実装ルール
- 現行の取得実装 … `pipeline/`（AI検索収集＋承認）。`pipeline/registry.ts` が `sources.json` を読む。

## 8. 未確定 / 次に決めること

- moshicom の個別イベントIDの入手経路（検索ページが叩けないため、メディア/SNS/主催者経由での発見ロジックが要設計）
- スポエンへの掲載許諾/提携を取りに行くか、当面は送客のみで割り切るか
- `region_tag` の県→タグのマッピング定義（多摩/関東の範囲確定。現状は市区町村キーワードで近似）

## 実装状況（2026-07-02 時点）

- **済**: `sources.json` / `schema.sql` / 本仕様の同梱。`events` の型拡張（mode / region_tag / source_url / link_target / カテゴリ拡張）。main 実大会の手動キュレーション投入（シクロクロス・エンデューロ・グラベル等、事実のみ・出典付き）。`region_tag` 自動付与。
- **未（Phase 2・要承認）**: `sources.json` 駆動のライブ取得（robots厳守・週次バッチ）。local アグリゲーター取得。enrichment による `is_featured` 自動付与。実DB（Supabase）移行。
