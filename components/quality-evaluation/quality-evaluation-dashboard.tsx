"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, BarChart4, Settings, FileText, Play } from "lucide-react"
import { QualityMetricsChart } from "./quality-metrics-chart"
import { QualityResultsTable } from "./quality-results-table"
import { QualityEvaluationSettings } from "./quality-evaluation-settings"
import { QualityEvaluationRules } from "./quality-evaluation-rules"
import { QualityEvaluationJobs } from "./quality-evaluation-jobs"
import type { PromptVersion } from "@/types/prompt-management"
import type { EvaluationResult } from "@/types/quality-evaluation"

interface QualityEvaluationDashboardProps {
  promptVersions: PromptVersion[]
}

export function QualityEvaluationDashboard({ promptVersions = [] }: QualityEvaluationDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [selectedVersionId, setSelectedVersionId] = useState<string>("")
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([])
  const [summary, setSummary] = useState<any>(null)

  // 선택된 버전 변경 시 평가 결과 로드
  useEffect(() => {
    async function loadEvaluationResults() {
      if (!selectedVersionId) return

      try {
        setLoading(true)
        // 평가 결과 로드
        const response = await fetch(`/api/quality-evaluation/results?promptVersionId=${selectedVersionId}`)
        const data = await response.json()
        setEvaluationResults(data)

        // 평가 요약 로드
        try {
          const summaryResponse = await fetch(`/api/quality-evaluation/summary?promptVersionId=${selectedVersionId}`)
          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json()
            setSummary(summaryData)
          } else {
            setSummary(null)
          }
        } catch (error) {
          console.error("평가 요약 로드 오류:", error)
          setSummary(null)
        }
      } catch (error) {
        console.error("평가 결과 로드 오류:", error)
        // API 오류 시 빈 배열로 설정
        setEvaluationResults([])
      } finally {
        setLoading(false)
      }
    }

    loadEvaluationResults()
  }, [selectedVersionId])

  // 컴포넌트 마운트 시 로딩 상태 해제
  useEffect(() => {
    // 임시 데이터 로드 (실제 구현에서는 API 호출)
    const mockResults: EvaluationResult[] = []
    setEvaluationResults(mockResults)
    setLoading(false)
  }, [])

  // 새 평가 작업 생성
  const handleCreateEvaluationJob = async (method: string) => {
    if (!selectedVersionId) return

    try {
      setLoading(true)
      const response = await fetch("/api/quality-evaluation/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptVersionId: selectedVersionId,
          method,
        }),
      })

      if (!response.ok) {
        throw new Error("평가 작업 생성 실패")
      }

      // 작업 생성 후 결과 다시 로드
      const resultsResponse = await fetch(`/api/quality-evaluation/results?promptVersionId=${selectedVersionId}`)
      const data = await resultsResponse.json()
      setEvaluationResults(data)
    } catch (error) {
      console.error("평가 작업 생성 오류:", error)
      // 오류 발생 시 알림 표시 (실제 구현에서는 toast 등으로 알림)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">품질 평가 대시보드</h2>
          <p className="text-muted-foreground">프롬프트 응답 품질을 자동으로 평가하고 분석합니다</p>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <Select value={selectedVersionId} onValueChange={setSelectedVersionId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="프롬프트 버전 선택" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(promptVersions) &&
                promptVersions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.name} (v{version.version})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => handleCreateEvaluationJob("hybrid")}
            disabled={!selectedVersionId || loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            평가 실행
          </Button>
        </div>
      </div>

      {!selectedVersionId ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">평가할 프롬프트 버전을 선택해주세요</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart4 className="h-4 w-4 mr-2" />
              개요
            </TabsTrigger>
            <TabsTrigger value="results">
              <FileText className="h-4 w-4 mr-2" />
              평가 결과
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Play className="h-4 w-4 mr-2" />
              평가 작업
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              설정
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {evaluationResults.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">평가 결과가 없습니다. 평가를 실행해주세요.</p>
                  <Button className="mt-4" onClick={() => handleCreateEvaluationJob("hybrid")}>
                    <Play className="mr-2 h-4 w-4" />
                    평가 실행
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">평가 수</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary?.totalEvaluations || evaluationResults.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">평균 품질 점수</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {summary?.averageScores?.overallScore?.toFixed(1) ||
                          (
                            evaluationResults.reduce((sum, result) => sum + (result.metrics?.overallScore || 0), 0) /
                            evaluationResults.length
                          ).toFixed(1) ||
                          "0.0"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">평균 관련성</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {summary?.averageScores?.relevance?.toFixed(1) ||
                          (
                            evaluationResults.reduce((sum, result) => sum + (result.metrics?.relevance || 0), 0) /
                            evaluationResults.length
                          ).toFixed(1) ||
                          "0.0"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">평균 정확성</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {summary?.averageScores?.accuracy?.toFixed(1) ||
                          (
                            evaluationResults.reduce((sum, result) => sum + (result.metrics?.accuracy || 0), 0) /
                            evaluationResults.length
                          ).toFixed(1) ||
                          "0.0"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>품질 지표 분석</CardTitle>
                    <CardDescription>각 품질 지표별 평균 점수</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <QualityMetricsChart evaluationResults={evaluationResults} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            <QualityResultsTable evaluationResults={evaluationResults} />
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <QualityEvaluationJobs promptVersionId={selectedVersionId} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <QualityEvaluationSettings />
              <QualityEvaluationRules />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
