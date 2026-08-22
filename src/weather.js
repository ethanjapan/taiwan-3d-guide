import LATLON from "../data/county-latlon.json";

/**
 * 県市ごとの現在天気+3日予報。Open-Meteo(キー不要・CC BY 4.0)から取得。
 * 実測確認: current 28.5°C / weather_code 51 (2026-08-21)。
 * 失敗時は null を返してUI側は黙って非表示(ローカルアプリなのでオフラインでも壊さない)。
 */
const cache = new Map(); // iso -> {at, data}
const TTL = 30 * 60 * 1000;

// WMO weather code → 絵文字は使わない方針なので短語ラベル(5言語)
const CODE_LABEL = [
  [[0], { zh: "晴朗", cn: "晴朗", ja: "快晴", en: "Clear", ko: "맑음" }],
  [[1, 2], { zh: "多雲時晴", cn: "多云时晴", ja: "晴れ時々曇り", en: "Partly cloudy", ko: "구름 조금" }],
  [[3], { zh: "陰天", cn: "阴天", ja: "曇り", en: "Cloudy", ko: "흐림" }],
  [[45, 48], { zh: "有霧", cn: "有雾", ja: "霧", en: "Fog", ko: "안개" }],
  [[51, 53, 55, 56, 57], { zh: "毛毛雨", cn: "毛毛雨", ja: "霧雨", en: "Drizzle", ko: "이슬비" }],
  [[61, 63, 65, 66, 67, 80, 81, 82], { zh: "有雨", cn: "有雨", ja: "雨", en: "Rain", ko: "비" }],
  [[71, 73, 75, 77, 85, 86], { zh: "降雪", cn: "降雪", ja: "雪", en: "Snow", ko: "눈" }],
  [[95, 96, 99], { zh: "雷雨", cn: "雷雨", ja: "雷雨", en: "Thunderstorm", ko: "뇌우" }],
];

export const codeLabel = (code, lang) => {
  for (const [codes, label] of CODE_LABEL) {
    if (codes.includes(code)) return label[lang] ?? label.en;
  }
  return "";
};

export const fetchWeather = async (iso) => {
  const hit = cache.get(iso);
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  const ll = LATLON[iso];
  if (!ll) return null;
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${ll.lat}&longitude=${ll.lon}` +
      "&current=temperature_2m,weather_code" +
      "&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max" +
      "&timezone=Asia%2FTaipei&forecast_days=3";
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = await r.json();
    const data = {
      now: { t: Math.round(j.current.temperature_2m), code: j.current.weather_code },
      daily: j.daily.time.map((d, i) => ({
        date: d,
        max: Math.round(j.daily.temperature_2m_max[i]),
        min: Math.round(j.daily.temperature_2m_min[i]),
        code: j.daily.weather_code[i],
        pop: j.daily.precipitation_probability_max[i],
      })),
    };
    cache.set(iso, { at: Date.now(), data });
    return data;
  } catch {
    return null;
  }
};

export const outfitBand = (t) =>
  t >= 28 ? "hot" : t >= 23 ? "warm" : t >= 18 ? "mild" : t >= 13 ? "cool" : t >= 8 ? "chilly" : "cold";

