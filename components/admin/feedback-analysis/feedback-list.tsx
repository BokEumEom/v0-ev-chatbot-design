"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ThumbsUp, MessageSquare, LightbulbIcon } from "lucide-react"
import { feedbackAnalysisService } from "@/services/feedback-analysis-service"
import type { Feedback, FeedbackFilterOptions } from "@/types/feedback"

interface FeedbackListProps {
  filters: FeedbackFilterOptions
  onSelectNode: (nodeId: string) => void
}

export function FeedbackList({ filters, onSelectNode }: FeedbackListProps) {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [filteredList, setFilteredList] = useState<Feedback[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 10

  useEffect(() => {
    // 피드백 데이터 로드
    const loadData = () => {
      setLoading(true)

      try {
        const feedbackList = feedbackAnalysisService.getFeedbackList(filters)
        setFeedbackList(feedbackList)
        setFilteredList(feedbackList)
        setCurrentPage(1)
      } catch (error) {
        console.error("피드백 데이터 로드 중 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  // 검색 처리
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredList(feedbackList)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = feedbackList.filter((feedback) => {
      // 세션 ID 검색
      if (feedback.sessionId.toLowerCase().includes(query)) return true

      // 노드 ID 검색
      if (feedback.nodeId?.toLowerCase().includes(query)) return true

      // 피드백 내용 검색
      if (feedback.type === "text" && feedback.text.toLowerCase().includes(query)) return true
      if (feedback.type === "suggestion" && feedback.suggestion.toLowerCase().includes(query)) return true
      if (
        feedback.type === "choice" &&
        (feedback.question.toLowerCase().includes(query) || feedback.selectedOption.toLowerCase().includes(query))
      )
        return true

      return false
    })

    setFilteredList(filtered)
    setCurrentPage(1)
  }, [searchQuery, feedbackList])

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredList.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage)

  // 피드백 유형에 따른 아이콘 반환
  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case "rating":
        return <ThumbsUp className="h-4 w-4" />
      case "text":
        return <MessageSquare className="h-4 w-4" />
      case "suggestion":
        return <LightbulbIcon className="h-4 w-4" />
      default:
        return null
    }
  }

  // 감정에 따른 배지 색상 반환
  const getSentimentBadgeVariant = (feedback: Feedback) => {
    let sentiment: string

    if (feedback.type === "text" || feedback.type === "suggestion") {
      sentiment = feedback.sentiment || "neutral"
    } else if (feedback.type === "rating") {
      sentiment = feedback.rating >= 4 ? "positive" : feedback.rating <= 2 ? "negative" : "neutral"
    } else {
      sentiment = "neutral"
    }

    switch (sentiment) {
      case "positive":
        return "success"
      case "negative":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // 피드백 내용 요약
  const getFeedbackSummary = (feedback: Feedback) => {
    switch (feedback.type) {
      case "rating":
        return `평점: ${feedback.rating}/5`
      case "text":
        return feedback.text.length > 50 ? `${feedback.text.substring(0, 50)}...` : feedback.text
      case "choice":
        return `${feedback.question}: ${feedback.selectedOption}`
      case "suggestion":
        return feedback.suggestion.length > 50 ? `${feedback.suggestion.substring(0, 50)}...` : feedback.suggestion
      default:
        return ""
    }
  }

  if (loading) {
    return <div>데이터 로딩 중...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="피드백 검색..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <Badge variant="outline">{filteredList.length}개 항목</Badge>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">유형</TableHead>
              <TableHead className="w-[150px]">노드</TableHead>
              <TableHead>내용</TableHead>
              <TableHead className="w-[100px]">감정</TableHead>
              <TableHead className="w-[150px]">날짜</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedList.length > 0 ? (
              paginatedList.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getFeedbackTypeIcon(feedback.type)}
                      <span>
                        {feedback.type === "rating"
                          ? "평점"
                          : feedback.type === "text"
                            ? "텍스트"
                            : feedback.type === "choice"
                              ? "선택형"
                              : "제안"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {feedback.nodeId ? (
                      <Button variant="link" className="p-0 h-auto" onClick={() => onSelectNode(feedback.nodeId!)}>
                        {feedback.nodeId}
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{getFeedbackSummary(feedback)}</TableCell>
                  <TableCell>
                    <Badge variant={getSentimentBadgeVariant(feedback) as any}>
                      {feedback.type === "text" || feedback.type === "suggestion"
                        ? feedback.sentiment === "positive"
                          ? "긍정적"
                          : feedback.sentiment === "negative"
                            ? "부정적"
                            : "중립적"
                        : feedback.type === "rating"
                          ? feedback.rating >= 4
                            ? "긍정적"
                            : feedback.rating <= 2
                              ? "부정적"
                              : "중립적"
                          : "중립적"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(feedback.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  검색 결과가 없습니다
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number

              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink isActive={currentPage === pageNum} onClick={() => setCurrentPage(pageNum)}>
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
