// RIDE MAP JAPAN — イベントデータ型
// 将来の DB 移行（Supabase / Notion / Google Sheets）を考慮し、この型に厳密に従う。

export type EventCategory =
  | "hillclimb" // ヒルクライム
  | "race" // ロードレース
  | "gravel" // グラベル
  | "cycling" // ロングライド
  | "fondo" // グランフォンド
  | "enduro"; // 耐久レース

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Event = {
  id: string; // slug形式 例: "fuji-hillclimb-2026"
  name: string; // イベント名
  date: string; // ISO 8601 "2026-06-07"
  dateEnd?: string; // 複数日開催の場合
  entryDeadline?: string; // エントリー締切日
  location: string; // 開催地（都道府県＋市区町村）
  lat: number; // 緯度（地図ピン用）
  lng: number; // 経度（地図ピン用）
  category: EventCategory;
  distance?: string; // 例: "24km"
  elevation?: string; // 例: "1,270m"
  capacity?: string; // 定員
  fee?: string; // 参加費
  difficulty?: Difficulty;
  description: string; // イベント概要（自分の言葉で記述）
  editorComment?: string; // 田渕コメント（任意）
  editorAttended?: boolean; // 田渕が出走経験あり
  officialUrl: string; // 公式サイトURL
  tags?: string[]; // 自由タグ 例: ["世界遺産", "グルメ充実"]
  featured?: boolean; // おすすめフラグ
  createdAt: string;
  updatedAt: string;
};
