import type { Metadata } from "next";
import { getAllEvents } from "@/lib/events";
import { EventsExplorer } from "@/components/EventsExplorer";

export const metadata: Metadata = {
  title: "イベント一覧",
  description:
    "カテゴリ・開催月・エリア・難易度で全国のサイクルイベントを絞り込み。開催日・締切・田渕おすすめ順で並び替え。",
};

export default function EventsPage() {
  const events = getAllEvents();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <span className="kicker">All events</span>
        <h1
          className="mt-2 text-2xl font-bold sm:text-3xl"
          style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}
        >
          イベント一覧
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--sub)" }}>
          条件で絞り込んで、次に出会うライドを見つけよう。
        </p>
      </header>
      <EventsExplorer events={events} />
    </div>
  );
}
