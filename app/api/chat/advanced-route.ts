import { type NextRequest, NextResponse } from "next/server"
import { advancedPromptService } from "@/services/advanced-prompt-service"
import { intentDetectionService } from "@/services/intent-detection-service"
import { conversationContinuityService } from "@/services/conversation-continuity-service"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory, userContext, conversationState } = await req.json()

    // 시작 시간 기록
    const startTime = Date.now()

    // 인텐트 감지
    const detectedIntent = await intentDetectionService.detectIntent(message, conversationHistory)

    // 대화 상태 업데이트
    const updatedState = conversationContinuityService.updateConversationState(
      conversationState,
      message,
      detectedIntent.intent,
    )

    // 고급 프롬프트 생성
    const { systemPrompt, userPrompt } = advancedPromptService.createFullAdvancedPrompt(
      detectedIntent.intent,
      message,
      userContext,
      updatedState,
      conversationHistory,
    )

    const fullPrompt = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userPrompt },
    ]

    // AI 응답 생성
    const { text: response } = await generateText({
      model: google("gemini-pro"),
      prompt: fullPrompt,
      temperature: 0.7,
      maxTokens: 1500,
    })

    // 처리 시간 계산
    const processingTime = Date.now() - startTime

    // 응답 반환
    return NextResponse.json({
      response,
      metadata: {
        intent: detectedIntent.intent,
        confidence: detectedIntent.confidence,
        entities: detectedIntent.entities,
        promptVariantId: "advanced_continuity_v1",
        processingTime,
      },
    })
  } catch (error) {
    console.error("Error in advanced chat API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
