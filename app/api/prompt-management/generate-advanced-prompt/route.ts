import { type NextRequest, NextResponse } from "next/server"
import { advancedPromptService } from "@/services/advanced-prompt-service"
import { intentDetectionService } from "@/services/intent-detection-service"

export async function POST(req: NextRequest) {
  try {
    const { message, userContext, conversationState, conversationHistory } = await req.json()

    // 인텐트 감지
    const detectedIntent = await intentDetectionService.detectIntent(message, conversationHistory || [])

    // 고급 프롬프트 생성
    const { systemPrompt, userPrompt } = advancedPromptService.createFullAdvancedPrompt(
      detectedIntent.intent,
      message,
      userContext,
      conversationState,
      conversationHistory || [],
    )

    return NextResponse.json({
      systemPrompt,
      userPrompt,
      metadata: {
        intent: detectedIntent.intent,
        confidence: detectedIntent.confidence,
      },
    })
  } catch (error) {
    console.error("Error generating advanced prompt:", error)
    return NextResponse.json({ error: "Failed to generate advanced prompt" }, { status: 500 })
  }
}
