import { NextResponse } from "next/server"
import { analyticsService } from "@/services/analytics-service"

// 프롬프트 변형 분석 요약 조회
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const variantId = searchParams.get("variantId")
    const fromStr = searchParams.get("from")
    const toStr = searchParams.get("to")

    if (!variantId) {
      return NextResponse.json({ error: "변형 ID가 필요합니다." }, { status: 400 })
    }

    let timeRange: { start: Date; end: Date } | undefined

    if (fromStr && toStr) {
      timeRange = {
        start: new Date(fromStr),
        end: new Date(toStr),
      }
    }

    const summary = await analyticsService.generateAnalyticsSummary(variantId, timeRange)

    if (!summary) {
      return NextResponse.json({ error: "분석 데이터를 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("분석 요약 조회 오류:", error)
    return NextResponse.json({ error: "분석 요약 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}
