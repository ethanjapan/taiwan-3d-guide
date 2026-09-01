import * as THREE from "three";

export const PALETTE = {
  // 海は Panel A の #7EDBD2 だと陸の緑と明度が近く境界が溶けたので、
  // アイコンから実測した青緑 (#3CCCB4 系) に寄せて一段深くしている。
  sea: 0x4ec9bd,
  land: 0xa8e0c1,
  landDeep: 0x75c9a7,
  sand: 0xf7e3b2,
  accent: 0xef7a6e,
};

// 島全体の南北は約290単位。厚みが数単位だと俯瞰では平面にしか見えないので大きめに取る。
const EXTRUDE = 10.0;
const LIFT = 14.0; // 選択時に持ち上がる高さ

/**
 * 県市の色。アイコンシートから実測した緑 (#B4CC6C / #9CCC54 / #6CB43C) を基準に、
 * 明度と黄緑寄りの度合いを振った6色。青緑の海に対して十分な差が出る範囲に収めている。
 */
const LAND_COLORS = [0xa9d97f, 0x8ecb72, 0xc2de92, 0x77bd68, 0x9ed48c, 0xb6d885];

/** GeoJSON由来の [x, y] 配列を THREE.Shape にする。穴も持たせる。 */
const toShape = ({ outer, holes }) => {
  const shape = new THREE.Shape(outer.map(([x, y]) => new THREE.Vector2(x, y)));
  for (const hole of holes) {
    shape.holes.push(new THREE.Path(hole.map(([x, y]) => new THREE.Vector2(x, y))));
  }
  return shape;
};

/**
 * 県市1つ分のメッシュ群を作る。
 * 押し出しは XY 平面に対して行われるので、出来上がりを寝かせて地面にする。
 */
/** ポリゴンの広がり(長辺)。厚みを決めるのに使う。 */
const spanOf = (ring) => {
  const xs = ring.map(([x]) => x);
  const ys = ring.map(([, y]) => y);
  return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
};

const buildCounty = (county, index) => {
  const group = new THREE.Group();
  group.name = county.id;
  group.userData.county = county;

  // 隣り合う県市が同じ色にならないよう、6色を巡回させる。
  const base = new THREE.Color(LAND_COLORS[index % LAND_COLORS.length]);

  const material = new THREE.MeshStandardMaterial({
    color: base,
    roughness: 0.85,
    metalness: 0.0,
    flatShading: true,
  });
  // 側面は砂色。上面より暗く落として、地面が板であることを見せる。
  const sideMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.sand).multiplyScalar(0.82),
    roughness: 0.95,
    metalness: 0.0,
    flatShading: true,
  });

  let topZ = 0;
  for (const polygon of county.polygons) {
    // 厚みは島ごとに決める。県市単位で決めると、澎湖や馬祖の小島が
    // 本体と同じ厚みになってマッチ棒のような柱に見える。
    const depth = THREE.MathUtils.clamp(spanOf(polygon.outer) * 0.2, 1.0, EXTRUDE);
    topZ = Math.max(topZ, depth + 0.9);
    const geometry = new THREE.ExtrudeGeometry(toShape(polygon), {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.9,
      bevelSize: 0.5,
      bevelSegments: 1,
    });
    // 上面(材質0)と側面(材質1)を塗り分ける。
    const mesh = new THREE.Mesh(geometry, [material, sideMaterial]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  group.userData.material = material;
  group.userData.baseColor = base.clone();
  group.userData.restY = 0;
  group.userData.targetY = 0;
  group.userData.topZ = topZ; // ランドマークを立てる高さ(押し出し天面)
  return group;
};

export const createScene = (canvas, counties, bounds) => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  // PCFSoftShadowMap は three 0.185 で非推奨(内部で PCF に落とされる)。
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(42, 1, 1, 2000);

  // 島を寝かせるための親。以降 y が高さになる。
  const world = new THREE.Group();
  world.rotation.x = -Math.PI / 2;
  scene.add(world);

  const groups = counties.map((county, i) => {
    const group = buildCounty(county, i);
    world.add(group);
    return group;
  });

  // 島の中心を原点へ寄せる。
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  world.position.set(-cx * 0, 0, 0);
  for (const g of groups) g.position.set(-cx, -cy, 0);

  const spanX = bounds.maxX - bounds.minX;
  const spanY = bounds.maxY - bounds.minY;
  const span = Math.max(spanX, spanY);

  // ---- 海 ----
  // 平坦な単色円盤は「つまらない」(2026-08-21ユーザー指摘)ので3層構成にする:
  //  1. 波: 頂点をサイン波2オクターブで上下させ、flatShadingでlow-polyの水面に
  //  2. 深度グラデーション: 島から遠いほど深い色(頂点カラー)
  //  3. 海岸の泡: 県市ポリゴンをCanvasに描いてぼかした輪郭リングをコースト沿いに敷く
  const sea = new THREE.Group();
  sea.name = "sea";

  const SEA_SIZE = span * 3.2;
  const SEG = 110;
  const waveGeo = new THREE.PlaneGeometry(SEA_SIZE * 2, SEA_SIZE * 2, SEG, SEG);
  waveGeo.rotateX(-Math.PI / 2);
  const pos = waveGeo.attributes.position;
  const baseXZ = new Float32Array(pos.count * 2);
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i += 1) {
    baseXZ[i * 2] = pos.getX(i);
    baseXZ[i * 2 + 1] = pos.getZ(i);
  }
  // ★時間帯の海色は material.color の乗算では作れない(暖色×青緑=濁った緑。
  //   2026-08-23 dusk で実害)。頂点色そのものをパレットで作り直す。
  //   near=島の際 / far=沖。沖は「空を映している」色にすると俯瞰でも時間帯が伝わる
  const tintSea = (nearHex, farHex) => {
    const shallow = new THREE.Color(nearHex);
    const deep = new THREE.Color(farHex);
    const tmpC = new THREE.Color();
    for (let i = 0; i < pos.count; i += 1) {
      const d = Math.min(Math.hypot(baseXZ[i * 2], baseXZ[i * 2 + 1]) / (span * 0.85), 1);
      tmpC.copy(shallow).lerp(deep, d * d);
      colors[i * 3] = tmpC.r;
      colors[i * 3 + 1] = tmpC.g;
      colors[i * 3 + 2] = tmpC.b;
    }
    waveGeo.attributes.color.needsUpdate = true;
  };
  waveGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  tintSea(PALETTE.sea, new THREE.Color(PALETTE.sea).offsetHSL(0.015, 0.05, -0.13).getHex());
  const water = new THREE.Mesh(
    waveGeo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.55,
      metalness: 0.05,
      flatShading: true,
    }),
  );
  water.receiveShadow = true;
  sea.add(water);

  // 波の更新。中心付近(島の下)はほぼ動かさず、沖ほど揺らす。
  const WAVE_R = span * 0.62; // これより内側は静か(島がぷかぷかしないように)
  const updateSea = (t) => {
    for (let i = 0; i < pos.count; i += 1) {
      const x = baseXZ[i * 2];
      const z = baseXZ[i * 2 + 1];
      const r = Math.hypot(x, z);
      const amp = THREE.MathUtils.clamp((r - WAVE_R) / (span * 0.9), 0, 1) * 1.1 + 0.12;
      pos.setY(
        i,
        Math.sin(x * 0.055 + t * 0.9) * amp * 0.55 +
          Math.sin(z * 0.042 - t * 0.63) * amp * 0.45 +
          Math.sin((x + z) * 0.024 + t * 0.35) * amp * 0.35,
      );
    }
    pos.needsUpdate = true;
    waveGeo.computeVertexNormals();
  };
  updateSea(0);

  // 海岸の泡リング: 全ポリゴンの白シルエットをぼかし、内側をくり抜いた輪だけ残す
  {
    const CANVAS = 1024;
    const foamSpan = span * 0.78; // 泡テクスチャが覆う半径(データ座標)
    const cnv = document.createElement("canvas");
    cnv.width = cnv.height = CANVAS;
    const ctx = cnv.getContext("2d");
    const toPx = (x, y) => [
      ((x + foamSpan) / (foamSpan * 2)) * CANVAS,
      ((foamSpan - y) / (foamSpan * 2)) * CANVAS,
    ];
    const trace = () => {
      ctx.beginPath();
      for (const county of counties) {
        for (const polygon of county.polygons) {
          polygon.outer.forEach(([px, py], i) => {
            const [X, Y] = toPx(px - cx, py - cy);
            if (i === 0) ctx.moveTo(X, Y);
            else ctx.lineTo(X, Y);
          });
          ctx.closePath();
        }
      }
    };
    ctx.filter = "blur(10px)";
    ctx.fillStyle = "#ffffff";
    trace();
    ctx.fill();
    ctx.filter = "none";
    ctx.globalCompositeOperation = "destination-out";
    trace();
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    const foamTex = new THREE.CanvasTexture(cnv);
    const foam = new THREE.Mesh(
      new THREE.PlaneGeometry(foamSpan * 2, foamSpan * 2),
      new THREE.MeshBasicMaterial({
        map: foamTex,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
    foam.rotation.x = -Math.PI / 2;
    // seaグループはEXTRUDE/2だけ沈めてあるので、泡は陸の底面(world y=0)の直下に合わせる
    foam.position.y = EXTRUDE * 0.5 - 0.15;
    foam.name = "foam";
    sea.add(foam);
  }

  sea.position.y = -EXTRUDE * 0.5;
  scene.add(sea);

  // 霧。沖の海が時間帯の色へ溶けていく(俯瞰では空が映らないので、これが空の代わり)
  scene.fog = new THREE.Fog(0xcdefe9, span * 2.2, span * 3.4);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xbfe6dc, 1.5));
  const key = new THREE.DirectionalLight(0xfff4e2, 2.1);
  key.position.set(-span * 0.6, span * 1.1, span * 0.7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const d = span * 0.9;
  Object.assign(key.shadow.camera, { left: -d, right: d, top: d, bottom: -d, near: 1, far: span * 4 });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.bias = -0.0008;
  scene.add(key);

  return {
    renderer, scene, camera, world, groups, sea, span, updateSea, tintSea, bounds,   // bounds=イベントピンの座標計算に要る
    frameWidth: spanX, frameHeight: spanY,
    extrude: EXTRUDE, lift: LIFT,
  };
};
