#!/usr/bin/env bash
# Generate PWA / Android chrome icons from public/logo.png
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/public/logo.png"
OUT="$ROOT/public/icons"
BG="#070b12"
MASTER=512
# Regular icons: logo fills ~94% of canvas (minimal padding, sharp on launcher)
LOGO_ANY=480
# Maskable: ~82% — large but inside Android adaptive safe zone
LOGO_MASK=420

mkdir -p "$OUT"

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick (magick) required. Install: brew install imagemagick"
  exit 1
fi

prep_logo() {
  local size=$1
  local tmp
  tmp=$(mktemp).png
  magick "$SRC" \
    -fuzz 14% -transparent white \
    -resize "${size}x${size}" \
    -background none -gravity center -extent "${size}x${size}" \
    -sharpen 0x0.6 -contrast-stretch 0.5%x0.5% \
    "$tmp"
  echo "$tmp"
}

make_icon() {
  local out=$1
  local logo_px=$2
  local canvas=$3
  local tmp
  tmp=$(prep_logo "$logo_px")
  magick -size "${canvas}x${canvas}" "xc:${BG}" \
    "$tmp" -gravity center -compose over -composite \
    -strip -define png:compression-filter=5 \
    "$out"
  rm -f "$tmp"
}

echo "Generating master icons..."
make_icon "$OUT/icon-512.png" "$LOGO_ANY" "$MASTER"
make_icon "$OUT/icon-maskable-512.png" "$LOGO_MASK" "$MASTER"

SIZES="72 96 128 144 152 192 384 512"
for s in $SIZES; do
  magick "$OUT/icon-512.png" -resize "${s}x${s}" -strip "$OUT/icon-${s}.png"
  magick "$OUT/icon-maskable-512.png" -resize "${s}x${s}" -strip "$OUT/icon-maskable-${s}.png"
  echo "  icon-${s}.png + maskable"
done

# Legacy / platform names
cp "$OUT/icon-192.png" "$OUT/android-chrome-192x192.png"
cp "$OUT/icon-512.png" "$OUT/android-chrome-512x512.png"
magick "$OUT/icon-192.png" -resize 180x180 -strip "$OUT/apple-touch-icon.png"
magick "$OUT/icon-512.png" -resize 32x32 -strip "$ROOT/public/favicon-32.png"
magick "$OUT/icon-512.png" -resize 16x16 -strip "$ROOT/public/favicon-16.png"
magick "$ROOT/public/favicon-16.png" "$ROOT/public/favicon-32.png" "$ROOT/public/favicon.ico"

# Crisp 512 for OG / social previews
cp "$OUT/icon-512.png" "$ROOT/public/logo-512.png"
cp "$OUT/icon-512.png" "$ROOT/public/logo.png"

echo "Done → $OUT"
