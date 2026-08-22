# -*- coding: utf-8 -*-
"""交通部觀光署の公式オープンデータを取り直す。出力: data/source/*.json

なぜこれを作ったか(2026-08-23):
  景点6085件・活動954件は観光署の公式データだが、**手で一度落としたきり**だった。
  観光署は毎日1回更新している(UpdateInterval=86400)ので、置いておくと静かに腐る。
  「公式データをそのまま使っている」がこのサイトの主張なのに、中身が古いと主張が崩れる。

なぜ TDX ではないか:
  TDX(tdx.transportdata.tw)は同じ観光署データを配るが OAuth2 の client_secret が要る。
  静的サイトに秘密は置けず、会員登録も要る。一方 data.gov.tw 経由の
  media.taiwan.net.tw は**認証不要で同じ中身・同じ日次更新**(2026-08-23 実測で確認)。
  取れるものを取るのに鍵を配る理由がないので、こちらを使う。

  出典: 活動 https://data.gov.tw/dataset/7778 / 景點 https://data.gov.tw/dataset/7777
  授權: 政府資料開放授權條款-第1版(出處表示のみ・商用可)

安全側の作り(黙って壊さない):
  落としたものが**期待した形で・十分な件数あるとき以外は上書きしない**。
  配信が一時的に空や壊れた zip を返しても、手元の良いデータを潰さない。

実行: python3 tools/fetch_opendata.py            取得して差分を出す
      python3 tools/fetch_opendata.py --check    取得せず、今のデータの古さだけ見る
"""
import io
import json
import os
import subprocess
import sys
import zipfile
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
DEST = "data/source"

BASE = "https://media.taiwan.net.tw/XMLReleaseAll_public/v2.0/Zh_tw"

# (zip名, 取り出すファイル, 中の配列キー, これを下回ったら異常とみなす件数)
# 下限は 2026-08-23 実測(景点6085 / 活動954)の8割。配信事故で件数が激減しても気づける
TARGETS = [
    ("Attraction", "AttractionList.json", "Attractions", 4800),
    ("Event", "EventList.json", "Events", 760),
]

PROVIDER = "A15010000H"          # 交通部觀光署


def load_local(name):
    p = os.path.join(DEST, name)
    if not os.path.exists(p):
        return None
    try:
        return json.load(open(p, encoding="utf-8-sig"))
    except Exception:
        return None


def fetch(zip_name, member, key, floor):
    url = f"{BASE}/{zip_name}-json.zip"
    # ★urllib は media.taiwan.net.tw の証明書を
    #   "Missing Subject Key Identifier" で弾く(2026-08-23 実測)。
    #   curl は OS の証明書ストアを使うので通る。検査側(check_links.py)も同じ理由で curl
    r = subprocess.run(["curl", "-sfL", "--max-time", "180", url],
                       capture_output=True, timeout=240)
    if r.returncode != 0 or not r.stdout:
        raise RuntimeError(f"curl rc={r.returncode} {r.stderr.decode(errors='replace')[:120]}")
    raw = r.stdout
    zf = zipfile.ZipFile(io.BytesIO(raw))
    if member not in zf.namelist():
        raise RuntimeError(f"{zip_name}.zip に {member} が無い(配信の構成が変わった): {zf.namelist()[:6]}")
    doc = json.loads(zf.read(member).decode("utf-8-sig"))

    # ここを通らないものは書かない。壊れた配信で良いデータを潰さないため
    if doc.get("ProviderID") != PROVIDER:
        raise RuntimeError(f"{member}: 提供機関が {doc.get('ProviderID')}(期待 {PROVIDER})")
    arr = doc.get(key)
    if not isinstance(arr, list):
        raise RuntimeError(f"{member}: '{key}' が配列でない(構成が変わった)")
    if len(arr) < floor:
        raise RuntimeError(f"{member}: {len(arr)}件しかない(下限 {floor}件)。配信事故とみなして書かない")
    return doc, arr


def age_days(update_time):
    if not update_time:
        return None
    try:
        t = datetime.fromisoformat(update_time)
    except ValueError:
        return None
    if t.tzinfo is None:
        t = t.replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - t).total_seconds() / 86400


def main():
    check_only = "--check" in sys.argv
    changed = False
    ng = []

    for zip_name, member, key, floor in TARGETS:
        local = load_local(member)
        n_before = len(local.get(key, [])) if local else 0
        t_before = local.get("UpdateTime") if local else None
        age = age_days(t_before)
        age_txt = f"{age:.1f}日前" if age is not None else "不明"

        if check_only:
            print(f"  {member:22} 手元 {n_before}件 / {t_before}({age_txt})")
            continue

        try:
            doc, arr = fetch(zip_name, member, key, floor)
        except Exception as e:
            ng.append(f"{member}: {e}")
            print(f"  {member:22} ★取得できず → 手元をそのまま使う({e})")
            continue

        if doc.get("UpdateTime") == t_before and len(arr) == n_before:
            print(f"  {member:22} 変化なし({len(arr)}件 / {doc.get('UpdateTime')})")
            continue

        with open(os.path.join(DEST, member), "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False)
        changed = True
        d = len(arr) - n_before
        print(f"  {member:22} 更新 {n_before} → {len(arr)}件"
              f"({d:+d}) / {t_before} → {doc.get('UpdateTime')}")

    if check_only:
        return 0
    if ng:
        print("\n!! 取得に失敗したものがある(手元のデータは壊していない):")
        for x in ng:
            print("  ", x)
        return 1
    print("\n更新あり。data/*.json を作り直すこと:" if changed else "\nすべて最新。作り直し不要")
    if changed:
        print("  python3 tools/merge_attractions.py && python3 tools/build_events.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
