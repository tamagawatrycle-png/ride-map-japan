import type { MetadataRoute } from "next";

// PWA マニフェスト。ホーム画面追加時の名前（name / short_name）とアイコン。
// iOS のアイコン名は appleWebApp.title（layout.tsx）が優先されるが、
// Android / Chrome ではここの short_name が使われる。
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ハシロ！ — 走るきっかけを、全てのサイクリストに。",
    short_name: "ハシロ！",
    description:
      "全国のサイクリングイベントを地図から発見。ヒルクライム・ロードレース・グラベル・ロングライドまで、次の一本が見つかる。",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e9622e",
    lang: "ja",
    icons: [
      {
        src: "/brand/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
