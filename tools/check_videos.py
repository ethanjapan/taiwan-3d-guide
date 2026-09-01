# -*- coding: utf-8 -*-
"""county-videos.json の動画が「実在し・埋め込め・名乗ったチャンネルか」を機械で確かめる。

なぜ要るか(2026-09-01):
  県市パネルに載せる公式宣伝動画は、調査(検索)で集めたYouTube IDの表。
  検索結果は間違える(IDのタイプミス・非公式チャンネルの混入・削除済み動画)。
  「公式」と銘打って非公式や消えた動画を出したら、サイト全体の信用が落ちる。

  YouTube oEmbed(キー不要のGET)は、動画が存在し埋め込み可能なら 200 と
  author_name(チャンネル名)を返す。404=存在しない/非公開、401/403=埋め込み不可。
  これで「実在・埋め込み可・チャンネル名の一致」まで機械で判定できる。

実行: python3 tools/check_videos.py   (問題があれば exit 1)
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")

VIDEOS = json.load(open("data/county-videos.json", encoding="utf-8"))
if not VIDEOS:
    print("data/county-videos.json は空。検証対象なし")
    sys.exit(0)

# 政府名義とみなす語。channel にどれかを含むこと(全政府機関名の網羅は無理なので、
# 「観光/政府の語を含まないチャンネルが紛れたら止める」という下限の守り)
OFFICIAL_HINT = ("觀光", "观光", "政府", "縣", "county", "city", "市", "旅遊", "交通部",
                 "travel", "tourism", "馬祖", "澎湖", "金門")

# チャンネル名に政府語が無いが、公式である根拠を**個別に確認済み**のもの。
# 憶測で足さない: ここに書くのは根拠を実際に見たものだけ(2026-09-01 調査)
VERIFIED_OFFICIAL = {
    "新北旅客 New Taipei Tour": "チャンネル説明に「新北市觀光旅遊局的官方頻道」と明記",
    "ITainan2020": "臺南市觀光旅遊局公式サイト(twtainan.net)のフッターSNSリンク先",
    "Amazing Taitung 台東就醬玩": "チャンネル概要欄に「臺東縣政府觀光發展處建置」と明記",
    "魅力基隆": "基隆市政府発行の広報ブランド(LINE公式に「基隆市政府」名義併記)",
    "宜蘭資管科": "チャンネルハンドルが @宜蘭縣政府(県政府の資訊管理単位名義)",
}

bad = []
CHECKS = []
for iso, v in sorted(VIDEOS.items()):
    CHECKS.append((iso, v, v.get("id") or ""))
    for lg, vid2 in (v.get("byLang") or {}).items():
        CHECKS.append((f"{iso}({lg})", v, vid2))
for iso, v, vid in CHECKS:
    if not re.fullmatch(r"[\w-]{11}", vid):
        bad.append(f"{iso}: id '{vid}' がYouTube IDの形(11文字)でない")
        continue
    url = f"https://www.youtube.com/oembed?format=json&url=https%3A//www.youtube.com/watch%3Fv%3D{vid}"
    r = subprocess.run(["curl", "-sL", "--max-time", "20", "-A", UA,
                        "-w", "\n%{http_code}", url],
                       capture_output=True, text=True, timeout=40)
    body, _, code = r.stdout.rpartition("\n")
    if code != "200":
        bad.append(f"{iso}: {vid} が oEmbed {code}(存在しない/非公開/埋め込み不可)")
        continue
    try:
        info = json.loads(body)
    except ValueError:
        bad.append(f"{iso}: {vid} oEmbed の応答が読めない")
        continue
    author = info.get("author_name") or ""
    claimed = v.get("channel") or ""
    if claimed and claimed not in author and author not in claimed:
        bad.append(f"{iso}: チャンネル名の不一致。表は「{claimed}」/ 実際は「{author}」")
    if (not any(h.lower() in author.lower() for h in OFFICIAL_HINT)
            and author not in VERIFIED_OFFICIAL):
        bad.append(f"{iso}: チャンネル「{author}」に政府/観光系の語が無い(非公式の疑い。目で確認すること)")
    print(f"  OK {iso:8} {vid}  {author[:30]:32} {info.get('title','')[:36]}")

if bad:
    print(f"\n!! {len(bad)}件")
    for x in bad:
        print("  ", x)
    sys.exit(1)
print(f"\n{len(VIDEOS)}件すべて実在・埋め込み可・チャンネル名一致")
