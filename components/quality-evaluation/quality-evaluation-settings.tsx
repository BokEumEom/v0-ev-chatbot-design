"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"

export function QualityEvaluationSettings() {
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // 설정 로드
  useEffect(() => {
    // 실제 구현에서는 API 호출
    // 임시 데이터 설정
    const mockConfig = {
      defaultMethod: "hybrid",
      metrics: {
        relevance: {
          weight: 0.2,
          threshold: 7,
          description: "응답이 사용자 질문과 얼마나 관련이 있는지 평가",
        },
        accuracy: {
          weight: 0.2,
          threshold: 8,
          description: "응답에 포함된 정보가 얼마나 정확한지 평가",
        },
        completeness: {
          weight: 0.15,
          threshold: 7,
          description: "응답이 사용자 질문에 얼마나 완전하게 답변하는지 평가",
        },
        clarity: {
          weight: 0.15,
          threshold: 7,
          description: "응답이 얼마나 명확하고 이해하기 쉬운지 평가",
        },
        helpfulness: {
          weight: 0.15,
          threshold: 7,
          description: "응답이 사용자 문제 해결에 얼마나 도움이 되는지 평가",
        },
        conciseness: {
          weight: 0.05,
          threshold: 6,
          description: "응답이 불필요한 정보 없이 간결한지 평가",
        },
        tone: {
          weight: 0.1,
          threshold: 7,
          description: "응답의 어조가 적절하고 친절한지 평가",
        },
      },
      aiEvaluator: {
        model: "gemini-2.0-flash",
        prompt: `당신은 AI 응답 품질 평가 전문가입니다. 다음 대화에서 AI 응답의 품질을 평가해주세요.

사용자 질문: {{userMessage}}
AI 응답: {{botResponse}}
감지된 인텐트: {{detectedIntent}}

다음 7가지 지표에 대해 0-10점 척도로 평가해주세요:
1. 관련성 (Relevance): 응답이 사용자 질문과 얼마나 관련이 있는지
2. 정확성 (Accuracy): 응답에 포함된 정보가 얼마나 정확한지
3. 완전성 (Completeness): 응답이 사용자 질문에 얼마나 완전하게 답변하는지
4. 명확성 (Clarity): 응답이 얼마나 명확하고 이해하기 쉬운지
5. 유용성 (Helpfulness): 응답이 사용자 문제 해결에 얼마나 도움이 되는지
6. 간결성 (Conciseness): 응답이 불필요한 정보 없이 간결한지
7. 어조 (Tone): 응답의 어조가 적절하고 친절한지

각 지표에 대한 점수와 간단한 설명을 제공해주세요. 그리고 마지막에 종합 평가와 개선 제안을 추가해주세요.`,
        temperature: 0.2,
      },
    }

    setConfig(mockConfig)
    setLoading(false)
  }, [])

  // 설정 저장
  const handleSaveConfig = async () => {
    if (!config) return

    try {
      setSaving(true)
      // 실제 구현에서는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // 성공 메시지 표시 (실제 구현에서는 toast 등으로 알림)
      console.log("설정이 저장되었습니다.")
    } catch (error) {
      console.error("설정 저장 오류:", error)
    } finally {
      setSaving(false)
    }
  }

  // 지표 가중치 업데이트
  const handleWeightChange = (metric: string, value: number[]) => {
    if (!config) return
    setConfig({
      ...config,
      metrics: {
        ...config.metrics,
        [metric]: {
          ...config.metrics[metric],
          weight: value[0],
        },
      },
    })
  }

  // 임계값 업데이트
  const handleThresholdChange = (metric: string, value: number[]) => {
    if (!config) return
    setConfig({
      ...config,
      metrics: {
        ...config.metrics,
        [metric]: {
          ...config.metrics[metric],
          threshold: value[0],
        },
      },
    })
  }

  // 기본 평가 방법 업데이트
  const handleDefaultMethodChange = (value: string) => {
    if (!config) return
    setConfig({
      ...config,
      defaultMethod: value,
    })
  }

  // AI 평가 모델 업데이트
  const handleModelChange = (value: string) => {
    if (!config) return
    setConfig({
      ...config,
      aiEvaluator: {
        ...config.aiEvaluator,
        model: value,
      },
    })
  }

  // AI 평가 프롬프트 업데이트
  const handlePromptChange = (value: string) => {
    if (!config) return
    setConfig({
      ...config,
      aiEvaluator: {
        ...config.aiEvaluator,
        prompt: value,
      },
    })
  }

  // 온도 업데이트
  const handleTemperatureChange = (value: number[]) => {
    if (!config) return
    setConfig({
      ...config,
      aiEvaluator: {
        ...config.aiEvaluator,
        temperature: value[0],
      },
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">설정을 로드할 수 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>품질 평가 설정</CardTitle>
          <CardDescription>품질 평가 방법 및 지표 설정</CardDescription>
        </div>
        <Button onClick={handleSaveConfig} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          설정 저장
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">일반 설정</TabsTrigger>
            <TabsTrigger value="metrics">지표 설정</TabsTrigger>
            <TabsTrigger value="ai">AI 평가 설정</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="space-y-4">
              <div>
                <Label htmlFor="defaultMethod">기본 평가 방법</Label>
                <Select value={config.defaultMethod} onValueChange={handleDefaultMethodChange}>
                  <SelectTrigger id="defaultMethod">
                    <SelectValue placeholder="평가 방법 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">AI 평가</SelectItem>
                    <SelectItem value="rule">규칙 기반 평가</SelectItem>
                    <SelectItem value="hybrid">하이브리드 평가</SelectItem>
                    <SelectItem value="human">사람 평가</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="space-y-6">
              {config.metrics &&
                Object.entries(config.metrics).map(([metric, settings]: [string, any]) => {
                  const metricName =
                    {
                      relevance: "관련성",
                      accuracy: "정확성",
                      completeness: "완전성",
                      clarity: "명확성",
                      helpfulness: "유용성",
                      conciseness: "간결성",
                      tone: "어조",
                    }[metric] || metric

                  return (
                    <div key={metric} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>{metricName}</Label>
                        <span className="text-xs text-muted-foreground">{settings.description}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">가중치</span>
                            <span className="text-sm font-medium">{settings.weight.toFixed(2)}</span>
                          </div>
                          <Slider
                            value={[settings.weight]}
                            min={0}
                            max={1}
                            step={0.05}
                            onValueChange={(value) => handleWeightChange(metric, value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">임계값</span>
                            <span className="text-sm font-medium">{settings.threshold.toFixed(1)}</span>
                          </div>
                          <Slider
                            value={[settings.threshold]}
                            min={0}
                            max={10}
                            step={0.5}
                            onValueChange={(value) => handleThresholdChange(metric, value)}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="space-y-4">
              <div>
                <Label htmlFor="aiModel">AI 평가 모델</Label>
                <Select value={config.aiEvaluator.model} onValueChange={handleModelChange}>
                  <SelectTrigger id="aiModel">
                    <SelectValue placeholder="모델 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                    <SelectItem value="gemini-2.0-pro">Gemini 2.0 Pro</SelectItem>
                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="temperature">온도</Label>
                  <span className="text-sm font-medium">{config.aiEvaluator.temperature.toFixed(2)}</span>
                </div>
                <Slider
                  id="temperature"
                  value={[config.aiEvaluator.temperature]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={handleTemperatureChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">평가 프롬프트</Label>
                <Textarea
                  id="prompt"
                  value={config.aiEvaluator.prompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  &#123;&#123;userMessage&#125;&#125;, &#123;&#123;botResponse&#125;&#125;,
                  &#123;&#123;detectedIntent&#125;&#125; 변수를 사용하여 평가 프롬프트를 작성하세요.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
