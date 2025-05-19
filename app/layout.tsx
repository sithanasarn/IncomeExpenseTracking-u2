import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { ConnectionStatus } from "@/components/connection-status"
import { TechBackground } from "@/components/tech-background"
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
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-6 pt-16 md:p-8 md:pt-6">{children}</main>
            </div>
          </div>
          <ConnectionStatus />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
