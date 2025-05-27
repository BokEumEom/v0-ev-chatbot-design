"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle, MessageSquare } from "lucide-react"
import type { FollowUpQuestion } from "@/services/conversation-continuity-service"

interface FollowUpSuggestionsProps {
  questions: FollowUpQuestion[]
  onQuestionSelected: (question: FollowUpQuestion) => void
  className?: string
}

export function FollowUpSuggestions({ questions, onQuestionSelected, className = "" }: FollowUpSuggestionsProps) {
  const [expanded, setExpanded] = useState(false)

  // 표시할 질문 수 제한
  const displayQuestions = expanded ? questions : questions.slice(0, 2)

  if (questions.length === 0) {
    return null
  }

  return (
    <div className={`mt-3 space-y-2 ${className}`}>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <HelpCircle className="h-3 w-3" />
        <span>추천 질문</span>
      </div>

      <div className="flex flex-col gap-2">
        {displayQuestions.map((question) => (
          <Button
            key={question.id}
            variant="outline"
            size="sm"
            className="justify-start h-auto py-2 text-left text-xs"
            onClick={() => onQuestionSelected(question)}
          >
            <MessageSquare className="mr-2 h-3 w-3 shrink-0" />
            <span className="line-clamp-2">{question.text}</span>
          </Button>
        ))}

        {questions.length > 2 && (
          <Button variant="ghost" size="sm" className="mt-1 text-xs" onClick={() => setExpanded(!expanded)}>
            {expanded ? "접기" : `${questions.length - 2}개 더 보기`}
          </Button>
        )}
      </div>
    </div>
  )
}
