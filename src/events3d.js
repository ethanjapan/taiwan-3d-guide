import * as THREE from "three";

/**
 * 季節イベントのピン層。月を選ぶと、その月にイベントがある県の上にカテゴリのピンが立つ。
 *
 * 日本版だけの層。日本の観光は「どこへ行くか」より先に「いつ行くか」で中身が変わるので、
 * 月を動かすと桜前線と紅葉前線が南北に流れて見えることを狙っている。
 * 素材(event/<cat>.webp)が無い間は読み込み失敗を握りつぶして何も出さない。
 *
 * ピンは Sprite。地形の押し出し天面より上に、県ごとに少しずつ高さを変えて置く
 * (同じ高さに並べると、密な本州で前後のピンが重なって数が読めない)。
 *
 * ★イベント表示中はランドマークを引っ込める(main.js 側)。ピンとランドマークは
 *   どちらも県の重心に立つので、両方出すと重なって「どっちがイベントか」が読めない
 *   (2026-08-22 ユーザー指摘)。テーマ表示のときは主題以外の層を伏せる、が地図の作法。
 */

const CATS = ["sakura", "hanabi", "matsuri", "koyo", "snow", "flower", "illumi"];

export const createEventLayer = (stage, events, prefs, reduceMotion) => {
  // 台湾版も同じ形(id と center を持つ配列)を渡す。中身は日本版と共通
  const { scene, span } = stage;
  const loader = new THREE.TextureLoader();
  const mats = new Map();

  const dead = new Set();   // 素材が無いカテゴリ
  const matOf = (cat) => {
    if (mats.has(cat)) return mats.get(cat);
    const m = new THREE.SpriteMaterial({ transparent: true, depthWrite: false });
    // 素材が無い間は、白い四角が地図の上に並ぶのを避けて何も出さない(他の層と同じ方針)
    m.visible = false;
    const tex = loader.load(
      `${import.meta.env.BASE_URL}event/${cat}.webp`,
      (t) => { t.colorSpace = THREE.SRGBColorSpace; m.map = t; m.visible = true; m.needsUpdate = true; },
      undefined,
      () => { dead.add(cat); },
    );
    m.map = tex;
    mats.set(cat, m);
    return m;
  };

  /** 選択したピンの下に敷く光の輪。どのピンを押したのかを地図上で示す */
  let ringMat = null;
  const makeRingMat = () => {
    if (ringMat) return ringMat;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 96;
    const g = cv.getContext("2d");
    const grad = g.createRadialGradient(48, 48, 6, 48, 48, 46);
    grad.addColorStop(0, "rgba(255,236,180,0.95)");
    grad.addColorStop(0.45, "rgba(255,214,120,0.55)");
    grad.addColorStop(1, "rgba(255,200,90,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 96, 96);
    ringMat = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return ringMat;
  };

  const layer = new THREE.Group();
  layer.name = "events";
  layer.visible = false;
  scene.add(layer);

  let ring = null;
  let selectedIso = null;

  const byId = new Map(prefs.map((p) => [p.id, p]));
  const cx = (stage.bounds.minX + stage.bounds.maxX) / 2;
  const cy = (stage.bounds.minY + stage.bounds.maxY) / 2;

  let month = 0;          // 0 = 出さない
  let pins = [];          // {sp, base, delay, sel}
  let pinSprites = [];    // レイキャスト用(pins.map と同じ並び)

  const clear = () => {
    for (const p of pins) p.sp.removeFromParent();
    pins = [];
    pinSprites = [];
    ring?.removeFromParent();
    ring = null;
  };

  /** iso のピンを選択表示にする(輪を敷いてひと回り大きくする)。null で解除 */
  const select = (iso) => {
    selectedIso = iso;
    ring?.removeFromParent();
    ring = null;
    for (const p of pins) p.sel = p.sp.userData.pref === iso;
    const hit = pins.find((p) => p.sel);
    if (!hit) return;
    ring = new THREE.Sprite(makeRingMat());
    ring.scale.setScalar(hit.base * 1.9);
    ring.position.copy(hit.sp.position);
    layer.add(ring);
  };

  /** month: 1..12 を渡すとその月のピンを立てる。0 で消す。 */
  const setMonth = (m) => {
    month = m;
    const keep = selectedIso;
    clear();
    layer.visible = m > 0;
    if (!m) return;
    // イベント表示中はランドマークを伏せるので、ピンが地図の主役になる。
    // 台湾版の景点アイコン級(span*0.026)だと小さすぎて何のイベントか読めなかった。
    const size = span * 0.034;
    let i = 0;
    for (const [iso, list] of Object.entries(events.pref)) {
      const p = byId.get(iso);
      if (!p) continue;
      const hits = list.filter((e) => e.m.includes(m));
      if (!hits.length) continue;
      // 1県に複数あっても、地図には代表1つだけ立てる(全部立てると本州が埋まる)。
      // 順序は CATS の並び=季節の主役が先に来るようにしてある。
      const cat = CATS.find((c) => hits.some((e) => e.cat === c)) ?? hits[0].cat;
      const sp = new THREE.Sprite(matOf(cat));
      const [px, py] = p.center;
      // ★stage.lift は「選択したときに持ち上がる量」なので、常に足すと空の高い所へ飛ぶ
      //   (実測: 地面から約38単位=地図の1/6も上に浮いて、どの県のピンか読めなかった)。
      //   押し出しの天面(extrude)のすぐ上に置き、県ごとに少しだけ高さをずらす。
      const lift = stage.extrude + span * (0.018 + ((i * 7) % 5) * 0.004);
      sp.position.set(px - cx, lift, -(py - cy));
      sp.scale.setScalar(reduceMotion ? size : 0.001);
      // クリックされたときに「どのイベントか」を返せるよう、実体を持たせておく
      const ev = hits.find((e) => e.cat === cat) ?? hits[0];
      sp.userData = { pref: iso, cat, ev, hits, isEventPin: true };
      layer.add(sp);
      pins.push({ sp, base: size, delay: reduceMotion ? 0 : 0.02 * i,
                  k: reduceMotion ? 1 : 0, v: 0, sel: false });
      i += 1;
    }
    pinSprites = pins.map((q) => q.sp);
    if (keep) select(keep);        // 月を変えても選択中の県のピンは選ばれたまま
    if (reduceMotion) for (const p of pins) p.sp.scale.setScalar(p.base * (p.sel ? 1.4 : 1));
  };

  // 立ち上がりは減衰不足のバネ(他の演出と同じ作法)
  const W = 15;
  const Z = 0.58;
  const update = (dt) => {
    if (!layer.visible || reduceMotion) return;
    for (const p of pins) {
      if (p.delay > 0) {
        p.delay -= dt;
        continue;
      }
      const a = W * W * (1 - p.k) - 2 * Z * W * p.v;
      p.v += a * dt;
      p.k += p.v * dt;
      const s = p.base * Math.max(0, p.k) * (p.sel ? 1.4 : 1);
      p.sp.scale.set(s, s, 1);
      if (p.sel && ring) ring.scale.setScalar(s * 1.9);
    }
  };

  return {
    get month() { return month; },
    setMonth,
    select,
    update,
    /** レイキャスト対象。★layer.children には選択リングも入るので、ピンだけを返す
     *  (リングには userData.pref が無く、当たると県が引けずクリックが死ぬ)。
     *  ホバーのたびに走るので、配列は setMonth で作ったものを使い回す(毎フレーム生成しない) */
    get pins() { return pinSprites; },
  };
};
