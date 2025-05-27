import { NextResponse } from "next/server"
import { qualityEvaluationService } from "@/services/quality-evaluation-service"

// 평가 결과 목록 조회
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const promptVersionId = searchParams.get("promptVersionId") || undefined
    const conversationId = searchParams.get("conversationId") || undefined
    const method = (searchParams.get("method") as any) || undefined
    const startDateStr = searchParams.get("startDate") || undefined
    const endDateStr = searchParams.get("endDate") || undefined

    const filters: any = {}

    if (promptVersionId) filters.promptVersionId = promptVersionId
    if (conversationId) filters.conversationId = conversationId
    if (method) filters.method = method
    if (startDateStr) filters.startDate = new Date(startDateStr)
    if (endDateStr) filters.endDate = new Date(endDateStr)

    const results = qualityEvaluationService.getEvaluationResults(filters)
    return NextResponse.json(results)
  } catch (error) {
    console.error("평가 결과 조회 오류:", error)
    return NextResponse.json({ error: "평가 결과 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}
