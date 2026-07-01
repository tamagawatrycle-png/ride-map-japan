# RIDE MAP JAPAN

日本全国の自転車イベントを地図から発見するプラットフォーム。
編集長・田渕君幸（TRYCLE合同会社）の目線によるコメント・レビューで、既存のDBサイトと差別化する。

> 「探す」のではなく「出会う」体験設計。

## 技術スタック

- **Next.js 16**（App Router） / **React 19** / **TypeScript**
- **Tailwind CSS v4**（CSS設定方式・`app/globals.css` の `@theme`）
- **react-leaflet 5 / Leaflet 1.9**（地図。CARTO dark タイル）
- データ：`data/events.json`（将来 Supabase / Notion / Sheets へ移行可能な型を厳守）

## ページ構成

| パス | 内容 |
|---|---|
| `/` | トップ（ヒーロー + 全国マップ + 直近イベント） |
| `/events` | 一覧（カテゴリ/月/エリア/難易度フィルター・3種ソート） |
| `/events/[id]` | 詳細（基本情報・編集長コメント・概要・エントリーCTA・関連イベント／SSG） |
| `/about` | サイトについて + 編集長プロフィール |

## ディレクトリ

```
app/                ルート（layout / page / events / about / not-found）
components/          Header, Footer, EventCard, CategoryBadge,
                     JapanMap(client), MapSection(dynamic ssr:false), EventsExplorer
lib/                 types.ts / categories.ts / events.ts / format.ts
data/events.json     シードデータ（10件）
```

## 開発

```bash
npm run dev      # http://localhost:3000
npm run build    # 本番ビルド（全詳細ページを SSG）
npm start        # 本番サーバー
```

## デプロイ（Vercel）

このリポジトリを Vercel に接続すれば設定不要でデプロイ可能（Next.js 自動検出）。

```bash
# 例：Vercel CLI
npx vercel
```

## イベントの追加・編集

`data/events.json` に `lib/types.ts` の `Event` 型に従って追記する。
`id` は slug 形式（例 `fuji-hillclimb-2026`）。追加後に再ビルドすれば詳細ページが自動生成される。

- `category`: `hillclimb | race | gravel | cycling | fondo | enduro`
- `difficulty`: `beginner | intermediate | advanced`
- `editorComment` を入れると一覧カードに「★ 編集長pick」バッジが付く
- `entryDeadline` が14日以内だと「締切間近」バッジが付く

## 注意

掲載情報は各公式サイトの公開情報をもとに編集部が独自にまとめたもの。
seedデータの距離・標高・参加費等は**サンプル値**を含むため、公開前に各公式サイトで要確認。
本サイトは TRYCLE合同会社 が運営する非公式まとめサイト。
