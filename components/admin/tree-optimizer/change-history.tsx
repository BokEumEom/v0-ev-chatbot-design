"use client"

import { useState, useEffect } from "react"
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
} from "@/components/ui/dialog"
import { RotateCcw } from "lucide-react"
import type { TreeChangeHistory } from "@/types/tree-optimizer"
import { treeOptimizerService } from "@/services/tree-optimizer-service"
import { format } from "date-fns"

interface ChangeHistoryProps {
  onRollback: (changeId: string) => void
}

export function ChangeHistory({ onRollback }: ChangeHistoryProps) {
  const [changes, setChanges] = useState<TreeChangeHistory[]>([])
  const [selectedChange, setSelectedChange] = useState<TreeChangeHistory | null>(null)
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 변경 이력 로드
  useEffect(() => {
    setIsLoading(true)
    // 비동기 처리를 시뮬레이션
    setTimeout(() => {
      const history = treeOptimizerService.getChangeHistory()
      setChanges(history)
      setIsLoading(false)
    }, 500)
  }, [])

  // 롤백 다이얼로그 열기
  const openRollbackDialog = (change: TreeChangeHistory) => {
    setSelectedChange(change)
    setIsRollbackDialogOpen(true)
  }

  // 롤백 다이얼로그 닫기
  const closeRollbackDialog = () => {
    setIsRollbackDialogOpen(false)
    setSelectedChange(null)
  }

  // 롤백 실행
  const handleRollback = () => {
    if (selectedChange) {
      onRollback(selectedChange.id)
      closeRollbackDialog()

      // 변경 이력 다시 로드
      setTimeout(() => {
        const history = treeOptimizerService.getChangeHistory()
        setChanges(history)
      }, 500)
    }
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">날짜</TableHead>
                <TableHead>설명</TableHead>
                <TableHead>작성자</TableHead>
                <TableHead className="w-[100px]">변경 수</TableHead>
                <TableHead className="w-[100px]">상태</TableHead>
                <TableHead className="w-[100px]">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    변경 이력이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                changes.map((change) => (
                  <TableRow key={change.id}>
                    <TableCell className="font-medium">
                      {format(new Date(change.timestamp), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {change.rollbackId ? (
                          <Badge variant="outline" className="bg-yellow-50">
                            롤백
                          </Badge>
                        ) : null}
                        {change.description}
                      </div>
                    </TableCell>
                    <TableCell>{change.author}</TableCell>
                    <TableCell>{change.changes.length}</TableCell>
                    <TableCell>
                      {change.applied ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          적용됨
                        </Badge>
                      ) : (
                        <Badge variant="secondary">롤백됨</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {change.applied && !change.rollbackId ? (
                        <Button variant="ghost" size="sm" onClick={() => openRollbackDialog(change)}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isRollbackDialogOpen} onOpenChange={setIsRollbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>변경 롤백</DialogTitle>
            <DialogDescription>
              이 변경을 롤백하시겠습니까? 롤백하면 이 변경 이전 상태로 트리가 복원됩니다.
            </DialogDescription>
          </DialogHeader>

          {selectedChange && (
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium">변경 설명:</span>
                  <p className="text-sm mt-1">{selectedChange.description}</p>
                </div>

                <div>
                  <span className="text-sm font-medium">변경 날짜:</span>
                  <p className="text-sm mt-1">{format(new Date(selectedChange.timestamp), "yyyy-MM-dd HH:mm:ss")}</p>
                </div>

                <div>
                  <span className="text-sm font-medium">작성자:</span>
                  <p className="text-sm mt-1">{selectedChange.author}</p>
                </div>

                <div>
                  <span className="text-sm font-medium">변경 내용:</span>
                  <ul className="text-sm mt-1 space-y-1">
                    {selectedChange.changes.map((change, index) => (
                      <li key={index}>• {change.description}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center gap-2">
            <Button variant="outline" onClick={closeRollbackDialog}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleRollback} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              롤백
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
