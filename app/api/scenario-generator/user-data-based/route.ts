import { type NextRequest, NextResponse } from "next/server"
import { userDataBasedScenarioGenerator } from "@/services/user-data-based-scenario-generator"
import type { ScenarioGenerationFromDataConfig } from "@/types/conversation-data-processor"

export async function POST(req: NextRequest) {
  try {
    const { config, existingScenarios = [] } = (await req.json()) as {
      config: ScenarioGenerationFromDataConfig
      existingScenarios?: string[]
    }

    // 필수 필드 검증
    if (!config || !config.patternExtractionConfig || config.maxScenarios === undefined) {
      return NextResponse.json({ error: "필수 설정 필드가 누락되었습니다." }, { status: 400 })
    }

    // 시나리오 생성
    const scenarios = await userDataBasedScenarioGenerator.generateScenariosFromData(config, existingScenarios)

    return NextResponse.json({
      status: "success",
      count: scenarios.length,
      scenarios,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("사용자 데이터 기반 시나리오 생성 API 오류:", error)
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
  // 사용자 데이터 기반 시나리오 생성 통계 또는 히스토리 반환 (향후 구현)
  return NextResponse.json({
    stats: {
      totalGenerated: 0,
      successRate: 0,
      dataBasedPercentage: 0,
      averageQualityScore: 0,
    },
  })
}
