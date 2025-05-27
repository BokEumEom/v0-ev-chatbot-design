import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/navigation/main-nav"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

// 메타데이터 및 네비게이션 업데이트
export const metadata: Metadata = {
  title: "전기차 충전 도우미",
  description: "Gemini 2.0 Flash 모델을 사용한 전기차 충전소 AI 챗봇",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="min-h-screen flex flex-col">
            <header className="border-b sticky top-0 z-50 bg-background">
              <div className="container mx-auto flex justify-between items-center py-4">
                <div className="flex items-center gap-6">
                  <Link href="/" className="text-xl font-bold">
                    전기차 충전 도우미
                  </Link>
                  <MainNav />
                </div>
              </div>
            </header>
            <div className="flex-1">{children}</div>
            <footer className="border-t py-4">
              <div className="container mx-auto text-center text-sm text-gray-500">© 2025 AI 고객지원 서비스</div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
