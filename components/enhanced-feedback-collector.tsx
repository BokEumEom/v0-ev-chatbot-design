"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  X,
  Star,
  LightbulbIcon,
  CheckCircle2,
  Mic,
  MicOff,
  Camera,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { advancedSentimentAnalysisService } from "@/services/advanced-sentiment-analysis"
import type { FeedbackCategory } from "@/types/feedback"

interface EnhancedFeedbackCollectorProps {
  messageId: string
  sessionId: string
  nodeId?: string
  onFeedbackSubmit: (feedback: any) => void
  enableVoice?: boolean
  enableImage?: boolean
}

export function EnhancedFeedbackCollector({
  messageId,
  sessionId,
  nodeId,
  onFeedbackSubmit,
  enableVoice = false,
  enableImage = false,
}: EnhancedFeedbackCollectorProps) {
  const [activeTab, setActiveTab] = useState<string>("rating")
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [category, setCategory] = useState<FeedbackCategory | "">("")
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [submitted, setSubmitted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [sentimentPreview, setSentimentPreview] = useState<{
    sentiment: "positive" | "neutral" | "negative"
    confidence: number
  } | null>(null)
  const [showSentimentPreview, setShowSentimentPreview] = useState(false)

  // 음성 인식 시뮬레이션
  const toggleRecording = () => {
    if (!enableVoice) return

    if (isRecording) {
      // 녹음 중지 (실제로는 Web Speech API 등을 사용)
      setIsRecording(false)

      // 음성 인식 결과 시뮬레이션
      const simulatedText = "이 기능이 매우 유용하고 직관적이에요. 다만 로딩 속도가 조금 느린 것 같아요."

      if (activeTab === "text") {
        setComment(simulatedText)
      } else if (activeTab === "suggestion") {
        setSuggestion(simulatedText)
      }

      // 감정 분석 미리보기
      const analysis = advancedSentimentAnalysisService.analyzeText(simulatedText)
      setSentimentPreview({
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
      })
      setShowSentimentPreview(true)
    } else {
      // 녹음 시작
      setIsRecording(true)

      // 3초 후 자동 중지 (데모용)
      setTimeout(() => {
        if (isRecording) {
          toggleRecording()
        }
      }, 3000)
    }
  }

  // 이미지 업로드 시뮬레이션
  const handleImageUpload = () => {
    if (!enableImage) return

    // 이미지 업로드 시뮬레이션 (실제로는 파일 선택 및 업로드 로직)
    alert("이미지 업로드 기능은 현재 개발 중입니다.")
  }

  // 텍스트 입력 시 실시간 감정 분석
  useEffect(() => {
    const text = activeTab === "text" ? comment : activeTab === "suggestion" ? suggestion : ""

    if (text.length > 10) {
      const analysis = advancedSentimentAnalysisService.analyzeText(text)
      setSentimentPreview({
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
      })
      setShowSentimentPreview(true)
    } else {
      setShowSentimentPreview(false)
    }
  }, [comment, suggestion, activeTab])

  const handleRatingSubmit = () => {
    if (rating !== null) {
      onFeedbackSubmit({
        type: "rating",
        sessionId,
        nodeId,
        rating,
        category: category || undefined,
      })
      setSubmitted(true)
    }
  }

  const handleTextSubmit = () => {
    if (comment.trim()) {
      // 감정 분석 수행
      const analysis = advancedSentimentAnalysisService.analyzeText(comment)

      onFeedbackSubmit({
        type: "text",
        sessionId,
        nodeId,
        text: comment,
        sentiment: analysis.sentiment,
        keywords: analysis.keywords.map((k) => k.word),
        category: category || undefined,
        deviceInfo: {
          type: window.innerWidth < 768 ? "mobile" : "desktop",
          browser: navigator.userAgent,
        },
        context: {
          timeSpentOnNode: 60000, // 예시 값
        },
      })
      setSubmitted(true)
    }
  }

  const handleSuggestionSubmit = () => {
    if (suggestion.trim()) {
      // 감정 분석 수행
      const analysis = advancedSentimentAnalysisService.analyzeText(suggestion)

      onFeedbackSubmit({
        type: "suggestion",
        sessionId,
        nodeId,
        suggestion,
        sentiment: analysis.sentiment,
        keywords: analysis.keywords.map((k) => k.word),
        category: category || undefined,
        deviceInfo: {
          type: window.innerWidth < 768 ? "mobile" : "desktop",
          browser: navigator.userAgent,
        },
      })
      setSubmitted(true)
    }
  }

  const handleChoiceSubmit = () => {
    if (selectedOption) {
      onFeedbackSubmit({
        type: "choice",
        sessionId,
        nodeId,
        question: "이 진단 단계가 얼마나 도움이 되었나요?",
        options: ["매우 도움됨", "도움됨", "보통", "도움 안 됨", "전혀 도움 안 됨"],
        selectedOption,
        category: category || undefined,
      })
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center text-xs text-muted-foreground mt-1">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        <span>피드백을 주셔서 감사합니다</span>
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="text-xs text-muted-foreground mr-1">이 응답이 도움이 되었나요?</div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            setRating(5)
            onFeedbackSubmit({
              type: "rating",
              sessionId,
              nodeId,
              rating: 5,
            })
            setSubmitted(true)
          }}
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            setRating(1)
            setActiveTab("text")
          }}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActiveTab("text")}>
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActiveTab("suggestion")}>
          <LightbulbIcon className="h-4 w-4" />
        </Button>
      </div>

      {activeTab !== "rating" && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="rating">평점</TabsTrigger>
            <TabsTrigger value="text">의견</TabsTrigger>
            <TabsTrigger value="suggestion">제안</TabsTrigger>
          </TabsList>

          <TabsContent value="rating" className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${rating === value ? "text-yellow-500" : "text-muted-foreground"}`}
                    onClick={() => setRating(value)}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </Button>
                ))}
              </div>
              <Select value={category} onValueChange={(value) => setCategory(value as FeedbackCategory)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="카테고리 선택 (선택사항)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usability">사용성</SelectItem>
                  <SelectItem value="accuracy">정확성</SelectItem>
                  <SelectItem value="speed">속도</SelectItem>
                  <SelectItem value="clarity">명확성</SelectItem>
                  <SelectItem value="completeness">완전성</SelectItem>
                  <SelectItem value="relevance">관련성</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab("rating")}>
                  <X className="h-4 w-4 mr-1" />
                  취소
                </Button>
                <Button size="sm" onClick={handleRatingSubmit} disabled={rating === null}>
                  제출
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="relative">
                <Textarea
                  placeholder="응답에 대한 의견을 남겨주세요"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[80px] text-sm pr-20"
                />
                <div className="absolute right-2 top-2 flex space-x-1">
                  {enableVoice && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${isRecording ? "text-red-500" : ""}`}
                      onClick={toggleRecording}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                  {enableImage && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleImageUpload}>
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {showSentimentPreview && sentimentPreview && (
                <div className="flex items-center text-xs">
                  <span className="mr-2">감정 분석:</span>
                  <Badge
                    variant={
                      sentimentPreview.sentiment === "positive"
                        ? "success"
                        : sentimentPreview.sentiment === "negative"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {sentimentPreview.sentiment === "positive"
                      ? "긍정적"
                      : sentimentPreview.sentiment === "negative"
                        ? "부정적"
                        : "중립적"}
                  </Badge>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 ml-2">
                        <span className="text-xs">신뢰도: {Math.round(sentimentPreview.confidence * 100)}%</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">감정 분석 신뢰도</h4>
                        <Slider value={[sentimentPreview.confidence * 100]} max={100} step={1} disabled />
                        <p className="text-xs text-muted-foreground">
                          신뢰도는 감정 분석의 정확도를 나타냅니다. 높을수록 분석 결과가 더 정확할 가능성이 높습니다.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <Select value={category} onValueChange={(value) => setCategory(value as FeedbackCategory)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="카테고리 선택 (선택사항)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usability">사용성</SelectItem>
                  <SelectItem value="accuracy">정확성</SelectItem>
                  <SelectItem value="speed">속도</SelectItem>
                  <SelectItem value="clarity">명확성</SelectItem>
                  <SelectItem value="completeness">완전성</SelectItem>
                  <SelectItem value="relevance">관련성</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab("rating")}>
                  <X className="h-4 w-4 mr-1" />
                  취소
                </Button>
                <Button size="sm" onClick={handleTextSubmit} disabled={!comment.trim()}>
                  제출
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suggestion" className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="relative">
                <Textarea
                  placeholder="개선 제안이나 새로운 기능 아이디어를 남겨주세요"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="min-h-[80px] text-sm pr-20"
                />
                <div className="absolute right-2 top-2 flex space-x-1">
                  {enableVoice && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${isRecording ? "text-red-500" : ""}`}
                      onClick={toggleRecording}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                  {enableImage && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleImageUpload}>
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {showSentimentPreview && sentimentPreview && (
                <div className="flex items-center text-xs">
                  <span className="mr-2">감정 분석:</span>
                  <Badge
                    variant={
                      sentimentPreview.sentiment === "positive"
                        ? "success"
                        : sentimentPreview.sentiment === "negative"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {sentimentPreview.sentiment === "positive"
                      ? "긍정적"
                      : sentimentPreview.sentiment === "negative"
                        ? "부정적"
                        : "중립적"}
                  </Badge>
                  <span className="text-xs ml-2">신뢰도: {Math.round(sentimentPreview.confidence * 100)}%</span>
                </div>
              )}

              <Select value={category} onValueChange={(value) => setCategory(value as FeedbackCategory)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="카테고리 선택 (선택사항)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usability">사용성</SelectItem>
                  <SelectItem value="accuracy">정확성</SelectItem>
                  <SelectItem value="speed">속도</SelectItem>
                  <SelectItem value="clarity">명확성</SelectItem>
                  <SelectItem value="completeness">완전성</SelectItem>
                  <SelectItem value="relevance">관련성</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab("rating")}>
                  <X className="h-4 w-4 mr-1" />
                  취소
                </Button>
                <Button size="sm" onClick={handleSuggestionSubmit} disabled={!suggestion.trim()}>
                  제출
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
