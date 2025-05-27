"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Database, MessageSquare } from "lucide-react"
import { UserDataBasedSettings } from "@/components/admin/scenario-generator/user-data-based-settings"
import { ScenarioGenerationResults } from "@/components/admin/scenario-generator/scenario-generation-results"
import { ScenarioEditor } from "@/components/admin/scenario-generator/scenario-editor"
import type { ChatScenario } from "@/data/chatbot-scenarios"
import type { ConversationCluster, ScenarioGenerationFromDataConfig } from "@/types/conversation-data-processor"

export default function UserDataBasedScenarioGeneratorPage() {
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [clusters, setClusters] = useState<{ id: string; name: string }[]>([])
  const [scenarios, setScenarios] = useState<ChatScenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<ChatScenario | null>(null)
  const [activeTab, setActiveTab] = useState("settings")

  // 초기 클러스터 데이터 로드
  useEffect(() => {
    fetchClusters()
  }, [])

  // 클러스터 데이터 가져오기
  const fetchClusters = async () => {
    try {
      setAnalyzing(true)
      const response = await fetch("/api/conversation-data")
      const data = await response.json()

      if (data.status === "success" && data.summary) {
        // 클러스터 정보 추출
        const clusterData = data.summary.topClusters || []
        setClusters(
          clusterData.map((cluster: ConversationCluster) => ({
            id: cluster.id,
            name: cluster.name,
          })),
        )
      }
    } catch (error) {
      console.error("클러스터 데이터 로드 오류:", error)
    } finally {
      setAnalyzing(false)
    }
  }

  // 시나리오 생성
  const generateScenarios = async (config: ScenarioGenerationFromDataConfig) => {
    try {
      setLoading(true)

      // 기존 시나리오 ID 목록
      const existingScenarios = scenarios.map((s) => s.id)

      const response = await fetch("/api/scenario-generator/user-data-based", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config, existingScenarios }),
      })

      const data = await response.json()

      if (data.status === "success") {
        setScenarios(data.scenarios)
        setActiveTab("results")
      } else {
        console.error("시나리오 생성 오류:", data.error)
        alert(`시나리오 생성 중 오류가 발생했습니다: ${data.error}`)
      }
    } catch (error) {
      console.error("시나리오 생성 API 호출 오류:", error)
      alert("시나리오 생성 API 호출 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 시나리오 선택
  const selectScenario = (scenario: ChatScenario) => {
    setSelectedScenario(scenario)
    setActiveTab("editor")
  }

  // 시나리오 업데이트
  const updateScenario = (updatedScenario: ChatScenario) => {
    setScenarios((prev) => prev.map((s) => (s.id === updatedScenario.id ? updatedScenario : s)))
    setSelectedScenario(updatedScenario)
  }

  // 시나리오 내보내기
  const exportScenarios = () => {
    const blob = new Blob([JSON.stringify(scenarios, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `user-data-based-scenarios-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">사용자 대화 기반 시나리오 생성</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchClusters} disabled={analyzing}>
            {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            데이터 분석
          </Button>
          <Button variant="outline" onClick={exportScenarios} disabled={scenarios.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="settings">설정</TabsTrigger>
          <TabsTrigger value="results" disabled={scenarios.length === 0}>
            결과 ({scenarios.length})
          </TabsTrigger>
          <TabsTrigger value="editor" disabled={!selectedScenario}>
            편집기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <UserDataBasedSettings onGenerate={generateScenarios} loading={loading} clusters={clusters} />

          {clusters.length === 0 && !analyzing && (
            <Card>
              <CardHeader>
                <CardTitle>대화 데이터 분석 필요</CardTitle>
                <CardDescription>사용자 대화 데이터를 분석하여 패턴과 클러스터를 추출해야 합니다.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
                <Button onClick={fetchClusters}>데이터 분석 시작</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {scenarios.length > 0 ? (
            <ScenarioGenerationResults scenarios={scenarios} onSelectScenario={selectScenario} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>생성된 시나리오 없음</CardTitle>
                <CardDescription>
                  아직 시나리오가 생성되지 않았습니다. 설정 탭에서 시나리오를 생성하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <Button onClick={() => setActiveTab("settings")}>설정으로 이동</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          {selectedScenario ? (
            <ScenarioEditor scenario={selectedScenario} onUpdate={updateScenario} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>선택된 시나리오 없음</CardTitle>
                <CardDescription>편집할 시나리오를 선택하세요.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <Button onClick={() => setActiveTab("results")}>결과로 이동</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
