import type { Metadata } from "next";
import { getNews } from "@/lib/news";
import { NewsList } from "@/components/NewsSection";

export const metadata: Metadata = {
  title: "お知らせ",
  description: "ハシロ！の更新情報・新着イベントのお知らせ一覧。",
};

export default function NewsPage() {
  const items = getNews();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <span className="kicker">News</span>
      <h1
        className="mt-3 text-2xl font-bold sm:text-3xl"
        style={{ color: "var(--ink)" }}
      >
        お知らせ
      </h1>
      <p className="mt-3 text-sm" style={{ color: "var(--sub)" }}>
        サイトの更新情報と、大会データの新着をお知らせします。
      </p>
      <div className="mt-6">
        <NewsList items={items} />
      </div>
    </div>
  );
}
