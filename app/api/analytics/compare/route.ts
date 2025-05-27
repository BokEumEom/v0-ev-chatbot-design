import { NextResponse } from "next/server"
import { analyticsService } from "@/services/analytics-service"

// 프롬프트 변형 비교 결과 조회
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const baselineId = searchParams.get("baselineId")
    const testId = searchParams.get("testId")
    const fromStr = searchParams.get("from")
    const toStr = searchParams.get("to")

    if (!baselineId || !testId) {
      return NextResponse.json({ error: "기준 변형 ID와 테스트 변형 ID가 필요합니다." }, { status: 400 })
    }

    let timeRange: { start: Date; end: Date } | undefined

    if (fromStr && toStr) {
      timeRange = {
        start: new Date(fromStr),
        end: new Date(toStr),
      }
    }

    const comparison = await analyticsService.comparePromptVariants(baselineId, testId, timeRange)

    if (!comparison) {
      return NextResponse.json({ error: "비교 데이터를 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json(comparison)
  } catch (error) {
    console.error("변형 비교 조회 오류:", error)
    return NextResponse.json({ error: "변형 비교 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}
