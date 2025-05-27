"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit, Copy, Archive, Clock, User, GitBranch, BarChart } from "lucide-react"
import type { PromptVersion, PromptVersionStatus } from "@/types/prompt-management"
import { PromptPerformanceMetrics } from "./prompt-performance-metrics"

// 상태별 배지 스타일
const statusBadgeStyles: Record<PromptVersionStatus, string> = {
  draft: "bg-gray-200 text-gray-800",
  testing: "bg-blue-200 text-blue-800",
  active: "bg-green-200 text-green-800",
  inactive: "bg-yellow-200 text-yellow-800",
  archived: "bg-red-200 text-red-800",
}

// 상태별 한글 표시
const statusLabels: Record<PromptVersionStatus, string> = {
  draft: "초안",
  testing: "테스트 중",
  active: "활성",
  inactive: "비활성",
  archived: "보관됨",
}

interface PromptVersionDetailsProps {
  version: PromptVersion
}

export function PromptVersionDetails({ version }: PromptVersionDetailsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState(version.systemPrompt)
  const [editedDescription, setEditedDescription] = useState(version.description)
  const [editedChangeLog, setEditedChangeLog] = useState(version.changeLog || "")

  // 프롬프트 업데이트 처리
  const handleUpdatePrompt = async () => {
    try {
      // 실제 구현에서는 API 호출
      console.log("프롬프트 업데이트:", {
        id: version.id,
        systemPrompt: editedPrompt,
        description: editedDescription,
        changeLog: editedChangeLog,
      })

      // 성공 메시지
      alert("프롬프트가 업데이트되었습니다.")
      setEditDialogOpen(false)
    } catch (error) {
      console.error("프롬프트 업데이트 오류:", error)
      alert("업데이트 중 오류가 발생했습니다.")
    }
  }

  // 프롬프트 복제 처리
  const handleDuplicatePrompt = async () => {
    try {
      // 실제 구현에서는 API 호출
      console.log("프롬프트 복제:", version.id)
      alert("프롬프트가 복제되었습니다.")
    } catch (error) {
      console.error("프롬프트 복제 오류:", error)
      alert("복제 중 오류가 발생했습니다.")
    }
  }

  // 프롬프트 보관 처리
  const handleArchivePrompt = async () => {
    try {
      // 실제 구현에서는 API 호출
      console.log("프롬프트 보관:", version.id)
      alert("프롬프트가 보관되었습니다.")
    } catch (error) {
      console.error("프롬프트 보관 오류:", error)
      alert("보관 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{version.name}</CardTitle>
            <CardDescription className="mt-1">
              버전 {version.version} · {new Date(version.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge className={statusBadgeStyles[version.status]}>{statusLabels[version.status]}</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">설명</h3>
              <p>{version.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">생성일</div>
                  <div>{new Date(version.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">작성자</div>
                  <div>{version.createdBy}</div>
                </div>
              </div>
              {version.baseVersion && (
                <div className="flex items-center">
                  <GitBranch className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">기반 버전</div>
                    <div>{version.baseVersion}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 py-2">
              <h3 className="text-sm font-medium text-muted-foreground w-full mb-1">대상 인텐트</h3>
              {version.targetIntents.map((intent) => (
                <Badge key={intent} variant="outline">
                  {intent}
                </Badge>
              ))}
            </div>

            {version.changeLog && (
              <div className="py-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">변경 내역</h3>
                <div className="whitespace-pre-wrap text-sm bg-muted p-3 rounded-md">{version.changeLog}</div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    편집
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>프롬프트 버전 편집</DialogTitle>
                    <DialogDescription>프롬프트 내용과 메타데이터를 수정합니다</DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="description">설명</Label>
                      <Textarea
                        id="description"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="changeLog">변경 내역</Label>
                      <Textarea
                        id="changeLog"
                        value={editedChangeLog}
                        onChange={(e) => setEditedChangeLog(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="systemPrompt">시스템 프롬프트</Label>
                      <Textarea
                        id="systemPrompt"
                        value={editedPrompt}
                        onChange={(e) => setEditedPrompt(e.target.value)}
                        className="font-mono text-sm"
                        rows={15}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleUpdatePrompt}>저장</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={handleDuplicatePrompt}>
                <Copy className="h-4 w-4 mr-2" />
                복제
              </Button>

              {version.status !== "archived" && (
                <Button variant="outline" onClick={handleArchivePrompt}>
                  <Archive className="h-4 w-4 mr-2" />
                  보관
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="prompt">
        <TabsList>
          <TabsTrigger value="prompt">시스템 프롬프트</TabsTrigger>
          <TabsTrigger value="performance">성능 지표</TabsTrigger>
          <TabsTrigger value="modules">모듈</TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>시스템 프롬프트</CardTitle>
              <CardDescription>AI 모델에 전달되는 시스템 프롬프트 내용</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm font-mono overflow-auto max-h-[500px]">
                {version.systemPrompt}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>성능 지표</CardTitle>
              <CardDescription>이 프롬프트 버전의 성능 측정 결과</CardDescription>
            </CardHeader>
            <CardContent>
              {version.performance ? (
                <PromptPerformanceMetrics metrics={version.performance} />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">성능 데이터 없음</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">
                    이 프롬프트 버전에 대한 성능 데이터가 아직 수집되지 않았습니다. 테스트 환경에 배포하여 데이터를
                    수집해 보세요.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>프롬프트 모듈</CardTitle>
              <CardDescription>재사용 가능한 프롬프트 모듈 구성</CardDescription>
            </CardHeader>
            <CardContent>
              {version.modules && Object.keys(version.modules).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(version.modules).map(([name, content]) => (
                    <div key={name} className="border rounded-md">
                      <div className="bg-muted px-4 py-2 font-medium border-b rounded-t-md">{name}</div>
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap text-sm font-mono">{content}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  이 프롬프트 버전에는 모듈이 정의되어 있지 않습니다
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
