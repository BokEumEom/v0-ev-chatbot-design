"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Zap } from "lucide-react"
import type { OptimizationSettings as OptimizationSettingsType } from "@/types/tree-optimizer"
import { addDays } from "date-fns"

interface OptimizationSettingsProps {
  onOptimize: (settings: OptimizationSettingsType) => void
  isOptimizing: boolean
}

export function OptimizationSettings({ onOptimize, isOptimizing }: OptimizationSettingsProps) {
  const [minDataPoints, setMinDataPoints] = useState(20)
  const [optimizationStrength, setOptimizationStrength] =
    useState<OptimizationSettingsType["optimizationStrength"]>("balanced")
  const [targetMetrics, setTargetMetrics] = useState<OptimizationSettingsType["targetMetrics"]>([
    "pathLength",
    "completionTime",
    "successRate",
  ])
  const [preserveNodes, setPreserveNodes] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [preserveNodeInput, setPreserveNodeInput] = useState("")

  // 최적화 실행
  const handleOptimize = () => {
    const settings: OptimizationSettingsType = {
      minDataPoints,
      optimizationStrength,
      targetMetrics,
      preserveNodes,
      dateRange:
        dateRange.from && dateRange.to
          ? {
              start: dateRange.from,
              end: dateRange.to,
            }
          : undefined,
    }

    onOptimize(settings)
  }

  // 보존할 노드 추가
  const addPreserveNode = () => {
    if (preserveNodeInput && !preserveNodes.includes(preserveNodeInput)) {
      setPreserveNodes([...preserveNodes, preserveNodeInput])
      setPreserveNodeInput("")
    }
  }

  // 보존할 노드 제거
  const removePreserveNode = (nodeId: string) => {
    setPreserveNodes(preserveNodes.filter((id) => id !== nodeId))
  }

  // 타겟 메트릭 토글
  const toggleTargetMetric = (metric: OptimizationSettingsType["targetMetrics"][0]) => {
    if (targetMetrics.includes(metric)) {
      setTargetMetrics(targetMetrics.filter((m) => m !== metric))
    } else {
      setTargetMetrics([...targetMetrics, metric])
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">기본 설정</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="min-data-points">최소 데이터 포인트 수</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="min-data-points"
                    min={5}
                    max={100}
                    step={5}
                    value={[minDataPoints]}
                    onValueChange={(value) => setMinDataPoints(value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-right">{minDataPoints}</span>
                </div>
                <p className="text-sm text-gray-500">
                  최적화에 사용할 최소 데이터 포인트 수입니다. 이 값이 클수록 더 신뢰할 수 있는 최적화가 가능합니다.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="optimization-strength">최적화 강도</Label>
                <Select
                  value={optimizationStrength}
                  onValueChange={(value: OptimizationSettingsType["optimizationStrength"]) =>
                    setOptimizationStrength(value)
                  }
                >
                  <SelectTrigger id="optimization-strength">
                    <SelectValue placeholder="최적화 강도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">보수적 (안전한 변경만)</SelectItem>
                    <SelectItem value="balanced">균형 (중간 수준의 변경)</SelectItem>
                    <SelectItem value="aggressive">적극적 (대담한 변경 포함)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">최적화 강도에 따라 제안되는 변경의 범위와 대담함이 달라집니다.</p>
              </div>

              <div className="space-y-2">
                <Label>최적화 대상 지표</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metric-path-length"
                      checked={targetMetrics.includes("pathLength")}
                      onCheckedChange={() => toggleTargetMetric("pathLength")}
                    />
                    <label
                      htmlFor="metric-path-length"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      경로 길이 (단계 수 최소화)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metric-completion-time"
                      checked={targetMetrics.includes("completionTime")}
                      onCheckedChange={() => toggleTargetMetric("completionTime")}
                    />
                    <label
                      htmlFor="metric-completion-time"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      완료 시간 (진단 소요 시간 최소화)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metric-success-rate"
                      checked={targetMetrics.includes("successRate")}
                      onCheckedChange={() => toggleTargetMetric("successRate")}
                    />
                    <label
                      htmlFor="metric-success-rate"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      성공률 (진단 완료율 최대화)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">고급 설정</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date-range">데이터 날짜 범위</Label>
                <DatePickerWithRange dateRange={dateRange} onDateRangeChange={setDateRange} />
                <p className="text-sm text-gray-500">최적화에 사용할 진단 데이터의 날짜 범위입니다.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preserve-nodes">보존할 노드 ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="preserve-nodes"
                    placeholder="보존할 노드 ID 입력"
                    value={preserveNodeInput}
                    onChange={(e) => setPreserveNodeInput(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addPreserveNode}>
                    추가
                  </Button>
                </div>
                <p className="text-sm text-gray-500">최적화 과정에서 변경되지 않도록 보존할 노드 ID를 입력하세요.</p>

                {preserveNodes.length > 0 && (
                  <div className="mt-2">
                    <Label className="mb-2 block">보존 노드 목록</Label>
                    <div className="flex flex-wrap gap-2">
                      {preserveNodes.map((nodeId) => (
                        <div
                          key={nodeId}
                          className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          <span>{nodeId}</span>
                          <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => removePreserveNode(nodeId)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleOptimize} disabled={isOptimizing || targetMetrics.length === 0} className="gap-2">
          {isOptimizing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              최적화 중...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              트리 최적화 실행
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
