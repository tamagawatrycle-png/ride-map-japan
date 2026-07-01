import Link from "next/link";
import { getAllEvents } from "@/lib/events";
import { HomeInteractive } from "@/components/home/HomeInteractive";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { DeadlineRow } from "@/components/home/DeadlineRow";
import { FeaturesSection, MissionBand } from "@/components/home/StaticSections";

export default function HomePage() {
  const events = getAllEvents();

  return (
    <div>
      {/* Hero */}
      <div className="wrap hero">
        <span className="kicker">全国のサイクリングイベント発見マップ</span>
        <h1>
          次の一本を、<em>地図</em>から
          <br />
          見つけよう。
        </h1>
        <p>
          「探す」のではなく「出会う」。全国のロード・ヒルクライム・グラベルを、地図とエリアから。あなたに合う一本へ。
        </p>
        <div className="cta">
          <Link className="btn" href="#explore">
            <svg viewBox="0 0 24 24">
              <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.4" />
            </svg>
            マップで探す
          </Link>
          <Link className="btn ghost" href="#cats">
            種別から見る
          </Link>
        </div>
      </div>

      {/* Explore + タイル地図 + 種別タイル（絞り込み状態を共有） */}
      <HomeInteractive events={events} />

      {/* 編集部pick */}
      <FeaturedSection events={events} />

      {/* 締切が近いイベント */}
      <DeadlineRow events={events} />

      {/* How it works */}
      <FeaturesSection />

      {/* Mission */}
      <MissionBand />
    </div>
  );
}
