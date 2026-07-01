import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="tabnum text-5xl font-bold" style={{ color: "var(--accent)" }}>
        404
      </p>
      <h1 className="mt-4 text-xl font-bold" style={{ color: "var(--ink)" }}>
        ページが見つかりませんでした
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--sub)" }}>
        お探しのイベントは削除されたか、URLが変更された可能性があります。
      </p>
      <div className="mt-6 flex gap-3">
        <Link className="btn" href="/events">
          イベント一覧へ
        </Link>
        <Link className="btn ghost" href="/">
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
