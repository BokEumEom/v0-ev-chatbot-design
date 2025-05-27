"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import type { PromptVersion, PromptVersionStatus } from "@/types/prompt-management"

// 상태별 배지 스타일
const statusBadgeStyles: Record<PromptVersionStatus, string> = {
  draft: "bg-gray-200 text-gray-800",
  testing: "bg-blue-200 text-blue-800",
  active: "bg-green-200 text-green-800",
  inactive: "bg-yellow-200 text-yellow-800",
  archived: "bg-red-200 text-red-800",
}

// 상태별 한글 표시
const statusLabels: Record<PromptVersionStatus, string> = {
  draft: "초안",
  testing: "테스트 중",
  active: "활성",
  inactive: "비활성",
  archived: "보관됨",
}

interface PromptVersionHistoryProps {
  versions: PromptVersion[]
  selectedVersionId: string | null
  onSelectVersion: (id: string) => void
}

export function PromptVersionHistory({ versions, selectedVersionId, onSelectVersion }: PromptVersionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<keyof PromptVersion>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // 검색, 필터링, 정렬 적용
  const filteredVersions = versions
    .filter((version) => {
      // 검색어 필터링
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm === "" ||
        version.name.toLowerCase().includes(searchLower) ||
        version.description.toLowerCase().includes(searchLower) ||
        version.version.toLowerCase().includes(searchLower)

      // 상태 필터링
      const matchesStatus = statusFilter === "all" || version.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // 정렬
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
      }

      // 숫자나 다른 타입의 경우 (실제로는 더 정교한 처리 필요)
      return sortDirection === "asc" ? (fieldA as any) - (fieldB as any) : (fieldB as any) - (fieldA as any)
    })

  // 정렬 토글
  const toggleSort = (field: keyof PromptVersion) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>프롬프트 버전 히스토리</CardTitle>
        <CardDescription>모든 프롬프트 버전의 히스토리와 상태를 확인합니다</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="버전 검색..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="draft">초안</SelectItem>
              <SelectItem value="testing">테스트 중</SelectItem>
              <SelectItem value="active">활성</SelectItem>
              <SelectItem value="inactive">비활성</SelectItem>
              <SelectItem value="archived">보관됨</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button variant="ghost" className="p-0 font-medium" onClick={() => toggleSort("name")}>
                    이름
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-medium" onClick={() => toggleSort("version")}>
                    버전
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">설명</TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-medium" onClick={() => toggleSort("createdAt")}>
                    생성일
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="hidden md:table-cell">성능</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVersions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                filteredVersions.map((version) => (
                  <TableRow
                    key={version.id}
                    className={selectedVersionId === version.id ? "bg-muted/50" : "cursor-pointer hover:bg-muted/50"}
                    onClick={() => onSelectVersion(version.id)}
                  >
                    <TableCell className="font-medium">{version.name}</TableCell>
                    <TableCell>{version.version}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px] truncate">{version.description}</TableCell>
                    <TableCell>{new Date(version.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={statusBadgeStyles[version.status]}>{statusLabels[version.status]}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {version.performance ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-16">
                            <div className="text-xs text-muted-foreground">품질</div>
                            <div className="font-medium">{version.performance.qualityScore.toFixed(1)}</div>
                          </div>
                          <div className="w-16">
                            <div className="text-xs text-muted-foreground">평가</div>
                            <div className="font-medium">{version.performance.userRating.toFixed(1)}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">데이터 없음</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
