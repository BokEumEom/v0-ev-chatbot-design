import { TreeOptimizerDashboard } from "@/components/admin/tree-optimizer/tree-optimizer-dashboard"

export default function TreeOptimizerPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">진단 트리 최적화 도구</h1>
      <TreeOptimizerDashboard />
    </div>
  )
}
