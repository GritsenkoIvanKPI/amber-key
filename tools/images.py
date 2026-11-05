"""Optimise source photos for the web.

Reads assets/img/raw/*.jpg|png and writes to .cache/img/:
  <name>-800.webp, <name>-1600.webp  (responsive images)
  <name>-og.jpg                       (1200x630 social preview)
Also creates favicons in assets/brand/. Only changed files are processed.
"""
import sys
from pathlib import Path
from PIL import Image

root = Path(sys.argv[1])
raw = root / "assets" / "img" / "raw"
out = root / ".cache" / "img"
out.mkdir(parents=True, exist_ok=True)

count = 0
for src in sorted(list(raw.glob("*.jpg")) + list(raw.glob("*.jpeg")) + list(raw.glob("*.png"))):
    name = src.stem
    targets = [out / f"{name}-800.webp", out / f"{name}-1600.webp", out / f"{name}-og.jpg"]
    if all(t.exists() and t.stat().st_mtime >= src.stat().st_mtime for t in targets):
        continue
    im = Image.open(src).convert("RGB")
    for w, t in ((800, targets[0]), (1600, targets[1])):
        c = im.copy()
        if c.width > w:
            c = c.resize((w, round(c.height * w / c.width)), Image.LANCZOS)
        c.save(t, "WEBP", quality=80, method=6)
    # OG: cover-crop to 1200x630
    tw, th = 1200, 630
    s = max(tw / im.width, th / im.height)
    c = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, tp = (c.width - tw) // 2, (c.height - th) // 2
    c.crop((l, tp, l + tw, tp + th)).save(targets[2], "JPEG", quality=82, optimize=True, progressive=True)
    count += 1

# Favicons from the monogram
brand = root / "assets" / "brand"
mono = brand / "monogram.png"
fav = brand / "favicon-32.png"
if mono.exists() and (not fav.exists() or fav.stat().st_mtime < mono.stat().st_mtime):
    m = Image.open(mono).convert("RGBA")
    for size, name, pad in ((32, "favicon-32.png", 0.08), (180, "apple-touch-icon.png", 0.16)):
        bg = Image.new("RGBA", (size, size), (7, 6, 5, 255))
        inner = int(size * (1 - 2 * pad))
        mm = m.copy()
        mm.thumbnail((inner, inner), Image.LANCZOS)
        bg.alpha_composite(mm, ((size - mm.width) // 2, (size - mm.height) // 2))
        bg.save(brand / name)

print(f"Images: {count} processed")
