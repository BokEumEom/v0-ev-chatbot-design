"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, MessageSquare, X } from "lucide-react"

interface FeedbackCollectorProps {
  messageId: string
  onFeedbackSubmit: (feedback: { rating: number; comment?: string }) => void
}

export function FeedbackCollector({ messageId, onFeedbackSubmit }: FeedbackCollectorProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleRating = (value: number) => {
    setRating(value)

    // 부정적 평가인 경우 코멘트 폼 표시
    if (value < 3) {
      setShowCommentForm(true)
    } else {
      // 긍정적 평가는 바로 제출
      onFeedbackSubmit({ rating: value })
      setSubmitted(true)
    }
  }

  const handleCommentSubmit = () => {
    if (rating !== null) {
      onFeedbackSubmit({ rating, comment })
      setSubmitted(true)
      setShowCommentForm(false)
    }
  }

  const handleCommentCancel = () => {
    if (rating !== null) {
      onFeedbackSubmit({ rating })
      setSubmitted(true)
      setShowCommentForm(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center text-xs text-muted-foreground mt-1">
        <span>피드백을 주셔서 감사합니다</span>
      </div>
    )
  }

  return (
    <div className="mt-2">
      {!showCommentForm ? (
        <div className="flex items-center space-x-2">
          <div className="text-xs text-muted-foreground mr-1">이 응답이 도움이 되었나요?</div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRating(5)}>
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRating(1)}>
            <ThumbsDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCommentForm(true)}>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            placeholder="응답에 대한 의견을 남겨주세요"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={handleCommentCancel}>
              <X className="h-4 w-4 mr-1" />
              취소
            </Button>
            <Button size="sm" onClick={handleCommentSubmit}>
              제출
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
