"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react"

interface ResolutionConfirmationProps {
  onConfirm: (resolved: boolean) => void
  onAdditionalHelp: () => void
  className?: string
}

export function ResolutionConfirmation({ onConfirm, onAdditionalHelp, className = "" }: ResolutionConfirmationProps) {
  const [responded, setResponded] = useState(false)

  const handleResponse = (resolved: boolean) => {
    setResponded(true)
    onConfirm(resolved)
  }

  if (responded) {
    return null
  }

  return (
    <Card className={`p-3 border-dashed bg-muted/50 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>문제가 해결되었나요?</span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            className="justify-start gap-2 bg-green-50 hover:bg-green-100 border-green-200"
            onClick={() => handleResponse(true)}
          >
            <ThumbsUp className="h-4 w-4 text-green-500" />
            <span>네, 해결되었습니다</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="justify-start gap-2 bg-red-50 hover:bg-red-100 border-red-200"
            onClick={() => handleResponse(false)}
          >
            <ThumbsDown className="h-4 w-4 text-red-500" />
            <span>아니오, 아직 문제가 있습니다</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-xs text-muted-foreground"
          onClick={onAdditionalHelp}
        >
          <HelpCircle className="mr-1 h-3 w-3" />
          <span>다른 도움이 필요합니다</span>
        </Button>
      </div>
    </Card>
  )
}
