import type { Metadata } from "next"
import { ScenarioEvaluationDashboard } from "@/components/admin/scenario-evaluation/scenario-evaluation-dashboard"

export const metadata: Metadata = {
  title: "시나리오 평가 | EV 충전 어시스턴트",
  description: "생성된 시나리오의 품질을 평가하고 개선 제안을 확인합니다.",
}

export default function ScenarioEvaluationPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">시나리오 평가 대시보드</h1>
        <p className="text-muted-foreground">생성된 시나리오의 품질을 자동으로 평가하고 개선 제안을 확인합니다.</p>
      </div>
      <ScenarioEvaluationDashboard />
    </div>
  )
}
