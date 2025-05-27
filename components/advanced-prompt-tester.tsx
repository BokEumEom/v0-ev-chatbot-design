"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AdvancedPromptTester() {
  const [userMessage, setUserMessage] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [userPrompt, setUserPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("system")

  const handleGeneratePrompts = async () => {
    if (!userMessage.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/prompt-management/generate-advanced-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          userContext: {
            location: "강남역",
            vehicleModel: "아이오닉 5",
            paymentMethods: ["신용카드", "앱 결제"],
          },
          conversationState: {
            interactionCount: 1,
            currentIssue: null,
            issueStage: "identification",
            resolutionAttempts: 0,
            problemSolved: false,
            userSatisfaction: null,
          },
          conversationHistory: [],
        }),
      })

      const data = await res.json()
      setSystemPrompt(data.systemPrompt)
      setUserPrompt(data.userPrompt)
    } catch (error) {
      console.error("Error generating prompts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestPrompt = async () => {
    if (!systemPrompt || !userPrompt) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/prompt-management/test-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
        }),
      })

      const data = await res.json()
      setResponse(data.response)
      setActiveTab("response")
    } catch (error) {
      console.error("Error testing prompt:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>고급 프롬프트 테스터</CardTitle>
        <CardDescription>대화 지속성을 강화한 고급 프롬프트를 생성하고 테스트합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">사용자 메시지</label>
            <Textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="테스트할 사용자 메시지를 입력하세요..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={handleGeneratePrompts} disabled={isLoading || !userMessage.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                "프롬프트 생성"
              )}
            </Button>
          </div>

          {(systemPrompt || userPrompt || response) && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="system">시스템 프롬프트</TabsTrigger>
                <TabsTrigger value="user">사용자 프롬프트</TabsTrigger>
                <TabsTrigger value="response">응답 결과</TabsTrigger>
              </TabsList>
              <TabsContent value="system">
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <pre className="whitespace-pre-wrap text-sm">{systemPrompt}</pre>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="user">
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <pre className="whitespace-pre-wrap text-sm">{userPrompt}</pre>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="response">
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <div className="whitespace-pre-wrap text-sm">
                    {response || "아직 응답이 생성되지 않았습니다. '프롬프트 테스트' 버튼을 클릭하세요."}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setUserMessage("")
            setSystemPrompt("")
            setUserPrompt("")
            setResponse("")
          }}
        >
          초기화
        </Button>
        <Button onClick={handleTestPrompt} disabled={isLoading || !systemPrompt || !userPrompt}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              테스트 중...
            </>
          ) : (
            "프롬프트 테스트"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
