"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Edit, Plus, Trash2, Check, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { feedbackAnalysisService } from "@/services/feedback-analysis-service"
import { treeOptimizerService } from "@/services/tree-optimizer-service"
import type { FeedbackBasedSuggestion, FeedbackFilterOptions } from "@/types/feedback"
import type { OptimizationSettings } from "@/types/tree-optimizer"

interface FeedbackBasedOptimizationProps {
  filters: FeedbackFilterOptions
}

export function FeedbackBasedOptimization({ filters }: FeedbackBasedOptimizationProps) {
  const [suggestions, setSuggestions] = useState<FeedbackBasedSuggestion[]>([])
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      setLoading(true)

      try {
        const suggestions = feedbackAnalysisService.generateFeedbackBasedSuggestions(filters)
        setSuggestions(suggestions)
      } catch (error) {
        console.error("피드백 기반 최적화 제안 로드 중 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  // 제안 선택 토글
  const toggleSuggestion = (nodeId: string) => {
    setSelectedSuggestions((prev) => (prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]))
  }

  // 모든 제안 선택/해제
  const toggleAllSuggestions = () => {
    if (selectedSuggestions.length === suggestions.length) {
      setSelectedSuggestions([])
    } else {
      setSelectedSuggestions(suggestions.map((s) => s.nodeId))
    }
  }

  // 최적화 실행
  const runOptimization = () => {
    setIsOptimizing(true)

    // 선택된 제안만 필터링
    const selectedSuggestionsList = suggestions.filter((s) => selectedSuggestions.includes(s.nodeId))

    // 최적화 설정
    const settings: OptimizationSettings = {
      minDataPoints: 3,
      targetMetrics: ["pathLength", "completionTime", "successRate"],
      optimizationStrength: "balanced",
      preserveNodes: [],
    }

    // 비동기 처리를 시뮬레이션 (실제로는 동기 처리지만 UI 반응성을 위해)
    setTimeout(() => {
      try {
        const result = treeOptimizerService.optimizeTree(settings)
        setOptimizationResult(result)
      } catch (error) {
        console.error("최적화 중 오류 발생:", error)
      } finally {
        setIsOptimizing(false)
      }
    }, 1000)
  }

  // 최적화 적용
  const applyOptimization = () => {
    if (!optimizationResult) return

    const changeId = treeOptimizerService.applyOptimization(optimizationResult, "피드백 기반 최적화")
    // 적용 후 상태 초기화
    setOptimizationResult(null)
    setSelectedSuggestions([])
    // 제안 다시 로드
    const newSuggestions = feedbackAnalysisService.generateFeedbackBasedSuggestions(filters)
    setSuggestions(newSuggestions)
  }

  // 제안 유형에 따른 아이콘 반환
  const getSuggestionTypeIcon = (type: string) => {
    switch (type) {
      case "modify":
        return <Edit className="h-4 w-4 text-amber-500" />
      case "add":
        return <Plus className="h-4 w-4 text-green-500" />
      case "remove":
        return <Trash2 className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  // 제안 유형에 따른 배지 색상 반환
  const getSuggestionTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "modify":
        return "outline"
      case "add":
        return "secondary"
      case "remove":
        return "destructive"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>피드백 기반 최적화 제안</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-2">제안 로드 중...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>피드백 기반 최적화 제안</span>
          {suggestions.length > 0 && (
            <Button variant="outline" size="sm" onClick={toggleAllSuggestions} className="text-xs">
              {selectedSuggestions.length === suggestions.length ? "모두 해제" : "모두 선택"}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <AlertCircle className="mb-2 h-10 w-10" />
            <p>현재 필터 조건에 맞는 최적화 제안이 없습니다.</p>
            <p className="text-sm">필터 조건을 변경하거나 더 많은 피드백 데이터를 수집해 보세요.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.nodeId}
                  className="flex items-start space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedSuggestions.includes(suggestion.nodeId)}
                    onCheckedChange={() => toggleSuggestion(suggestion.nodeId)}
                    id={`suggestion-${suggestion.nodeId}`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <label htmlFor={`suggestion-${suggestion.nodeId}`} className="font-medium hover:cursor-pointer">
                        {suggestion.nodeName}
                      </label>
                      <Badge variant={getSuggestionTypeBadgeVariant(suggestion.type)}>
                        <span className="flex items-center gap-1">
                          {getSuggestionTypeIcon(suggestion.type)}
                          {suggestion.type}
                        </span>
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{suggestion.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-muted px-2 py-1">신뢰도: {suggestion.confidence}%</span>
                      <span className="rounded-full bg-muted px-2 py-1">피드백 수: {suggestion.feedbackCount}</span>
                      {suggestion.metrics && (
                        <span className="rounded-full bg-muted px-2 py-1">
                          예상 개선: {suggestion.metrics.improvement}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedSuggestions([])}
                disabled={selectedSuggestions.length === 0 || isOptimizing}
              >
                선택 초기화
              </Button>
              <Button onClick={runOptimization} disabled={selectedSuggestions.length === 0 || isOptimizing}>
                {isOptimizing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    최적화 중...
                  </>
                ) : (
                  "선택한 제안으로 최적화"
                )}
              </Button>
            </div>

            {optimizationResult && (
              <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                <h3 className="mb-2 font-medium">최적화 결과 미리보기</h3>
                <div className="mb-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>변경된 노드: {optimizationResult.changedNodes} 개</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                    <span>예상 경로 단축: {optimizationResult.pathReduction}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                    <span>예상 성공률 향상: {optimizationResult.successRateImprovement}%</span>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setOptimizationResult(null)}>
                    <X className="mr-1 h-4 w-4" />
                    취소
                  </Button>
                  <Button size="sm" onClick={applyOptimization}>
                    <Check className="mr-1 h-4 w-4" />
                    최적화 적용
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
