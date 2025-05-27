"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Download, BarChart3, MessageSquare, Lightbulb } from "lucide-react"
import { ConversationPatternsVisualization } from "@/components/admin/conversation-data/conversation-patterns-visualization"
import { ConversationDataSummaryView } from "@/components/admin/conversation-data/conversation-data-summary-view"
import { ConversationInsightsView } from "@/components/admin/conversation-data/conversation-insights-view"
import { ConversationDataSettings } from "@/components/admin/conversation-data/conversation-data-settings"
import type {
  ConversationPattern,
  ConversationCluster,
  ConversationInsight,
  ConversationDataSummary,
  PatternExtractionConfig,
} from "@/types/conversation-data-processor"

export default function ConversationDataPage() {
  const [loading, setLoading] = useState(false)
  const [patterns, setPatterns] = useState<ConversationPattern[]>([])
  const [clusters, setClusters] = useState<ConversationCluster[]>([])
  const [insights, setInsights] = useState<ConversationInsight[]>([])
  const [summary, setSummary] = useState<ConversationDataSummary | null>(null)
  const [activeTab, setActiveTab] = useState("summary")

  // 기본 설정
  const [config, setConfig] = useState<PatternExtractionConfig>({
    minFrequency: 3,
    maxPatterns: 50,
    similarityThreshold: 0.5,
    includeEntities: true,
    includeIntents: true,
    includeSentiment: true,
  })

  // 초기 데이터 로드
  useEffect(() => {
    fetchSummaryData()
  }, [])

  // 요약 데이터 가져오기
  const fetchSummaryData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/conversation-data")
      const data = await response.json()

      if (data.status === "success" && data.summary) {
        setSummary(data.summary)
      }
    } catch (error) {
      console.error("데이터 요약 로드 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // 전체 데이터 분석
  const analyzeData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/conversation-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config }),
      })

      const data = await response.json()

      if (data.status === "success") {
        setPatterns(data.patterns)
        setClusters(data.clusters)
        setInsights(data.insights)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error("데이터 분석 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // 데이터 내보내기
  const exportData = () => {
    const exportData = {
      patterns,
      clusters,
      insights,
      summary,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `conversation-data-analysis-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">대화 데이터 분석</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSummaryData} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            새로고침
          </Button>
          <Button variant="outline" onClick={exportData} disabled={loading || !summary}>
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
          <Button onClick={analyzeData} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
            전체 분석
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="summary">요약</TabsTrigger>
          <TabsTrigger value="patterns">패턴</TabsTrigger>
          <TabsTrigger value="insights">인사이트</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          {summary ? (
            <ConversationDataSummaryView summary={summary} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>데이터 요약</CardTitle>
                <CardDescription>대화 데이터 요약 정보를 불러오는 중입니다.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          {patterns.length > 0 ? (
            <ConversationPatternsVisualization patterns={patterns} clusters={clusters} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>대화 패턴</CardTitle>
                <CardDescription>
                  {loading ? "패턴을 분석하는 중입니다." : "패턴을 분석하려면 '전체 분석' 버튼을 클릭하세요."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <MessageSquare className="h-12 w-12 text-muted-foreground" />
                    <Button onClick={analyzeData}>패턴 분석 시작</Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {insights.length > 0 ? (
            <ConversationInsightsView insights={insights} patterns={patterns} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>대화 인사이트</CardTitle>
                <CardDescription>
                  {loading ? "인사이트를 분석하는 중입니다." : "인사이트를 분석하려면 '전체 분석' 버튼을 클릭하세요."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Lightbulb className="h-12 w-12 text-muted-foreground" />
                    <Button onClick={analyzeData}>인사이트 분석 시작</Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ConversationDataSettings config={config} setConfig={setConfig} onAnalyze={analyzeData} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
