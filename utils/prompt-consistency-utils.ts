/**
 * 프롬프트 일관성 유틸리티
 * 질문과 응답의 일관성을 높이기 위한 유틸리티 함수들
 */

/**
 * 질문 유형 분류
 */
export type QuestionType =
  | "factual" // 사실 기반 질문
  | "procedural" // 절차 관련 질문
  | "comparative" // 비교 질문
  | "causal" // 원인/결과 질문
  | "hypothetical" // 가정 질문
  | "clarification" // 명확화 요청
  | "opinion" // 의견 요청
  | "confirmation" // 확인 질문
  | "unknown" // 분류 불가

/**
 * 질문 유형 감지
 */
export function detectQuestionType(message: string): QuestionType {
  // 메시지가 비어있거나 질문이 아닌 경우
  if (!message.trim() || (!message.includes("?") && !message.includes("까") && !message.includes("나요"))) {
    return "unknown"
  }

  // 사실 기반 질문 (무엇, 누구, 어디, 언제)
  if (/무엇|뭐|뭔|어떤|누구|누가|어디|언제|몇|얼마/.test(message)) {
    return "factual"
  }

  // 절차 관련 질문 (어떻게, 방법)
  if (/어떻게|방법|절차|단계|과정|순서/.test(message)) {
    return "procedural"
  }

  // 비교 질문 (차이, 비교, 더 나은)
  if (/차이|비교|더 나은|좋은|추천|어떤 것|어느 것|어떤게|어느게|대비|대조/.test(message)) {
    return "comparative"
  }

  // 원인/결과 질문 (왜, 이유, 때문에)
  if (/왜|이유|원인|때문|결과|영향|효과/.test(message)) {
    return "causal"
  }

  // 가정 질문 (만약, ~면)
  if (/만약|~면|~다면|경우|가정|~을 때|~할 때/.test(message)) {
    return "hypothetical"
  }

  // 명확화 요청 (무슨 뜻, 의미, 설명)
  if (/무슨 뜻|의미|설명|정의|뭐냐|뭐야|뭐지/.test(message)) {
    return "clarification"
  }

  // 의견 요청 (생각, 의견, 추천)
  if (/생각|의견|추천|조언|제안|어떨까|어떨지|어떻게 생각/.test(message)) {
    return "opinion"
  }

  // 확인 질문 (맞나요, 맞죠, 그렇죠)
  if (/맞나요|맞죠|그렇죠|맞습니까|맞지요|그렇지요|맞아요|그래요/.test(message)) {
    return "confirmation"
  }

  // 기본값
  return "unknown"
}

/**
 * 질문 주제 추출
 */
export function extractQuestionTopic(message: string): string[] {
  const topics: string[] = []

  // 충전 관련 주제
  if (/충전|배터리|전력|전기|에너지/.test(message)) {
    topics.push("charging")
  }

  // 위치/충전소 관련 주제
  if (/위치|장소|충전소|스테이션|근처|가까운|찾아|어디/.test(message)) {
    topics.push("location")
  }

  // 비용/요금 관련 주제
  if (/비용|요금|가격|지불|결제|청구|환불|무료|유료|얼마/.test(message)) {
    topics.push("cost")
  }

  // 차량 관련 주제
  if (/차량|자동차|모델|브랜드|제조사|테슬라|현대|기아|아이오닉|EV/.test(message)) {
    topics.push("vehicle")
  }

  // 문제/오류 관련 주제
  if (/문제|오류|에러|고장|작동|안 됨|안됨|실패|장애/.test(message)) {
    topics.push("issue")
  }

  // 계정/회원 관련 주제
  if (/계정|회원|로그인|가입|등록|비밀번호|아이디|프로필/.test(message)) {
    topics.push("account")
  }

  // 앱/서비스 관련 주제
  if (/앱|어플|애플리케이션|서비스|기능|업데이트|버전/.test(message)) {
    topics.push("app")
  }

  // 주제가 감지되지 않은 경우
  if (topics.length === 0) {
    topics.push("general")
  }

  return topics
}

/**
 * 질문 핵심 키워드 추출
 */
export function extractKeywords(message: string): string[] {
  // 불용어 목록
  const stopwords = [
    "그",
    "이",
    "저",
    "것",
    "수",
    "를",
    "에",
    "에서",
    "은",
    "는",
    "이",
    "가",
    "으로",
    "로",
    "을",
    "를",
    "와",
    "과",
    "의",
    "도",
    "에게",
    "께",
    "처럼",
    "만큼",
    "같이",
    "보다",
    "라고",
    "하고",
    "하는",
    "한",
    "할",
    "하여",
    "하면",
    "해서",
    "이런",
    "저런",
    "그런",
    "어떤",
    "무슨",
    "어느",
    "몇",
    "얼마",
    "있는",
    "있다",
    "하는",
    "한다",
    "된다",
    "그렇다",
    "이렇다",
    "저렇다",
    "그래서",
    "그러나",
    "그리고",
    "그러면",
    "그러므로",
    "그런데",
    "그래도",
    "하지만",
    "또는",
    "혹은",
    "또한",
    "뿐만",
    "아니라",
    "그리하여",
    "따라서",
    "때문에",
    "위하여",
    "하기",
    "위해",
    "하여",
    "하면",
    "해야",
    "하도록",
    "하므로",
    "하지",
    "않는",
    "않다",
    "않은",
    "않을",
    "없는",
    "없다",
    "없이",
    "않고",
    "있는",
    "있다",
    "있고",
    "있어",
    "있지",
  ]

  // 메시지를 단어로 분리
  const words = message
    .replace(/[.,?!;:()"']/g, "") // 구두점 제거
    .split(/\s+/) // 공백으로 분리
    .filter((word) => word.length > 1) // 1글자 단어 제거
    .filter((word) => !stopwords.includes(word)) // 불용어 제거

  // 중복 제거
  return [...new Set(words)]
}

/**
 * 질문 복잡성 평가
 */
export function evaluateQuestionComplexity(message: string): "simple" | "medium" | "complex" {
  // 단어 수 계산
  const wordCount = message.split(/\s+/).length

  // 질문 마크 수 계산
  const questionMarkCount = (message.match(/\?/g) || []).length

  // 접속사 수 계산
  const conjunctionCount = (message.match(/그리고|또는|하지만|그러나|또한|그래서|따라서|그런데/g) || []).length

  // 복잡성 점수 계산
  let complexityScore = 0

  // 단어 수에 따른 점수
  if (wordCount <= 5) complexityScore += 0
  else if (wordCount <= 15) complexityScore += 1
  else complexityScore += 2

  // 질문 마크 수에 따른 점수
  complexityScore += Math.min(questionMarkCount, 2)

  // 접속사 수에 따른 점수
  complexityScore += Math.min(conjunctionCount, 2)

  // 복잡한 구조 감지
  if (/만약.*라면|~하면.*~할까요|~인지.*~인지/.test(message)) {
    complexityScore += 1
  }

  // 복잡성 등급 결정
  if (complexityScore <= 1) return "simple"
  else if (complexityScore <= 3) return "medium"
  else return "complex"
}

/**
 * 질문 명확성 평가
 */
export function evaluateQuestionClarity(message: string): "clear" | "ambiguous" | "vague" {
  // 명확한 질문 패턴
  const clearPatterns = [
    /어떻게.*하나요\?/,
    /.*방법.*알려주세요/,
    /.*위치.*어디.*있나요/,
    /.*얼마.*드나요/,
    /.*언제.*가능한가요/,
    /.*왜.*일어나나요/,
  ]

  // 모호한 질문 패턴
  const ambiguousPatterns = [/이거|그거|저거|그것|이것/, /어떻게.*생각.*하나요/, /좋을까요/, /괜찮을까요/, /어떨까요/]

  // 불명확한 질문 패턴
  const vaguePatterns = [/^그래요$/, /^네\?$/, /^뭐라고요\?$/, /^그게 뭐죠\?$/, /^어떻게요\?$/]

  // 명확한 질문 패턴 검사
  for (const pattern of clearPatterns) {
    if (pattern.test(message)) {
      return "clear"
    }
  }

  // 모호한 질문 패턴 검사
  for (const pattern of ambiguousPatterns) {
    if (pattern.test(message)) {
      return "ambiguous"
    }
  }

  // 불명확한 질문 패턴 검사
  for (const pattern of vaguePatterns) {
    if (pattern.test(message)) {
      return "vague"
    }
  }

  // 기본값 (단어 수에 따라)
  const wordCount = message.split(/\s+/).length
  if (wordCount <= 3) return "vague"
  else if (wordCount <= 7) return "ambiguous"
  else return "clear"
}

/**
 * 질문 일관성 검사를 위한 프롬프트 생성
 */
export function generateConsistencyCheckPrompt(
  userMessage: string,
  detectedIntent: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
): string {
  // 질문 유형 및 주제 분석
  const questionType = detectQuestionType(userMessage)
  const topics = extractQuestionTopic(userMessage)
  const keywords = extractKeywords(userMessage)
  const complexity = evaluateQuestionComplexity(userMessage)
  const clarity = evaluateQuestionClarity(userMessage)

  // 최근 대화 이력 (최대 3개)
  const recentHistory = conversationHistory.slice(-6)

  // 프롬프트 생성
  let prompt = `
# 질문-응답 일관성 검사

## 사용자 질문 분석
- 원본 질문: "${userMessage}"
- 감지된 인텐트: ${detectedIntent}
- 질문 유형: ${questionType}
- 질문 주제: ${topics.join(", ")}
- 핵심 키워드: ${keywords.join(", ")}
- 복잡성: ${complexity}
- 명확성: ${clarity}

## 응답 요구사항
1. 사용자 질문에 직접적으로 관련된 정보만 제공하세요.
2. 질문의 핵심 키워드와 주제에 집중하세요.
3. 질문 유형에 맞는 형식으로 응답하세요:
   - 사실 질문: 정확한 정보와 사실 제공
   - 절차 질문: 단계별 안내 제공
   - 비교 질문: 명확한 비교점 제시
   - 원인 질문: 원인과 결과 설명
   - 가정 질문: 가정에 따른 결과 설명
   - 명확화 질문: 개념이나 용어 설명
   - 의견 질문: 균형 잡힌 관점 제시
   - 확인 질문: 명확한 확인 또는 부정
4. 질문에 직접 답하지 않는 내용은 포함하지 마세요.
5. 불필요한 배경 정보는 최소화하세요.
`

  // 대화 이력이 있는 경우 컨텍스트 추가
  if (recentHistory.length > 0) {
    prompt += `
## 대화 컨텍스트
이전 대화를 참고하여 일관성 있는 응답을 제공하세요:
`

    recentHistory.forEach((msg, index) => {
      prompt += `${index + 1}. ${msg.role === "user" ? "사용자" : "어시스턴트"}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? "..." : ""}\n`
    })
  }

  return prompt
}

/**
 * 응답 일관성 검사
 */
export function checkResponseConsistency(
  userMessage: string,
  generatedResponse: string,
  detectedIntent: string,
): {
  isConsistent: boolean
  confidenceScore: number
  issues?: string[]
} {
  // 질문 분석
  const questionType = detectQuestionType(userMessage)
  const topics = extractQuestionTopic(userMessage)
  const keywords = extractKeywords(userMessage)

  // 응답 분석
  const responseTopics = extractQuestionTopic(generatedResponse)
  const responseKeywords = extractKeywords(generatedResponse)

  // 주제 일치 검사
  const topicOverlap = topics.filter((topic) => responseTopics.includes(topic)).length
  const topicConsistencyScore = topics.length > 0 ? topicOverlap / topics.length : 0

  // 키워드 일치 검사
  const keywordOverlap = keywords.filter(
    (keyword) => responseKeywords.includes(keyword) || generatedResponse.includes(keyword),
  ).length
  const keywordConsistencyScore = keywords.length > 0 ? keywordOverlap / keywords.length : 0

  // 질문 유형에 따른 응답 패턴 검사
  let typeConsistencyScore = 0.5 // 기본값
  const issues: string[] = []

  switch (questionType) {
    case "factual":
      // 사실 질문에는 명확한 정보가 포함되어야 함
      if (!/\d+|위치|장소|시간|날짜|이름|종류|유형/.test(generatedResponse)) {
        issues.push("사실 질문에 구체적인 정보가 부족합니다")
        typeConsistencyScore = 0.3
      } else {
        typeConsistencyScore = 0.9
      }
      break

    case "procedural":
      // 절차 질문에는 단계별 안내가 포함되어야 함
      if (!/먼저|다음|그 다음|마지막|단계|과정|방법|절차/.test(generatedResponse)) {
        issues.push("절차 질문에 단계별 안내가 부족합니다")
        typeConsistencyScore = 0.3
      } else {
        typeConsistencyScore = 0.9
      }
      break

    case "comparative":
      // 비교 질문에는 비교 요소가 포함되어야 함
      if (!/비교|차이|장점|단점|더 나은|반면|대비|대조/.test(generatedResponse)) {
        issues.push("비교 질문에 비교 요소가 부족합니다")
        typeConsistencyScore = 0.3
      } else {
        typeConsistencyScore = 0.9
      }
      break

    case "causal":
      // 원인 질문에는 원인과 결과 설명이 포함되어야 함
      if (!/때문|원인|이유|결과|영향|효과|따라서|그래서/.test(generatedResponse)) {
        issues.push("원인 질문에 원인-결과 설명이 부족합니다")
        typeConsistencyScore = 0.3
      } else {
        typeConsistencyScore = 0.9
      }
      break

    // 다른 질문 유형에 대한 처리 추가...
  }

  // 종합 일관성 점수 계산 (가중치 적용)
  const consistencyScore = topicConsistencyScore * 0.4 + keywordConsistencyScore * 0.4 + typeConsistencyScore * 0.2

  // 일관성 판단 (임계값: 0.6)
  return {
    isConsistent: consistencyScore >= 0.6,
    confidenceScore: consistencyScore,
    issues: issues.length > 0 ? issues : undefined,
  }
}
