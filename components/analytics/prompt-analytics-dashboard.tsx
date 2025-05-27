"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Charts } from "./charts"
import { PromptVariantManager } from "./prompt-variant-manager"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { addDays, format } from "date-fns"

export function PromptAnalyticsDashboard() {
  const [date, setDate] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">성능 분석</h2>
        <DateRangePicker date={date} onDateChange={setDate} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="variants">프롬프트 변형</TabsTrigger>
          <TabsTrigger value="feedback">사용자 피드백</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 대화</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,853</div>
                <p className="text-xs text-muted-foreground">+19% 지난 달 대비</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">평균 응답 시간</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2초</div>
                <p className="text-xs text-muted-foreground">-0.3초 지난 달 대비</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">사용자 만족도</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">+5% 지난 달 대비</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">해결률</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">+2% 지난 달 대비</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>일일 대화량</CardTitle>
                <CardDescription>
                  {format(date.from, "PPP")} - {format(date.to, "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Charts.ConversationsChart />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>인텐트 분포</CardTitle>
                <CardDescription>사용자 질문 유형 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <Charts.IntentDistributionChart />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>응답 성능 지표</CardTitle>
              <CardDescription>시간에 따른 응답 품질 및 성능 변화</CardDescription>
            </CardHeader>
            <CardContent>
              <Charts.PerformanceMetricsChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="space-y-4">
          <PromptVariantManager />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>사용자 피드백 분석</CardTitle>
              <CardDescription>사용자 피드백 및 평가 데이터</CardDescription>
            </CardHeader>
            <CardContent>
              <Charts.FeedbackAnalysisChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
