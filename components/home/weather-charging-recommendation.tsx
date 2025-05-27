"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Cloud, CloudRain, Sun, Thermometer, Wind, Zap } from "lucide-react"

type WeatherData = {
  temperature: number
  condition: "sunny" | "cloudy" | "rainy" | "windy"
  chargingEfficiency: "excellent" | "good" | "moderate" | "poor"
  recommendation: string
  bestTimeToday: string
  bestTimeRange: string
}

export function WeatherChargingRecommendation() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 실제 구현에서는 API에서 데이터를 가져옵니다
    // 여기서는 예시 데이터를 사용합니다
    const mockWeather: WeatherData = {
      temperature: 18,
      condition: "sunny",
      chargingEfficiency: "excellent",
      recommendation: "현재 배터리 효율이 최적 상태입니다. 지금 충전하시면 최대 충전 속도를 경험하실 수 있습니다.",
      bestTimeToday: "14:00 - 16:00",
      bestTimeRange: "오후",
    }

    setTimeout(() => {
      setWeather(mockWeather)
      setLoading(false)
    }, 1000)
  }, [])

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-6 w-6 text-yellow-500" />
      case "cloudy":
        return <Cloud className="h-6 w-6 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-6 w-6 text-blue-500" />
      case "windy":
        return <Wind className="h-6 w-6 text-teal-500" />
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />
    }
  }

  const getEfficiencyColor = (efficiency: string) => {
    switch (efficiency) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200"
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "poor":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Thermometer className="h-5 w-5 mr-2 text-red-500" />
          날씨 기반 충전 추천
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getWeatherIcon(weather?.condition || "sunny")}
                <div>
                  <div className="text-2xl font-bold">{weather?.temperature}°C</div>
                  <div className="text-sm text-gray-500">서울 강남구</div>
                </div>
              </div>
              <Badge className={`px-3 py-1 ${getEfficiencyColor(weather?.chargingEfficiency || "good")}`}>
                <Zap className="h-3 w-3 mr-1" />
                충전 효율:{" "}
                {weather?.chargingEfficiency === "excellent"
                  ? "최상"
                  : weather?.chargingEfficiency === "good"
                    ? "좋음"
                    : weather?.chargingEfficiency === "moderate"
                      ? "보통"
                      : "낮음"}
              </Badge>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">오늘의 충전 추천</h3>
                <p className="text-sm text-gray-700 mb-3">{weather?.recommendation}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-500">최적 충전 시간: </span>
                    <span className="font-medium">{weather?.bestTimeToday}</span>
                  </div>
                  <Button size="sm" className="h-8">
                    <Zap className="h-3 w-3 mr-1" />
                    충전소 찾기
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-2">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-xs text-gray-500">오전</div>
                  <div className="flex justify-center my-1">
                    <Sun className="h-5 w-5 text-yellow-500" />
                  </div>
                  <Badge variant="outline" className="w-full text-xs font-normal">
                    좋음
                  </Badge>
                </CardContent>
              </Card>
              <Card className="border-green-200">
                <CardContent className="p-3 text-center bg-green-50">
                  <div className="text-xs text-gray-500">오후</div>
                  <div className="flex justify-center my-1">
                    <Sun className="h-5 w-5 text-yellow-500" />
                  </div>
                  <Badge
                    variant="outline"
                    className="w-full text-xs font-normal bg-green-100 text-green-800 border-green-200"
                  >
                    최상
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-xs text-gray-500">저녁</div>
                  <div className="flex justify-center my-1">
                    <Cloud className="h-5 w-5 text-gray-500" />
                  </div>
                  <Badge variant="outline" className="w-full text-xs font-normal">
                    보통
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
