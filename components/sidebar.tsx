"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, PlusCircle, ListOrdered } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function Sidebar() {
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
    <div className="hidden border-r border-[#2a2a3c] bg-background md:block md:w-64 dark:bg-[#0f1015] dark:glass-effect">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex h-14 items-center border-b border-[#2a2a3c] px-4 font-semibold text-neon-green neon-text">
          Finance Tracker
        </div>
        <div className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className={cn(
                  "flex h-10 items-center justify-start gap-2 px-4 text-sm font-medium transition-all duration-200",
                  pathname === route.href
                    ? "bg-secondary text-secondary-foreground dark:bg-[#1c1c2a] dark:text-neon-green dark:neon-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                )}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="h-5 w-5" />
                  {route.title}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
