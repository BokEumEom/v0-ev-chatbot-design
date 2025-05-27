"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Zap, Clock, AlertTriangle } from "lucide-react"

type ChargingStation = {
  id: string
  name: string
  location: string
  distance: string
  chargers: {
    id: string
    type: string
    power: string
    status: "available" | "in-use" | "offline"
  }[]
  waitTime: string
}

export function ChargingStationMap() {
  const [stations, setStations] = useState<ChargingStation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 실제 구현에서는 API에서 데이터를 가져옵니다
    // 여기서는 예시 데이터를 사용합니다
    const mockStations: ChargingStation[] = [
      {
        id: "station1",
        name: "강남 충전소",
        location: "서울 강남구 테헤란로 152",
        distance: "0.5km",
        chargers: [
          { id: "1", type: "DC 콤보", power: "350kW", status: "available" },
          { id: "2", type: "DC 콤보", power: "350kW", status: "offline" },
          { id: "3", type: "DC 차데모", power: "50kW", status: "in-use" },
        ],
        waitTime: "대기 없음",
      },
      {
        id: "station2",
        name: "삼성동 충전소",
        location: "서울 강남구 삼성동 159",
        distance: "1.2km",
        chargers: [
          { id: "1", type: "DC 콤보", power: "200kW", status: "available" },
          { id: "2", type: "DC 콤보", power: "200kW", status: "available" },
        ],
        waitTime: "대기 없음",
      },
      {
        id: "station3",
        name: "코엑스 충전소",
        location: "서울 강남구 삼성동 159 코엑스",
        distance: "1.8km",
        chargers: [
          { id: "1", type: "DC 콤보", power: "100kW", status: "in-use" },
          { id: "2", type: "DC 콤보", power: "100kW", status: "in-use" },
          { id: "3", type: "DC 콤보", power: "100kW", status: "available" },
        ],
        waitTime: "1대 대기 중",
      },
    ]

    setTimeout(() => {
      setStations(mockStations)
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>주변 충전소</CardTitle>
        <CardDescription>현재 위치에서 가까운 충전소 정보</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {stations.map((station) => (
              <Card key={station.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{station.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{station.location}</span>
                      </div>
                    </div>
                    <Badge variant={station.waitTime === "대기 없음" ? "outline" : "secondary"}>
                      {station.waitTime}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {station.chargers.map((charger) => (
                      <div
                        key={charger.id}
                        className={`p-2 rounded-md border ${
                          charger.status === "available"
                            ? "border-green-200 bg-green-50"
                            : charger.status === "in-use"
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">충전기 {charger.id}</span>
                          {charger.status === "available" ? (
                            <Zap className="h-3 w-3 text-green-600" />
                          ) : charger.status === "in-use" ? (
                            <Clock className="h-3 w-3 text-yellow-600" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                        <div className="text-xs">
                          {charger.type} · {charger.power}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-3 text-sm">
                    <span className="text-gray-500">거리: {station.distance}</span>
                    <button className="text-blue-600 hover:underline text-sm">길 안내</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
