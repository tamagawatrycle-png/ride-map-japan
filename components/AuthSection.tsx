"use client";

// マイページの「アカウント」セクション。
// Supabase 未設定 → 「近日公開」表示（従来どおり）
// 設定済み・未ログイン → Googleでログイン
// ログイン中 → プロフィール表示・同期状態・ログアウト・データ削除
//
// ログイン時に localStorage とアカウントをマージし、以後の変更は自動でサーバーへ反映。

import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { mergeOnLogin, pushToServer, deleteAccountData } from "@/lib/account";
import { PROFILE_CHANGE_EVENT } from "@/lib/profile";
import { MAYBE_CHANGE_EVENT } from "@/lib/maybe";

const MERGED_KEY = "sr_synced_user"; // このユーザーで初回マージ済みか

export function AuthSection() {
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // セッション監視 + 初回マージ
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = sb.auth.onAuthStateChange(async (_ev, s) => {
      setSession(s);
      if (s?.user) {
        try {
          const key = `${MERGED_KEY}:${s.user.id}`;
          if (localStorage.getItem(key) !== "1") {
            const r = await mergeOnLogin(sb, s.user.id);
            localStorage.setItem(key, "1");
            setNote(`同期しました（出るかも ${r.maybeCount}件）`);
          }
        } catch {
          setNote("同期に失敗しました。再読み込みしてください。");
        }
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ログイン中は変更を自動プッシュ（1秒デバウンス）
  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !session?.user) return;
    const uid = session.user.id;
    const push = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void pushToServer(sb, uid);
      }, 1000);
    };
    window.addEventListener(PROFILE_CHANGE_EVENT, push);
    window.addEventListener(MAYBE_CHANGE_EVENT, push);
    return () => {
      window.removeEventListener(PROFILE_CHANGE_EVENT, push);
      window.removeEventListener(MAYBE_CHANGE_EVENT, push);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [session?.user]);

  // --- 未設定（キー投入前）: 従来の近日公開表示 ---
  if (!isSupabaseConfigured) {
    return (
      <div className="me-account">
        <p>
          現在、回答と出るかもリストは<b>この端末に保存</b>されています。
          ログイン機能（近日公開）で、複数端末での同期に対応予定です。
        </p>
        <button className="me-login" disabled>
          <PersonIcon />
          ログイン（近日公開）
        </button>
      </div>
    );
  }

  const sb = getSupabase()!;

  // --- 未ログイン ---
  if (!session) {
    return (
      <div className="me-account">
        <p>
          Googleでログインすると、回答と出るかもリストが<b>アカウントに保存</b>
          され、機種変更や複数端末でも引き継げます。
        </p>
        <button
          className="me-login active"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await sb.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${window.location.origin}/me` },
            });
          }}
        >
          <GoogleG />
          Googleでログイン
        </button>
        <p className="me-privacy">
          ログインすると
          <a href="/privacy">プライバシーポリシー</a>
          に同意したものとみなされます。保存されるのは回答・出るかもリスト・
          Googleアカウントの基本情報（メールアドレス・表示名）のみです。
        </p>
      </div>
    );
  }

  // --- ログイン中 ---
  const u = session.user;
  const name =
    (u.user_metadata?.full_name as string) ||
    (u.user_metadata?.name as string) ||
    u.email ||
    "ログイン中";
  const avatar = u.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="me-account">
      <div className="me-user">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="me-user-ph">
            <PersonIcon />
          </span>
        )}
        <span className="me-user-body">
          <b>{name}</b>
          <small>{u.email}</small>
        </span>
      </div>
      <p>
        回答と出るかもリストは<b>アカウントに自動同期</b>されています。
        {note && <span className="me-note">{note}</span>}
      </p>
      <div className="me-actions">
        <button
          className="me-logout"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await sb.auth.signOut();
            setBusy(false);
            setNote(null);
          }}
        >
          ログアウト
        </button>
        <button
          className="me-delete"
          disabled={busy}
          onClick={async () => {
            if (
              !window.confirm(
                "アカウントに保存された回答・出るかもリストをすべて削除してログアウトします。よろしいですか？（この端末内のデータは残ります）",
              )
            )
              return;
            setBusy(true);
            try {
              await deleteAccountData(sb, u.id);
              localStorage.removeItem(`${MERGED_KEY}:${u.id}`);
              await sb.auth.signOut();
            } finally {
              setBusy(false);
            }
          }}
        >
          アカウントのデータを削除
        </button>
      </div>
      <p className="me-privacy">
        ログイン自体の完全な削除（メールアドレス等の消去）をご希望の場合は、
        <a href="/privacy">プライバシーポリシー</a>
        記載の連絡先までお知らせください。
      </p>
    </div>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4" />
    </svg>
  );
}

// Google "G"（4色・ブランドガイドライン準拠の簡易版）
function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="me-g">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.93-2.92l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.29a12 12 0 0 0 0 10.76l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77z"
      />
    </svg>
  );
}
