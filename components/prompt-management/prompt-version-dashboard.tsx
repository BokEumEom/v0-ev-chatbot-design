"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PromptVersionHistory } from "./prompt-version-history"
import { PromptVersionDetails } from "./prompt-version-details"
import { PromptVersionComparison } from "./prompt-version-comparison"
import { PromptDeploymentManager } from "./prompt-deployment-manager"
import { PromptVersionCreator } from "./prompt-version-creator"
import { PromptPerformanceMetrics } from "./prompt-performance-metrics"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import type { PromptVersion, PromptVersionMetrics } from "@/types/prompt-management"

// 샘플 데이터
const sampleVersions: PromptVersion[] = [
  {
    id: "v1",
    name: "기본 프롬프트",
    version: "1.0.0",
    description: "EV 충전소 챗봇의 기본 프롬프트",
    createdAt: "2023-01-15T09:00:00Z",
    createdBy: "김개발",
    systemPrompt: "당신은 전기차 충전소 정보를 제공하는 AI 어시스턴트입니다...",
    targetIntents: ["충전소 찾기", "충전 상태", "요금 정보"],
    changeLog: "초기 버전",
    status: "active",
    performance: {
      qualityScore: 8.5,
      userRating: 4.2,
      latency: 450,
      tokenUsage: 320,
      intentSuccessRates: {
        "충전소 찾기": 0.92,
        "충전 상태": 0.85,
        "요금 정보": 0.88,
      },
      sampleSize: 1250,
      lastUpdated: "2023-02-01T15:30:00Z",
    },
  },
  {
    id: "v2",
    name: "개선된 프롬프트",
    version: "1.1.0",
    description: "충전소 찾기 기능 개선",
    createdAt: "2023-02-20T10:15:00Z",
    createdBy: "이엔지니어",
    baseVersion: "v1",
    systemPrompt: "당신은 전기차 충전소 정보를 제공하는 AI 어시스턴트입니다. 사용자의 위치를 기반으로...",
    targetIntents: ["충전소 찾기", "충전 상태", "요금 정보", "문제 해결"],
    changeLog: "충전소 찾기 인텐트 개선, 문제 해결 인텐트 추가",
    status: "testing",
    performance: {
      qualityScore: 8.9,
      userRating: 4.5,
      latency: 420,
      tokenUsage: 350,
      intentSuccessRates: {
        "충전소 찾기": 0.95,
        "충전 상태": 0.87,
        "요금 정보": 0.89,
        "문제 해결": 0.82,
      },
      sampleSize: 850,
      lastUpdated: "2023-03-05T11:45:00Z",
    },
  },
]

// 샘플 성능 지표 데이터
const sampleMetrics: PromptVersionMetrics = {
  dailyMetrics: [
    { date: "2023-03-01", accuracy: 0.82, latency: 430, satisfaction: 0.85 },
    { date: "2023-03-02", accuracy: 0.84, latency: 425, satisfaction: 0.86 },
    { date: "2023-03-03", accuracy: 0.83, latency: 440, satisfaction: 0.84 },
    { date: "2023-03-04", accuracy: 0.85, latency: 420, satisfaction: 0.87 },
    { date: "2023-03-05", accuracy: 0.87, latency: 415, satisfaction: 0.88 },
    { date: "2023-03-06", accuracy: 0.86, latency: 410, satisfaction: 0.89 },
    { date: "2023-03-07", accuracy: 0.88, latency: 405, satisfaction: 0.9 },
  ],
  intentMetrics: {
    "충전소 찾기": { accuracy: 0.95 },
    "충전 상태": { accuracy: 0.87 },
    "요금 정보": { accuracy: 0.89 },
    "문제 해결": { accuracy: 0.82 },
    예약: { accuracy: 0.78 },
  },
}

export function PromptVersionDashboard() {
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(
    sampleVersions.length > 0 ? sampleVersions[0] : null,
  )
  const [compareVersion, setCompareVersion] = useState<PromptVersion | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const handleSelectVersion = (version: PromptVersion) => {
    setSelectedVersion(version)
  }

  const handleCompareVersion = (version: PromptVersion) => {
    setCompareVersion(version)
  }

  const handleVersionDeployed = (versionId: string) => {
    // 실제 구현에서는 API 호출 및 상태 업데이트
    console.log(`버전 ${versionId} 배포됨`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">프롬프트 버전 관리</h1>
          <p className="text-muted-foreground">시스템 프롬프트 버전을 관리하고 성능을 분석합니다</p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />새 프롬프트 버전
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <PromptVersionCreator baseVersions={sampleVersions} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PromptVersionHistory
          versions={sampleVersions}
          onSelectVersion={handleSelectVersion}
          onCompareVersion={handleCompareVersion}
          selectedVersionId={selectedVersion?.id}
        />

        <PromptPerformanceMetrics metrics={sampleMetrics} />
      </div>

      <Tabs defaultValue="details" className="mt-6">
        <TabsList>
          <TabsTrigger value="details">버전 상세</TabsTrigger>
          <TabsTrigger value="compare" disabled={!compareVersion}>
            버전 비교
          </TabsTrigger>
          <TabsTrigger value="deploy">배포 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          {selectedVersion ? (
            <PromptVersionDetails version={selectedVersion} />
          ) : (
            <div className="text-center p-6 text-muted-foreground">버전을 선택하여 상세 정보를 확인하세요.</div>
          )}
        </TabsContent>

        <TabsContent value="compare">
          {selectedVersion && compareVersion ? (
            <PromptVersionComparison baseVersion={selectedVersion} comparisonVersion={compareVersion} />
          ) : (
            <div className="text-center p-6 text-muted-foreground">비교할 두 버전을 선택하세요.</div>
          )}
        </TabsContent>

        <TabsContent value="deploy">
          <PromptDeploymentManager
            versions={sampleVersions}
            selectedVersion={selectedVersion}
            onVersionDeployed={handleVersionDeployed}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
