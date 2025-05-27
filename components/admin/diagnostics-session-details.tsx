"use client"

import { useState, useEffect } from "react"
import type { DiagnosticSession, DiagnosticStep } from "@/types/diagnostics"
import { diagnosticsService } from "@/services/diagnostics-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { Clock, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react"
import { findNodeById } from "@/utils/troubleshooting-utils"
import { troubleshootingTree } from "@/data/troubleshooting-tree"

interface DiagnosticsSessionDetailsProps {
  session: DiagnosticSession
}

export function DiagnosticsSessionDetails({ session }: DiagnosticsSessionDetailsProps) {
  const [steps, setSteps] = useState<DiagnosticStep[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 세션 단계 로드
  useEffect(() => {
    setIsLoading(true)

    // 실제 구현에서는 API 호출
    const sessionSteps = diagnosticsService.getSessionSteps(session.id)
    setSteps(sessionSteps)
    setIsLoading(false)
  }, [session.id])

  // 세션 상태에 따른 배지 색상
  const getStatusBadge = (status: DiagnosticSession["completionStatus"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">완료됨</Badge>
      case "abandoned":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">중단됨</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">진행 중</Badge>
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  // 세션 시간 계산
  const calculateSessionDuration = () => {
    if (!session.endTime) return "진행 중"

    const durationMs = new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)

    return `${minutes}분 ${seconds}초`
  }

  // 노드 정보 가져오기
  const getNodeInfo = (nodeId: string) => {
    const node = findNodeById(nodeId, troubleshootingTree)
    return node ? node.title : nodeId
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>세션 정보</CardTitle>
            <CardDescription>진단 세션 기본 정보</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
              <dt className="font-medium">세션 ID:</dt>
              <dd className="font-mono">{session.id}</dd>

              <dt className="font-medium">시작 시간:</dt>
              <dd>{format(new Date(session.startTime), "yyyy-MM-dd HH:mm:ss")}</dd>

              <dt className="font-medium">종료 시간:</dt>
              <dd>{session.endTime ? format(new Date(session.endTime), "yyyy-MM-dd HH:mm:ss") : "-"}</dd>

              <dt className="font-medium">소요 시간:</dt>
              <dd>{calculateSessionDuration()}</dd>

              <dt className="font-medium">상태:</dt>
              <dd>{getStatusBadge(session.completionStatus)}</dd>

              <dt className="font-medium">차량 모델:</dt>
              <dd>{session.vehicleModel || "-"}</dd>

              <dt className="font-medium">충전소 타입:</dt>
              <dd>{session.chargingStationType || "-"}</dd>

              <dt className="font-medium">문제 카테고리:</dt>
              <dd>{session.initialProblemCategory || "-"}</dd>

              <dt className="font-medium">최종 노드:</dt>
              <dd>{session.finalNodeId ? getNodeInfo(session.finalNodeId) : "-"}</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>사용자 피드백</CardTitle>
            <CardDescription>사용자가 제공한 피드백 정보</CardDescription>
          </CardHeader>
          <CardContent>
            {session.userFeedback ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {session.userFeedback.helpful ? (
                    <>
                      <ThumbsUp className="h-5 w-5 text-green-500" />
                      <span className="font-medium">도움이 되었습니다</span>
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="h-5 w-5 text-red-500" />
                      <span className="font-medium">도움이 되지 않았습니다</span>
                    </>
                  )}
                </div>

                {session.userFeedback.comments && (
                  <div className="pt-2">
                    <p className="font-medium text-sm">코멘트:</p>
                    <p className="text-sm mt-1 p-2 bg-muted rounded-md">{session.userFeedback.comments}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">피드백이 제공되지 않았습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>진단 단계</CardTitle>
          <CardDescription>사용자가 진행한 진단 단계 목록</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
            </div>
          ) : steps.length > 0 ? (
            <ol className="relative border-l border-muted-foreground/20 space-y-6 pl-6 pt-2">
              {steps.map((step, index) => (
                <li key={step.nodeId} className="relative">
                  <div className="absolute -left-[25px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{getNodeInfo(step.nodeId)}</h4>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(step.timestamp), "HH:mm:ss")}
                      </span>
                    </div>
                    {step.userChoice && (
                      <p className="text-sm flex items-center space-x-1">
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span>선택: {step.userChoice}</span>
                      </p>
                    )}
                    {step.responseTime && (
                      <p className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>응답 시간: {(step.responseTime / 1000).toFixed(1)}초</span>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-muted-foreground">기록된 단계가 없습니다.</p>
          )}
        </CardContent>
      </Card>

      {Object.keys(session.userInputs || {}).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>사용자 입력 정보</CardTitle>
            <CardDescription>사용자가 제공한 추가 정보</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
              {Object.entries(session.userInputs).map(([key, value]) => (
                <div key={key}>
                  <dt className="font-medium">{key}:</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
