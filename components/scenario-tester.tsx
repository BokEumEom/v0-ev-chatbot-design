"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { chatbotScenarios } from "@/data/chatbot-scenarios"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, MessageSquare, User, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ScenarioTester() {
  const [selectedScenario, setSelectedScenario] = useState(chatbotScenarios[0].id)
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(0)
  const [customMessage, setCustomMessage] = useState("")
  const [useCustomMessage, setUseCustomMessage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const scenario = chatbotScenarios.find((s) => s.id === selectedScenario)

  const handleTest = async () => {
    if (!scenario) return

    setLoading(true)
    try {
      const response = await fetch("/api/chat/scenario-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenarioId: selectedScenario,
          messageIndex: selectedMessageIndex,
          customMessage: useCustomMessage ? customMessage : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("API 요청 실패")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("테스트 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>시나리오 테스터</CardTitle>
          <CardDescription>챗봇 시나리오를 테스트하고 응답 품질을 평가합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">시나리오 선택</label>
                <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                  <SelectTrigger>
                    <SelectValue placeholder="시나리오 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {chatbotScenarios.map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">메시지 선택</label>
                <Select
                  value={selectedMessageIndex.toString()}
                  onValueChange={(value) => setSelectedMessageIndex(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="메시지 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenario?.conversations.map((conversation, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        메시지 {index + 1}: {conversation.user.substring(0, 30)}
                        {conversation.user.length > 30 ? "..." : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">테스트 메시지</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useCustomMessage"
                    checked={useCustomMessage}
                    onChange={(e) => setUseCustomMessage(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="useCustomMessage" className="text-xs">
                    사용자 정의 메시지 사용
                  </label>
                </div>
              </div>

              {useCustomMessage ? (
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="테스트할 사용자 메시지를 입력하세요..."
                  className="min-h-[100px]"
                />
              ) : (
                <div className="bg-muted p-3 rounded-lg">
                  <p>{scenario?.conversations[selectedMessageIndex]?.user || ""}</p>
                </div>
              )}
            </div>

            <Button onClick={handleTest} disabled={loading} className="w-full">
              {loading ? "테스트 중..." : "시나리오 테스트 실행"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>테스트 결과</CardTitle>
            <CardDescription>생성된 응답과 예상 응답의 비교 결과입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="comparison">
              <TabsList className="mb-4">
                <TabsTrigger value="comparison">응답 비교</TabsTrigger>
                <TabsTrigger value="metrics">품질 지표</TabsTrigger>
                <TabsTrigger value="intent">인텐트 분석</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="space-y-4">
                <div className="space-y-4">
                  {/* 사용자 메시지 */}
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full p-2 mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted p-3 rounded-lg">
                        <p>{result.userMessage}</p>
                      </div>
                    </div>
                  </div>

                  {/* 생성된 응답 */}
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 text-white rounded-full p-2 mt-0.5">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="text-xs font-medium mb-1">생성된 응답:</h4>
                        <p className="whitespace-pre-line">{result.generatedResponse}</p>
                      </div>
                    </div>
                  </div>

                  {/* 예상 응답 */}
                  <div className="flex items-start gap-3">
                    <div className="bg-green-500 text-white rounded-full p-2 mt-0.5">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="text-xs font-medium mb-1">예상 응답:</h4>
                        <p className="whitespace-pre-line">{result.expectedResponse}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">일관성 점수</span>
                      <span className="text-sm font-bold">{(result.consistencyScore * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={result.consistencyScore * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">인텐트 일치</span>
                      <span className="text-sm font-bold">{result.intentMatch ? "일치" : "불일치"}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${result.intentMatch ? "bg-green-500" : "bg-red-500"}`}
                        style={{ width: result.intentMatch ? "100%" : "0%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                {result.consistencyIssues && result.consistencyIssues.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">감지된 일관성 문제:</h4>
                    <ul className="list-disc list-inside text-sm text-yellow-700">
                      {result.consistencyIssues.map((issue: string, index: number) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="intent" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium mb-2">감지된 인텐트</h4>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge>{result.intent}</Badge>
                      <span className="text-xs text-gray-500">
                        신뢰도: {(result.metadata.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    {result.intentMatch ? (
                      <div className="flex items-center gap-1 text-green-600 text-xs mt-2">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>예상 인텐트와 일치</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600 text-xs mt-2">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>예상 인텐트({result.expectedIntent})와 불일치</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium mb-2">대안 인텐트</h4>
                    <div className="space-y-1">
                      {result.metadata.alternativeIntents?.map((alt: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <Badge variant="outline">{alt.intent}</Badge>
                          <span className="text-xs text-gray-500">{(alt.confidence * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {result.metadata.entities && Object.keys(result.metadata.entities).length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium mb-2">감지된 엔티티</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(result.metadata.entities).map(([key, value]: [string, any]) => (
                        <Badge key={key} variant="secondary">
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
