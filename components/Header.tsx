import Link from "next/link";
import { FootprintCounter } from "./FootprintCounter";

// モックの <header> を移植。公開専用のため 発見/編集部 トグルは撤去。
// nav: マップ / 種別 / 特集 / サイトについて
export function Header() {
  return (
    <header className="rm-header">
      <div className="wrap hd">
        <Link className="logo" href="/">
          {/* Aタイプ: オレンジ角丸に白の「ハ!」（skew -8°のスピードタイポ） */}
          <span className="mk">
            <svg viewBox="0 0 64 64" className="mk-hashiro">
              <g transform="skewX(-8)">
                <text
                  x="17"
                  y="44"
                  fontFamily="var(--font-noto-sans-jp), 'Hiragino Sans', sans-serif"
                  fontWeight={900}
                  fontSize="30"
                  fill="#fff"
                >
                  ハ
                </text>
                <rect x="47" y="18" width="6.5" height="19" rx="3.2" fill="#fff" />
                <circle cx="50.2" cy="44" r="3.8" fill="#fff" />
              </g>
            </svg>
          </span>
          <span className="logo-txt">
            <b className="wordmark">
              ハシロ<i>！</i>
            </b>
            <small>HASHIRO STEP &amp; RIDE!</small>
          </span>
        </Link>
        <nav className="rm-nav">
          <Link href="/#explore">マップ</Link>
          <Link href="/#cats">種別</Link>
          <Link href="/#featured">特集</Link>
          <Link href="/about">サイトについて</Link>
        </nav>
        <div className="right">
          <FootprintCounter />
          <Link className="me-link" href="/me" aria-label="マイページ">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="3.4" />
              <path d="M5 20c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4" />
            </svg>
          </Link>
          <Link className="btn sm" href="/events">
            イベント一覧
          </Link>
        </div>
      </div>
    </header>
  );
}
