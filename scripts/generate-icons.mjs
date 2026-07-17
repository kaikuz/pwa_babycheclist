// Genera los iconos de la PWA a partir de public/logo.PNG (el badge ilustrado
// de perro+bebé). Recorta solo la escena (sin el texto "Camino a casa /
// Lycka y Hugo", ilegible en tamaños pequeños) y la compone centrada sobre
// un lienzo cuadrado del mismo crema del badge. Ejecutar con `npm run icons`.
//
// Las coordenadas de recorte están ajustadas a mano para este archivo
// concreto; si se sustituye logo.PNG por otra ilustración con distinta
// composición, hay que reajustarlas (ver candidatos de recorte comentados).
import { PNG } from 'pngjs'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const SOURCE = 'public/logo.PNG'
const CROP = { x: 90, y: 140, w: 1100, h: 500 } // corazón + perro + bebé, sin texto
const BG = [250, 241, 227] // crema interior del badge, muestreado del propio logo

const src = PNG.sync.read(readFileSync(SOURCE))

function sampleBilinear(sx, sy) {
  const x0 = Math.floor(sx), y0 = Math.floor(sy)
  const x1 = Math.min(x0 + 1, src.width - 1)
  const y1 = Math.min(y0 + 1, src.height - 1)
  const fx = sx - x0, fy = sy - y0
  const at = (x, y) => {
    const i = (y * src.width + x) << 2
    const r = src.data[i], g = src.data[i + 1], b = src.data[i + 2]
    // el recorte rectangular pilla esquinas fuera del arco del badge
    // (blanco puro, no el crema interior): las rellenamos para que no
    // se note la costura
    if (r > 248 && g > 248 && b > 248) return BG
    return [r, g, b]
  }
  const c00 = at(x0, y0), c10 = at(x1, y0), c01 = at(x0, y1), c11 = at(x1, y1)
  const lerp = (a, b, t) => a + (b - a) * t
  return [0, 1, 2].map((k) =>
    Math.round(
      lerp(lerp(c00[k], c10[k], fx), lerp(c01[k], c11[k], fx), fy)
    )
  )
}

/** Compone el recorte centrado en un lienzo cuadrado con margen, fondo crema. */
function makeIcon(size, marginFraction) {
  const out = new PNG({ width: size, height: size })
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = BG[0]; out.data[i + 1] = BG[1]; out.data[i + 2] = BG[2]; out.data[i + 3] = 255
  }

  const contentSize = size * (1 - 2 * marginFraction)
  const scale = Math.min(contentSize / CROP.w, contentSize / CROP.h)
  const destW = CROP.w * scale, destH = CROP.h * scale
  const offX = (size - destW) / 2, offY = (size - destH) / 2

  for (let dy = 0; dy < destH; dy++) {
    const py = Math.round(offY + dy)
    if (py < 0 || py >= size) continue
    for (let dx = 0; dx < destW; dx++) {
      const px = Math.round(offX + dx)
      if (px < 0 || px >= size) continue
      const sx = CROP.x + dx / scale
      const sy = CROP.y + dy / scale
      const [r, g, b] = sampleBilinear(sx, sy)
      const di = (py * size + px) << 2
      out.data[di] = r; out.data[di + 1] = g; out.data[di + 2] = b; out.data[di + 3] = 255
    }
  }
  return out
}

mkdirSync('public', { recursive: true })
writeFileSync('public/icon-192.png', PNG.sync.write(makeIcon(192, 0.08)))
writeFileSync('public/icon-512.png', PNG.sync.write(makeIcon(512, 0.08)))
writeFileSync('public/apple-touch-icon.png', PNG.sync.write(makeIcon(180, 0.08)))
// más margen: el recorte tiene que caber en el círculo "seguro" del 80% central
writeFileSync('public/maskable-512.png', PNG.sync.write(makeIcon(512, 0.18)))
writeFileSync('public/favicon.png', PNG.sync.write(makeIcon(64, 0.06)))
console.log('Iconos generados en /public a partir de logo.PNG')
