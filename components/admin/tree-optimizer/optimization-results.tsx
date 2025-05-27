"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight } from "lucide-react"
import type { TreeOptimizationResult, OptimizationSuggestion } from "@/types/tree-optimizer"

interface OptimizationResultsProps {
  result: TreeOptimizationResult
  onApply: () => void
}

export function OptimizationResults({ result, onApply }: OptimizationResultsProps) {
  const [activeTab, setActiveTab] = useState("suggestions")

  // 개선율에 따른 색상 계산
  const getImprovementColor = (improvement: number) => {
    if (improvement > 20) return "text-green-600"
    if (improvement > 10) return "text-emerald-600"
    if (improvement > 5) return "text-blue-600"
    if (improvement > 0) return "text-sky-600"
    return "text-red-600"
  }

  // 영향도에 따른 배지 색상
  const getImpactBadgeVariant = (impact: OptimizationSuggestion["impact"]) => {
    switch (impact) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  // 제안 유형에 따른 아이콘
  const getSuggestionTypeIcon = (type: OptimizationSuggestion["type"]) => {
    switch (type) {
      case "add":
        return <span className="text-green-500">+</span>
      case "remove":
        return <span className="text-red-500">-</span>
      case "modify":
        return <span className="text-blue-500">M</span>
      case "reorder":
        return <span className="text-yellow-500">↔</span>
      case "merge":
        return <span className="text-purple-500">⊕</span>
      case "split":
        return <span className="text-orange-500">⊗</span>
      default:
        return <span>?</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">제안된 변경</div>
              <div className="text-2xl font-bold">{result.suggestions.length}개</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">예상 경로 단축</div>
              <div className="text-2xl font-bold">
                <span className={getImprovementColor(result.metrics.averagePathLength.improvement)}>
                  {result.metrics.averagePathLength.improvement.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">예상 성공률 향상</div>
              <div className="text-2xl font-bold">
                <span className={getImprovementColor(result.metrics.estimatedSuccessRate.improvement)}>
                  {result.metrics.estimatedSuccessRate.improvement.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="suggestions">최적화 제안 ({result.suggestions.length})</TabsTrigger>
          <TabsTrigger value="metrics">성능 지표 비교</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="mt-4 space-y-4">
          <Accordion type="single" collapsible className="w-full">
            {result.suggestions.map((suggestion, index) => (
              <AccordionItem key={index} value={`suggestion-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100">
                      {getSuggestionTypeIcon(suggestion.type)}
                    </div>
                    <div className="flex-1">{suggestion.description}</div>
                    <Badge variant={getImpactBadgeVariant(suggestion.impact)} className="ml-2">
                      {suggestion.impact === "high" ? "높음" : suggestion.impact === "medium" ? "중간" : "낮음"}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-8 space-y-3">
                    <div className="text-sm text-gray-600">{suggestion.reasoning}</div>

                    <div className="text-sm">
                      <span className="font-medium">신뢰도:</span> {(suggestion.confidence * 100).toFixed(0)}%
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">영향 받는 노드:</span> {suggestion.affectedNodes.join(", ")}
                    </div>

                    {suggestion.before && suggestion.after && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm font-medium">변경 전</div>
                          <div className="bg-gray-50 p-3 rounded-md text-sm">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(suggestion.before, null, 2)}</pre>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">변경 후</div>
                          <div className="bg-gray-50 p-3 rounded-md text-sm">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(suggestion.after, null, 2)}</pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="metrics" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">성능 지표 비교</h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>평균 경로 길이 (단계)</span>
                    <div className="flex items-center gap-2">
                      <span>{result.metrics.averagePathLength.before.toFixed(1)}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span>{result.metrics.averagePathLength.after.toFixed(1)}</span>
                      <span className={`${getImprovementColor(result.metrics.averagePathLength.improvement)}`}>
                        ({result.metrics.averagePathLength.improvement > 0 ? "-" : "+"}
                        {Math.abs(result.metrics.averagePathLength.improvement).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.max(0, 100 - result.metrics.averagePathLength.improvement)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>평균 완료 시간 (초)</span>
                    <div className="flex items-center gap-2">
                      <span>{(result.metrics.averageCompletionTime.before / 1000).toFixed(1)}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span>{(result.metrics.averageCompletionTime.after / 1000).toFixed(1)}</span>
                      <span className={`${getImprovementColor(result.metrics.averageCompletionTime.improvement)}`}>
                        ({result.metrics.averageCompletionTime.improvement > 0 ? "-" : "+"}
                        {Math.abs(result.metrics.averageCompletionTime.improvement).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.max(0, 100 - result.metrics.averageCompletionTime.improvement)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>예상 성공률</span>
                    <div className="flex items-center gap-2">
                      <span>{(result.metrics.estimatedSuccessRate.before * 100).toFixed(1)}%</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span>{(result.metrics.estimatedSuccessRate.after * 100).toFixed(1)}%</span>
                      <span className={`${getImprovementColor(result.metrics.estimatedSuccessRate.improvement)}`}>
                        ({result.metrics.estimatedSuccessRate.improvement > 0 ? "+" : "-"}
                        {Math.abs(result.metrics.estimatedSuccessRate.improvement).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(100, result.metrics.estimatedSuccessRate.after * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline">다시 최적화</Button>
        <Button onClick={onApply}>최적화 적용</Button>
      </div>
    </div>
  )
}
