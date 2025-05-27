"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Battery, Calendar, Clock, Zap } from "lucide-react"

type ChargingStats = {
  totalSessions: number
  totalEnergy: number
  averageTime: number
  costSaved: number
  weeklyData: {
    day: string
    energy: number
  }[]
  chargerTypes: {
    name: string
    value: number
  }[]
}

export function ChargingStatsSummary() {
  const [stats, setStats] = useState<ChargingStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 실제 구현에서는 API에서 데이터를 가져옵니다
    // 여기서는 예시 데이터를 사용합니다
    const mockStats: ChargingStats = {
      totalSessions: 12,
      totalEnergy: 324.5,
      averageTime: 45,
      costSaved: 28500,
      weeklyData: [
        { day: "월", energy: 45.2 },
        { day: "화", energy: 38.7 },
        { day: "수", energy: 52.1 },
        { day: "목", energy: 41.3 },
        { day: "금", energy: 67.8 },
        { day: "토", energy: 48.2 },
        { day: "일", energy: 31.2 },
      ],
      chargerTypes: [
        { name: "DC 급속", value: 68 },
        { name: "AC 완속", value: 32 },
      ],
    }

    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 1000)
  }, [])

  const COLORS = ["#10b981", "#6366f1"]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Battery className="h-5 w-5 mr-2 text-green-600" />내 충전 통계
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Zap className="h-5 w-5 text-amber-500 mb-1" />
                  <div className="text-2xl font-bold">{stats?.totalEnergy} kWh</div>
                  <div className="text-xs text-gray-500">총 충전량</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-500 mb-1" />
                  <div className="text-2xl font-bold">{stats?.totalSessions}회</div>
                  <div className="text-xs text-gray-500">충전 세션</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-500 mb-1" />
                  <div className="text-2xl font-bold">{stats?.averageTime}분</div>
                  <div className="text-xs text-gray-500">평균 충전 시간</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Zap className="h-5 w-5 text-green-500 mb-1" />
                  <div className="text-2xl font-bold">{stats?.costSaved.toLocaleString()}원</div>
                  <div className="text-xs text-gray-500">절약 비용</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm font-medium">주간 충전량</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-48">
                    <ChartContainer
                      config={{
                        energy: {
                          label: "충전량 (kWh)",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="energy" fill="var(--color-energy)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm font-medium">충전기 유형</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-48 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.chargerTypes}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats?.chargerTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
