import { type NextRequest, NextResponse } from "next/server"
import { conversationDataProcessor } from "@/services/conversation-data-processor"
import type { PatternExtractionConfig } from "@/types/conversation-data-processor"

export async function POST(req: NextRequest) {
  try {
    const { config } = (await req.json()) as { config: PatternExtractionConfig }

    // 필수 필드 검증
    if (!config || config.minFrequency === undefined || config.maxPatterns === undefined) {
      return NextResponse.json({ error: "필수 설정 필드가 누락되었습니다." }, { status: 400 })
    }

    // 패턴 추출
    const patterns = await conversationDataProcessor.extractPatterns(config)

    // 패턴 클러스터링
    const clusters = await conversationDataProcessor.clusterPatterns(patterns)

    // 인사이트 생성
    const insights = await conversationDataProcessor.generateInsights(patterns, clusters)

    // 데이터 요약 생성
    const summary = await conversationDataProcessor.generateDataSummary(patterns, clusters, insights)

    return NextResponse.json({
      status: "success",
      patterns,
      clusters,
      insights,
      summary,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("대화 데이터 분석 API 오류:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "대화 데이터 분석 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  // 간단한 데이터 요약 반환
  try {
    // 기본 설정으로 패턴 추출
    const defaultConfig: PatternExtractionConfig = {
      minFrequency: 3,
      maxPatterns: 50,
      similarityThreshold: 0.5,
      includeEntities: true,
      includeIntents: true,
      includeSentiment: true,
    }

    const patterns = await conversationDataProcessor.extractPatterns(defaultConfig)
    const clusters = await conversationDataProcessor.clusterPatterns(patterns)
    const insights = await conversationDataProcessor.generateInsights(patterns, clusters)
    const summary = await conversationDataProcessor.generateDataSummary(patterns, clusters, insights)

    return NextResponse.json({
      status: "success",
      summary,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("대화 데이터 요약 API 오류:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "대화 데이터 요약 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
