// 巡回ソース（要件書 §6.3）。
// 方式: AI収集(C軸)を主軸 + 取得可能なRSS/カレンダー(D軸)で補完。
// スクレイピング(B軸)は規約・著作権・脆弱性リスクから採用しない。
// → ここに並ぶのは「Claudeのweb検索に渡す探索アンカー」であり、HTMLを直接掻き出す対象ではない。
//
// 初期カバー範囲（§6.3 要・田渕の意思決定）は region で制御:
//   "nationwide" = 全国メジャー / "kanto" = 関東中心。collect.ts の --region で絞れる。

export type SourceKind = "search" | "calendar" | "rss";
export type SourceRegion = "nationwide" | "kanto" | "other";

export interface Source {
  id: string;
  name: string;
  kind: SourceKind;
  /** kind==="search": 検索意図。kind==="calendar"/"rss": 取得元URL。 */
  query: string;
  region: SourceRegion;
  enabled: boolean;
  notes?: string;
}

export const SOURCES: Source[] = [
  // ── 全国メジャー大会・主催団体（AI検索アンカー） ──
  { id: "jbcf", name: "JBCF（全日本実業団自転車競技連盟）", kind: "search", query: "JBCF ロードレース 2026 開催スケジュール 出場可能 市民", region: "nationwide", enabled: true, notes: "競技系。監督会議・カテゴリ等のメタ情報も拾う" },
  { id: "tour-de-okinawa", name: "ツール・ド・おきなわ", kind: "search", query: "ツール・ド・おきなわ 2026 市民レース エントリー 日程 コース", region: "nationwide", enabled: true },
  { id: "fuji-hillclimb", name: "Mt.富士ヒルクライム", kind: "search", query: "富士ヒルクライム 2026 エントリー 開催日 募集要項", region: "nationwide", enabled: true },
  { id: "tour-de-nippon", name: "ツアー・オブ・ジャパン / グランフォンド系", kind: "search", query: "グランフォンド 2026 日本 エントリー受付 サイクリングイベント 全国", region: "nationwide", enabled: true },
  { id: "greatearth", name: "グレートアース / ロングライド系", kind: "search", query: "ロングライド イベント 2026 全国 エントリー サイクリング 100km", region: "nationwide", enabled: true },
  { id: "gravel-japan", name: "グラベル / アドベンチャー系", kind: "search", query: "グラベルライド イベント 2026 日本 エントリー受付中 grinduro", region: "nationwide", enabled: true },
  { id: "enduro-series", name: "耐久（エンデューロ）系", kind: "search", query: "エンデューロ 2026 サイクリング 4時間 7時間 エントリー サーキット", region: "nationwide", enabled: true },
  { id: "biwaichi", name: "ビワイチ / ロングライド観光系", kind: "search", query: "ビワイチ しまなみ ロングライド 2026 イベント エントリー", region: "nationwide", enabled: true },

  // ── 関東中心 ──
  { id: "kanto-hc", name: "関東ヒルクライム", kind: "search", query: "ヒルクライム 大会 2026 関東 群馬 栃木 山梨 エントリー", region: "kanto", enabled: true },
  { id: "kanto-criterium", name: "関東クリテリウム / 入門レース", kind: "search", query: "クリテリウム 初心者 2026 関東 サイクリング エントリー 自転車", region: "kanto", enabled: true },
  { id: "tama-river", name: "多摩・八王子近郊ライド", kind: "search", query: "サイクリングイベント 2026 東京 八王子 多摩 神奈川 エントリー", region: "kanto", enabled: true, notes: "TRYCLE拠点周辺" },

  // ── ポータル/カレンダー（取得可能なら D軸で補完。当面は検索意図として扱う） ──
  { id: "sportsentry", name: "スポーツエントリー（自転車）", kind: "search", query: "スポーツエントリー 自転車 サイクリング 2026 募集中 大会", region: "nationwide", enabled: true, notes: "公式説明文はコピーせず独自要約＋公式リンクのみ" },
  { id: "moshicom", name: "RUNNET/モシコム等 ポータル横断", kind: "search", query: "サイクリング 大会 2026 エントリー 募集 自転車イベント 一覧", region: "nationwide", enabled: false, notes: "重複が多いので既定はoff" },
];

export const enabledSources = (region?: SourceRegion) =>
  SOURCES.filter((s) => s.enabled && (!region || s.region === region));
