"use client"

import Image from "next/image"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VisualGuideProps {
  category: string
  guideId: string
}

export function TroubleshootingVisualGuide({ category, guideId }: VisualGuideProps) {
  const [activeTab, setActiveTab] = useState("image")

  // 실제 구현에서는 이미지와 다이어그램 URL을 데이터베이스나 API에서 가져옵니다
  const visualGuides = {
    charging: {
      "charging-1": {
        images: ["/ev-charging-cable-connection.png", "/placeholder.svg?key=wfzxz"],
        diagram: "/charging-troubleshooting-flowchart.png",
      },
      "charging-2": {
        images: ["/placeholder.svg?key=dti0l", "/placeholder.svg?key=zv0kl"],
        diagram: "/placeholder.svg?height=400&width=600&query=충전 중단 원인 분석 다이어그램",
      },
      "charging-3": {
        images: [
          "/placeholder.svg?height=400&width=600&query=배터리 충전 속도 그래프",
          "/placeholder.svg?height=400&width=600&query=충전기 용량별 충전 속도 비교",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=충전 속도에 영향을 미치는 요소 다이어그램",
      },
      "charging-4": {
        images: [
          "/placeholder.svg?height=400&width=600&query=충전 케이블 분리 버튼 위치",
          "/placeholder.svg?height=400&width=600&query=차량별 충전 포트 잠금 해제 방법",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=충전 케이블 잠금 메커니즘 작동 원리",
      },
      "charging-5": {
        images: [
          "/placeholder.svg?height=400&width=600&query=충전소 접근 제한 표시",
          "/placeholder.svg?height=400&width=600&query=충전소 운영 시간 안내판",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=충전소 접근성 문제 해결 가이드",
      },
    },
    payment: {
      "payment-1": {
        images: [
          "/placeholder.svg?height=400&width=600&query=결제 실패 화면",
          "/placeholder.svg?height=400&width=600&query=카드 정보 업데이트 화면",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=결제 프로세스 흐름도",
      },
      "payment-2": {
        images: [
          "/placeholder.svg?height=400&width=600&query=이중 결제 내역 화면",
          "/placeholder.svg?height=400&width=600&query=환불 요청 화면",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=이중 결제 처리 프로세스",
      },
      "payment-3": {
        images: [
          "/placeholder.svg?height=400&width=600&query=영수증 조회 화면",
          "/placeholder.svg?height=400&width=600&query=영수증 이메일 전송 화면",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=영수증 발급 프로세스",
      },
      "payment-4": {
        images: [
          "/placeholder.svg?height=400&width=600&query=멤버십 할인 적용 화면",
          "/placeholder.svg?height=400&width=600&query=할인 미적용 신고 화면",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=멤버십 할인 적용 프로세스",
      },
    },
    vehicle: {
      "vehicle-1": {
        images: [
          "/placeholder.svg?height=400&width=600&query=차량 정보 등록 화면",
          "/placeholder.svg?height=400&width=600&query=차량 충전 포트 타입 선택",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=차량 등록 프로세스 흐름도",
      },
      "vehicle-2": {
        images: [
          "/placeholder.svg?height=400&width=600&query=차량 맞춤 충전소 필터링",
          "/placeholder.svg?height=400&width=600&query=커넥터 타입별 충전기 호환성",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=차량별 충전기 호환성 매트릭스",
      },
      "vehicle-3": {
        images: [
          "/placeholder.svg?height=400&width=600&query=충전 포트 수동 열기 방법",
          "/placeholder.svg?height=400&width=600&query=차량별 충전 포트 위치",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=충전 포트 잠금 메커니즘 작동 원리",
      },
      "vehicle-4": {
        images: [
          "/placeholder.svg?height=400&width=600&query=배터리 충전 수준 최적화 그래프",
          "/placeholder.svg?height=400&width=600&query=온도별 배터리 성능 영향",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=배터리 수명 최적화 가이드",
      },
    },
    emergency: {
      "emergency-1": {
        images: [
          "/placeholder.svg?height=400&width=600&query=충전소 비상 정지 버튼 위치",
          "/placeholder.svg?height=400&width=600&query=전기차 화재 대피 방법",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=화재 발생 시 대응 절차",
      },
      "emergency-2": {
        images: [
          "/placeholder.svg?height=400&width=600&query=감전 위험 표시",
          "/placeholder.svg?height=400&width=600&query=감전 응급 처치 방법",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=감전 사고 대응 프로토콜",
      },
      "emergency-3": {
        images: [
          "/placeholder.svg?height=400&width=600&query=충전소 사고 현장 기록 방법",
          "/placeholder.svg?height=400&width=600&query=사고 신고 화면",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=충전소 사고 대응 절차",
      },
      "emergency-4": {
        images: [
          "/placeholder.svg?height=400&width=600&query=배터리 부족 경고 화면",
          "/placeholder.svg?height=400&width=600&query=에코 모드 활성화 방법",
        ],
        diagram: "/placeholder.svg?height=400&width=600&query=배터리 방전 시 대응 가이드",
      },
    },
  }

  const guide =
    visualGuides[category as keyof typeof visualGuides]?.[
      guideId as keyof (typeof visualGuides)[keyof typeof visualGuides]
    ]

  if (!guide) {
    return null
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image">이미지 가이드</TabsTrigger>
            <TabsTrigger value="diagram">다이어그램</TabsTrigger>
          </TabsList>
          <TabsContent value="image" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {guide.images.map((image, index) => (
                <div key={index} className="relative aspect-video overflow-hidden rounded-lg border">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`시각적 가이드 ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="diagram" className="mt-4">
            <div className="relative aspect-video overflow-hidden rounded-lg border">
              <Image
                src={guide.diagram || "/placeholder.svg"}
                alt="문제 해결 다이어그램"
                fill
                className="object-contain"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
