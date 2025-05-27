"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TreeVisualizer } from "./tree-visualizer"
import { OptimizationSettings } from "./optimization-settings"
import { OptimizationResults } from "./optimization-results"
import { ChangeHistory } from "./change-history"
import { TreeSimulator } from "./tree-simulator"
import { treeOptimizerService } from "@/services/tree-optimizer-service"
import type { OptimizationSettings as OptimizationSettingsType } from "@/types/tree-optimizer"
import type { TroubleshootingNode } from "@/types/troubleshooting"

export function TreeOptimizerDashboard() {
  const [activeTab, setActiveTab] = useState("visualize")
  const [currentTree, setCurrentTree] = useState<TroubleshootingNode[]>(treeOptimizerService.getCurrentTree())
  const [optimizationResult, setOptimizationResult] = useState<any>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // 최적화 실행
  const runOptimization = (settings: OptimizationSettingsType) => {
    setIsOptimizing(true)

    // 비동기 처리를 시뮬레이션 (실제로는 동기 처리지만 UI 반응성을 위해)
    setTimeout(() => {
      try {
        const result = treeOptimizerService.optimizeTree(settings)
        setOptimizationResult(result)
        setActiveTab("results")
      } catch (error) {
        console.error("최적화 중 오류 발생:", error)
        // 오류 처리
      } finally {
        setIsOptimizing(false)
      }
    }, 1000)
  }

  // 최적화 적용
  const applyOptimization = () => {
    if (!optimizationResult) return

    const changeId = treeOptimizerService.applyOptimization(optimizationResult, "관리자")
    setCurrentTree(treeOptimizerService.getCurrentTree())
    setActiveTab("history")
  }

  // 변경 롤백
  const rollbackChange = (changeId: string) => {
    const success = treeOptimizerService.rollbackChange(changeId)
    if (success) {
      setCurrentTree(treeOptimizerService.getCurrentTree())
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="visualize">트리 시각화</TabsTrigger>
          <TabsTrigger value="optimize">최적화 설정</TabsTrigger>
          <TabsTrigger value="results" disabled={!optimizationResult}>
            최적화 결과
          </TabsTrigger>
          <TabsTrigger value="simulate" disabled={!optimizationResult}>
            시뮬레이션
          </TabsTrigger>
          <TabsTrigger value="history">변경 이력</TabsTrigger>
        </TabsList>

        <TabsContent value="visualize" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>진단 트리 시각화</CardTitle>
              <CardDescription>현재 진단 트리의 구조를 시각적으로 확인하고 분석할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <TreeVisualizer tree={currentTree} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>최적화 설정</CardTitle>
              <CardDescription>진단 트리 최적화를 위한 설정을 구성하고 최적화를 실행합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <OptimizationSettings onOptimize={runOptimization} isOptimizing={isOptimizing} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>최적화 결과</CardTitle>
              <CardDescription>최적화 알고리즘이 제안한 변경 사항과 예상 개선 효과를 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {optimizationResult ? (
                <OptimizationResults result={optimizationResult} onApply={applyOptimization} />
              ) : (
                <p>최적화를 먼저 실행해주세요.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>시뮬레이션</CardTitle>
              <CardDescription>최적화된 트리의 성능을 시뮬레이션하여 예상 효과를 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {optimizationResult ? (
                <TreeSimulator
                  originalTree={optimizationResult.originalTree}
                  optimizedTree={optimizationResult.optimizedTree}
                />
              ) : (
                <p>최적화를 먼저 실행해주세요.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>변경 이력</CardTitle>
              <CardDescription>
                진단 트리에 적용된 변경 사항의 이력을 확인하고 필요시 롤백할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangeHistory onRollback={rollbackChange} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
