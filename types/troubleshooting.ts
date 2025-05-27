import type { WizardNode } from "@/data/troubleshooting-tree"

export interface WizardState {
  currentNodeId: string
  history: string[]
  completed: boolean
  userInput: Record<string, string>
}

export type WizardAction =
  | { type: "SELECT_OPTION"; nextNodeId: string }
  | { type: "GO_BACK" }
  | { type: "RESET" }
  | { type: "COMPLETE" }
  | { type: "SET_USER_INPUT"; field: string; value: string }

export interface TroubleshootingWizardProps {
  onComplete?: (result: WizardNode) => void
  onRedirect?: (redirectTo: string) => void
}

export interface DiagnosisHistory {
  id: string
  date: Date
  problem: string
  solution: string
  path: string[]
  userInput: Record<string, string>
  notes?: string
}
