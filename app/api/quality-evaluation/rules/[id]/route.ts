import { NextResponse } from "next/server"
import { qualityEvaluationService } from "@/services/quality-evaluation-service"

// 평가 규칙 업데이트
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json()

    const updatedRule = qualityEvaluationService.updateRule(id, body)

    if (!updatedRule) {
      return NextResponse.json({ error: "평가 규칙을 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json(updatedRule)
  } catch (error) {
    console.error("평가 규칙 업데이트 오류:", error)
    return NextResponse.json({ error: "평가 규칙 업데이트 중 오류가 발생했습니다." }, { status: 500 })
  }
}

// 평가 규칙 삭제
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const deleted = qualityEvaluationService.deleteRule(id)

    if (!deleted) {
      return NextResponse.json({ error: "평가 규칙을 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("평가 규칙 삭제 오류:", error)
    return NextResponse.json({ error: "평가 규칙 삭제 중 오류가 발생했습니다." }, { status: 500 })
  }
}
