"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { addDays, format } from "date-fns"
import type { DiagnosticsStats, DiagnosticsFilterOptions } from "@/types/diagnostics"
import { diagnosticsService } from "@/services/diagnostics-service"
import { DiagnosticsOverview } from "./diagnostics-overview"
import { DiagnosticsCharts } from "./diagnostics-charts"
import { DiagnosticsSessionsTable } from "./diagnostics-sessions-table"
import { DiagnosticsFilters } from "./diagnostics-filters"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function DiagnosticsDashboard() {
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const [filters, setFilters] = useState<DiagnosticsFilterOptions>({
    dateRange: {
      start: dateRange.from,
      end: dateRange.to,
    },
  })

  const [stats, setStats] = useState<DiagnosticsStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 필터 변경 시 통계 다시 로드
  useEffect(() => {
    setIsLoading(true)

    // 실제 구현에서는 API 호출
    const newStats = diagnosticsService.generateStats(filters)
    setStats(newStats)
    setIsLoading(false)
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
  const handleFilterChange = (newFilters: DiagnosticsFilterOptions) => {
    setFilters({
      ...newFilters,
      dateRange: filters.dateRange, // 날짜 범위는 유지
    })
  }

  // CSV 내보내기
  const handleExportCSV = () => {
    const csvContent = diagnosticsService.exportSessionsToCSV(filters)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `diagnostics-export-${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

      <DiagnosticsFilters onChange={handleFilterChange} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="charts">차트</TabsTrigger>
          <TabsTrigger value="sessions">세션 목록</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {stats && <DiagnosticsOverview stats={stats} isLoading={isLoading} />}
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <DiagnosticsCharts filters={filters} />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <DiagnosticsSessionsTable filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
