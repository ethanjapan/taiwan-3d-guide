# -*- coding: utf-8 -*-
"""src/*.js で「呼んでいるのに定義が無い関数」を機械で拾う。

なぜ要るか(2026-08-22 実害):
  outfitCard を書き換えるつもりの一括置換が、続きの132行(buildSection/icTable/
  monthStrip/sosCards)ごと消した。**esbuild も vite も通る**(未定義識別子はグローバル扱い)。
  ブラウザで「旅の基本情報」を押すまで誰も気づかず、ユーザーに指摘された。
  memory feedback-inplace-string-rewrite-corrupts-md と同型(あれは md、今回は js)。

判定: `name(` の形で呼ばれている識別子のうち、同じファイルで
  const/let/var/function/class 宣言・import・アロー関数の引数・分割代入
  のいずれにも現れないものを未定義とみなす。ブラウザ標準の名前は除く。
実行: python3 tools/check_js.py   (欠けたら exit 1)
"""
import collections
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

GLOBALS = set("""
if for while switch catch return typeof new delete void await async yield function class
document window console localStorage sessionStorage location navigator history screen
setTimeout setInterval clearTimeout clearInterval requestAnimationFrame cancelAnimationFrame
fetch alert confirm prompt matchMedia getComputedStyle structuredClone queueMicrotask
ResizeObserver IntersectionObserver MutationObserver addEventListener removeEventListener
dispatchEvent innerWidth innerHeight scrollTo scrollBy open close postMessage
Object Array String Number Boolean Math JSON Date RegExp Error Map Set WeakMap WeakSet
Promise Symbol BigInt Proxy Reflect Intl URL URLSearchParams Blob File FormData Headers
Request Response AbortController Image Audio Worker Event CustomEvent DOMParser
Float32Array Uint8Array Uint16Array Uint32Array Int32Array ArrayBuffer DataView
parseInt parseFloat isNaN isFinite encodeURIComponent decodeURIComponent btoa atob
THREE super import require
""".split())

CALL = re.compile(r"(?<![.\w$])([A-Za-z_$][\w$]*)\s*\(")
# ★呼び出しだけ見ていると IC_TABLE[lang] のような「値として使う未定義」を逃す
#   (2026-08-22 実測: import 漏れで実行時 ReferenceError になったのに検査は通った)。
#   慣例どおり全大文字の定数を、添字/プロパティ参照の形でも拾う
CONST_USE = re.compile(r"(?<![.\w$])([A-Z][A-Z0-9_]{2,})\s*[\[.]")
# ★添字やプロパティを伴わない裸の参照(for-of の右辺・引数渡し)も拾う。
#   2026-08-22 実測: `for (const x of CODE_ICON)` を逃し、移植漏れが実行時に落ちた
CONST_BARE = re.compile(r"(?<![.\w$'\"])([A-Z][A-Z0-9_]{2,})(?![\w$])")
# ★コメントと文字列を先に落とす。落とさないと日本語コメントの「〜(注)」や
#   CSSの transform:"rotate(...)" まで「呼び出し」に見えて41件の偽陽性になった
STRIP = [
    (re.compile(r"/\*.*?\*/", re.S), " "),
    (re.compile(r"(?<![:\w])//[^\n]*"), " "),
    (re.compile(r"`(?:\\.|\$\{[^{}]*\}|[^`\\])*`", re.S), '""'),
    (re.compile(r"'(?:\\.|[^'\\\n])*'"), '""'),
    (re.compile(r'"(?:\\.|[^"\\\n])*"'), '""'),
]


def strip(src):
    for rx, rep in STRIP:
        src = rx.sub(rep, src)
    return src
bad = 0
for name in sorted(os.listdir("src")):
    if not name.endswith(".js"):
        continue
    path = os.path.join("src", name)
    raw = open(path, encoding="utf-8").read()
    src = strip(raw)
    # 定義側: 宣言・import・分割代入・アロー関数の引数を全部集める(取りこぼしより多め)
    defined = set(GLOBALS)
    defined |= set(re.findall(r"\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)", src))
    defined |= set(re.findall(r"\bimport\s+([A-Za-z_$][\w$]*)", src))
    for grp in re.findall(r"\{([^{}]*)\}\s*(?:=|from)", src):          # 分割代入 / import {}
        defined |= set(re.findall(r"[A-Za-z_$][\w$]*", grp))
    for grp in re.findall(r"\(([^()]*)\)\s*=>", src):                   # アロー関数の引数
        defined |= set(re.findall(r"[A-Za-z_$][\w$]*", grp))
    defined |= set(re.findall(r"([A-Za-z_$][\w$]*)\s*=>", src))         # 引数1個の省略形
    defined |= set(re.findall(r"\bfor\s*\(\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)", src))
    defined |= set(re.findall(r"\bcatch\s*\(\s*([A-Za-z_$][\w$]*)", src))
    defined |= set(re.findall(r"([A-Za-z_$][\w$]*)\s*[:(]\s*(?:function|\()", src))  # メソッド短縮
    defined |= set(re.findall(r"\b(?:get|set)\s+([A-Za-z_$][\w$]*)\s*\(", src))       # アクセサ

    used = set(CALL.findall(src)) | set(CONST_USE.findall(src)) | set(CONST_BARE.findall(src))
    # ★同じ名前を2回宣言すると実行時 SyntaxError になるが、未定義検査では気づけない
    #   (2026-08-22 実測: 移植で faqBlock が二重定義になり、参照検査は通ったのに動かなかった)
    tops = re.findall(r"(?m)^(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)", src)
    for name, cnt in collections.Counter(tops).items():
        if cnt > 1:
            print(f"二重宣言  {path}  {name} x{cnt}")
            bad += cnt - 1

    missing = sorted({m for m in used if m not in defined})
    if missing:
        bad += len(missing)
        for m in missing:
            ln = next((i + 1 for i, l in enumerate(strip(raw).split("\n"))
                       if re.search(rf"(?<![.\w$]){re.escape(m)}\s*\(", l)), 0)
            print(f"未定義の参照  {path}:{ln}  {m}()")

print("OK: 未定義の参照なし" if bad == 0 else f"欠け {bad} 件")
sys.exit(1 if bad else 0)
