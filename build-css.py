#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Baut css/site.min.css aus den Quell-Dateien (tokens, base, layout, components, utilities).
Aufruf: python3 build-css.py  (im Website-Root)

WICHTIG: Nach JEDER Änderung an css/*.css dieses Skript ausführen,
damit die gebündelte Datei (die die Seiten laden) aktuell ist.
"""
import re
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
ORDER = ["css/tokens.css", "css/base.css", "css/layout.css", "css/components.css", "css/utilities.css"]
OUT = os.path.join(ROOT, "css", "site.min.css")

parts = []
for rel in ORDER:
    path = os.path.join(ROOT, rel)
    css = open(path, encoding="utf-8").read()
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)  # Kommentare entfernen
    lines = [ln.strip() for ln in css.splitlines()]
    parts.append("\n".join(ln for ln in lines if ln))

bundle = "/* agentur dk — gebündeltes CSS (tokens+base+layout+components+utilities), generiert */\n" + "\n".join(parts)
with open(OUT, "w", encoding="utf-8") as f:
    f.write(bundle)

opens = bundle.count("{")
closes = bundle.count("}")
print(f"site.min.css geschrieben: {len(bundle)} Bytes, {{ {opens} / }} {closes} {'✓' if opens == closes else '✗ UNBALANCED'}")
