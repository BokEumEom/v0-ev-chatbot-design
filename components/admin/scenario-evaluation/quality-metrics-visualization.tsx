"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// 샘플 레이더 차트 데이터
const radarData = [
  {
    category: "자연스러움",
    "개선 전": 65,
    "개선 후": 90,
    fullMark: 100,
  },
  {
    category: "문제 해결력",
    "개선 전": 50,
    "개선 후": 85,
    fullMark: 100,
  },
  {
    category: "상세함",
    "개선 전": 40,
    "개선 후": 75,
    fullMark: 100,
  },
  {
    category: "정확성",
    "개선 전": 70,
    "개선 후": 85,
    fullMark: 100,
  },
  {
    category: "사용자 친화성",
    "개선 전": 60,
    "개선 후": 90,
    fullMark: 100,
  },
  {
    category: "다양성",
    "개선 전": 45,
    "개선 후": 80,
    fullMark: 100,
  },
]

// 샘플 바 차트 데이터
const barData = [
  { name: "충전 케이블 연결 문제", "개선 전": 85, "개선 후": 95 },
  { name: "앱 결제 오류", "개선 전": 65, "개선 후": 88 },
  { name: "충전소 위치 찾기", "개선 전": 45, "개선 후": 82 },
  { name: "충전 속도 저하 문제", "개선 전": 78, "개선 후": 90 },
  { name: "회원 등록 문제", "개선 전": 92, "개선 후": 95 },
]

// 샘플 시계열 데이터
const timeSeriesData = [
  { date: "2023-01", score: 62 },
  { date: "2023-02", score: 65 },
  { date: "2023-03", score: 68 },
  { date: "2023-04", score: 72 },
  { date: "2023-05", score: 75 },
  { date: "2023-06", score: 78 },
  { date: "2023-07", score: 80 },
  { date: "2023-08", score: 82 },
  { date: "2023-09", score: 85 },
  { date: "2023-10", score: 88 },
  { date: "2023-11", score: 90 },
  { date: "2023-12", score: 92 },
]

export function QualityMetricsVisualization() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">품질 지표 시각화</h3>
      </div>

      <Tabs defaultValue="radar">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="radar">레이더 차트</TabsTrigger>
          <TabsTrigger value="comparison">시나리오 비교</TabsTrigger>
          <TabsTrigger value="trend">품질 추세</TabsTrigger>
        </TabsList>

        <TabsContent value="radar" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>시나리오 품질 지표 레이더 차트</CardTitle>
              <CardDescription>개선 전후 시나리오의 품질 지표 비교</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    "개선 전": {
                      label: "개선 전",
                      color: "hsl(var(--chart-1))",
                    },
                    "개선 후": {
                      label: "개선 후",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="개선 전"
                        dataKey="개선 전"
                        stroke="var(--color-개선 전)"
                        fill="var(--color-개선 전)"
                        fillOpacity={0.2}
                      />
                      <Radar
                        name="개선 후"
                        dataKey="개선 후"
                        stroke="var(--color-개선 후)"
                        fill="var(--color-개선 후)"
                        fillOpacity={0.2}
                      />
                      <Legend />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>시나리오별 품질 점수 비교</CardTitle>
              <CardDescription>개선 전후 시나리오의 품질 점수 비교</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    "개선 전": {
                      label: "개선 전",
                      color: "hsl(var(--chart-1))",
                    },
                    "개선 후": {
                      label: "개선 후",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="개선 전" fill="var(--color-개선 전)" />
                      <Bar dataKey="개선 후" fill="var(--color-개선 후)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>시나리오 품질 추세</CardTitle>
              <CardDescription>시간에 따른 시나리오 품질 점수 변화</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    score: {
                      label: "품질 점수",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="score" stroke="var(--color-score)" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
