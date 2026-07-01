import Link from "next/link";

// モックの <header> を移植。公開専用のため 発見/編集部 トグルは撤去。
// nav: マップ / 種別 / 特集 / サイトについて
export function Header() {
  return (
    <header className="rm-header">
      <div className="wrap hd">
        <Link className="logo" href="/">
          <span className="mk">
            <svg viewBox="0 0 24 24">
              <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.4" />
            </svg>
          </span>
          RIDE MAP JAPAN <small>β</small>
        </Link>
        <nav className="rm-nav">
          <Link href="/#explore">マップ</Link>
          <Link href="/#cats">種別</Link>
          <Link href="/#featured">特集</Link>
          <Link href="/about">サイトについて</Link>
        </nav>
        <div className="right">
          <Link className="btn sm" href="/events">
            イベント一覧
          </Link>
        </div>
      </div>
    </header>
  );
}
