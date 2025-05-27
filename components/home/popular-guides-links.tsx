"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ExternalLink } from "lucide-react"
import Link from "next/link"

export function PopularGuidesLinks() {
  const popularGuides = [
    {
      title: "처음 충전하는 방법",
      views: 1245,
      href: "/help/basics/first-time-charging",
    },
    {
      title: "충전 속도를 높이는 팁",
      views: 982,
      href: "/help/tips/faster-charging",
    },
    {
      title: "충전기 종류별 특징",
      views: 876,
      href: "/help/basics/charger-types",
    },
    {
      title: "배터리 수명 연장하기",
      views: 754,
      href: "/help/maintenance/battery-life",
    },
    {
      title: "충전 중 오류 해결하기",
      views: 621,
      href: "/help/troubleshooting/charging-errors",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
          인기 가이드
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ul className="space-y-2">
          {popularGuides.map((guide, index) => (
            <li key={index}>
              <Link
                href={guide.href}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm">{guide.title}</span>
                <div className="flex items-center text-gray-500">
                  <span className="text-xs mr-1">{guide.views.toLocaleString()}</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
