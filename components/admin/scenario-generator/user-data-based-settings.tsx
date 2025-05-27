"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, Database, Sparkles, BarChart3 } from "lucide-react"
import type { ScenarioGenerationFromDataConfig, PatternExtractionConfig } from "@/types/conversation-data-processor"

interface UserDataBasedSettingsProps {
  onGenerate: (config: ScenarioGenerationFromDataConfig) => void
  loading: boolean
  clusters: { id: string; name: string }[]
}

export function UserDataBasedSettings({ onGenerate, loading, clusters }: UserDataBasedSettingsProps) {
  // 패턴 추출 설정
  const [patternConfig, setPatternConfig] = useState<PatternExtractionConfig>({
    minFrequency: 3,
    maxPatterns: 50,
    similarityThreshold: 0.5,
    includeEntities: true,
    includeIntents: true,
    includeSentiment: true,
  })

  // 시나리오 생성 설정
  const [scenarioConfig, setScenarioConfig] = useState({
    targetClusterIds: [] as string[],
    targetPatternIds: [] as string[],
    minResolutionRate: 0.6,
    minSatisfactionScore: 3.5,
    maxScenarios: 10,
    balanceCategories: true,
    includeRarePatterns: false,
    enrichWithAI: true,
  })

  // 설정 변경 핸들러
  const handlePatternConfigChange = (key: keyof PatternExtractionConfig, value: any) => {
    setPatternConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleScenarioConfigChange = (key: keyof typeof scenarioConfig, value: any) => {
    setScenarioConfig((prev) => ({ ...prev, [key]: value }))
  }

  // 클러스터 선택 토글
  const toggleCluster = (clusterId: string) => {
    setScenarioConfig((prev) => {
      const currentIds = [...prev.targetClusterIds]
      if (currentIds.includes(clusterId)) {
        return { ...prev, targetClusterIds: currentIds.filter((id) => id !== clusterId) }
      } else {
        return { ...prev, targetClusterIds: [...currentIds, clusterId] }
      }
    })
  }

  // 시나리오 생성 시작
  const startGeneration = () => {
    const config: ScenarioGenerationFromDataConfig = {
      patternExtractionConfig: patternConfig,
      targetClusterIds: scenarioConfig.targetClusterIds.length > 0 ? scenarioConfig.targetClusterIds : undefined,
      targetPatternIds: scenarioConfig.targetPatternIds.length > 0 ? scenarioConfig.targetPatternIds : undefined,
      minResolutionRate: scenarioConfig.minResolutionRate,
      minSatisfactionScore: scenarioConfig.minSatisfactionScore,
      maxScenarios: scenarioConfig.maxScenarios,
      balanceCategories: scenarioConfig.balanceCategories,
      includeRarePatterns: scenarioConfig.includeRarePatterns,
      enrichWithAI: scenarioConfig.enrichWithAI,
    }

    onGenerate(config)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>사용자 대화 데이터 기반 시나리오 생성</CardTitle>
        <CardDescription>실제 사용자 대화 패턴을 분석하여 현실적인 시나리오를 생성합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="basic">기본 설정</TabsTrigger>
            <TabsTrigger value="advanced">고급 설정</TabsTrigger>
            <TabsTrigger value="clusters">클러스터 선택</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxScenarios">최대 시나리오 수</Label>
                  <span className="text-sm text-muted-foreground">{scenarioConfig.maxScenarios}개</span>
                </div>
                <Slider
                  id="maxScenarios"
                  min={1}
                  max={30}
                  step={1}
                  value={[scenarioConfig.maxScenarios]}
                  onValueChange={(value) => handleScenarioConfigChange("maxScenarios", value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="minResolutionRate">최소 해결률</Label>
                  <span className="text-sm text-muted-foreground">
                    {(scenarioConfig.minResolutionRate * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  id="minResolutionRate"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[scenarioConfig.minResolutionRate]}
                  onValueChange={(value) => handleScenarioConfigChange("minResolutionRate", value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="minSatisfactionScore">최소 만족도 점수</Label>
                  <span className="text-sm text-muted-foreground">
                    {scenarioConfig.minSatisfactionScore.toFixed(1)}/5
                  </span>
                </div>
                <Slider
                  id="minSatisfactionScore"
                  min={1}
                  max={5}
                  step={0.5}
                  value={[scenarioConfig.minSatisfactionScore]}
                  onValueChange={(value) => handleScenarioConfigChange("minSatisfactionScore", value[0])}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="balanceCategories">카테고리 균형 조정</Label>
                    <p className="text-sm text-muted-foreground">다양한 카테고리의 시나리오를 균등하게 생성합니다.</p>
                  </div>
                  <Switch
                    id="balanceCategories"
                    checked={scenarioConfig.balanceCategories}
                    onCheckedChange={(value) => handleScenarioConfigChange("balanceCategories", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enrichWithAI">AI 강화</Label>
                    <p className="text-sm text-muted-foreground">
                      AI를 활용하여 패턴 기반 시나리오를 풍부하게 만듭니다.
                    </p>
                  </div>
                  <Switch
                    id="enrichWithAI"
                    checked={scenarioConfig.enrichWithAI}
                    onCheckedChange={(value) => handleScenarioConfigChange("enrichWithAI", value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="minFrequency">최소 패턴 빈도</Label>
                  <span className="text-sm text-muted-foreground">{patternConfig.minFrequency}회 이상</span>
                </div>
                <Slider
                  id="minFrequency"
                  min={1}
                  max={10}
                  step={1}
                  value={[patternConfig.minFrequency]}
                  onValueChange={(value) => handlePatternConfigChange("minFrequency", value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxPatterns">최대 패턴 수</Label>
                  <span className="text-sm text-muted-foreground">{patternConfig.maxPatterns}개</span>
                </div>
                <Slider
                  id="maxPatterns"
                  min={10}
                  max={100}
                  step={10}
                  value={[patternConfig.maxPatterns]}
                  onValueChange={(value) => handlePatternConfigChange("maxPatterns", value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="similarityThreshold">유사도 임계값</Label>
                  <span className="text-sm text-muted-foreground">
                    {(patternConfig.similarityThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  id="similarityThreshold"
                  min={0.1}
                  max={0.9}
                  step={0.1}
                  value={[patternConfig.similarityThreshold]}
                  onValueChange={(value) => handlePatternConfigChange("similarityThreshold", value[0])}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="includeEntities">엔티티 포함</Label>
                    <p className="text-sm text-muted-foreground">패턴에서 추출된 엔티티를 시나리오에 포함합니다.</p>
                  </div>
                  <Switch
                    id="includeEntities"
                    checked={patternConfig.includeEntities}
                    onCheckedChange={(value) => handlePatternConfigChange("includeEntities", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="includeRarePatterns">희귀 패턴 포함</Label>
                    <p className="text-sm text-muted-foreground">빈도가 낮은 희귀 패턴도 시나리오에 포함합니다.</p>
                  </div>
                  <Switch
                    id="includeRarePatterns"
                    checked={scenarioConfig.includeRarePatterns}
                    onCheckedChange={(value) => handleScenarioConfigChange("includeRarePatterns", value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clusters" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>클러스터 선택 (선택 사항)</Label>
              <p className="text-sm text-muted-foreground">
                특정 클러스터의 패턴만 사용하여 시나리오를 생성합니다. 선택하지 않으면 모든 클러스터를 사용합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {clusters.map((cluster) => (
                <Button
                  key={cluster.id}
                  variant={scenarioConfig.targetClusterIds.includes(cluster.id) ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => toggleCluster(cluster.id)}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {cluster.name}
                </Button>
              ))}
            </div>

            {clusters.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                사용 가능한 클러스터가 없습니다. 먼저 대화 데이터를 분석하세요.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Database className="mr-2 h-4 w-4" />
          사용자 대화 데이터 기반
        </div>
        <Button onClick={startGeneration} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              시나리오 생성
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
