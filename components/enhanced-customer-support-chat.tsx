"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Send,
  MapPin,
  CreditCard,
  HelpCircle,
  AlertTriangle,
  ClipboardList,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Info,
  X,
  MessageSquare,
  PhoneCall,
} from "lucide-react"
import { FeedbackCollector } from "@/components/feedback-collector"
import { TroubleshootingGuide } from "@/components/troubleshooting-guide"
import { WizardIntegration } from "@/components/wizard-integration"
import { FollowUpSuggestions } from "@/components/follow-up-suggestions"
import { ResolutionConfirmation } from "@/components/resolution-confirmation"
import { conversationContinuityService } from "@/services/conversation-continuity-service"
import type { WizardNode } from "@/data/troubleshooting-tree"
import type { ConversationState, FollowUpQuestion } from "@/services/conversation-continuity-service"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  metadata?: {
    intent?: string
    confidence?: number
    entities?: Record<string, any>
    followUpQuestions?: FollowUpQuestion[]
    qualityScore?: number
    requiresConfirmation?: boolean
    isFollowUp?: boolean
  }
  feedback?: {
    helpful: boolean
    comment?: string
  }
}

type ConversationContext = {
  location?: string
  vehicleModel?: string
  paymentMethods?: string[]
  recentChargers?: string[]
  membershipLevel?: string
  joinDate?: string
}

export function EnhancedCustomerSupportChat() {
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showContextPanel, setShowContextPanel] = useState(false)
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    location: "강남역",
    vehicleModel: "아이오닉 5",
    paymentMethods: ["신용카드", "앱 결제"],
    recentChargers: ["강남 충전소", "역삼 충전소"],
    membershipLevel: "골드",
    joinDate: "2023-01-15",
  })
  const [conversationState, setConversationState] = useState<ConversationState>(
    conversationContinuityService.initConversationState(),
  )
  const [showResolutionConfirmation, setShowResolutionConfirmation] = useState(false)
  const [lastAssistantMessageId, setLastAssistantMessageId] = useState<string | null>(null)
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null)
  const [showInactivityPrompt, setShowInactivityPrompt] = useState(false)

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

  useEffect(() => {
    // 대화 비활성 타이머 설정
    if (messages.length > 0 && !isLoading) {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }

      // 3분 후 비활성 프롬프트 표시
      const timer = setTimeout(
        () => {
          if (!conversationState.problemSolved && conversationState.issueStage !== "completed") {
            setShowInactivityPrompt(true)
          }
        },
        3 * 60 * 1000,
      ) // 3분

      setInactivityTimer(timer)
    }

    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }
    }
  }, [messages, isLoading, conversationState])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")

    // 비활성 프롬프트 숨기기
    setShowInactivityPrompt(false)

    // 사용자 메시지 ID 생성
    const userMessageId = `msg_${Date.now()}`

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, { id: userMessageId, role: "user", content: userMessage }])

    // 로딩 상태 설정
    setIsLoading(true)

    try {
      // 대화 이력 준비
      const conversationHistory = messages
        .filter((msg) => msg.role !== "system")
        .map(({ role, content }) => ({ role, content }))

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
          conversationHistory,
          userContext: conversationContext,
          conversationState,
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

      // 문제 해결 단계 업데이트
      let updatedState = { ...conversationState }

      // 인텐트에 따라 현재 이슈 설정
      if (data.metadata?.intent && !conversationState.currentIssue) {
        updatedState.currentIssue = data.metadata.intent
      }

      // 문제 해결 단계 진행
      if (conversationState.issueStage === "identification" && data.metadata?.intent) {
        updatedState = conversationContinuityService.updateIssueStage(updatedState, "troubleshooting")
      } else if (conversationState.issueStage === "troubleshooting") {
        // 사용자 응답에서 문제 해결 여부 확인
        const resolutionStatus = conversationContinuityService.checkResolutionStatus(conversationState, userMessage)

        if (resolutionStatus.confidence > 0.6) {
          if (resolutionStatus.resolved) {
            updatedState = {
              ...updatedState,
              problemSolved: true,
              issueStage: "confirmation",
            }
            setShowResolutionConfirmation(true)
          } else {
            updatedState.resolutionAttempts += 1
          }
        }
      }

      // 대화 상태 업데이트
      setConversationState(updatedState)

      // 후속 질문 생성
      const followUpQuestions = conversationContinuityService.generateFollowUpQuestions(
        updatedState,
        data.metadata?.intent || "general_inquiry",
        data.metadata?.entities || {},
      )

      // 응답 메시지 추가
      setMessages((prev) => [
        ...prev,
        {
          id: responseMessageId,
          role: "assistant",
          content: data.response,
          metadata: {
            ...data.metadata,
            followUpQuestions,
            requiresConfirmation:
              updatedState.issueStage === "troubleshooting" || updatedState.issueStage === "confirmation",
          },
        },
      ])

      // 마지막 어시스턴트 메시지 ID 저장
      setLastAssistantMessageId(responseMessageId)

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
          conversationState: updatedState,
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

      // 문제 해결 확인이 필요하고 아직 표시되지 않은 경우
      if (
        updatedState.issueStage === "troubleshooting" &&
        updatedState.interactionCount >= 3 &&
        !showResolutionConfirmation
      ) {
        setShowResolutionConfirmation(true)
      }

      // 고객센터 연결이 필요한 경우
      if (conversationContinuityService.shouldTransferToAgent(updatedState)) {
        // 시스템 메시지 추가
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `system_${Date.now()}`,
              role: "system",
              content: "문제 해결이 어려운 것 같습니다. 고객센터로 연결해 드릴까요?",
              metadata: {
                isFollowUp: true,
              },
            },
          ])

          // 고객센터 연결 버튼 추가
          setShowResolutionConfirmation(false)
        }, 1000)
      }
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

  const handleFollowUpQuestion = (question: FollowUpQuestion) => {
    // 대화 컨텍스트 업데이트
    setConversationState((prevState) => conversationContinuityService.updateContextualInfo(prevState, question.context))

    setInput(question.text)
    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>

    setTimeout(() => handleSubmit(fakeEvent), 100)
  }

  const handleResolutionConfirmation = (resolved: boolean) => {
    setShowResolutionConfirmation(false)

    // 대화 상태 업데이트
    setConversationState((prevState) => ({
      ...prevState,
      problemSolved: resolved,
      issueStage: resolved ? "completed" : "troubleshooting",
      resolutionAttempts: resolved ? prevState.resolutionAttempts : prevState.resolutionAttempts + 1,
    }))

    // 확인 메시지 추가
    const confirmationMessage = resolved
      ? "문제가 해결되어 기쁩니다! 추가로 도움이 필요하신 것이 있으신가요?"
      : "문제 해결에 어려움이 있으신군요. 다른 방법을 시도해 보겠습니다."

    setMessages((prev) => [
      ...prev,
      {
        id: `system_${Date.now()}`,
        role: "system",
        content: confirmationMessage,
        metadata: {
          isFollowUp: true,
        },
      },
    ])

    // 문제가 해결되지 않았다면 추가 질문 유도
    if (!resolved) {
      setTimeout(() => {
        setInput("문제가 아직 해결되지 않았어요")
        const fakeEvent = {
          preventDefault: () => {},
        } as React.FormEvent<HTMLFormElement>
        handleSubmit(fakeEvent)
      }, 1000)
    }
  }

  const handleAdditionalHelp = () => {
    setShowResolutionConfirmation(false)

    // 시스템 메시지 추가
    setMessages((prev) => [
      ...prev,
      {
        id: `system_${Date.now()}`,
        role: "system",
        content: "어떤 추가 도움이 필요하신가요? 자세히 알려주시면 도와드리겠습니다.",
        metadata: {
          isFollowUp: true,
        },
      },
    ])
  }

  const handleFeedbackSubmit = async (messageId: string, feedback: { rating: number; comment?: string }) => {
    try {
      // 사용자 만족도 업데이트
      setConversationState((prevState) =>
        conversationContinuityService.updateUserSatisfaction(prevState, feedback.rating),
      )

      await fetch("/api/analytics/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          ...feedback,
          conversationState,
        }),
      })
    } catch (error) {
      console.error("피드백 제출 오류:", error)
    }
  }

  const handleQuickFeedback = (messageId: string, helpful: boolean) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            feedback: {
              ...msg.feedback,
              helpful,
            },
          }
        }
        return msg
      }),
    )

    // 사용자 만족도 업데이트
    setConversationState((prevState) =>
      conversationContinuityService.updateUserSatisfaction(prevState, helpful ? 4 : 2),
    )

    // 실제 구현에서는 API 호출로 피드백 저장
  }

  const updateContext = (key: keyof ConversationContext, value: any) => {
    setConversationContext((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleWizardSolution = (solution: WizardNode) => {
    if (solution.type === "solution" && solution.solution) {
      // 마법사의 해결책을 챗봇 메시지로 추가
      const solutionContent = `
문제 진단 결과: ${solution.title}

해결 방법:
${solution.solution.steps.join("\n")}

${solution.solution.additionalInfo || ""}

이 해결 방법이 도움이 되었나요?
      `.trim()

      setMessages((prev) => [
        ...prev,
        {
          id: `wizard_solution_${Date.now()}`,
          role: "assistant",
          content: solutionContent,
          metadata: {
            intent: "troubleshooting_wizard",
            requiresConfirmation: true,
          },
        },
      ])

      // 대화 상태 업데이트
      setConversationState((prevState) => conversationContinuityService.updateIssueStage(prevState, "troubleshooting"))

      // 해결 확인 표시
      setShowResolutionConfirmation(true)
    }
  }

  const handleInactivityResponse = () => {
    setShowInactivityPrompt(false)

    // 시스템 메시지 추가
    setMessages((prev) => [
      ...prev,
      {
        id: `system_${Date.now()}`,
        role: "system",
        content: "아직 도움이 필요하신가요? 추가 질문이 있으시면 언제든지 물어보세요.",
        metadata: {
          isFollowUp: true,
        },
      },
    ])
  }

  const handleConnectToAgent = () => {
    // 고객센터 연결 메시지 추가
    setMessages((prev) => [
      ...prev,
      {
        id: `system_${Date.now()}`,
        role: "system",
        content: "고객센터로 연결해 드리겠습니다. 잠시만 기다려 주세요. 고객센터 전화번호: 1588-0000",
        metadata: {
          isFollowUp: true,
        },
      },
    ])

    // 대화 상태 업데이트
    setConversationState((prevState) => ({
      ...prevState,
      issueStage: "completed",
    }))
  }

  return (
    <div className="flex flex-col h-[700px] border rounded-lg overflow-hidden">
      <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5" />
          전기차 충전 도우미
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground"
          onClick={() => setShowContextPanel(!showContextPanel)}
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 flex flex-col ${showContextPanel ? "w-3/4" : "w-full"}`}>
          <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-2 grid w-auto grid-cols-2">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                채팅 상담
              </TabsTrigger>
              <TabsTrigger value="guide" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                문제 해결 가이드
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
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

                    <div className="mt-6 w-full max-w-md">
                      <WizardIntegration onSolutionFound={handleWizardSolution} />
                    </div>
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

                            {message.content.includes("고객센터") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full justify-center gap-2 bg-blue-100 hover:bg-blue-200 border-blue-300"
                                onClick={handleConnectToAgent}
                              >
                                <PhoneCall className="h-3 w-3" />
                                <span>고객센터 연결</span>
                              </Button>
                            )}
                          </Card>
                        ) : (
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
                                className={`p-3 ${
                                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}
                              >
                                <div className="whitespace-pre-wrap">{message.content}</div>

                                {/* 후속 질문 표시 (어시스턴트 메시지에만) */}
                                {message.role === "assistant" && message.metadata?.followUpQuestions && (
                                  <FollowUpSuggestions
                                    questions={message.metadata.followUpQuestions}
                                    onQuestionSelected={handleFollowUpQuestion}
                                    className="mt-3 pt-3 border-t border-gray-200"
                                  />
                                )}

                                {/* 문제 진단 마법사 제안 (특정 인텐트에 대해서만) */}
                                {message.role === "assistant" &&
                                  message.metadata?.intent &&
                                  ["troubleshooting", "error", "issue", "problem", "charger_issue"].some((keyword) =>
                                    message.metadata?.intent?.toLowerCase().includes(keyword),
                                  ) && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <p className="text-xs text-gray-500 mb-2">문제를 정확히 진단하시겠어요?</p>
                                      <WizardIntegration onSolutionFound={handleWizardSolution} />
                                    </div>
                                  )}
                              </Card>
                              {message.role === "user" && (
                                <Avatar className="ml-2 h-8 w-8">
                                  <div className="bg-gray-800 h-full w-full flex items-center justify-center text-white font-semibold">
                                    U
                                  </div>
                                </Avatar>
                              )}
                            </div>

                            {/* 빠른 피드백 버튼 (어시스턴트 메시지에만 표시) */}
                            {message.role === "assistant" && (
                              <div className="ml-10 mt-1 flex items-center gap-2">
                                {message.feedback ? (
                                  <span className="text-xs text-gray-500">
                                    피드백 감사합니다{message.feedback.helpful ? " 👍" : " 👎"}
                                  </span>
                                ) : (
                                  <>
                                    <span className="text-xs text-gray-500 mr-1">도움이 되었나요?</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleQuickFeedback(message.id, true)}
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleQuickFeedback(message.id, false)}
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}

                            {/* 상세 피드백 수집 컴포넌트 (어시스턴트 메시지에만 표시) */}
                            {message.role === "assistant" && (
                              <div className="ml-10">
                                <FeedbackCollector
                                  messageId={message.id}
                                  onFeedbackSubmit={(feedback) => handleFeedbackSubmit(message.id, feedback)}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* 문제 해결 확인 컴포넌트 */}
                    {showResolutionConfirmation && (
                      <div className="flex justify-center">
                        <ResolutionConfirmation
                          onConfirm={handleResolutionConfirmation}
                          onAdditionalHelp={handleAdditionalHelp}
                          className="max-w-[80%]"
                        />
                      </div>
                    )}

                    {/* 비활성 프롬프트 */}
                    {showInactivityPrompt && (
                      <div className="flex justify-center">
                        <Card className="p-3 bg-blue-50 border-blue-200 max-w-[80%]">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-blue-500 shrink-0" />
                            <div className="text-sm text-blue-700">
                              아직 대화 중이신가요? 추가 도움이 필요하시면 알려주세요.
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 justify-center bg-blue-100 hover:bg-blue-200 border-blue-300"
                              onClick={handleInactivityResponse}
                            >
                              <span>네, 계속할게요</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 justify-center"
                              onClick={() => setShowInactivityPrompt(false)}
                            >
                              <span>아니요, 끝났어요</span>
                            </Button>
                          </div>
                        </Card>
                      </div>
                    )}

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
            </TabsContent>

            <TabsContent value="guide" className="flex-1 p-4 m-0 overflow-auto">
              <TroubleshootingGuide />
            </TabsContent>
          </Tabs>
        </div>

        {showContextPanel && (
          <div className="w-1/4 border-l p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">사용자 정보</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowContextPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">차량 모델</label>
                <Input
                  value={conversationContext.vehicleModel || ""}
                  onChange={(e) => updateContext("vehicleModel", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">현재 위치</label>
                <Input
                  value={conversationContext.location || ""}
                  onChange={(e) => updateContext("location", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">회원 등급</label>
                <select
                  value={conversationContext.membershipLevel || "일반"}
                  onChange={(e) => updateContext("membershipLevel", e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="일반">일반</option>
                  <option value="실버">실버</option>
                  <option value="골드">골드</option>
                  <option value="플래티넘">플래티넘</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">최근 이용 충전소</label>
                <div className="mt-1 p-2 border rounded-md bg-white">
                  {conversationContext.recentChargers?.map((charger, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span>{charger}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          const newChargers = [...(conversationContext.recentChargers || [])]
                          newChargers.splice(index, 1)
                          updateContext("recentChargers", newChargers)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex mt-2">
                    <Input
                      placeholder="충전소 추가..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value) {
                          updateContext("recentChargers", [
                            ...(conversationContext.recentChargers || []),
                            e.currentTarget.value,
                          ])
                          e.currentTarget.value = ""
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">대화 통계</h4>
                <div className="text-sm space-y-1">
                  <p>총 메시지: {messages.length}개</p>
                  <p>현재 문제: {conversationState.currentIssue || "없음"}</p>
                  <p>문제 해결 단계: {conversationState.issueStage}</p>
                  <p>해결 시도: {conversationState.resolutionAttempts}회</p>
                  <p>문제 해결 여부: {conversationState.problemSolved ? "해결됨" : "진행 중"}</p>
                  <p>
                    사용자 만족도:{" "}
                    {conversationState.userSatisfaction !== null
                      ? `${conversationState.userSatisfaction}/5`
                      : "측정 전"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
