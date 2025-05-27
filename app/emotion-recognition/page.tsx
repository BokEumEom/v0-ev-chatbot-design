"use client"

import { useState } from "react"
import { EmotionAwareChat } from "@/components/emotion-recognition/emotion-aware-chat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { EmotionState } from "@/types/emotion-recognition"

export default function EmotionRecognitionPage() {
  const [apiResponses, setApiResponses] = useState<
    Array<{
      prompt: string
      response: string
      timestamp: number
    }>
  >([])

  // 감정 인식 챗봇에서 메시지 전송 시 호출되는 함수
  const handleSendMessage = async (message: string, emotionState: EmotionState | null): Promise<string> => {
    try {
      // 감정 기반 프롬프트 생성 API 호출
      const promptResponse = await fetch("/api/emotion-recognition/generate-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emotionState,
          userMessage: message,
          conversationContext: {
            vehicleModel: "아이오닉 5",
            location: "강남역",
            paymentMethods: ["신용카드", "앱 결제"],
          },
        }),
      })

      if (!promptResponse.ok) {
        throw new Error("프롬프트 생성 API 호출 실패")
      }

      const promptData = await promptResponse.json()

      // 실제 구현에서는 이 프롬프트를 사용하여 AI 응답 생성
      // 여기서는 간단한 응답을 생성하여 반환

      // API 응답 기록
      setApiResponses((prev) => [
        {
          prompt: promptData.prompt,
          response: getSimulatedResponse(emotionState),
          timestamp: Date.now(),
        },
        ...prev,
      ])

      return getSimulatedResponse(emotionState)
    } catch (error) {
      console.error("메시지 처리 오류:", error)
      return "죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다."
    }
  }

  // 감정 상태에 따른 시뮬레이션 응답 생성
  const getSimulatedResponse = (emotionState: EmotionState | null): string => {
    if (!emotionState) {
      return "어떻게 도와드릴까요?"
    }

    // 감정별 응답 템플릿
    const responseTemplates: Record<string, string[]> = {
      joy: [
        "좋은 소식이네요! 어떤 부분이 특히 만족스러우셨나요?",
        "정말 기쁘네요! 다른 부분에서도 도움이 필요하신가요?",
        "좋은 경험을 하셨다니 저희도 기쁩니다. 더 도와드릴 일이 있을까요?",
      ],
      sadness: [
        "불편을 겪고 계신 점 정말 죄송합니다. 어떻게 도와드릴 수 있을까요?",
        "그런 경험을 하셨다니 정말 안타깝습니다. 문제를 해결해 드리겠습니다.",
        "많이 실망하셨을 것 같아 죄송합니다. 상황을 개선할 수 있는 방법을 찾아보겠습니다.",
      ],
      anger: [
        "불편을 겪으셔서 정말 죄송합니다. 문제를 즉시 해결해 드리겠습니다.",
        "그런 경험을 하셨다니 정말 죄송합니다. 어떻게 도와드릴 수 있을지 구체적으로 알려주시겠어요?",
        "많이 답답하셨을 것 같습니다. 최대한 빠르게 해결책을 찾아보겠습니다.",
      ],
      fear: [
        "걱정되는 부분을 말씀해 주셔서 감사합니다. 함께 해결책을 찾아보겠습니다.",
        "그런 상황이라면 불안하실 만 합니다. 차분히 단계별로 도와드리겠습니다.",
        "걱정마세요, 비슷한 상황을 많이 해결해 왔습니다. 천천히 진행해 보겠습니다.",
      ],
      surprise: [
        "놀라셨을 것 같습니다. 어떤 부분이 가장 의외였나요?",
        "예상과 다른 상황이셨군요. 자세한 내용을 알려주시면 설명해 드리겠습니다.",
        "그런 상황이 발생했군요. 원인을 파악하고 설명해 드리겠습니다.",
      ],
      disgust: [
        "불쾌한 경험을 하셨다니 정말 죄송합니다. 즉시 조치하겠습니다.",
        "그런 경험을 하셨다니 정말 유감입니다. 어떻게 상황을 개선할 수 있을지 알려주시겠어요?",
        "불편을 드려 죄송합니다. 이런 일이 재발하지 않도록 조치하겠습니다.",
      ],
      trust: [
        "저희를 믿어주셔서 감사합니다. 기대에 부응하도록 최선을 다하겠습니다.",
        "신뢰해 주셔서 감사합니다. 어떤 부분에서 더 도움이 필요하신가요?",
        "말씀해 주셔서 감사합니다. 계속해서 좋은 서비스를 제공하겠습니다.",
      ],
      anticipation: [
        "어떤 부분을 가장 기대하고 계신가요? 자세히 알려드리겠습니다.",
        "기대하고 계신 부분에 대해 더 자세한 정보를 제공해 드리겠습니다.",
        "기대에 부응할 수 있도록 최선을 다하겠습니다. 구체적으로 어떤 정보가 필요하신가요?",
      ],
    }

    // 감정 톤에 따른 기본 응답
    const defaultResponses: Record<string, string[]> = {
      positive: ["어떻게 더 도와드릴까요?", "다른 질문이 있으신가요?", "추가로 필요한 정보가 있으신가요?"],
      neutral: ["어떻게 도와드릴까요?", "더 자세한 정보가 필요하신가요?", "다른 질문이 있으신가요?"],
      negative: [
        "어떤 부분이 가장 불편하셨나요?",
        "어떻게 도와드릴 수 있을까요?",
        "문제를 해결해 드리겠습니다. 자세한 상황을 알려주시겠어요?",
      ],
    }

    // 감정에 따른 응답 선택
    let responses: string[] = []

    if (emotionState.primaryEmotion && responseTemplates[emotionState.primaryEmotion]) {
      responses = responseTemplates[emotionState.primaryEmotion]
    } else {
      responses = defaultResponses[emotionState.sentiment]
    }

    // 랜덤하게 응답 선택
    const randomIndex = Math.floor(Math.random() * responses.length)
    return responses[randomIndex]
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">감정 인식 챗봇 테스트</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <EmotionAwareChat
            onSendMessage={handleSendMessage}
            userContext={{
              vehicleModel: "아이오닉 5",
              location: "강남역",
              paymentMethods: ["신용카드", "앱 결제"],
            }}
          />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>API 응답 로그</CardTitle>
              <CardDescription>감정 인식 API 호출 결과와 생성된 프롬프트를 확인할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="prompts">
                <TabsList className="mb-4">
                  <TabsTrigger value="prompts">프롬프트</TabsTrigger>
                </TabsList>

                <TabsContent value="prompts" className="space-y-4">
                  {apiResponses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      아직 API 응답이 없습니다. 챗봇에 메시지를 보내보세요.
                    </div>
                  ) : (
                    apiResponses.map((item, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-medium">생성된 프롬프트</CardTitle>
                            <span className="text-xs text-gray-500">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="bg-gray-100 p-3 rounded-md text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                            {item.prompt}
                          </div>

                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">AI 응답:</h4>
                            <div className="bg-blue-50 p-3 rounded-md text-sm">{item.response}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
