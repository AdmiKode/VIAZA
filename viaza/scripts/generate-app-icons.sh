#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SRC_BG="${ROOT_DIR}/public/brand/icooviaza_padded.png"
SRC_FG="${ROOT_DIR}/public/brand/icooviaza_padded.png"
OUT_BASE="${ROOT_DIR}/public/brand/icons"

if [[ ! -f "${SRC_BG}" ]]; then
  echo "Missing source icon: ${SRC_BG}" >&2
  echo "Genera primero el ícono padded con: python3 scripts/pad-icon.py" >&2
  exit 1
fi

mkdir -p \
  "${OUT_BASE}/android/mipmap-mdpi" \
  "${OUT_BASE}/android/mipmap-hdpi" \
  "${OUT_BASE}/android/mipmap-xhdpi" \
  "${OUT_BASE}/android/mipmap-xxhdpi" \
  "${OUT_BASE}/android/mipmap-xxxhdpi" \
  "${OUT_BASE}/ios/AppIcon.appiconset"

echo "Generating Android launcher icons..."
sips -z 48 48   "${SRC_BG}" --out "${OUT_BASE}/android/mipmap-mdpi/ic_launcher.png" >/dev/null
sips -z 72 72   "${SRC_BG}" --out "${OUT_BASE}/android/mipmap-hdpi/ic_launcher.png" >/dev/null
sips -z 96 96   "${SRC_BG}" --out "${OUT_BASE}/android/mipmap-xhdpi/ic_launcher.png" >/dev/null
sips -z 144 144 "${SRC_BG}" --out "${OUT_BASE}/android/mipmap-xxhdpi/ic_launcher.png" >/dev/null
sips -z 192 192 "${SRC_BG}" --out "${OUT_BASE}/android/mipmap-xxxhdpi/ic_launcher.png" >/dev/null

echo "Generating Android adaptive foreground icons..."
if [[ -f "${SRC_FG}" ]]; then
  sips -z 108 108 "${SRC_FG}" --out "${OUT_BASE}/android/mipmap-mdpi/ic_launcher_foreground.png" >/dev/null
  sips -z 162 162 "${SRC_FG}" --out "${OUT_BASE}/android/mipmap-hdpi/ic_launcher_foreground.png" >/dev/null
  sips -z 216 216 "${SRC_FG}" --out "${OUT_BASE}/android/mipmap-xhdpi/ic_launcher_foreground.png" >/dev/null
  sips -z 324 324 "${SRC_FG}" --out "${OUT_BASE}/android/mipmap-xxhdpi/ic_launcher_foreground.png" >/dev/null
  sips -z 432 432 "${SRC_FG}" --out "${OUT_BASE}/android/mipmap-xxxhdpi/ic_launcher_foreground.png" >/dev/null
else
  echo "WARN: ${SRC_FG} not found; skipping adaptive foreground icons."
fi

sips -z 512 512 "${SRC_BG}" --out "${OUT_BASE}/android/play-store-icon.png" >/dev/null

echo "Generating iOS AppIcon.appiconset..."
IOS_SET="${OUT_BASE}/ios/AppIcon.appiconset"

gen_ios() {
  local px="$1"
  local name="$2"
  sips -z "${px}" "${px}" "${SRC_BG}" --out "${IOS_SET}/${name}" >/dev/null
}

gen_ios 20 "icon-20.png"
gen_ios 40 "icon-20@2x.png"
gen_ios 29 "icon-29.png"
gen_ios 40 "icon-40.png"
gen_ios 58 "icon-29@2x.png"
gen_ios 60 "icon-20@3x.png"
gen_ios 76 "icon-76.png"
gen_ios 80 "icon-40@2x.png"
gen_ios 87 "icon-29@3x.png"
gen_ios 120 "icon-40@3x.png"
gen_ios 120 "icon-60@2x.png"
gen_ios 152 "icon-76@2x.png"
gen_ios 167 "icon-83.5@2x.png"
gen_ios 180 "icon-60@3x.png"
gen_ios 1024 "icon-1024.png"

cat > "${IOS_SET}/Contents.json" <<'JSON'
{
  "images": [
    { "idiom": "iphone", "size": "20x20", "scale": "2x", "filename": "icon-20@2x.png" },
    { "idiom": "iphone", "size": "20x20", "scale": "3x", "filename": "icon-20@3x.png" },
    { "idiom": "iphone", "size": "29x29", "scale": "2x", "filename": "icon-29@2x.png" },
    { "idiom": "iphone", "size": "29x29", "scale": "3x", "filename": "icon-29@3x.png" },
    { "idiom": "iphone", "size": "40x40", "scale": "2x", "filename": "icon-40@2x.png" },
    { "idiom": "iphone", "size": "40x40", "scale": "3x", "filename": "icon-40@3x.png" },
    { "idiom": "iphone", "size": "60x60", "scale": "2x", "filename": "icon-60@2x.png" },
    { "idiom": "iphone", "size": "60x60", "scale": "3x", "filename": "icon-60@3x.png" },

    { "idiom": "ipad", "size": "20x20", "scale": "1x", "filename": "icon-20.png" },
    { "idiom": "ipad", "size": "20x20", "scale": "2x", "filename": "icon-20@2x.png" },
    { "idiom": "ipad", "size": "29x29", "scale": "1x", "filename": "icon-29.png" },
    { "idiom": "ipad", "size": "29x29", "scale": "2x", "filename": "icon-29@2x.png" },
    { "idiom": "ipad", "size": "40x40", "scale": "1x", "filename": "icon-40.png" },
    { "idiom": "ipad", "size": "40x40", "scale": "2x", "filename": "icon-40@2x.png" },
    { "idiom": "ipad", "size": "76x76", "scale": "1x", "filename": "icon-76.png" },
    { "idiom": "ipad", "size": "76x76", "scale": "2x", "filename": "icon-76@2x.png" },
    { "idiom": "ipad", "size": "83.5x83.5", "scale": "2x", "filename": "icon-83.5@2x.png" },

    { "idiom": "ios-marketing", "size": "1024x1024", "scale": "1x", "filename": "icon-1024.png" }
  ],
  "info": { "version": 1, "author": "xcode" }
}
JSON

echo ""
echo "Done."
echo "Android: ${OUT_BASE}/android"
echo "iOS: ${OUT_BASE}/ios/AppIcon.appiconset"
