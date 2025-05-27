"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Wand2 } from "lucide-react"
import { TroubleshootingWizard } from "@/components/troubleshooting-wizard"
import type { WizardNode } from "@/data/troubleshooting-tree"

interface WizardIntegrationProps {
  onSolutionFound?: (solution: WizardNode) => void
  buttonText?: string
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function WizardIntegration({
  onSolutionFound,
  buttonText = "문제 진단 마법사 시작하기",
  buttonVariant = "outline",
}: WizardIntegrationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleComplete = (result: WizardNode) => {
    if (onSolutionFound) {
      onSolutionFound(result)
    }
    // 마법사 완료 후 3초 후에 대화상자 닫기
    setTimeout(() => {
      setIsOpen(false)
    }, 3000)
  }

  return (
    <>
      <Button
        variant={buttonVariant as any}
        className="w-full flex items-center justify-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Wand2 className="h-4 w-4" />
        {buttonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>문제 진단 마법사</DialogTitle>
            <DialogDescription>
              단계별 질문에 답하여 문제를 정확히 진단하고 맞춤형 해결책을 찾아보세요.
            </DialogDescription>
          </DialogHeader>
          <TroubleshootingWizard
            onComplete={handleComplete}
            onRedirect={(redirectTo) => {
              setIsOpen(false)
              // 실제 구현에서는 리디렉션 처리
              console.log("Redirect to:", redirectTo)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
