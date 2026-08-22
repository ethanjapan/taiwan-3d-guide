# -*- coding: utf-8 -*-
"""季節イベントを組み立てる。月スライダーと地図ピンの元データ。出力: data/events.json

★手で書き起こさない。本体は交通部觀光署「活動」オープンデータ(954件・景点データと同じ
  政府資料開放授權條款第1版)。data/source/EventList.json に取り込んである。
  日本版が緯度から桜前線を出したのと同じ発想で、**公式データから機械で組む**。
  台湾の祭りは旧暦で年ごとに動くので、これは特に効く。

やること:
 1. 住所の City を県市ISOへ写す(LocatedCities は空なので PostalAddress を使う)
 2. マラソン・展覧会・販促を落とし、季節と文化のものだけ残す
 3. 名前と説明からカテゴリを決める(日本版と同じ7種の素材を使い回す)
 4. tools/event_picks.py の優先語で県市ごとに代表を選ぶ
 5. 公式データに無い定番(平溪天燈・鹽水蜂炮・大甲媽祖など)を手当てで足す
 6. 訳語は tools/event_names.py。cn は zh から t2s の一方向生成

実行: python3 tools/build_events.py
"""
import collections
import json
import os
import re
import sys

import opencc

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from event_picks import EXTRA, PRIORITY  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
T2S = opencc.OpenCC("t2s")
L = ("zh", "ja", "cn", "en", "ko")

ISO = {"基隆市": "TW-KEE", "臺北市": "TW-TPE", "新北市": "TW-NWT", "桃園市": "TW-TAO",
       "新竹市": "TW-HSZ", "新竹縣": "TW-HSQ", "苗栗縣": "TW-MIA", "臺中市": "TW-TXG",
       "彰化縣": "TW-CHA", "南投縣": "TW-NAN", "雲林縣": "TW-YUN", "嘉義市": "TW-CYI",
       "嘉義縣": "TW-CYQ", "臺南市": "TW-TNN", "高雄市": "TW-KHH", "屏東縣": "TW-PIF",
       "宜蘭縣": "TW-ILA", "花蓮縣": "TW-HUA", "臺東縣": "TW-TTT", "連江縣": "TW-LIE",
       "金門縣": "TW-KIN", "澎湖縣": "TW-PEN"}

# 観光の季節イベントでないものを落とす
DROP = re.compile(r"馬拉松|路跑|越野賽|自由車|鐵人|特展|展覽|博覽會|講座|研習|工作坊|說明會|"
                  r"招募|徵件|優惠|獎勵|憑.*機票|記者會|頒獎|評選|培訓|課程|論壇|研討|巡迴|"
                  r"常設|園區駐園|個展|演唱會|尾牙|補助|方案|問卷|抽獎|活動報名|保健品展")
KEEP = re.compile(r"節|祭|季|嘉年華|遶境|廟會|燈會|天燈|蜂炮|花火|煙火|櫻花|螢火蟲|花海|花田|"
                  r"音樂節|藝術節|文化節|市集|迎王|炸寒單|搶孤|中元|端午|龍舟|溫泉|星空|光雕|"
                  r"光影|夜巡|城隍|豐年")

# 日本版の素材7種をそのまま使う(櫻花/花火/廟會/紅葉・芒花/雪/花/燈火)
CAT_RULES = [
    ("sakura", r"櫻花|櫻季|賞櫻|櫻祭"),
    ("hanabi", r"花火|煙火|焰火|蜂炮"),
    ("illumi", r"燈會|天燈|燈節|光雕|光影|燈籠|星空|藍眼淚|聖誕|跨年"),
    ("koyo", r"楓|紅葉|芒花|落羽松|銀杏|秋收"),
    ("snow", r"賞雪|雪季|雪祭"),
    ("flower", r"花季|花海|花田|海芋|金針|繡球|桐花|荷花|蓮花|油菜花|鬱金香|波斯菊|花卉|柚花|梅花|魯冰花"),
    ("matsuri", r"祭|遶境|廟會|節|嘉年華|市集|迎王|搶孤|中元|端午|龍舟|城隍|夜巡|豐年"),
]

CAT_LABEL = {
    "sakura": {"zh": "櫻花", "ja": "桜", "cn": "樱花", "en": "Cherry blossom", "ko": "벚꽃"},
    "hanabi": {"zh": "花火", "ja": "花火", "cn": "花火", "en": "Fireworks", "ko": "불꽃놀이"},
    "matsuri": {"zh": "祭典", "ja": "祭り", "cn": "祭典", "en": "Festival", "ko": "축제"},
    "koyo": {"zh": "紅葉・芒花", "ja": "紅葉・ススキ", "cn": "红叶・芒花", "en": "Autumn colours", "ko": "단풍·억새"},
    "snow": {"zh": "賞雪", "ja": "雪", "cn": "赏雪", "en": "Snow", "ko": "설경"},
    "flower": {"zh": "花季", "ja": "花", "cn": "花季", "en": "Flowers", "ko": "꽃"},
    "illumi": {"zh": "燈火", "ja": "灯り", "cn": "灯火", "en": "Lights", "ko": "빛 축제"},
}


def cat_of(name, desc=""):
    t = f"{name} {desc}"
    for c, rx in CAT_RULES:
        if re.search(rx, t):
            return c
    return "matsuri"


def months_of(start, end):
    def mo(x):
        return int(x[5:7]) if x and len(x) >= 7 else None
    a, b = mo(start), mo(end)
    if not a:
        return []
    if not b or b == a:
        return [a]
    out, m = [], a
    for _ in range(12):
        out.append(m)
        if m == b:
            break
        m = m % 12 + 1
    # 通年に近いものは「その月のイベント」として意味がないので開始月だけ
    return out if len(out) <= 5 else [a]


def peak_label(months):
    if not months:
        return {k: "" for k in L}
    if len(months) == 1:
        m = months[0]
        return {"zh": f"{m}月", "ja": f"{m}月", "cn": f"{m}月", "ko": f"{m}월",
                "en": ["January", "February", "March", "April", "May", "June", "July",
                       "August", "September", "October", "November", "December"][m - 1]}
    a, b = months[0], months[-1]
    return {"zh": f"{a}〜{b}月", "ja": f"{a}〜{b}月", "cn": f"{a}〜{b}月", "ko": f"{a}〜{b}월",
            "en": f"{a}–{b}"}


raw = json.load(open("data/source/EventList.json", encoding="utf-8-sig"))["Events"]
cand = collections.defaultdict(list)
for x in raw:
    city = (x.get("PostalAddress") or {}).get("City")
    iso = ISO.get(city)
    if not iso:
        continue
    nm = (x.get("EventName") or "").strip()
    if not nm or DROP.search(nm) or not KEEP.search(nm):
        continue
    ms = months_of(x.get("StartDateTime"), x.get("EndDateTime"))
    if not ms:
        continue
    cand[iso].append({"name": nm, "m": ms, "cat": cat_of(nm, x.get("Description") or ""),
                      "img": bool(x.get("Images"))})

NAMES = json.load(open("data/i18n/event-names.json", encoding="utf-8")) \
    if os.path.exists("data/i18n/event-names.json") else {}

out = {}
picked_names = []
for iso in ISO.values():
    evs = []
    seen = set()
    # 1) 優先語に当たるものから
    for word in PRIORITY.get(iso, []):
        for e in cand.get(iso, []):
            if word in e["name"] and e["name"] not in seen:
                seen.add(e["name"])
                evs.append(e)
                break
    # 2) 足りなければカテゴリが被らないものから補う
    for e in sorted(cand.get(iso, []), key=lambda z: (not z["img"], z["name"])):
        if len(evs) >= 3:
            break
        if e["name"] in seen or any(z["cat"] == e["cat"] for z in evs):
            continue
        seen.add(e["name"])
        evs.append(e)
    out[iso] = []
    for e in evs:
        zh = e["name"]
        nm = NAMES.get(zh)
        name = {"zh": zh, "cn": T2S.convert(zh),
                "ja": (nm or {}).get("ja", zh), "en": (nm or {}).get("en", zh),
                "ko": (nm or {}).get("ko", zh)}
        if not nm:
            picked_names.append(zh)
        out[iso].append({"cat": e["cat"], "m": e["m"], "peak": peak_label(e["m"]), "name": name})

# 3) 公式データに無い定番を足す
for iso, cat, ms, zh, ja, en, ko, peak in EXTRA:
    out.setdefault(iso, []).append({
        "cat": cat, "m": ms,
        "peak": {"zh": peak[0], "ja": peak[1], "cn": T2S.convert(peak[0]),
                 "en": peak[2], "ko": peak[3]},
        "name": {"zh": zh, "ja": ja, "cn": T2S.convert(zh), "en": en, "ko": ko}})

json.dump({"cats": CAT_LABEL, "pref": out},
          open("data/events.json", "w", encoding="utf-8"), ensure_ascii=False)

n = sum(len(v) for v in out.values())
by_cat = collections.Counter(e["cat"] for v in out.values() for e in v)
print(f"イベント {n}件 / {len([k for k, v in out.items() if v])}県市  内訳 {dict(by_cat)}")
per = {m: 0 for m in range(1, 13)}
for v in out.values():
    for e in v:
        for m in e["m"]:
            per[m] += 1
print("月別:", " ".join(f"{m}月{c}" for m, c in per.items()))
if picked_names:
    json.dump(sorted(set(picked_names)), open("/tmp/need_names.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"★訳語が未登録: {len(set(picked_names))}件 → /tmp/need_names.json")
