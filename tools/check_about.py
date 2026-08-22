# -*- coding: utf-8 -*-
"""「このサイトについて」の {置換子} が全部埋まるか、投入前に確かめる。

なぜ要るか(2026-08-23):
  件数や更新日を画面に手で書くと、増減した瞬間に嘘になる。だから {spots} のような
  置換子にして data/meta.json の実数で埋めている。
  ただし**埋め残しは静かに `{spots}` と表示されるだけ**で、誰も気づかない。
  ここで機械的に突き合わせる。

見るもの:
  1. ABOUT の全言語で使われている置換子 → main.js の vals に対応があるか
  2. その対応先が data/meta.json に実在するか(値が欠けていないか)
  3. 全言語が同じ行数・同じ置換子を持つか(1言語だけ古い、を防ぐ)

実行: python3 tools/check_about.py
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

i18n = open("src/i18n.js", encoding="utf-8").read()
main = open("src/main.js", encoding="utf-8").read()
meta = json.load(open("data/meta.json", encoding="utf-8"))

m = re.search(r"export const ABOUT = \{(.*)\n\};", i18n, re.S)
if not m:
    sys.exit("!! src/i18n.js に ABOUT が無い")
about = m.group(1)

# 言語ごとに置換子と行数を拾う
langs = {}
for lm in re.finditer(r"\n  (\w+): \{(.*?)\n  \},", about, re.S):
    body = lm.group(2)
    langs[lm.group(1)] = {
        "rows": len(re.findall(r'\n      \["', body)),
        "ph": sorted(set(re.findall(r"\{(\w+)\}", body))),
    }

if not langs:
    sys.exit("!! ABOUT の言語が読めなかった")

# main.js の vals に載っている名前
vm = re.search(r"const vals = \{(.*?)\n  \};", main, re.S)
if not vm:
    sys.exit("!! main.js に aboutSection の vals が無い")
known = set(re.findall(r"^\s*(\w+):", vm.group(1), re.M))

# meta.json 側に実際の値があるか(名前ではなく、埋まる値の有無を見る)
src = meta.get("sources") or {}
have = {
    "spots": (src.get("spots") or src.get("attractions") or {}).get("count"),
    "events": (src.get("events") or {}).get("count"),
    "photos": (src.get("photos") or {}).get("count"),
    "commons": (src.get("photos") or {}).get("commons"),
    "updated": (src.get("attractions") or {}).get("updated"),
    "built": meta.get("built"),
}

bad = []
base_lang, base = next(iter(langs.items()))
for lg, info in langs.items():
    if info["rows"] != base["rows"]:
        bad.append(f"{lg}: 行数 {info['rows']}(基準 {base_lang} は {base['rows']})。1言語だけ古い")
    for ph in info["ph"]:
        if ph not in known:
            bad.append(f"{lg}: {{{ph}}} を main.js の vals が知らない → 画面に {{{ph}}} と出る")
        elif have.get(ph) in (None, ""):
            bad.append(f"{lg}: {{{ph}}} の値が data/meta.json に無い → 画面に {{{ph}}} と出る")

print(f"言語 {len(langs)} / 各 {base['rows']}行 / 置換子 {sorted(set(sum((v['ph'] for v in langs.values()), [])))}")
for k in sorted(set(sum((v["ph"] for v in langs.values()), []))):
    print(f"  {{{k}}} → {have.get(k)}")

if bad:
    print(f"\n!! {len(bad)}件")
    for x in bad:
        print("  ", x)
    sys.exit(1)
print("埋め残しなし")
