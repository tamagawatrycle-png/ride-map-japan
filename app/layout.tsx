import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EntryReminder } from "@/components/EntryReminder";
import { Splash } from "@/components/Splash";
import { Onboarding } from "@/components/Onboarding";
import { BottomNav } from "@/components/BottomNav";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"], // 900 はロゴ（ハシロ！）用
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_NAME = "ハシロ！";
const SITE_SUB = "HASHIRO STEP & RIDE!";
const SITE_DESC =
  "走るきっかけを、全てのサイクリストに。全国のサイクリングイベントを地図から発見。ヒルクライム・ロードレース・グラベル・ロングライドまで、次の一本が見つかる。";

// iPhoneのセーフエリア（ホームバー）に env(safe-area-inset-*) を効かせるため
// viewport-fit=cover を指定（ボトムナビの見切れ対策）
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} — 走るきっかけを、全てのサイクリストに。`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  // ホーム画面に追加したときのアイコン名（iOSはこの値を使う）。
  // 既存アイコンは自動更新されないため、一度削除して再追加すると「ハシロ！」になる。
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: `${SITE_NAME} — ${SITE_SUB}`,
    description: SITE_DESC,
    type: "website",
    locale: "ja_JP",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {/* スプラッシュ（1セッション1回・約0.7秒＋フェード。写真: public/splash.jpg） */}
        <Splash />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BottomNav />
        <EntryReminder />
        <Onboarding />
      </body>
    </html>
  );
}
