import * as THREE from "three";

/**
 * おすすめコースの地図連動演出。
 * コース選択で: 停留所間をアーチ状の破線ルートが「伸びて」いき、
 * 番号ピンが到達順にぽんっと湧き、経由する県市が軽く持ち上がる。
 *
 * 破線は LineDashedMaterial + computeLineDistances() の正攻法
 * (https://threejs.org/docs/api/en/materials/LineDashedMaterial.html)。
 * 伸びる演出は geometry.setDrawRange で描画頂点数を時間経過で増やす。
 */
const ACCENT = 0xef7a6e;
const PIN_H = 15; // ピンとルートの基準高さ(押し出し天面より上)

export const createCourseLayer = (scene, bounds, groups, reduceMotion) => {
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const W = (x, y) => new THREE.Vector3(x - cx, PIN_H, -(y - cy));

  const layer = new THREE.Group();
  layer.name = "course";
  scene.add(layer);

  const byId = new Map(groups.map((g) => [g.userData.county.id, g]));
  let active = null; // {line, pins[], counties[], total, progress}

  const numberSprite = (n) => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ef7a6e";
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 64px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(n), 64, 68);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }),
    );
    sp.scale.set(0.001, 0.001, 1);
    return sp;
  };

  const clear = () => {
    if (!active) return;
    for (const g of active.counties) {
      g.userData.targetY = 0;
    }
    layer.clear();
    active = null;
  };

  const show = (course) => {
    clear();
    const stops = course.stops;
    if (stops.length < 2) return;

    // アーチ状ルート: 隣接停留所間を、距離に応じて持ち上げたベジェで結ぶ
    const pts = [];
    const perSeg = 26;
    for (let i = 0; i < stops.length - 1; i += 1) {
      const a = W(stops[i].x, stops[i].y);
      const b = W(stops[i + 1].x, stops[i + 1].y);
      const dist = a.distanceTo(b);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y += THREE.MathUtils.clamp(dist * 0.35, 4, 42);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const seg = curve.getPoints(perSeg);
      pts.push(...(i === 0 ? seg : seg.slice(1)));
    }
    // WebGLのLineは常に1pxで遠景では見えない(実測)ため、ルートはチューブで描く。
    // 伸びる演出は index の drawRange(チューブは進行方向にセグメント順で生成される)。
    const curvePath = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.0);
    const tubular = pts.length * 2;
    const geo = new THREE.TubeGeometry(curvePath, tubular, 0.85, 6, false);
    const line = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.92 }),
    );
    const totalIndex = geo.index.count;
    geo.setDrawRange(0, reduceMotion ? totalIndex : 0);
    layer.add(line);

    const pins = stops.map((st, i) => {
      const sp = numberSprite(i + 1);
      sp.center.set(0.5, 0.1);
      sp.position.copy(W(st.x, st.y));
      layer.add(sp);
      return sp;
    });

    // 経由県市を軽く持ち上げてルートを浮かび上がらせる
    const isos = [...new Set(stops.map((s) => s.iso).filter(Boolean))];
    const counties = isos.map((iso) => byId.get(iso)).filter(Boolean);
    for (const g of counties) g.userData.targetY = 4;

    active = {
      line,
      pins,
      counties,
      total: totalIndex,
      perStop: totalIndex / (stops.length - 1),
      progress: reduceMotion ? totalIndex : 0,
    };
    if (reduceMotion) {
      for (const p of pins) p.scale.set(7, 7, 1);
    }
  };

  /** 毎フレーム: ルートが伸び、先端が停留所を過ぎるとピンが湧く */
  const update = (dt) => {
    if (!active) return;
    if (active.progress < active.total) {
      // 3秒程度で全線が引き終わる速度
      active.progress = Math.min(active.progress + dt * active.total * 0.35, active.total);
      // indexは三角形単位(3の倍数)で切る
      active.line.geometry.setDrawRange(0, Math.floor(active.progress / 3) * 3);
    }
    active.pins.forEach((pin, i) => {
      const reached = active.progress >= Math.max(0, i - 0.15) * active.perStop;
      if (!reached) return;
      const target = 7;
      const k = pin.scale.x;
      if (k < target) {
        const nk = Math.min(k + dt * 34, target);
        pin.scale.set(nk, nk, 1);
      }
    });
  };

  return { show, clear, update, isActive: () => active !== null };
};
