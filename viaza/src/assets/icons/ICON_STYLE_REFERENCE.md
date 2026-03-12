# VIAZA — Referencia de estilo de iconos

## Concepto visual
Iconos **duotone layered** con dos capas:
- **Capa base (fondo):** forma sólida en color accent `#EA9940` (naranja cálido)
- **Capa superior:** forma secundaria translúcida en gris claro / blanco con ~50–60% opacidad

Esto crea un efecto de profundidad y volumen sin ser 3D. Estilo "soft layered icons".

## Reglas de construcción

### Geometría
- Formas redondeadas, sin aristas duras
- Sin contornos / strokes — solo formas filled
- Bordes con `border-radius` generoso (mínimo 20% del tamaño)
- Composición en viewBox 48×48 (o 64×64 para íconos grandes)

### Colores
| Capa       | Color             | Opacidad |
|------------|-------------------|----------|
| Base       | `#EA9940`         | 100%     |
| Superior   | `#B0B8BF` o blanco| 50–65%   |

**Nunca usar colores fuera de la paleta VIAZA.**
En contextos sobre fondo oscuro (header navy `#12212E`) la capa superior puede ser blanca al 45%.

### Proporciones
- La capa superior ocupa aprox. 50–70% del área del ícono
- Offset ligero (rotación o desplazamiento) para ver las dos capas
- Tamaño de exportación: 24px, 32px, 48px

### Ejemplos del reference (imagen adjunta)
| Ícono      | Capa base (naranja)     | Capa gris encima            |
|------------|-------------------------|-----------------------------|
| Map Pin    | gota/pin naranja        | disco/sombra gris debajo    |
| Bag        | bolsa naranja           | asa gris semitransparente   |
| Check      | cuadrado naranja        | checkmark gris encima       |
| Send       | flecha naranja          | triángulo gris encima       |
| User       | silueta naranja         | cabeza/círculo gris encima  |
| Stack      | diamante naranja base   | dos capas grises encima     |
| File       | hoja naranja            | esquina doblada gris        |
| Payment    | tarjeta naranja base    | tarjeta gris encima         |
| Messaging  | burbuja naranja         | burbuja gris encima         |
| Mail       | sobre naranja           | solapa gris encima          |

## Íconos necesarios para VIAZA

| Nombre        | Uso en app                          |
|---------------|-------------------------------------|
| `home`        | Bottom nav — Home                   |
| `bag`         | Bottom nav — Packing                |
| `tools`       | Bottom nav — Tools                  |
| `tips`        | Bottom nav — Tips                   |
| `settings`    | Bottom nav — Settings               |
| `plane`       | Airline rules, onboarding           |
| `map-pin`     | Destino, header                     |
| `currency`    | Currency converter                  |
| `translate`   | Translator                          |
| `split`       | Split bill                          |
| `plug`        | Adapters / enchufes                 |
| `check`       | Checklist, packing items            |
| `calendar`    | Fechas del viaje                    |
| `thermometer` | Clima                               |
| `user`        | Perfil, travelers                   |
| `star`        | Premium                             |
| `send`        | CTA / enviar                        |
| `stack`       | Capas / organización                |
| `bell`        | Reminder / notificaciones           |
| `shield`      | Seguridad / survival tips           |

## Implementación en código

Los iconos se implementan como componentes SVG en React (no como imagen ni fuente de iconos externa).

Archivo: `src/components/ui/VIcon.tsx`

```tsx
<VIcon name="map-pin" size={24} className="text-[var(--viaza-accent)]" />
```

Cada ícono tiene DOS `<path>` o `<circle>`:
1. Forma base — `fill="currentColor"` (hereda el accent)
2. Forma superior — `fill="white" opacity="0.55"` o `fill="#B0B8BF" opacity="0.6"`

## NO usar
- Emojis (regla absoluta del manifiesto)
- Mezcla de librerías de iconos (Heroicons + Lucide + Material juntos = caos)
- Stroke icons (estilo outline) — no van con este estilo duotone
- Iconos de admin panel genéricos

## Referencia visual guardada
`src/assets/icons/ICON_STYLE_REFERENCE.md` (este archivo)
Imagen de referencia: adjunta en el chat (iconos duotone sobre fondo oscuro #2B2B2B)
