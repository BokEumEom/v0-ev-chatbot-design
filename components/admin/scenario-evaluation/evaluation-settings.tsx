"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

interface EvaluationSettingsProps {
  onEvaluate: () => void
  isLoading: boolean
}

export function EvaluationSettings({ onEvaluate, isLoading }: EvaluationSettingsProps) {
  const [selectedSource, setSelectedSource] = useState("all")
  const [thresholds, setThresholds] = useState({
    naturalness: 70,
    problemSolving: 70,
    detail: 70,
    accuracy: 70,
    userFriendliness: 70,
    diversity: 70,
  })
  const [useAI, setUseAI] = useState(true)
  const [useRules, setUseRules] = useState(true)
  const [useHybrid, setUseHybrid] = useState(true)

  const handleThresholdChange = (name: keyof typeof thresholds, value: number[]) => {
    setThresholds((prev) => ({ ...prev, [name]: value[0] }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>평가 대상 선택</CardTitle>
          <CardDescription>평가할 시나리오 소스를 선택하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="source">시나리오 소스</Label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger id="source">
                  <SelectValue placeholder="소스 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 시나리오</SelectItem>
                  <SelectItem value="user-data">사용자 데이터 기반</SelectItem>
                  <SelectItem value="manual">수동 생성</SelectItem>
                  <SelectItem value="ai-generated">AI 생성</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="count">평가할 시나리오 수</Label>
              <Input id="count" type="number" defaultValue="5" min="1" max="20" />
            </div>

            <div>
              <Label htmlFor="batch">배치 ID (선택사항)</Label>
              <Input id="batch" placeholder="특정 배치 ID 입력" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>평가 방법 설정</CardTitle>
          <CardDescription>시나리오 평가에 사용할 방법을 선택하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="methods">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="methods">평가 방법</TabsTrigger>
              <TabsTrigger value="thresholds">품질 임계값</TabsTrigger>
            </TabsList>

            <TabsContent value="methods" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-evaluation">AI 기반 평가</Label>
                    <p className="text-sm text-muted-foreground">Gemini를 사용하여 시나리오 품질을 평가합니다</p>
                  </div>
                  <Switch id="ai-evaluation" checked={useAI} onCheckedChange={setUseAI} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="rule-evaluation">규칙 기반 평가</Label>
                    <p className="text-sm text-muted-foreground">사전 정의된 규칙을 사용하여 시나리오를 평가합니다</p>
                  </div>
                  <Switch id="rule-evaluation" checked={useRules} onCheckedChange={setUseRules} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="hybrid-evaluation">하이브리드 평가</Label>
                    <p className="text-sm text-muted-foreground">
                      AI와 규칙 기반 평가를 결합하여 더 정확한 결과를 제공합니다
                    </p>
                  </div>
                  <Switch id="hybrid-evaluation" checked={useHybrid} onCheckedChange={setUseHybrid} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="thresholds" className="space-y-4 pt-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="naturalness">자연스러움 임계값: {thresholds.naturalness}</Label>
                    <span className="text-sm text-muted-foreground">{thresholds.naturalness}/100</span>
                  </div>
                  <Slider
                    id="naturalness"
                    min={0}
                    max={100}
                    step={1}
                    value={[thresholds.naturalness]}
                    onValueChange={(value) => handleThresholdChange("naturalness", value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="problemSolving">문제 해결력 임계값: {thresholds.problemSolving}</Label>
                    <span className="text-sm text-muted-foreground">{thresholds.problemSolving}/100</span>
                  </div>
                  <Slider
                    id="problemSolving"
                    min={0}
                    max={100}
                    step={1}
                    value={[thresholds.problemSolving]}
                    onValueChange={(value) => handleThresholdChange("problemSolving", value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="detail">상세함 임계값: {thresholds.detail}</Label>
                    <span className="text-sm text-muted-foreground">{thresholds.detail}/100</span>
                  </div>
                  <Slider
                    id="detail"
                    min={0}
                    max={100}
                    step={1}
                    value={[thresholds.detail]}
                    onValueChange={(value) => handleThresholdChange("detail", value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="accuracy">정확성 임계값: {thresholds.accuracy}</Label>
                    <span className="text-sm text-muted-foreground">{thresholds.accuracy}/100</span>
                  </div>
                  <Slider
                    id="accuracy"
                    min={0}
                    max={100}
                    step={1}
                    value={[thresholds.accuracy]}
                    onValueChange={(value) => handleThresholdChange("accuracy", value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="userFriendliness">사용자 친화성 임계값: {thresholds.userFriendliness}</Label>
                    <span className="text-sm text-muted-foreground">{thresholds.userFriendliness}/100</span>
                  </div>
                  <Slider
                    id="userFriendliness"
                    min={0}
                    max={100}
                    step={1}
                    value={[thresholds.userFriendliness]}
                    onValueChange={(value) => handleThresholdChange("userFriendliness", value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="diversity">다양성 임계값: {thresholds.diversity}</Label>
                    <span className="text-sm text-muted-foreground">{thresholds.diversity}/100</span>
                  </div>
                  <Slider
                    id="diversity"
                    min={0}
                    max={100}
                    step={1}
                    value={[thresholds.diversity]}
                    onValueChange={(value) => handleThresholdChange("diversity", value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={onEvaluate} disabled={isLoading || (!useAI && !useRules && !useHybrid)} className="ml-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                평가 중...
              </>
            ) : (
              <>시나리오 평가 시작</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
