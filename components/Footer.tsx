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
                <svg viewBox="0 0 24 24">
                  <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.4" />
                </svg>
              </span>
              STEP &amp; RIDE
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
