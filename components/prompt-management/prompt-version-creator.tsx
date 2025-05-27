"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { PromptVersion } from "@/types/prompt-management"

interface PromptVersionCreatorProps {
  baseVersions: PromptVersion[]
}

export function PromptVersionCreator({ baseVersions }: PromptVersionCreatorProps) {
  const [loading, setLoading] = useState(false)
  const [baseVersionId, setBaseVersionId] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    description: "",
    systemPrompt: "",
    changeLog: "",
    targetIntents: [] as string[],
  })

  // 기반 버전 변경 시 프롬프트 내용 로드
  useEffect(() => {
    if (baseVersionId) {
      const baseVersion = baseVersions.find((v) => v.id === baseVersionId)
      if (baseVersion) {
        setFormData({
          ...formData,
          systemPrompt: baseVersion.systemPrompt,
          targetIntents: [...baseVersion.targetIntents],
        })
      }
    }
  }, [baseVersionId, baseVersions, formData])

  // 폼 입력 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // 인텐트 체크박스 처리
  const handleIntentChange = (intent: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        targetIntents: [...formData.targetIntents, intent],
      })
    } else {
      setFormData({
        ...formData,
        targetIntents: formData.targetIntents.filter((i) => i !== intent),
      })
    }
  }

  // 새 버전 생성 처리
  const handleCreateVersion = async () => {
    try {
      setLoading(true)
      // 실제 구현에서는 API 호출
      console.log("새 버전 생성:", {
        ...formData,
        baseVersion: baseVersionId,
      })

      // 성공 후 폼 초기화
      setFormData({
        name: "",
        version: "",
        description: "",
        systemPrompt: "",
        changeLog: "",
        targetIntents: [],
      })

      // 성공 메시지 표시
      alert("새 프롬프트 버전이 생성되었습니다.")
    } catch (error) {
      console.error("버전 생성 오류:", error)
      alert("버전 생성 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 사용 가능한 인텐트 목록 (실제 구현에서는 API에서 가져올 수 있음)
  const availableIntents = [
    "charger_issue",
    "usage_guide",
    "find_charger",
    "payment_issue",
    "charging_history",
    "pricing_inquiry",
    "membership_inquiry",
    "general_inquiry",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>새 프롬프트 버전 생성</CardTitle>
        <CardDescription>새로운 프롬프트 버전을 생성하여 테스트하고 배포할 수 있습니다</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="prompt">프롬프트 내용</TabsTrigger>
            <TabsTrigger value="intents">대상 인텐트</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="baseVersion">기반 버전</Label>
                <Select value={baseVersionId} onValueChange={setBaseVersionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="기반이 될 버전 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">새로 작성</SelectItem>
                    {baseVersions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        {version.name} (v{version.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  기존 버전을 기반으로 시작하거나, 새로 작성할 수 있습니다
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="프롬프트 버전 이름"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="version">버전 번호</Label>
                <Input
                  id="version"
                  name="version"
                  value={formData.version}
                  onChange={handleInputChange}
                  placeholder="예: 1.0.0"
                />
                <p className="text-sm text-muted-foreground">시맨틱 버전 형식 사용 (예: 1.0.0)</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="이 버전의 목적과 특징"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="changeLog">변경 내역</Label>
                <Textarea
                  id="changeLog"
                  name="changeLog"
                  value={formData.changeLog}
                  onChange={handleInputChange}
                  placeholder="이전 버전과의 차이점 및 변경 사항"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="systemPrompt">시스템 프롬프트</Label>
              <Textarea
                id="systemPrompt"
                name="systemPrompt"
                value={formData.systemPrompt}
                onChange={handleInputChange}
                placeholder="AI 모델에 전달할 시스템 프롬프트 내용"
                className="font-mono text-sm"
                rows={20}
              />
            </div>
          </TabsContent>

          <TabsContent value="intents" className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label>대상 인텐트</Label>
              <div className="grid grid-cols-2 gap-4">
                {availableIntents.map((intent) => (
                  <div key={intent} className="flex items-center space-x-2">
                    <Checkbox
                      id={`intent-${intent}`}
                      checked={formData.targetIntents.includes(intent)}
                      onCheckedChange={(checked) => handleIntentChange(intent, checked as boolean)}
                    />
                    <Label htmlFor={`intent-${intent}`} className="cursor-pointer">
                      {intent}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">이 프롬프트가 처리할 인텐트를 선택하세요</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleCreateVersion}
            disabled={
              loading ||
              !formData.name ||
              !formData.version ||
              !formData.systemPrompt ||
              formData.targetIntents.length === 0
            }
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            버전 생성
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
