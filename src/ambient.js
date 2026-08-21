import * as THREE from "three";

/**
 * アイドル時のアンビエント演出。雲が流れ、船が海を行き、飛行機が旋回し、
 * 台東の空に熱気球が浮かぶ。素材(public/ambient/*.webp)が無い間は
 * 読み込み失敗を握りつぶして何も出さない=生成完了前でも安全に組み込める。
 */
export const createAmbient = (scene, bounds, reduceMotion) => {
  const loader = new THREE.TextureLoader();
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  // データ座標 → ワールド座標(世界はX軸で-90度寝かせてある)
  const W = (x, y) => [x - cx, -(y - cy)];
  const span = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);

  const make = (name, size, opacity = 1) => {
    let sprite;
    const tex = loader.load(
      `${import.meta.env.BASE_URL}ambient/${name}.webp`,
      undefined,
      undefined,
      () => {
        if (sprite) sprite.visible = false;
      },
    );
    tex.colorSpace = THREE.SRGBColorSpace;
    sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity }),
    );
    sprite.scale.set(size, size, 1);
    scene.add(sprite);
    return sprite;
  };

  const clouds = [make("cloud-a", 36, 0.92), make("cloud-b", 26, 0.9), make("cloud-a", 20, 0.8)];
  const boats = [make("boat-a", 9), make("boat-b", 11)];
  const plane = make("plane", 13);
  const balloon = make("balloon", 10);

  const [bx, bz] = W(6, -52); // 台東の上空

  // 船の航路半径: 島の最遠頂点(実測~150)より外側を回す。内側だと陸に乗り上げる。
  const seaR = span * 0.63;

  const update = (t) => {
    for (let i = 0; i < clouds.length; i += 1) {
      const p = ((t * (2.0 + i * 0.8) + i * 137) % (span * 1.7)) - span * 0.85;
      clouds[i].position.set(p, 46 + i * 9, -50 + i * 52);
    }
    const a1 = t * 0.10;
    const a2 = -t * 0.075 + 2.1;
    boats[0].position.set(Math.cos(a1) * seaR, 1.2, Math.sin(a1) * seaR * 0.9);
    boats[1].position.set(Math.cos(a2) * seaR * 1.12, 1.2, Math.sin(a2) * seaR);
    plane.position.set(
      Math.cos(t * 0.16) * span * 0.5,
      34 + 5 * Math.sin(t * 0.4),
      Math.sin(t * 0.16) * span * 0.42,
    );
    balloon.position.set(bx + 1.5 * Math.sin(t * 0.35), 25 + 2.4 * Math.sin(t * 0.8), bz);
  };

  update(0);
  return { update: reduceMotion ? () => {} : update };
};
