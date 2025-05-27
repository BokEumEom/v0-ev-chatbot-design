"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertTriangle,
  Clock,
  Filter,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  CheckCircle2,
  ArrowUpCircle,
  CircleAlert,
  RefreshCw,
  X,
  Check,
  User,
  Calendar,
  Tag,
  Eye,
  MessageCircle,
  Bookmark,
} from "lucide-react"
import { feedbackPriorityService } from "@/services/feedback-priority-service"
import { feedbackAnalysisService } from "@/services/feedback-analysis-service"
import type { ClassifiedFeedback, PriorityLevel } from "@/types/ml-feedback"
import type { FeedbackFilterOptions } from "@/types/feedback"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface PriorityQueueViewProps {
  filters: FeedbackFilterOptions
}

export function PriorityQueueView({ filters }: PriorityQueueViewProps) {
  const [feedbacks, setFeedbacks] = useState<ClassifiedFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<PriorityLevel>("critical")
  const [selectedFeedback, setSelectedFeedback] = useState<ClassifiedFeedback | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [processingFeedbackId, setProcessingFeedbackId] = useState<string | null>(null)

  // 피드백 데이터 로드 및 우선순위 계산
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // 피드백 데이터 로드
        const feedbackList = await feedbackAnalysisService.getFeedbackList(filters)

        // 우선순위 일괄 계산
        const classifiedFeedbacks = await feedbackPriorityService.batchCalculatePriorities(feedbackList)

        setFeedbacks(classifiedFeedbacks)
      } catch (error) {
        console.error("Error loading priority queue:", error)
        setError("우선순위 큐를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  // 우선순위별 피드백 필터링
  const getPriorityFeedbacks = (priority: PriorityLevel) => {
    return feedbacks.filter((feedback) => feedback.priority?.level === priority)
  }

  // 우선순위별 피드백 수 계산
  const getPriorityCount = (priority: PriorityLevel) => {
    return getPriorityFeedbacks(priority).length
  }

  // 우선순위 레벨에 따른 배지 색상
  const getPriorityBadgeVariant = (priority: PriorityLevel) => {
    switch (priority) {
      case "critical":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      case "trivial":
        return "secondary"
      default:
        return "secondary"
    }
  }

  // 우선순위 레벨에 따른 아이콘
  const getPriorityIcon = (priority: PriorityLevel) => {
    switch (priority) {
      case "critical":
        return <CircleAlert className="h-4 w-4 text-destructive" />
      case "high":
        return <ArrowUpCircle className="h-4 w-4 text-default" />
      case "medium":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case "low":
        return <Clock className="h-4 w-4 text-muted-foreground" />
      case "trivial":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  // 피드백 유형에 따른 아이콘
  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case "rating":
        return <ThumbsUp className="h-4 w-4" />
      case "text":
        return <MessageSquare className="h-4 w-4" />
      case "suggestion":
        return <Filter className="h-4 w-4" />
      default:
        return null
    }
  }

  // 피드백 내용 요약
  const getFeedbackSummary = (feedback: ClassifiedFeedback) => {
    switch (feedback.type) {
      case "rating":
        return `평점: ${feedback.rating}/5`
      case "text":
        return feedback.text && feedback.text.length > 50 ? `${feedback.text.substring(0, 50)}...` : feedback.text
      case "choice":
        return `${feedback.question}: ${feedback.selectedOption}`
      case "suggestion":
        return feedback.suggestion && feedback.suggestion.length > 50
          ? `${feedback.suggestion.substring(0, 50)}...`
          : feedback.suggestion
      default:
        return ""
    }
  }

  // 피드백 처리 상태 변경
  const handleProcessFeedback = async (feedbackId: string, status: "resolved" | "ignored") => {
    try {
      setProcessingFeedbackId(feedbackId)

      // 피드백 처리 상태 업데이트
      await feedbackAnalysisService.updateFeedbackStatus(feedbackId, status)

      // 피드백 목록 업데이트
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.map((feedback) => (feedback.id === feedbackId ? { ...feedback, status } : feedback)),
      )

      // 상세 보기 다이얼로그 닫기
      if (selectedFeedback?.id === feedbackId) {
        setIsDetailOpen(false)
        setSelectedFeedback(null)
      }
    } catch (error) {
      console.error(`Error ${status === "resolved" ? "resolving" : "ignoring"} feedback:`, error)
    } finally {
      setProcessingFeedbackId(null)
    }
  }

  // 피드백 상세 보기
  const handleViewFeedbackDetail = (feedback: ClassifiedFeedback) => {
    setSelectedFeedback(feedback)
    setIsDetailOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>오류</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        {(["critical", "high", "medium", "low", "trivial"] as PriorityLevel[]).map((priority) => (
          <Card
            key={priority}
            className={`cursor-pointer ${activeTab === priority ? "border-primary" : ""}`}
            onClick={() => setActiveTab(priority)}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex items-center space-x-2 mb-2">
                {getPriorityIcon(priority)}
                <Badge variant={getPriorityBadgeVariant(priority) as any}>
                  {priority === "critical"
                    ? "위기"
                    : priority === "high"
                      ? "높음"
                      : priority === "medium"
                        ? "중간"
                        : priority === "low"
                          ? "낮음"
                          : "사소함"}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{getPriorityCount(priority)}</p>
              <p className="text-xs text-muted-foreground">개 항목</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PriorityLevel)}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="critical">위기</TabsTrigger>
          <TabsTrigger value="high">높음</TabsTrigger>
          <TabsTrigger value="medium">중간</TabsTrigger>
          <TabsTrigger value="low">낮음</TabsTrigger>
          <TabsTrigger value="trivial">사소함</TabsTrigger>
        </TabsList>

        {(["critical", "high", "medium", "low", "trivial"] as PriorityLevel[]).map((priority) => (
          <TabsContent key={priority} value={priority} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(priority)}
                    <span>
                      {priority === "critical"
                        ? "위기 수준"
                        : priority === "high"
                          ? "높은 우선순위"
                          : priority === "medium"
                            ? "중간 우선순위"
                            : priority === "low"
                              ? "낮은 우선순위"
                              : "사소한 항목"}
                    </span>
                  </div>
                </CardTitle>
                <CardDescription>
                  {priority === "critical"
                    ? "즉시 조치가 필요한 위기 수준 피드백입니다."
                    : priority === "high"
                      ? "빠른 시일 내에 처리해야 하는 중요 피드백입니다."
                      : priority === "medium"
                        ? "적절한 시기에 처리해야 하는 피드백입니다."
                        : priority === "low"
                          ? "여유 있게 처리할 수 있는 피드백입니다."
                          : "시간이 있을 때 검토할 수 있는 사소한 피드백입니다."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getPriorityFeedbacks(priority).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">이 우선순위에 해당하는 피드백이 없습니다.</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">점수</TableHead>
                          <TableHead className="w-[100px]">유형</TableHead>
                          <TableHead>내용</TableHead>
                          <TableHead className="w-[150px]">분류</TableHead>
                          <TableHead className="w-[150px]">날짜</TableHead>
                          <TableHead className="w-[100px]">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getPriorityFeedbacks(priority)
                          .sort((a, b) => (b.priority?.score || 0) - (a.priority?.score || 0))
                          .map((feedback) => (
                            <TableRow
                              key={feedback.id}
                              className="cursor-pointer"
                              onClick={() => handleViewFeedbackDetail(feedback)}
                            >
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{feedback.priority?.score}</span>
                                  <Progress value={feedback.priority?.score} className="w-12 h-2" />
                                </div>
                              </TableCell>
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
                              <TableCell>{getFeedbackSummary(feedback)}</TableCell>
                              <TableCell>
                                {feedback.classification ? (
                                  <div className="flex flex-col space-y-1">
                                    <Badge variant="outline">
                                      {feedback.classification.category === "usability"
                                        ? "사용성"
                                        : feedback.classification.category === "accuracy"
                                          ? "정확성"
                                          : feedback.classification.category === "speed"
                                            ? "속도"
                                            : feedback.classification.category === "clarity"
                                              ? "명확성"
                                              : feedback.classification.category === "completeness"
                                                ? "완전성"
                                                : feedback.classification.category === "relevance"
                                                  ? "관련성"
                                                  : "기타"}
                                    </Badge>
                                    {feedback.classification.topics[0] && (
                                      <span className="text-xs text-muted-foreground">
                                        {feedback.classification.topics[0].topic.replace("_", " ")}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">미분류</span>
                                )}
                              </TableCell>
                              <TableCell>{new Date(feedback.timestamp).toLocaleString()}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewFeedbackDetail(feedback)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* 피드백 상세 보기 다이얼로그 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <DialogTitle>피드백 상세 정보</DialogTitle>
                <DialogDescription>피드백 ID: {selectedFeedback.id}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" /> 사용자 정보
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{selectedFeedback.userId?.substring(0, 2) || "UN"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{selectedFeedback.userName || "익명 사용자"}</p>
                      <p className="text-xs text-muted-foreground">{selectedFeedback.userId || "ID 없음"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> 날짜 및 시간
                  </h4>
                  <p className="text-sm">{new Date(selectedFeedback.timestamp).toLocaleString()}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" /> 우선순위
                  </h4>
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(selectedFeedback.priority?.level || "medium")}
                    <Badge variant={getPriorityBadgeVariant(selectedFeedback.priority?.level || "medium") as any}>
                      {selectedFeedback.priority?.level === "critical"
                        ? "위기"
                        : selectedFeedback.priority?.level === "high"
                          ? "높음"
                          : selectedFeedback.priority?.level === "medium"
                            ? "중간"
                            : selectedFeedback.priority?.level === "low"
                              ? "낮음"
                              : "사소함"}
                      ({selectedFeedback.priority?.score})
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4 py-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> 피드백 내용
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getFeedbackTypeIcon(selectedFeedback.type)}
                    <span className="text-sm font-medium">
                      {selectedFeedback.type === "rating"
                        ? "평점 피드백"
                        : selectedFeedback.type === "text"
                          ? "텍스트 피드백"
                          : selectedFeedback.type === "choice"
                            ? "선택형 피드백"
                            : "제안 피드백"}
                    </span>
                  </div>

                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    {selectedFeedback.type === "rating" && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">평점: {selectedFeedback.rating}/5</p>
                        {selectedFeedback.text && <p className="text-sm">{selectedFeedback.text}</p>}
                      </div>
                    )}

                    {selectedFeedback.type === "text" && <p className="text-sm">{selectedFeedback.text}</p>}

                    {selectedFeedback.type === "choice" && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{selectedFeedback.question}</p>
                        <p className="text-sm">{selectedFeedback.selectedOption}</p>
                      </div>
                    )}

                    {selectedFeedback.type === "suggestion" && <p className="text-sm">{selectedFeedback.suggestion}</p>}
                  </ScrollArea>
                </div>
              </div>

              {selectedFeedback.classification && (
                <>
                  <Separator />

                  <div className="space-y-4 py-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Bookmark className="h-4 w-4" /> 분류 정보
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">카테고리</p>
                        <Badge className="text-xs">
                          {selectedFeedback.classification.category === "usability"
                            ? "사용성"
                            : selectedFeedback.classification.category === "accuracy"
                              ? "정확성"
                              : selectedFeedback.classification.category === "speed"
                                ? "속도"
                                : selectedFeedback.classification.category === "clarity"
                                  ? "명확성"
                                  : selectedFeedback.classification.category === "completeness"
                                    ? "완전성"
                                    : selectedFeedback.classification.category === "relevance"
                                      ? "관련성"
                                      : "기타"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">주제</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedFeedback.classification.topics.map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {topic.topic.replace("_", " ")} ({Math.round(topic.confidence * 100)}%)
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {selectedFeedback.classification.sentiment && (
                        <div className="col-span-2 space-y-2">
                          <p className="text-sm font-medium">감정 분석</p>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                selectedFeedback.classification.sentiment.score > 0
                                  ? "default"
                                  : selectedFeedback.classification.sentiment.score < 0
                                    ? "destructive"
                                    : "outline"
                              }
                              className="text-xs"
                            >
                              {selectedFeedback.classification.sentiment.score > 0.3
                                ? "매우 긍정적"
                                : selectedFeedback.classification.sentiment.score > 0
                                  ? "긍정적"
                                  : selectedFeedback.classification.sentiment.score > -0.3
                                    ? "중립적"
                                    : selectedFeedback.classification.sentiment.score > -0.6
                                      ? "부정적"
                                      : "매우 부정적"}
                            </Badge>
                            <Progress
                              value={(selectedFeedback.classification.sentiment.score + 1) * 50}
                              className="w-32 h-2"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <DialogFooter className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">상태:</span>
                  <Badge
                    variant={
                      selectedFeedback.status === "resolved"
                        ? "default"
                        : selectedFeedback.status === "ignored"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {selectedFeedback.status === "resolved"
                      ? "해결됨"
                      : selectedFeedback.status === "ignored"
                        ? "무시됨"
                        : "미처리"}
                  </Badge>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleProcessFeedback(selectedFeedback.id, "ignored")}
                    disabled={selectedFeedback.status === "ignored" || !!processingFeedbackId}
                  >
                    {processingFeedbackId === selectedFeedback.id ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    무시
                  </Button>

                  <Button
                    onClick={() => handleProcessFeedback(selectedFeedback.id, "resolved")}
                    disabled={selectedFeedback.status === "resolved" || !!processingFeedbackId}
                  >
                    {processingFeedbackId === selectedFeedback.id ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    해결 완료
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
