"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, BarChart } from "lucide-react"
import type { EvaluationResult } from "@/types/quality-evaluation"

interface QualityResultsTableProps {
  evaluationResults: EvaluationResult[]
}

export function QualityResultsTable({ evaluationResults = [] }: QualityResultsTableProps) {
  const [selectedResult, setSelectedResult] = useState<EvaluationResult | null>(null)

  // 평가 결과가 없는 경우 안내 메시지 표시
  if (!Array.isArray(evaluationResults) || evaluationResults.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">평가 결과가 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  // 평가 방법에 따른 배지 색상
  const methodColors: Record<string, string> = {
    ai: "bg-blue-100 text-blue-800",
    rule: "bg-green-100 text-green-800",
    human: "bg-purple-100 text-purple-800",
    hybrid: "bg-amber-100 text-amber-800",
  }

  // 평가 방법 한글 표시
  const methodNames: Record<string, string> = {
    ai: "AI 평가",
    rule: "규칙 기반",
    human: "사람 평가",
    hybrid: "하이브리드",
  }

  // 점수에 따른 색상 클래스
  const getScoreColorClass = (score: number) => {
    if (score >= 8) return "text-green-600 font-medium"
    if (score >= 6) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>평가 결과 목록</CardTitle>
          <CardDescription>총 {evaluationResults.length}개의 평가 결과</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>평가 ID</TableHead>
                <TableHead>사용자 메시지</TableHead>
                <TableHead>평가 방법</TableHead>
                <TableHead className="text-right">종합 점수</TableHead>
                <TableHead className="text-right">평가 일시</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluationResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.id.substring(0, 8)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{result.userMessage || "메시지 없음"}</TableCell>
                  <TableCell>
                    <Badge className={methodColors[result.method] || ""} variant="outline">
                      {methodNames[result.method] || result.method}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right ${getScoreColorClass(result.metrics?.overallScore || 0)}`}>
                    {result.metrics?.overallScore?.toFixed(1) || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">{new Date(result.evaluatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">메뉴 열기</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedResult(result)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>상세 보기</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart className="mr-2 h-4 w-4" />
                          <span>지표 분석</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedResult && (
        <Card>
          <CardHeader>
            <CardTitle>평가 상세 정보</CardTitle>
            <CardDescription>평가 ID: {selectedResult.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">사용자 메시지</h3>
                <p className="text-sm p-3 bg-muted rounded-md">{selectedResult.userMessage || "메시지 없음"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">봇 응답</h3>
                <p className="text-sm p-3 bg-muted rounded-md">{selectedResult.botResponse || "응답 없음"}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">품질 지표</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedResult.metrics &&
                  Object.entries(selectedResult.metrics).map(([key, value]) => {
                    if (key === "overallScore") return null
                    const metricName =
                      {
                        relevance: "관련성",
                        accuracy: "정확성",
                        completeness: "완전성",
                        clarity: "명확성",
                        helpfulness: "유용성",
                        conciseness: "간결성",
                        tone: "어조",
                      }[key] || key

                    return (
                      <div key={key} className="p-2 border rounded-md">
                        <div className="text-xs text-muted-foreground">{metricName}</div>
                        <div className={`text-lg font-semibold ${getScoreColorClass(value)}`}>{value.toFixed(1)}</div>
                      </div>
                    )
                  })}
                <div className="p-2 border rounded-md bg-muted">
                  <div className="text-xs text-muted-foreground">종합 점수</div>
                  <div
                    className={`text-lg font-semibold ${getScoreColorClass(selectedResult.metrics?.overallScore || 0)}`}
                  >
                    {selectedResult.metrics?.overallScore?.toFixed(1) || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {selectedResult.feedback && (
              <div>
                <h3 className="text-sm font-medium mb-1">피드백</h3>
                <p className="text-sm p-3 bg-muted rounded-md">{selectedResult.feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
