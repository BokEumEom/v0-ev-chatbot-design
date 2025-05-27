import { NextResponse } from "next/server"
import { qualityEvaluationService } from "@/services/quality-evaluation-service"

// 단일 응답 평가
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 필수 필드 검증
    if (!body.userMessage || !body.botResponse || !body.promptVersionId) {
      return NextResponse.json(
        { error: "사용자 메시지, 봇 응답, 프롬프트 버전 ID는 필수 항목입니다." },
        { status: 400 },
      )
    }

    const {
      userMessage,
      botResponse,
      detectedIntent = "unknown",
      promptVersionId,
      conversationId = `conv_${Date.now()}`,
      method = qualityEvaluationService.getConfig().defaultMethod,
    } = body

    let result

    switch (method) {
      case "ai":
        result = await qualityEvaluationService.evaluateWithAI(
          userMessage,
          botResponse,
          detectedIntent,
          promptVersionId,
          conversationId,
        )
        break

      case "rule":
        result = qualityEvaluationService.evaluateWithRules(
          userMessage,
          botResponse,
          detectedIntent,
          promptVersionId,
          conversationId,
        )
        break

      case "hybrid":
        result = await qualityEvaluationService.evaluateWithHybrid(
          userMessage,
          botResponse,
          detectedIntent,
          promptVersionId,
          conversationId,
        )
        break

      case "human":
        // 사람 평가는 별도 엔드포인트 사용
        return NextResponse.json(
          { error: "사람 평가는 /api/quality-evaluation/human-evaluate 엔드포인트를 사용하세요." },
          { status: 400 },
        )

      default:
        return NextResponse.json({ error: "지원되지 않는 평가 방법입니다." }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("응답 평가 오류:", error)
    return NextResponse.json({ error: "응답 평가 중 오류가 발생했습니다." }, { status: 500 })
  }
}
