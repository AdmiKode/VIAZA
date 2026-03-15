# VIAZA (web preview + base para nativo)

Este proyecto vive en `viaza/` para poder previsualizar en `localhost` con Vite y, más adelante, envolver con Capacitor para Android/iOS.

## Requisitos
- Node.js LTS (recomendado 20+)

## Correr en localhost
```bash
cd viaza
npm install
npm run dev
```

## Capacitor (scaffold)
```bash
cd viaza
npm run build
npm run cap:add:ios
npm run cap:add:android
npm run cap:sync
```

## Iconos (Android + iOS)
Genera los iconos desde el master `public/brand/logo-blue-bg.png` (y usa `public/brand/logo-blue.png` como foreground si existe):
```bash
cd viaza
./scripts/generate-app-icons.sh
```

Salida:
- Android: `public/brand/icons/android/`
- iOS: `public/brand/icons/ios/AppIcon.appiconset/`
- ZIP listo para descargar: `public/brand/icons/viaza-app-icons.zip` (en `npm run dev` se sirve en `/brand/icons/viaza-app-icons.zip`)

## Nota
- Todo texto visible sale de i18n (si agregas UI nueva, agrega llaves).
- No usar emojis en UI.
- No usar colores fuera de la paleta definida en el manifiesto.
