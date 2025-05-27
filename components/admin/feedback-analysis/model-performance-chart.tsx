"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import type { ClassificationModel } from "@/types/ml-feedback"

interface ModelPerformanceChartProps {
  model: ClassificationModel
}

export function ModelPerformanceChart({ model }: ModelPerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // 차트 크기 설정
    const width = chartRef.current.width
    const height = chartRef.current.height

    // 차트 영역 지우기
    ctx.clearRect(0, 0, width, height)

    // 차트 설정
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // 축 그리기
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 1

    // X축
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)

    // Y축
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.stroke()

    // 눈금 그리기
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#64748b"
    ctx.font = "12px sans-serif"

    // Y축 눈금
    for (let i = 0; i <= 10; i++) {
      const y = height - padding - (i / 10) * chartHeight

      ctx.beginPath()
      ctx.moveTo(padding - 5, y)
      ctx.lineTo(padding, y)
      ctx.stroke()

      ctx.fillText(i * 10 + "%", padding - 10, y)
    }

    // 성능 지표 데이터
    const metrics = [
      { name: "정확도", value: model.performance.accuracy },
      { name: "정밀도", value: model.performance.precision },
      { name: "재현율", value: model.performance.recall },
      { name: "F1 점수", value: model.performance.f1Score },
    ]

    // X축 눈금 및 레이블
    const barWidth = (chartWidth / metrics.length) * 0.6
    const barSpacing = chartWidth / metrics.length

    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    metrics.forEach((metric, i) => {
      const x = padding + i * barSpacing + barSpacing / 2

      ctx.fillText(metric.name, x, height - padding + 10)
    })

    // 막대 그래프 그리기
    metrics.forEach((metric, i) => {
      const x = padding + i * barSpacing + barSpacing / 2 - barWidth / 2
      const barHeight = chartHeight * metric.value
      const y = height - padding - barHeight

      // 그라데이션 생성
      const gradient = ctx.createLinearGradient(x, y, x, height - padding)
      gradient.addColorStop(0, "rgba(79, 70, 229, 0.8)")
      gradient.addColorStop(1, "rgba(79, 70, 229, 0.4)")

      // 막대 그리기
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      // 테두리 그리기
      ctx.strokeStyle = "rgba(79, 70, 229, 1)"
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, barWidth, barHeight)

      // 값 표시
      ctx.fillStyle = "#1e293b"
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.font = "bold 12px sans-serif"
      ctx.fillText((metric.value * 100).toFixed(1) + "%", x + barWidth / 2, y - 5)
    })

    // 차트 제목
    ctx.fillStyle = "#0f172a"
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText(`${model.name} 성능 지표`, width / 2, 15)
  }, [model])

  return (
    <Card className="p-4">
      <canvas ref={chartRef} width={800} height={400} className="w-full h-full" />
    </Card>
  )
}
