"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Loader2, MoreHorizontal, Play, StopCircle, RefreshCw } from "lucide-react"

interface QualityEvaluationJobsProps {
  promptVersionId: string
}

export function QualityEvaluationJobs({ promptVersionId }: QualityEvaluationJobsProps) {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<any[]>([])

  // 작업 목록 로드
  useEffect(() => {
    if (!promptVersionId) return

    async function loadJobs() {
      try {
        setLoading(true)
        // 실제 구현에서는 API 호출
        // 임시 데이터 설정
        const mockJobs = [
          {
            id: "job_1",
            promptVersionId,
            status: "completed",
            method: "hybrid",
            createdAt: "2023-09-15T10:30:00Z",
            startedAt: "2023-09-15T10:30:05Z",
            completedAt: "2023-09-15T10:35:20Z",
            totalConversations: 50,
            evaluatedConversations: 50,
          },
          {
            id: "job_2",
            promptVersionId,
            status: "in_progress",
            method: "ai",
            createdAt: "2023-09-16T14:20:00Z",
            startedAt: "2023-09-16T14:20:10Z",
            totalConversations: 100,
            evaluatedConversations: 35,
          },
          {
            id: "job_3",
            promptVersionId,
            status: "failed",
            method: "rule",
            createdAt: "2023-09-14T09:15:00Z",
            startedAt: "2023-09-14T09:15:05Z",
            completedAt: "2023-09-14T09:16:30Z",
            totalConversations: 75,
            evaluatedConversations: 12,
            error: "API 호출 오류",
          },
        ]
        setJobs(mockJobs)
      } catch (error) {
        console.error("작업 목록 로드 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [promptVersionId])

  // 작업 상태에 따른 배지 색상
  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-amber-100 text-amber-800",
  }

  // 작업 상태 한글 표시
  const statusNames: Record<string, string> = {
    pending: "대기 중",
    in_progress: "진행 중",
    completed: "완료됨",
    failed: "실패",
    cancelled: "취소됨",
  }

  // 평가 방법 한글 표시
  const methodNames: Record<string, string> = {
    ai: "AI 평가",
    rule: "규칙 기반",
    human: "사람 평가",
    hybrid: "하이브리드",
  }

  // 작업 취소
  const handleCancelJob = async (jobId: string) => {
    try {
      setLoading(true)
      // 실제 구현에서는 API 호출
      const updatedJobs = jobs.map((job) => (job.id === jobId ? { ...job, status: "cancelled" } : job))
      setJobs(updatedJobs)
    } catch (error) {
      console.error("작업 취소 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // 작업 재시도
  const handleRetryJob = async (jobId: string) => {
    try {
      setLoading(true)
      // 실제 구현에서는 API 호출
      const updatedJobs = jobs.map((job) => (job.id === jobId ? { ...job, status: "pending", error: null } : job))
      setJobs(updatedJobs)
    } catch (error) {
      console.error("작업 재시도 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">평가 작업이 없습니다.</p>
          <Button className="mt-4" onClick={() => {}}>
            <Play className="mr-2 h-4 w-4" />
            평가 실행
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>평가 작업</CardTitle>
        <CardDescription>품질 평가 작업 목록</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>작업 ID</TableHead>
              <TableHead>평가 방법</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>진행률</TableHead>
              <TableHead>생성 일시</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.id}</TableCell>
                <TableCell>{methodNames[job.method] || job.method}</TableCell>
                <TableCell>
                  <Badge className={statusColors[job.status] || ""} variant="outline">
                    {statusNames[job.status] || job.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Progress value={(job.evaluatedConversations / job.totalConversations) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {job.evaluatedConversations} / {job.totalConversations} 대화
                    </div>
                  </div>
                </TableCell>
                <TableCell>{new Date(job.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">메뉴 열기</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {job.status === "in_progress" && (
                        <DropdownMenuItem onClick={() => handleCancelJob(job.id)}>
                          <StopCircle className="mr-2 h-4 w-4" />
                          <span>작업 취소</span>
                        </DropdownMenuItem>
                      )}
                      {(job.status === "failed" || job.status === "cancelled") && (
                        <DropdownMenuItem onClick={() => handleRetryJob(job.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          <span>재시도</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
