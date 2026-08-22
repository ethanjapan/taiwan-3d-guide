import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import TOURS from "../data/i18n/tours.json";
import { STRINGS } from "./i18n.js";

/**
 * 説明モード。MV STUDIO の使い方ガイド(mvdirector/static/guide.js)と同じ作法に揃えた:
 *  - **1ツアー = 1つの成果**。全機能を1本に詰めない
 *  - **1ツアー5ステップまで**。それ以上は読まれない
 *  - 初回だけ自動再生、あとは「?」でいつでも再生できる
 *  - `?tour=<id>` で名指し再生(メニューからの誘導と、動作確認に使う)
 *
 * ★ステップの当て先が「無い」ことがある(パネルを開いていない・その月にイベントが無い等)。
 *   そのままだと driver.js が空の枠を出すので、**開始前にアプリの状態を作ってから**
 *   存在しないステップを落とす。作れなかったステップは黙って飛ばす。
 * ★#stage(canvas)は画面全面なのでスポットライトにならない。地図の説明は
 *   操作ヒントや「押した結果」に当てる。
 */

const KEY = "tour_done";

// ★走っているツアーは1本だけにする。前のを消さずに次を始めると、
//   オーバーレイと吹き出しが二重に出て、押すたび別々のツアーが交互に進む(2026-08-22 実測)
let active = null;

export const createTour = (api) => {
  const langOf = () => api.lang();
  const T = () => STRINGS[langOf()];

  /** ステップの前準備。当て先の要素を実際に作ってから案内する(空の枠を出さないため) */
  const ACTIONS = {
    openPref: () => api.openPref(),
    openInfo: () => api.openInfo(),
    eventsOn: () => { api.eventsOn(); api.openEventPref(); },
    seasonPref: () => { api.eventsOn(); api.openSeasonPref(); },
  };

  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  /** "A|B" は「見えている方を使う」。スマホで畳まれる要素があるので、
   *  存在ではなく**大きさ**で選ぶ(display:none の要素は幅0で返る) */
  const resolve = (sel) => {
    for (const one of sel.split("|")) {
      const el = document.querySelector(one.trim());
      if (el && el.getBoundingClientRect().width > 4) return one.trim();
    }
    return null;
  };

  const runTour = async (id) => {
    const t = TOURS.tours.find((x) => x.id === id);
    if (!t) return;
    active?.destroy();
    active = null;
    const lg = langOf();
    const list = t.steps;
    let d = null;

    /** そのステップの当て先を作る。前準備は「そのステップに入る直前」に走らせる。
     *  ★まとめて先に走らせると、1歩目の説明と画面がずれる
     *   (地図の説明なのに、先に県のパネルが開いていて操作ヒントの文言が変わっていた)。 */
    const prep = async (i) => {
      const a = list[i]?.act;
      if (a) await ACTIONS[a]?.();
      await raf2();          // 開いた直後は幅0で枠がずれる
      // ★当て先がパネルの中にあると、スマホのボトムシート(半開)では画面の下に隠れる。
      //   2026-08-22 実測: 「いま行くなら」の当て先が y=1000(画面は812)で、
      //   吹き出しだけ出て何も指していない状態になった。開いて、見える所まで送る。
      // ★当て先は「まだ来ていない」ことがある。服装カードは天気の取得が終わってから
      //   描くので、開いた直後には無い。無いまま return すると案内が黙って終わる
      //   (2026-08-22 実測: 起動直後に『何を着る』を選ぶと1歩も出なかった)。少し待つ。
      let sel = resolve(list[i]?.el ?? "");
      for (let n = 0; !sel && n < 12; n += 1) {
        await new Promise((r) => setTimeout(r, 120));
        sel = resolve(list[i]?.el ?? "");
      }
      const el = sel ? document.querySelector(sel) : null;
      if (!el) return;
      const sheet = el.closest("[data-sheet]");
      if (sheet) sheet.dataset.sheet = "full";
      const box = el.getBoundingClientRect();
      if (box.bottom > innerHeight - 8 || box.top < 8) {
        el.scrollIntoView({ block: "center", behavior: "auto" });
        await raf2();
      }
    };

    /** i から dir 方向へ、当て先が実在する最初のステップまで進む。無ければ終了 */
    const goTo = async (i, dir) => {
      let j = i;
      while (j >= 0 && j < list.length) {
        await prep(j);
        if (resolve(list[j].el)) break;
        j += dir;
      }
      if (j < 0 || j >= list.length) { d?.destroy(); return; }
      d.moveTo(j);
    };

    const steps = list.map((s, i) => ({
      element: resolve(s.el) ?? s.el.split("|")[0].trim(),
      popover: {
        title: s.h[lg] ?? s.h.ja,
        description: s.d[lg] ?? s.d.ja,
        side: s.side,
        align: "start",
        onNextClick: () => { if (i + 1 >= list.length) d.destroy(); else goTo(i + 1, 1); },
        onPrevClick: () => { goTo(i - 1, -1); },
      },
    }));

    await prep(0);
    if (!resolve(list[0].el)) return;

    d = driver({
      onDestroyed: () => { if (active === d) active = null; },
      showProgress: true,
      progressText: "{{current}} / {{total}}",
      nextBtnText: T().tourNext,
      prevBtnText: T().tourPrev,
      doneBtnText: T().tourDone,
      overlayOpacity: 0.55,
      popoverClass: "jp-tour",   // 既定の白い吹き出しをガラス基調へ上書きするため
      steps,
    });
    active = d;
    d.drive();
    try { localStorage.setItem(KEY, "1"); } catch { /* プライベートモード */ }
  };

  // ---- 「?」ボタンとツアー一覧 ----
  const btn = document.getElementById("help-btn");
  const menu = document.getElementById("tour-menu");
  const list = document.getElementById("tour-list");

  const renderMenu = () => {
    const lg = langOf();
    document.getElementById("tour-title").textContent = T().tourTitle;
    document.getElementById("tour-lead").textContent = T().tourLead;
    btn.setAttribute("aria-label", T().tourTitle);
    list.replaceChildren(...TOURS.tours.map((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tour-item";
      const h = document.createElement("span");
      h.className = "tour-item-h";
      h.textContent = t.title[lg] ?? t.title.ja;
      const s = document.createElement("span");
      s.className = "tour-item-sub";
      s.textContent = t.sub[lg] ?? t.sub.ja;
      const n = document.createElement("span");
      n.className = "tour-item-n";
      n.textContent = `${t.steps.length}`;
      b.append(n, h, s);
      b.addEventListener("click", () => {
        menu.hidden = true;
        runTour(t.id);
      });
      return b;
    }));
  };

  btn.addEventListener("click", () => {
    renderMenu();
    menu.hidden = !menu.hidden;
  });
  document.getElementById("tour-close").addEventListener("click", () => { menu.hidden = true; });

  // 初回だけ自動再生。?tour=<id> があればそれを優先(メニューの誘導と動作確認用)
  const forced = new URLSearchParams(location.search).get("tour");
  const auto = () => {
    if (forced) {
      runTour(forced === "1" ? "map" : forced);
      return;
    }
    if (localStorage.getItem(KEY)) return;
    runTour("map");
  };
  // 地図が立ち上がる演出(バネ)が落ち着いてから。動いている最中に枠を出すとずれる
  setTimeout(auto, forced ? 400 : 2600);

  return { render: renderMenu, run: runTour };
};
