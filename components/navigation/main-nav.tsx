"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useState } from "react"
import { BarChart, CheckCircle, FileText, HelpCircle, Home, MessageSquare, Zap, BarChart2 } from "lucide-react"

// 네비게이션 항목 정의
const navItems = [
  {
    title: "홈",
    href: "/",
    icon: Home,
  },
  {
    title: "충전소",
    href: "/stations",
    icon: Zap,
  },
  {
    title: "분석",
    href: "/analytics",
    icon: BarChart,
  },
  {
    title: "대화 분석",
    href: "/conversation-analytics",
    icon: MessageSquare,
  },
  {
    title: "프롬프트 관리",
    href: "/prompt-management",
    icon: MessageSquare,
  },
  {
    title: "품질 평가",
    href: "/quality-evaluation",
    icon: CheckCircle,
  },
  {
    title: "도움말",
    href: "/help",
    icon: HelpCircle,
  },
  {
    title: "API 문서",
    href: "/docs",
    icon: FileText,
  },
  {
    title: "응답 품질 모니터링",
    href: "/admin/response-quality",
    icon: BarChart2,
    description: "AI 챗봇 응답 품질을 모니터링합니다.",
  },
  // 시나리오 관련 메뉴 항목 추가
  {
    title: "시나리오 테스트",
    href: "/admin/scenario-test",
    icon: CheckCircle,
    description: "챗봇 시나리오를 테스트합니다.",
  },
  {
    title: "시나리오 생성기",
    href: "/admin/scenario-generator",
    icon: FileText,
    description: "새로운 챗봇 시나리오를 생성합니다.",
  },
  {
    title: "사용자 데이터 기반 시나리오",
    href: "/admin/scenario-generator/user-data-based",
    icon: BarChart,
    description: "실제 사용자 대화 데이터를 기반으로 시나리오를 생성합니다.",
  },
  {
    title: "대화 데이터 분석",
    href: "/admin/conversation-data",
    icon: BarChart2,
    description: "사용자 대화 데이터를 분석합니다.",
  },
  {
    title: "시나리오 평가",
    href: "/admin/scenario-evaluation",
    icon: CheckCircle,
    description: "생성된 시나리오의 품질을 평가합니다.",
  },
]

export function MainNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center">
      {/* 모바일 메뉴 */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary px-2 py-1 rounded-md",
                    pathname === item.href ? "bg-muted font-semibold" : "text-muted-foreground",
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* 데스크톱 메뉴 */}
      <nav className="hidden md:flex items-center gap-6 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "font-medium transition-colors hover:text-primary",
              pathname === item.href ? "text-foreground font-semibold" : "text-muted-foreground",
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}
