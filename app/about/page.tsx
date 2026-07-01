import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "サイトについて",
  description:
    "RIDE MAP JAPAN は、全国のサイクルイベントを編集部が厳選して紹介する発見プラットフォームです。",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <span className="kicker">About</span>
      <h1
        className="mt-2 text-2xl font-bold sm:text-3xl"
        style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}
      >
        サイトについて
      </h1>

      <section
        className="mt-6 space-y-4 text-sm leading-relaxed"
        style={{ color: "#3a3d42" }}
      >
        <p>
          <strong style={{ color: "var(--ink)" }}>RIDE MAP JAPAN</strong>{" "}
          は、日本全国の自転車イベント（ロードレース・ヒルクライム・グラベル・ロングライド等）を地図から一覧できる、イベント発見プラットフォームです。
        </p>
        <p>
          既存のデータベースサイトのように「探す」のではなく、編集部の目線によるコメントやレビューを通じて次のイベントに「出会う」体験を目指しています。気になったイベントは、各公式サイトから直接エントリーできます。
        </p>
      </section>

      {/* 運営プロフィール */}
      <section
        className="mt-10 rounded-2xl p-6"
        style={{ border: "1px solid var(--line)", background: "var(--bg2)" }}
      >
        <div className="flex items-center gap-4">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
            aria-hidden
          >
            編
          </span>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
              RIDE MAP JAPAN 編集部
            </h2>
            <p className="text-sm" style={{ color: "var(--sub)" }}>
              運営：TRYCLE合同会社
            </p>
          </div>
        </div>
        <p
          className="mt-4 text-sm leading-relaxed"
          style={{ color: "#3a3d42" }}
        >
          自転車を軸にした事業を展開する TRYCLE合同会社
          が運営。ホビーレーサーとして各地のヒルクライムやロングライドに参加してきた経験をもとに、「実際に走った人の視点」でイベントを紹介します。数字や開催概要だけでは伝わらないコースの空気感や、初心者がどう挑むべきか——そんな&ldquo;出走者目線&rdquo;の情報をお届けします。
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
          掲載について
        </h2>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--sub)" }}>
          掲載情報は各公式サイトの公開情報をもとに編集部が独自にまとめたものです。開催日・参加費・エントリー締切等は変更される場合があります。必ず公式サイトにてご確認の上、お申し込みください。本サイトは
          TRYCLE合同会社 が運営する非公式まとめサイトです。
        </p>
      </section>

      <div className="mt-10">
        <Link className="btn" href="/events">
          イベントを探す →
        </Link>
      </div>
    </div>
  );
}
