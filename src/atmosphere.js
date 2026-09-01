import * as THREE from "three";

/**
 * 時間帯(台湾時間)と天気の演出。
 * - 朝/昼/夕/夜でライト・海の色味・ページ背景を切り替え、空に太陽/月スプライトを出す
 * - setPhase() で実行時に切替できる(UIのボタンから。"auto"=台湾の実時間)
 * - 選択県市が雨系(WMO 51以上の降水コード)なら雨雲スプライト+雨パーティクル(THREE.Points)
 * 素材(ui/sun.webp 等)が無くてもライト側だけで成立する(読み込みはfail-silent)。
 */

const taiwanHour = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei", hour: "numeric", hour12: false,
  }).formatToParts(new Date());
  return Number(parts.find((p) => p.type === "hour")?.value ?? 12);
};

export const phaseOf = (h) =>
  h >= 5 && h < 8 ? "morning" : h >= 8 && h < 16 ? "day" : h >= 16 && h < 19 ? "dusk" : "night";

export const PHASES = ["morning", "day", "dusk", "night"];

// ライト/色のプリセット。dayは createScene の初期値と一致させる。
// ★sea は「materialに乗算する色」から「頂点色を作り直す2色(近/沖)」へ変更(2026-08-23)。
//   暖色×青緑の乗算で dusk が濁った緑になった実害への対処。fog は沖が溶ける色=擬似的な空。
//   値は色彩設計の相談(GPT・類似/分裂補色調和と大気遠近法)を反映
// ★2026-09-01 色彩レビュー(GPT・色彩学)を反映:
//   大面積(海沖)に暖色や高彩度を置かない。夕焼けの橙は霧と光源に限定し、
//   海は青緑→紫灰へ(分裂補色が面積差で効く)。夜の霧は沖より一段明るくして奥行きを戻す。
//   目安=大面積の彩度はHSLで昼45-55%/夕30-40%/夜25-35%。#ef7a6e級は画面の5%以下
const PRESETS = {
  morning: { hemi: 1.35, hemiSky: 0xfff4e0, key: 0xffe7c2, keyI: 1.9,
             seaNear: 0x8bcfc7, seaFar: 0xaabdb7, fog: 0xefe2cc },
  day:     { hemi: 1.5, hemiSky: 0xffffff, key: 0xfff4e2, keyI: 2.1,
             seaNear: 0x78cec6, seaFar: 0x78aaa9, fog: 0xd2ebe6 },
  dusk:    { hemi: 1.15, hemiSky: 0xffdfc4, key: 0xffb98a, keyI: 1.85,
             seaNear: 0x6fa7a4, seaFar: 0x7b7e8d, fog: 0xd7aa91 },
  night:   { hemi: 0.62, hemiSky: 0xbcd0f0, key: 0x91aac8, keyI: 1.0,
             seaNear: 0x34566a, seaFar: 0x293f52, fog: 0x394d5d },
};

const loadSprite = (name, scale) => {
  const tex = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}ui/${name}.webp`, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  }, undefined, () => sprite.removeFromParent());
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.setScalar(scale);
  return sprite;
};

export const createAtmosphere = (stage, reduceMotion) => {
  const { scene, span } = stage;
  const hemi = scene.children.find((c) => c.isHemisphereLight);
  const key = scene.children.find((c) => c.isDirectionalLight);

  let orb = null;
  let glows = [];
  let glowMat = null;
  let current = "day";

  const clearPhaseProps = () => {
    orb?.removeFromParent();
    orb = null;
    for (const g of glows) g.removeFromParent();
    glows = [];
  };

  const makeGlowMat = () => {
    if (glowMat) return glowMat;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 64;
    const g = cv.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, "rgba(255,220,150,0.9)");
    grad.addColorStop(1, "rgba(255,220,150,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    glowMat = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return glowMat;
  };

  /** phase: "morning"|"day"|"dusk"|"night"|"auto"(=台湾の実時間) */
  const applyPhase = (phase) => {
    const p2 = phase === "auto" || !PRESETS[phase] ? phaseOf(taiwanHour()) : phase;
    current = p2;
    const p = PRESETS[p2];
    if (hemi) {
      hemi.intensity = p.hemi;
      hemi.color.set(p.hemiSky);
    }
    if (key) {
      key.intensity = p.keyI;
      key.color.set(p.key);
    }
    stage.tintSea?.(p.seaNear, p.seaFar);
    if (stage.scene.fog) stage.scene.fog.color.set(p.fog);
    // ★背景はCSSの html[data-phase] グラデーションに移管(2026-08-23)。
    //   インラインの単色指定が残っているとCSSより強く、グラデーションが一生効かない
    document.documentElement.dataset.phase = p2; // CSS側の空グラデ・文字色切替に使う

    clearPhaseProps();
    // 太陽/月(空の右奥にゆっくり浮かぶ)
    if (p2 !== "day") {
      orb = loadSprite(p2 === "night" ? "moon" : "sun", span * 0.16);
      orb.position.set(span * 0.38, span * 0.6, -span * 0.18);
      scene.add(orb);
    }
    // 夜はミニランドマークの足元に灯り(additiveの放射グラデ)
    if (p2 === "night") {
      const mat = makeGlowMat();
      for (const grp of stage.groups) {
        const lm = grp.children.find((c) => c.isSprite);
        if (!lm) continue;
        const s = new THREE.Sprite(mat);
        s.scale.setScalar(lm.scale.x * 1.5);
        s.position.copy(lm.position);
        s.position.y += lm.scale.x * 0.2;
        grp.add(s);
        glows.push(s);
      }
    }
    return p2;
  };

  // 初期状態: 保存された選択 > ?phase= > 台湾の実時間
  let saved = null;
  try { saved = localStorage.getItem("phase"); } catch { /* 拒否環境 */ }
  const forced = new URLSearchParams(location.search).get("phase");
  applyPhase(PRESETS[forced] ? forced : saved ?? "auto");

  // ---- 雨(選択県市の天気に連動) ----
  const rain = { cloud: null, points: null, vel: null };
  const clearRain = () => {
    rain.cloud?.removeFromParent();
    if (rain.points) {
      rain.points.removeFromParent();
      rain.points.geometry.dispose();
    }
    rain.cloud = null;
    rain.points = null;
  };

  /** countyGroup の上に雨演出を出す。rainy=false なら消すだけ */
  const setRain = (countyGroup, rainy) => {
    clearRain();
    if (!countyGroup || !rainy) return;
    const box = new THREE.Box3().setFromObject(countyGroup);
    const c = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const r = Math.max(size.x, size.z) * 0.32;
    const topY = box.max.y + r * 0.9;

    const cloud = loadSprite("raincloud", r * 1.4);
    cloud.position.set(c.x, topY + r * 0.85, c.z);
    scene.add(cloud);
    rain.cloud = cloud;

    // 雨粒: Points+BufferGeometry(件数が少なく単純形状なのでInstancedMeshより適切)
    const N = reduceMotion ? 0 : 140;
    if (N) {
      const pos = new Float32Array(N * 3);
      const vel = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const a = Math.random() * Math.PI * 2;
        const rr = Math.sqrt(Math.random()) * r;
        pos[i * 3] = c.x + Math.cos(a) * rr;
        pos[i * 3 + 1] = topY - Math.random() * r * 1.6;
        pos[i * 3 + 2] = c.z + Math.sin(a) * rr;
        vel[i] = 9 + Math.random() * 5;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color: 0x9fd8e8, size: 0.5, transparent: true, opacity: 0.75, depthWrite: false,
      });
      const pts = new THREE.Points(geo, mat);
      pts.userData = { top: topY, bottom: box.max.y - size.y * 0.2 };
      scene.add(pts);
      rain.points = pts;
      rain.vel = vel;
    }
  };

  let t = 0;
  const update = (dt) => {
    t += dt;
    if (orb && !reduceMotion) orb.position.y += Math.sin(t * 0.5) * 0.004;
    if (rain.cloud && !reduceMotion) rain.cloud.position.x += Math.sin(t * 0.7) * 0.006;
    if (rain.points) {
      const pos = rain.points.geometry.attributes.position;
      const { top, bottom } = rain.points.userData;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - rain.vel[i] * dt;
        if (y < bottom) y = top;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
  };

  return { get phase() { return current; }, setPhase: applyPhase, setRain, update };
};
