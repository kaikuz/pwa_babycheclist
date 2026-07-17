// Genera los iconos PNG de la PWA sin dependencias: fondo eucalipto con una
// "C" dibujada como anillo con abertura. Ejecutar con `npm run icons`.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const BG = [0x7c, 0x9a, 0x83] // eucalipto
const FG = [0xf4, 0xf6, 0xf1] // salvia-lino

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(size, pixelAt) {
  const raw = Buffer.alloc(size * (size * 3 + 1))
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1)
    raw[row] = 0 // filtro none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelAt(x, y)
      raw.writeUInt8(r, row + 1 + x * 3)
      raw.writeUInt8(g, row + 2 + x * 3)
      raw.writeUInt8(b, row + 3 + x * 3)
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// Cobertura de la "C" en un punto: anillo centrado con abertura a la derecha.
function makeIcon(size, scale) {
  const cx = size / 2
  const cy = size / 2
  const rOuter = size * 0.34 * scale
  const rInner = size * 0.19 * scale
  const gap = Math.PI / 3.4 // media abertura, en radianes

  const inC = (x, y) => {
    const dx = x - cx
    const dy = y - cy
    const r = Math.hypot(dx, dy)
    if (r < rInner || r > rOuter) return false
    return Math.abs(Math.atan2(dy, dx)) > gap
  }

  return png(size, (x, y) => {
    // antialiasing con 4 submuestras por píxel
    let hits = 0
    for (const [ox, oy] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) {
      if (inC(x + ox, y + oy)) hits++
    }
    const t = hits / 4
    return [
      Math.round(BG[0] + (FG[0] - BG[0]) * t),
      Math.round(BG[1] + (FG[1] - BG[1]) * t),
      Math.round(BG[2] + (FG[2] - BG[2]) * t),
    ]
  })
}

mkdirSync('public', { recursive: true })
writeFileSync('public/icon-192.png', makeIcon(192, 1))
writeFileSync('public/icon-512.png', makeIcon(512, 1))
writeFileSync('public/apple-touch-icon.png', makeIcon(180, 1))
writeFileSync('public/maskable-512.png', makeIcon(512, 0.78))
console.log('Iconos generados en /public')
