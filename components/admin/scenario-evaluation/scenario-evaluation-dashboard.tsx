"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { EvaluationSettings } from "./evaluation-settings"
import { EvaluationResults } from "./evaluation-results"
import { ImprovementSuggestions } from "./improvement-suggestions"
import { QualityMetricsVisualization } from "./quality-metrics-visualization"

export function ScenarioEvaluationDashboard() {
  const [activeTab, setActiveTab] = useState("settings")
  const [evaluationInProgress, setEvaluationInProgress] = useState(false)
  const [evaluationCompleted, setEvaluationCompleted] = useState(false)
  const [improvementInProgress, setImprovementInProgress] = useState(false)
  const [improvementCompleted, setImprovementCompleted] = useState(false)

  const handleEvaluationStart = () => {
    setEvaluationInProgress(true)
    setEvaluationCompleted(false)
    // 실제 구현에서는 여기서 평가 API를 호출하고 완료 시 상태를 업데이트합니다
    setTimeout(() => {
      setEvaluationInProgress(false)
      setEvaluationCompleted(true)
      setActiveTab("results")
    }, 2000)
  }

  const handleImprovementStart = () => {
    setImprovementInProgress(true)
    setImprovementCompleted(false)
    // 실제 구현에서는 여기서 개선 API를 호출하고 완료 시 상태를 업데이트합니다
    setTimeout(() => {
      setImprovementInProgress(false)
      setImprovementCompleted(true)
      setActiveTab("improvements")
    }, 2000)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="settings">설정</TabsTrigger>
            <TabsTrigger value="results" disabled={!evaluationCompleted}>
              결과
            </TabsTrigger>
            <TabsTrigger value="improvements" disabled={!improvementCompleted}>
              개선 제안
            </TabsTrigger>
            <TabsTrigger value="metrics" disabled={!evaluationCompleted}>
              품질 지표
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <EvaluationSettings onEvaluate={handleEvaluationStart} isLoading={evaluationInProgress} />
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <EvaluationResults onImprove={handleImprovementStart} isLoading={improvementInProgress} />
          </TabsContent>

          <TabsContent value="improvements" className="space-y-4">
            <ImprovementSuggestions />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <QualityMetricsVisualization />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
