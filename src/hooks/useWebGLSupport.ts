import { useEffect, useState } from 'react'

function detect(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    if (!gl) return false
    // Some machines expose a context that cannot actually compile shaders.
    const ctx = gl as WebGLRenderingContext
    const ok = !!ctx.createShader(ctx.VERTEX_SHADER)
    ctx.getExtension('WEBGL_lose_context')?.loseContext()
    return ok
  } catch {
    return false
  }
}

/** null while detecting, then true/false. Gates the Canvas against the static fallback. */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null)
  useEffect(() => setSupported(detect()), [])
  return supported
}
