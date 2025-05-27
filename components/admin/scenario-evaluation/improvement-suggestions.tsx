"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, RefreshCw, Check } from "lucide-react"

// 샘플 개선 제안 데이터
const sampleImprovements = [
  {
    id: "scenario-2",
    title: "앱 결제 오류",
    originalScore: 65,
    improvedScore: 88,
    originalScenario: {
      user: "앱에서 결제가 안 돼요.",
      assistant: "결제 오류가 발생했군요. 앱을 재시작해보세요.",
      user: "재시작해도 안 돼요.",
      assistant: "그럼 고객센터로 문의해주세요.",
    },
    improvedScenario: {
      user: "앱에서 결제하려고 하는데 오류가 발생했어요. '결제 처리 중 오류가 발생했습니다'라고 뜹니다.",
      assistant:
        "결제 오류가 발생하셨군요. 몇 가지 방법으로 해결해 보겠습니다. 먼저 앱을 완전히 종료한 후 다시 실행해 보시겠어요?",
      user: "방금 해봤는데 여전히 같은 오류가 발생합니다.",
      assistant:
        "네, 그렇다면 다음 단계로 진행해 보겠습니다. 1) 인터넷 연결이 안정적인지 확인해 주세요. 2) 다른 결제 수단(다른 카드나 계좌)을 등록하여 시도해 보세요. 3) 앱 설정에서 캐시를 삭제한 후 다시 시도해 보세요. 이 중 어떤 방법을 먼저 시도해 보시겠어요?",
      user: "캐시 삭제는 어떻게 하나요?",
      assistant:
        "앱 캐시 삭제 방법을 안내해 드리겠습니다. 1) 앱 하단 메뉴에서 '설정'을 탭합니다. 2) '앱 정보 및 지원'을 선택합니다. 3) '캐시 삭제' 버튼을 탭합니다. 4) 확인 메시지가 나타나면 '삭제'를 선택합니다. 캐시가 삭제된 후 앱이 자동으로 재시작됩니다. 이후 다시 결제를 시도해 보세요.",
    },
    improvements: [
      "더 구체적인 오류 상황 설명 추가",
      "단계별 문제 해결 방법 제공",
      "사용자 질문에 대한 상세한 응답",
      "대화 길이와 복잡성 증가",
    ],
  },
  {
    id: "scenario-3",
    title: "충전소 위치 찾기",
    originalScore: 45,
    improvedScore: 82,
    originalScenario: {
      user: "근처 충전소 어디 있어요?",
      assistant: "앱에서 지도를 확인하세요.",
      user: "고마워요.",
      assistant: "네, 좋은 하루 되세요.",
    },
    improvedScenario: {
      user: "지금 서울 강남에 있는데 근처에 급속 충전소 어디 있나요?",
      assistant:
        "강남 지역의 급속 충전소를 찾아드리겠습니다. 현재 위치를 더 정확히 알려주시면 가장 가까운 충전소를 안내해 드릴 수 있습니다. 아니면 앱의 '충전소 찾기' 기능을 사용하시면 실시간으로 주변 충전소의 위치와 사용 가능 여부를 확인하실 수 있습니다.",
      user: "강남역 근처에 있어요. 앱에서 어떻게 찾나요?",
      assistant:
        "강남역 근처에 계시는군요. 앱에서 충전소를 찾는 방법을 안내해 드리겠습니다: 1) 앱 하단 메뉴에서 '충전소 찾기'를 탭합니다. 2) 지도가 표시되면 현재 위치가 자동으로 표시됩니다. 3) '급속 충전'을 필터로 선택하세요. 4) 강남역 주변에는 현재 3개의 급속 충전소가 있으며, 가장 가까운 곳은 강남역 2번 출구 주차장(현재 2대 사용 가능)입니다. 다른 옵션으로는 강남 센트럴시티 지하 주차장과 테헤란로 파르나스타워 주차장이 있습니다. 어느 충전소에 대해 더 자세한 정보가 필요하신가요?",
      user: "강남역 2번 출구 주차장이 좋을 것 같아요. 요금은 어떻게 되나요?",
      assistant:
        "강남역 2번 출구 주차장 충전소의 요금 정보를 알려드리겠습니다. 이 충전소는 kW당 290원의 요금이 부과되며, 충전 후 30분 이상 주차 시 10분당 1,000원의 추가 요금이 발생합니다. 주차장 이용 첫 30분은 무료입니다. 결제는 저희 앱을 통해 가능하며, 신용카드와 간편결제를 모두 지원합니다. 충전소로 안내가 필요하시면 앱에서 '내비게이션 시작' 버튼을 탭하시면 됩니다.",
    },
    improvements: [
      "구체적인 위치 정보 요청 및 제공",
      "앱 사용 방법 상세 안내",
      "실제 충전소 정보와 상태 제공",
      "요금 및 부가 정보 추가",
      "대화의 자연스러운 흐름 개선",
    ],
  },
]

export function ImprovementSuggestions() {
  const [activeScenario, setActiveScenario] = useState(sampleImprovements[0].id)
  const [savingStatus, setSavingStatus] = useState<Record<string, "idle" | "saving" | "saved">>({})

  const handleSave = (id: string) => {
    setSavingStatus((prev) => ({ ...prev, [id]: "saving" }))
    // 실제 구현에서는 여기서 저장 API를 호출합니다
    setTimeout(() => {
      setSavingStatus((prev) => ({ ...prev, [id]: "saved" }))
    }, 1500)
  }

  const currentScenario = sampleImprovements.find((s) => s.id === activeScenario)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">개선 제안</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSavingStatus({})}>
            <RefreshCw className="h-4 w-4 mr-2" />
            상태 초기화
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">개선된 시나리오</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {sampleImprovements.map((improvement) => (
                  <li key={improvement.id}>
                    <Button
                      variant={activeScenario === improvement.id ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => setActiveScenario(improvement.id)}
                    >
                      <div>
                        <div className="font-medium">{improvement.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          점수: {improvement.originalScore} → {improvement.improvedScore}
                        </div>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {currentScenario && (
            <Card>
              <CardHeader>
                <CardTitle>{currentScenario.title}</CardTitle>
                <CardDescription>
                  품질 점수: <span className="text-red-500">{currentScenario.originalScore}</span> →{" "}
                  <span className="text-green-500">{currentScenario.improvedScore}</span> (+
                  {currentScenario.improvedScore - currentScenario.originalScore})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="comparison">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="comparison">비교</TabsTrigger>
                    <TabsTrigger value="original">원본 시나리오</TabsTrigger>
                    <TabsTrigger value="improved">개선된 시나리오</TabsTrigger>
                  </TabsList>

                  <TabsContent value="comparison" className="space-y-4 pt-4">
                    <div>
                      <h4 className="font-medium mb-2">주요 개선 사항</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentScenario.improvements.map((improvement, i) => (
                          <Badge key={i} variant="outline" className="bg-blue-50">
                            {improvement}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">원본 시나리오</CardTitle>
                        </CardHeader>
                        <CardContent className="bg-gray-50 rounded-md p-4 text-sm">
                          {Object.entries(currentScenario.originalScenario).map(([role, text], i) => (
                            <div key={i} className="mb-2">
                              <div className="font-medium text-xs text-gray-500 mb-1">
                                {role === "user" ? "사용자" : "어시스턴트"}:
                              </div>
                              <div className="pl-2">{text}</div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">개선된 시나리오</CardTitle>
                        </CardHeader>
                        <CardContent className="bg-blue-50 rounded-md p-4 text-sm">
                          {Object.entries(currentScenario.improvedScenario).map(([role, text], i) => (
                            <div key={i} className="mb-2">
                              <div className="font-medium text-xs text-gray-500 mb-1">
                                {role === "user" ? "사용자" : "어시스턴트"}:
                              </div>
                              <div className="pl-2">{text}</div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="original" className="pt-4">
                    <Card>
                      <CardContent className="p-4">
                        {Object.entries(currentScenario.originalScenario).map(([role, text], i) => (
                          <div key={i} className="mb-4">
                            <div className="font-medium text-sm text-gray-700 mb-1">
                              {role === "user" ? "사용자" : "어시스턴트"}:
                            </div>
                            <div className="pl-4 py-2 bg-gray-50 rounded-md">{text}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="improved" className="pt-4">
                    <Card>
                      <CardContent className="p-4">
                        {Object.entries(currentScenario.improvedScenario).map(([role, text], i) => (
                          <div key={i} className="mb-4">
                            <div className="font-medium text-sm text-gray-700 mb-1">
                              {role === "user" ? "사용자" : "어시스턴트"}:
                            </div>
                            <div className="pl-4 py-2 bg-blue-50 rounded-md">{text}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSave(currentScenario.id)}
                  disabled={
                    savingStatus[currentScenario.id] === "saving" || savingStatus[currentScenario.id] === "saved"
                  }
                  className="ml-auto"
                >
                  {savingStatus[currentScenario.id] === "saving" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : savingStatus[currentScenario.id] === "saved" ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      저장됨
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      개선된 시나리오 저장
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
