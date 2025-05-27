"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipForward, RefreshCw } from "lucide-react"
import type { TroubleshootingNode } from "@/types/troubleshooting"
import type { SimulationResult } from "@/types/tree-optimizer"
import { treeOptimizerService } from "@/services/tree-optimizer-service"

interface TreeSimulatorProps {
  originalTree: TroubleshootingNode[]
  optimizedTree: TroubleshootingNode[]
}

export function TreeSimulator({ originalTree, optimizedTree }: TreeSimulatorProps) {
  const [sessionCount, setSessionCount] = useState(100)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  // 시뮬레이션 실행
  const runSimulation = () => {
    setIsSimulating(true)
    setSimulationProgress(0)
    setIsRunning(true)

    // 진행 상황 업데이트를 위한 인터벌
    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        const newProgress = prev + 2
        if (newProgress >= 100) {
          clearInterval(interval)

          // 시뮬레이션 결과 계산
          const result = treeOptimizerService.simulateOptimizedTree(originalTree, optimizedTree)
          setSimulationResult(result)
          setIsSimulating(false)
          setIsRunning(false)
          return 100
        }
        return newProgress
      })
    }, 50)
  }

  // 시뮬레이션 일시 정지/재개
  const toggleSimulation = () => {
    setIsRunning((prev) => !prev)
  }

  // 시뮬레이션 완료
  const completeSimulation = () => {
    setSimulationProgress(100)
    setIsRunning(false)

    // 시뮬레이션 결과 계산
    const result = treeOptimizerService.simulateOptimizedTree(originalTree, optimizedTree)
    setSimulationResult(result)
    setIsSimulating(false)
  }

  // 시뮬레이션 리셋
  const resetSimulation = () => {
    setSimulationProgress(0)
    setSimulationResult(null)
    setIsSimulating(false)
    setIsRunning(false)
  }

  // 진행 중일 때 진행 상황 업데이트
  useEffect(() => {
    if (isRunning && simulationProgress < 100) {
      const timer = setTimeout(() => {
        setSimulationProgress((prev) => {
          const newProgress = prev + 1
          if (newProgress >= 100) {
            // 시뮬레이션 결과 계산
            const result = treeOptimizerService.simulateOptimizedTree(originalTree, optimizedTree)
            setSimulationResult(result)
            setIsSimulating(false)
            setIsRunning(false)
            return 100
          }
          return newProgress
        })
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [isRunning, simulationProgress, originalTree, optimizedTree])

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">시뮬레이션 설정</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-count">시뮬레이션 세션 수</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="session-count"
                  min={10}
                  max={1000}
                  step={10}
                  value={[sessionCount]}
                  onValueChange={(value) => setSessionCount(value[0])}
                  disabled={isSimulating}
                  className="flex-1"
                />
                <span className="w-16 text-right">{sessionCount}</span>
              </div>
              <p className="text-sm text-gray-500">
                시뮬레이션할 가상 사용자 세션의 수입니다. 값이 클수록 더 정확한 결과를 얻을 수 있습니다.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetSimulation}
                disabled={!simulationResult && !isSimulating}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                리셋
              </Button>
              {isSimulating ? (
                <>
                  <Button variant="outline" size="sm" onClick={toggleSimulation}>
                    {isRunning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        일시정지
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        재개
                      </>
                    )}
                  </Button>
                  <Button size="sm" onClick={completeSimulation}>
                    <SkipForward className="h-4 w-4 mr-2" />
                    완료
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={runSimulation} disabled={simulationResult !== null}>
                  <Play className="h-4 w-4 mr-2" />
                  시뮬레이션 시작
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isSimulating && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">시뮬레이션 진행 중...</h3>

            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${simulationProgress}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-gray-500">{simulationProgress}% 완료</div>
            </div>
          </CardContent>
        </Card>
      )}

      {simulationResult && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">시뮬레이션 결과</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="text-md font-medium">원본 트리</h4>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">평균 단계 수</span>
                      <span className="font-medium">{simulationResult.originalMetrics.averageSteps.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">평균 소요 시간</span>
                      <span className="font-medium">
                        {(simulationResult.originalMetrics.averageTime / 1000).toFixed(1)}초
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">완료율</span>
                      <span className="font-medium">
                        {(simulationResult.originalMetrics.completionRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">만족도</span>
                      <span className="font-medium">
                        {(simulationResult.originalMetrics.satisfactionRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium">최적화된 트리</h4>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">평균 단계 수</span>
                      <span className="font-medium">{simulationResult.optimizedMetrics.averageSteps.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">평균 소요 시간</span>
                      <span className="font-medium">
                        {(simulationResult.optimizedMetrics.averageTime / 1000).toFixed(1)}초
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">완료율</span>
                      <span className="font-medium">
                        {(simulationResult.optimizedMetrics.completionRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">만족도</span>
                      <span className="font-medium">
                        {(simulationResult.optimizedMetrics.satisfactionRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-md font-medium mb-4">개선 효과</h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>단계 수 감소</span>
                      <span className={simulationResult.improvement.steps > 0 ? "text-green-600" : "text-red-600"}>
                        {simulationResult.improvement.steps > 0 ? "-" : "+"}
                        {Math.abs(simulationResult.improvement.steps).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${
                          simulationResult.improvement.steps > 0 ? "bg-green-600" : "bg-red-600"
                        } h-2.5 rounded-full`}
                        style={{
                          width: `${Math.min(100, Math.abs(simulationResult.improvement.steps))}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>소요 시간 감소</span>
                      <span className={simulationResult.improvement.time > 0 ? "text-green-600" : "text-red-600"}>
                        {simulationResult.improvement.time > 0 ? "-" : "+"}
                        {Math.abs(simulationResult.improvement.time).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${
                          simulationResult.improvement.time > 0 ? "bg-green-600" : "bg-red-600"
                        } h-2.5 rounded-full`}
                        style={{
                          width: `${Math.min(100, Math.abs(simulationResult.improvement.time))}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>완료율 향상</span>
                      <span
                        className={simulationResult.improvement.completionRate > 0 ? "text-green-600" : "text-red-600"}
                      >
                        {simulationResult.improvement.completionRate > 0 ? "+" : "-"}
                        {Math.abs(simulationResult.improvement.completionRate).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${
                          simulationResult.improvement.completionRate > 0 ? "bg-green-600" : "bg-red-600"
                        } h-2.5 rounded-full`}
                        style={{
                          width: `${Math.min(100, Math.abs(simulationResult.improvement.completionRate))}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>만족도 향상</span>
                      <span
                        className={
                          simulationResult.improvement.satisfactionRate > 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {simulationResult.improvement.satisfactionRate > 0 ? "+" : "-"}
                        {Math.abs(simulationResult.improvement.satisfactionRate).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${
                          simulationResult.improvement.satisfactionRate > 0 ? "bg-green-600" : "bg-red-600"
                        } h-2.5 rounded-full`}
                        style={{
                          width: `${Math.min(100, Math.abs(simulationResult.improvement.satisfactionRate))}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
