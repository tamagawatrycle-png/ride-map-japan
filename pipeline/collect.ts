// 週1バッチの収集オーケストレーター（要件書 §6.3）。
//   巡回ソース → Claude＋web検索で探索 → 構造化 → 重複排除 → 承認待ちリストに格納
//
// 使い方:
//   npm run collect                 全 enabled ソースを収集（鍵が無ければDRY-RUN）
//   npm run collect -- --region kanto   関東ソースのみ
//   npm run collect -- --sources fuji-hillclimb,tour-de-okinawa
//   npm run collect -- --limit 3    1ソースあたり最大3件

import { enabledSources, SOURCES, type SourceRegion } from "./sources";
import { discover, isDryRun } from "./anthropic";
import { existingKeySet, toCandidate } from "./dedupe";
import { loadEvents, loadPending, savePending } from "./store";
import type { CandidateEvent } from "./types";

function parseArgs(argv: string[]) {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return {
    region: get("--region") as SourceRegion | undefined,
    sources: get("--sources")?.split(",").map((s) => s.trim()),
    limit: Number(get("--limit") ?? 5),
  };
}

async function main() {
  const { region, sources, limit } = parseArgs(process.argv.slice(2));

  let targets = sources
    ? SOURCES.filter((s) => sources.includes(s.id))
    : enabledSources(region);

  if (targets.length === 0) {
    console.error("対象ソースがありません。--sources / --region を確認してください。");
    process.exit(1);
  }

  console.log(`▶ RIDE MAP 収集バッチ  mode=${isDryRun ? "DRY-RUN（鍵なし）" : "LIVE"}  sources=${targets.length}  limit=${limit}/src\n`);

  const events = await loadEvents();
  const pending = await loadPending();
  const seen = existingKeySet(events, pending); // 既存events + 既存pending
  const fetchedAt = new Date().toISOString();

  const added: CandidateEvent[] = [];

  for (const source of targets) {
    process.stdout.write(`• ${source.name} … `);
    let raws;
    try {
      raws = await discover(source, limit);
    } catch (err) {
      console.log(`エラー（${(err as Error).message}）`);
      continue;
    }
    let fresh = 0;
    for (const raw of raws) {
      const cand = toCandidate(raw, source.id, fetchedAt);
      if (seen.has(cand.dedupeKey)) continue; // 既存/今バッチ重複を排除
      seen.add(cand.dedupeKey);
      pending.push(cand);
      added.push(cand);
      fresh++;
    }
    console.log(`発見${raws.length} / 新規${fresh}`);
  }

  await savePending(pending);

  console.log(`\n✓ 新規候補 ${added.length} 件を承認待ちに追加（pending合計 ${pending.length}）`);
  if (added.length) {
    console.log("  次の操作: npm run approve -- --list  → 内容確認 → npm run approve -- --ids <key…> / --all");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
