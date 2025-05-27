"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EmotionHistory } from "@/types/emotion-recognition"

interface EmotionHistoryChartProps {
  history: EmotionHistory
  className?: string
}

export function EmotionHistoryChart({ history, className = "" }: EmotionHistoryChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!chartRef.current || !history.emotions || history.emotions.length === 0) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // 캔버스 초기화
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)

    // 차트 크기 설정
    const width = chartRef.current.width
    const height = chartRef.current.height
    const padding = 40

    // 감정 점수 매핑 (감정 톤 기준)
    const sentimentScores: Record<string, number> = {
      positive: 1,
      neutral: 0,
      negative: -1,
    }

    // 최대 5개의 최근 감정만 표시
    const recentEmotions = history.emotions.slice(-5)

    // 데이터 포인트 생성
    const dataPoints = recentEmotions.map((emotion) => ({
      score: sentimentScores[emotion.sentiment] || 0,
      // 감정 강도에 따라 점수 조정
      intensity: emotion.intensity === "high" ? 1.5 : emotion.intensity === "low" ? 0.5 : 1,
      timestamp: emotion.timestamp,
      emotion: emotion.emotion,
    }))

    // X축 간격 계산
    const xStep = (width - padding * 2) / (dataPoints.length - 1 || 1)

    // Y축 범위 설정
    const yMin = -1.5
    const yMax = 1.5
    const yRange = yMax - yMin

    // Y축 값을 캔버스 좌표로 변환하는 함수
    const getYCoordinate = (value: number) => {
      return height - padding - ((value - yMin) / yRange) * (height - padding * 2)
    }

    // 그리드 그리기
    ctx.strokeStyle = "#e5e7eb" // 연한 회색
    ctx.lineWidth = 0.5

    // 수평 그리드 라인
    for (let i = -1; i <= 1; i += 0.5) {
      const y = getYCoordinate(i)
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // 감정 색상 매핑
    const emotionColors: Record<string, string> = {
      joy: "#10b981", // 녹색
      sadness: "#3b82f6", // 파란색
      anger: "#ef4444", // 빨간색
      fear: "#8b5cf6", // 보라색
      surprise: "#f59e0b", // 노란색
      disgust: "#f97316", // 주황색
      trust: "#ec4899", // 분홍색
      anticipation: "#6366f1", // 인디고
      null: "#9ca3af", // 회색 (감정이 없는 경우)
    }

    // 선 그리기
    ctx.strokeStyle = "#6366f1" // 인디고 색상
    ctx.lineWidth = 2
    ctx.beginPath()

    dataPoints.forEach((point, index) => {
      const x = padding + index * xStep
      const y = getYCoordinate(point.score * point.intensity)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // 데이터 포인트 그리기
    dataPoints.forEach((point, index) => {
      const x = padding + index * xStep
      const y = getYCoordinate(point.score * point.intensity)

      // 포인트 배경
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()

      // 포인트 테두리
      const color = point.emotion ? emotionColors[point.emotion] : emotionColors.null
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.stroke()

      // 감정 강도에 따라 내부 채우기
      if (point.intensity > 1) {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Y축 레이블
    ctx.fillStyle = "#6b7280" // 회색
    ctx.font = "12px sans-serif"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    ctx.fillText("긍정", padding - 10, getYCoordinate(1))
    ctx.fillText("중립", padding - 10, getYCoordinate(0))
    ctx.fillText("부정", padding - 10, getYCoordinate(-1))

    // X축 레이블 (시간)
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    dataPoints.forEach((point, index) => {
      const x = padding + index * xStep
      const date = new Date(point.timestamp)
      const timeLabel = `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`

      ctx.fillText(timeLabel, x, height - padding + 10)
    })
  }, [history])

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">감정 변화 추이</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <canvas ref={chartRef} width={400} height={200} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  )
}
