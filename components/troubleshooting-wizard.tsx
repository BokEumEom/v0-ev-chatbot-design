"use client"

import { useReducer, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Save,
  Printer,
  ChevronRight,
  Clock,
  History,
  BookOpen,
} from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

import { chargingTroubleshootingTree } from "@/data/troubleshooting-tree"
import type { WizardState, WizardAction, TroubleshootingWizardProps, DiagnosisHistory } from "@/types/troubleshooting"

// 마법사 상태 리듀서
const wizardReducer = (state: WizardState, action: WizardAction): WizardState => {
  switch (action.type) {
    case "SELECT_OPTION":
      return {
        ...state,
        currentNodeId: action.nextNodeId,
        history: [...state.history, state.currentNodeId],
        completed: false,
        userInput: { ...state.userInput },
      }
    case "GO_BACK":
      if (state.history.length === 0) {
        return state
      }
      const newHistory = [...state.history]
      const previousNodeId = newHistory.pop() || "root"
      return {
        ...state,
        currentNodeId: previousNodeId,
        history: newHistory,
        completed: false,
        userInput: { ...state.userInput },
      }
    case "RESET":
      return {
        currentNodeId: "root",
        history: [],
        completed: false,
        userInput: {},
      }
    case "COMPLETE":
      return {
        ...state,
        completed: true,
        userInput: { ...state.userInput },
      }
    case "SET_USER_INPUT":
      return {
        ...state,
        userInput: {
          ...state.userInput,
          [action.field]: action.value,
        },
      }
    default:
      return state
  }
}

export function TroubleshootingWizard({ onComplete, onRedirect }: TroubleshootingWizardProps) {
  // 초기 상태
  const initialState: WizardState = {
    currentNodeId: "root",
    history: [],
    completed: false,
    userInput: {},
  }

  // 상태 관리
  const [state, dispatch] = useReducer(wizardReducer, initialState)
  const [activeTab, setActiveTab] = useState<string>("diagnosis")
  const [diagnosisHistory, setDiagnosisHistory] = useState<DiagnosisHistory[]>([])
  const [showExtraInfo, setShowExtraInfo] = useState(false)
  const [customNotes, setCustomNotes] = useState("")

  // 현재 노드 가져오기
  const currentNode = chargingTroubleshootingTree[state.currentNodeId] || chargingTroubleshootingTree["root"]

  // 진행 상태 계산 (최대 깊이를 10으로 가정)
  const maxDepth = 10
  const progress = Math.min(100, (state.history.length / maxDepth) * 100)

  // 리디렉션 처리
  useEffect(() => {
    if (currentNode?.type === "redirect" && currentNode.redirectTo && onRedirect) {
      onRedirect(currentNode.redirectTo)
    }
  }, [currentNode, onRedirect])

  // 완료 처리
  useEffect(() => {
    if (currentNode?.type === "solution" && !state.completed) {
      dispatch({ type: "COMPLETE" })

      // 진단 히스토리에 추가
      const newHistoryItem: DiagnosisHistory = {
        id: `history_${Date.now()}`,
        date: new Date(),
        problem: currentNode.title,
        solution: currentNode.solution?.steps.join("\n"),
        path: state.history.map((id) => chargingTroubleshootingTree[id]?.title || "").filter(Boolean),
        userInput: { ...state.userInput },
        notes: customNotes,
      }

      setDiagnosisHistory((prev) => [newHistoryItem, ...prev])

      if (onComplete) {
        onComplete(currentNode)
      }
    }
  }, [currentNode, state.completed, onComplete, state.history, state.userInput, customNotes])

  // 아이콘 컴포넌트
  const IconComponent = currentNode?.icon || HelpCircle

  // 진단 결과 저장
  const saveDiagnosis = () => {
    if (currentNode?.type !== "solution") return

    const diagnosisResult = {
      title: currentNode.title,
      description: currentNode.description,
      solution: currentNode.solution?.steps,
      additionalInfo: currentNode.solution?.additionalInfo,
      userInput: state.userInput,
      notes: customNotes,
      date: new Date().toISOString(),
    }

    // 로컬 스토리지에 저장
    const savedDiagnoses = JSON.parse(localStorage.getItem("diagnosisResults") || "[]")
    localStorage.setItem("diagnosisResults", JSON.stringify([diagnosisResult, ...savedDiagnoses]))

    alert("진단 결과가 저장되었습니다.")
  }

  // 진단 결과 인쇄
  const printDiagnosis = () => {
    if (currentNode?.type !== "solution") return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
      <html>
        <head>
          <title>전기차 충전 문제 진단 결과</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { color: #166534; }
            h2 { color: #166534; margin-top: 20px; }
            .solution { background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .step { margin: 10px 0; }
            .notes { background: #fffbeb; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>전기차 충전 문제 진단 결과</h1>
          <p><strong>진단일시:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>문제:</strong> ${currentNode.title}</p>
          <p><strong>설명:</strong> ${currentNode.description || ""}</p>
          
          <h2>해결 방법</h2>
          <div class="solution">
            ${currentNode.solution?.steps.map((step, i) => `<div class="step">${step}</div>`).join("") || ""}
          </div>
          
          ${
            currentNode.solution?.additionalInfo
              ? `
            <h2>추가 정보</h2>
            <p>${currentNode.solution.additionalInfo}</p>
          `
              : ""
          }
          
          ${
            Object.keys(state.userInput).length > 0
              ? `
            <h2>사용자 입력 정보</h2>
            <ul>
              ${Object.entries(state.userInput)
                .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
                .join("")}
            </ul>
          `
              : ""
          }
          
          ${
            customNotes
              ? `
            <h2>메모</h2>
            <div class="notes">${customNotes.replace(/\n/g, "<br>")}</div>
          `
              : ""
          }
          
          <div class="footer">
            <p>전기차 충전 도우미 - 문제 진단 마법사</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  // 사용자 입력 처리
  const handleUserInput = (field: string, value: string) => {
    dispatch({ type: "SET_USER_INPUT", field, value })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className="h-5 w-5 text-primary" />
            <CardTitle>{currentNode?.title || "문제 진단"}</CardTitle>
            {currentNode?.type === "solution" && (
              <Badge variant="outline" className="ml-2 bg-green-50">
                해결책 찾음
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {currentNode?.type === "solution" && (
              <>
                <Button variant="outline" size="icon" onClick={saveDiagnosis} title="진단 결과 저장">
                  <Save className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={printDiagnosis} title="진단 결과 인쇄">
                  <Printer className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={() => dispatch({ type: "RESET" })}>
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">처음부터 다시 시작</span>
            </Button>
          </div>
        </div>
        <CardDescription>{currentNode?.description || "단계별로 문제를 진단하고 해결책을 찾아보세요."}</CardDescription>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>시작</span>
            <span>진행 중</span>
            <span>완료</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diagnosis" className="flex items-center gap-1">
            <HelpCircle className="h-4 w-4" />
            <span>진단</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            <span>히스토리</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>자료</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnosis" className="p-0">
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.currentNodeId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentNode?.type === "question" && (
                  <div className="space-y-4">
                    {/* 사용자 입력 필드 (특정 노드에서만 표시) */}
                    {currentNode.id === "charging_error_code" && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">오류 코드를 입력해주세요</label>
                        <Input
                          placeholder="예: E-101"
                          value={state.userInput?.errorCode || ""}
                          onChange={(e) => handleUserInput("errorCode", e.target.value)}
                        />
                      </div>
                    )}

                    {currentNode.id === "charging_vehicle_issue_solution" && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">차량 모델</label>
                        <Input
                          placeholder="예: 아이오닉 5"
                          value={state.userInput?.vehicleModel || ""}
                          onChange={(e) => handleUserInput("vehicleModel", e.target.value)}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      {currentNode.options?.map((option) => (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.1, delay: 0.1 }}
                        >
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left h-auto py-3 px-4 group"
                            onClick={() => dispatch({ type: "SELECT_OPTION", nextNodeId: option.nextNodeId })}
                          >
                            <span>{option.text}</span>
                            <ChevronRight className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {currentNode?.type === "solution" && currentNode.solution && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-lg bg-green-50 border border-green-100 p-4"
                    >
                      <div className="font-medium flex items-center gap-2 mb-3 text-green-700">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span>해결 방법</span>
                      </div>
                      <div className="space-y-3">
                        {currentNode.solution.steps.map((step, index) => (
                          <motion.p
                            key={index}
                            className="text-sm flex items-start gap-2"
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 + index * 0.1 }}
                          >
                            <span className="inline-flex items-center justify-center bg-green-100 text-green-800 rounded-full w-5 h-5 text-xs font-medium flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span>{step.replace(/^\d+\.\s/, "")}</span>
                          </motion.p>
                        ))}
                      </div>
                    </motion.div>

                    {currentNode.solution.additionalInfo && (
                      <motion.div
                        className="text-sm text-muted-foreground bg-muted p-4 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <p>{currentNode.solution.additionalInfo}</p>
                      </motion.div>
                    )}

                    {currentNode.solution.imageUrl && (
                      <motion.div
                        className="mt-4 relative aspect-video overflow-hidden rounded-lg border"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                      >
                        <Image
                          src={currentNode.solution.imageUrl || "/placeholder.svg"}
                          alt="문제 해결 가이드"
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <Button variant="outline" className="w-full" onClick={() => setShowExtraInfo(!showExtraInfo)}>
                        {showExtraInfo ? "추가 정보 숨기기" : "추가 정보 및 메모"}
                      </Button>
                    </motion.div>

                    {showExtraInfo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium mb-1">메모</label>
                          <Textarea
                            placeholder="이 문제에 대한 메모나 추가 정보를 기록하세요..."
                            value={customNotes}
                            onChange={(e) => setCustomNotes(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>

                        {currentNode.solution.videoUrl && (
                          <div>
                            <label className="block text-sm font-medium mb-1">관련 동영상</label>
                            <Button variant="outline" className="w-full" asChild>
                              <a href={currentNode.solution.videoUrl} target="_blank" rel="noopener noreferrer">
                                동영상 가이드 보기
                              </a>
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-between border-t p-4">
            <Button
              variant="ghost"
              onClick={() => dispatch({ type: "GO_BACK" })}
              disabled={state.history.length === 0}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              이전 단계
            </Button>

            {currentNode.type === "solution" && (
              <Button onClick={() => dispatch({ type: "RESET" })} className="gap-1">
                <RotateCcw className="h-4 w-4" />
                다른 문제 진단하기
              </Button>
            )}
          </CardFooter>
        </TabsContent>

        <TabsContent value="history">
          <CardContent className="pt-6">
            {diagnosisHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>진단 히스토리가 없습니다.</p>
                <p className="text-sm">문제를 진단하면 여기에 기록됩니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {diagnosisHistory.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{item.problem}</CardTitle>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{item.date.toLocaleDateString()}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="text-sm text-muted-foreground mb-2">
                        <strong>진단 경로:</strong> {item.path.join(" → ")}
                      </div>
                      {item.notes && (
                        <div className="text-sm bg-muted p-2 rounded mb-2">
                          <strong>메모:</strong> {item.notes}
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          // 이 진단 결과로 돌아가는 로직 (실제 구현에서는 상태 복원)
                          alert("이전 진단 결과를 불러옵니다.")
                        }}
                      >
                        이 진단 결과 다시 보기
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </TabsContent>

        <TabsContent value="resources">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">관련 자료</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">충전 문제 해결 가이드</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground mb-3">일반적인 충전 문제에 대한 종합 가이드입니다.</p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href="/help/charging" target="_blank" rel="noreferrer">
                        가이드 보기
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">오류 코드 목록</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      충전기 및 차량의 오류 코드와 의미를 확인하세요.
                    </p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href="/help/error-codes" target="_blank" rel="noreferrer">
                        오류 코드 보기
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">동영상 튜토리얼</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      충전 문제 해결을 위한 단계별 동영상 가이드입니다.
                    </p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href="/help/videos" target="_blank" rel="noreferrer">
                        동영상 보기
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">자주 묻는 질문</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground mb-3">충전 관련 자주 묻는 질문과 답변을 확인하세요.</p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href="/help/faq" target="_blank" rel="noreferrer">
                        FAQ 보기
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
