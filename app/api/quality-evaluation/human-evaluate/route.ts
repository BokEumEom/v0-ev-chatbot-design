import { NextResponse } from "next/server"
import { qualityEvaluationService } from "@/services/quality-evaluation-service"

// 사람 평가 결과 추가
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 필수 필드 검증
    if (!body.userMessage || !body.botResponse || !body.promptVersionId || !body.metrics || !body.evaluatedBy) {
      return NextResponse.json(
        { error: "사용자 메시지, 봇 응답, 프롬프트 버전 ID, 평가 지표, 평가자는 필수 항목입니다." },
        { status: 400 },
      )
    }

    const {
      userMessage,
      botResponse,
      detectedIntent = "unknown",
      promptVersionId,
      conversationId = `conv_${Date.now()}`,
      metrics,
      evaluatedBy,
      feedback,
    } = body

    // 지표 검증
    const requiredMetrics = ["relevance", "accuracy", "completeness", "clarity", "helpfulness", "conciseness", "tone"]
    for (const metric of requiredMetrics) {
      if (metrics[metric] === undefined || metrics[metric] < 0 || metrics[metric] > 10) {
        return NextResponse.json({ error: `${metric} 지표는 0-10 범위의 값이어야 합니다.` }, { status: 400 })
      }
    }

    const result = qualityEvaluationService.addHumanEvaluation(
      userMessage,
      botResponse,
      detectedIntent,
      promptVersionId,
      conversationId,
      metrics,
      evaluatedBy,
      feedback,
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("사람 평가 추가 오류:", error)
    return NextResponse.json({ error: "사람 평가 추가 중 오류가 발생했습니다." }, { status: 500 })
  }
}
