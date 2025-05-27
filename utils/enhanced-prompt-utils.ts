import { SYSTEM_PROMPT_TEMPLATE, generateSystemPrompt } from "@/utils/prompt-utils"

/**
 * 지속적 대화를 위한 향상된 시스템 프롬프트 템플릿
 */
export const ENHANCED_SYSTEM_PROMPT_TEMPLATE = `
${SYSTEM_PROMPT_TEMPLATE}

## 지속적 대화 지침
- 단발성 답변이 아닌 문제 해결 완료까지 대화를 이어가세요.
- 사용자의 문제가 완전히 해결되었는지 확인하세요.
- 해결책을 제시한 후에는 반드시 "이 방법이 도움이 되었나요?" 또는 "문제가 해결되었나요?"와 같은 확인 질문을 포함하세요.
- 사용자가 문제 해결 과정에서 어려움을 겪는다면 단계별로 더 상세한 안내를 제공하세요.
- 사용자의 응답에 따라 대안적인 해결책을 준비하세요.
- 문제가 복잡하거나 여러 번의 시도에도 해결되지 않는 경우에만 고객센터 연결을 안내하세요.
- 대화가 자연스럽게 종료될 때까지 추가 질문이나 도움이 필요한지 확인하세요.
`

/**
 * 지속적 대화를 위한 향상된 시스템 프롬프트 생성
 */
export function generateEnhancedSystemPrompt(config: any): string {
  // 기본 시스템 프롬프트 생성
  const basePrompt = generateSystemPrompt(config)

  // 지속적 대화 지침 추가
  return (
    basePrompt +
    `

## 지속적 대화 지침
- 단발성 답변이 아닌 문제 해결 완료까지 대화를 이어가세요.
- 사용자의 문제가 완전히 해결되었는지 확인하세요.
- 해결책을 제시한 후에는 반드시 "이 방법이 도움이 되었나요?" 또는 "문제가 해결되었나요?"와 같은 확인 질문을 포함하세요.
- 사용자가 문제 해결 과정에서 어려움을 겪는다면 단계별로 더 상세한 안내를 제공하세요.
- 사용자의 응답에 따라 대안적인 해결책을 준비하세요.
- 문제가 복잡하거나 여러 번의 시도에도 해결되지 않는 경우에만 고객센터 연결을 안내하세요.
- 대화가 자연스럽게 종료될 때까지 추가 질문이나 도움이 필요한지 확인하세요.
`
  )
}

/**
 * 대화 컨텍스트를 포함한 향상된 사용자 프롬프트 생성
 */
export function createEnhancedUserPrompt(
  intent: string,
  userMessage: string,
  userContext: any,
  conversationState: any,
  conversationHistory: Array<{ role: string; content: string }>,
): string {
  // 기본 정보 추출
  const chargerNumberMatch = userMessage.match(/(\d+)번/)
  const chargerNumber = chargerNumberMatch ? chargerNumberMatch[1] : ""

  // 대화 이력 요약
  const historyContext =
    conversationHistory.length > 0 ? `\n\n이전 대화 요약:\n${summarizeConversation(conversationHistory)}` : ""

  // 현재 문제 해결 단계
  const stageContext = conversationState.issueStage
    ? `\n\n현재 문제 해결 단계: ${getStageDescription(conversationState.issueStage)}`
    : ""

  // 문제 해결 시도 횟수
  const attemptsContext =
    conversationState.resolutionAttempts > 0
      ? `\n\n지금까지 ${conversationState.resolutionAttempts}번의 해결 시도가 있었습니다.`
      : ""

  // 인텐트별 특화된 프롬프트 생성
  let intentSpecificPrompt = ""

  switch (intent) {
    case "charger_issue":
      intentSpecificPrompt = `
사용자가 충전기 고장을 보고했습니다.
사용자 메시지: "${userMessage}"
사용자 컨텍스트: 
- 위치: ${userContext.location}
- 차량 모델: ${userContext.vehicleModel}
- 충전기 번호: ${chargerNumber || "명시되지 않음"}
${historyContext}${stageContext}${attemptsContext}

다음 정보를 포함하여 응답해 주세요:
1. 문제에 대한 공감과 사과
2. 고장 신고가 접수되었음을 알림
3. 단계별 문제 해결 가이드 제공
4. 가까운 대체 충전소 2-3곳 추천 (위치, 거리, 충전 속도, 대기 상태 포함)
5. 해결 여부를 확인하는 질문 포함
6. 문제가 지속될 경우 추가 조치 안내
`
      break

    case "payment_issue":
      intentSpecificPrompt = `
사용자가 결제 관련 문의를 하고 있습니다.
사용자 메시지: "${userMessage}"
사용자 컨텍스트: 
- 결제 수단: ${userContext.paymentMethods?.join(", ") || "알 수 없음"}
${historyContext}${stageContext}${attemptsContext}

다음 정보를 포함하여 응답해 주세요:
1. 결제 문제에 대한 공감 표현
2. 가능한 원인 분석 (네트워크 문제, 카드 오류, 앱 버그 등)
3. 단계별 문제 해결 가이드 제공
4. 각 단계 후 확인 질문 포함
5. 문제가 지속될 경우 대안적 결제 방법 제안
6. 해결 여부를 확인하는 질문 포함
7. 필요한 경우에만 고객센터 연결 안내
`
      break

    // 다른 인텐트에 대한 케이스 추가...

    default:
      intentSpecificPrompt = `
사용자가 일반적인 문의를 했습니다.
사용자 메시지: "${userMessage}"
사용자 컨텍스트: 
- 차량 모델: ${userContext.vehicleModel || "알 수 없음"}
- 위치: ${userContext.location || "알 수 없음"}
${historyContext}${stageContext}${attemptsContext}

다음 사항에 유의하여 응답해 주세요:
1. 사용자의 질문에 직접적으로 답변
2. 관련된 추가 정보 제공
3. 답변이 도움이 되었는지 확인하는 질문 포함
4. 추가 질문이 있는지 확인
5. 대화를 자연스럽게 이어갈 수 있는 관련 주제 제안
`
  }

  return intentSpecificPrompt
}

/**
 * 대화 이력 요약 함수
 */
function summarizeConversation(history: Array<{ role: string; content: string }>): string {
  // 최근 3-5개 메시지만 포함
  const recentHistory = history.slice(-5)

  let summary = ""
  recentHistory.forEach((message, index) => {
    const role = message.role === "user" ? "사용자" : "어시스턴트"
    // 메시지 내용 요약 (너무 길면 잘라냄)
    const content = message.content.length > 100 ? message.content.substring(0, 100) + "..." : message.content

    summary += `${index + 1}. ${role}: ${content}\n`
  })

  return summary
}

/**
 * 문제 해결 단계 설명 함수
 */
function getStageDescription(stage: string): string {
  switch (stage) {
    case "identification":
      return "문제 식별 단계 - 사용자의 문제를 정확히 파악하고 있습니다."
    case "troubleshooting":
      return "문제 해결 단계 - 해결책을 제시하고 사용자가 시도하도록 안내하고 있습니다."
    case "resolution":
      return "해결 단계 - 제시된 해결책으로 문제 해결을 시도하고 있습니다."
    case "confirmation":
      return "확인 단계 - 문제가 해결되었는지 확인하고 있습니다."
    case "completed":
      return "완료 단계 - 문제가 해결되었으며 추가 도움이 필요한지 확인하고 있습니다."
    default:
      return stage
  }
}
