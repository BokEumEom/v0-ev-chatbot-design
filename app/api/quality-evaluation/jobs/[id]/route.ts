import { NextResponse } from "next/server"
import { qualityEvaluationService } from "@/services/quality-evaluation-service"

// 평가 작업 조회
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const job = qualityEvaluationService.getJob(id)

    if (!job) {
      return NextResponse.json({ error: "평가 작업을 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("평가 작업 조회 오류:", error)
    return NextResponse.json({ error: "평가 작업 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}

// 평가 작업 상태 업데이트
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json()

    const updatedJob = qualityEvaluationService.updateJobStatus(id, body)

    if (!updatedJob) {
      return NextResponse.json({ error: "평가 작업을 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error("평가 작업 업데이트 오류:", error)
    return NextResponse.json({ error: "평가 작업 업데이트 중 오류가 발생했습니다." }, { status: 500 })
  }
}
