import { ResponseQualityMonitor } from "@/components/response-quality-monitor"

export default function ResponseQualityPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">응답 품질 모니터링</h1>
      <ResponseQualityMonitor />
    </div>
  )
}
