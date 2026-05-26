#!/usr/bin/env python3
"""
build.py — GNAFOR Field Collector single-file build pipeline.

Takes the HTML template (markup + CSS + DOM glue) and inlines:
  - the i18n catalogues (i18n/strings_pt.json, strings_en.json)
  - the extracted core logic modules (src/*.js)
into one distributable file: GNAFOR_FieldCollector_v1.1.html

Rationale (TODO §4/§6 + "single distributable HTML" constraint):
  An HTML opened via file:// cannot fetch() the JSON catalogues, so they MUST
  be inlined at build time. The src/ modules use ES `export` for Vitest; this
  script strips the `export ` keyword so the bodies become plain top-level
  declarations (window globals) that the app's onclick="..." handlers expect.

No runtime dependencies are added to the app: this is a dev-time build only.
"""
from __future__ import annotations
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TEMPLATE = ROOT / "template.html"
OUTPUT = ROOT / "GNAFOR_FieldCollector_v1.1.html"

# Order matters: modules may reference earlier ones once inlined into one scope.
MODULE_ORDER = [
    "i18n.js",
    "numeric.js",
    "validation.js",
    "storage.js",
    "csv.js",
    "webhook.js",
    "gps.js",
]

MARKER_I18N = "/*@@I18N@@*/"
MARKER_MODULES = "/*@@MODULES@@*/"

# Inlined modules share one scope, so ES module syntax must be removed:
#  - `import ... from '...';` lines are dropped (the names are already global,
#    because MODULE_ORDER inlines dependencies first);
#  - a leading `export ` / `export default ` is stripped so the declaration
#    becomes a plain top-level (window-global) declaration.
_IMPORT_RE = re.compile(r"^[ \t]*import\s+.*?;[ \t]*$", re.MULTILINE)
_EXPORT_RE = re.compile(r"^[ \t]*export\s+(default\s+)?", re.MULTILINE)


def strip_exports(js: str) -> str:
    js = _IMPORT_RE.sub("", js)
    js = _EXPORT_RE.sub("", js)
    return js


def load_i18n() -> str:
    cat = {}
    for lang in ("pt", "en"):
        f = ROOT / "i18n" / f"strings_{lang}.json"
        if f.exists():
            cat[lang] = json.loads(f.read_text(encoding="utf-8"))
        else:
            print(f"  [warn] missing i18n catalogue: {f.name}")
            cat[lang] = {}
    # Emit a compact, valid JS object literal.
    return "const I18N_STRINGS = " + json.dumps(cat, ensure_ascii=False) + ";"


def load_modules() -> str:
    chunks = []
    for name in MODULE_ORDER:
        f = ROOT / "src" / name
        if not f.exists():
            continue
        body = strip_exports(f.read_text(encoding="utf-8"))
        chunks.append(f"// ===== src/{name} =====\n{body}")
    if not chunks:
        print("  [warn] no src/*.js modules found to inline")
    return "\n\n".join(chunks)


def main() -> int:
    if not TEMPLATE.exists():
        print(f"ERROR: template not found: {TEMPLATE}")
        print("       (created in Fase 1 from the verified v1.0 baseline)")
        return 1

    html = TEMPLATE.read_text(encoding="utf-8")
    i18n_js = load_i18n()
    modules_js = load_modules()

    if MARKER_I18N not in html:
        print(f"  [warn] marker {MARKER_I18N} not found in template")
    if MARKER_MODULES not in html:
        print(f"  [warn] marker {MARKER_MODULES} not found in template")

    html = html.replace(MARKER_I18N, i18n_js)
    html = html.replace(MARKER_MODULES, modules_js)

    OUTPUT.write_text(html, encoding="utf-8")
    size_kb = OUTPUT.stat().st_size / 1024
    print(f"OK  built {OUTPUT.name} ({size_kb:.1f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
