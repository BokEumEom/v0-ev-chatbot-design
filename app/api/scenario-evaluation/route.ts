import { type NextRequest, NextResponse } from "next/server"
import { scenarioEvaluationService } from "@/services/scenario-evaluation-service"
import type { ScenarioEvaluationSettings } from "@/types/scenario-evaluation"
import type { ChatScenario } from "@/data/chatbot-scenarios"

export async function POST(req: NextRequest) {
  try {
    const {
      scenario,
      method = "hybrid",
      settings = {},
    } = (await req.json()) as {
      scenario: ChatScenario
      method?: "ai" | "rule" | "hybrid"
      settings?: Partial<ScenarioEvaluationSettings>
    }

    // 시나리오 유효성 검사
    if (!scenario || !scenario.id || !scenario.conversations || !Array.isArray(scenario.conversations)) {
      return NextResponse.json({ error: "유효하지 않은 시나리오입니다." }, { status: 400 })
    }

    // 시나리오 평가
    const evaluationResult = await scenarioEvaluationService.evaluateScenario(scenario, method)

    return NextResponse.json(evaluationResult)
  } catch (error) {
    console.error("시나리오 평가 API 오류:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "시나리오 평가 중 오류가 발생했습니다." },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // 평가 통계 반환
    const stats = scenarioEvaluationService.generateEvaluationStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("평가 통계 API 오류:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "평가 통계 생성 중 오류가 발생했습니다." },
      { status: 500 },
    )
  }
}
