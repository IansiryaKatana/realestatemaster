import { useEffect, useRef, useState } from 'react'

const SCROLL_DELTA = 6

type DesktopScrollHeaderState = {
  atTop: boolean
  revealed: boolean
}

/** Transparent at top; hide on scroll down; solid bar when scrolling back up (all viewports). */
export function useDesktopScrollHeader(threshold = 72): DesktopScrollHeaderState {
  const [atTop, setAtTop] = useState(true)
  const [revealed, setRevealed] = useState(true)
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    lastY.current = window.scrollY
    setAtTop(window.scrollY <= threshold)
    setRevealed(true)

    const update = () => {
      const y = window.scrollY

      setAtTop(y <= threshold)

      if (y <= threshold) {
        setRevealed(true)
      } else if (y < lastY.current - SCROLL_DELTA) {
        setRevealed(true)
      } else if (y > lastY.current + SCROLL_DELTA) {
        setRevealed(false)
      }

      lastY.current = y
      ticking.current = false
    }

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return { atTop, revealed }
}
