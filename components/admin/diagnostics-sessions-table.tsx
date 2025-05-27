"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Eye, FileText } from "lucide-react"
import type { DiagnosticSession, DiagnosticsFilterOptions } from "@/types/diagnostics"
import { diagnosticsService } from "@/services/diagnostics-service"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DiagnosticsSessionDetails } from "./diagnostics-session-details"

interface DiagnosticsSessionsTableProps {
  filters: DiagnosticsFilterOptions
}

export function DiagnosticsSessionsTable({ filters }: DiagnosticsSessionsTableProps) {
  const [sessions, setSessions] = useState<DiagnosticSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedSession, setSelectedSession] = useState<DiagnosticSession | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const pageSize = 10
  const totalPages = Math.ceil(sessions.length / pageSize)

  // 필터 변경 시 세션 목록 다시 로드
  useEffect(() => {
    setIsLoading(true)

    // 실제 구현에서는 API 호출
    const allSessions = diagnosticsService.getSessions(filters)
    setSessions(allSessions)
    setIsLoading(false)
    setPage(1) // 필터 변경 시 첫 페이지로 이동
  }, [filters])

  // 현재 페이지의 세션 목록
  const currentSessions = sessions.slice((page - 1) * pageSize, page * pageSize)

  // 페이지 변경 처리
  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)))
  }

  // 세션 상태에 따른 배지 색상
  const getStatusBadge = (status: DiagnosticSession["completionStatus"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            완료됨
          </Badge>
        )
      case "abandoned":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            중단됨
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            진행 중
          </Badge>
        )
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  // 세션 상세 정보 보기
  const handleViewDetails = (session: DiagnosticSession) => {
    setSelectedSession(session)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>시작 시간</TableHead>
              <TableHead>차량 모델</TableHead>
              <TableHead>충전소 타입</TableHead>
              <TableHead>문제 카테고리</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(pageSize)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    {Array(7)
                      .fill(0)
                      .map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))
            ) : currentSessions.length > 0 ? (
              currentSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-mono text-xs">{session.id.substring(0, 8)}...</TableCell>
                  <TableCell>{format(new Date(session.startTime), "yyyy-MM-dd HH:mm")}</TableCell>
                  <TableCell>{session.vehicleModel || "-"}</TableCell>
                  <TableCell>{session.chargingStationType || "-"}</TableCell>
                  <TableCell>{session.initialProblemCategory || "-"}</TableCell>
                  <TableCell>{getStatusBadge(session.completionStatus)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">메뉴 열기</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>작업</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(session)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>상세 정보 보기</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>보고서 생성</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={page === 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 세션 상세 정보 다이얼로그 */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>진단 세션 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedSession && <DiagnosticsSessionDetails session={selectedSession} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
