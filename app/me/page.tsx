import type { Metadata } from "next";
import { MePage } from "@/components/MePage";

export const metadata: Metadata = {
  title: "マイページ",
  description:
    "あなたの回答（走り方・エリア・レベル）と出るかもリストの確認・編集。",
  robots: { index: false },
};

export default function Page() {
  return <MePage />;
}
