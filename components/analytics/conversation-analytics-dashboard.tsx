"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { subDays } from "date-fns"
import type { ConversationAnalyticsSummary, ConversationAnalyticsFilters } from "@/types/conversation-analytics"
import { ConversationFilters } from "./conversation-filters"
import { ConversationMetricsCards } from "./conversation-metrics-cards"
import { ContinuityAnalysisChart } from "./continuity-analysis-chart"
import { ResolutionRateChart } from "./resolution-rate-chart"
import { SatisfactionAnalysisChart } from "./satisfaction-analysis-chart"
import { IssueTypeAnalysisTable } from "./issue-type-analysis-table"
import { AbandonmentAnalysisChart } from "./abandonment-analysis-chart"
import { TimeSeriesChart } from "./time-series-chart"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function ConversationAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [filters, setFilters] = useState<ConversationAnalyticsFilters>({
    dateRange: {
      start: dateRange.from,
      end: dateRange.to,
    },
    resolutionStatus: "all",
  })

  const [summary, setSummary] = useState<ConversationAnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // API 요청 파라미터 구성
        const params = new URLSearchParams()

        if (filters.dateRange) {
          params.append("startDate", filters.dateRange.start.toISOString())
          params.append("endDate", filters.dateRange.end.toISOString())
        }

        if (filters.issueTypes?.length) {
          params.append("issueTypes", filters.issueTypes.join(","))
        }

        if (filters.resolutionStatus) {
          params.append("resolutionStatus", filters.resolutionStatus)
        }

        if (filters.deviceTypes?.length) {
          params.append("deviceTypes", filters.deviceTypes.join(","))
        }

        if (filters.satisfactionRange) {
          params.append("minSatisfaction", filters.satisfactionRange.min.toString())
          params.append("maxSatisfaction", filters.satisfactionRange.max.toString())
        }

        if (filters.transferredToAgent !== undefined) {
          params.append("transferredToAgent", filters.transferredToAgent.toString())
        }

        // API 호출
        const response = await fetch(`/api/analytics/conversations?${params.toString()}`)
        if (!response.ok) {
          throw new Error("API 응답 오류")
        }

        const data = await response.json()
        setSummary(data)
      } catch (error) {
        console.error("대화 분석 데이터 로드 중 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  // 날짜 범위 변경 처리
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range)
    setFilters({
      ...filters,
      dateRange: {
        start: range.from,
        end: range.to,
      },
    })
  }

  // 필터 변경 처리
  const handleFilterChange = (newFilters: ConversationAnalyticsFilters) => {
    setFilters({
      ...newFilters,
      dateRange: filters.dateRange, // 날짜 범위는 유지
    })
  }

  // CSV 내보내기 (실제 구현 필요)
  const handleExportCSV = () => {
    alert("CSV 내보내기 기능은 아직 구현되지 않았습니다.")
  }

  if (loading && !summary) {
    return <div className="flex justify-center p-8">데이터 로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <DateRangePicker date={dateRange} onDateChange={handleDateRangeChange} />
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          CSV 내보내기
        </Button>
      </div>

      <ConversationFilters onChange={handleFilterChange} />

      {summary && (
        <>
          <ConversationMetricsCards summary={summary} />

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">개요</TabsTrigger>
              <TabsTrigger value="continuity">대화 지속성</TabsTrigger>
              <TabsTrigger value="resolution">문제 해결률</TabsTrigger>
              <TabsTrigger value="satisfaction">사용자 만족도</TabsTrigger>
              <TabsTrigger value="trends">트렌드</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResolutionRateChart summary={summary} />
                <SatisfactionAnalysisChart summary={summary} />
              </div>
              <IssueTypeAnalysisTable summary={summary} />
            </TabsContent>

            <TabsContent value="continuity" className="space-y-4">
              <ContinuityAnalysisChart summary={summary} />
              <AbandonmentAnalysisChart summary={summary} />
            </TabsContent>

            <TabsContent value="resolution" className="space-y-4">
              <ResolutionRateChart summary={summary} detailed />
              <IssueTypeAnalysisTable summary={summary} />
            </TabsContent>

            <TabsContent value="satisfaction" className="space-y-4">
              <SatisfactionAnalysisChart summary={summary} detailed />
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <TimeSeriesChart summary={summary} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
