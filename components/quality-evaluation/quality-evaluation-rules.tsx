"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Loader2, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

export function QualityEvaluationRules() {
  const [loading, setLoading] = useState(true)
  const [rules, setRules] = useState<any[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    metric: "relevance",
    condition: "",
    weight: 0.7,
    examples: {
      pass: [""],
      fail: [""],
    },
  })

  // 규칙 로드
  useEffect(() => {
    // 실제 구현에서는 API 호출
    // 임시 데이터 설정
    const mockRules = [
      {
        id: "rule_relevance_1",
        name: "질문 키워드 포함",
        description: "응답이 사용자 질문의 주요 키워드를 포함하는지 확인",
        metric: "relevance",
        condition: "응답에 사용자 질문의 주요 키워드가 포함되어 있어야 함",
        weight: 0.7,
        examples: {
          pass: ["충전기 고장 신고가 접수되었습니다. 불편을 드려 죄송합니다."],
          fail: ["다른 문의사항이 있으시면 알려주세요."],
        },
      },
      {
        id: "rule_accuracy_1",
        name: "정확한 정보 제공",
        description: "응답이 정확한 정보를 제공하는지 확인",
        metric: "accuracy",
        condition: "응답에 제공된 정보가 회사 정책 및 사실과 일치해야 함",
        weight: 0.8,
        examples: {
          pass: ["급속 충전은 kWh당 400원, 완속 충전은 kWh당 250원입니다."],
          fail: ["충전 요금은 시간당 계산됩니다."],
        },
      },
      {
        id: "rule_completeness_1",
        name: "질문 완전 응답",
        description: "응답이 사용자 질문의 모든 부분에 답변하는지 확인",
        metric: "completeness",
        condition: "응답이 사용자 질문의 모든 부분에 답변해야 함",
        weight: 0.7,
        examples: {
          pass: ["충전 방법은 다음과 같습니다: 1. 앱 로그인, 2. 충전기 선택, 3. 결제 방법 선택, 4. 충전 시작"],
          fail: ["충전은 앱에서 시작할 수 있습니다."],
        },
      },
    ]

    setRules(mockRules)
    setLoading(false)
  }, [])

  // 규칙 추가
  const handleAddRule = async () => {
    try {
      setLoading(true)
      // 실제 구현에서는 API 호출
      const newRule = {
        id: `rule_${Date.now()}`,
        ...formData,
      }
      setRules([...rules, newRule])
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("규칙 추가 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // 규칙 수정
  const handleEditRule = async () => {
    if (!selectedRule) return

    try {
      setLoading(true)
      // 실제 구현에서는 API 호출
      const updatedRules = rules.map((rule) => (rule.id === selectedRule.id ? { ...rule, ...formData } : rule))
      setRules(updatedRules)
      setIsEditDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("규칙 수정 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // 규칙 삭제
  const handleDeleteRule = async (ruleId: string) => {
    try {
      setLoading(true)
      // 실제 구현에서는 API 호출
      const updatedRules = rules.filter((rule) => rule.id !== ruleId)
      setRules(updatedRules)
    } catch (error) {
      console.error("규칙 삭제 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      metric: "relevance",
      condition: "",
      weight: 0.7,
      examples: {
        pass: [""],
        fail: [""],
      },
    })
    setSelectedRule(null)
  }

  // 수정 다이얼로그 열기
  const openEditDialog = (rule: any) => {
    setSelectedRule(rule)
    setFormData({
      name: rule.name,
      description: rule.description,
      metric: rule.metric,
      condition: rule.condition,
      weight: rule.weight,
      examples: {
        pass: [...rule.examples.pass],
        fail: [...rule.examples.fail],
      },
    })
    setIsEditDialogOpen(true)
  }

  // 폼 데이터 업데이트
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 예시 업데이트
  const updateExample = (type: "pass" | "fail", index: number, value: string) => {
    const examples = { ...formData.examples }
    examples[type][index] = value
    setFormData((prev) => ({
      ...prev,
      examples,
    }))
  }

  // 예시 추가
  const addExample = (type: "pass" | "fail") => {
    const examples = { ...formData.examples }
    examples[type].push("")
    setFormData((prev) => ({
      ...prev,
      examples,
    }))
  }

  // 예시 삭제
  const removeExample = (type: "pass" | "fail", index: number) => {
    const examples = { ...formData.examples }
    examples[type].splice(index, 1)
    setFormData((prev) => ({
      ...prev,
      examples,
    }))
  }

  if (loading && rules.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>평가 규칙</CardTitle>
          <CardDescription>품질 평가를 위한 규칙 관리</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              규칙 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 평가 규칙 추가</DialogTitle>
              <DialogDescription>품질 평가를 위한 새 규칙을 추가합니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">규칙 이름</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="규칙 이름"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metric">평가 지표</Label>
                  <Select value={formData.metric} onValueChange={(value) => updateFormData("metric", value)}>
                    <SelectTrigger id="metric">
                      <SelectValue placeholder="지표 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">관련성</SelectItem>
                      <SelectItem value="accuracy">정확성</SelectItem>
                      <SelectItem value="completeness">완전성</SelectItem>
                      <SelectItem value="clarity">명확성</SelectItem>
                      <SelectItem value="helpfulness">유용성</SelectItem>
                      <SelectItem value="conciseness">간결성</SelectItem>
                      <SelectItem value="tone">어조</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="규칙에 대한 설명"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">조건</Label>
                <Textarea
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => updateFormData("condition", e.target.value)}
                  placeholder="규칙 적용 조건"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="weight">가중치</Label>
                  <span className="text-sm font-medium">{formData.weight.toFixed(2)}</span>
                </div>
                <Slider
                  id="weight"
                  value={[formData.weight]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={(value) => updateFormData("weight", value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label>통과 예시</Label>
                {formData.examples.pass.map((example, index) => (
                  <div key={`pass-${index}`} className="flex gap-2">
                    <Input
                      value={example}
                      onChange={(e) => updateExample("pass", index, e.target.value)}
                      placeholder="통과 예시"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeExample("pass", index)}
                      disabled={formData.examples.pass.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addExample("pass")}>
                  <Plus className="mr-2 h-4 w-4" />
                  예시 추가
                </Button>
              </div>

              <div className="space-y-2">
                <Label>실패 예시</Label>
                {formData.examples.fail.map((example, index) => (
                  <div key={`fail-${index}`} className="flex gap-2">
                    <Input
                      value={example}
                      onChange={(e) => updateExample("fail", index, e.target.value)}
                      placeholder="실패 예시"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeExample("fail", index)}
                      disabled={formData.examples.fail.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addExample("fail")}>
                  <Plus className="mr-2 h-4 w-4" />
                  예시 추가
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleAddRule} disabled={!formData.name || !formData.condition}>
                규칙 추가
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">등록된 규칙이 없습니다.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>규칙 이름</TableHead>
                <TableHead>평가 지표</TableHead>
                <TableHead>설명</TableHead>
                <TableHead className="text-right">가중치</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    {{
                      relevance: "관련성",
                      accuracy: "정확성",
                      completeness: "완전성",
                      clarity: "명확성",
                      helpfulness: "유용성",
                      conciseness: "간결성",
                      tone: "어조",
                    }[rule.metric] || rule.metric}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">{rule.description}</TableCell>
                  <TableCell className="text-right">{rule.weight.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">메뉴 열기</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(rule)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>수정</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteRule(rule.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>삭제</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* 규칙 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>평가 규칙 수정</DialogTitle>
            <DialogDescription>품질 평가 규칙을 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">규칙 이름</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="규칙 이름"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-metric">평가 지표</Label>
                <Select value={formData.metric} onValueChange={(value) => updateFormData("metric", value)}>
                  <SelectTrigger id="edit-metric">
                    <SelectValue placeholder="지표 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">관련성</SelectItem>
                    <SelectItem value="accuracy">정확성</SelectItem>
                    <SelectItem value="completeness">완전성</SelectItem>
                    <SelectItem value="clarity">명확성</SelectItem>
                    <SelectItem value="helpfulness">유용성</SelectItem>
                    <SelectItem value="conciseness">간결성</SelectItem>
                    <SelectItem value="tone">어조</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">설명</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="규칙에 대한 설명"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-condition">조건</Label>
              <Textarea
                id="edit-condition"
                value={formData.condition}
                onChange={(e) => updateFormData("condition", e.target.value)}
                placeholder="규칙 적용 조건"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="edit-weight">가중치</Label>
                <span className="text-sm font-medium">{formData.weight.toFixed(2)}</span>
              </div>
              <Slider
                id="edit-weight"
                value={[formData.weight]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={(value) => updateFormData("weight", value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label>통과 예시</Label>
              {formData.examples.pass.map((example, index) => (
                <div key={`edit-pass-${index}`} className="flex gap-2">
                  <Input
                    value={example}
                    onChange={(e) => updateExample("pass", index, e.target.value)}
                    placeholder="통과 예시"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeExample("pass", index)}
                    disabled={formData.examples.pass.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addExample("pass")}>
                <Plus className="mr-2 h-4 w-4" />
                예시 추가
              </Button>
            </div>

            <div className="space-y-2">
              <Label>실패 예시</Label>
              {formData.examples.fail.map((example, index) => (
                <div key={`edit-fail-${index}`} className="flex gap-2">
                  <Input
                    value={example}
                    onChange={(e) => updateExample("fail", index, e.target.value)}
                    placeholder="실패 예시"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeExample("fail", index)}
                    disabled={formData.examples.fail.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addExample("fail")}>
                <Plus className="mr-2 h-4 w-4" />
                예시 추가
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEditRule} disabled={!formData.name || !formData.condition}>
              규칙 수정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
