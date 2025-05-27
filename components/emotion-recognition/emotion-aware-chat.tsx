"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Send, Info } from "lucide-react"
import { EmotionIndicator } from "@/components/emotion-recognition/emotion-indicator"
import { EmotionHistoryChart } from "@/components/emotion-recognition/emotion-history-chart"
import type { EmotionState, EmotionHistory } from "@/types/emotion-recognition"
import type { SentimentType } from "@/types/feedback"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  emotionState?: EmotionState
}

interface EmotionAwareChatProps {
  initialMessages?: Message[]
  userContext?: Record<string, any>
  onSendMessage?: (message: string, emotionState: EmotionState | null) => Promise<string>
  className?: string
}

export function EmotionAwareChat({
  initialMessages = [],
  userContext = {},
  onSendMessage,
  className = "",
}: EmotionAwareChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentEmotionState, setCurrentEmotionState] = useState<EmotionState | null>(null)
  const [emotionHistory, setEmotionHistory] = useState<EmotionHistory>({
    emotions: [],
  })
  const [showEmotionPanel, setShowEmotionPanel] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 메시지가 추가될 때마다 스크롤 아래로 이동
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // 메시지 전송 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")

    // 사용자 메시지 ID 생성
    const userMessageId = `msg_${Date.now()}`

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, { id: userMessageId, role: "user", content: userMessage }])

    // 로딩 상태 설정
    setIsLoading(true)

    try {
      // 감정 분석 API 호출
      const emotionResponse = await fetch("/api/emotion-recognition/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: userMessage,
          conversationHistory: messages.map((msg) => ({ role: msg.role, content: msg.content })),
          previousEmotions: emotionHistory,
        }),
      })

      if (!emotionResponse.ok) {
        throw new Error("감정 분석 API 호출 실패")
      }

      const emotionData = await emotionResponse.json()

      // 감정 상태 업데이트
      const newEmotionState: EmotionState = {
        primaryEmotion: emotionData.emotion.primary,
        secondaryEmotion: emotionData.emotion.secondary,
        intensity: emotionData.emotion.intensity,
        sentiment: emotionData.sentiment,
        confidence: emotionData.confidence,
        context: {
          trigger: emotionData.triggers?.[0],
        },
        timestamp: Date.now(),
      }

      // 이전 감정 상태가 있으면 비교하여 변화 감지
      if (currentEmotionState) {
        newEmotionState.previousEmotion = currentEmotionState.primaryEmotion
        newEmotionState.emotionShift = detectEmotionShift(currentEmotionState.sentiment, newEmotionState.sentiment)
      }

      // 현재 감정 상태 업데이트
      setCurrentEmotionState(newEmotionState)

      // 감정 이력 업데이트
      setEmotionHistory((prev) => ({
        emotions: [
          ...prev.emotions,
          {
            emotion: newEmotionState.primaryEmotion,
            sentiment: newEmotionState.sentiment,
            intensity: newEmotionState.intensity,
            timestamp: newEmotionState.timestamp,
            messageId: userMessageId,
          },
        ],
      }))

      // 사용자 메시지 업데이트 (감정 상태 추가)
      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessageId ? { ...msg, emotionState: newEmotionState } : msg)),
      )

      // 응답 생성 (props로 전달된 함수 사용 또는 기본 응답)
      let response = "죄송합니다. 현재 응답을 생성할 수 없습니다."

      if (onSendMessage) {
        response = await onSendMessage(userMessage, newEmotionState)
      } else {
        // 감정 기반 프롬프트 생성 API 호출
        const promptResponse = await fetch("/api/emotion-recognition/generate-prompt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emotionState: newEmotionState,
            userMessage,
            conversationContext: userContext,
          }),
        })

        if (promptResponse.ok) {
          const promptData = await promptResponse.json()

          // 실제 구현에서는 이 프롬프트를 사용하여 AI 응답 생성
          console.log("감정 기반 프롬프트:", promptData.prompt)

          // 기본 응답 (실제 구현에서는 AI 응답으로 대체)
          response = getDefaultResponse(newEmotionState)
        }
      }

      // 어시스턴트 응답 추가
      setMessages((prev) => [...prev, { id: `msg_${Date.now()}`, role: "assistant", content: response }])
    } catch (error) {
      console.error("메시지 처리 오류:", error)

      // 오류 메시지 추가
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: "system",
          content: "죄송합니다. 메시지 처리 중 오류가 발생했습니다.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // 감정 변화 감지 함수
  const detectEmotionShift = (
    previousSentiment: SentimentType,
    currentSentiment: SentimentType,
  ): "improving" | "worsening" | "stable" => {
    const sentimentScores: Record<SentimentType, number> = {
      positive: 1,
      neutral: 0,
      negative: -1,
    }

    const diff = sentimentScores[currentSentiment] - sentimentScores[previousSentiment]

    if (diff > 0) return "improving"
    if (diff < 0) return "worsening"
    return "stable"
  }

  // 기본 응답 생성 함수 (실제 구현에서는 AI 응답으로 대체)
  const getDefaultResponse = (emotionState: EmotionState): string => {
    if (!emotionState.primaryEmotion) {
      return "어떻게 도와드릴까요?"
    }

    switch (emotionState.primaryEmotion) {
      case "joy":
        return "좋은 소식이네요! 어떤 부분이 특히 만족스러우셨나요?"
      case "sadness":
        return "불편을 겪고 계신 점 정말 죄송합니다. 어떻게 도와드릴 수 있을까요?"
      case "anger":
        return "불편을 겪으셔서 정말 죄송합니다. 문제를 즉시 해결해 드리겠습니다. 어떤 부분이 가장 불만족스러우신가요?"
      case "fear":
        return "걱정되는 부분을 말씀해 주셔서 감사합니다. 함께 해결책을 찾아보겠습니다."
      case "surprise":
        return "예상치 못한 상황이셨군요. 어떤 부분이 가장 의외였나요?"
      case "disgust":
        return "불쾌한 경험을 하셨다니 정말 죄송합니다. 즉시 조치하겠습니다."
      case "trust":
        return "저희를 믿어주셔서 감사합니다. 어떤 부분에서 더 도움이 필요하신가요?"
      case "anticipation":
        return "어떤 부분을 가장 기대하고 계신가요? 자세히 알려드리겠습니다."
      default:
        return "어떻게 도와드릴까요?"
    }
  }

  return (
    <div className={`flex flex-col h-[600px] border rounded-lg overflow-hidden ${className}`}>
      <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
        <h2 className="text-lg font-semibold">감정 인식 챗봇</h2>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground"
          onClick={() => setShowEmotionPanel(!showEmotionPanel)}
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 flex flex-col ${showEmotionPanel ? "w-2/3" : "w-full"}`}>
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-2 grid w-auto grid-cols-1">
              <TabsTrigger value="chat">대화</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <h3 className="text-xl font-semibold mb-2">감정 인식 챗봇에 오신 것을 환영합니다</h3>
                    <p className="text-gray-500 mb-6">
                      이 챗봇은 사용자의 감정을 인식하고 그에 맞게 응답합니다. 무엇을 도와드릴까요?
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : message.role === "system"
                              ? "justify-center"
                              : "justify-start"
                        }`}
                      >
                        {message.role === "system" ? (
                          <Card className="p-3 bg-blue-50 border-blue-200 max-w-[80%]">
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-blue-500 shrink-0" />
                              <div className="text-sm text-blue-700">{message.content}</div>
                            </div>
                          </Card>
                        ) : (
                          <div className="flex flex-col items-start max-w-[80%]">
                            <div className="flex items-start">
                              {message.role !== "user" && (
                                <Avatar className="mr-2 h-8 w-8">
                                  <div className="bg-primary h-full w-full flex items-center justify-center text-primary-foreground font-semibold">
                                    AI
                                  </div>
                                </Avatar>
                              )}
                              <Card
                                className={`p-3 ${
                                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}
                              >
                                <div className="whitespace-pre-wrap">{message.content}</div>
                              </Card>
                              {message.role === "user" && (
                                <Avatar className="ml-2 h-8 w-8">
                                  <div className="bg-gray-800 h-full w-full flex items-center justify-center text-white font-semibold">
                                    U
                                  </div>
                                </Avatar>
                              )}
                            </div>

                            {/* 사용자 메시지에 감정 표시 */}
                            {message.role === "user" && message.emotionState && (
                              <div className="ml-auto mt-1">
                                <EmotionIndicator emotionState={message.emotionState} size="sm" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="icon" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {showEmotionPanel && (
          <div className="w-1/3 border-l p-4 bg-gray-50">
            <div className="space-y-4">
              <h3 className="font-medium">감정 분석</h3>

              {currentEmotionState ? (
                <>
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">현재 감정 상태</span>
                      <EmotionIndicator emotionState={currentEmotionState} />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">주요 감정:</span>
                        <span>{currentEmotionState.primaryEmotion || "중립"}</span>
                      </div>

                      {currentEmotionState.secondaryEmotion && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">부차 감정:</span>
                          <span>{currentEmotionState.secondaryEmotion}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-gray-500">감정 강도:</span>
                        <span>{currentEmotionState.intensity}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">감정 톤:</span>
                        <span>
                          {currentEmotionState.sentiment === "positive"
                            ? "긍정적"
                            : currentEmotionState.sentiment === "negative"
                              ? "부정적"
                              : "중립적"}
                        </span>
                      </div>

                      {currentEmotionState.emotionShift && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">감정 변화:</span>
                          <span>
                            {currentEmotionState.emotionShift === "improving"
                              ? "개선 중"
                              : currentEmotionState.emotionShift === "worsening"
                                ? "악화 중"
                                : "안정적"}
                          </span>
                        </div>
                      )}

                      {currentEmotionState.context?.trigger && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">감정 유발 요인:</span>
                          <span className="text-right max-w-[70%]">{currentEmotionState.context.trigger}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {emotionHistory.emotions.length > 1 && <EmotionHistoryChart history={emotionHistory} />}
                </>
              ) : (
                <div className="p-4 bg-white rounded-lg border text-center text-gray-500">
                  감정 분석 데이터가 없습니다.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
