import { type NextRequest, NextResponse } from "next/server"
import { scenarioGeneratorService } from "@/services/scenario-generator-service"
import type { ScenarioGenerationRequest } from "@/types/scenario-generator"

export async function POST(req: NextRequest) {
  try {
    const { settings, existingScenarios = [] } = (await req.json()) as ScenarioGenerationRequest

    // 필수 필드 검증
    if (!settings.category || !settings.topic || !settings.complexity || !settings.userType) {
      return NextResponse.json({ error: "필수 설정 필드가 누락되었습니다." }, { status: 400 })
    }

    // 시나리오 생성
    const scenario = await scenarioGeneratorService.generateScenario(settings, existingScenarios)

    // 시나리오 유효성 검사
    const validation = scenarioGeneratorService.validateScenario(scenario)
    if (!validation.valid) {
      return NextResponse.json(
        { error: "생성된 시나리오가 유효하지 않습니다.", details: validation.errors },
        { status: 422 },
      )
    }

    return NextResponse.json({
      id: scenario.id,
      status: "success",
      scenario,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("시나리오 생성 API 오류:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "시나리오 생성 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  // 시나리오 생성 통계 또는 히스토리 반환 (향후 구현)
  return NextResponse.json({
    stats: {
      totalGenerated: 0,
      successRate: 0,
      categoryCounts: {},
      averageConversationTurns: 0,
    },
  })
}
