#!/usr/bin/env bash
# Generate PWA / favicon assets from public/logo-source.png (or logo.png)
# Keeps aspect ratio (no stretch), supersamples small favicons for sharp tabs.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ICON_SOURCE:-$ROOT/public/logo-source.png}"
if [[ ! -f "$SRC" ]]; then
  SRC="$ROOT/public/logo.png"
fi
OUT="$ROOT/public/icons"
BG="#070b12"
MASTER=512
# Logo occupies ~88% of canvas — enough padding so 16px tabs stay readable
LOGO_ANY=448
LOGO_MASK=400
FAVICON_PAD=0.82

mkdir -p "$OUT"

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick (magick) required. Install: brew install imagemagick"
  exit 1
fi

# Square crop + resize without stretching (|^| fills, then extent crops center)
prep_logo_layer() {
  local px=$1
  local tmp
  tmp=$(mktemp).png
  magick "$SRC" \
    -auto-orient \
    -resize "${px}x${px}^" \
    -gravity center \
    -extent "${px}x${px}" \
    -filter Lanczos \
    "$tmp"
  echo "$tmp"
}

make_icon() {
  local out=$1
  local logo_px=$2
  local canvas=$3
  local tmp
  tmp=$(prep_logo_layer "$logo_px")
  magick -size "${canvas}x${canvas}" "xc:${BG}" \
    "$tmp" -gravity center -compose over -composite \
    -strip \
    "$out"
  rm -f "$tmp"
}

make_favicon_png() {
  local out=$1
  local size=$2
  local inner=$(( size * 82 / 100 ))
  [[ "$inner" -lt 8 ]] && inner=8
  local tmp
  tmp=$(prep_logo_layer "$inner")
  magick -size "${size}x${size}" "xc:${BG}" \
    "$tmp" -gravity center -compose over -composite \
    -strip \
    "$out"
  rm -f "$tmp"
}

echo "Source: $SRC"
echo "Generating master icons..."
make_icon "$OUT/icon-512.png" "$LOGO_ANY" "$MASTER"
make_icon "$OUT/icon-maskable-512.png" "$LOGO_MASK" "$MASTER"

SIZES="72 96 128 144 152 192 384 512"
for s in $SIZES; do
  magick "$OUT/icon-512.png" -filter Lanczos -resize "${s}x${s}!" -strip "$OUT/icon-${s}.png"
  magick "$OUT/icon-maskable-512.png" -filter Lanczos -resize "${s}x${s}!" -strip "$OUT/icon-maskable-${s}.png"
  echo "  icon-${s}.png + maskable"
done

cp "$OUT/icon-192.png" "$OUT/android-chrome-192x192.png"
cp "$OUT/icon-512.png" "$OUT/android-chrome-512x512.png"
magick "$OUT/icon-192.png" -filter Lanczos -resize 180x180! -strip "$OUT/apple-touch-icon.png"

# Supersample favicons: render large, then Lanczos down (crisp browser tabs)
echo "Generating favicons (supersampled)..."
make_favicon_png "$ROOT/public/favicon-base-128.png" 128
magick "$ROOT/public/favicon-base-128.png" -filter Lanczos -resize 48x48! -strip "$ROOT/public/favicon-48.png"
magick "$ROOT/public/favicon-base-128.png" -filter Lanczos -resize 32x32! -unsharp 0x0.65+0.4+0.008 -strip "$ROOT/public/favicon-32.png"
magick "$ROOT/public/favicon-base-128.png" -filter Lanczos -resize 16x16! -unsharp 0x0.5+0.35+0.008 -strip "$ROOT/public/favicon-16.png"
rm -f "$ROOT/public/favicon-base-128.png"

magick "$ROOT/public/favicon-16.png" "$ROOT/public/favicon-32.png" "$ROOT/public/favicon-48.png" "$ROOT/public/favicon.ico"

cp "$OUT/icon-512.png" "$ROOT/public/logo-512.png"

# Site logo: high-quality square (do not crush detail)
magick "$SRC" \
  -auto-orient \
  -resize "512x512^" \
  -gravity center \
  -extent 512x512 \
  -background "$BG" \
  -flatten \
  -filter Lanczos \
  -strip \
  "$ROOT/public/logo.png"

echo "Done → $OUT + favicons"
