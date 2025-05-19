import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { ConnectionStatus } from "@/components/connection-status"
import { TechBackground } from "@/components/tech-background"
import { ScrollHeaderEffect } from "@/components/scroll-header-effect"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Finance Tracker",
  description: "Track your income and expenses with ease",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <div className="flex min-h-screen flex-col dark:bg-background dark:text-foreground">
            <TechBackground />
            <Header />
            <ScrollHeaderEffect />
            <div className="flex flex-1 pt-0">
              <Sidebar />
              <main className="flex-1 container px-4 py-6 md:px-6 md:py-8">{children}</main>
            </div>
          </div>
          <ConnectionStatus />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
