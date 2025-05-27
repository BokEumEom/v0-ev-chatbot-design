import { NextResponse } from "next/server"
import { analyticsService } from "@/services/analytics-service"

// 사용자 피드백 제출
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 필수 필드 검증
    if (!body.messageId || body.rating === undefined) {
      return NextResponse.json({ error: "메시지 ID와 평가 점수는 필수 항목입니다." }, { status: 400 })
    }

    // 응답 분석 데이터 조회
    const analysis = await analyticsService.getResponseAnalysis(body.messageId)

    if (!analysis) {
      return NextResponse.json({ error: "해당 메시지를 찾을 수 없습니다." }, { status: 404 })
    }

    // 사용자 피드백 추가
    const updatedAnalysis = await analyticsService.addUserFeedback(body.messageId, {
      rating: body.rating,
      comment: body.comment,
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("피드백 제출 오류:", error)
    return NextResponse.json({ error: "피드백 제출 중 오류가 발생했습니다." }, { status: 500 })
  }
}
