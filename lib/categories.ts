import type { EventCategory, Difficulty } from "./types";

export type CategoryMeta = {
  label: string; // 日本語表示名
  color: string; // ピン / バッジ色
};

// カテゴリのメタ情報（色は要件定義 §5 準拠）
export const CATEGORIES: Record<EventCategory, CategoryMeta> = {
  hillclimb: { label: "ヒルクライム", color: "#60c0f0" },
  race: { label: "ロードレース", color: "#f06060" },
  gravel: { label: "グラベル", color: "#f0a860" },
  cycling: { label: "ロングライド", color: "#60f0b0" },
  fondo: { label: "グランフォンド", color: "#a060f0" },
  enduro: { label: "耐久レース", color: "#f060c0" },
};

export const CATEGORY_ORDER: EventCategory[] = [
  "hillclimb",
  "race",
  "gravel",
  "cycling",
  "fondo",
  "enduro",
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "初心者向け",
  intermediate: "中級",
  advanced: "上級",
};

// エリア定義（都道府県 → エリア）。フィルター用。
export type Area =
  | "北海道"
  | "東北"
  | "関東"
  | "中部"
  | "近畿"
  | "中国・四国"
  | "九州・沖縄";

export const AREA_ORDER: Area[] = [
  "北海道",
  "東北",
  "関東",
  "中部",
  "近畿",
  "中国・四国",
  "九州・沖縄",
];

const PREF_TO_AREA: Record<string, Area> = {
  北海道: "北海道",
  青森県: "東北",
  岩手県: "東北",
  宮城県: "東北",
  秋田県: "東北",
  山形県: "東北",
  福島県: "東北",
  茨城県: "関東",
  栃木県: "関東",
  群馬県: "関東",
  埼玉県: "関東",
  千葉県: "関東",
  東京都: "関東",
  神奈川県: "関東",
  新潟県: "中部",
  富山県: "中部",
  石川県: "中部",
  福井県: "中部",
  山梨県: "中部",
  長野県: "中部",
  岐阜県: "中部",
  静岡県: "中部",
  愛知県: "中部",
  三重県: "近畿",
  滋賀県: "近畿",
  京都府: "近畿",
  大阪府: "近畿",
  兵庫県: "近畿",
  奈良県: "近畿",
  和歌山県: "近畿",
  鳥取県: "中国・四国",
  島根県: "中国・四国",
  岡山県: "中国・四国",
  広島県: "中国・四国",
  山口県: "中国・四国",
  徳島県: "中国・四国",
  香川県: "中国・四国",
  愛媛県: "中国・四国",
  高知県: "中国・四国",
  福岡県: "九州・沖縄",
  佐賀県: "九州・沖縄",
  長崎県: "九州・沖縄",
  熊本県: "九州・沖縄",
  大分県: "九州・沖縄",
  宮崎県: "九州・沖縄",
  鹿児島県: "九州・沖縄",
  沖縄県: "九州・沖縄",
};

// location 文字列（先頭が都道府県）から所属エリアを判定する。
export function areaFromLocation(location: string): Area | null {
  for (const pref of Object.keys(PREF_TO_AREA)) {
    if (location.startsWith(pref)) return PREF_TO_AREA[pref];
  }
  return null;
}
