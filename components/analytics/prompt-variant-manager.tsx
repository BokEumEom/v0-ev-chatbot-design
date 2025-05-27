"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

// 가상의 프롬프트 변형 데이터
const promptVariants = [
  {
    id: "v1",
    name: "기본 프롬프트",
    description: "기본 충전소 안내 프롬프트",
    status: "active",
    createdAt: "2023-05-01",
    metrics: {
      responseTime: 1.2,
      accuracy: 88,
      satisfaction: 90,
    },
  },
  {
    id: "v2",
    name: "상세 정보 강화",
    description: "충전소 상세 정보를 더 자세히 제공하는 프롬프트",
    status: "testing",
    createdAt: "2023-05-10",
    metrics: {
      responseTime: 1.4,
      accuracy: 92,
      satisfaction: 88,
    },
  },
  {
    id: "v3",
    name: "간결한 응답",
    description: "더 간결하고 직관적인 응답을 제공하는 프롬프트",
    status: "testing",
    createdAt: "2023-05-15",
    metrics: {
      responseTime: 0.9,
      accuracy: 85,
      satisfaction: 92,
    },
  },
]

export function PromptVariantManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newVariant, setNewVariant] = useState({
    name: "",
    description: "",
    content: "",
  })

  const handleCreateVariant = () => {
    // 실제 구현에서는 API 호출로 새 변형 생성
    console.log("Creating new variant:", newVariant)
    setIsCreateDialogOpen(false)
    setNewVariant({ name: "", description: "", content: "" })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">프롬프트 변형 관리</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>새 변형 생성</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>새 프롬프트 변형 생성</DialogTitle>
              <DialogDescription>새로운 프롬프트 변형을 생성하여 테스트하세요.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">변형 이름</Label>
                <Input
                  id="name"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                  placeholder="예: 상세 정보 강화 v2"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">설명</Label>
                <Input
                  id="description"
                  value={newVariant.description}
                  onChange={(e) => setNewVariant({ ...newVariant, description: e.target.value })}
                  placeholder="이 변형의 목적과 특징을 설명하세요"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">프롬프트 내용</Label>
                <Textarea
                  id="content"
                  value={newVariant.content}
                  onChange={(e) => setNewVariant({ ...newVariant, content: e.target.value })}
                  placeholder="프롬프트 내용을 입력하세요"
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreateVariant}>생성</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>프롬프트 변형 목록</CardTitle>
          <CardDescription>현재 활성화 및 테스트 중인 프롬프트 변형들</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead>응답 시간</TableHead>
                <TableHead>정확도</TableHead>
                <TableHead>만족도</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promptVariants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{variant.name}</TableCell>
                  <TableCell>
                    <Badge variant={variant.status === "active" ? "default" : "secondary"}>
                      {variant.status === "active" ? "활성" : "테스트"}
                    </Badge>
                  </TableCell>
                  <TableCell>{variant.createdAt}</TableCell>
                  <TableCell>{variant.metrics.responseTime}초</TableCell>
                  <TableCell>{variant.metrics.accuracy}%</TableCell>
                  <TableCell>{variant.metrics.satisfaction}%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-2">
                      상세
                    </Button>
                    {variant.status !== "active" ? (
                      <Button size="sm">활성화</Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        활성
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>A/B 테스트 결과</CardTitle>
          <CardDescription>현재 진행 중인 A/B 테스트 결과</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="comparison">
            <TabsList className="mb-4">
              <TabsTrigger value="comparison">비교 분석</TabsTrigger>
              <TabsTrigger value="timeline">시간별 추이</TabsTrigger>
            </TabsList>
            <TabsContent value="comparison">
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>지표</TableHead>
                      {promptVariants.map((variant) => (
                        <TableHead key={variant.id}>{variant.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">응답 시간</TableCell>
                      {promptVariants.map((variant) => (
                        <TableCell key={`${variant.id}-time`}>{variant.metrics.responseTime}초</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">정확도</TableCell>
                      {promptVariants.map((variant) => (
                        <TableCell key={`${variant.id}-accuracy`}>{variant.metrics.accuracy}%</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">사용자 만족도</TableCell>
                      {promptVariants.map((variant) => (
                        <TableCell key={`${variant.id}-satisfaction`}>{variant.metrics.satisfaction}%</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="timeline">
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                시간별 성능 추이 차트가 이곳에 표시됩니다.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">전체 보고서 다운로드</Button>
          <Button>테스트 종료 및 적용</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
