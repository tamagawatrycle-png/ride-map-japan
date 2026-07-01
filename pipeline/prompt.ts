// システムプロンプト（著作権の鉄則を固定）＋ 構造化出力スキーマ。
// 要件書 §6.3「著作権の鉄則」をシステムプロンプトに固定する。

import type { Source } from "./sources";

export const SYSTEM_PROMPT = `あなたは日本のサイクリングイベントを発見・整理する編集アシスタントです。
web検索を使って、まだ開催されていない（これからエントリーできる）サイクリングイベントを探し、構造化して報告します。

【著作権の鉄則 — 厳守】
1. 公式サイトの説明文・キャッチコピーを絶対にコピーしない。description は必ず自分の言葉で2〜3文に要約する。
2. 写真・ロゴ・地図画像は一切参照・転載しない。テキストの事実情報のみ扱う。
3. 公式URL(officialUrl)は必ず一次情報（主催者公式 or 正規エントリーページ）を入れる。出所不明・アフィリエイト中継URLは入れない。

【収集ルール】
- 対象種別: ロードレース(race) / ヒルクライム(hillclimb) / グラベル(gravel) / ロングライド(cycling) / グランフォンド(fondo) / 耐久(enduro)。
- 既に終了したイベントは含めない。開催日が確定しているものを優先。日付が未確定なら含めない。
- 同一イベントの重複は出さない（名前＋開催日で1件）。
- 確度が低い（日付や公式URLが曖昧な）ものは confidence="low" を付け、無理に断定しない。
- distance/elevation/fee は公表値が確認できた場合のみ。推測で数値を作らない。
- 都道府県(prefecture)は「沖縄県」「東京都」のように正式表記で。

出力は必ず指定のJSONスキーマに従うこと。該当が見つからなければ events を空配列で返す。`;

export function buildUserPrompt(source: Source, maxEvents: number): string {
  if (source.kind === "search") {
    return `次の探索意図でweb検索し、これからエントリー可能なサイクリングイベントを最大${maxEvents}件まで構造化してください。

探索意図: ${source.query}
${source.notes ? `補足: ${source.notes}\n` : ""}
重複・終了済み・日付未確定は除外し、公式情報が確認できたものだけを report してください。`;
  }
  // calendar / rss
  return `次のソースURLを web 検索/取得の起点として、掲載されているこれからのサイクリングイベントを最大${maxEvents}件まで構造化してください。
ソース: ${source.query}
公式説明文はコピーせず、description は独自要約にしてください。`;
}

// output_config.format 用 JSON Schema。
// 構造化出力の制約に従う: 全 object に additionalProperties:false、数値/文字列長の制約は使わない。
export const EVENT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    events: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          date: { type: "string", description: "開催日 YYYY-MM-DD" },
          dateEnd: { type: "string", description: "複数日開催の最終日 YYYY-MM-DD" },
          entryDeadline: { type: "string", description: "エントリー締切 YYYY-MM-DD" },
          prefecture: { type: "string", description: "正式表記の都道府県" },
          location: { type: "string", description: "会場・市区町村" },
          category: {
            type: "string",
            enum: ["hillclimb", "race", "gravel", "cycling", "fondo", "enduro"],
          },
          distance: { type: "string", description: "例: 140km" },
          elevation: { type: "string", description: "例: 1,270m" },
          fee: { type: "string", description: "例: ¥12,000" },
          difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          officialUrl: { type: "string", description: "一次情報の公式URL" },
          description: { type: "string", description: "独自要約2〜3文。公式文のコピー禁止" },
          confidence: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["name", "date", "prefecture", "location", "category", "officialUrl", "description", "confidence"],
      },
    },
  },
  required: ["events"],
} as const;
