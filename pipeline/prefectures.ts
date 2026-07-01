// 都道府県 → 代表座標（地図ピン用フォールバック）。
// AI収集では正確な会場座標が安定して取れないため、承認時に都道府県centroidを当てる。
// 公開後、田渕/橋本が詳細座標に手直しできる（events.json を直接編集）。

export const PREF_CENTROID: Record<string, { lat: number; lng: number }> = {
  北海道: { lat: 43.06, lng: 141.35 },
  青森県: { lat: 40.82, lng: 140.74 },
  岩手県: { lat: 39.7, lng: 141.15 },
  宮城県: { lat: 38.27, lng: 140.87 },
  秋田県: { lat: 39.72, lng: 140.1 },
  山形県: { lat: 38.24, lng: 140.36 },
  福島県: { lat: 37.75, lng: 140.47 },
  茨城県: { lat: 36.34, lng: 140.45 },
  栃木県: { lat: 36.57, lng: 139.88 },
  群馬県: { lat: 36.39, lng: 139.06 },
  埼玉県: { lat: 35.86, lng: 139.65 },
  千葉県: { lat: 35.6, lng: 140.12 },
  東京都: { lat: 35.69, lng: 139.69 },
  神奈川県: { lat: 35.45, lng: 139.64 },
  新潟県: { lat: 37.9, lng: 139.02 },
  富山県: { lat: 36.7, lng: 137.21 },
  石川県: { lat: 36.59, lng: 136.63 },
  福井県: { lat: 36.07, lng: 136.22 },
  山梨県: { lat: 35.66, lng: 138.57 },
  長野県: { lat: 36.65, lng: 138.18 },
  岐阜県: { lat: 35.39, lng: 136.72 },
  静岡県: { lat: 34.98, lng: 138.38 },
  愛知県: { lat: 35.18, lng: 136.91 },
  三重県: { lat: 34.73, lng: 136.51 },
  滋賀県: { lat: 35.0, lng: 135.87 },
  京都府: { lat: 35.02, lng: 135.76 },
  大阪府: { lat: 34.69, lng: 135.52 },
  兵庫県: { lat: 34.69, lng: 135.18 },
  奈良県: { lat: 34.69, lng: 135.83 },
  和歌山県: { lat: 34.23, lng: 135.17 },
  鳥取県: { lat: 35.5, lng: 134.24 },
  島根県: { lat: 35.47, lng: 133.05 },
  岡山県: { lat: 34.66, lng: 133.93 },
  広島県: { lat: 34.4, lng: 132.46 },
  山口県: { lat: 34.19, lng: 131.47 },
  徳島県: { lat: 34.07, lng: 134.56 },
  香川県: { lat: 34.34, lng: 134.04 },
  愛媛県: { lat: 33.84, lng: 132.77 },
  高知県: { lat: 33.56, lng: 133.53 },
  福岡県: { lat: 33.61, lng: 130.42 },
  佐賀県: { lat: 33.25, lng: 130.3 },
  長崎県: { lat: 32.74, lng: 129.87 },
  熊本県: { lat: 32.79, lng: 130.74 },
  大分県: { lat: 33.24, lng: 131.61 },
  宮崎県: { lat: 31.91, lng: 131.42 },
  鹿児島県: { lat: 31.56, lng: 130.56 },
  沖縄県: { lat: 26.21, lng: 127.68 },
};

export function centroidFor(prefecture: string): { lat: number; lng: number } | null {
  if (PREF_CENTROID[prefecture]) return PREF_CENTROID[prefecture];
  // "県"なし等のゆらぎを吸収
  const hit = Object.keys(PREF_CENTROID).find((k) => prefecture.includes(k.replace(/[都道府県]$/, "")));
  return hit ? PREF_CENTROID[hit] : null;
}
