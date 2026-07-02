import type { Metadata } from "next";
import { Noto_Sans_JP, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EntryReminder } from "@/components/EntryReminder";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_NAME = "STEP & RIDE";
const SITE_DESC =
  "走るきっかけを、全てのサイクリストに。全国のサイクリングイベントを地図から発見。ヒルクライム・ロードレース・グラベル・ロングライドまで、次の一本が見つかる。";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — 走るきっかけを、全てのサイクリストに。`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESC,
    type: "website",
    locale: "ja_JP",
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
        {/* スプラッシュ（1セッション1回・約1.4秒でフェードアウト）。
            写真: public/splash.jpg（無い場合はオレンジグラデにフォールバック） */}
        <div id="sr-splash" aria-hidden="true">
          <div className="sp-photo" />
          <div className="sp-inner">
            <span className="sp-mk">
              <svg viewBox="0 0 24 24">
                <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.4" />
              </svg>
            </span>
            <b>STEP &amp; RIDE</b>
            <p>すべてのサイクリストに、走るきっかけを。</p>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var el=document.getElementById('sr-splash');if(!el)return;try{if(sessionStorage.getItem('sr_splash')==='1'){el.remove();return;}sessionStorage.setItem('sr_splash','1');}catch(e){}var t=matchMedia('(prefers-reduced-motion: reduce)').matches?600:1400;setTimeout(function(){el.classList.add('out');},t);setTimeout(function(){el.remove();},t+600);})();`,
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <EntryReminder />
      </body>
    </html>
  );
}
