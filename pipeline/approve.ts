// 承認UI（CLI版）。承認待ちリストを確認 → 承認で data/events.json へ昇格。
// 要件書: 田渕/橋本が承認（月1まとめて）→ DB登録 → 表示・記事化へ。
//
// 使い方:
//   npm run approve -- --list                承認待ち一覧
//   npm run approve -- --ids <key1>,<key2>   指定キーを承認 → events.json へ
//   npm run approve -- --all                 全件承認
//   npm run approve -- --reject <key1>,<key2> 指定キーを却下（破棄）

import {
  loadEvents,
  saveEvents,
  loadPending,
  savePending,
  loadProcessed,
  saveProcessed,
  type ProcessedRecord,
} from "./store";
import { shortHash } from "./dedupe";
import { centroidFor } from "./prefectures";
import type { CandidateEvent } from "./types";
import type { Event } from "../lib/types";

function parseArgs(argv: string[]) {
  const has = (f: string) => argv.includes(f);
  const get = (f: string) => {
    const i = argv.indexOf(f);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return {
    list: has("--list") || argv.length === 0,
    all: has("--all"),
    ids: get("--ids")?.split(",").map((s) => s.trim()).filter(Boolean),
    reject: get("--reject")?.split(",").map((s) => s.trim()).filter(Boolean),
  };
}

const short = (key: string) => shortHash(key); // 表示・指定用の短縮キー

function candidateToEvent(c: CandidateEvent, now: string): Event {
  const centroid = centroidFor(c.prefecture);
  const year = c.date.slice(0, 4);
  return {
    id: `ai-${year}-${short(c.dedupeKey)}`,
    name: c.name,
    date: c.date,
    dateEnd: c.dateEnd,
    entryDeadline: c.entryDeadline,
    location: `${c.prefecture}${c.location ? " " + c.location : ""}`,
    lat: centroid?.lat ?? 36.2,
    lng: centroid?.lng ?? 138.2,
    category: c.category,
    distance: c.distance,
    elevation: c.elevation,
    fee: c.fee,
    difficulty: c.difficulty,
    description: c.description,
    officialUrl: c.officialUrl,
    tags: c.confidence === "low" ? ["要確認"] : undefined,
    createdAt: now,
    updatedAt: now,
  };
}

function printList(pending: CandidateEvent[]) {
  if (pending.length === 0) {
    console.log("承認待ちはありません。");
    return;
  }
  console.log(`承認待ち ${pending.length} 件:\n`);
  for (const c of pending) {
    console.log(`[${short(c.dedupeKey)}] ${c.name}`);
    console.log(`   ${c.date}  ${c.prefecture} ${c.location}  ${c.category}  conf=${c.confidence}  src=${c.sourceId}`);
    console.log(`   ${c.officialUrl}`);
    console.log(`   ${c.description}\n`);
  }
  console.log("承認: npm run approve -- --ids <短縮キー,…>  /  全承認: --all  /  却下: --reject <短縮キー,…>");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const pending = await loadPending();

  if (args.list && !args.all && !args.ids && !args.reject) {
    printList(pending);
    return;
  }

  const now = new Date().toISOString();
  const matchSet = (keys?: string[]) =>
    (c: CandidateEvent) => !keys || keys.includes(short(c.dedupeKey));

  // 却下
  if (args.reject) {
    const rejected = pending.filter(matchSet(args.reject));
    const remaining = pending.filter((c) => !rejected.includes(c));
    const processed = await loadProcessed();
    for (const c of rejected) processed.push({ dedupeKey: c.dedupeKey, name: c.name, status: "rejected", at: now } as ProcessedRecord);
    await savePending(remaining);
    await saveProcessed(processed);
    console.log(`✗ 却下 ${rejected.length} 件（pending残 ${remaining.length}）`);
    return;
  }

  // 承認
  const toApprove = args.all ? pending : pending.filter(matchSet(args.ids));
  if (toApprove.length === 0) {
    console.log("対象がありません。--list で短縮キーを確認してください。");
    return;
  }

  const events = await loadEvents();
  const existingIds = new Set(events.map((e) => e.id));
  const processed = await loadProcessed();
  let promoted = 0;

  for (const c of toApprove) {
    const ev = candidateToEvent(c, now);
    if (existingIds.has(ev.id)) continue;
    events.push(ev);
    existingIds.add(ev.id);
    processed.push({ dedupeKey: c.dedupeKey, name: c.name, status: "approved", at: now, eventId: ev.id });
    promoted++;
  }

  const approvedKeys = new Set(toApprove.map((c) => c.dedupeKey));
  const remaining = pending.filter((c) => !approvedKeys.has(c.dedupeKey));

  await saveEvents(events);
  await savePending(remaining);
  await saveProcessed(processed);

  console.log(`✓ 承認 ${promoted} 件を data/events.json へ昇格（総events ${events.length} / pending残 ${remaining.length}）`);
  console.log("  反映: npm run build で詳細ページを再生成、または npm run dev で確認。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
