import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "チップス",
  description:
    "はじめてのイベント参加・機材・トレーニングのコツ。STEP & RIDE 編集部のノウハウ集（準備中）。",
};

// 3本柱の第2柱「チップス」— 現在は準備中のティーザーページ。
const UPCOMING = [
  {
    t: "はじめてのヒルクライム大会",
    d: "エントリーから当日の持ち物・ペース配分まで。初出場の不安をなくす完全ガイド。",
  },
  {
    t: "シクロクロスの始め方",
    d: "バイク選び・タイヤ・最初に出るべきカテゴリ。冬のレース遊びの入口。",
  },
  {
    t: "ロングライドの補給術",
    d: "100km走るための食べ方・飲み方。ハンガーノックを防ぐ計画の立て方。",
  },
  {
    t: "輪行・遠征のコツ",
    d: "パッキングから会場入りまで。遠くの大会に「出られる」ようになる知識。",
  },
];

export default function TipsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 text-center">
      <span className="kicker" style={{ justifyContent: "center" }}>
        Tips
      </span>
      <h1
        className="mt-3 text-2xl font-bold sm:text-3xl"
        style={{ color: "var(--ink)", letterSpacing: "0.06em" }}
      >
        チップス
      </h1>
      <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--sub)" }}>
        走るきっかけの「次の一歩」を支えるノウハウ集。
        <br />
        編集部が実走で得た知識を、まもなくここに公開します。
      </p>

      <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
        {UPCOMING.map((x) => (
          <div
            key={x.t}
            className="rounded-2xl border p-5"
            style={{ borderColor: "var(--line)", background: "#fff" }}
          >
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{ background: "var(--accent-weak)", color: "var(--accent-strong)" }}
            >
              準備中
            </span>
            <h2 className="mt-2.5 text-[15px] font-bold" style={{ color: "var(--ink)" }}>
              {x.t}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--sub)" }}>
              {x.d}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs" style={{ color: "var(--faint)" }}>
        公開までの間は、イベント探しからどうぞ。
      </p>
      <Link className="btn mt-3" href="/" style={{ padding: "12px 26px" }}>
        イベントを探す
      </Link>
    </div>
  );
}
