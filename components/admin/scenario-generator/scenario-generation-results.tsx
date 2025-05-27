"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ChatScenario } from "@/data/chatbot-scenarios"
import type { ScenarioGenerationResult } from "@/types/scenario-generator"
import { MessageSquare, User, CheckCircle, AlertCircle, Copy, Save, Edit } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ScenarioGenerationResultsProps {
  result: ScenarioGenerationResult | null
  onEdit: (scenario: ChatScenario) => void
  onSave: (scenario: ChatScenario) => Promise<void>
}

export function ScenarioGenerationResults({ result, onEdit, onSave }: ScenarioGenerationResultsProps) {
  const [isSaving, setIsSaving] = useState(false)

  if (!result) {
    return null
  }

  if (result.status === "error") {
    return (
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            시나리오 생성 오류
          </CardTitle>
          <CardDescription className="text-red-600">
            {result.timestamp && new Date(result.timestamp).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>오류 발생</AlertTitle>
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!result.scenario) {
    return null
  }

  const handleSave = async () => {
    if (!result.scenario) return

    setIsSaving(true)
    try {
      await onSave(result.scenario)
    } catch (error) {
      console.error("시나리오 저장 오류:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = () => {
    if (!result.scenario) return

    navigator.clipboard
      .writeText(JSON.stringify(result.scenario, null, 2))
      .then(() => {
        alert("시나리오가 클립보드에 복사되었습니다.")
      })
      .catch((err) => {
        console.error("클립보드 복사 오류:", err)
        alert("클립보드 복사에 실패했습니다.")
      })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>생성된 시나리오</CardTitle>
            <CardDescription>{result.timestamp && new Date(result.timestamp).toLocaleString()}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-1" />
              복사
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(result.scenario!)}>
              <Edit className="h-4 w-4 mr-1" />
              편집
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">미리보기</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge>{result.scenario.category}</Badge>
                <Badge variant="outline">{result.scenario.id}</Badge>
              </div>
              <h3 className="text-lg font-semibold">{result.scenario.title}</h3>
              <p className="text-muted-foreground">{result.scenario.description}</p>
            </div>

            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="space-y-6">
                {result.scenario.conversations.map((conversation, index) => (
                  <div key={index} className="space-y-2">
                    {/* 사용자 메시지 */}
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full p-2 mt-0.5">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted p-3 rounded-lg">
                          <p>{conversation.user}</p>
                        </div>
                        {conversation.intent && (
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              인텐트: {conversation.intent}
                            </Badge>
                            {conversation.entities &&
                              Object.entries(conversation.entities).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 챗봇 응답 */}
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 text-white rounded-full p-2 mt-0.5">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="whitespace-pre-line">{conversation.bot}</p>
                        </div>
                        {conversation.notes && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            <span className="font-medium">처리 특징:</span> {conversation.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* 핵심 기능 */}
                {result.scenario.keyFeatures && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2">핵심 기능</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {result.scenario.keyFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="json">
            <ScrollArea className="h-[500px] rounded-md border">
              <pre className="p-4 text-xs">{JSON.stringify(result.scenario, null, 2)}</pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
