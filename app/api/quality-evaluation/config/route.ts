import { NextResponse } from "next/server"
import { qualityEvaluationService } from "@/services/quality-evaluation-service"

// 평가 설정 조회
export async function GET() {
  try {
    const config = qualityEvaluationService.getConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error("평가 설정 조회 오류:", error)
    return NextResponse.json({ error: "평가 설정 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}

// 평가 설정 업데이트
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const updatedConfig = qualityEvaluationService.updateConfig(body)
    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error("평가 설정 업데이트 오류:", error)
    return NextResponse.json({ error: "평가 설정 업데이트 중 오류가 발생했습니다." }, { status: 500 })
  }
}
