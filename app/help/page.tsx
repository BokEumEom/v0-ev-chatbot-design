import Link from "next/link"
import {
  AlertTriangle,
  Award,
  Calendar,
  Car,
  CreditCard,
  HelpCircle,
  MapPin,
  Smartphone,
  User,
  Wand2,
  Zap,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TroubleshootingSearch } from "@/components/troubleshooting-search"

// 도움말 카테고리 데이터
const helpCategories = [
  {
    id: "charging",
    title: "충전 문제",
    description: "충전이 시작되지 않거나 중단되는 등의 문제",
    icon: Zap,
    color: "text-yellow-500",
    guides: [
      { id: "charging-1", title: "충전이 시작되지 않아요" },
      { id: "charging-2", title: "충전 중 갑자기 중단됐어요" },
      { id: "charging-3", title: "충전 속도가 너무 느려요" },
      { id: "charging-4", title: "충전 케이블이 분리되지 않아요" },
      { id: "charging-5", title: "충전기에 접근할 수 없어요" },
    ],
  },
  {
    id: "payment",
    title: "결제 문제",
    description: "결제 실패, 이중 결제 등의 문제",
    icon: CreditCard,
    color: "text-blue-500",
    guides: [
      { id: "payment-1", title: "결제가 실패했어요" },
      { id: "payment-2", title: "이중 결제가 됐어요" },
      { id: "payment-3", title: "영수증이 필요해요" },
      { id: "payment-4", title: "멤버십 할인이 적용되지 않았어요" },
    ],
  },
  {
    id: "account",
    title: "계정 관리",
    description: "비밀번호 재설정, 회원 정보 변경 등",
    icon: User,
    color: "text-green-500",
    guides: [
      { id: "account-1", title: "비밀번호를 잊어버렸어요" },
      { id: "account-2", title: "회원 정보를 변경하고 싶어요" },
      { id: "account-3", title: "계정을 삭제하고 싶어요" },
      { id: "account-4", title: "다른 기기에서 로그인했어요" },
    ],
  },
  {
    id: "location",
    title: "위치 찾기",
    description: "충전소 위치 검색 및 정보 관련 문제",
    icon: MapPin,
    color: "text-red-500",
    guides: [
      { id: "location-1", title: "가까운 충전소를 찾고 싶어요" },
      { id: "location-2", title: "충전소 정보가 실제와 다릅니다" },
      { id: "location-3", title: "충전소 길 안내가 정확하지 않아요" },
      { id: "location-4", title: "특정 커넥터 타입의 충전소만 찾고 싶어요" },
    ],
  },
  {
    id: "reservation",
    title: "예약 관리",
    description: "충전 예약 및 관리 관련 문제",
    icon: Calendar,
    color: "text-purple-500",
    guides: [
      { id: "reservation-1", title: "충전 예약은 어떻게 하나요?" },
      { id: "reservation-2", title: "예약을 취소하고 싶어요" },
      { id: "reservation-3", title: "예약 시간에 도착하지 못할 것 같아요" },
      { id: "reservation-4", title: "예약했는데 충전기가 사용 중이에요" },
    ],
  },
  {
    id: "vehicle",
    title: "차량 관리",
    description: "차량 등록 및 관리 관련 문제",
    icon: Car,
    color: "text-cyan-500",
    guides: [
      { id: "vehicle-1", title: "내 차량 정보를 등록하고 싶어요" },
      { id: "vehicle-2", title: "내 차량에 맞는 충전기를 찾고 싶어요" },
      { id: "vehicle-3", title: "차량 충전 포트가 열리지 않아요" },
      { id: "vehicle-4", title: "배터리 관리 팁이 필요해요" },
    ],
  },
  {
    id: "emergency",
    title: "긴급 상황",
    description: "충전 중 화재, 감전 등 긴급 상황 대처법",
    icon: AlertTriangle,
    color: "text-orange-500",
    guides: [
      { id: "emergency-1", title: "충전 중 화재가 발생했어요" },
      { id: "emergency-2", title: "충전 중 감전이 의심돼요" },
      { id: "emergency-3", title: "충전소에서 사고가 났어요" },
      { id: "emergency-4", title: "주행 중 배터리가 방전될 것 같아요" },
    ],
  },
  {
    id: "app",
    title: "앱 문제",
    description: "앱 사용 중 발생하는 문제",
    icon: Smartphone,
    color: "text-indigo-500",
    guides: [
      { id: "app-1", title: "앱이 자꾸 종료돼요" },
      { id: "app-2", title: "충전소 정보가 로딩되지 않아요" },
      { id: "app-3", title: "푸시 알림이 오지 않아요" },
      { id: "app-4", title: "앱 사용량이 너무 많아요" },
    ],
  },
  {
    id: "membership",
    title: "멤버십",
    description: "멤버십 가입, 혜택, 해지 관련 문의",
    icon: Award,
    color: "text-pink-500",
    guides: [
      { id: "membership-1", title: "멤버십 가입 방법이 궁금해요" },
      { id: "membership-2", title: "멤버십 혜택이 궁금해요" },
      { id: "membership-3", title: "멤버십을 해지하고 싶어요" },
      { id: "membership-4", title: "멤버십 결제일을 변경하고 싶어요" },
    ],
  },
]

// 인기 검색어
const popularQueries = [
  "충전이 안돼요",
  "결제 실패",
  "비밀번호 찾기",
  "충전 중단",
  "가까운 충전소",
  "멤버십 혜택",
  "배터리 관리",
  "충전 예약",
]

export default function HelpPage() {
  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">전기차 충전 도움말 센터</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          전기차 충전과 관련된 모든 문제에 대한 해결책을 찾아보세요. 원하는 주제를 검색하거나 카테고리별로 살펴볼 수
          있습니다.
        </p>
      </div>

      {/* 검색 */}
      <div className="max-w-2xl mx-auto mb-8">
        <TroubleshootingSearch
          onSearch={(query) => console.log("Search for:", query)}
          popularQueries={popularQueries}
        />
      </div>

      {/* 문제 진단 마법사 */}
      <div className="max-w-2xl mx-auto mb-12">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-blue-500" />
              문제 진단 마법사
            </CardTitle>
            <CardDescription>단계별 질문에 답하여 문제를 정확히 진단하고 맞춤형 해결책을 찾아보세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              복잡한 문제나 원인을 파악하기 어려운 경우, 문제 진단 마법사가 도움을 드립니다. 몇 가지 질문에 답하면 가장
              적합한 해결책을 제시해 드립니다.
            </p>
            <Button asChild>
              <Link href="/troubleshooting-wizard">
                <Wand2 className="mr-2 h-4 w-4" />
                문제 진단 마법사 시작하기
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {helpCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <category.icon className={`h-5 w-5 ${category.color}`} />
                <CardTitle>{category.title}</CardTitle>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {category.guides.map((guide) => (
                  <li key={guide.id}>
                    <Link href={`/help/${category.id}/${guide.id}`} className="text-blue-600 hover:underline">
                      {guide.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 추가 도움말 */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">원하는 답변을 찾지 못하셨나요?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">
            <HelpCircle className="mr-2 h-4 w-4" />
            고객센터 채팅
          </Button>
          <Button variant="outline" size="lg">
            전화 문의 (1234-5678)
          </Button>
        </div>
      </div>
    </div>
  )
}
