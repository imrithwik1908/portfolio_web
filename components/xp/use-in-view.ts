"use client"

import { useEffect, useRef, useState } from "react"

// True once the element has scrolled into view (or always, when motion is reduced).
export function useInView<T extends HTMLElement>(margin = "0px 0px -15% 0px") {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setInView(true)
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setInView(true)
      observer.disconnect()
    }, { rootMargin: margin })
    observer.observe(node)
    return () => observer.disconnect()
  }, [margin])
  return { ref, inView }
}
