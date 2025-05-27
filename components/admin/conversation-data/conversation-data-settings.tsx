"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, RotateCcw } from "lucide-react"
import type { PatternExtractionConfig } from "@/types/conversation-data-processor"

interface ConversationDataSettingsProps {
  config: PatternExtractionConfig
  setConfig: (config: PatternExtractionConfig) => void
  onAnalyze: () => void
  loading: boolean
}

export function ConversationDataSettings({ config, setConfig, onAnalyze, loading }: ConversationDataSettingsProps) {
  // 설정 변경 핸들러
  const handleConfigChange = (key: keyof PatternExtractionConfig, value: any) => {
    setConfig({ ...config, [key]: value })
  }

  // 설정 초기화
  const resetConfig = () => {
    setConfig({
      minFrequency: 3,
      maxPatterns: 50,
      similarityThreshold: 0.5,
      includeEntities: true,
      includeIntents: true,
      includeSentiment: true,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>패턴 추출 설정</CardTitle>
          <CardDescription>대화 데이터에서 패턴을 추출하는 방법을 구성합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="minFrequency">최소 빈도</Label>
              <div className="flex items-center space-x-4 mt-1">
                <Slider
                  id="minFrequency"
                  min={1}
                  max={10}
                  step={1}
                  value={[config.minFrequency]}
                  onValueChange={(value) => handleConfigChange("minFrequency", value[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={config.minFrequency}
                  onChange={(e) => handleConfigChange("minFrequency", Number.parseInt(e.target.value) || 1)}
                  className="w-16"
                  min={1}
                  max={10}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">패턴으로 간주되기 위한 최소 발생 횟수</p>
            </div>

            <div>
              <Label htmlFor="maxPatterns">최대 패턴 수</Label>
              <div className="flex items-center space-x-4 mt-1">
                <Slider
                  id="maxPatterns"
                  min={10}
                  max={200}
                  step={10}
                  value={[config.maxPatterns]}
                  onValueChange={(value) => handleConfigChange("maxPatterns", value[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={config.maxPatterns}
                  onChange={(e) => handleConfigChange("maxPatterns", Number.parseInt(e.target.value) || 10)}
                  className="w-16"
                  min={10}
                  max={200}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">추출할 최대 패턴 수</p>
            </div>

            <div>
              <Label htmlFor="similarityThreshold">유사도 임계값</Label>
              <div className="flex items-center space-x-4 mt-1">
                <Slider
                  id="similarityThreshold"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={[config.similarityThreshold]}
                  onValueChange={(value) => handleConfigChange("similarityThreshold", value[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={config.similarityThreshold}
                  onChange={(e) => handleConfigChange("similarityThreshold", Number.parseFloat(e.target.value) || 0.1)}
                  className="w-16"
                  min={0.1}
                  max={1}
                  step={0.05}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                패턴을 그룹화하기 위한 유사도 임계값 (높을수록 더 엄격함)
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">포함 데이터</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="includeEntities">엔티티 포함</Label>
                <p className="text-xs text-muted-foreground">패턴에 엔티티 정보 포함</p>
              </div>
              <Switch
                id="includeEntities"
                checked={config.includeEntities}
                onCheckedChange={(checked) => handleConfigChange("includeEntities", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="includeIntents">의도 포함</Label>
                <p className="text-xs text-muted-foreground">패턴에 의도 정보 포함</p>
              </div>
              <Switch
                id="includeIntents"
                checked={config.includeIntents}
                onCheckedChange={(checked) => handleConfigChange("includeIntents", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="includeSentiment">감정 포함</Label>
                <p className="text-xs text-muted-foreground">패턴에 감정 정보 포함</p>
              </div>
              <Switch
                id="includeSentiment"
                checked={config.includeSentiment}
                onCheckedChange={(checked) => handleConfigChange("includeSentiment", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={resetConfig} disabled={loading}>
          <RotateCcw className="h-4 w-4 mr-2" />
          기본값으로 재설정
        </Button>
        <Button onClick={onAnalyze} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              설정 저장 및 분석
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
