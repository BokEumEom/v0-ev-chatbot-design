import { type NextRequest, NextResponse } from "next/server"
import { emotionRecognitionService } from "@/services/emotion-recognition-service"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory, userContext, emotionState } = body

    if (!message) {
      return NextResponse.json({ error: "메시지가 제공되지 않았습니다." }, { status: 400 })
    }

    // 감정 기반 프롬프트 생성
    const prompt = emotionRecognitionService.generateEmotionBasedPrompt(emotionState, message, userContext || {})

    // Gemini 모델을 사용하여 응답 생성
    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 1500,
    })

    return NextResponse.json({
      response: text,
      prompt: prompt,
    })
  } catch (error) {
    console.error("감정 인식 챗봇 API 오류:", error)
    return NextResponse.json({ error: "응답 생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}
