import Link from "next/link";

// モックの <footer> を移植。
export function Footer() {
  return (
    <footer className="rm-footer">
      <div className="wrap">
        <div className="fgrid">
          <div>
            <div className="brand">
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
              <span className="wordmark">
                ハシロ<i>！</i>
              </span>
            </div>
            <div className="desc">
              すべてのサイクリストに、走るきっかけを。全国のサイクリングイベントを地図から発見できるサービス。
            </div>
          </div>
          <div>
            <h5>Explore</h5>
            <ul>
              <li>
                <Link href="/#explore">全国マップ</Link>
              </li>
              <li>
                <Link href="/#cats">種別から探す</Link>
              </li>
              <li>
                <Link href="/#featured">編集部pick</Link>
              </li>
            </ul>
          </div>
          <div>
            <h5>About</h5>
            <ul>
              <li>
                <Link href="/about">サイトについて</Link>
              </li>
              <li>
                <Link href="/events">イベント一覧</Link>
              </li>
              <li>
                <Link href="/privacy">プライバシーポリシー</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="note">
          運営：TRYCLE合同会社 ／
          掲載情報は各公式サイトの公開情報をもとに編集部が独自にまとめた非公式まとめです。
        </div>
      </div>
    </footer>
  );
}
