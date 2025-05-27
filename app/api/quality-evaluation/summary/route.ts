import { NextResponse } from "next/server"
import { qualityEvaluationService } from "@/services/quality-evaluation-service"

// 평가 결과 요약 조회
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const promptVersionId = searchParams.get("promptVersionId")

    if (!promptVersionId) {
      return NextResponse.json({ error: "프롬프트 버전 ID는 필수 항목입니다." }, { status: 400 })
    }

    const summary = qualityEvaluationService.generateEvaluationSummary(promptVersionId)

    if (!summary) {
      return NextResponse.json({ error: "평가 결과가 없습니다." }, { status: 404 })
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("평가 요약 조회 오류:", error)
    return NextResponse.json({ error: "평가 요약 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}
