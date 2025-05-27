import { type NextRequest, NextResponse } from "next/server"
import { emotionRecognitionService } from "@/services/emotion-recognition-service"
import type { EmotionAnalysisRequest } from "@/types/emotion-recognition"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, conversationHistory, previousEmotions, language } = body as EmotionAnalysisRequest

    if (!text) {
      return NextResponse.json({ error: "텍스트가 제공되지 않았습니다." }, { status: 400 })
    }

    // 감정 분석 수행
    const result = await emotionRecognitionService.analyzeEmotion({
      text,
      conversationHistory,
      previousEmotions,
      language,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("감정 분석 API 오류:", error)
    return NextResponse.json({ error: "감정 분석 중 오류가 발생했습니다." }, { status: 500 })
  }
}
