"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Smile, Frown, Meh, AlertTriangle, Heart, ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react"
import type { EmotionState, BasicEmotion } from "@/types/emotion-recognition"

interface EmotionIndicatorProps {
  emotionState: EmotionState | null
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
  className?: string
}

export function EmotionIndicator({
  emotionState,
  size = "md",
  showTooltip = true,
  className = "",
}: EmotionIndicatorProps) {
  const [tooltipContent, setTooltipContent] = useState<string>("")

  // 감정 아이콘 매핑
  const emotionIcons: Record<BasicEmotion | "unknown", React.ReactNode> = {
    joy: <Smile className="text-green-500" />,
    sadness: <Frown className="text-blue-500" />,
    anger: <AlertTriangle className="text-red-500" />,
    fear: <AlertTriangle className="text-purple-500" />,
    surprise: <HelpCircle className="text-yellow-500" />,
    disgust: <ThumbsDown className="text-orange-500" />,
    trust: <Heart className="text-pink-500" />,
    anticipation: <ThumbsUp className="text-indigo-500" />,
    unknown: <Meh className="text-gray-500" />,
  }

  // 감정 한글 이름 매핑
  const emotionNames: Record<BasicEmotion | "unknown", string> = {
    joy: "기쁨",
    sadness: "슬픔",
    anger: "분노",
    fear: "두려움",
    surprise: "놀람",
    disgust: "불쾌감",
    trust: "신뢰",
    anticipation: "기대감",
    unknown: "중립",
  }

  // 감정 톤 배지 색상 매핑
  const sentimentColors: Record<string, string> = {
    positive: "bg-green-100 text-green-800 hover:bg-green-200",
    neutral: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    negative: "bg-red-100 text-red-800 hover:bg-red-200",
  }

  // 감정 강도 표시
  const intensityIndicator = (intensity: string) => {
    switch (intensity) {
      case "high":
        return "●●●"
      case "medium":
        return "●●○"
      case "low":
        return "●○○"
      default:
        return "○○○"
    }
  }

  // 아이콘 크기 설정
  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"
  const badgeSize =
    size === "sm" ? "text-xs py-0 px-1.5" : size === "lg" ? "text-sm py-1 px-2.5" : "text-xs py-0.5 px-2"

  // 툴팁 내용 생성
  useEffect(() => {
    if (!emotionState) {
      setTooltipContent("감정 분석 없음")
      return
    }

    const emotion = emotionState.primaryEmotion ? emotionNames[emotionState.primaryEmotion] : "중립"

    const intensity = intensityIndicator(emotionState.intensity)

    let content = `감정: ${emotion} (${intensity})\n`

    if (emotionState.secondaryEmotion) {
      content += `부차 감정: ${emotionNames[emotionState.secondaryEmotion]}\n`
    }

    content += `감정 톤: ${
      emotionState.sentiment === "positive" ? "긍정적" : emotionState.sentiment === "negative" ? "부정적" : "중립적"
    }\n`

    if (emotionState.emotionShift) {
      content += `변화: ${
        emotionState.emotionShift === "improving"
          ? "개선 중"
          : emotionState.emotionShift === "worsening"
            ? "악화 중"
            : "안정적"
      }\n`
    }

    if (emotionState.context?.trigger) {
      content += `트리거: ${emotionState.context.trigger}`
    }

    setTooltipContent(content)
  }, [emotionState])

  // 감정 상태가 없는 경우
  if (!emotionState) {
    return (
      <Badge variant="outline" className={`${badgeSize} ${className}`}>
        <Meh className={`${iconSize} mr-1 text-gray-500`} />
        <span>중립</span>
      </Badge>
    )
  }

  // 감정 아이콘 결정
  const emotionIcon = emotionState.primaryEmotion ? emotionIcons[emotionState.primaryEmotion] : emotionIcons.unknown

  // 감정 이름 결정
  const emotionName = emotionState.primaryEmotion ? emotionNames[emotionState.primaryEmotion] : "중립"

  // 감정 톤 배지 색상 결정
  const badgeColor = sentimentColors[emotionState.sentiment] || sentimentColors.neutral

  // 감정 변화 표시
  const shiftIndicator = emotionState.emotionShift
    ? emotionState.emotionShift === "improving"
      ? "↑"
      : emotionState.emotionShift === "worsening"
        ? "↓"
        : "→"
    : ""

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${badgeColor} ${badgeSize} cursor-help ${className}`}>
            <span className={iconSize}>{emotionIcon}</span>
            <span className="ml-1">{emotionName}</span>
            {shiftIndicator && <span className="ml-0.5">{shiftIndicator}</span>}
          </Badge>
        </TooltipTrigger>
        {showTooltip && <TooltipContent className="whitespace-pre-line">{tooltipContent}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  )
}
