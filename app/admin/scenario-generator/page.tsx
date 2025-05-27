"use client"

import { useState } from "react"
import type { ScenarioGeneratorSettings, ScenarioGenerationResult } from "@/types/scenario-generator"
import { ScenarioGeneratorSettings as ScenarioGeneratorSettingsComponent } from "@/components/admin/scenario-generator/scenario-generator-settings"
import { ScenarioGenerationResults } from "@/components/admin/scenario-generator/scenario-generation-results"
import { ScenarioEditor } from "@/components/admin/scenario-generator/scenario-editor"
import { type ChatScenario, chatbotScenarios } from "@/data/chatbot-scenarios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function ScenarioGeneratorPage() {
  const [generationResult, setGenerationResult] = useState<ScenarioGenerationResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingScenario, setEditingScenario] = useState<ChatScenario | null>(null)
  const [generationHistory, setGenerationHistory] = useState<ScenarioGenerationResult[]>([])

  const handleGenerate = async (settings: ScenarioGeneratorSettings) => {
    setIsGenerating(true)
    try {
      // 기존 시나리오 ID 목록 (중복 방지용)
      const existingScenarios = chatbotScenarios.map((scenario) => scenario.id)

      const response = await fetch("/api/scenario-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings,
          existingScenarios,
        }),
      })

      const result = await response.json()
      setGenerationResult(result)

      // 히스토리에 추가
      if (result.status !== "error") {
        setGenerationHistory((prev) => [result, ...prev])
      }
    } catch (error) {
      console.error("시나리오 생성 오류:", error)
      setGenerationResult({
        id: `error_${Date.now()}`,
        status: "error",
        error: error instanceof Error ? error.message : "시나리오 생성 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveScenario = async (scenario: ChatScenario) => {
    // 실제 구현에서는 API를 통해 저장
    alert(`시나리오 "${scenario.title}"가 저장되었습니다.`)

    // 편집 모드였다면 종료
    if (editingScenario) {
      setEditingScenario(null)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-2">AI 시나리오 생성기</h1>
      <p className="text-muted-foreground mb-6">AI를 활용하여 EV 충전 챗봇의 대화 시나리오를 자동으로 생성합니다.</p>

      {editingScenario ? (
        <ScenarioEditor
          scenario={editingScenario}
          onSave={handleSaveScenario}
          onCancel={() => setEditingScenario(null)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ScenarioGeneratorSettingsComponent onGenerate={handleGenerate} isGenerating={isGenerating} />

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>시나리오 생성 가이드</CardTitle>
                <CardDescription>효과적인 시나리오 생성을 위한 팁</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>구체적인 주제 설정</AlertTitle>
                  <AlertDescription>
                    "급속 충전소 찾기"와 같이 구체적인 주제를 설정하면 더 관련성 높은 시나리오가 생성됩니다.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>사용자 유형 고려</AlertTitle>
                  <AlertDescription>
                    초보자와 전문가는 다른 질문과 용어를 사용합니다. 대상 사용자에 맞는 유형을 선택하세요.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>특별 요구사항 활용</AlertTitle>
                  <AlertDescription>
                    "사용자가 화가 난 상태" 또는 "특정 차량 모델에 대한 질문"과 같은 특별 요구사항을 추가하여 시나리오를
                    더 구체화할 수 있습니다.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <div>
            <Tabs defaultValue="current">
              <TabsList className="mb-4">
                <TabsTrigger value="current">현재 결과</TabsTrigger>
                <TabsTrigger value="history">생성 기록</TabsTrigger>
              </TabsList>

              <TabsContent value="current">
                {generationResult ? (
                  <ScenarioGenerationResults
                    result={generationResult}
                    onEdit={setEditingScenario}
                    onSave={handleSaveScenario}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>시나리오 생성 결과</CardTitle>
                      <CardDescription>왼쪽의 설정을 구성하고 "시나리오 생성" 버튼을 클릭하세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center h-[200px] text-muted-foreground">
                      아직 생성된 시나리오가 없습니다.
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history">
                {generationHistory.length > 0 ? (
                  <div className="space-y-4">
                    {generationHistory.map((result) => (
                      <Card key={result.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{result.scenario?.title || "생성 오류"}</CardTitle>
                          <CardDescription>{new Date(result.timestamp).toLocaleString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {result.scenario?.description || result.error || "설명 없음"}
                          </p>
                          {result.scenario && (
                            <div className="flex gap-2 mt-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                {result.scenario.category}
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                                대화 {result.scenario.conversations.length}회
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex justify-center items-center h-[200px] text-muted-foreground">
                      생성 기록이 없습니다.
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}
