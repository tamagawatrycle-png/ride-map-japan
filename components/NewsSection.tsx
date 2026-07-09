import Link from "next/link";
import { getNews, type NewsItem } from "@/lib/news";

// ホーム用ニュース欄（最新5件）。全件は /news へ。
export function NewsSection() {
  const items = getNews(5);
  if (items.length === 0) return null;
  return (
    <section className="sec" id="news">
      <div className="wrap">
        <div className="sec-head">
          <span className="kicker" style={{ justifyContent: "center" }}>
            News
          </span>
          <h2>お知らせ</h2>
        </div>
        <NewsList items={items} />
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Link href="/news" className="news-more">
            すべてのお知らせを見る
          </Link>
        </div>
      </div>
    </section>
  );
}

export function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <ul className="news-list">
      {items.map((n, i) => {
        const body = (
          <>
            <span className="news-date tabnum">
              {n.date.replaceAll("-", ".")}
            </span>
            <span className={`news-tag t-${n.tag}`}>{n.tag}</span>
            <span className="news-title">{n.title}</span>
          </>
        );
        return (
          <li key={`${n.date}-${i}`}>
            {n.href ? (
              <Link href={n.href} className="news-row">
                {body}
              </Link>
            ) : (
              <span className="news-row">{body}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
