"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import type { PromptVersion, PromptVersionComparison } from "@/types/prompt-management"

// 차이점 하이라이트 컴포넌트
function DiffHighlight({ text, added = false, removed = false }: { text: string; added?: boolean; removed?: boolean }) {
  if (!added && !removed) return <span>{text}</span>

  return (
    <span className={`px-1 rounded ${added ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{text}</span>
  )
}

interface PromptVersionComparisonProps {
  versions: PromptVersion[]
  selectedVersionId: string | null
  comparisonVersionId: string | null
  onSelectComparisonVersion: (id: string | null) => void
}

export function PromptVersionComparison({
  versions,
  selectedVersionId,
  comparisonVersionId,
  onSelectComparisonVersion,
}: PromptVersionComparisonProps) {
  const [loading, setLoading] = useState(false)
  const [comparison, setComparison] = useState<PromptVersionComparison | null>(null)

  // 선택된 버전과 비교 버전 객체
  const selectedVersion = selectedVersionId ? versions.find((v) => v.id === selectedVersionId) || null : null

  const comparisonVersion = comparisonVersionId ? versions.find((v) => v.id === comparisonVersionId) || null : null

  // 비교 데이터 로드
  useEffect(() => {
    async function loadComparison() {
      if (!selectedVersionId || !comparisonVersionId) {
        setComparison(null)
        return
      }

      try {
        setLoading(true)
        // 실제 구현에서는 API 호출
        const response = await fetch(
          `/api/prompt-management/versions/compare?baseId=${selectedVersionId}&compareId=${comparisonVersionId}`,
        )
        const data = await response.json()
        setComparison(data)
      } catch (error) {
        console.error("버전 비교 로드 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    loadComparison()
  }, [selectedVersionId, comparisonVersionId])

  // 성능 차이 계산 (퍼센트)
  const calculateDifference = (current: number, previous: number) => {
    if (previous === 0) return current === 0 ? 0 : 100
    return ((current - previous) / previous) * 100
  }

  if (!selectedVersion) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">비교할 버전을 선택해주세요</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium mb-2">버전 비교</h3>
          <p className="text-muted-foreground">두 프롬프트 버전 간의 차이점을 비교합니다</p>
        </div>

        <Select value={comparisonVersionId || ""} onValueChange={(value) => onSelectComparisonVersion(value || null)}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="비교할 버전 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">비교할 버전 선택</SelectItem>
            {versions
              .filter((v) => v.id !== selectedVersionId)
              .map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  {version.name} (v{version.version})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {!comparisonVersionId ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">비교할 버전을 선택해주세요</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !comparison ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">비교 데이터를 불러오는 중 오류가 발생했습니다</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">기준 버전</CardTitle>
                <CardDescription>
                  {selectedVersion.name} (v{selectedVersion.version})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      생성일
                    </Badge>
                    <span>{new Date(selectedVersion.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      상태
                    </Badge>
                    <span>{selectedVersion.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">비교 버전</CardTitle>
                <CardDescription>
                  {comparisonVersion?.name} (v{comparisonVersion?.version})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      생성일
                    </Badge>
                    <span>{new Date(comparisonVersion?.createdAt || "").toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      상태
                    </Badge>
                    <span>{comparisonVersion?.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {comparison.performance && (
            <Card>
              <CardHeader>
                <CardTitle>성능 비교</CardTitle>
                <CardDescription>두 버전 간의 성능 지표 차이</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">품질 점수</h4>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold">{comparison.performance.qualityScore.toFixed(1)}</span>
                      {comparison.baseVersion.performance && (
                        <span
                          className={`text-sm ${
                            comparison.performance.qualityScore >= comparison.baseVersion.performance.qualityScore
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {comparison.performance.qualityScore >= comparison.baseVersion.performance.qualityScore
                            ? "+"
                            : ""}
                          {calculateDifference(
                            comparison.performance.qualityScore,
                            comparison.baseVersion.performance.qualityScore,
                          ).toFixed(1)}
                          %
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">사용자 평가</h4>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold">{comparison.performance.userRating.toFixed(1)}</span>
                      {comparison.baseVersion.performance && (
                        <span
                          className={`text-sm ${
                            comparison.performance.userRating >= comparison.baseVersion.performance.userRating
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {comparison.performance.userRating >= comparison.baseVersion.performance.userRating
                            ? "+"
                            : ""}
                          {calculateDifference(
                            comparison.performance.userRating,
                            comparison.baseVersion.performance.userRating,
                          ).toFixed(1)}
                          %
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">응답 시간</h4>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold">{comparison.performance.latency.toFixed(0)} ms</span>
                      {comparison.baseVersion.performance && (
                        <span
                          className={`text-sm ${
                            comparison.performance.latency <= comparison.baseVersion.performance.latency
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {comparison.performance.latency <= comparison.baseVersion.performance.latency ? "" : "+"}
                          {calculateDifference(
                            comparison.performance.latency,
                            comparison.baseVersion.performance.latency,
                          ).toFixed(1)}
                          %
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">토큰 사용량</h4>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold">{comparison.performance.tokenUsage}</span>
                      {comparison.baseVersion.performance && (
                        <span
                          className={`text-sm ${
                            comparison.performance.tokenUsage <= comparison.baseVersion.performance.tokenUsage
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {comparison.performance.tokenUsage <= comparison.baseVersion.performance.tokenUsage
                            ? ""
                            : "+"}
                          {calculateDifference(
                            comparison.performance.tokenUsage,
                            comparison.baseVersion.performance.tokenUsage,
                          ).toFixed(1)}
                          %
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="prompt">
            <TabsList>
              <TabsTrigger value="prompt">시스템 프롬프트 비교</TabsTrigger>
              <TabsTrigger value="modules">모듈 비교</TabsTrigger>
            </TabsList>

            <TabsContent value="prompt" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>시스템 프롬프트 비교</CardTitle>
                  <CardDescription>두 버전 간의 시스템 프롬프트 차이점</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[500px]">
                    {comparison.differences.systemPrompt.map((line, index) => {
                      if (line.startsWith("+")) {
                        return (
                          <div key={index} className="bg-green-50 text-green-800">
                            {line}
                          </div>
                        )
                      } else if (line.startsWith("-")) {
                        return (
                          <div key={index} className="bg-red-50 text-red-800">
                            {line}
                          </div>
                        )
                      }
                      return <div key={index}>{line}</div>
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="modules" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>모듈 비교</CardTitle>
                  <CardDescription>두 버전 간의 프롬프트 모듈 차이점</CardDescription>
                </CardHeader>
                <CardContent>
                  {comparison.differences.modules && Object.keys(comparison.differences.modules).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(comparison.differences.modules).map(([name, diffLines]) => (
                        <div key={name} className="border rounded-md">
                          <div className="bg-muted px-4 py-2 font-medium border-b rounded-t-md">{name}</div>
                          <div className="p-4">
                            <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-3 rounded-md">
                              {diffLines.map((line, index) => {
                                if (line.startsWith("+")) {
                                  return (
                                    <div key={index} className="bg-green-50 text-green-800">
                                      {line}
                                    </div>
                                  )
                                } else if (line.startsWith("-")) {
                                  return (
                                    <div key={index} className="bg-red-50 text-red-800">
                                      {line}
                                    </div>
                                  )
                                }
                                return <div key={index}>{line}</div>
                              })}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      모듈 차이점이 없거나 모듈이 정의되지 않았습니다
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
