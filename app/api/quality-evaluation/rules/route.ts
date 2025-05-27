import { NextResponse } from "next/server"
import { qualityEvaluationService } from "@/services/quality-evaluation-service"

// 평가 규칙 목록 조회
export async function GET() {
  try {
    const rules = qualityEvaluationService.getRules()
    return NextResponse.json(rules)
  } catch (error) {
    console.error("평가 규칙 조회 오류:", error)
    return NextResponse.json({ error: "평가 규칙 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}

// 새 평가 규칙 추가
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const newRule = qualityEvaluationService.addRule(body)
    return NextResponse.json(newRule)
  } catch (error) {
    console.error("평가 규칙 추가 오류:", error)
    return NextResponse.json({ error: "평가 규칙 추가 중 오류가 발생했습니다." }, { status: 500 })
  }
}
