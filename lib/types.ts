// STEP & RIDE — イベントデータ型
// 将来の DB 移行（Supabase / Notion / Google Sheets）を考慮し、この型に厳密に従う。
// 正規化カテゴリは schema.sql の CHECK と対応。表示名は app 独自ラベル、
// 括弧内は仕様書（DB_SPEC.md）§5 の呼称:
//   race=road / cycling=longride / fondo=granfondo。

export type EventCategory =
  | "hillclimb" // ヒルクライム
  | "race" // ロードレース（spec: road）
  | "gravel" // グラベル
  | "cycling" // ロングライド（spec: longride）
  | "fondo" // グランフォンド（spec: granfondo）
  | "enduro" // 耐久レース（エンデューロ）
  | "cyclocross" // シクロクロス
  | "mtb_xc" // MTB クロスカントリー
  | "mtb_dh" // MTB ダウンヒル
  | "local_ride" // 草イベント・自主ライド
  | "other"; // その他

// 出し分けモード（DB_SPEC.md §1）。
//   main  = 連盟/主催の公式大会。フル事実を保持し official_url へ送客。
//   local = アグリゲーターにしか無い小規模ライド。最小限の事実＋source_url へ送客。
export type EventMode = "main" | "local";

// 地域タグ（DB_SPEC.md §6・TRYCLE 近郊フィルタ用）。
export type RegionTag = "tama" | "kanto" | "national";

// リンク送客方針（DB_SPEC.md §2）。
export type LinkTarget = "official" | "source";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Event = {
  id: string; // slug形式 例: "fuji-hillclimb-2026"
  mode?: EventMode; // 既定 "main"（未指定は main 扱い）
  name: string; // イベント名
  nameNormalized?: string; // 名寄せキー（記号/回次除去・小文字化）
  date: string; // ISO 8601 "2026-06-07"
  dateEnd?: string; // 複数日開催の場合
  entryDeadline?: string; // エントリー締切日
  location: string; // 開催地（都道府県＋市区町村）
  lat: number; // 緯度（地図ピン用）
  lng: number; // 経度（地図ピン用）
  category: EventCategory;
  regionTag?: RegionTag; // 会場県から判定
  distance?: string; // 例: "24km"
  elevation?: string; // 例: "1,270m"
  capacity?: string; // 定員
  fee?: string; // 参加費
  difficulty?: Difficulty;
  description?: string; // イベント概要（自分の言葉で記述）。local は空。
  editorComment?: string; // 田渕コメント（任意）
  editorAttended?: boolean; // 田渕が出走経験あり
  officialUrl?: string; // 公式サイトURL（main の送客先）
  sourceUrl?: string; // 取得元ページ（local の送客先）
  linkTarget?: LinkTarget; // 既定は main→official / local→source
  sourceId?: string; // sources.json のどのソース由来か
  tags?: string[]; // 自由タグ 例: ["世界遺産", "グルメ充実"]
  featured?: boolean; // おすすめフラグ（is_featured）
  createdAt: string;
  updatedAt: string;
};
