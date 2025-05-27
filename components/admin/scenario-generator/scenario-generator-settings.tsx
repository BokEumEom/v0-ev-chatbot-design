"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import type { ScenarioGenerationSettings } from "@/types/scenario-generator"
import { Loader2 } from "lucide-react"

interface ScenarioGeneratorSettingsProps {
  onGenerate: (settings: ScenarioGenerationSettings) => Promise<void>
  isGenerating: boolean
}

export function ScenarioGeneratorSettings({ onGenerate, isGenerating }: ScenarioGeneratorSettingsProps) {
  const [settings, setSettings] = useState<ScenarioGenerationSettings>({
    category: "",
    topic: "",
    complexity: "medium",
    userType: "intermediate",
    conversationTurns: 3,
    includeEntities: true,
    includeNotes: true,
    specificRequirements: "",
  })

  const handleChange = (field: keyof ScenarioGenerationSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate(settings)
  }

  const categoryOptions = [
    { value: "충전소 찾기", label: "충전소 찾기" },
    { value: "충전 방법", label: "충전 방법" },
    { value: "결제 및 요금", label: "결제 및 요금" },
    { value: "문제 해결", label: "문제 해결" },
    { value: "계정 관리", label: "계정 관리" },
    { value: "차량 호환성", label: "차량 호환성" },
    { value: "충전 계획", label: "충전 계획" },
    { value: "배터리 관리", label: "배터리 관리" },
    { value: "충전 네트워크", label: "충전 네트워크" },
    { value: "기타", label: "기타" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>시나리오 생성 설정</CardTitle>
        <CardDescription>AI를 활용한 챗봇 시나리오 생성 설정을 구성하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="scenario-generator-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select value={settings.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">주제</Label>
              <Input
                id="topic"
                placeholder="예: 급속 충전소 위치 찾기"
                value={settings.topic}
                onChange={(e) => handleChange("topic", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="complexity">복잡도</Label>
              <Select
                value={settings.complexity}
                onValueChange={(value: "simple" | "medium" | "complex") => handleChange("complexity", value)}
              >
                <SelectTrigger id="complexity">
                  <SelectValue placeholder="복잡도 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">간단 (기본 정보 제공)</SelectItem>
                  <SelectItem value="medium">중간 (여러 정보 요소, 컨텍스트 유지)</SelectItem>
                  <SelectItem value="complex">복잡 (다중 주제, 깊은 컨텍스트, 문제 해결)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">사용자 유형</Label>
              <Select
                value={settings.userType}
                onValueChange={(value: "beginner" | "intermediate" | "expert") => handleChange("userType", value)}
              >
                <SelectTrigger id="userType">
                  <SelectValue placeholder="사용자 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">초보자 (경험 없음, 기본 용어 설명 필요)</SelectItem>
                  <SelectItem value="intermediate">중급자 (기본 경험 있음, 일부 전문 용어 이해)</SelectItem>
                  <SelectItem value="expert">전문가 (풍부한 경험, 기술적 세부사항 이해)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="conversationTurns">대화 턴 수: {settings.conversationTurns}</Label>
              <span className="text-sm text-muted-foreground">(1-5)</span>
            </div>
            <Slider
              id="conversationTurns"
              min={1}
              max={5}
              step={1}
              value={[settings.conversationTurns]}
              onValueChange={(value) => handleChange("conversationTurns", value[0])}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="includeEntities"
                checked={settings.includeEntities}
                onCheckedChange={(checked) => handleChange("includeEntities", checked)}
              />
              <Label htmlFor="includeEntities">엔티티 포함</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="includeNotes"
                checked={settings.includeNotes}
                onCheckedChange={(checked) => handleChange("includeNotes", checked)}
              />
              <Label htmlFor="includeNotes">처리 특징 설명 포함</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specificRequirements">특별 요구사항 (선택사항)</Label>
            <Textarea
              id="specificRequirements"
              placeholder="특별히 포함되어야 할 내용이나 상황을 설명하세요."
              value={settings.specificRequirements}
              onChange={(e) => handleChange("specificRequirements", e.target.value)}
              rows={3}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="scenario-generator-form"
          disabled={isGenerating || !settings.category || !settings.topic}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              시나리오 생성 중...
            </>
          ) : (
            "시나리오 생성"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
