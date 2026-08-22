import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { createScene, PALETTE } from "./scene.js";
import { createAmbient } from "./ambient.js";
import { createAtmosphere } from "./atmosphere.js";
import { createCourseLayer } from "./courses3d.js";
import { STRINGS, applyLang, detectLang } from "./i18n.js";
import counties from "../data/counties.json";
import SPECIALTIES from "../data/specialties.json";
import COUNTS from "../data/attraction-counts.json";
import DECORATIONS from "../data/decorations.json";
import ATTRACTIONS from "../data/attractions.json";
import { TRAVEL_INFO, TRANSIT, PROMO_VIDEOS } from "./travelinfo.js";
import { fetchWeather, codeLabel } from "./weather.js";
import { rinkaCounty, rinkaSpot, RINKA_PROFILE, RINKA_LINKS } from "./rinka.js";
import COUNTY_INTRO from "../data/i18n/county-intro.json";
import COURSES from "../data/courses.json";
import VISITOR_CENTERS from "../data/visitor-centers.json";

const canvas = document.getElementById("stage");
const panel = document.getElementById("panel");
const panelName = document.getElementById("panel-name");
const panelBody = document.getElementById("panel-body");

// ---- 情報カード: 景点リストと詳細 ----
// panelState.spotId が null なら10件リスト、あれば詳細ビュー。
const panelState = { countyId: null, spotId: null };

const mapsUrl = (s) => `https://www.google.com/maps?q=${s.lat},${s.lon}`;

/** RINKAの吹き出し要素 */
const rinkaBubble = (text) => {
  const b = document.createElement("div");
  b.className = "rinka-bubble";
  const img = document.createElement("img");
  img.src = `${import.meta.env.BASE_URL}guide/rinka-avatar.webp`;
  img.alt = "RINKA";
  const t = document.createElement("p");
  t.textContent = text;
  b.append(img, t);
  return b;
};

/** RINKAプロフィール(guide-rowクリックで開閉)。MV STUDIOへの動線つき */
/**
 * 案内人の写真を押したときだけ全画面で見せる。
 * ★パネルの中に大きく置くと、見たくない人にも毎回ついて回る(2026-08-22 ユーザー指摘)。
 *   既定は小さいアイコンのまま、押した人にだけ 900x1200 を見せる。
 */
const openRinkaPhoto = () => {
  const box = document.createElement("div");
  box.className = "photo-lightbox";
  box.tabIndex = -1;
  const img = document.createElement("img");
  img.src = `${import.meta.env.BASE_URL}guide/rinka-guide.webp`;
  img.alt = "RINKA";
  const close = () => {
    box.remove();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  box.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  box.appendChild(img);
  document.body.appendChild(box);
  box.focus();
};

const toggleRinkaProfile = () => {
  const old = document.getElementById("rinka-profile");
  if (old) {
    old.remove();
    return;
  }
  const P = RINKA_PROFILE[lang];
  const card = document.createElement("div");
  card.id = "rinka-profile";
  card.className = "rinka-profile";
  const intro = document.createElement("p");
  intro.textContent = P.intro;
  const links = document.createElement("div");
  links.className = "rinka-links";
  for (const [key, label] of [["site", P.site], ["yt", P.yt]]) {
    const a = document.createElement("a");
    a.href = RINKA_LINKS[key];
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = label;
    links.appendChild(a);
  }
  card.append(intro, links);
  document.querySelector(".guide-row").after(card);
};
document.querySelector(".guide-row")?.addEventListener("click", toggleRinkaProfile);
{
  const av = document.querySelector(".guide-row img");
  if (av) {
    av.classList.add("guide-avatar");
    av.addEventListener("click", (e) => {
      e.stopPropagation();   // 行のトグルと二重に反応させない
      openRinkaPhoto();
    });
  }
}

const renderPanel = () => {
  // ★案内人のプロフィールは .guide-row(パネルの外枠)の後ろに挿しているので、
  //   panelBody を作り直しても残る。県市を選び直すたびに開きっぱなしのまま
  //   居座って邪魔になっていた(2026-08-22 ユーザー指摘)。描き直しのたびに閉じる
  document.getElementById("rinka-profile")?.remove();
  const county = counties.counties.find((c) => c.id === panelState.countyId);
  if (!county) return;
  panelName.textContent = county.name[lang] ?? county.name.zh;
  // 現在天気チップ(Open-Meteo・失敗時は静かに出さない)
  fetchWeather(county.id).then((w) => {
    if (!w || panelState.countyId !== county.id) return;
    const old = document.getElementById("weather-chip");
    if (old) old.remove();
    const chip = document.createElement("span");
    chip.id = "weather-chip";
    chip.className = "weather-chip";
    const d0 = w.daily[0];
    chip.textContent = `${w.now.t}°C ${codeLabel(w.now.code, lang)}｜${d0.min}–${d0.max}°C｜${STRINGS[lang].pop} ${d0.pop}%`;
    panelName.appendChild(chip);
    // 選択県市の3日予報(ユーザー要望 2026-08-21)。一覧ビューの時のみ
    const strip = document.getElementById("weather-strip");
    if (strip) {
      const LOCALE = { zh: "zh-TW", cn: "zh-CN", ja: "ja-JP", en: "en", ko: "ko" }[lang];
      const fmt = new Intl.DateTimeFormat(LOCALE, { month: "numeric", day: "numeric", weekday: "short" });
      strip.replaceChildren(
        ...w.daily.map((d) => {
          const card = document.createElement("div");
          card.className = "weather-day";
          const dt = document.createElement("span");
          dt.className = "weather-city";
          dt.textContent = fmt.format(new Date(`${d.date}T12:00:00+08:00`));
          const desc = document.createElement("span");
          desc.className = "weather-desc";
          desc.textContent = codeLabel(d.code, lang);
          const rng = document.createElement("span");
          rng.className = "weather-now";
          rng.textContent = `${d.min}–${d.max}°C`;
          const pop = document.createElement("span");
          pop.className = "weather-range";
          pop.textContent = `${STRINGS[lang].pop} ${d.pop}%`;
          card.append(dt, desc, rng, pop);
          return card;
        }),
      );
    }
  });
  const spots = ATTRACTIONS[county.id] ?? [];
  const T = STRINGS[lang];

  if (!panelState.spotId) {
    // RINKAのひとことコメント(ユーザー要望 2026-08-21)
    const rk = rinkaBubble(rinkaCounty(county.id, lang));
    // 県市の歴史・人文の概説(ユーザー要望 2026-08-21)
    const intro = document.createElement("p");
    intro.className = "county-intro";
    intro.textContent = COUNTY_INTRO[county.id]?.[lang] ?? "";
    // 名物グルメ帯(ユーザー要望 2026-08-21): 県市の名物3品をアイコン+名称で
    const gour = document.createElement("div");
    {
      const gh = document.createElement("p");
      gh.className = "gourmet-title";
      gh.textContent = T.gourmet;
      const row = document.createElement("div");
      row.className = "gourmet-row";
      (SPECIALTIES[county.id] ?? []).forEach((item, i) => {
        const cell = document.createElement("div");
        cell.className = "gourmet-item";
        const img = document.createElement("img");
        img.src = `${import.meta.env.BASE_URL}specialties/${county.id}-${i + 1}.webp`;
        img.alt = "";
        img.loading = "lazy";
        const lbl = document.createElement("span");
        lbl.textContent = item[lang] ?? item.en ?? item.zh;
        cell.append(img, lbl);
        row.appendChild(cell);
      });
      gour.append(gh, row);
    }
    const ul = document.createElement("ul");
    ul.className = "spot-list";
    for (const s of spots) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "spot-row";
      if (s.photo) {
        const img = document.createElement("img");
        // ★一覧は 52x40 で出す。原寸を読むと必要の十数倍で、1県市を開くたびに
        //   大きな転送がモバイル回線に乗る(日本版 2026-08-22 実測)。詳細だけ原寸を使う
        img.src = `${import.meta.env.BASE_URL}thumbs/${s.id}.webp`;
        img.alt = "";
        img.loading = "lazy";
        btn.appendChild(img);
      } else {
        const ph = document.createElement("span");
        ph.className = "spot-thumb-empty";
        btn.appendChild(ph);
      }
      const label = document.createElement("span");
      label.className = "spot-label";
      const nm = document.createElement("span");
      nm.textContent = s.name[lang] ?? s.name.zh;
      label.appendChild(nm);
      // 読み仮名の併記(ユーザー要望 2026-08-21): ja=カタカナ / zh・en=ピンイン
      const ruby = lang === "ja" ? s.kana : lang === "ko" ? "" : s.pinyin;
      if (ruby) {
        const sub = document.createElement("span");
        sub.className = "spot-kana";
        sub.textContent = ruby;
        label.appendChild(sub);
      }
      btn.appendChild(label);
      btn.addEventListener("click", () => {
        panelState.spotId = s.id;
        renderPanel();
      });
      li.appendChild(btn);
      ul.appendChild(li);
    }
    const wstrip = document.createElement("div");
    wstrip.className = "weather-strip";
    wstrip.id = "weather-strip";
    panelBody.dataset.view = "list";
    panelBody.replaceChildren(rk, wstrip, intro, gour, ul);
    stagger(panelBody);
    if (IS_MOBILE() && !panel.dataset.sheet) panel.dataset.sheet = "half";
    // 観光案内所(ユーザー要望 2026-08-21)
    const vcs = VISITOR_CENTERS[county.id] ?? [];
    if (vcs.length) {
      const vh = document.createElement("p");
      vh.className = "gourmet-title";
      vh.textContent = T.visitorCenter;
      panelBody.appendChild(vh);
      for (const vc of vcs) {
        const row = document.createElement("p");
        row.className = "vc-row";
        // 名称クリックでGoogle Mapsの検索へ(ユーザー要望 2026-08-21)
        const nm = document.createElement("a");
        nm.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vc.zh)}`;
        nm.target = "_blank";
        nm.rel = "noreferrer";
        nm.className = "vc-name";
        nm.textContent = `${vc.zh}（${vc.town}）`;
        row.appendChild(nm);
        if (vc.tel) {
          const tel = document.createElement("a");
          tel.href = `tel:${vc.tel.replace(/[^0-9+]/g, "")}`;
          tel.textContent = vc.tel;
          row.appendChild(tel);
        }
        panelBody.appendChild(row);
      }
    }
    const src = document.createElement("p");
    src.className = "spot-source";
    src.textContent = T.source;
    panelBody.appendChild(src);
  } else {
    const s = spots.find((x) => x.id === panelState.spotId);
    if (!s) return;
    const back = document.createElement("button");
    back.type = "button";
    back.className = "spot-back";
    back.textContent = `‹ ${T.back}`;
    back.addEventListener("click", () => {
      panelState.spotId = null;
      renderPanel();
    });
    const frag = [back, rinkaBubble(rinkaSpot(s, lang))];
    if (s.photo) {
      const img = document.createElement("img");
      img.className = "spot-photo";
      img.src = `${import.meta.env.BASE_URL}photos/${s.id}.webp`;
      img.alt = s.name[lang] ?? s.name.zh;
      frag.push(img);
    }
    const h = document.createElement("h3");
    h.className = "spot-title";
    h.textContent = s.name[lang] ?? s.name.zh;
    const rubyT = lang === "ja" ? s.kana : lang === "ko" ? "" : s.pinyin;
    if (rubyT) {
      const sub = document.createElement("span");
      sub.className = "spot-kana-title";
      sub.textContent = rubyT;
      h.appendChild(sub);
    }
    const town = document.createElement("p");
    town.className = "spot-town";
    town.textContent = `${county.name[lang]} ${s.town}`;
    const sum = document.createElement("p");
    sum.className = "spot-sum";
    sum.textContent = s.sum[lang] ?? s.sum.en;
    // 公式の紹介原文(繁体中文)全文。歴史・見どころが最も詳しいのは原文なので折りたたみで常備
    let details = null;
    if (s.desc_zh && s.desc_zh.length > 40) {
      details = document.createElement("details");
      details.className = "spot-desc";
      const sumEl = document.createElement("summary");
      sumEl.textContent = T.fullDesc;
      const body = document.createElement("p");
      body.textContent = s.desc_zh;
      details.append(sumEl, body);
    }
    const link = document.createElement("a");
    link.className = "spot-map";
    link.href = mapsUrl(s);
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = T.openMap;
    const src = document.createElement("p");
    src.className = "spot-source";
    src.textContent = T.source + (s.credit ? `｜${s.credit}` : "");
    frag.push(h, town, sum);
    if (details) frag.push(details);
    frag.push(link, src);
    panelBody.dataset.view = "detail";
    panelBody.dataset.view = "list";
  panelBody.replaceChildren(...frag);
  stagger(panelBody);
    stagger(panelBody);
  }
};
const hint = document.getElementById("hint");

/**
 * 操作ヒントを出す。★出しっぱなしにしない(2026-08-22 ユーザー指摘)。
 * CSSには [data-dimmed="true"] で消える指定があったのに、true にする場所が
 * どこにも無く、地図の上に永久に残っていた。
 * 一度でも地図を触ったら即座に、触らなくても数秒で引っ込める。
 */
let hintTimer = null;
const HINT_MS = 6000;
const dimHint = () => {
  hint.dataset.dimmed = "true";
  clearTimeout(hintTimer);
};
const showHint = (text) => {
  hint.textContent = text;
  hint.dataset.dimmed = "false";
  clearTimeout(hintTimer);
  hintTimer = setTimeout(dimHint, HINT_MS);
};
const fallback = document.getElementById("fallback");
hintTimer = setTimeout(dimHint, HINT_MS);   // 何も触らなくても引っ込む

let lang = detectLang();

const showFallback = () => {
  canvas.hidden = true;
  hint.hidden = true;
  fallback.hidden = false;
  const list = document.getElementById("fallback-list");
  list.replaceChildren(
    ...counties.counties.map((c) => {
      const li = document.createElement("li");
      li.textContent = c.name[lang];
      li.dataset.county = c.id;
      return li;
    }),
  );
};

let badgeCountyId = null; // バッジ表示中の県(パネルがコース表示でも言語追随させる)

const MOTION_OK = !matchMedia("(prefers-reduced-motion: reduce)").matches;
const IS_MOBILE = () => matchMedia("(max-width: 640px)").matches;

// バッジ: 数字をカウントアップして書く(演出A5)。reduced-motionは即値
const badgeInner = document.getElementById("badge-inner");
let badgeCountTimer = 0;
const setBadgeText = (count, label) => {
  cancelAnimationFrame(badgeCountTimer);
  if (!MOTION_OK || !Number.isFinite(count)) {
    badgeInner.textContent = `${count} ${label}`;
    return;
  }
  const t0 = performance.now();
  const D = 600;
  // 背面タブ等でrAFが止まっても最終値は必ず出す(claude-browser実測: hidden時rAF=0回)
  const failSafe = setTimeout(() => {
    badgeInner.textContent = `${count} ${label}`;
  }, D + 150);
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / D);
    const e = 1 - (1 - k) ** 3;
    badgeInner.textContent = `${Math.round(count * e)} ${label}`;
    if (k < 1) badgeCountTimer = requestAnimationFrame(tick);
    else clearTimeout(failSafe);
  };
  badgeCountTimer = requestAnimationFrame(tick);
};

// パネル中身の段差登場(演出A1): 子要素に--iを振る。CSS側のanimation-delayが拾う
const stagger = (el) => {
  [...el.children].forEach((c, i) => c.style.setProperty("--i", Math.min(i, 12)));
};

// モバイルのボトムシート挙動(B1): ハンドルをドラッグして半開/全開/閉じる
const attachSheet = (panelEl, { snaps = false, onClose } = {}) => {
  const handle = panelEl.querySelector("[data-sheet-handle]");
  if (!handle) return;
  let startY = 0;
  let startH = 0;
  let dragging = false;
  handle.addEventListener("pointerdown", (e) => {
    if (!IS_MOBILE()) return;
    dragging = true;
    startY = e.clientY;
    startH = panelEl.getBoundingClientRect().height;
    panelEl.style.transition = "none";
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const h = Math.max(80, Math.min(innerHeight * 0.86, startH + (startY - e.clientY)));
    panelEl.style.maxHeight = h + "px";
  });
  const finish = (e) => {
    if (!dragging) return;
    dragging = false;
    panelEl.style.transition = "";
    const h = panelEl.getBoundingClientRect().height;
    panelEl.style.maxHeight = "";
    if (h < innerHeight * 0.24) {
      panelEl.hidden = true;
      onClose?.();
      return;
    }
    if (snaps) {
      panelEl.dataset.sheet = h > innerHeight * 0.6 ? "full" : "half";
    }
  };
  handle.addEventListener("pointerup", finish);
  handle.addEventListener("pointercancel", finish);
};
let updateLangToggle = null;
let updatePhaseButton = null; // start()が差し込む。言語切替時にラベルを追随させる

// ---- 旅のしおり(スタンプラリー)。訪問=県市パネルを開いた県市。localStorageで永続 ----
const stamps = new Set(JSON.parse(localStorage.getItem("stamps") ?? "[]"));
const stampBtn = document.getElementById("stamp-btn");
const stampPanel = document.getElementById("stamp-panel");
const stampCountEl = document.getElementById("stamp-count");
const updateStampCount = () => {
  stampCountEl.textContent = `${stamps.size}/${counties.counties.length}`;
};
updateStampCount();

const renderStampBook = () => {
  document.getElementById("stamp-title").textContent = STRINGS[lang].stampBook;
  document.getElementById("stamp-hint").textContent = STRINGS[lang].stampHint;
  const grid = document.getElementById("stamp-grid");
  // ★「集めると何があるか」を先に見せる(2026-08-22 ユーザー指摘)。
  //   ごほうびが分からないと集める理由が生まれない。未達のときは案内人を伏せて予告、
  //   全部集まったら同じ場所が完走カードに変わる。達成はマスコットを出す定石の場所
  const done = document.getElementById("stamp-done");
  done?.remove();
  {
    const left = counties.counties.length - stamps.size;
    const box = document.createElement("div");
    box.id = "stamp-done";
    box.className = "stamp-done";
    box.dataset.locked = left > 0 ? "true" : "false";
    const img = document.createElement("img");
    img.className = "stamp-done-photo";
    img.src = `${import.meta.env.BASE_URL}guide/rinka-guide.webp`;
    img.alt = "RINKA";
    img.addEventListener("error", () => img.remove());
    const t = document.createElement("p");
    t.className = "stamp-done-title";
    t.textContent = left > 0
      ? STRINGS[lang].stampLocked.replace("{n}", String(left))
      : STRINGS[lang].stampDone;
    const d = document.createElement("p");
    d.className = "stamp-done-text";
    d.textContent = left > 0 ? STRINGS[lang].stampLockedText : STRINGS[lang].stampDoneText;
    box.append(img, t, d);
    document.getElementById("stamp-hint").after(box);
  }
  grid.replaceChildren(
    ...counties.counties.map((c) => {
      const cell = document.createElement("div");
      cell.className = "stamp-cell";
      if (stamps.has(c.id)) cell.dataset.stamped = "true";
      const box = document.createElement("div");
      box.className = "stamp-box";
      const ring = document.createElement("img");
      ring.className = "stamp-ring";
      ring.src = `${import.meta.env.BASE_URL}ui/stamp-ring.webp`;
      ring.alt = "";
      const icon = document.createElement("img");
      icon.className = "stamp-icon";
      icon.src = `${import.meta.env.BASE_URL}landmarks/${c.id}.webp`;
      icon.alt = "";
      icon.loading = "lazy";
      box.append(ring, icon);
      const nm = document.createElement("span");
      nm.className = "stamp-name";
      nm.textContent = c.name[lang] ?? c.name.zh;
      cell.append(box, nm);
      return cell;
    }),
  );
};

const addStamp = (iso) => {
  if (stamps.has(iso)) return;
  stamps.add(iso);
  localStorage.setItem("stamps", JSON.stringify([...stamps]));
  updateStampCount();
  stampBtn.dataset.pop = "true";
  setTimeout(() => delete stampBtn.dataset.pop, 700);
  if (!stampPanel.hidden) renderStampBook();
  // 演出A2: 画面中央に朱スタンプが「ドンッ」→しおりボタンへ飛ぶ
  if (MOTION_OK) {
    const pop = document.createElement("div");
    pop.className = "stamp-pop";
    const ring = document.createElement("img");
    ring.src = `${import.meta.env.BASE_URL}ui/stamp-ring.webp`;
    ring.alt = "";
    const icon = document.createElement("img");
    icon.className = "stamp-pop-icon";
    icon.src = `${import.meta.env.BASE_URL}landmarks/${iso}.webp`;
    icon.alt = "";
    pop.append(ring, icon);
    document.body.appendChild(pop);
    const fly = () => {
      const b = stampBtn.getBoundingClientRect();
      const p = pop.getBoundingClientRect();
      const dx = b.left + b.width / 2 - (p.left + p.width / 2);
      const dy = b.top + b.height / 2 - (p.top + p.height / 2);
      pop.animate(
        [{ transform: "translate(0,0) scale(1) rotate(-6deg)", opacity: 1 },
         { transform: `translate(${dx}px,${dy}px) scale(0.12) rotate(-6deg)`, opacity: 0.4 }],
        { duration: 420, easing: "cubic-bezier(.5,0,.8,.4)" },
      ).onfinish = () => pop.remove();
    };
    setTimeout(fly, 620);
  }
  updatePhaseButton?.();
  updateLangToggle?.();
};

stampBtn.addEventListener("click", () => {
  stampPanel.hidden = !stampPanel.hidden;
  if (!stampPanel.hidden) renderStampBook();
  updatePhaseButton?.();
  updateLangToggle?.();
});
document.getElementById("stamp-close").addEventListener("click", () => {
  stampPanel.hidden = true;
});

const setLang = (next) => {
  lang = next;
  localStorage.setItem("lang", next);
  applyLang(next);
  searchInput.placeholder = STRINGS[next].searchPh;
  if (!fallback.hidden) showFallback();
  if (!infoPanel.hidden) renderInfo();
  if (!panel.hidden && panel.dataset.county) {
    renderPanel();
    // applyLang が data-i18n で初期文言に戻してしまうので、選択中の案内を書き戻す。
    showHint(STRINGS[lang].hintSelected);
  }
  if (!panel.hidden && !panel.dataset.county && activeCourseId) {
    const cse = COURSES.courses.find((x) => x.id === activeCourseId);
    if (cse) renderCoursePanel(cse);
  }
  // RINKAプロフィールが開いていれば現在言語で作り直す
  if (document.getElementById("rinka-profile")) {
    document.getElementById("rinka-profile").remove();
    toggleRinkaProfile();
  }
  if (!stampPanel.hidden) renderStampBook();
  updatePhaseButton?.();
  updateLangToggle?.();
  // バッジの単位語はパネルの状態に関係なく言語に追随させる(ko残留バグ 2026-08-21)
  if (badgeCountyId) {
    badgeInner.textContent = `${COUNTS[badgeCountyId] ?? ""} ${STRINGS[lang].spotsLabel}`;
  }
};

// ---- 検索(景点名: 5言語+カナ+ピンイン、県市名も対象) ----
// start() が jumpToSpot を差し込む(WebGL無し環境ではリスト表示のみ)
let jumpToSpot = null;

const SEARCH_INDEX = [];
for (const c of counties.counties) {
  SEARCH_INDEX.push({ type: "county", iso: c.id, label: c.name, hay: Object.values(c.name).join(" ").toLowerCase() });
}
for (const [iso, items] of Object.entries(ATTRACTIONS)) {
  for (const s2 of items) {
    SEARCH_INDEX.push({
      type: "spot", iso, id: s2.id, label: s2.name, photo: s2.photo ? s2.id : null,
      hay: (Object.values(s2.name).join(" ") + " " + s2.kana + " " + s2.pinyin).toLowerCase(),
    });
  }
}

const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const runSearch = () => {
  const q = searchInput.value.trim().toLowerCase();
  if (q.length < 1) {
    searchResults.hidden = true;
    return;
  }
  const hits = SEARCH_INDEX.filter((e) => e.hay.includes(q)).slice(0, 8);
  searchResults.replaceChildren(
    ...hits.map((e) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      if (e.photo) {
        const img = document.createElement("img");
        img.src = `${import.meta.env.BASE_URL}thumbs/${e.photo}.webp`;
        img.alt = "";
        btn.appendChild(img);
      }
      const sp = document.createElement("span");
      sp.textContent = e.label[lang] ?? e.label.zh;
      btn.appendChild(sp);
      btn.addEventListener("click", () => {
        searchResults.hidden = true;
        searchInput.value = "";
        document.body.dataset.searchOpen = ""; // モバイルのオーバーレイも畳む
        if (jumpToSpot) jumpToSpot(e.iso, e.type === "spot" ? e.id : null);
      });
      li.appendChild(btn);
      return li;
    }),
  );
  searchResults.hidden = hits.length === 0;
};
document.getElementById("search-toggle").addEventListener("click", () => {
  const open = document.body.dataset.searchOpen === "1";
  document.body.dataset.searchOpen = open ? "" : "1";
  if (!open) searchInput.focus();
});
searchInput.addEventListener("input", runSearch);
searchInput.addEventListener("focus", runSearch);
document.addEventListener("click", (e) => {
  if (!document.getElementById("search").contains(e.target)) searchResults.hidden = true;
});

// 言語切替。スマホではヘッダに5つ並べられないので1つに畳み、押したときだけ開く
{
  const nav = document.querySelector(".langs");
  const toggle = document.getElementById("lang-btn");
  const labelOf = (lg) =>
    document.querySelector(`.lang[data-lang="${lg}"]`)?.textContent ?? lg;
  const closeLangs = () => {
    nav.dataset.open = "false";
    toggle.setAttribute("aria-expanded", "false");
  };
  const toggleLabel = document.getElementById("lang-btn-label");
  updateLangToggle = () => {
    // ★ここは翻訳しない。「LANGUAGE」と出すのが目的(2026-08-22 ユーザー指摘)。
    //   現在の言語名(한국어 など)を出すと、その言語を読めない人には何のボタンか分からない。
    //   ラテン文字の LANGUAGE なら、どの言語で開いても言語切替だと伝わる。
    //   ★textContent を button 自体に入れると中の地球アイコン(svg)まで消えるので span に入れる
    toggleLabel.textContent = "LANGUAGE";
    toggle.setAttribute("aria-label", `Language: ${labelOf(lang)}`);
  };
  updateLangToggle();
  toggle.addEventListener("click", () => {
    const open = nav.dataset.open !== "true";
    nav.dataset.open = String(open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  for (const btn of document.querySelectorAll(".lang[data-lang]")) {
    btn.addEventListener("click", () => {
      setLang(btn.dataset.lang);
      closeLangs();
    });
  }
  // 外を押したら閉じる(開いたまま地図を触ると、次のタップが吸われる)
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) closeLangs();
  });
}

// ---- 台湾全体の旅行実用情報パネル ----
const infoPanel = document.getElementById("info-panel");
let courseLayer = null; // start() が代入(WebGLがある時のみ)
let activeCourseId = null;

const toggleCourse = (cse) => {
  if (activeCourseId === cse.id) {
    activeCourseId = null;
    courseLayer?.clear();
    panel.hidden = true;
    delete panel.dataset.county;
  } else {
    activeCourseId = cse.id;
    courseLayer?.show(cse);
    document.getElementById("welcome")?.setAttribute("hidden", "");
    renderCoursePanel(cse); // 右パネルに旅程を表示(ユーザー要望 2026-08-21)
  }
  renderInfo();
};

/** 右パネルにコースの旅程(Day別・写真つきステップ)を表示する */
const renderCoursePanel = (cse) => {
  const T = STRINGS[lang];
  delete panel.dataset.county;
  panelState.countyId = null;
  panelState.spotId = null;
  panelName.textContent = cse.title[lang] ?? cse.title.en;
  const frag = [];
  let day = 0;
  cse.stops.forEach((st, i) => {
    if (st.day !== day) {
      day = st.day;
      const dh = document.createElement("h3");
      dh.className = "info-h";
      dh.textContent = `Day ${day}`;
      frag.push(dh);
    }
    const row = document.createElement("div");
    row.className = "spot-row course-step";
    if (st.photo) {
      const img = document.createElement("img");
      img.src = `${import.meta.env.BASE_URL}thumbs/${st.photo}.webp`;
      img.alt = "";
      img.loading = "lazy";
      row.appendChild(img);
    } else {
      const ph = document.createElement("span");
      ph.className = "spot-thumb-empty";
      row.appendChild(ph);
    }
    const label = document.createElement("span");
    label.className = "spot-label";
    const no = document.createElement("span");
    no.textContent = `${i + 1}. ${st.name[lang] ?? st.name.zh}`;
    label.appendChild(no);
    const ruby = lang === "ja" ? st.kana : lang === "ko" ? "" : "";
    if (ruby) {
      const sub = document.createElement("span");
      sub.className = "spot-kana";
      sub.textContent = ruby;
      label.appendChild(sub);
    }
    row.appendChild(label);
    frag.push(row);
  });
  panelBody.replaceChildren(...frag);
  panel.hidden = false;
};
/** 主要都市の今日の天気を info パネル先頭に非同期で流し込む(失敗時は静かに非表示) */
const WEATHER_CITIES = ["TW-TPE", "TW-TXG", "TW-KHH", "TW-HUA"];
const renderWeatherOverview = async (host) => {
  if (!host) return;
  const rows = await Promise.all(
    WEATHER_CITIES.map(async (iso) => {
      const w = await fetchWeather(iso);
      if (!w) return null;
      const c = counties.counties.find((x) => x.id === iso);
      return { iso, name: c?.name[lang] ?? iso, w };
    }),
  );
  host.replaceChildren(
    ...rows.filter(Boolean).map(({ name, w }) => {
      const d0 = w.daily[0];
      const card = document.createElement("div");
      card.className = "weather-card";
      const n = document.createElement("span");
      n.className = "weather-city";
      n.textContent = name;
      const now = document.createElement("span");
      now.className = "weather-now";
      now.textContent = `${w.now.t}°C`;
      const desc = document.createElement("span");
      desc.className = "weather-desc";
      desc.textContent = codeLabel(w.now.code, lang);
      const rng = document.createElement("span");
      rng.className = "weather-range";
      rng.textContent = `${d0.min}–${d0.max}°C｜${STRINGS[lang].pop} ${d0.pop}%`;
      card.append(n, now, desc, rng);
      return card;
    }),
  );
};

const renderInfo = () => {
  const info = TRAVEL_INFO[lang];
  document.getElementById("info-title").textContent = info.title;
  const body = document.getElementById("info-body");
  const weatherNodes = [];
  {
    const h = document.createElement("h3");
    h.className = "info-h";
    h.textContent = STRINGS[lang].weatherToday;
    weatherNodes.push(h);
    const grid = document.createElement("div");
    grid.className = "weather-grid";
    grid.id = "weather-overview";
    weatherNodes.push(grid);
    const src = document.createElement("p");
    src.className = "course-tip";
    src.textContent = "Weather data by Open-Meteo.com (CC BY 4.0)";
    weatherNodes.push(src);
    renderWeatherOverview(grid);
  }
  const transitNodes = [];
  {
    const tr = TRANSIT[lang];
    const h = document.createElement("h3");
    h.className = "info-h";
    h.textContent = tr.h;
    transitNodes.push(h);

    const flow = document.createElement("div");
    flow.className = "transit-flow";
    const node = (label, cls) => {
      const el = document.createElement("div");
      el.className = `transit-node ${cls}`;
      el.textContent = label;
      return el;
    };
    flow.appendChild(node(tr.airport, "is-airport"));
    const routes = document.createElement("div");
    routes.className = "transit-routes";
    for (const r of tr.routes) {
      const card = document.createElement("div");
      card.className = "transit-route";
      if (r.best) card.dataset.best = "true";
      const nm = document.createElement("span");
      nm.className = "transit-route-name";
      nm.textContent = r.name;
      const tm = document.createElement("span");
      tm.className = "transit-route-time";
      tm.textContent = r.time;
      const nt = document.createElement("span");
      nt.className = "transit-route-note";
      nt.textContent = r.note;
      card.append(nm, tm, nt);
      routes.appendChild(card);
    }
    flow.appendChild(routes);
    flow.appendChild(node(tr.taipei, "is-city"));
    const onward = document.createElement("div");
    onward.className = "transit-onward";
    for (const o of tr.onward) {
      const chip = document.createElement("span");
      chip.className = "transit-chip";
      chip.textContent = o;
      onward.appendChild(chip);
    }
    flow.appendChild(onward);
    transitNodes.push(flow);

    const south = document.createElement("div");
    south.className = "transit-south";
    south.append(
      node(tr.airport, "is-airport is-mini"),
      Object.assign(document.createElement("span"), { className: "transit-via", textContent: tr.southRoute.via }),
      node(tr.hsr, "is-city is-mini"),
      Object.assign(document.createElement("span"), { className: "transit-via", textContent: tr.southRoute.to }),
    );
    transitNodes.push(south);

    const ch = document.createElement("h3");
    ch.className = "info-h";
    ch.textContent = tr.card.h;
    transitNodes.push(ch);
    const stepsBox = document.createElement("div");
    stepsBox.className = "card-steps";
    tr.card.steps.forEach((txt, i) => {
      const st = document.createElement("div");
      st.className = "card-step";
      const img = document.createElement("img");
      img.src = `${import.meta.env.BASE_URL}guide-transit/step${i + 1}.webp`;
      img.alt = "";
      img.loading = "lazy";
      img.addEventListener("error", () => img.remove()); // アイコン未生成でも壊さない
      const no = document.createElement("span");
      no.className = "card-step-no";
      no.textContent = String(i + 1);
      const label = document.createElement("span");
      label.className = "card-step-label";
      label.textContent = txt;
      st.append(img, no, label);
      stepsBox.appendChild(st);
    });
    transitNodes.push(stepsBox);
  }
  const videoNodes = [];
  {
    const pv = PROMO_VIDEOS[lang];
    const h = document.createElement("h3");
    h.className = "info-h";
    h.textContent = pv.h;
    videoNodes.push(h);
    const grid = document.createElement("div");
    grid.className = "promo-grid";
    for (const v of pv.items) {
      const box = document.createElement("div");
      box.className = "promo-video";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "promo-thumb";
      const img = document.createElement("img");
      img.src = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
      img.alt = v.t;
      img.loading = "lazy";
      const play = document.createElement("span");
      play.className = "promo-play";
      btn.append(img, play);
      // click-to-play: クリックされて初めてiframeを生成(privacy-enhanced埋め込み)
      btn.addEventListener("click", () => {
        const frame = document.createElement("iframe");
        frame.src = `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;
        frame.allow = "autoplay; encrypted-media; picture-in-picture";
        frame.allowFullscreen = true;
        frame.title = v.t;
        btn.replaceWith(frame);
        frame.className = "promo-frame";
      });
      const cap = document.createElement("p");
      cap.className = "promo-title";
      cap.textContent = v.t;
      box.append(btn, cap);
      grid.appendChild(box);
    }
    videoNodes.push(grid);
    const more = document.createElement("a");
    more.className = "promo-more";
    more.href = pv.moreUrl;
    more.target = "_blank";
    more.rel = "noopener";
    more.textContent = pv.more;
    videoNodes.push(more);
  }
  const courseNodes = [];
  {
    const h = document.createElement("h3");
    h.className = "info-h";
    h.textContent = STRINGS[lang].courses;
    courseNodes.push(h);
    const tip = document.createElement("p");
    tip.className = "course-tip";
    tip.textContent = STRINGS[lang].courseTip;
    courseNodes.push(tip);
    for (const cse of COURSES.courses) {
      const box = document.createElement("button");
      box.type = "button";
      box.className = "course";
      box.dataset.course = cse.id;
      if (activeCourseId === cse.id) box.dataset.active = "true";
      const t = document.createElement("p");
      t.className = "course-title";
      t.textContent = cse.title[lang];
      const days = document.createElement("span");
      days.className = "course-days";
      days.textContent = `${cse.days}${STRINGS[lang].daysUnit}`;
      t.appendChild(days);
      const chips = document.createElement("div");
      chips.className = "course-chips";
      cse.stops.forEach((st, i) => {
        const chip = document.createElement("span");
        chip.className = "course-chip";
        chip.textContent = `${i + 1} ${st.name[lang] ?? st.name.zh}`;
        chips.appendChild(chip);
      });
      box.append(t, chips);
      box.addEventListener("click", () => toggleCourse(cse));
      courseNodes.push(box);
    }
  }
  body.replaceChildren(
    ...weatherNodes,
    ...transitNodes,
    ...videoNodes,
    ...courseNodes,
    ...info.sections.flatMap((sec) => {
      const h = document.createElement("h3");
      h.className = "info-h";
      h.textContent = sec.h;
      const ul = document.createElement("ul");
      ul.className = "info-list";
      for (const line of sec.lines) {
        const li = document.createElement("li");
        li.textContent = line;
        ul.appendChild(li);
      }
      return [h, ul];
    }),
  );
  stagger(body);
};
document.getElementById("info-btn").addEventListener("click", () => {
  renderInfo();
  infoPanel.hidden = !infoPanel.hidden;
});
document.getElementById("info-close").addEventListener("click", () => {
  infoPanel.hidden = true;
});

applyLang(lang);
searchInput.placeholder = STRINGS[lang].searchPh;

// WebGL が無い環境は 3D を諦めて一覧に落とす。
// ?nogl=1 で意図的に落とせるようにしてある(この経路は実機で確認しないと腐る)。
const probe = document.createElement("canvas");
const hasWebGL =
  !new URLSearchParams(location.search).has("nogl") &&
  Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
if (!hasWebGL) {
  showFallback();
} else {
  start();
}

function start() {
  const stage = createScene(canvas, counties.counties, counties.bounds);
  if (import.meta.env.DEV) window.__stage = stage;
  const { renderer, scene, camera, groups, sea, span, extrude, lift } = stage;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = span * 0.35;
  controls.maxDistance = span * 1.9;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.enablePan = false;

  // 台湾は南北に細長く、しかも斜め俯瞰なので奥行きが圧縮される。
  // 画角から机上で距離を出すと必ずどこかが切れるか小さすぎるので、
  // 実際に地図の外接箱を投影して画面に収まる距離を求める。
  // 外接箱の角で合わせると、台湾は箱の中を斜めに走る細い島なので
  // 角(=何も無い海)が画面端に来て、島が中央に小さく浮くだけになる。実際の陸地の点で合わせる。
  const buildSample = (skipInsets) => {
    const { minX, maxX, minY, maxY } = counties.bounds;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const top = stage.lift + stage.extrude;
    const INSETS = new Set(["TW-KIN", "TW-LIE", "TW-PEN"]);
    const pts = [];
    for (const county of counties.counties) {
      if (skipInsets && INSETS.has(county.id)) continue;
      for (const polygon of county.polygons) {
        for (let i = 0; i < polygon.outer.length; i += 2) {
          const [px, py] = polygon.outer[i];
          pts.push(new THREE.Vector3(px - cx, 0, -(py - cy)));
          pts.push(new THREE.Vector3(px - cx, top, -(py - cy)));
        }
      }
    }
    return pts;
  };
  const SAMPLE_ALL = buildSample(false);
  // 縦画面: 西の離島インセットまで収めると本島が小さくなりすぎる(モバイル演出が遠い真因)。
  // 本島だけでフィットさせ、離島は画面外〜縁でよいとする
  const SAMPLE_PORTRAIT = buildSample(true);

  const MARGIN = 1.06; // 画面の縁に触れない程度の余白

  const frame = (dir) => {
    // 遠近投影では見かけの大きさがほぼ距離に反比例するので、
    // 仮の距離で測って比率で補正し、もう一度測って詰める。
    let dist = stage.span * 1.5;
    for (let i = 0; i < 3; i += 1) {
      const probe = camera.clone();
      probe.position.copy(dir.clone().multiplyScalar(dist));
      probe.lookAt(0, 0, 0);
      probe.updateMatrixWorld(true);
      probe.updateProjectionMatrix();
      const scratch = new THREE.Vector3();
      const SAMPLE = camera.aspect < 0.8 ? SAMPLE_PORTRAIT : SAMPLE_ALL;
      const worst = SAMPLE.reduce((m, p) => {
        const ndc = scratch.copy(p).project(probe);
        return Math.max(m, Math.abs(ndc.x), Math.abs(ndc.y));
      }, 0);
      if (!Number.isFinite(worst) || worst <= 0) break;
      dist *= worst * MARGIN;
    }
    return dist;
  };

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  // ---- 湧き上がりスプライト群 ----
  // 県市を選ぶと、ランドマーク(landmarks/<ISO>.webp)と名物3個(specialties/<ISO>-n.webp)が
  // 押し出し天面から時間差で伸び上がる。ホバー中はランドマークだけ小さくチラ見せ。
  // 動きは減衰不足のバネ(行き過ぎて弾む)。素材が未生成でも読み込み失敗を握りつぶして動く。
  const texLoader = new THREE.TextureLoader();
  const animated = [];
  const bundles = new Map();

  const SPRING_W = 15; // バネの速さ
  const SPRING_Z = 0.58; // 減衰(<1で弾む)
  const IDLE = 0.5; // 常設表示の倍率(全県市に小さく立てて「たくさんある」を見せる)
  const PEEK = 0.78; // ホバー時にひと回り育つ倍率

  const landmarkSize = (county) => {
    const pts = county.polygons[0].outer;
    const xs = pts.map(([x]) => x);
    const ys = pts.map(([, y]) => y);
    const extent = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    return THREE.MathUtils.clamp(extent * 0.7, 24, 46);
  };

  const makeSprite = (url, size, position, group) => {
    let sprite;
    const tex = texLoader.load(url, undefined, undefined, () => {
      if (sprite) {
        sprite.visible = false;
        sprite.userData.dead = true;
      }
    });
    tex.colorSpace = THREE.SRGBColorSpace;
    sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }),
    );
    sprite.center.set(0.5, 0); // 底辺アンカー=地面から生える
    sprite.position.copy(position);
    sprite.scale.set(0.001, 0.001, 1);
    sprite.userData = { k: 0, v: 0, target: 0, delay: 0, size, dead: false };
    sprite.visible = false;
    group.add(sprite);
    animated.push(sprite);
    return sprite;
  };

  const bundleFor = (group) => {
    const county = group.userData.county;
    if (bundles.has(county.id)) return bundles.get(county.id);
    const size = landmarkSize(county);
    const [cx, cy] = county.center;
    const topZ = group.userData.topZ;
    const base = import.meta.env.BASE_URL;
    const landmark = makeSprite(
      `${base}landmarks/${county.id}.webp`, size, new THREE.Vector3(cx, cy, topZ), group,
    );
    // 名物はランドマークの周囲に散らす。角度は「前方に被らない」経験値
    const minis = (SPECIALTIES[county.id] ?? []).map((_, i) => {
      const angle = [3.7, 5.9, 1.3][i % 3];
      const r = size * 0.55;
      const p = new THREE.Vector3(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, topZ);
      return makeSprite(`${base}specialties/${county.id}-${i + 1}.webp`, size * 0.42, p, group);
    });
    // 第2ランドマーク(landmarks2/)は選択時のみ、名物の後に湧く
    const l2p = new THREE.Vector3(cx + Math.cos(2.5) * size * 0.62, cy + Math.sin(2.5) * size * 0.62, topZ);
    minis.push(makeSprite(`${base}landmarks2/${county.id}.webp`, size * 0.5, l2p, group));
    const bundle = { landmark, minis };
    bundles.set(county.id, bundle);
    return bundle;
  };

  // ---- 地面デコ・動物(常設) ----
  // 起動後にばらばらと生えてくる。県市の子として置くので選択時に一緒に持ち上がる。
  {
    const base = import.meta.env.BASE_URL;
    const byId = new Map(groups.map((g) => [g.userData.county.id, g]));
    DECORATIONS.items.forEach((d, i) => {
      let sprite;
      if (d.sea) {
        const cx = (counties.bounds.minX + counties.bounds.maxX) / 2;
        const cy = (counties.bounds.minY + counties.bounds.maxY) / 2;
        sprite = makeSprite(`${base}deco/${d.file}.webp`, d.size,
          new THREE.Vector3(0, 0, 0), scene);
        sprite.position.set(d.x - cx, 0.6, -(d.y - cy));
      } else {
        const g = byId.get(d.county);
        if (!g) return;
        const [ccx, ccy] = g.userData.county.center;
        sprite = makeSprite(`${base}deco/${d.file}.webp`, d.size,
          new THREE.Vector3(ccx + d.dx, ccy + d.dy, g.userData.topZ), g);
      }
      sprite.userData.target = 1;
      sprite.userData.delay = 2.2 + i * 0.12;
    });
  }

  /** mode: "idle"(常設・小) | "peek"(ホバー・中) | "full"(選択=名物も時間差で湧く) */
  const setBundle = (group, mode) => {
    const b = bundleFor(group);
    b.landmark.userData.target = mode === "full" ? 1 : mode === "peek" ? PEEK : IDLE;
    b.landmark.userData.delay = 0;
    b.minis.forEach((m, i) => {
      m.userData.target = mode === "full" ? 1 : 0;
      m.userData.delay = mode === "full" ? 0.16 * (i + 1) : 0;
    });
  };

  // 起動時: 全県市のランドマークを北から順に小さく立てていく(初回のさざ波)
  groups.forEach((group, i) => {
    const b = bundleFor(group);
    b.landmark.userData.target = IDLE;
    b.landmark.userData.delay = 0.7 + i * 0.07;
  });

  // ---- 景点数バッジ ----
  const badge = document.getElementById("badge");
  const badgeText = (county) =>
    `${COUNTS[county.id] ?? ""} ${STRINGS[lang].spotsLabel}`;

  let hovered = null;
  let selected = null;

  const HOVER_LIFT = 1.4;

  /** ホバーと選択の状態を全県市の高さと色に反映する。状態を変えたら必ずこれを通す。 */
  const applyState = () => {
    document.body.style.cursor = hovered ? "pointer" : "";
    for (const g of groups) {
      const isSelected = g === selected;
      const isHover = g === hovered && !isSelected;
      g.userData.targetY = isSelected ? lift : isHover ? HOVER_LIFT : 0;
      g.userData.material.color.copy(
        isSelected || isHover
          ? new THREE.Color(PALETTE.accent).lerp(g.userData.baseColor, isSelected ? 0.3 : 0.66)
          : g.userData.baseColor,
      );
    }
  };

  const setHover = (group) => {
    if (hovered === group) return;
    if (hovered && hovered !== selected) setBundle(hovered, "idle");
    if (group && group !== selected) setBundle(group, "peek");
    hovered = group;
    applyState();
  };

  const welcome = document.getElementById("welcome");
  document.getElementById("welcome-close")?.addEventListener("click", () => {
    welcome.hidden = true;
  });

  const select = (group) => {
    if (selected && selected !== group) setBundle(selected, "idle");
    if (group) setBundle(group, "full");
    if (!group && selected) setBundle(selected, "idle");
    if (group) welcome.hidden = true; // 案内は最初のクリックで退場
    badge.dataset.show = "false";
    badgeCountyId = group?.userData.county.id ?? null;
    if (group) setBadgeText(COUNTS[group.userData.county.id] ?? 0, STRINGS[lang].spotsLabel);
    selected = group;
    if (group) addStamp(group.userData.county.id);
    // 選択県市の実天気に雨演出を連動(ユーザー承認 2026-08-21)
    if (!group) {
      atmosphere.setRain(null, false);
    } else {
      const iso = group.userData.county.id;
      fetchWeather(iso).then((w) => {
        if (selected !== group) return;
        const rainy = !!w && w.now.code >= 51;
        atmosphere.setRain(group, rainy);
      });
    }
    if (!group) {
      panel.hidden = true;
      delete panel.dataset.county;
      delete panel.dataset.sheet;
      showHint(STRINGS[lang].hint);
    } else {
      const c = group.userData.county;
      panel.dataset.county = c.id;
      panelState.countyId = c.id;
      panelState.spotId = null;
      renderPanel();
      panel.hidden = false;
      showHint(STRINGS[lang].hintSelected);
    }
    // 選択した県市はホバー扱いから外す(持ち上がりが二重にかからないように)。
    if (hovered === group) hovered = null;
    applyState();
  };

  document.getElementById("close").addEventListener("click", () => select(null));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      select(null);
      if (activeCourseId) {
        activeCourseId = null;
        courseLayer?.clear();
        if (!infoPanel.hidden) renderInfo();
      }
    }
  });

  const pick = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(groups, true);
    if (hits.length === 0) return null;
    let node = hits[0].object;
    while (node && !node.userData.county) node = node.parent;
    return node ?? null;
  };

  // タップとドラッグ回転の区別は移動距離で行う。
  // 旧実装はマウスのみ moved を見ていたため、タッチでドラッグ回転して指を離すと
  // 意図しない選択/解除が起きていた(スマホ実機で顕在化)。
  let downAt = null;
  canvas.addEventListener("pointerdown", (e) => {
    downAt = { x: e.clientX, y: e.clientY };
    dimHint();   // 触れた時点で役目は終わり
  });
  canvas.addEventListener("wheel", dimHint, { passive: true });
  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse") setHover(pick(e));
  });
  canvas.addEventListener("pointerup", (e) => {
    if (!downAt) return;
    const dist = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    downAt = null;
    if (dist > 8) return; // ドラッグ扱い(タップ判定は8px以内)
    select(pick(e));
  });

  let framed = false;
  const resize = () => {
    // 埋め込みプレビューなどでは読み込み直後に innerWidth/innerHeight が 0 になることがある。
    // そのまま w/h を取ると aspect が NaN になり、カメラ座標まで NaN に汚染されて何も描画されない。
    const w = innerWidth || canvas.clientWidth;
    const h = innerHeight || canvas.clientHeight;
    if (w < 1 || h < 1) return;

    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // 初回だけ自動フレーミングする。以降はユーザーのズームを尊重する。
    if (!framed) {
      framed = true;
      // 島の長軸を画面の対角に少し寝かせて面積を稼ぐ。ただし振りすぎると
      // 台湾のシルエットが横倒しになって形が分からなくなるので、北はおおむね上に保つ。
      const dir = new THREE.Vector3(0.42, 1.08, 0.80).normalize();
      const dist = frame(dir);
      camera.position.copy(dir.clone().multiplyScalar(dist));
      controls.target.set(0, 0, 0);
      controls.maxDistance = dist * 1.6;
      controls.minDistance = dist * 0.35;
      controls.update();
    }
  };
  addEventListener("resize", resize);
  resize();
  // キャンバスが後から実寸を得た場合(プレビュー枠・分割ビュー)にも取りこぼさない。
  new ResizeObserver(resize).observe(canvas);

  attachSheet(panel, { snaps: true, onClose: () => select(null) });
  attachSheet(infoPanel, {});
  attachSheet(stampPanel, {});

  jumpToSpot = (iso, spotId) => {
    const g = groups.find((x) => x.userData.county.id === iso);
    if (!g) return;
    select(g);
    if (spotId) {
      panelState.spotId = spotId;
      renderPanel();
    }
  };

  const ambient = createAmbient(scene, counties.bounds, reduceMotion);
  const atmosphere = createAtmosphere(stage, reduceMotion);

  // 時間帯切替ボタン(ユーザー要望 2026-08-21「切り替えの操作がわからない」)
  {
    const CYCLE = ["auto", "morning", "day", "dusk", "night"];
    const ICONS = { morning: "sun", day: "sun", dusk: "sun", night: "moon" };
    const btn = document.getElementById("phase-btn");
    const icon = document.getElementById("phase-icon");
    const label = document.getElementById("phase-label");
    const labelOf = (sel) => {
      const T = STRINGS[lang];
      const name = { auto: T.phaseAuto, morning: T.phaseMorning, day: T.phaseDay,
                     dusk: T.phaseDusk, night: T.phaseNight }[sel];
      return sel === "auto" ? `${name}(${{ morning: T.phaseMorning, day: T.phaseDay, dusk: T.phaseDusk, night: T.phaseNight }[atmosphere.phase]})` : name;
    };
    let sel = localStorage.getItem("phase") ?? "auto";
    if (!CYCLE.includes(sel)) sel = "auto";
    const render = () => {
      icon.src = `${import.meta.env.BASE_URL}ui/${ICONS[atmosphere.phase] ?? "sun"}.webp`;
      label.textContent = labelOf(sel);
    };
    render();
    btn.addEventListener("click", () => {
      sel = CYCLE[(CYCLE.indexOf(sel) + 1) % CYCLE.length];
      localStorage.setItem("phase", sel);
      atmosphere.setPhase(sel);
      render();
    });
    updatePhaseButton = render;
  }
  courseLayer = createCourseLayer(scene, counties.bounds, groups, reduceMotion);
  if (import.meta.env.DEV) window.__course = courseLayer;
  const badgeAnchor = new THREE.Vector3();

  let prevTime = 0;
  // ---- 端末に合わせて描画解像度を落とす ----
  // ★1フレームだけ遅い(タブ復帰・GC)で落とさない。20msを30フレーム続けて超えたときだけ。
  //   戻すのは 12ms を90フレーム続けたときだけにする(境目で上下に振動させない)。
  const PR_STEPS = [Math.min(devicePixelRatio, 2), 1.5, 1];
  let prIndex = 0;
  let slow = 0;
  let fast = 0;
  const adaptQuality = (dt) => {
    const ms = dt * 1000;
    if (ms > 20) { slow += 1; fast = 0; } else if (ms < 12) { fast += 1; slow = 0; }
    if (slow >= 30 && prIndex < PR_STEPS.length - 1) {
      prIndex += 1;
      slow = 0;
      renderer.setPixelRatio(PR_STEPS[prIndex]);
      resize();
    } else if (fast >= 90 && prIndex > 0) {
      prIndex -= 1;
      fast = 0;
      renderer.setPixelRatio(PR_STEPS[prIndex]);
      resize();
    }
  };

  renderer.setAnimationLoop((time) => {
    const dt = Math.min((time - prevTime) / 1000, 0.1);
    prevTime = time;

    for (const g of groups) {
      const target = g.userData.targetY;
      // 押し出しは +Z 方向なので、寝かせた世界では z が高さになる。
      g.position.z += (target - g.position.z) * (reduceMotion ? 1 : 0.16);
    }

    // バネで伸縮するスプライト群(ランドマーク+名物)
    // ★積分は固定サブステップで行う。dtをそのまま使う semi-implicit Euler は
    //   w=15 だと dt≥0.083(約12fps以下)で数値発散し、スケールが10^30まで爆発
    //   →巨大スプライトの点滅と矩形アーティファクトになる(2026-08-21実測・実害)。
    //   一瞬のフレーム落ちでも発散→GPU過負荷→低fps固定の自己増悪ループに入るため、
    //   刻み幅は常に安定域(1/120s)に固定する。
    const SUB = 1 / 120;
    for (const s of animated) {
      const u = s.userData;
      if (u.dead) continue;
      if (u.delay > 0) {
        u.delay -= dt;
        continue;
      }
      if (reduceMotion) {
        u.k = u.target;
        u.v = 0;
      } else {
        // 既に発散してしまった個体の救済(リロード無しで復帰させる)
        if (!Number.isFinite(u.k) || Math.abs(u.k) > 3 || !Number.isFinite(u.v)) {
          u.k = u.target;
          u.v = 0;
        }
        let remaining = dt;
        while (remaining > 1e-6) {
          const h = Math.min(SUB, remaining);
          u.v += (SPRING_W * SPRING_W * (u.target - u.k) - 2 * SPRING_Z * SPRING_W * u.v) * h;
          u.k += u.v * h;
          remaining -= h;
        }
      }
      if (u.target === 0 && Math.abs(u.k) < 0.01 && Math.abs(u.v) < 0.01) {
        u.k = 0;
        u.v = 0;
        s.visible = false;
      } else if (u.target > 0 || u.k > 0.005) {
        s.visible = true;
      }
      const sc = Math.max(u.size * u.k, 0.001);
      s.scale.set(sc, sc, 1);
    }

    // 景点数バッジ: ランドマークがほぼ立ってから頭上に出す
    if (selected) {
      const b = bundles.get(selected.userData.county.id);
      const u = b?.landmark.userData;
      if (u && u.k > 0.6 && !u.dead) {
        b.landmark.getWorldPosition(badgeAnchor);
        badgeAnchor.y += u.size * Math.min(u.k, 1.05);
        badgeAnchor.project(camera);
        const x = ((badgeAnchor.x + 1) / 2) * innerWidth;
        const y = ((1 - badgeAnchor.y) / 2) * innerHeight;
        badge.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
        badge.dataset.show = "true";
      }
    } else {
      badge.dataset.show = "false";
    }

    ambient.update(time / 1000);
    atmosphere.update(dt);
    courseLayer.update(dt);
    if (!reduceMotion) stage.updateSea(time / 1000);
    controls.update();
    renderer.render(scene, camera);
    adaptQuality(dt);
  });


}
