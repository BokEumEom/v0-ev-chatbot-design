import { NextResponse } from "next/server"
import { analyticsService } from "@/services/analytics-service"

// 프롬프트 변형 활성화
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "변형 ID가 필요합니다." }, { status: 400 })
    }

    const success = await analyticsService.activatePromptVariant(id)

    if (!success) {
      return NextResponse.json({ error: "프롬프트 변형을 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("프롬프트 변형 활성화 오류:", error)
    return NextResponse.json({ error: "프롬프트 변형 활성화 중 오류가 발생했습니다." }, { status: 500 })
  }
}
