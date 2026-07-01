# AI収集パイプライン（RIDE MAP JAPAN）

要件書 §6.3 の骨格。**「生成は全自動・公開は承認制」**。Mac mini の週1バッチで新着イベントを発見し、
承認待ちリストに溜め、田渕/橋本が承認したものだけ `data/events.json`（＝サイトのDB）に入る。

```
巡回ソース(sources.ts) → Claude＋web検索(anthropic.ts) → 構造化(prompt.ts/固定JSONスキーマ)
   → 重複排除(dedupe.ts) → 承認待ち(queue/pending.json) → 承認(approve.ts) → data/events.json
```

## モデルと方式
- モデル: **claude-sonnet-4-6**（収集・分類はSonnetで十分／Opus不要）
- 検索: **サーバーサイド web 検索**（`web_search_20260209`）
- 出力: **構造化JSON**（`output_config.format` / 固定スキーマ）
- スクレイピング(B軸)は不採用。AI検索(C軸)主軸＋RSS/カレンダー(D軸)補完。

## 著作権の鉄則（`prompt.ts` のシステムプロンプトに固定）
1. 公式説明文をコピーしない → `description` は必ず独自要約2〜3文
2. 写真・ロゴは転載しない（テキスト事実のみ）
3. `officialUrl` は一次情報のみ

## 使い方
```bash
# 1) 収集（鍵が無ければ DRY-RUN で動作確認できる）
npm run collect                         # 全 enabled ソース
npm run collect -- --region kanto       # 関東のみ（初期カバー範囲の絞り込み）
npm run collect -- --sources fuji-hillclimb,tour-de-okinawa
npm run collect -- --limit 3            # 1ソース最大3件

# 2) 承認（月1まとめて）
npm run approve -- --list               # 承認待ちを確認（短縮キー付き）
npm run approve -- --ids <key1>,<key2>  # 指定を承認 → events.json へ昇格
npm run approve -- --all                # 全承認
npm run approve -- --reject <key1>      # 却下（破棄）

# 3) 反映
npm run build                           # 詳細ページを再生成（SSG）
```

## 本番運用（Mac mini・週1バッチ）
`ANTHROPIC_API_KEY` を `.env` に設定（`.env.example` 参照）。cron 例（毎週月曜 6:00）:
```cron
0 6 * * 1 cd /path/to/ridemap-japan && /usr/local/bin/npm run collect >> pipeline/collect.log 2>&1
```
収集は自動、承認は人手（pending.json を見て approve）。

## ファイル
| ファイル | 役割 |
|---|---|
| `sources.ts` | 巡回ソース 10〜20（search/calendar）。region で初期カバー範囲を制御 |
| `prompt.ts` | システムプロンプト（著作権鉄則）＋ 固定JSONスキーマ |
| `anthropic.ts` | Sonnet 4.6 + web検索 + 構造化出力。鍵が無ければDRY-RUN |
| `dedupe.ts` | 重複キー（公式URL正規化 or 名前+開催日） |
| `prefectures.ts` | 都道府県→代表座標（地図ピンのフォールバック） |
| `store.ts` | events.json / queue の読み書き |
| `collect.ts` | 収集オーケストレーター（`npm run collect`） |
| `approve.ts` | 承認CLI（`npm run approve`） |
| `queue/pending.json` | 承認待ちリスト（生成物・gitignore対象でも可） |
| `queue/processed.json` | 承認/却下の履歴 |

## 計測構造（§5.3）について
本パイプラインは「DB登録」まで。掲載後のインプレッション/クリック計測・UTM付与は
フロント側（events.json → 詳細ページのCTA）で別途仕込む。次フェーズ。

## 注意
- 座標は都道府県centroidの近似。公開前に `data/events.json` で会場座標を手直し可。
- `confidence: "low"` の候補は `tags:["要確認"]` 付きで昇格する。
- このパイプラインは `app/`（Next.js）から独立。tsx で直接実行（`AGENTS.md` のNext16注意はフロント側のみ）。
