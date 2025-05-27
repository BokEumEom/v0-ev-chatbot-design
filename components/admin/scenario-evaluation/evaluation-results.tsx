"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ThumbsDown, AlertTriangle, CheckCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface EvaluationResultsProps {
  onImprove: () => void
  isLoading: boolean
}

// 샘플 평가 결과 데이터
const sampleResults = [
  {
    id: "scenario-1",
    title: "충전 케이블 연결 문제",
    score: 85,
    strengths: ["명확한 문제 정의", "자연스러운 대화 흐름"],
    weaknesses: ["해결책이 너무 기술적임"],
    status: "pass",
  },
  {
    id: "scenario-2",
    title: "앱 결제 오류",
    score: 65,
    strengths: ["현실적인 사용자 질문"],
    weaknesses: ["해결 단계가 불명확함", "대화가 너무 짧음"],
    status: "warning",
  },
  {
    id: "scenario-3",
    title: "충전소 위치 찾기",
    score: 45,
    strengths: ["간결한 대화"],
    weaknesses: ["너무 단순함", "다양한 상황 고려 부족", "사용자 감정 반영 안 됨"],
    status: "fail",
  },
  {
    id: "scenario-4",
    title: "충전 속도 저하 문제",
    score: 78,
    strengths: ["기술적 설명이 명확함", "다양한 원인 제시"],
    weaknesses: ["해결책이 제한적임"],
    status: "pass",
  },
  {
    id: "scenario-5",
    title: "회원 등록 문제",
    score: 92,
    strengths: ["단계별 안내가 명확함", "오류 상황 대처 방법 포함", "친절한 어조"],
    weaknesses: [],
    status: "pass",
  },
]

export function EvaluationResults({ onImprove, isLoading }: EvaluationResultsProps) {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])

  const toggleScenario = (id: string) => {
    setSelectedScenarios((prev) => (prev.includes(id) ? prev.filter((scenarioId) => scenarioId !== id) : [...prev, id]))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "fail":
        return <ThumbsDown className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">평가 결과</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedScenarios(sampleResults.map((r) => r.id))}>
            모두 선택
          </Button>
          <Button variant="outline" onClick={() => setSelectedScenarios([])} disabled={selectedScenarios.length === 0}>
            선택 해제
          </Button>
          <Button onClick={onImprove} disabled={selectedScenarios.length === 0 || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                개선 중...
              </>
            ) : (
              <>선택한 시나리오 개선</>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>시나리오 평가 요약</CardTitle>
          <CardDescription>
            총 {sampleResults.length}개 시나리오 중 {sampleResults.filter((r) => r.status === "pass").length}개 통과,{" "}
            {sampleResults.filter((r) => r.status === "warning").length}개 경고,{" "}
            {sampleResults.filter((r) => r.status === "fail").length}개 실패
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">선택</TableHead>
                <TableHead className="w-12">상태</TableHead>
                <TableHead>시나리오</TableHead>
                <TableHead>품질 점수</TableHead>
                <TableHead>강점</TableHead>
                <TableHead>약점</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedScenarios.includes(result.id)}
                      onChange={() => toggleScenario(result.id)}
                      className="h-4 w-4"
                    />
                  </TableCell>
                  <TableCell>{getStatusIcon(result.status)}</TableCell>
                  <TableCell>{result.title}</TableCell>
                  <TableCell className={getScoreColor(result.score)}>{result.score}/100</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {result.strengths.map((strength, i) => (
                        <Badge key={i} variant="outline" className="bg-green-50">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {result.weaknesses.map((weakness, i) => (
                        <Badge key={i} variant="outline" className="bg-red-50">
                          {weakness}
                        </Badge>
                      ))}
                      {result.weaknesses.length === 0 && <span className="text-muted-foreground text-sm">없음</span>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="pt-4">
          <Button onClick={onImprove} disabled={selectedScenarios.length === 0 || isLoading} className="ml-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                개선 중...
              </>
            ) : (
              <>선택한 시나리오 개선</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
