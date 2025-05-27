import { FeedbackAnalysisDashboard } from "@/components/admin/feedback-analysis/feedback-analysis-dashboard"

export default function FeedbackAnalysisPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">사용자 피드백 분석</h1>
      <FeedbackAnalysisDashboard />
    </div>
  )
}
