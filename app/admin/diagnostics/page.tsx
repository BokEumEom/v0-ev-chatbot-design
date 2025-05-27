import { DiagnosticsDashboard } from "@/components/admin/diagnostics-dashboard"

export const metadata = {
  title: "진단 통계 대시보드 | 전기차 충전 도우미",
  description: "관리자용 문제 진단 통계 및 분석 대시보드",
}

export default function DiagnosticsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">진단 통계 대시보드</h1>
        <p className="text-muted-foreground">문제 진단 마법사 사용 통계 및 분석 도구입니다.</p>
      </div>

      <DiagnosticsDashboard />
    </div>
  )
}
