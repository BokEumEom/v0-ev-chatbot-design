import { SYSTEM_PROMPT_TEMPLATE, generateSystemPrompt } from "@/utils/prompt-utils"
import type { ConversationState } from "@/services/conversation-continuity-service"

/**
 * 대화 지속성을 위한 고급 시스템 프롬프트 템플릿
 */
export const ADVANCED_SYSTEM_PROMPT_TEMPLATE = `
${SYSTEM_PROMPT_TEMPLATE}

## 대화 지속성 및 문제 해결 지침

### 대화 지속성 원칙
1. 단발성 답변이 아닌 문제 해결 완료까지 대화를 이어가세요.
2. 사용자의 문제가 완전히 해결되었는지 확인하는 질문을 항상 포함하세요.
3. 사용자의 응답을 분석하고 다음 단계를 결정하세요:
   - 충분한 정보 제공 → 해결책 제시
   - 정보 불충분 → 추가 질문
   - 해결책 제시 후 → 해결 확인 질문
   - 문제 미해결 → 대안 제시
   - 문제 해결 → 추가 도움 확인

### 대화 맥락 유지
1. 이전에 언급된 정보를 참조하세요.
   예: "앞서 말씀하신 아이오닉 5 차량의 충전 문제는..."
2. 사용자가 제공한 모든 정보(차량 모델, 충전기 번호, 오류 코드 등)를 기억하고 활용하세요.
3. 대화 중 수집된 정보를 요약하여 확인하세요.
   예: "지금까지 확인된 내용은 강남역 3번 충전기에서 결제 오류가 발생했다는 것입니다."

### 단계별 문제 해결
1. 문제 해결 과정을 명확한 단계로 나누어 안내하세요.
2. 각 단계 후 확인 질문을 포함하세요.
   예: "충전기 재부팅을 완료하셨나요? 그 후 화면에 어떤 메시지가 표시되나요?"
3. 사용자가 단계를 완료했는지 확인하고, 완료하지 않았다면 다시 안내하세요.
4. 복잡한 문제는 더 작은 하위 문제로 분해하여 하나씩 해결하세요.

### 사용자 참여 유지
1. 열린 질문과 닫힌 질문을 전략적으로 혼합하세요.
2. 사용자의 감정 상태를 인식하고 적절히 대응하세요:
   - 좌절감 → 공감과 안심
   - 혼란 → 명확한 설명
   - 만족 → 긍정적 강화
3. 사용자가 응답하지 않는 경우에도 대화를 이어갈 수 있는 후속 질문을 준비하세요.
4. 진행 상황을 주기적으로 요약하여 사용자에게 진전을 보여주세요.

### 대화 종료 관리
1. 문제가 해결되었다면 명확히 확인하세요.
2. 추가 질문이나 다른 도움이 필요한지 확인하세요.
3. 사용자 만족도를 확인하세요.
4. 필요시 후속 조치나 추가 리소스를 안내하세요.
`

/**
 * 대화 지속성을 위한 고급 시스템 프롬프트 생성
 */
export function generateAdvancedSystemPrompt(config: any): string {
  // 기본 시스템 프롬프트 생성
  const basePrompt = generateSystemPrompt(config)

  // 대화 지속성 지침 추가
  return `
${basePrompt}

## 대화 지속성 및 문제 해결 지침

### 대화 지속성 원칙
1. 단발성 답변이 아닌 문제 해결 완료까지 대화를 이어가세요.
2. 사용자의 문제가 완전히 해결되었는지 확인하는 질문을 항상 포함하세요.
3. 사용자의 응답을 분석하고 다음 단계를 결정하세요:
   - 충분한 정보 제공 → 해결책 제시
   - 정보 불충분 → 추가 질문
   - 해결책 제시 후 → 해결 확인 질문
   - 문제 미해결 → 대안 제시
   - 문제 해결 → 추가 도움 확인

### 대화 맥락 유지
1. 이전에 언급된 정보를 참조하세요.
   예: "앞서 말씀하신 아이오닉 5 차량의 충전 문제는..."
2. 사용자가 제공한 모든 정보(차량 모델, 충전기 번호, 오류 코드 등)를 기억하고 활용하세요.
3. 대화 중 수집된 정보를 요약하여 확인하세요.
   예: "지금까지 확인된 내용은 강남역 3번 충전기에서 결제 오류가 발생했다는 것입니다."

### 단계별 문제 해결
1. 문제 해결 과정을 명확한 단계로 나누어 안내하세요.
2. 각 단계 후 확인 질문을 포함하세요.
   예: "충전기 재부팅을 완료하셨나요? 그 후 화면에 어떤 메시지가 표시되나요?"
3. 사용자가 단계를 완료했는지 확인하고, 완료하지 않았다면 다시 안내하세요.
4. 복잡한 문제는 더 작은 하위 문제로 분해하여 하나씩 해결하세요.

### 사용자 참여 유지
1. 열린 질문과 닫힌 질문을 전략적으로 혼합하세요.
2. 사용자의 감정 상태를 인식하고 적절히 대응하세요:
   - 좌절감 → 공감과 안심
   - 혼란 → 명확한 설명
   - 만족 → 긍정적 강화
3. 사용자가 응답하지 않는 경우에도 대화를 이어갈 수 있는 후속 질문을 준비하세요.
4. 진행 상황을 주기적으로 요약하여 사용자에게 진전을 보여주세요.

### 대화 종료 관리
1. 문제가 해결되었다면 명확히 확인하세요.
2. 추가 질문이나 다른 도움이 필요한지 확인하세요.
3. 사용자 만족도를 확인하세요.
4. 필요시 후속 조치나 추가 리소스를 안내하세요.
`
}

/**
 * 대화 단계별 최적화된 프롬프트 생성
 */
export function generateStageSpecificPrompt(stage: string, context: any): string {
  switch (stage) {
    case "identification":
      return `
문제 식별 단계입니다. 사용자의 문제를 정확히 파악하세요.

다음 정보를 수집하세요:
1. 문제의 유형 (충전 불가, 결제 오류, 앱 연결 문제 등)
2. 발생 상황 (언제, 어디서, 어떤 충전기에서)
3. 오류 메시지나 코드 (있는 경우)
4. 이전에 시도한 해결 방법

수집된 정보를 바탕으로 문제를 명확히 정의하고, 누락된 중요 정보가 있다면 추가 질문하세요.
사용자의 감정 상태를 인식하고 공감을 표현하세요.
`

    case "troubleshooting":
      return `
문제 해결 단계입니다. 수집된 정보를 바탕으로 해결책을 제시하세요.

해결책 제시 지침:
1. 가장 간단하고 효과적인 해결책부터 단계별로 안내하세요.
2. 각 단계를 명확하게 설명하고, 사용자가 이해했는지 확인하세요.
3. 각 단계 후 결과를 확인하는 질문을 포함하세요.
4. 사용자가 단계를 완료했는지 확인하고, 완료하지 않았다면 다시 안내하세요.
5. 해결책이 효과가 없을 경우를 대비한 대안을 준비하세요.

현재 문제: ${context.currentIssue || "명확하지 않음"}
수집된 정보: ${JSON.stringify(context.collectedInfo || {})}
시도한 해결책: ${context.attemptedSolutions?.join(", ") || "없음"}
`

    case "resolution":
      return `
해결 확인 단계입니다. 제시한 해결책이 문제를 해결했는지 확인하세요.

확인 지침:
1. 사용자에게 문제가 해결되었는지 직접적으로 물어보세요.
2. 해결되었다면 성공적인 결과를 축하하고, 추가 도움이 필요한지 확인하세요.
3. 부분적으로 해결되었다면, 남은 문제를 파악하고 추가 해결책을 제시하세요.
4. 해결되지 않았다면, 다른 접근 방식이나 대안을 제시하세요.
5. 여러 번의 시도에도 해결되지 않는다면, 고객센터 연결을 안내하세요.

현재까지의 진행 상황을 요약하고, 사용자의 만족도를 확인하세요.
`

    case "confirmation":
      return `
최종 확인 단계입니다. 문제 해결 과정을 마무리하세요.

마무리 지침:
1. 전체 문제 해결 과정을 간략히 요약하세요.
2. 사용자의 만족도를 확인하세요.
3. 추가 질문이나 다른 도움이 필요한지 확인하세요.
4. 유사한 문제 예방을 위한 팁이나 조언을 제공하세요.
5. 필요시 후속 조치나 추가 리소스를 안내하세요.

사용자에게 긍정적인 경험을 남기고, 대화를 자연스럽게 마무리하세요.
`

    case "completed":
      return `
대화 종료 단계입니다. 사용자와의 대화를 마무리하세요.

종료 지침:
1. 사용자에게 서비스에 만족했는지 확인하세요.
2. 추가 질문이나 다른 도움이 필요한지 마지막으로 확인하세요.
3. 앱 내 다른 유용한 기능이나 리소스를 소개하세요.
4. 긍정적이고 친절한 마무리 인사를 전하세요.

사용자가 추가 질문을 하면 새로운 대화 주제로 자연스럽게 전환하세요.
`

    default:
      return `
사용자의 질문에 정확하고 도움이 되는 답변을 제공하세요.
대화를 자연스럽게 이어가기 위해 후속 질문이나 확인 질문을 포함하세요.
사용자의 응답에 따라 적절히 대응하고, 문제 해결을 위한 다음 단계를 안내하세요.
`
  }
}

/**
 * 대화 컨텍스트를 활용한 고급 사용자 프롬프트 생성
 */
export function createAdvancedUserPrompt(
  intent: string,
  userMessage: string,
  userContext: any,
  conversationState: ConversationState,
  conversationHistory: Array<{ role: string; content: string }>,
): string {
  // 대화 이력 요약
  const historyContext = summarizeConversationHistory(conversationHistory)

  // 수집된 정보 추출
  const collectedInfo = extractCollectedInformation(conversationHistory, userContext)

  // 누락된 중요 정보 식별
  const missingInfo = identifyMissingInformation(intent, collectedInfo)

  // 현재 문제 해결 단계
  const stageContext = conversationState.issueStage
    ? `\n\n현재 문제 해결 단계: ${getStageDescription(conversationState.issueStage)}`
    : ""

  // 문제 해결 시도 횟수
  const attemptsContext =
    conversationState.resolutionAttempts > 0
      ? `\n\n지금까지 ${conversationState.resolutionAttempts}번의 해결 시도가 있었습니다.`
      : ""

  // 단계별 특화 프롬프트 가져오기
  const stageSpecificPrompt = generateStageSpecificPrompt(conversationState.issueStage, {
    currentIssue: conversationState.currentIssue,
    collectedInfo,
    attemptedSolutions: extractAttemptedSolutions(conversationHistory),
  })

  // 인텐트별 특화된 프롬프트 생성
  let intentSpecificPrompt = ""

  switch (intent) {
    case "charger_issue":
      intentSpecificPrompt = `
사용자가 충전기 고장을 보고했습니다.
사용자 메시지: "${userMessage}"

## 대화 컨텍스트
${historyContext}

## 사용자 정보
- 위치: ${userContext.location || "알 수 없음"}
- 차량 모델: ${userContext.vehicleModel || "알 수 없음"}
- 충전기 번호: ${collectedInfo.chargerNumber || "명시되지 않음"}
- 오류 코드: ${collectedInfo.errorCode || "명시되지 않음"}
${stageContext}${attemptsContext}

## 수집된 정보
${JSON.stringify(collectedInfo, null, 2)}

## 누락된 정보
${missingInfo.length > 0 ? missingInfo.join(", ") : "없음"}

## 응답 요구사항
1. 문제에 대한 공감과 사과 표현
2. ${missingInfo.length > 0 ? "누락된 정보를 수집하기 위한 질문 포함" : "문제 해결 진행 상황 확인"}
3. 단계별 문제 해결 가이드 제공
4. 각 단계 후 확인 질문 포함
5. 가까운 대체 충전소 추천 (필요시)
6. 해결 여부를 확인하는 질문 포함
7. 문제가 지속될 경우 추가 조치 안내

## 단계별 지침
${stageSpecificPrompt}
`
      break

    case "payment_issue":
      intentSpecificPrompt = `
사용자가 결제 관련 문의를 하고 있습니다.
사용자 메시지: "${userMessage}"

## 대화 컨텍스트
${historyContext}

## 사용자 정보
- 결제 수단: ${userContext.paymentMethods?.join(", ") || "알 수 없음"}
- 결제 금액: ${collectedInfo.paymentAmount || "알 수 없음"}
- 결제 시간: ${collectedInfo.paymentTime || "알 수 없음"}
${stageContext}${attemptsContext}

## 수집된 정보
${JSON.stringify(collectedInfo, null, 2)}

## 누락된 정보
${missingInfo.length > 0 ? missingInfo.join(", ") : "없음"}

## 응답 요구사항
1. 결제 문제에 대한 공감 표현
2. ${missingInfo.length > 0 ? "누락된 정보를 수집하기 위한 질문 포함" : "문제 해결 진행 상황 확인"}
3. 가능한 원인 분석 (네트워크 문제, 카드 오류, 앱 버그 등)
4. 단계별 문제 해결 가이드 제공
5. 각 단계 후 확인 질문 포함
6. 문제가 지속될 경우 대안적 결제 방법 제안
7. 해결 여부를 확인하는 질문 포함

## 단계별 지침
${stageSpecificPrompt}
`
      break

    case "find_charger":
      intentSpecificPrompt = `
사용자가 가용한 충전소를 찾고 있습니다.
사용자 메시지: "${userMessage}"

## 대화 컨텍스트
${historyContext}

## 사용자 정보
- 현재 위치: ${userContext.location || "알 수 없음"}
- 차량 모델: ${userContext.vehicleModel || "알 수 없음"}
- 필요한 충전 유형: ${collectedInfo.chargerType || "알 수 없음"}
${stageContext}${attemptsContext}

## 수집된 정보
${JSON.stringify(collectedInfo, null, 2)}

## 누락된 정보
${missingInfo.length > 0 ? missingInfo.join(", ") : "없음"}

## 응답 요구사항
1. ${missingInfo.length > 0 ? "누락된 정보를 수집하기 위한 질문 포함" : "현재 위치 기준 가까운 충전소 추천"}
2. 각 충전소의 상세 정보 제공 (거리, 충전기 유형, 속도, 대기 상태)
3. 실시간 정보 확인 방법 안내
4. 내비게이션 연동 방법 언급 (필요시)
5. 추가 질문이나 다른 도움이 필요한지 확인

## 단계별 지침
${stageSpecificPrompt}
`
      break

    case "usage_guide":
      intentSpecificPrompt = `
사용자가 충전 방법에 대해 문의했습니다.
사용자 메시지: "${userMessage}"

## 대화 컨텍스트
${historyContext}

## 사용자 정보
- 차량 모델: ${userContext.vehicleModel || "알 수 없음"}
- 사용자 경험 수준: ${collectedInfo.experienceLevel || "초보자로 가정"}
${stageContext}${attemptsContext}

## 수집된 정보
${JSON.stringify(collectedInfo, null, 2)}

## 누락된 정보
${missingInfo.length > 0 ? missingInfo.join(", ") : "없음"}

## 응답 요구사항
1. 처음 이용하는 사용자를 위한 환영 메시지
2. ${missingInfo.length > 0 ? "누락된 정보를 수집하기 위한 질문 포함" : "충전 시작부터 종료까지의 단계별 가이드 제공"}
3. 각 단계를 명확하게 설명하고 번호 매기기 사용
4. 사용자가 각 단계를 이해했는지 확인하는 질문 포함
5. 초보자를 위한 추가 팁이나 리소스 제공
6. 추가 질문이나 다른 도움이 필요한지 확인

## 단계별 지침
${stageSpecificPrompt}
`
      break

    // 다른 인텐트에 대한 케이스 추가...

    default:
      intentSpecificPrompt = `
사용자가 일반적인 문의를 했습니다.
사용자 메시지: "${userMessage}"

## 대화 컨텍스트
${historyContext}

## 사용자 정보
- 차량 모델: ${userContext.vehicleModel || "알 수 없음"}
- 위치: ${userContext.location || "알 수 없음"}
${stageContext}${attemptsContext}

## 수집된 정보
${JSON.stringify(collectedInfo, null, 2)}

## 응답 요구사항
1. 사용자의 질문에 직접적으로 답변
2. 관련된 추가 정보 제공
3. 답변이 도움이 되었는지 확인하는 질문 포함
4. 추가 질문이 있는지 확인
5. 대화를 자연스럽게 이어갈 수 있는 관련 주제 제안

## 단계별 지침
${stageSpecificPrompt}
`
  }

  return intentSpecificPrompt
}

/**
 * 대화 이력 요약 함수
 */
function summarizeConversationHistory(history: Array<{ role: string; content: string }>): string {
  if (history.length === 0) return "이전 대화 없음"

  // 최근 5개 메시지만 포함
  const recentHistory = history.slice(-5)

  // 중요 정보 추출 (엔티티, 숫자, 날짜 등)
  const entities = extractEntitiesFromHistory(recentHistory)

  // 주요 의도와 문제점 추출
  const mainIssue = extractMainIssueFromHistory(recentHistory)

  // 요약 생성
  let summary = "이전 대화 요약:\n"

  // 주요 문제 추가
  if (mainIssue) {
    summary += `- 주요 문제: ${mainIssue}\n`
  }

  // 중요 엔티티 추가
  if (Object.keys(entities).length > 0) {
    summary += "- 언급된 중요 정보:\n"
    for (const [key, value] of Object.entries(entities)) {
      summary += `  - ${key}: ${value}\n`
    }
  }

  // 최근 대화 흐름 요약
  summary += "- 최근 대화 흐름:\n"
  recentHistory.forEach((message, index) => {
    const role = message.role === "user" ? "사용자" : "어시스턴트"
    // 메시지 내용 요약 (너무 길면 잘라냄)
    const content = message.content.length > 50 ? message.content.substring(0, 50) + "..." : message.content
    summary += `  ${index + 1}. ${role}: ${content}\n`
  })

  return summary
}

/**
 * 대화 이력에서 엔티티 추출
 */
function extractEntitiesFromHistory(history: Array<{ role: string; content: string }>): Record<string, any> {
  const entities: Record<string, any> = {}

  // 충전기 번호 추출
  const chargerNumberRegex = /(\d+)번\s*충전기|충전기\s*(\d+)번/g
  // 오류 코드 추출
  const errorCodeRegex = /오류\s*코드[:\s]*([A-Z0-9-]+)|에러\s*코드[:\s]*([A-Z0-9-]+)|코드[:\s]*([A-Z0-9-]+)/g
  // 차량 모델 추출
  const vehicleModelRegex = /(아이오닉|코나|EV6|GV60|G80|테슬라\s*모델\s*[SXY3]|모델\s*[SXY3])/g
  // 위치 추출
  const locationRegex = /(강남|역삼|선릉|삼성|잠실|홍대|신촌|종로|광화문|여의도|판교|분당|일산|안양|수원|인천)/g

  // 모든 사용자 메시지 검사
  history
    .filter((msg) => msg.role === "user")
    .forEach((message) => {
      // 충전기 번호 추출
      const chargerMatches = [...message.content.matchAll(chargerNumberRegex)]
      if (chargerMatches.length > 0) {
        // 첫 번째 캡처 그룹이 undefined면 두 번째 그룹 사용
        entities["충전기 번호"] =
          chargerMatches[chargerMatches.length - 1][1] || chargerMatches[chargerMatches.length - 1][2]
      }

      // 오류 코드 추출
      const errorMatches = [...message.content.matchAll(errorCodeRegex)]
      if (errorMatches.length > 0) {
        // 세 개의 캡처 그룹 중 undefined가 아닌 첫 번째 그룹 사용
        entities["오류 코드"] =
          errorMatches[errorMatches.length - 1][1] ||
          errorMatches[errorMatches.length - 1][2] ||
          errorMatches[errorMatches.length - 1][3]
      }

      // 차량 모델 추출
      const vehicleMatches = [...message.content.matchAll(vehicleModelRegex)]
      if (vehicleMatches.length > 0) {
        entities["차량 모델"] = vehicleMatches[vehicleMatches.length - 1][1]
      }

      // 위치 추출
      const locationMatches = [...message.content.matchAll(locationRegex)]
      if (locationMatches.length > 0) {
        entities["위치"] = locationMatches[locationMatches.length - 1][1]
      }
    })

  return entities
}

/**
 * 대화 이력에서 주요 문제 추출
 */
function extractMainIssueFromHistory(history: Array<{ role: string; content: string }>): string | null {
  // 문제 유형 키워드
  const issueKeywords = {
    "충전기 고장": ["고장", "작동", "안 됨", "안됨", "에러", "오류", "멈춤", "반응 없음"],
    "결제 문제": ["결제", "카드", "계산", "지불", "환불", "취소", "청구", "요금"],
    "연결 문제": ["연결", "접속", "케이블", "플러그", "꽂힘", "분리", "인식"],
    "앱 문제": ["앱", "어플", "로그인", "가입", "계정", "화면", "표시"],
    "충전 속도": ["느림", "속도", "빠름", "시간", "오래", "급속", "완속"],
    "위치 찾기": ["위치", "찾기", "가까운", "근처", "어디", "지도", "네비"],
  }

  // 사용자 메시지만 필터링
  const userMessages = history.filter((msg) => msg.role === "user").map((msg) => msg.content)

  // 각 문제 유형별 점수 계산
  const issueScores: Record<string, number> = {}

  for (const [issueType, keywords] of Object.entries(issueKeywords)) {
    issueScores[issueType] = 0

    keywords.forEach((keyword) => {
      userMessages.forEach((message) => {
        if (message.includes(keyword)) {
          issueScores[issueType] += 1
        }
      })
    })
  }

  // 가장 높은 점수의 문제 유형 찾기
  let maxScore = 0
  let mainIssue: string | null = null

  for (const [issueType, score] of Object.entries(issueScores)) {
    if (score > maxScore) {
      maxScore = score
      mainIssue = issueType
    }
  }

  // 최소 점수 임계값 (최소 1개 이상의 키워드가 발견되어야 함)
  return maxScore > 0 ? mainIssue : null
}

/**
 * 대화 이력에서 시도된 해결책 추출
 */
function extractAttemptedSolutions(history: Array<{ role: string; content: string }>): string[] {
  const solutions: string[] = []
  const solutionKeywords = [
    "다시 시도",
    "재부팅",
    "재시작",
    "앱 종료",
    "로그아웃",
    "업데이트",
    "케이블 분리",
    "케이블 연결",
    "다른 충전기",
    "카드 변경",
    "설정 확인",
  ]

  // 어시스턴트 메시지에서 해결책 추출
  history
    .filter((msg) => msg.role === "assistant")
    .forEach((message) => {
      solutionKeywords.forEach((keyword) => {
        if (message.content.includes(keyword) && !solutions.includes(keyword)) {
          solutions.push(keyword)
        }
      })
    })

  return solutions
}

/**
 * 수집된 정보 추출
 */
function extractCollectedInformation(
  history: Array<{ role: string; content: string }>,
  userContext: any,
): Record<string, any> {
  // 기본 사용자 컨텍스트에서 정보 가져오기
  const collectedInfo: Record<string, any> = {
    vehicleModel: userContext.vehicleModel,
    location: userContext.location,
    paymentMethods: userContext.paymentMethods,
  }

  // 대화 이력에서 추출한 엔티티 추가
  const entities = extractEntitiesFromHistory(history)

  // 엔티티 정보로 collectedInfo 업데이트
  for (const [key, value] of Object.entries(entities)) {
    switch (key) {
      case "충전기 번호":
        collectedInfo.chargerNumber = value
        break
      case "오류 코드":
        collectedInfo.errorCode = value
        break
      case "차량 모델":
        // 사용자 컨텍스트에 없는 경우에만 업데이트
        if (!collectedInfo.vehicleModel) {
          collectedInfo.vehicleModel = value
        }
        break
      case "위치":
        // 사용자 컨텍스트에 없는 경우에만 업데이트
        if (!collectedInfo.location) {
          collectedInfo.location = value
        }
        break
      default:
        collectedInfo[key] = value
    }
  }

  // 충전기 유형 추출 (급속/완속)
  const chargerTypeRegex = /(급속|완속|슈퍼차저|초급속|7kW|50kW|100kW|350kW)/g
  history
    .filter((msg) => msg.role === "user")
    .forEach((message) => {
      const matches = [...message.content.matchAll(chargerTypeRegex)]
      if (matches.length > 0) {
        collectedInfo.chargerType = matches[matches.length - 1][1]
      }
    })

  // 사용자 경험 수준 추출
  const experienceLevelRegex = /(처음|초보|새로|첫|익숙하지 않|모르|어떻게)/g
  history
    .filter((msg) => msg.role === "user")
    .forEach((message) => {
      const matches = [...message.content.matchAll(experienceLevelRegex)]
      if (matches.length > 0) {
        collectedInfo.experienceLevel = "초보자"
      }
    })

  return collectedInfo
}

/**
 * 누락된 중요 정보 식별
 */
function identifyMissingInformation(intent: string, collectedInfo: Record<string, any>): string[] {
  const missingInfo: string[] = []

  // 인텐트별 필요한 정보 정의
  switch (intent) {
    case "charger_issue":
      if (!collectedInfo.chargerNumber) missingInfo.push("충전기 번호")
      if (!collectedInfo.location) missingInfo.push("충전소 위치")
      if (!collectedInfo.vehicleModel) missingInfo.push("차량 모델")
      break

    case "payment_issue":
      if (!collectedInfo.paymentMethods) missingInfo.push("결제 수단")
      if (!collectedInfo.paymentAmount) missingInfo.push("결제 금액")
      if (!collectedInfo.chargerNumber) missingInfo.push("충전기 번호")
      break

    case "find_charger":
      if (!collectedInfo.location) missingInfo.push("현재 위치")
      if (!collectedInfo.chargerType) missingInfo.push("필요한 충전 유형(급속/완속)")
      break

    case "usage_guide":
      if (!collectedInfo.vehicleModel) missingInfo.push("차량 모델")
      if (!collectedInfo.experienceLevel) missingInfo.push("충전 경험 수준")
      break

    // 다른 인텐트에 대한 케이스 추가...
  }

  return missingInfo
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
