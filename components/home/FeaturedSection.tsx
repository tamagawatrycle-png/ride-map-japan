import Link from "next/link";
import type { Event } from "@/lib/types";
import { catLabel, shortDate, IC } from "@/lib/ui";

// 編集部pick（featured 上位4件）。editorComment を blurb として使用。
export function FeaturedSection({ events }: { events: Event[] }) {
  const picks = events.filter((e) => e.featured).slice(0, 4);
  return (
    <section id="featured" className="sec">
      <div className="wrap">
        <div className="sec-head">
          <span className="kicker">Editor&apos;s pick</span>
          <h2>編集部が選ぶ、まず出たい一本</h2>
        </div>
        <div className="feat">
          {picks.map((e) => (
            <Link key={e.id} href={`/events/${e.id}`} className="fcard">
              <div className="top">
                <div className="d">
                  {shortDate(e.date)} ・ {catLabel(e.category)}
                </div>
                <h3>{e.name}</h3>
                <div className="bl">{e.editorComment || e.description}</div>
              </div>
              <div className="bot">
                <span className="m">{e.location}</span>
                {e.distance && (
                  <span className="m">
                    <svg
                      viewBox="0 0 24 24"
                      dangerouslySetInnerHTML={{ __html: IC.route }}
                    />{" "}
                    {e.distance}
                  </span>
                )}
                <span className="go">
                  詳細を見る
                  <svg
                    viewBox="0 0 24 24"
                    dangerouslySetInnerHTML={{ __html: IC.arr }}
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
