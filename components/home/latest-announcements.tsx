"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, ChevronRight } from "lucide-react"
import Link from "next/link"

export function LatestAnnouncements() {
  const announcements = [
    {
      id: "ann1",
      title: "신규 초고속 충전소 오픈",
      date: "2025-05-08",
      category: "신규",
      isNew: true,
    },
    {
      id: "ann2",
      title: "앱 업데이트 안내 (v2.5.0)",
      date: "2025-05-05",
      category: "업데이트",
      isNew: true,
    },
    {
      id: "ann3",
      title: "충전 요금 개편 안내",
      date: "2025-04-28",
      category: "공지",
      isNew: false,
    },
    {
      id: "ann4",
      title: "회원 혜택 프로그램 변경",
      date: "2025-04-20",
      category: "공지",
      isNew: false,
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Bell className="h-5 w-5 mr-2 text-orange-500" />
          최신 공지사항
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ul className="space-y-2">
          {announcements.map((announcement) => (
            <li key={announcement.id}>
              <Link
                href={`/announcements/${announcement.id}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className={`mr-2 px-1.5 py-0 text-xs ${
                        announcement.category === "신규"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : announcement.category === "업데이트"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {announcement.category}
                    </Badge>
                    <span className="text-sm">{announcement.title}</span>
                    {announcement.isNew && (
                      <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0">NEW</Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-0.5">{announcement.date}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-2 text-right">
          <Link href="/announcements" className="text-xs text-blue-600 hover:underline flex items-center justify-end">
            모든 공지사항 보기
            <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
