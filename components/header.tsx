"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { MobileSidebar } from "@/components/mobile-sidebar"

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2a2a3c] bg-background/80 backdrop-blur-md dark:bg-[#0f1015]/90 dark:glass-effect">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-4 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-[280px] border-r border-[#2a2a3c] bg-transparent"
            onInteractOutside={handleClose}
          >
            <MobileSidebar onClose={handleClose} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="font-semibold text-lg dark:text-neon-green dark:neon-text">
            Finance Tracker
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
