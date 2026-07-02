import type { EventCategory, Difficulty, RegionTag } from "./types";

export type CategoryMeta = {
  label: string; // 日本語表示名
  color: string; // ピン / バッジ色
};

// カテゴリのメタ情報（色は要件定義 §5 準拠・白背景での視認性を上げた深めトーン）
export const CATEGORIES: Record<EventCategory, CategoryMeta> = {
  hillclimb: { label: "ヒルクライム", color: "#2f9edb" },
  race: { label: "ロードレース", color: "#e04545" },
  gravel: { label: "グラベル", color: "#d98a3d" },
  cycling: { label: "ロングライド", color: "#22ab7c" },
  fondo: { label: "グランフォンド", color: "#8e56d6" },
  enduro: { label: "耐久レース", color: "#d64f9e" },
  cyclocross: { label: "シクロクロス", color: "#7a8a3f" },
  mtb_xc: { label: "MTB クロカン", color: "#8a6238" },
  mtb_dh: { label: "MTB ダウンヒル", color: "#c0632a" },
  local_ride: { label: "草イベント", color: "#8a8f98" },
  other: { label: "その他", color: "#9aa0a6" },
};

// JBCF はカテゴリではなくタグ絞り込みだが、UI上は色分けして見せる。
// （差し色オレンジとは別系統の、実業団らしい濃青。）
export const JBCF_COLOR = "#3557b7";

export const CATEGORY_ORDER: EventCategory[] = [
  "hillclimb",
  "race",
  "gravel",
  "cycling",
  "fondo",
  "enduro",
  "cyclocross",
  "mtb_xc",
  "mtb_dh",
  "local_ride",
  "other",
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

// region_tag（DB_SPEC.md §6）: 多摩(tama) / 関東(kanto) / 全国(national)。
// TRYCLE拠点（矢野口=川崎市多摩区、宮ヶ瀬=神奈川県愛甲郡清川村）近郊を tama として、
// 宮ヶ瀬店のライド企画・週次レコメンドの「近郊フィルタ」に使う。
const KANTO_AREA: Area = "関東";
// 多摩・県境近郊の市区町村キーワード（会場文字列に含まれれば tama 判定）。
const TAMA_KEYWORDS = [
  "多摩",
  "稲城",
  "八王子",
  "日野",
  "町田",
  "府中",
  "調布",
  "立川",
  "青梅",
  "あきる野",
  "相模原",
  "愛川",
  "清川",
  "宮ヶ瀬",
  "厚木",
  "津久井",
];

export function regionTagFromLocation(location: string): RegionTag {
  if (TAMA_KEYWORDS.some((k) => location.includes(k))) return "tama";
  const area = areaFromLocation(location);
  if (area === KANTO_AREA) return "kanto";
  return "national";
}
