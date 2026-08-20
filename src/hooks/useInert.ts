import { useEffect } from 'react'

/**
 * Keeps hidden panels in the DOM (for search engines and the no-motion path) while
 * taking them out of the tab order. Opacity alone leaves links and inputs focusable,
 * which strands keyboard users on content they cannot see.
 */
export function useInert(ref: React.RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (active) node.removeAttribute('inert')
    else node.setAttribute('inert', '')
  }, [ref, active])
}
