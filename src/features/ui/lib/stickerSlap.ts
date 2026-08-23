type StickerOptions = {
  size: number | [number, number]
  x: number | null
  y: number | null
  rotation: number | null
  curlAngle: number | null
  startCurl: number
  duration: number
  onLand: ((el: HTMLDivElement) => void) | null
}

const SETTINGS: StickerOptions = {
  size: [90, 130],
  x: null,
  y: null,
  rotation: null,
  curlAngle: null,
  startCurl: 0.15,
  duration: 1100,
  onLand: null
}

function layer(cls: string) {
  const node = document.createElement('div')
  node.className = `hg-sticker__layer ${cls}`
  return node
}

function setVars(node: HTMLElement, vars: Record<string, string | number>) {
  for (const k in vars) node.style.setProperty(k, String(vars[k]))
}

function cancelSafe(anim: Animation) {
  try {
    anim.cancel()
  } catch {
    // already finished/cancelled
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}

function clamp01(v: number) {
  return clamp(v, 0, 1)
}

function rand(lo: number, hi: number) {
  return lo + Math.random() * (hi - lo)
}

function resolveSize(size: number | [number, number]) {
  return Array.isArray(size) ? Math.round(rand(size[0], size[1])) : size
}

function toImageSrc(source: string | HTMLImageElement | HTMLCanvasElement) {
  if (typeof source === 'string') return source
  if (source instanceof HTMLImageElement) return source.currentSrc || source.src
  if (source instanceof HTMLCanvasElement) return source.toDataURL('image/png')
  throw new Error('StickerSlap.slap expects image data (URL/data-URL string) or an image element.')
}

const emojiImageCache = new Map<string, string>()

export function emojiToImage(
  emoji: string,
  { size = 256, padding = 0.12, paper = true }: { size?: number; padding?: number; paper?: boolean } = {}
) {
  const key = `${emoji}@${size}|${padding}|${paper}`
  const cached = emojiImageCache.get(key)
  if (cached) return cached

  const dpr = Math.max(2, window.devicePixelRatio || 1)
  const px = Math.round(size * dpr)
  const canvas = document.createElement('canvas')
  canvas.width = px
  canvas.height = px
  const ctx = canvas.getContext('2d')!

  const border = paper ? Math.max(1, size * 0.022) * dpr : 0
  const pad = size * padding * dpr + border
  const fontPx = Math.round(px - pad * 2)
  const font = `${fontPx}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`
  const cx = px / 2
  const cy = px / 2 + fontPx * 0.04

  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (border > 0) {
    const mark = document.createElement('canvas')
    mark.width = px
    mark.height = px
    const mctx = mark.getContext('2d')!
    mctx.font = font
    mctx.textAlign = 'center'
    mctx.textBaseline = 'middle'
    mctx.fillText(emoji, cx, cy)
    mctx.globalCompositeOperation = 'source-in'
    mctx.fillStyle = '#fff'
    mctx.fillRect(0, 0, px, px)

    const steps = 24
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2
      ctx.drawImage(mark, Math.cos(a) * border, Math.sin(a) * border)
    }
  }

  ctx.fillText(emoji, cx, cy)

  const url = canvas.toDataURL('image/png')
  emojiImageCache.set(key, url)
  return url
}

let uid = 0

export class StickerSlap {
  private stage: HTMLElement
  private defaults: StickerOptions
  private stickers: HTMLDivElement[] = []

  constructor(stage: HTMLElement, options: Partial<StickerOptions> = {}) {
    if (!stage) throw new Error('StickerSlap requires a stage element.')
    this.stage = stage
    this.defaults = { ...SETTINGS, ...options }

    const cs = getComputedStyle(stage)
    if (cs.position === 'static') stage.style.position = 'relative'
    if (cs.overflow === 'visible') stage.style.overflow = 'hidden'
  }

  async slap(source: string | HTMLImageElement | HTMLCanvasElement, opts: Partial<StickerOptions> = {}) {
    const o = { ...this.defaults, ...opts }
    const resolvedSize = resolveSize(o.size)

    const el = this.createSticker(toImageSrc(source), { ...o, size: resolvedSize })
    this.stage.appendChild(el)
    this.stickers.push(el)

    await this.animateIn(el, o)
    if (typeof o.onLand === 'function') o.onLand(el)
    return el
  }

  clear() {
    this.stickers.forEach((s) => s.remove())
    this.stickers = []
  }

  private settle(el: HTMLDivElement & { _restRotation?: number }) {
    const flat = el.querySelector('.hg-sticker__flat')
    const vars = [
      '--src', '--u0', '--u1', '--w0', '--w1', '--minp',
      '--span', '--big', '--s', '--ca', '--a', '--b', '--d', '--p'
    ]
    for (const name of vars) el.style.removeProperty(name)
    if (flat) el.replaceChildren(flat)
    el.style.transform = `rotate(${el._restRotation}deg)`
  }

  private createSticker(src: string, o: StickerOptions) {
    const rect = this.stage.getBoundingClientRect()
    const S = o.size as number

    const fx = o.x == null ? Math.random() : clamp01(o.x)
    const fy = o.y == null ? Math.random() : clamp01(o.y)
    const half = S / 2
    const left = clamp(fx * rect.width, half, rect.width - half) - half
    const top = clamp(fy * rect.height, half, rect.height - half) - half

    const rest = o.rotation == null ? rand(-12, 12) : o.rotation
    const angle = (o.curlAngle == null ? rand(0, 360) : o.curlAngle) * (Math.PI / 180)

    const u = [Math.cos(angle), Math.sin(angle)]
    const w = [-Math.sin(angle), Math.cos(angle)]
    const projs = [
      [0, 0],
      [S, 0],
      [S, S],
      [0, S]
    ].map((c) => c[0] * u[0] + c[1] * u[1])
    const minP = Math.min(...projs)
    const span = Math.max(...projs) - minP
    const p0 = clamp01(o.startCurl)

    const el = document.createElement('div') as HTMLDivElement & {
      _restRotation?: number
      _startCurl?: number
    }
    el.className = 'hg-sticker'
    el.dataset.id = `hg-sticker-${++uid}`
    Object.assign(el.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${S}px`,
      height: `${S}px`
    })

    setVars(el, {
      '--src': `url("${src}")`,
      '--u0': u[0],
      '--u1': u[1],
      '--w0': w[0],
      '--w1': w[1],
      '--minp': minP,
      '--span': span,
      '--big': S * 6,
      '--s': S,
      '--ca': 90 + (angle * 180) / Math.PI,
      '--a': 1 - 2 * u[0] * u[0],
      '--b': -2 * u[0] * u[1],
      '--d': 1 - 2 * u[1] * u[1],
      '--p': p0
    })

    const flat = layer('hg-sticker__flat')
    const img = document.createElement('img')
    img.className = 'hg-sticker__img'
    img.src = src
    img.draggable = false
    flat.appendChild(img)

    const flapShadow = layer('hg-sticker__flap-shadow')
    const flapClip = layer('hg-sticker__flap-clip')
    const flapInner = layer('hg-sticker__flap-inner')
    const flapFill = layer('hg-sticker__flap-fill')
    flapInner.appendChild(flapFill)
    flapClip.appendChild(flapInner)
    flapShadow.appendChild(flapClip)

    el.append(flat, flapShadow)

    el._restRotation = rest
    el._startCurl = p0
    return el
  }

  private animateIn(el: HTMLDivElement & { _restRotation?: number; _startCurl?: number }, o: StickerOptions) {
    const rest = el._restRotation

    const entrance = el.animate(
      [
        { offset: 0, transform: `rotate(${rest}deg) scale(1.06)`, opacity: 0 },
        { offset: 0.2, transform: `rotate(${rest}deg) scale(1.0)`, opacity: 1 },
        { offset: 1, transform: `rotate(${rest}deg) scale(1.0)`, opacity: 1 }
      ],
      { duration: o.duration, easing: 'ease-out', fill: 'both' }
    )

    const unroll = el.animate([{ '--p': el._startCurl } as Keyframe, { '--p': 1 } as Keyframe], {
      duration: o.duration,
      easing: 'ease-in-out',
      fill: 'both'
    })

    return Promise.all([entrance.finished, unroll.finished]).then(() => {
      el.style.setProperty('--p', '1')
      el.style.transform = `rotate(${rest}deg)`
      cancelSafe(entrance)
      cancelSafe(unroll)
      this.settle(el)
      return el
    })
  }
}
