# -*- coding: utf-8 -*-
"""コードが指している画像が public/ に実在するかを機械で確かめる。

なぜ要るか(2026-08-23 実害):
  季節ボタンのアイコン名を日本版から丸ごと持ってきたが、
  sakura-spray / koinobori / maple は台湾版に**1枚も無く**、
  ボタンに壊れた画像が出たままユーザーに見つかった。
  同じ形で以前もイベントボタンの素材が無く壊れていた。**2回目**なので機械で止める。

見るもの:
  1. `const ICONS = { key: "name" }` の形 → public/ui/<name>.webp
  2. テンプレートリテラル `${import.meta.env.BASE_URL}<固定パス>` → public/<パス>
     (${...} を含む動的な部分は、その場では確かめようがないので飛ばす)

実行: python3 tools/check_ui_assets.py   (欠けたら exit 1)
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

missing = []
checked = 0

for name in sorted(os.listdir("src")):
    if not name.endswith(".js"):
        continue
    src = open(os.path.join("src", name), encoding="utf-8").read()

    # 1) ICONS マップ(ボタンのアイコン)
    for m in re.finditer(r"const ICONS\s*=\s*\{([^}]*)\}", src):
        for key, val in re.findall(r"(\w+)\s*:\s*\"([^\"]+)\"", m.group(1)):
            path = f"public/ui/{val}.webp"
            checked += 1
            if not os.path.exists(path):
                missing.append(f"src/{name}  ICONS.{key} → {path}")

    # 2) BASE_URL に続くパス
    # ★ここで [^`"'] にしていたら `?? "season-spring"` の引用符で切れて、
    #   式の中の既定値まで届かなかった。テンプレートは backtick までが本体
    for lit in re.findall(r"\$\{import\.meta\.env\.BASE_URL\}([^`]+)", src):
        if "${" not in lit:
            path = os.path.join("public", lit)
            checked += 1
            if not os.path.exists(path):
                missing.append(f"src/{name}  {lit}")
            continue
        # ★動的な部分でも、その場に書かれた文字列リテラル(既定値など)は確かめられる。
        #   `ui/${ICONS[x] ?? "sakura-spray"}.webp` の既定値が実在しない名前で、
        #   ICONS だけ直しても壊れたままだった(2026-08-23)。ここを見ていなかった。
        head, tail = lit.split("${", 1)
        expr, _, rest = tail.partition("}")
        for s_lit in re.findall(r"[\"']([\w./-]+)[\"']", expr):
            path = os.path.join("public", head + s_lit + rest)
            checked += 1
            if not os.path.exists(path):
                missing.append(f"src/{name}  {head}{s_lit}{rest}  (式の中の既定値)")

print(f"コードが指す画像 {checked}件を確認")
if missing:
    print(f"\n!! public/ に無い {len(missing)} 件")
    for x in missing:
        print("  ", x)
    sys.exit(1)
print("欠けなし")
