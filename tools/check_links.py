# -*- coding: utf-8 -*-
"""本文に書いたドメインが、全部「実際に開ける飛び先」を持っているか確かめる。

なぜ要るか(2026-08-23 実害):
  「官方網站」節のドメインはただの文字列で、押せなかった。
  さらにリンクにする時、裸のドメインをそのまま href にしようとしたら
  **12件中6件が繋がらなかった**(www の要否がサイトごとに逆)。
  表示文字列と飛び先は別物なので、対応表を持ち、ここで機械的に突き合わせる。

見るもの:
  1. travelinfo.js の本文に出てくるドメイン → SITE_URL に載っているか
  2. SITE_URL にあるが本文のどこからも指されていないもの(腐った行)
  3. --net を付けた時だけ: その URL が本当に応答するか(HEADが403でもGETで見る)

実行: python3 tools/check_links.py [--net]
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SRC = open("src/travelinfo.js", encoding="utf-8").read()

# 実ブラウザでは開けるが、urllib/curl だと WAF に 403 で弾かれるサイト。
# 憶測で除外しない: ここに書くのは**ブラウザで開いて中身を確認した**ものだけ
EXPECT_403 = {
    "taoyuan-airport.com",     # 2026-08-23 ブラウザで確認(桃園國際機場のトップが出た)
    "kansai-airport.or.jp",    # 2026-08-23 ブラウザで確認(関西国際空港のトップが出た)
}

# SITE_URL の中身(文字列でも {_:..., ja:...} でも拾う)
m = re.search(r"export const SITE_URL = \{(.*?)\n\};", SRC, re.S)
if not m:
    print("!! src/travelinfo.js に SITE_URL が無い"); sys.exit(1)
table_src = m.group(1)
table = {}
for key, rest in re.findall(r'"([\w.-]+)"\s*:\s*([^\n]+)', table_src):
    table[key] = re.findall(r'"(https?://[^"]+)"', rest)

# 本文(SITE_URL の定義そのものは除く)に出てくるドメイン。
# ★travelinfo.js だけ見ていたら、main.js 側の出典表示(open-meteo)を
#   「どこからも指されていない」と誤報した。linkify を通す文字列は src 全体にある
body = SRC[: m.start()] + SRC[m.end():]
for _f in sorted(os.listdir("src")):
    if _f.endswith(".js") and _f != "travelinfo.js":
        body += "\n" + open(os.path.join("src", _f), encoding="utf-8").read()
# ★完全なURL(PROMO_CHANNEL の youtube 等)は本文の文字列ではなくコード側の値で、
#   linkify の対象にならない。裸で書かれたドメインだけを見る
body = re.sub(r"https?://[^\s\"']+", " ", body)
# ★出典メモ(「…(tymetro/Trip.com)」等)はコメントで、画面には出ない。
#   ここを見ていたら trip.com / jp.taiwan.net.tw を「リンク切れ」と誤報した
body = re.sub(r"/\*.*?\*/", " ", body, flags=re.S)
body = re.sub(r"^\s*//.*$", " ", body, flags=re.M)
body = re.sub(r"^\s*\*.*$", " ", body, flags=re.M)      # JSDoc の継続行
DOMAIN_RE = re.compile(r"(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:jp|tw|com|net|org|travel)\b", re.I)
used = {d.lower() for line in body.splitlines() for d in DOMAIN_RE.findall(line)}
used = {d for d in used if not d.endswith(".js")}   # import 文のファイル名を拾わない

bad = []
for d in sorted(used):
    if d not in table:
        bad.append(f"本文の {d} が SITE_URL に無い → リンクにならず、ただの文字列のまま出る")
for d in sorted(table):
    if d not in used:
        bad.append(f"SITE_URL の {d} をどの本文も指していない(消し忘れ)")

print(f"本文のドメイン {len(used)}件 / SITE_URL {len(table)}件")

if "--net" in sys.argv:
    import subprocess
    # ★urllib は独自のCA束を使い、台湾の6サイト全部を SSLCertVerificationError にした。
    #   ブラウザで開けるものを「開けない」と報告する検査は害しかない。
    #   OS の証明書を使う curl で見る(HEAD を弾くサイトがあるので GET)
    UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
          "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")
    print("--- 飛び先が応答するか(実測) ---")
    for d in sorted(table):
        for url in table[d]:
            try:
                code = subprocess.run(
                    ["curl", "-sL", "--max-time", "25", "-A", UA,
                     "-o", os.devnull, "-w", "%{http_code}", url],
                    capture_output=True, text=True, timeout=40).stdout.strip()
                code = int(code)
            except Exception as e:
                code = repr(e)[:40]
            # 403 は WAF が curl/urllib を弾いているだけのことがある。
            # 実ブラウザで開けたものは下の EXPECT_403 に理由付きで置く
            ok = code == 200 or (str(code) == "403" and d in EXPECT_403)
            print(f"  {'OK ' if ok else '★NG'} {d:24} {code}  {url}")
            if not ok:
                bad.append(f"{d} の飛び先 {url} が開けない({code})")

if bad:
    print(f"\n!! {len(bad)}件")
    for x in bad:
        print("  ", x)
    sys.exit(1)
print("問題なし")
