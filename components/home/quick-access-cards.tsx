"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, HelpCircle, AlertTriangle, CreditCard, Zap, Car, History } from "lucide-react"

export function QuickAccessCards() {
  const quickAccessItems = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "주변 충전소",
      description: "내 위치 기반 충전소 찾기",
      href: "/stations",
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      title: "문제 해결",
      description: "충전 문제 해결 가이드",
      href: "/help",
      color: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "진단 마법사",
      description: "단계별 문제 진단",
      href: "/troubleshooting-wizard",
      color: "bg-red-50 text-red-700 hover:bg-red-100",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "결제 관리",
      description: "결제 수단 및 내역 관리",
      href: "/payments",
      color: "bg-purple-50 text-purple-700 hover:bg-purple-100",
    },
    {
      icon: <Car className="h-5 w-5" />,
      title: "내 차량",
      description: "차량 정보 및 설정",
      href: "/my-vehicle",
      color: "bg-green-50 text-green-700 hover:bg-green-100",
    },
    {
      icon: <History className="h-5 w-5" />,
      title: "충전 이력",
      description: "과거 충전 기록 조회",
      href: "/history",
      color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
    },
  ]

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-green-600" />
          빠른 접근
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {quickAccessItems.map((item, index) => (
            <Link href={item.href} key={index}>
              <Button
                variant="outline"
                className={`w-full h-auto py-3 px-3 justify-start flex-col items-start text-left ${item.color}`}
              >
                <div className="flex items-center mb-1">
                  {item.icon}
                  <span className="ml-2 font-medium">{item.title}</span>
                </div>
                <span className="text-xs opacity-80">{item.description}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
