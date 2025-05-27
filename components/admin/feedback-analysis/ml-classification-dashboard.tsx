"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, AlertTriangle, Brain, BarChart, RefreshCw, Play, Trash2 } from "lucide-react"
import type { ClassificationModel, ModelTrainingConfig } from "@/types/ml-feedback"
import { ModelTrainingForm } from "./model-training-form"
import { ModelPerformanceChart } from "./model-performance-chart"

export function MLClassificationDashboard() {
  const [models, setModels] = useState<ClassificationModel[]>([])
  const [activeModelId, setActiveModelId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trainingInProgress, setTrainingInProgress] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [selectedModel, setSelectedModel] = useState<ClassificationModel | null>(null)

  // 모델 목록 로드
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/feedback/classify")

        if (!response.ok) {
          throw new Error("Failed to fetch models")
        }

        const data = await response.json()
        setModels(data.models || [])
        setActiveModelId(data.activeModel)
      } catch (error) {
        console.error("Error loading models:", error)
        setError("모델 목록을 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    loadModels()
  }, [])

  // 모델 활성화
  const activateModel = async (modelId: string) => {
    try {
      const response = await fetch("/api/feedback/train", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modelId }),
      })

      if (!response.ok) {
        throw new Error("Failed to activate model")
      }

      setActiveModelId(modelId)

      // 모델 목록 업데이트
      setModels((prevModels) =>
        prevModels.map((model) => ({
          ...model,
          isActive: model.id === modelId,
        })),
      )
    } catch (error) {
      console.error("Error activating model:", error)
      setError("모델 활성화 중 오류가 발생했습니다.")
    }
  }

  // 모델 삭제
  const deleteModel = async (modelId: string) => {
    if (!confirm("정말로 이 모델을 삭제하시겠습니까?")) {
      return
    }

    try {
      const response = await fetch("/api/feedback/train", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modelId }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete model")
      }

      // 모델 목록에서 제거
      setModels((prevModels) => prevModels.filter((model) => model.id !== modelId))

      // 선택된 모델이 삭제된 경우 선택 해제
      if (selectedModel?.id === modelId) {
        setSelectedModel(null)
      }

      // 활성 모델이 삭제된 경우 활성 모델 ID 제거
      if (activeModelId === modelId) {
        setActiveModelId(null)
      }
    } catch (error) {
      console.error("Error deleting model:", error)
      setError("모델 삭제 중 오류가 발생했습니다.")
    }
  }

  // 모델 학습
  const trainModel = async (config: ModelTrainingConfig) => {
    try {
      setTrainingInProgress(true)
      setTrainingProgress(0)

      // 학습 진행 상황 시뮬레이션
      const progressInterval = setInterval(() => {
        setTrainingProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress >= 100 ? 100 : newProgress
        })
      }, 500)

      const response = await fetch("/api/feedback/train", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      clearInterval(progressInterval)
      setTrainingProgress(100)

      if (!response.ok) {
        throw new Error("Failed to train model")
      }

      const { result } = await response.json()

      // 새 모델 추가
      const newModel: ClassificationModel = {
        id: result.modelId,
        name: `${config.modelType} Model ${new Date().toLocaleDateString()}`,
        description: `Trained ${config.modelType} model with ${config.trainingDataPercentage * 100}% of data`,
        type: config.modelType,
        version: "1.0.0",
        createdAt: new Date(result.trainingStartTime),
        updatedAt: new Date(result.trainingEndTime),
        trainedBy: "user",
        isActive: false,
        performance: result.performance,
        config: config,
      }

      setModels((prevModels) => [...prevModels, newModel])
      setSelectedModel(newModel)

      // 잠시 후 학습 상태 초기화
      setTimeout(() => {
        setTrainingInProgress(false)
        setTrainingProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Error training model:", error)
      setError("모델 학습 중 오류가 발생했습니다.")
      setTrainingInProgress(false)
    }
  }

  // 모델 유형에 따른 배지 색상
  const getModelTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "naive-bayes":
        return "secondary"
      case "random-forest":
        return "default"
      case "neural-network":
        return "destructive"
      case "ensemble":
        return "outline"
      default:
        return "secondary"
    }
  }

  // 성능 점수에 따른 색상
  const getPerformanceColor = (score: number) => {
    if (score >= 0.85) return "text-green-600"
    if (score >= 0.7) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="models">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="models">모델 목록</TabsTrigger>
          <TabsTrigger value="training">모델 학습</TabsTrigger>
          <TabsTrigger value="performance" disabled={!selectedModel}>
            성능 분석
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>분류 모델 목록</CardTitle>
              <CardDescription>피드백 분류에 사용 가능한 모델 목록입니다. 활성화할 모델을 선택하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : models.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">사용 가능한 모델이 없습니다. 새 모델을 학습하세요.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">상태</TableHead>
                        <TableHead>모델 이름</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>정확도</TableHead>
                        <TableHead>생성일</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {models.map((model) => (
                        <TableRow
                          key={model.id}
                          className={model.isActive ? "bg-muted/50" : ""}
                          onClick={() => setSelectedModel(model)}
                        >
                          <TableCell>{model.isActive && <Check className="h-4 w-4 text-green-600" />}</TableCell>
                          <TableCell className="font-medium">{model.name}</TableCell>
                          <TableCell>
                            <Badge variant={getModelTypeBadgeVariant(model.type) as any}>{model.type}</Badge>
                          </TableCell>
                          <TableCell className={getPerformanceColor(model.performance.accuracy)}>
                            {(model.performance.accuracy * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell>{new Date(model.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              {!model.isActive && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    activateModel(model.id)
                                  }}
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  활성화
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteModel(model.id)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {selectedModel && (
                <div className="mt-6 p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-2">{selectedModel.name} 상세 정보</h3>
                  <p className="text-sm text-muted-foreground mb-4">{selectedModel.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">모델 정보</h4>
                      <ul className="space-y-1 text-sm">
                        <li>
                          <span className="font-medium">ID:</span> {selectedModel.id}
                        </li>
                        <li>
                          <span className="font-medium">유형:</span> {selectedModel.type}
                        </li>
                        <li>
                          <span className="font-medium">버전:</span> {selectedModel.version}
                        </li>
                        <li>
                          <span className="font-medium">생성일:</span>{" "}
                          {new Date(selectedModel.createdAt).toLocaleString()}
                        </li>
                        <li>
                          <span className="font-medium">상태:</span> {selectedModel.isActive ? "활성" : "비활성"}
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">성능 지표</h4>
                      <ul className="space-y-1 text-sm">
                        <li>
                          <span className="font-medium">정확도:</span>
                          <span className={getPerformanceColor(selectedModel.performance.accuracy)}>
                            {(selectedModel.performance.accuracy * 100).toFixed(1)}%
                          </span>
                        </li>
                        <li>
                          <span className="font-medium">정밀도:</span>
                          <span className={getPerformanceColor(selectedModel.performance.precision)}>
                            {(selectedModel.performance.precision * 100).toFixed(1)}%
                          </span>
                        </li>
                        <li>
                          <span className="font-medium">재현율:</span>
                          <span className={getPerformanceColor(selectedModel.performance.recall)}>
                            {(selectedModel.performance.recall * 100).toFixed(1)}%
                          </span>
                        </li>
                        <li>
                          <span className="font-medium">F1 점수:</span>
                          <span className={getPerformanceColor(selectedModel.performance.f1Score)}>
                            {(selectedModel.performance.f1Score * 100).toFixed(1)}%
                          </span>
                        </li>
                        <li>
                          <span className="font-medium">샘플 크기:</span>{" "}
                          {selectedModel.performance.sampleSize.toLocaleString()}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>새 모델 학습</CardTitle>
              <CardDescription>
                새로운 피드백 분류 모델을 학습합니다. 모델 유형과 학습 설정을 선택하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trainingInProgress ? (
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-center">
                    <Brain className="h-12 w-12 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-center text-lg font-medium">모델 학습 중...</h3>
                  <Progress value={trainingProgress} className="w-full" />
                  <p className="text-center text-sm text-muted-foreground">
                    모델 학습에는 몇 분 정도 소요될 수 있습니다.
                  </p>
                </div>
              ) : (
                <ModelTrainingForm onSubmit={trainModel} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>모델 성능 분석</CardTitle>
              <CardDescription>
                {selectedModel ? `${selectedModel.name} 모델의 성능 지표와 분석 결과입니다.` : "모델을 선택하세요."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedModel ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {(selectedModel.performance.accuracy * 100).toFixed(1)}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">정확도</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {(selectedModel.performance.precision * 100).toFixed(1)}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">정밀도</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {(selectedModel.performance.recall * 100).toFixed(1)}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">재현율</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {(selectedModel.performance.f1Score * 100).toFixed(1)}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">F1 점수</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">성능 차트</h3>
                    <div className="h-80">
                      <ModelPerformanceChart model={selectedModel} />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">혼동 행렬</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]"></TableHead>
                            <TableHead>예측: 긍정</TableHead>
                            <TableHead>예측: 중립</TableHead>
                            <TableHead>예측: 부정</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">실제: 긍정</TableCell>
                            <TableCell className="text-green-600">
                              {selectedModel.performance.confusionMatrix[0][0]}
                            </TableCell>
                            <TableCell>{selectedModel.performance.confusionMatrix[0][1]}</TableCell>
                            <TableCell>{selectedModel.performance.confusionMatrix[0][2]}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">실제: 중립</TableCell>
                            <TableCell>{selectedModel.performance.confusionMatrix[1][0]}</TableCell>
                            <TableCell className="text-green-600">
                              {selectedModel.performance.confusionMatrix[1][1]}
                            </TableCell>
                            <TableCell>{selectedModel.performance.confusionMatrix[1][2]}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">실제: 부정</TableCell>
                            <TableCell>{selectedModel.performance.confusionMatrix[2][0]}</TableCell>
                            <TableCell>{selectedModel.performance.confusionMatrix[2][1]}</TableCell>
                            <TableCell className="text-green-600">
                              {selectedModel.performance.confusionMatrix[2][2]}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">모델을 선택하여 성능 분석 결과를 확인하세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
