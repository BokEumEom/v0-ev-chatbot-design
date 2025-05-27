import { CustomerSupportChat } from "@/components/customer-support-chat"
import { QuickAccessCards } from "@/components/home/quick-access-cards"
import { RecentChargingStations } from "@/components/home/recent-charging-stations"
import { ChargingStatsSummary } from "@/components/home/charging-stats-summary"
import { WeatherChargingRecommendation } from "@/components/home/weather-charging-recommendation"
import { PopularGuidesLinks } from "@/components/home/popular-guides-links"
import { LatestAnnouncements } from "@/components/home/latest-announcements"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="z-10 w-full max-w-7xl">
        <h1 className="text-4xl font-bold text-center mb-8">전기차 충전 도우미</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 사이드바 - 빠른 액세스 및 공지사항 */}
          <div className="space-y-6">
            <QuickAccessCards />
            <LatestAnnouncements />
            <PopularGuidesLinks />
          </div>

          {/* 중앙 - 채팅 인터페이스 */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="chat">AI 상담사</TabsTrigger>
                <TabsTrigger value="dashboard">내 충전 현황</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
                <CustomerSupportChat />
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-6">
                <ChargingStatsSummary />
                <RecentChargingStations />
                <WeatherChargingRecommendation />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  )
}
