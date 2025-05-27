import { NextResponse } from "next/server"
import { analyticsService } from "@/services/analytics-service"

// 프롬프트 변형 목록 조회
export async function GET() {
  try {
    const variants = await analyticsService.getPromptVariants()
    return NextResponse.json(variants)
  } catch (error) {
    console.error("프롬프트 변형 조회 오류:", error)
    return NextResponse.json({ error: "프롬프트 변형 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}

// 새 프롬프트 변형 추가
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 필수 필드 검증
    if (!body.name || !body.systemPrompt) {
      return NextResponse.json({ error: "이름과 시스템 프롬프트는 필수 항목입니다." }, { status: 400 })
    }

    const newVariant = await analyticsService.addPromptVariant({
      name: body.name,
      description: body.description || "",
      systemPrompt: body.systemPrompt,
      isActive: false,
    })

    return NextResponse.json(newVariant)
  } catch (error) {
    console.error("프롬프트 변형 추가 오류:", error)
    return NextResponse.json({ error: "프롬프트 변형 추가 중 오류가 발생했습니다." }, { status: 500 })
  }
}
