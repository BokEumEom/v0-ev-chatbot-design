import { type NextRequest, NextResponse } from "next/server"
import { emotionRecognitionService } from "@/services/emotion-recognition-service"
import type { EmotionState } from "@/types/emotion-recognition"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { emotionState, userMessage, conversationContext } = body

    if (!emotionState || !userMessage) {
      return NextResponse.json({ error: "감정 상태 또는 사용자 메시지가 제공되지 않았습니다." }, { status: 400 })
    }

    // 감정 기반 프롬프트 생성
    const prompt = emotionRecognitionService.generateEmotionBasedPrompt(
      emotionState as EmotionState,
      userMessage,
      conversationContext || {},
    )

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error("감정 기반 프롬프트 생성 API 오류:", error)
    return NextResponse.json({ error: "프롬프트 생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}
