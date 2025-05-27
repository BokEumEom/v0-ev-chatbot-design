import { type NextRequest, NextResponse } from "next/server"
import { scenarioImprovementService } from "@/services/scenario-improvement-service"
import type { ScenarioImprovementSettings } from "@/types/scenario-evaluation"
import type { ChatScenario } from "@/data/chatbot-scenarios"

export async function POST(req: NextRequest) {
  try {
    const {
      scenario,
      evaluationResult,
      method = "hybrid",
      settings = {},
    } = (await req.json()) as {
      scenario: ChatScenario
      evaluationResult: any // ScenarioEvaluationResult
      method?: "ai" | "rule" | "hybrid"
      settings?: Partial<ScenarioImprovementSettings>
    }

    // 시나리오 및 평가 결과 유효성 검사
    if (!scenario || !scenario.id || !evaluationResult || !evaluationResult.id) {
      return NextResponse.json({ error: "유효하지 않은 시나리오 또는 평가 결과입니다." }, { status: 400 })
    }

    // 시나리오 개선
    const improvementResult = await scenarioImprovementService.improveScenario(
      scenario,
      evaluationResult,
      method,
      settings,
    )

    return NextResponse.json(improvementResult)
  } catch (error) {
    console.error("시나리오 개선 API 오류:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "시나리오 개선 중 오류가 발생했습니다." },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // 개선 통계 반환
    const stats = scenarioImprovementService.generateImprovementStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("개선 통계 API 오류:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "개선 통계 생성 중 오류가 발생했습니다." },
      { status: 500 },
    )
  }
}
