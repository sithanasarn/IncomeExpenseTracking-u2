"use client"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Home, PlusCircle, ListOrdered } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SheetClose } from "@/components/ui/sheet"

export function MobileSidebar({ onClose }) {
  const pathname = usePathname()
  const router = useRouter()

  const routes = [
    {
      href: "/",
      icon: Home,
      title: "Dashboard",
    },
    {
      href: "/transactions",
      icon: ListOrdered,
      title: "Transactions",
    },
    {
      href: "/add",
      icon: PlusCircle,
      title: "Add New",
    },
    {
      href: "/reports",
      icon: BarChart3,
      title: "Reports",
    },
  ]

  const handleNavigation = (href) => {
    router.push(href)
    if (onClose) onClose()
  }

  return (
    <div className="flex h-full flex-col bg-[#13131a] border-r border-[#2a2a3c]">
      <div className="flex h-14 items-center border-b border-[#2a2a3c] px-4 font-semibold text-neon-green neon-text bg-[#0f1015]">
        Finance Tracker
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-2 px-2">
          {routes.map((route) => (
            <SheetClose key={route.href} asChild>
              <Button
                onClick={() => handleNavigation(route.href)}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className={cn(
                  "flex h-12 items-center justify-start gap-3 px-4 text-base font-medium transition-all duration-200 w-full",
                  pathname === route.href
                    ? "bg-[#1c1c2a] text-neon-green neon-text"
                    : "text-white hover:text-neon-green hover:bg-[#1c1c2a]/50",
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.title}
              </Button>
            </SheetClose>
          ))}
        </nav>
      </div>
    </div>
  )
}
