"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Loader2, Send, MapPin, CreditCard, HelpCircle, AlertTriangle, ClipboardList, Zap } from "lucide-react"
import { FeedbackCollector } from "@/components/feedback-collector"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function CustomerSupportChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [quickPrompts, setQuickPrompts] = useState([
    { icon: <AlertTriangle className="h-4 w-4" />, text: "2번 충전기가 작동 안 해요" },
    { icon: <HelpCircle className="h-4 w-4" />, text: "처음인데 어떻게 충전하나요?" },
    { icon: <MapPin className="h-4 w-4" />, text: "지금 기다리지 않고 충전할 수 있는 곳?" },
    { icon: <CreditCard className="h-4 w-4" />, text: "결제는 언제 되나요?" },
    { icon: <ClipboardList className="h-4 w-4" />, text: "지난달 충전 내역 보여줘" },
  ])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")

    // 사용자 메시지 ID 생성
    const userMessageId = `msg_${Date.now()}`

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, { id: userMessageId, role: "user", content: userMessage }])

    // 로딩 상태 설정
    setIsLoading(true)

    try {
      // API 호출 시작 시간 기록
      const startTime = Date.now()

      // API 호출
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("API 요청에 실패했습니다.")
      }

      const data = await response.json()

      // API 호출 종료 시간 기록
      const endTime = Date.now()
      const latency = endTime - startTime

      // 응답 메시지 ID 생성
      const responseMessageId = `msg_${Date.now()}`

      // 응답 메시지 추가
      setMessages((prev) => [...prev, { id: responseMessageId, role: "assistant", content: data.response }])

      // 응답 분석 데이터 저장
      await fetch("/api/analytics/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: responseMessageId,
          promptVariantId: data.metadata?.promptVariantId || "default",
          userMessage: userMessage,
          detectedIntent: data.metadata?.intent || "unknown",
          botResponse: data.response,
          performance: {
            promptTokens: data.metadata?.promptTokens || 0,
            completionTokens: data.metadata?.completionTokens || 0,
            totalTokens: data.metadata?.totalTokens || 0,
            latency,
            processingTime: data.metadata?.processingTime || 0,
            timestamp: new Date().toISOString(),
          },
        }),
      })
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "죄송합니다. 요청을 처리하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>

    setTimeout(() => handleSubmit(fakeEvent), 100)
  }

  const handleFeedbackSubmit = async (messageId: string, feedback: { rating: number; comment?: string }) => {
    try {
      await fetch("/api/analytics/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          ...feedback,
        }),
      })
    } catch (error) {
      console.error("피드백 제출 오류:", error)
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="mb-4">
              <div className="w-24 h-24 mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">전기차 충전 도우미에 오신 것을 환영합니다</h3>
            <p className="text-gray-500 mb-6">충전과 관련된 어떤 도움이 필요하신가요?</p>

            <div className="grid grid-cols-1 gap-2 w-full max-w-md">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left"
                  onClick={() => handleQuickPrompt(prompt.text)}
                >
                  <span className="mr-2">{prompt.icon}</span>
                  <span className="truncate">{prompt.text}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex flex-col items-start max-w-[80%]">
                  <div className="flex items-start">
                    {message.role !== "user" && (
                      <Avatar className="mr-2 h-8 w-8">
                        <div className="bg-green-600 h-full w-full flex items-center justify-center text-white font-semibold">
                          EV
                        </div>
                      </Avatar>
                    )}
                    <Card
                      className={`p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
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

                  {/* 피드백 수집 컴포넌트 (어시스턴트 메시지에만 표시) */}
                  {message.role === "assistant" && (
                    <div className="ml-10">
                      <FeedbackCollector
                        messageId={message.id}
                        onFeedbackSubmit={(feedback) => handleFeedbackSubmit(message.id, feedback)}
                      />
                    </div>
                  )}
                </div>
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
            placeholder="충전 관련 질문을 입력하세요..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
