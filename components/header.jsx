"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { MobileNav } from "@/components/mobile-nav"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (mobileMenuOpen && !e.target.closest(".mobile-menu") && !e.target.closest(".mobile-menu-button")) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener("click", handleOutsideClick)
    return () => document.removeEventListener("click", handleOutsideClick)
  }, [mobileMenuOpen])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2a2a3c] bg-background/80 backdrop-blur-md dark:bg-[#0f1015]/90 dark:glass-effect">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <button
          className="mr-4 p-2 rounded-md md:hidden mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6 text-neon-green" /> : <Menu className="h-6 w-6" />}
        </button>

        <div className="flex items-center justify-between w-full">
          <Link href="/" className="font-semibold text-lg dark:text-neon-green dark:neon-text">
            Finance Tracker
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - Fixed z-index issue */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs mobile-menu z-[10000]">
            <MobileNav onNavigation={closeMobileMenu} />
          </div>
        </div>
      )}
    </header>
  )
}
