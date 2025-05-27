"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ArrowUpDown, MessageSquare, Users, Tag } from "lucide-react"
import type { ConversationPattern, ConversationCluster } from "@/types/conversation-data-processor"

interface ConversationPatternsVisualizationProps {
  patterns: ConversationPattern[]
  clusters: ConversationCluster[]
}

export function ConversationPatternsVisualization({ patterns, clusters }: ConversationPatternsVisualizationProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<"frequency" | "pattern">("frequency")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("patterns")

  // 패턴 필터링
  const filteredPatterns = patterns.filter((pattern) => {
    const matchesSearch =
      searchTerm === "" ||
      pattern.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.examples.some((ex) => ex.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCluster =
      selectedCluster === null ||
      clusters.find((c) => c.id === selectedCluster)?.patterns.some((p) => p.id === pattern.id)

    return matchesSearch && matchesCluster
  })

  // 패턴 정렬
  const sortedPatterns = [...filteredPatterns].sort((a, b) => {
    if (sortField === "frequency") {
      return sortDirection === "asc" ? a.frequency - b.frequency : b.frequency - a.frequency
    } else {
      return sortDirection === "asc" ? a.pattern.localeCompare(b.pattern) : b.pattern.localeCompare(a.pattern)
    }
  })

  // 정렬 토글
  const toggleSort = (field: "frequency" | "pattern") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="patterns">패턴 목록</TabsTrigger>
          <TabsTrigger value="clusters">클러스터 목록</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>대화 패턴 분석</CardTitle>
              <CardDescription>사용자 대화에서 추출된 {patterns.length}개의 패턴</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="패턴 또는 예시 검색..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={selectedCluster || "all"}
                      onValueChange={(value) => setSelectedCluster(value || "all")}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="클러스터 필터" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">모든 클러스터</SelectItem>
                        {clusters.map((cluster) => (
                          <SelectItem key={cluster.id} value={cluster.id}>
                            {cluster.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedCluster(null)
                      }}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%]">
                          <Button variant="ghost" className="p-0 font-medium" onClick={() => toggleSort("pattern")}>
                            패턴
                            {sortField === "pattern" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="w-[20%]">
                          <Button variant="ghost" className="p-0 font-medium" onClick={() => toggleSort("frequency")}>
                            빈도
                            {sortField === "frequency" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="w-[30%]">관련 정보</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPatterns.length > 0 ? (
                        sortedPatterns.map((pattern) => (
                          <TableRow key={pattern.id}>
                            <TableCell className="font-medium">
                              {pattern.pattern}
                              <div className="mt-1 text-xs text-muted-foreground">
                                {pattern.examples[0] &&
                                  `"${pattern.examples[0].substring(0, 50)}${pattern.examples[0].length > 50 ? "..." : ""}"`}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{pattern.frequency}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {pattern.relatedIntents.slice(0, 2).map((intent, i) => (
                                  <Badge key={i} variant="outline" className="flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {intent}
                                  </Badge>
                                ))}
                                {pattern.userTypes.slice(0, 2).map((type, i) => (
                                  <Badge key={i} variant="outline" className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {type}
                                  </Badge>
                                ))}
                                {pattern.averageSentimentScore !== undefined && (
                                  <Badge
                                    variant={pattern.averageSentimentScore >= 0 ? "default" : "destructive"}
                                    className="flex items-center gap-1"
                                  >
                                    감정: {pattern.averageSentimentScore.toFixed(2)}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            검색 결과가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>대화 클러스터 분석</CardTitle>
              <CardDescription>패턴이 그룹화된 {clusters.length}개의 클러스터</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clusters.map((cluster) => (
                  <Card key={cluster.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        {cluster.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline">{cluster.patterns.length}개 패턴</Badge>
                        <Badge variant={cluster.resolutionRate >= 0.7 ? "default" : "secondary"}>
                          해결률 {(cluster.resolutionRate * 100).toFixed(0)}%
                        </Badge>
                        {cluster.averageSatisfactionScore !== undefined && (
                          <Badge variant={cluster.averageSatisfactionScore >= 4 ? "default" : "secondary"}>
                            만족도 {cluster.averageSatisfactionScore.toFixed(1)}/5
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-medium">중심 패턴: {cluster.centralPattern}</div>
                      <Separator className="my-2" />
                      <div className="text-sm">일반적인 이슈 타입:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cluster.commonIssueTypes.map((issue, i) => (
                          <Badge key={i} variant="outline">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                      <Separator className="my-2" />
                      <div className="text-sm">주요 패턴:</div>
                      <ScrollArea className="h-24 mt-1">
                        <div className="space-y-1">
                          {cluster.patterns
                            .sort((a, b) => b.frequency - a.frequency)
                            .slice(0, 5)
                            .map((pattern) => (
                              <div key={pattern.id} className="flex justify-between text-sm">
                                <span className="truncate">{pattern.pattern}</span>
                                <Badge variant="outline" className="ml-2 shrink-0">
                                  {pattern.frequency}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedCluster(cluster.id)
                            setActiveTab("patterns")
                          }}
                        >
                          모든 패턴 보기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
