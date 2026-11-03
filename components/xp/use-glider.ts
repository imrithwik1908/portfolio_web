"use client"

import { useLayoutEffect, useRef, useState } from "react"

// The site's one motion primitive: a highlight that glides to whichever item is active.
// Used by the navigation, the question list and the version toggle so they all move alike.
export function useGlider<T extends HTMLElement>(activeKey: string | null) {
  const container = useRef<HTMLDivElement | HTMLOListElement | null>(null)
  const items = useRef(new Map<string, T>())
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 })

  useLayoutEffect(() => {
    const measure = () => {
      const node = activeKey ? items.current.get(activeKey) : null
      if (!node) return setStyle((s) => ({ ...s, opacity: 0 }))
      setStyle({ opacity: 1, width: node.offsetWidth, height: node.offsetHeight, transform: `translate(${node.offsetLeft}px, ${node.offsetTop}px)` })
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (container.current) observer.observe(container.current)
    return () => observer.disconnect()
  }, [activeKey])

  const register = (key: string) => (node: T | null) => {
    if (node) items.current.set(key, node)
    else items.current.delete(key)
  }

  return { container, register, style }
}
