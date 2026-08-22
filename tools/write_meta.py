# -*- coding: utf-8 -*-
"""公式データの更新日を data/meta.json に書き出す。画面の「資料更新日」に出る。

なぜ要るか(2026-08-23):
  「公式データをそのまま使っている」がこのサイトの主張なのに、
  **いつ時点のデータかを画面のどこにも書いていなかった**。
  読む側からは1年前の写しと今日の写しの区別が付かず、主張が検証できない。
  観光署は毎日更新している(UpdateInterval=86400)ので、日付は出せば意味がある。

fetch_opendata.py の直後に走らせる。手で書かない(書いた瞬間に腐る)。
実行: python3 tools/write_meta.py
"""
import json
import os
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

SRC = [
    ("attractions", "data/source/AttractionList.json", "Attractions"),
    ("events", "data/source/EventList.json", "Events"),
]

# 画面の「照片」行が {photos} を使う。
# ★クレジット表(photo-credits-*.json)の件数ではない。あれは Wikimedia Commons 由来の
#   9枚だけで、残り216枚は観光署の公式データに同梱された写真。
#   両方合わせた**実際に載っている枚数**を数える(2026-08-23、9件と誤表示して気づいた)
_n_photo = len([f for f in os.listdir("public/photos") if not f.startswith(".")])
_n_commons = 0
for f in ("data/photo-credits-commons.json", "data/photo-credits-courses.json"):
    if os.path.exists(f):
        _n_commons += len(json.load(open(f, encoding="utf-8")))

meta = {"sources": {"photos": {"count": _n_photo, "commons": _n_commons}}}
for name, path, key in SRC:
    d = json.load(open(path, encoding="utf-8-sig"))
    meta["sources"][name] = {
        "updated": (d.get("UpdateTime") or "")[:10],     # 画面には日付だけ出す
        "count": len(d.get(key) or []),
    }

# サイト側の作り直し日。データの日付と混同しないよう別のキーにする
meta["built"] = subprocess.run(
    ["date", "+%Y-%m-%d"], capture_output=True, text=True).stdout.strip()

with open("data/meta.json", "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=2)
    f.write("\n")

for k, v in meta["sources"].items():
    print(f"  {k:12} {v.get('updated', '—'):12} {v['count']}件")
print(f"  built        {meta['built']}  → data/meta.json")
