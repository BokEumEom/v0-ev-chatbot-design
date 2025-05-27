import { NextResponse } from "next/server"
import { qualityEvaluationService } from "@/services/quality-evaluation-service"

// 평가 작업 목록 조회
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const promptVersionId = searchParams.get("promptVersionId") || undefined

    const jobs = qualityEvaluationService.getJobs(promptVersionId)
    return NextResponse.json(jobs)
  } catch (error) {
    console.error("평가 작업 조회 오류:", error)
    return NextResponse.json({ error: "평가 작업 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}

// 새 평가 작업 생성
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 필수 필드 검증
    if (!body.promptVersionId) {
      return NextResponse.json({ error: "프롬프트 버전 ID는 필수 항목입니다." }, { status: 400 })
    }

    const { promptVersionId, method } = body

    const job = qualityEvaluationService.createEvaluationJob(promptVersionId, method)

    // 실제 구현에서는 여기서 백그라운드 작업 시작
    // 예: startEvaluationJob(job.id)

    return NextResponse.json(job)
  } catch (error) {
    console.error("평가 작업 생성 오류:", error)
    return NextResponse.json({ error: "평가 작업 생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}
