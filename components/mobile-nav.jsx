"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, PlusCircle, ListOrdered } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav({ onNavigation }) {
  const pathname = usePathname()

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

  return (
    <div className="flex flex-col h-full bg-[#13131a] overflow-hidden">
      <div className="flex h-16 items-center border-b border-[#2a2a3c] px-4 font-semibold text-neon-green neon-text bg-[#0f1015]">
        Finance Tracker
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={() => {
              if (onNavigation) onNavigation()
            }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md transition-all",
              pathname === route.href
                ? "bg-[#1c1c2a] text-neon-green neon-text"
                : "text-white hover:bg-[#1c1c2a]/50 hover:text-neon-green",
            )}
          >
            <route.icon className="h-5 w-5" />
            <span>{route.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
