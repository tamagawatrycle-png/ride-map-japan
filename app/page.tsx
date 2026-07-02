import { getAllEvents } from "@/lib/events";
import { HomeInteractive } from "@/components/home/HomeInteractive";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { DeadlineRow } from "@/components/home/DeadlineRow";
import { FeaturesSection, MissionBand } from "@/components/home/StaticSections";

export default function HomePage() {
  const events = getAllEvents();

  return (
    <div>
      {/* 見出し＋マップ最上部 → タイル地図 → 種別タイル（絞り込み状態を共有） */}
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
