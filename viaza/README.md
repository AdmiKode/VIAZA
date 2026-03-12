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

## Nota
- Todo texto visible sale de i18n (si agregas UI nueva, agrega llaves).
- No usar emojis en UI.
- No usar colores fuera de la paleta definida en el manifiesto.
