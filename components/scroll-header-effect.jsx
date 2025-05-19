"use client"

import { useEffect, useState } from "react"

export function ScrollHeaderEffect() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [scrolled])

  useEffect(() => {
    const header = document.querySelector("header")
    if (header) {
      if (scrolled) {
        header.classList.add("scrolled")
      } else {
        header.classList.remove("scrolled")
      }
    }
  }, [scrolled])

  return null
}
