import { NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { promptService } from "@/services/prompt-service"
import { intentDetectionService } from "@/services/intent-detection-service"
import { createEnhancedUserPrompt } from "@/utils/enhanced-prompt-utils"

export async function POST(req: Request) {
  try {
    // API 키 확인
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 })
    }

    // 요청 본문 파싱
    let message, conversationHistory, userContext, conversationState
    try {
      const body = await req.json()
      message = body.message
      conversationHistory = body.conversationHistory || []
      userContext = body.userContext || {}
      conversationState = body.conversationState || {}

      if (!message || typeof message !== "string") {
        return NextResponse.json(
          {
            error: "유효한 메시지가 필요합니다.",
            received: body,
          },
          { status: 400 },
        )
      }
    } catch (error) {
      return NextResponse.json({ error: "잘못된 JSON 형식입니다." }, { status: 400 })
    }

    // 인텐트 감지
    const intentResult = intentDetectionService.detectIntent(message)
    const intent = intentResult.topIntent.id

    // 향상된 프롬프트 생성
    const systemPrompt = promptService.getSystemPrompt()
    const userPrompt = createEnhancedUserPrompt(intent, message, userContext, conversationState, conversationHistory)

    // 시작 시간 기록 (성능 측정용)
    const startTime = Date.now()

    // Gemini API 호출
    const fullPrompt = systemPrompt + "\n" + userPrompt

    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt: fullPrompt,
      temperature: 0.7,
      maxTokens: 1500,
    })

    // 종료 시간 기록 (성능 측정용)
    const endTime = Date.now()
    const processingTime = endTime - startTime

    // 응답 텍스트 추출
    const responseText = text || "죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다."

    // 후속 질문 생성
    const followUpQuestions = intentDetectionService.generateFollowUpQuestions(intentResult.topIntent)

    // 응답 로깅 (실제 구현에서는 DB에 저장)
    console.log({
      timestamp: new Date().toISOString(),
      intent,
      userMessage: message,
      processingTime: `${processingTime}ms`,
      botResponse: responseText.substring(0, 100) + "...",
    })

    return NextResponse.json({
      response: responseText,
      metadata: {
        intent,
        confidence: intentResult.topIntent.confidence,
        entities: intentResult.entities,
        processingTime,
        followUpQuestions,
      },
    })
  } catch (error) {
    console.error("오류:", error)
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}
