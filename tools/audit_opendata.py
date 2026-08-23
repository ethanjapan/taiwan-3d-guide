# -*- coding: utf-8 -*-
"""觀光署の公式オープンデータそのものを検査し、誤りを一覧にする。

なぜ作るか(2026-08-23):
  観光行政に「使わせてください」と頼むより、**先に何かを渡す**方が通りやすい。
  台湾の口罩地圖は、売り込みではなく「先に作って使われている状態」から
  政府がデータ開放で応じた。渡せるものは、こちらがデータを使う過程で見つけた
  「そちらのデータのここが壊れています」という一覧である。

  ここで出すのは**觀光署のデータの問題**であって、本サイトの問題ではない。
  だから憶測で「間違い」と言わない。機械で確実に判定できるものだけを挙げる。

検査するもの(すべて機械判定・主観を入れない):
  1. 座標が台湾の範囲外、または 0 / 欠落
  2. 同じ座標に複数の別施設(座標の使い回し)
  3. 住所の City と、座標が実際に落ちる県市がずれている
  4. 名前が完全に重複している別ID
  5. 必須級の項目が空(名前・座標・住所)
  6. 画像URL・公式サイトURLが開けない(★標本のみ。全件は相手のサーバを叩きすぎる)

実行:
  python3 tools/audit_opendata.py            1〜5(通信しない・数秒)
  python3 tools/audit_opendata.py --urls 200 6も。標本200件を1件ずつ間隔をあけて確認
"""
import collections
import json
import os
import random
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# 台湾本島+離島(澎湖・金門・馬祖・東沙まで)を含む範囲。
# ここを外れる座標は、緯度経度の取り違えや桁落ちで確実に誤り
LAT = (21.7, 26.5)
LON = (118.1, 122.1)

OUT = "docs/opendata-audit"

# geoBoundaries の英語名 → 觀光署が住所に書く中国語名。
# ★"City"/"County" を機械的に落とす曖昧一致にしたら、嘉義市と嘉義縣・新竹市と新竹縣が
#   同じものに潰れた。県市の取り違えを探す検査でそれをやったら本末転倒なので明示する
GB_ZH = {
    "Changhua County": "彰化縣", "Chiayi": "嘉義市", "Chiayi County": "嘉義縣",
    "Hsinchu": "新竹市", "Hsinchu County": "新竹縣", "Hualien County": "花蓮縣",
    "Kaohsiung": "高雄市", "Keelung": "基隆市", "Kinmen": "金門縣",
    "Matsu Islands": "連江縣", "Miaoli County": "苗栗縣", "Nantou County": "南投縣",
    "New Taipei": "新北市", "Penghu": "澎湖縣", "Pingtung County": "屏東縣",
    "Taichung": "臺中市", "Tainan": "臺南市", "Taipei": "臺北市",
    "Taitung County": "臺東縣", "Taoyuan": "桃園市", "Yilan County": "宜蘭縣",
    "Yunlin County": "雲林縣",
}


def same_city(a, b):
    """台/臺 の書き分けは誤りではない。正規化してから比べる"""
    tr = str.maketrans({"台": "臺"})
    return (a or "").translate(tr) == (b or "").translate(tr)


def load(name, key):
    d = json.load(open(f"data/source/{name}", encoding="utf-8-sig"))
    return d.get(key) or [], d.get("UpdateTime")


def county_of(lat, lon, shapes):
    """座標がどの県市に入るかを返す。判定できなければ None。

    ★穴(interior ring)を無視すると、嘉義市・新竹市のように県に完全に囲まれた市が
      すべて県の側だと判定される。実際そうなり、阿里山林業村(嘉義市)を
      「嘉義縣にある」と誤って誤りに数えた(2026-08-23、手で確かめて発覚)。
      外側の輪に入っていても、穴の中なら「入っていない」。
    """
    for name, polys in shapes:
        for outer, holes in polys:
            if not point_in_ring(lon, lat, outer):
                continue
            if any(point_in_ring(lon, lat, h) for h in holes):
                continue          # 飛び地の市の中。この県ではない
            return name
    return None


def dist_deg_to_rings(x, y, polys):
    """点から県市の輪郭までの最短距離(度)。境界上の施設を誤りに数えないための緩衝用"""
    best = 1e9
    for outer, _holes in polys:
        for i in range(len(outer)):
            ax, ay = outer[i - 1]
            bx, by = outer[i]
            dx, dy = bx - ax, by - ay
            if dx == 0 and dy == 0:
                d = ((x - ax) ** 2 + (y - ay) ** 2) ** 0.5
            else:
                t = max(0.0, min(1.0, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
                d = ((x - (ax + t * dx)) ** 2 + (y - (ay + t * dy)) ** 2) ** 0.5
            best = min(best, d)
    return best


def point_in_ring(x, y, ring):
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if (yi > y) != (yj > y):
            xx = (xj - xi) * (y - yi) / (yj - yi) + xi
            if x < xx:
                inside = not inside
        j = i
    return inside


def load_shapes():
    """県市の輪郭。地図に使っている geoBoundaries をそのまま使う"""
    p = "data/source/geoBoundaries-TWN-ADM1.geojson"
    if not os.path.exists(p):
        return []
    gj = json.load(open(p, encoding="utf-8"))
    out = []
    for f in gj["features"]:
        raw = f["properties"].get("shapeName") or ""
        name = GB_ZH.get(raw)
        if name is None:
            print(f"  ★県市名 '{raw}' の対応が無い。GB_ZH に足すこと")
            continue
        g = f["geometry"]
        # (外側の輪, [穴...]) の組にする。穴を捨てない
        polys = []
        if g["type"] == "Polygon":
            polys = [(g["coordinates"][0], g["coordinates"][1:])]
        elif g["type"] == "MultiPolygon":
            polys = [(p[0], p[1:]) for p in g["coordinates"]]
        out.append((name, polys))
    return out


UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")


def head(url, timeout=15):
    """開けるかどうかを見る。

    ★HEAD だけ・素のUAだと、WAF が弾いた 403/405 まで「切れている」に数えてしまう。
      相手に渡す資料でそれをやると、こちらの信用が飛ぶ。
      2段構えにする: まず軽い HEAD、落ちたら**ブラウザと同じUAで GET** して確かめる。
      相手のサーバを重くしないよう、GET は落ちたものだけ。
    """
    def run(args):
        return subprocess.run(args, capture_output=True, text=True,
                              timeout=timeout + 10).stdout.strip()

    code = run(["curl", "-sIL", "--max-time", str(timeout), "-A", UA,
                "-o", os.devnull, "-w", "%{http_code}", url])
    if code.startswith(("2", "3")):
        return code
    code2 = run(["curl", "-sL", "--max-time", str(timeout), "-A", UA,
                 "-H", "Accept: text/html,image/*,*/*",
                 "-o", os.devnull, "-w", "%{http_code}", url])
    return code2


def main():
    n_urls = 0
    if "--urls" in sys.argv:
        n_urls = int(sys.argv[sys.argv.index("--urls") + 1])

    attrs, t_attr = load("AttractionList.json", "Attractions")
    events, t_evt = load("EventList.json", "Events")
    shapes = load_shapes()
    print(f"觀光署データ {t_attr} / 景點 {len(attrs)}件・活動 {len(events)}件")
    print(f"県市の輪郭 {len(shapes)}件 {'(geoBoundaries)' if shapes else '★無いので県市の照合は飛ばす'}\n")

    findings = collections.defaultdict(list)

    def rec(kind, item, detail):
        findings[kind].append({
            "id": item.get("AttractionID") or item.get("EventID"),
            "name": item.get("AttractionName") or item.get("EventName"),
            "city": (item.get("PostalAddress") or {}).get("City"),
            "detail": detail,
        })

    by_coord = collections.defaultdict(list)
    by_name = collections.defaultdict(list)

    for it in attrs:
        lat, lon = it.get("PositionLat"), it.get("PositionLon")
        name = (it.get("AttractionName") or "").strip()
        addr = it.get("PostalAddress") or {}
        city = (addr.get("City") or "").strip()

        if not name:
            rec("名前が空", it, "AttractionName が空")
        if lat in (None, 0) or lon in (None, 0):
            rec("座標が無い", it, f"lat={lat} lon={lon}")
        elif not (LAT[0] <= lat <= LAT[1] and LON[0] <= lon <= LON[1]):
            rec("座標が台湾の外", it, f"lat={lat:.5f} lon={lon:.5f}")
        else:
            by_coord[(round(lat, 6), round(lon, 6))].append(it)
            if shapes and city:
                got = county_of(lat, lon, shapes)
                if got and not same_city(got, city):
                    # ★境界上の施設(石牌縣界公園)や、県市をまたぐ線状の施設
                    #   (阿里山林業鐵路)を「誤り」に数えないための緩衝。
                    #   住所に書かれた県市の輪郭から 0.02度(≒2km)以上離れている時だけ挙げる
                    claimed = next((pl for nm, pl in shapes if same_city(nm, city)), None)
                    far = claimed and dist_deg_to_rings(lon, lat, claimed) > 0.02
                    if far:
                        rec("住所と座標の県市が違う(要確認)", it,
                            f"住所は「{city}」だが座標は「{got}」の中")
        if not city:
            rec("住所の県市が空", it, "PostalAddress.City が空")
        if name:
            by_name[name].append(it)

    for (la, lo), group in by_coord.items():
        if len(group) > 1:
            names = "／".join(sorted({(g.get("AttractionName") or "") for g in group}))
            if len({(g.get("AttractionName") or "") for g in group}) > 1:
                rec("別々の施設が同じ座標", group[0], f"({la}, {lo}) に {len(group)}件: {names[:70]}")

    # 重複は「同じ機関が2件出した」と「別々の機関が同じ施設を出した」で意味が違う。
    # 前者は明らかな誤り、後者は集約時の名寄せの問題。分けないと相手が動けない
    for nm, group in by_name.items():
        if len(group) < 2:
            continue
        provs = {g["AttractionID"].split("_")[1] for g in group}
        pts = [(g.get("PositionLat"), g.get("PositionLon")) for g in group
               if g.get("PositionLat") and g.get("PositionLon")]
        gap = 0.0
        if len(pts) > 1:
            gap = max(((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5
                      for a in pts for b in pts) * 111000      # 度→おおよそメートル
        ids = "／".join(sorted(g["AttractionID"] for g in group))
        det = f"{len(group)}件・提供機関{len(provs)}／座標のずれ最大 約{gap:.0f}m／{ids}"
        if len(provs) == 1:
            rec("同じ機関が同じ名前を2件登録", group[0], det)
        else:
            rec("別々の機関が同じ施設を登録(名寄せ)", group[0], det)

    # ---- 標本でURLを確認 ----
    url_stat = {}
    if n_urls:
        pool = []
        for it in attrs:
            for im in (it.get("Images") or []):
                u = (im.get("URL") or "").strip()
                if u.startswith("http"):
                    pool.append((it, "画像", u))
            w = (it.get("WebsiteURL") or "").strip()
            if w.startswith("http"):
                pool.append((it, "公式サイト", w))
        random.seed(20260823)          # 何度走らせても同じ標本になるようにする
        sample = random.sample(pool, min(n_urls, len(pool)))
        print(f"URLの標本 {len(sample)}件 を確認します(全 {len(pool)}件から。"
              f"相手のサーバを叩きすぎないよう1件ずつ間隔をあけます)")
        ok = ng = 0
        for i, (it, kind, u) in enumerate(sample, 1):
            code = head(u)
            if code.startswith(("2", "3")):
                ok += 1
            else:
                ng += 1
                rec(f"{kind}のURLが開けない", it, f"HTTP {code} {u[:80]}")
            if i % 25 == 0:
                print(f"    {i}/{len(sample)}  開ける {ok} / 開けない {ng}")
            time.sleep(0.35)
        url_stat = {"標本": len(sample), "母数": len(pool), "開ける": ok, "開けない": ng}
        print()

    os.makedirs(OUT, exist_ok=True)
    report = {
        "観光署データの更新日": t_attr,
        "景點": len(attrs), "活動": len(events),
        "URL標本": url_stat,
        "件数": {k: len(v) for k, v in sorted(findings.items(), key=lambda x: -len(x[1]))},
        "明細": {k: v for k, v in findings.items()},
    }
    with open(f"{OUT}/audit.json", "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print("見つかったもの:")
    for k, v in sorted(findings.items(), key=lambda x: -len(x[1])):
        print(f"  {len(v):5}件  {k}")
        for x in v[:2]:
            print(f"           例: {x['name']}（{x['city']}）{x['detail'][:60]}")
    if url_stat:
        print(f"\nURL: 標本{url_stat['標本']}件中 開けない {url_stat['開けない']}件")
    print(f"\n→ {OUT}/audit.json")


if __name__ == "__main__":
    main()
