// How it works（3カード）と Mission バンド。承認済みモックそのまま。

export function FeaturesSection() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <span className="kicker">How it works</span>
          <h2>走るきっかけを、もっと。</h2>
        </div>
        <div className="fx">
          <div className="fxc">
            <div className="ico">
              <svg viewBox="0 0 24 24">
                <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.4" />
              </svg>
            </div>
            <h4>地図で&ldquo;出会う&rdquo;</h4>
            <p>
              種別・エリア・走力で絞り込み、全国のイベントを地図から発見。リスト送りでは気づけない一本に出会える。
            </p>
          </div>
          <div className="fxc">
            <div className="ico">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="5" />
                <path d="M8.5 13l-1.5 8 5-3 5 3-1.5-8" />
              </svg>
            </div>
            <h4>参加を記録してバッジ</h4>
            <p>
              「参加済み」を記録すると走破バッジを獲得。グラベル制覇・○都道府県制覇など、走った証をコレクション。
            </p>
          </div>
          <div className="fxc">
            <div className="ico">
              <svg viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h4>レビューで背中を押す</h4>
            <p>
              難易度・補給・景観・運営を構造化レビュー。参加者の声が、次の誰かの最初の一歩になる。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MissionBand() {
  return (
    <section className="mission">
      <div className="wrap in">
        <span className="kicker">Our mission</span>
        <h2>
          すべてのサイクリストに、
          <br />
          走るきっかけを。
        </h2>
        <p>
          初心者の最初の一歩から、レーサーの次の一戦まで。RIDE MAP JAPAN
          は「走りたい」を後押しする地図です。
        </p>
      </div>
    </section>
  );
}
