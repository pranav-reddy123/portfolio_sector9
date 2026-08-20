import { lazy, Suspense, useEffect, useRef } from 'react'
import { Hud } from './components/ui/Hud'
import { Loader } from './components/ui/Loader'
import { SkipLink } from './components/navigation/SkipLink'
import { Intro } from './components/sections/Intro'
import { Work } from './components/sections/Work'
import { About } from './components/sections/About'
import { Lab } from './components/sections/Lab'
import { Contact } from './components/sections/Contact'
import { Outro } from './components/sections/Outro'
import { useScrollDriver } from './hooks/useScrollProgress'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useWebGLSupport } from './hooks/useWebGLSupport'
import { usePointerTracking } from './hooks/usePointer'
import { useQualityManager, detectProfile } from './hooks/usePerformance'
import { store, useStore } from './hooks/useStore'
import { StaticPortfolio } from './fallback/StaticPortfolio'

/**
 * Three.js is the heaviest thing here by far, so it loads after the shell. The DOM
 * portfolio is interactive while the city is still arriving.
 */
const CityCanvas = lazy(async () => {
  const mod = await import('./components/ui/CityCanvas')
  store.setLoadProgress(0.3)
  return { default: mod.CityCanvas }
})

/** Scroll distance for the whole route. Long enough to author, short enough to finish. */
const ROUTE_HEIGHT_VH = 720

export default function App() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const webgl = useWebGLSupport()
  const webglFailed = useStore((s) => s.webglFailed)

  const canRender3D = webgl === true && !webglFailed
  const { travelTo, previewRoute } = useScrollDriver(scrollerRef, reducedMotion, canRender3D)

  usePointerTracking(canRender3D && !reducedMotion)
  useQualityManager(canRender3D)

  useEffect(() => {
    const profile = detectProfile()
    store.setQuality(profile.quality)
  }, [])

  // Dev affordance: #route=0.42 parks the experience at that point on the route so an
  // arrival can be inspected (and screenshotted) without scrolling. Dev builds only.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const match = /route=([0-9.]+)/.exec(window.location.hash)
    if (!match) return
    const fraction = Number(match[1])
    const timer = window.setTimeout(() => previewRoute(fraction), 600)
    return () => window.clearTimeout(timer)
  }, [previewRoute])

  // Progress is reported by the scene itself; this only covers the no-canvas path.
  useEffect(() => {
    if (webgl !== false) return
    store.setLoadProgress(1)
    store.setReady(true)
  }, [webgl])

  // Safety net: a slow or stalled GPU must never trap someone behind the loading screen.
  // The portfolio is readable with or without the city.
  useEffect(() => {
    const timer = window.setTimeout(() => store.setReady(true), 8000)
    return () => window.clearTimeout(timer)
  }, [])

  if (webgl === false || webglFailed) return <StaticPortfolio />

  return (
    <>
      <SkipLink />
      <Loader />
      <Suspense fallback={null}>
        <CityCanvas reducedMotion={reducedMotion} onSelectTower={travelTo} />
      </Suspense>

      {/* Scroll runway. The page scrolls; the content stays fixed and the city moves. */}
      <div ref={scrollerRef} style={{ height: `${ROUTE_HEIGHT_VH}vh` }} aria-hidden="true" />

      <Hud onTravel={travelTo} />

      <main id="content" className="pointer-events-none fixed inset-0 z-20">
        <Intro onEnter={() => travelTo('work')} />

        <div className="pointer-events-none absolute inset-0 flex items-center px-5 pb-28 pt-20 sm:px-8 md:py-24 md:pl-72 md:pr-10 lg:pl-80 lg:pr-16">
          <div className="relative w-full min-w-0">
            <Work />
            <div className="absolute inset-0">
              <About />
            </div>
            <div className="absolute inset-0">
              <Lab />
            </div>
            <div className="absolute inset-0">
              <Contact />
            </div>
          </div>
        </div>

        <Outro onRestart={() => travelTo('top')} />
      </main>
    </>
  )
}
