import { NextResponse } from "next/server"
import { conversationAnalyticsService } from "@/services/conversation-analytics-service"
import type { ConversationAnalyticsFilters } from "@/types/conversation-analytics"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // 필터 파라미터 파싱
    const filters: ConversationAnalyticsFilters = {}

    // 날짜 범위 파싱
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      }
    }

    // 이슈 타입 파싱
    const issueTypes = searchParams.get("issueTypes")
    if (issueTypes) {
      filters.issueTypes = issueTypes.split(",")
    }

    // 해결 상태 파싱
    const resolutionStatus = searchParams.get("resolutionStatus")
    if (resolutionStatus && ["resolved", "unresolved", "all"].includes(resolutionStatus)) {
      filters.resolutionStatus = resolutionStatus as "resolved" | "unresolved" | "all"
    }

    // 기기 타입 파싱
    const deviceTypes = searchParams.get("deviceTypes")
    if (deviceTypes) {
      filters.deviceTypes = deviceTypes.split(",") as Array<"mobile" | "desktop" | "tablet" | "unknown">
    }

    // 만족도 범위 파싱
    const minSatisfaction = searchParams.get("minSatisfaction")
    const maxSatisfaction = searchParams.get("maxSatisfaction")
    if (minSatisfaction && maxSatisfaction) {
      filters.satisfactionRange = {
        min: Number.parseInt(minSatisfaction),
        max: Number.parseInt(maxSatisfaction),
      }
    }

    // 상담원 연결 파싱
    const transferredToAgent = searchParams.get("transferredToAgent")
    if (transferredToAgent) {
      filters.transferredToAgent = transferredToAgent === "true"
    }

    // 분석 요약 생성
    const summary = conversationAnalyticsService.generateAnalyticsSummary(filters)

    return NextResponse.json(summary)
  } catch (error) {
    console.error("대화 분석 데이터 조회 중 오류:", error)
    return NextResponse.json({ error: "대화 분석 데이터 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}
