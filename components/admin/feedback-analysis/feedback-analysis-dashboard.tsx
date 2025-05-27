"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FeedbackOverview } from "./feedback-overview"
import { FeedbackFilters } from "./feedback-filters"
import { FeedbackList } from "./feedback-list"
import { NodeFeedbackAnalysis } from "./node-feedback-analysis"
import { FeedbackBasedOptimization } from "./feedback-based-optimization"
import { FeedbackTrends } from "./feedback-trends"
import { SegmentAnalysisDashboard } from "./segment-analysis-dashboard"
import { PredictionDashboard } from "./prediction-dashboard"
import type { FeedbackFilterOptions } from "@/types/feedback"

export function FeedbackAnalysisDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [filters, setFilters] = useState<FeedbackFilterOptions>({})
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // 필터 적용
  const applyFilters = (newFilters: FeedbackFilterOptions) => {
    setFilters(newFilters)
  }

  // 노드 선택
  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId)
    setActiveTab("node-analysis")
  }

  return (
    <div className="space-y-6">
      <FeedbackFilters onApplyFilters={applyFilters} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="list">피드백 목록</TabsTrigger>
          <TabsTrigger value="node-analysis" disabled={!selectedNodeId}>
            노드 분석
          </TabsTrigger>
          <TabsTrigger value="trends">트렌드</TabsTrigger>
          <TabsTrigger value="segments">세그먼트 분석</TabsTrigger>
          <TabsTrigger value="predictions">예측 분석</TabsTrigger>
          <TabsTrigger value="optimization">최적화 제안</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>피드백 개요</CardTitle>
              <CardDescription>수집된 사용자 피드백의 전체적인 통계와 분포를 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackOverview filters={filters} onSelectNode={selectNode} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>피드백 목록</CardTitle>
              <CardDescription>수집된 모든 사용자 피드백을 확인하고 검색합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackList filters={filters} onSelectNode={selectNode} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="node-analysis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>노드 피드백 분석</CardTitle>
              <CardDescription>선택한 노드에 대한 상세 피드백 분석 결과를 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedNodeId ? (
                <NodeFeedbackAnalysis nodeId={selectedNodeId} filters={filters} />
              ) : (
                <p>분석할 노드를 선택해주세요.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>피드백 트렌드</CardTitle>
              <CardDescription>시간에 따른 피드백 패턴과 변화를 분석합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackTrends filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>사용자 세그먼트 분석</CardTitle>
              <CardDescription>사용자 그룹별 피드백 특성과 패턴을 분석합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <SegmentAnalysisDashboard filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>피드백 예측 분석</CardTitle>
              <CardDescription>과거 데이터를 기반으로 미래 피드백 트렌드를 예측합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <PredictionDashboard filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>피드백 기반 최적화 제안</CardTitle>
              <CardDescription>사용자 피드백을 기반으로 한 진단 트리 최적화 제안을 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackBasedOptimization filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
