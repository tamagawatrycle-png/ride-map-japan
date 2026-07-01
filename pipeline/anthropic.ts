// Claude API クライアント（要件書 §4-2 / §6.3）。
// モデル: claude-sonnet-4-6（収集・分類はSonnetで十分。Opus不要）
// サーバーサイドweb検索 + 構造化JSON出力（output_config.format）。
// ANTHROPIC_API_KEY が無い場合は DRY-RUN フィクスチャを返し、鍵なしでも全体が通る。

import Anthropic from "@anthropic-ai/sdk";
import type { Source } from "./sources";
import type { RawEvent } from "./types";
import { SYSTEM_PROMPT, buildUserPrompt, EVENT_JSON_SCHEMA } from "./prompt";

const MODEL = "claude-sonnet-4-6";
export const isDryRun = !process.env.ANTHROPIC_API_KEY;

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic());

interface DiscoverResult {
  events: RawEvent[];
}

/** 1ソースを探索して候補イベントを返す。 */
export async function discover(source: Source, maxEvents: number): Promise<RawEvent[]> {
  if (isDryRun) return dryRunFixtures(source, maxEvents);

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: buildUserPrompt(source, maxEvents) },
  ];

  // server-side web_search はサーバーループ。pause_turn の間は同じ会話を再送して継続する。
  for (let i = 0; i < 6; i++) {
    const res = await getClient().messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: EVENT_JSON_SCHEMA },
      },
      messages,
    });

    if (res.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: res.content });
      continue;
    }
    if (res.stop_reason === "refusal") {
      console.warn(`  ⚠ [${source.id}] refusal — スキップ`);
      return [];
    }

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    try {
      const parsed = JSON.parse(text) as DiscoverResult;
      return Array.isArray(parsed.events) ? parsed.events : [];
    } catch {
      console.warn(`  ⚠ [${source.id}] JSON parse失敗 — スキップ`);
      return [];
    }
  }
  console.warn(`  ⚠ [${source.id}] pause_turn上限 — 打ち切り`);
  return [];
}

// ───────── DRY-RUN フィクスチャ（鍵なしでパイプライン全体を検証するためのサンプル） ─────────
function dryRunFixtures(source: Source, maxEvents: number): RawEvent[] {
  const pool: Record<string, RawEvent[]> = {
    "fuji-hillclimb": [
      { name: "Mt.富士ヒルクライム 2026", date: "2026-06-07", entryDeadline: "2026-04-30", prefecture: "山梨県", location: "富士スバルライン（富士吉田市）", category: "hillclimb", distance: "24km", elevation: "1,270m", fee: "¥10,800", difficulty: "intermediate", officialUrl: "https://www.fujihc.jp/", description: "標高差1,270mを24kmで登る国内最大級のヒルクライム。タイム別のリング獲得が目標になり、初心者から上級者まで幅広く参加する。", confidence: "high" },
    ],
    "tour-de-okinawa": [
      { name: "ツール・ド・おきなわ 2026 市民100kmレース", date: "2026-11-08", entryDeadline: "2026-09-15", prefecture: "沖縄県", location: "名護市（沖縄本島北部）", category: "race", distance: "100km", elevation: "1,200m", fee: "¥16,000", difficulty: "advanced", officialUrl: "https://www.tour-de-okinawa.jp/", description: "本島北部のアップダウンを舞台にした市民レース。普久川ダムの登りが勝負所で、完走と上位入賞では戦略が大きく変わる。", confidence: "high" },
    ],
    "gravel-japan": [
      { name: "ニセコグラベル 2026", date: "2026-09-20", prefecture: "北海道", location: "ニセコ町・倶知安町", category: "gravel", distance: "60km / 90km", elevation: "1,000m", fee: "¥13,000", difficulty: "intermediate", officialUrl: "https://example-gravel.jp/niseko", description: "羊蹄山麓のダート林道を巡るグラベルライド。複数距離設定があり、未舗装区間に慣れたい人の入口にもなる。", confidence: "low" },
    ],
    "kanto-hc": [
      { name: "赤城山ヒルクライム大会 2026", date: "2026-09-27", entryDeadline: "2026-07-31", prefecture: "群馬県", location: "前橋市 赤城山", category: "hillclimb", distance: "20.8km", elevation: "1,300m", fee: "¥9,000", difficulty: "intermediate", officialUrl: "https://www.akagi-hc.jp/", description: "前橋市街から赤城山頂を目指す王道ヒルクライム。勾配変化が大きく、ペース配分の練習になる関東の人気大会。", confidence: "medium" },
    ],
  };
  const base = pool[source.id] ?? [
    { name: `${source.name} 関連イベント（サンプル）`, date: "2026-10-04", prefecture: "東京都", location: "（要確認）", category: "cycling", officialUrl: `https://example.com/${source.id}`, description: "DRY-RUNサンプル。ANTHROPIC_API_KEY を設定すると実検索に切り替わります。", confidence: "low" },
  ];
  return base.slice(0, maxEvents);
}
