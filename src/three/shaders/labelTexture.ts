import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'

export interface LabelLine {
  text: string
  size: number
  color: string
  font?: 'display' | 'mono'
  spacing?: number
  opacity?: number
}

/**
 * Text in this scene is baked to a small canvas once, never rendered as 3D glyphs.
 * Keeps the signage crisp, the draw calls flat, and the real copy in the DOM.
 */
export function createLabelTexture(
  lines: LabelLine[],
  options?: { width?: number; height?: number; align?: CanvasTextAlign; background?: string },
): CanvasTexture {
  const width = options?.width ?? 512
  const height = options?.height ?? 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')!
  if (options?.background) {
    ctx.fillStyle = options.background
    ctx.fillRect(0, 0, width, height)
  } else {
    ctx.clearRect(0, 0, width, height)
  }

  const align = options?.align ?? 'left'
  ctx.textAlign = align
  ctx.textBaseline = 'middle'

  const totalHeight = lines.reduce((sum, line) => sum + line.size * 1.5, 0)
  let y = (height - totalHeight) / 2 + lines[0].size * 0.75
  const x = align === 'center' ? width / 2 : align === 'right' ? width - 24 : 24

  for (const line of lines) {
    const family =
      line.font === 'mono'
        ? `'IBM Plex Mono', ui-monospace, monospace`
        : `'Archivo Variable', Archivo, system-ui, sans-serif`
    ctx.font = `${line.font === 'mono' ? 500 : 700} ${line.size}px ${family}`
    ctx.globalAlpha = line.opacity ?? 1
    ctx.fillStyle = line.color

    if (line.spacing) {
      // Canvas has no letterSpacing everywhere, so tracked text is drawn per glyph.
      const chars = [...line.text]
      const widths = chars.map((c) => ctx.measureText(c).width + line.spacing!)
      const total = widths.reduce((a, b) => a + b, 0) - line.spacing
      let cursor = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x
      ctx.textAlign = 'left'
      chars.forEach((char, index) => {
        ctx.fillText(char, cursor, y)
        cursor += widths[index]
      })
      ctx.textAlign = align
    } else {
      ctx.fillText(line.text, x, y)
    }

    y += line.size * 1.5
  }

  ctx.globalAlpha = 1

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}
