import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "STEP & RIDE が取得する情報・利用目的・保存先・削除方法について。",
};

// Google OAuth 同意画面にも掲載する正式なプライバシーポリシー。
// 取得データを増やす変更を行う場合は必ず本ページも更新すること。
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <span className="kicker">Privacy Policy</span>
      <h1
        className="mt-3 text-2xl font-bold sm:text-3xl"
        style={{ color: "var(--ink)" }}
      >
        プライバシーポリシー
      </h1>
      <p className="mt-3 text-sm" style={{ color: "var(--sub)" }}>
        STEP &amp; RIDE（運営：TRYCLE合同会社。以下「当サービス」）は、
        利用者の個人情報を以下のとおり取り扱います。
      </p>

      <Section title="1. 取得する情報">
        <ul className="pv-list">
          <li>
            <b>Googleログインを利用した場合</b>
            ：Googleアカウントのメールアドレス・表示名・プロフィール画像URL。
            パスワードを当サービスが受け取ることはありません。
          </li>
          <li>
            <b>サービス内で入力した情報</b>
            ：オンボーディングの回答（好きな走り方・エリア・レベル）、
            「出るかも」に登録したイベントのリスト。
          </li>
          <li>
            <b>端末内にのみ保存される情報</b>
            ：上記の回答・リストのコピー、閲覧回数カウンター等
            （ブラウザのlocalStorage。当社サーバーには送信されません）。
          </li>
        </ul>
      </Section>

      <Section title="2. 利用目的">
        <ul className="pv-list">
          <li>あなたに合ったイベントの表示（パーソナライズ）</li>
          <li>エントリー締切のリマインド</li>
          <li>複数端末間でのデータ同期（ログイン時）</li>
          <li>サービスの改善のための統計的な分析（個人を特定しない形）</li>
        </ul>
      </Section>

      <Section title="3. 保存先と安全管理">
        <p>
          ログイン時のデータは Supabase（データベースサービス）に保存されます。
          データベースには行レベルセキュリティ（RLS）を設定し、
          <b>本人以外のアカウントからは読み書きできない</b>
          ようアクセス制御を行っています。
        </p>
      </Section>

      <Section title="4. 第三者提供">
        <p>
          法令に基づく場合を除き、取得した個人情報を第三者に提供・販売することはありません。
          広告目的での利用も行いません。
        </p>
      </Section>

      <Section title="5. データの削除">
        <p>
          マイページの「アカウントのデータを削除」から、アカウントに保存された
          回答・出るかもリストをいつでも削除できます。
          ログイン情報（メールアドレス等）を含む完全な削除をご希望の場合は、
          下記の連絡先までお申し出ください。すみやかに対応します。
        </p>
      </Section>

      <Section title="6. Cookie等の利用">
        <p>
          ログイン状態の維持のために、ブラウザのlocalStorage・Cookieを利用します。
          外部の広告トラッキングは使用していません。
        </p>
      </Section>

      <Section title="7. 改定">
        <p>
          本ポリシーを改定する場合は、本ページでお知らせします。
        </p>
      </Section>

      <Section title="8. お問い合わせ">
        <p>
          TRYCLE合同会社（STEP &amp; RIDE 運営）
          <br />
          お問い合わせ：
          <a
            href="https://trycle.net/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)" }}
          >
            trycle.net
          </a>
          のお問い合わせ窓口まで
        </p>
      </Section>

      <p className="mt-8 text-xs" style={{ color: "var(--faint)" }}>
        制定日：2026年7月3日
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <h2 className="text-base font-bold" style={{ color: "var(--ink)" }}>
        {title}
      </h2>
      <div
        className="mt-2 text-sm leading-relaxed"
        style={{ color: "#3a3d42" }}
      >
        {children}
      </div>
    </section>
  );
}
