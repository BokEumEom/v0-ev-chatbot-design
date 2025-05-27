import type { ChatScenario } from "@/data/chatbot-scenarios"
import type {
  ScenarioQualityMetrics,
  ScenarioEvaluationResult,
  ScenarioImprovementSuggestion,
  ScenarioEvaluationJob,
  ScenarioEvaluationSettings,
  ScenarioEvaluationRule,
  ScenarioEvaluationStats,
} from "@/types/scenario-evaluation"
import { v4 as uuidv4 } from "uuid"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export class ScenarioEvaluationService {
  private static instance: ScenarioEvaluationService
  private evaluationResults: ScenarioEvaluationResult[] = []
  private evaluationJobs: Map<string, ScenarioEvaluationJob> = new Map()
  private defaultSettings: ScenarioEvaluationSettings
  private evaluationRules: Map<string, ScenarioEvaluationRule> = new Map()

  private constructor() {
    // 기본 평가 설정 초기화
    this.defaultSettings = {
      evaluationMethod: "hybrid",
      aiModel: "gemini-1.5-pro",
      metricWeights: {
        realism: 0.15,
        relevance: 0.15,
        complexity: 0.1,
        coherence: 0.15,
        naturalness: 0.1,
        coverage: 0.1,
        userFocus: 0.15,
        technicalAccuracy: 0.1,
      },
      minThresholds: {
        realism: 6,
        relevance: 7,
        complexity: 5,
        coherence: 6,
        naturalness: 6,
        coverage: 5,
        userFocus: 7,
        technicalAccuracy: 6,
        overallScore: 6.5,
      },
      maxSuggestionsPerScenario: 5,
    }

    // 기본 평가 규칙 초기화
    this.initializeDefaultRules()
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): ScenarioEvaluationService {
    if (!ScenarioEvaluationService.instance) {
      ScenarioEvaluationService.instance = new ScenarioEvaluationService()
    }
    return ScenarioEvaluationService.instance
  }

  /**
   * 기본 평가 규칙 초기화
   */
  private initializeDefaultRules(): void {
    const defaultRules: ScenarioEvaluationRule[] = [
      {
        id: "rule_realism_1",
        name: "현실적인 사용자 질문",
        description: "사용자 질문이 현실적이고 자연스러운지 확인",
        metric: "realism",
        condition: "사용자 질문이 실제 상황에서 발생할 수 있는 자연스러운 질문이어야 함",
        weight: 0.7,
        checkFunction: (scenario: ChatScenario) => {
          // 사용자 질문의 평균 길이 확인 (너무 짧거나 너무 길면 비현실적)
          const userMessages = scenario.conversations.map((c) => c.user)
          const avgLength = userMessages.reduce((sum, msg) => sum + msg.length, 0) / userMessages.length

          // 질문 길이가 적절한지 확인 (10-100자 사이가 가장 현실적)
          const lengthScore =
            avgLength >= 10 && avgLength <= 100 ? 10 : avgLength < 10 ? avgLength : (100 / avgLength) * 10

          // 질문에 일상적인 표현이 포함되어 있는지 확인
          const naturalExpressions = [
            "어떻게",
            "왜",
            "언제",
            "어디",
            "무엇",
            "누구",
            "어떤",
            "좀",
            "있나요",
            "할까요",
            "해주세요",
          ]
          const hasNaturalExpressions = userMessages.some((msg) =>
            naturalExpressions.some((expr) => msg.includes(expr)),
          )

          // 최종 점수 계산
          const score = lengthScore * 0.6 + (hasNaturalExpressions ? 4 : 0)

          return {
            pass: score >= 6,
            score: Math.min(10, score),
            feedback: hasNaturalExpressions
              ? "사용자 질문이 자연스럽고 현실적입니다."
              : "사용자 질문에 일상적인 표현이 부족합니다.",
          }
        },
      },
      {
        id: "rule_coherence_1",
        name: "대화 일관성",
        description: "대화 흐름이 일관되고 자연스러운지 확인",
        metric: "coherence",
        condition: "후속 질문이 이전 대화 컨텍스트와 일관성을 유지해야 함",
        weight: 0.8,
        checkFunction: (scenario: ChatScenario) => {
          if (scenario.conversations.length <= 1) {
            return { pass: true, score: 10, feedback: "단일 대화는 일관성 평가에서 제외됩니다." }
          }

          let coherenceScore = 0
          let totalChecks = 0

          // 각 대화 쌍에 대해 일관성 검사
          for (let i = 1; i < scenario.conversations.length; i++) {
            const prevBot = scenario.conversations[i - 1].bot.toLowerCase()
            const currentUser = scenario.conversations[i].user.toLowerCase()

            // 이전 봇 응답에서 언급된 키워드가 후속 질문에 포함되어 있는지 확인
            const keywords = this.extractKeywords(prevBot)
            const keywordMatch = keywords.some((keyword) => currentUser.includes(keyword))

            // 대명사 사용 확인 (대명사는 일관성을 나타냄)
            const pronouns = ["이", "그", "저", "이것", "그것", "저것", "여기", "거기", "저기", "이런", "그런"]
            const hasPronoun = pronouns.some((pronoun) => currentUser.includes(pronoun))

            // 점수 계산
            if (keywordMatch) coherenceScore += 5
            if (hasPronoun) coherenceScore += 5
            totalChecks++
          }

          const finalScore = totalChecks > 0 ? coherenceScore / totalChecks : 10

          return {
            pass: finalScore >= 5,
            score: finalScore,
            feedback:
              finalScore >= 7
                ? "대화 흐름이 자연스럽고 일관성이 있습니다."
                : "후속 질문이 이전 대화 컨텍스트와 충분히 연결되지 않습니다.",
          }
        },
      },
      {
        id: "rule_coverage_1",
        name: "주제 커버리지",
        description: "시나리오가 관련 주제를 충분히 다루는지 확인",
        metric: "coverage",
        condition: "시나리오가 카테고리와 관련된 주요 주제를 다루어야 함",
        weight: 0.6,
        checkFunction: (scenario: ChatScenario) => {
          // 카테고리별 주요 키워드 정의
          const categoryKeywords: Record<string, string[]> = {
            "충전소 찾기": ["위치", "가까운", "주변", "충전소", "지도", "네비게이션", "주소"],
            "충전 방법": ["케이블", "연결", "충전기", "시작", "종료", "방법", "단계"],
            "결제 및 요금": ["결제", "카드", "요금", "가격", "할인", "멤버십", "환불"],
            "문제 해결": ["오류", "고장", "문제", "해결", "안됨", "실패", "조치"],
            "계정 관리": ["계정", "로그인", "가입", "비밀번호", "정보", "설정", "프로필"],
            "차량 호환성": ["호환", "지원", "모델", "차종", "케이블", "타입", "커넥터"],
          }

          // 시나리오 카테고리에 해당하는 키워드 가져오기
          const relevantKeywords = categoryKeywords[scenario.category] || []
          if (relevantKeywords.length === 0) {
            return { pass: true, score: 7, feedback: "해당 카테고리의 키워드가 정의되지 않았습니다." }
          }

          // 대화에서 키워드 커버리지 확인
          const allText = scenario.conversations
            .map((c) => c.user + " " + c.bot)
            .join(" ")
            .toLowerCase()
          const coveredKeywords = relevantKeywords.filter((keyword) => allText.includes(keyword))

          // 커버리지 점수 계산
          const coverageRatio = coveredKeywords.length / relevantKeywords.length
          const score = Math.min(10, coverageRatio * 10)

          return {
            pass: score >= 6,
            score,
            feedback:
              score >= 7
                ? `주요 주제를 잘 다루고 있습니다. (${coveredKeywords.length}/${relevantKeywords.length} 키워드 포함)`
                : `주요 주제 커버리지가 부족합니다. (${coveredKeywords.length}/${relevantKeywords.length} 키워드 포함)`,
          }
        },
      },
      {
        id: "rule_userFocus_1",
        name: "사용자 중심 응답",
        description: "챗봇 응답이 사용자 중심적인지 확인",
        metric: "userFocus",
        condition: "챗봇 응답이 사용자의 질문에 직접적으로 답변하고 사용자 관점에서 유용해야 함",
        weight: 0.7,
        checkFunction: (scenario: ChatScenario) => {
          let userFocusScore = 0

          // 각 대화에 대해 사용자 중심성 평가
          scenario.conversations.forEach((conv) => {
            const userQuestion = conv.user.toLowerCase()
            const botResponse = conv.bot.toLowerCase()

            // 질문에 대한 직접적인 답변 확인
            const questionWords = ["어떻게", "왜", "언제", "어디", "무엇", "누구", "어떤"]
            const hasQuestionWord = questionWords.some((word) => userQuestion.includes(word))

            // 사용자 중심 표현 확인
            const userFocusedExpressions = [
              "도와드리겠습니다",
              "안내해드리겠습니다",
              "알려드리겠습니다",
              "확인해보세요",
              "시도해보세요",
            ]
            const hasUserFocusedExpression = userFocusedExpressions.some((expr) => botResponse.includes(expr))

            // 단계별 안내 확인
            const hasStepByStep =
              botResponse.includes("단계") ||
              botResponse.includes("순서") ||
              (botResponse.match(/\d\./g) || []).length >= 2

            // 점수 계산
            let convScore = 5 // 기본 점수
            if (hasQuestionWord && botResponse.length > 50) convScore += 1 // 질문에 대한 충분한 답변
            if (hasUserFocusedExpression) convScore += 2 // 사용자 중심 표현
            if (hasStepByStep) convScore += 2 // 단계별 안내

            userFocusScore += convScore
          })

          const finalScore = userFocusScore / scenario.conversations.length

          return {
            pass: finalScore >= 6,
            score: Math.min(10, finalScore),
            feedback:
              finalScore >= 7
                ? "챗봇 응답이 사용자 중심적이고 유용합니다."
                : "챗봇 응답이 더 사용자 중심적이고 직접적일 필요가 있습니다.",
          }
        },
      },
      {
        id: "rule_technicalAccuracy_1",
        name: "기술적 정확성",
        description: "챗봇 응답의 기술적 정보가 정확한지 확인",
        metric: "technicalAccuracy",
        condition: "전기차 충전 관련 기술 정보가 정확해야 함",
        weight: 0.8,
        checkFunction: (scenario: ChatScenario) => {
          // 전기차 충전 관련 기술 용어 및 정보
          const technicalTerms = {
            "급속 충전": ["50kW", "100kW", "350kW", "DC", "직류"],
            "완속 충전": ["3.3kW", "7kW", "11kW", "22kW", "AC", "교류"],
            "충전 커넥터": ["CCS", "차데모", "CHAdeMO", "타입1", "타입2", "Type1", "Type2", "GB/T"],
            배터리: ["리튬이온", "용량", "kWh", "SOC", "충전율"],
            "충전 시간": ["분", "시간", "80%", "완충"],
          }

          // 기술 용어 사용 확인
          let technicalScore = 0
          let technicalTermsFound = 0

          // 모든 봇 응답에서 기술 용어 확인
          const allBotResponses = scenario.conversations.map((c) => c.bot).join(" ")

          Object.entries(technicalTerms).forEach(([category, terms]) => {
            const categoryTermsFound = terms.some((term) => allBotResponses.includes(term))
            if (categoryTermsFound) {
              technicalTermsFound++

              // 해당 카테고리의 용어가 정확하게 사용되었는지 확인
              // (간단한 구현을 위해 용어 존재 여부만 확인)
              technicalScore += 2
            }
          })

          // 기술 정보의 구체성 확인 (숫자와 단위 사용)
          const hasSpecificNumbers = (allBotResponses.match(/\d+(\.\d+)?\s*(kW|kWh|%|분|시간)/g) || []).length > 0
          if (hasSpecificNumbers) technicalScore += 2

          // 최종 점수 계산 (기본 점수 5에 추가 점수)
          const finalScore = Math.min(10, 5 + technicalScore)

          return {
            pass: finalScore >= 6,
            score: finalScore,
            feedback:
              finalScore >= 7
                ? "챗봇 응답이 기술적으로 정확하고 구체적입니다."
                : "챗봇 응답의 기술적 정확성과 구체성을 개선할 필요가 있습니다.",
          }
        },
      },
    ]

    // 규칙 등록
    for (const rule of defaultRules) {
      this.evaluationRules.set(rule.id, rule)
    }
  }

  /**
   * 키워드 추출 (간단한 구현)
   */
  private extractKeywords(text: string): string[] {
    // 불용어 목록
    const stopwords = [
      "이",
      "그",
      "저",
      "것",
      "수",
      "를",
      "에",
      "의",
      "가",
      "은",
      "는",
      "들",
      "좀",
      "잘",
      "걍",
      "과",
      "도",
      "를",
      "으로",
      "자",
      "에게",
      "뿐",
      "의",
      "께",
      "한",
      "하다",
      "입니다",
      "있습니다",
      "합니다",
      "니다",
      "하세요",
    ]

    // 텍스트 전처리
    const words = text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, "") // 특수문자 제거
      .split(/\s+/) // 공백으로 분리
      .filter((word) => word.length > 1 && !stopwords.includes(word)) // 불용어 및 짧은 단어 제거

    // 중복 제거
    return [...new Set(words)]
  }

  /**
   * 시나리오 평가 작업 생성
   */
  public createEvaluationJob(
    scenarioIds: string[],
    settings: Partial<ScenarioEvaluationSettings> = {},
  ): ScenarioEvaluationJob {
    const id = `eval_job_${Date.now()}_${uuidv4().substring(0, 8)}`
    const mergedSettings = { ...this.defaultSettings, ...settings }

    const job: ScenarioEvaluationJob = {
      id,
      status: "pending",
      scenarioIds,
      evaluationMethod: mergedSettings.evaluationMethod,
      settings: mergedSettings,
      progress: 0,
      createdAt: new Date().toISOString(),
    }

    this.evaluationJobs.set(id, job)
    return job
  }

  /**
   * 시나리오 평가 작업 상태 업데이트
   */
  public updateJobStatus(
    jobId: string,
    updates: Partial<
      Pick<ScenarioEvaluationJob, "status" | "progress" | "startedAt" | "completedAt" | "results" | "error">
    >,
  ): ScenarioEvaluationJob | null {
    const job = this.evaluationJobs.get(jobId)
    if (!job) return null

    const updatedJob = { ...job, ...updates }
    this.evaluationJobs.set(jobId, updatedJob)
    return updatedJob
  }

  /**
   * 시나리오 평가 작업 가져오기
   */
  public getJob(jobId: string): ScenarioEvaluationJob | null {
    return this.evaluationJobs.get(jobId) || null
  }

  /**
   * 시나리오 평가 작업 목록 가져오기
   */
  public getJobs(): ScenarioEvaluationJob[] {
    return Array.from(this.evaluationJobs.values())
  }

  /**
   * 규칙 기반 시나리오 평가
   */
  public evaluateWithRules(scenario: ChatScenario): ScenarioEvaluationResult {
    // 각 지표별 점수 초기화
    const metrics: Partial<ScenarioQualityMetrics> = {
      realism: 0,
      relevance: 0,
      complexity: 0,
      coherence: 0,
      naturalness: 0,
      coverage: 0,
      userFocus: 0,
      technicalAccuracy: 0,
    }

    // 각 지표별 가중치 합계 초기화
    const weightSums: Record<keyof Omit<ScenarioQualityMetrics, "overallScore">, number> = {
      realism: 0,
      relevance: 0,
      complexity: 0,
      coherence: 0,
      naturalness: 0,
      coverage: 0,
      userFocus: 0,
      technicalAccuracy: 0,
    }

    // 강점과 약점 목록
    const strengths: string[] = []
    const weaknesses: string[] = []

    // 모든 규칙 적용
    for (const rule of this.evaluationRules.values()) {
      const metric = rule.metric
      const result = rule.checkFunction(scenario)

      // 지표별 점수 누적
      metrics[metric] = (metrics[metric] || 0) + result.score * rule.weight
      weightSums[metric] += rule.weight

      // 강점 또는 약점 추가
      if (result.feedback) {
        if (result.pass) {
          strengths.push(result.feedback)
        } else {
          weaknesses.push(result.feedback)
        }
      }
    }

    // 지표별 최종 점수 계산
    for (const metric of Object.keys(metrics) as Array<keyof Omit<ScenarioQualityMetrics, "overallScore">>) {
      metrics[metric] = weightSums[metric] > 0 ? (metrics[metric] as number) / weightSums[metric] : 5
    }

    // 종합 점수 계산
    const overallScore = this.calculateOverallScore(
      metrics as ScenarioQualityMetrics,
      this.defaultSettings.metricWeights,
    )

    // 개선 제안 생성
    const improvementSuggestions = this.generateImprovementSuggestions(
      scenario,
      metrics as ScenarioQualityMetrics,
      weaknesses,
    )

    // 평가 결과 생성
    const result: ScenarioEvaluationResult = {
      id: `eval_${Date.now()}_${uuidv4().substring(0, 8)}`,
      scenarioId: scenario.id,
      metrics: {
        ...(metrics as ScenarioQualityMetrics),
        overallScore,
      },
      strengths: [...new Set(strengths)], // 중복 제거
      weaknesses: [...new Set(weaknesses)], // 중복 제거
      improvementSuggestions,
      evaluatedAt: new Date().toISOString(),
      evaluationMethod: "rule",
    }

    // 결과 저장
    this.evaluationResults.push(result)

    return result
  }

  /**
   * AI 기반 시나리오 평가
   */
  public async evaluateWithAI(scenario: ChatScenario): Promise<ScenarioEvaluationResult> {
    try {
      // AI 평가 프롬프트 생성
      const prompt = this.createEvaluationPrompt(scenario)

      // Gemini API 호출
      // const apiKey = process.env.GEMINI_API_KEY
      // if (!apiKey) {
      //   throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.")
      // }

      // const response = await fetch(
      //   `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       contents: [
      //         {
      //           parts: [{ text: prompt }],
      //         },
      //       ],
      //       generationConfig: {
      //         temperature: 0.2,
      //         topK: 40,
      //         topP: 0.95,
      //         maxOutputTokens: 4096,
      //       },
      //     }),
      //   },
      // )

      // if (!response.ok) {
      //   throw new Error(`AI 평가 API 오류: ${response.statusText}`)
      // }

      // const data = await response.json()
      // const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text

      const { text } = await generateText({
        model: google("gemini-pro"),
        prompt: prompt,
        temperature: 0.3,
      })

      // JSON 응답 파싱
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/)
      let evaluationData

      if (jsonMatch && jsonMatch[1]) {
        evaluationData = JSON.parse(jsonMatch[1])
      } else {
        try {
          evaluationData = JSON.parse(text)
        } catch (e) {
          throw new Error("AI 평가 결과를 파싱할 수 없습니다.")
        }
      }

      // 종합 점수 계산
      const metrics = evaluationData.metrics
      const overallScore = this.calculateOverallScore(metrics, this.defaultSettings.metricWeights)

      // 평가 결과 생성
      const result: ScenarioEvaluationResult = {
        id: `eval_${Date.now()}_${uuidv4().substring(0, 8)}`,
        scenarioId: scenario.id,
        metrics: {
          ...metrics,
          overallScore,
        },
        strengths: evaluationData.strengths || [],
        weaknesses: evaluationData.weaknesses || [],
        improvementSuggestions: evaluationData.improvementSuggestions.map((suggestion: any) => ({
          ...suggestion,
          id: `sugg_${Date.now()}_${uuidv4().substring(0, 8)}`,
        })),
        evaluatedAt: new Date().toISOString(),
        evaluationMethod: "ai",
        evaluatedBy: "gemini-1.5-pro",
      }

      // 결과 저장
      this.evaluationResults.push(result)

      return result
    } catch (error) {
      console.error("AI 평가 오류:", error)

      // 오류 발생 시 규칙 기반 평가로 대체
      const ruleBasedResult = this.evaluateWithRules(scenario)
      ruleBasedResult.notes = `AI 평가 중 오류 발생: ${error instanceof Error ? error.message : String(error)}. 규칙 기반 평가로 대체됨.`
      return ruleBasedResult
    }
  }

  /**
   * 하이브리드 시나리오 평가 (AI + 규칙)
   */
  public async evaluateWithHybrid(scenario: ChatScenario): Promise<ScenarioEvaluationResult> {
    // AI 평가 수행
    const aiResult = await this.evaluateWithAI(scenario)

    // 규칙 기반 평가 수행
    const ruleResult = this.evaluateWithRules(scenario)

    // 두 평가 결과 병합 (가중 평균)
    const aiWeight = 0.7 // AI 평가 가중치
    const ruleWeight = 0.3 // 규칙 기반 평가 가중치

    const metrics: ScenarioQualityMetrics = {
      realism: aiResult.metrics.realism * aiWeight + ruleResult.metrics.realism * ruleWeight,
      relevance: aiResult.metrics.relevance * aiWeight + ruleResult.metrics.relevance * ruleWeight,
      complexity: aiResult.metrics.complexity * aiWeight + ruleResult.metrics.complexity * ruleWeight,
      coherence: aiResult.metrics.coherence * aiWeight + ruleResult.metrics.coherence * ruleWeight,
      naturalness: aiResult.metrics.naturalness * aiWeight + ruleResult.metrics.naturalness * ruleWeight,
      coverage: aiResult.metrics.coverage * aiWeight + ruleResult.metrics.coverage * ruleWeight,
      userFocus: aiResult.metrics.userFocus * aiWeight + ruleResult.metrics.userFocus * ruleWeight,
      technicalAccuracy:
        aiResult.metrics.technicalAccuracy * aiWeight + ruleResult.metrics.technicalAccuracy * ruleWeight,
      overallScore: aiResult.metrics.overallScore * aiWeight + ruleResult.metrics.overallScore * ruleWeight,
    }

    // 강점과 약점 병합
    const strengths = [...new Set([...aiResult.strengths, ...ruleResult.strengths])]
    const weaknesses = [...new Set([...aiResult.weaknesses, ...ruleResult.weaknesses])]

    // 개선 제안 병합 (AI 제안 우선)
    const improvementSuggestions = [
      ...aiResult.improvementSuggestions,
      ...ruleResult.improvementSuggestions.filter(
        (ruleSugg) =>
          !aiResult.improvementSuggestions.some(
            (aiSugg) => aiSugg.type === ruleSugg.type && aiSugg.target === ruleSugg.target,
          ),
      ),
    ].slice(0, this.defaultSettings.maxSuggestionsPerScenario || 5)

    // 평가 결과 생성
    const result: ScenarioEvaluationResult = {
      id: `eval_${Date.now()}_${uuidv4().substring(0, 8)}`,
      scenarioId: scenario.id,
      metrics,
      strengths,
      weaknesses,
      improvementSuggestions,
      evaluatedAt: new Date().toISOString(),
      evaluationMethod: "hybrid",
      notes: "AI 평가와 규칙 기반 평가의 하이브리드 결과입니다.",
    }

    // 결과 저장
    this.evaluationResults.push(result)

    return result
  }

  /**
   * 시나리오 평가 (방법에 따라 적절한 평가 함수 호출)
   */
  public async evaluateScenario(
    scenario: ChatScenario,
    method: "ai" | "rule" | "hybrid" = "hybrid",
  ): Promise<ScenarioEvaluationResult> {
    switch (method) {
      case "ai":
        return this.evaluateWithAI(scenario)
      case "rule":
        return this.evaluateWithRules(scenario)
      case "hybrid":
      default:
        return this.evaluateWithHybrid(scenario)
    }
  }

  /**
   * 평가 작업 실행
   */
  public async runEvaluationJob(jobId: string): Promise<ScenarioEvaluationJob | null> {
    const job = this.evaluationJobs.get(jobId)
    if (!job || job.status !== "pending") return null

    try {
      // 작업 상태 업데이트
      this.updateJobStatus(jobId, {
        status: "in_progress",
        startedAt: new Date().toISOString(),
        progress: 0,
      })

      // 시나리오 목록 가져오기 (실제 구현에서는 시나리오 서비스에서 가져옴)
      // 여기서는 예시로 빈 배열 사용
      const scenarios: ChatScenario[] = [] // scenarioService.getScenariosByIds(job.scenarioIds)

      // 결과 배열 초기화
      const results: ScenarioEvaluationResult[] = []

      // 각 시나리오 평가
      for (let i = 0; i < job.scenarioIds.length; i++) {
        const scenarioId = job.scenarioIds[i]
        const scenario = scenarios.find((s) => s.id === scenarioId)

        if (scenario) {
          // 시나리오 평가
          const result = await this.evaluateScenario(scenario, job.evaluationMethod)
          results.push(result)
        }

        // 진행 상황 업데이트
        const progress = Math.round(((i + 1) / job.scenarioIds.length) * 100)
        this.updateJobStatus(jobId, { progress })
      }

      // 작업 완료 상태 업데이트
      return this.updateJobStatus(jobId, {
        status: "completed",
        completedAt: new Date().toISOString(),
        progress: 100,
        results,
      })
    } catch (error) {
      console.error("평가 작업 실행 오류:", error)

      // 오류 상태 업데이트
      return this.updateJobStatus(jobId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /**
   * 평가 결과 가져오기
   */
  public getEvaluationResult(resultId: string): ScenarioEvaluationResult | null {
    return this.evaluationResults.find((r) => r.id === resultId) || null
  }

  /**
   * 시나리오별 평가 결과 가져오기
   */
  public getEvaluationResultsByScenarioId(scenarioId: string): ScenarioEvaluationResult[] {
    return this.evaluationResults.filter((r) => r.scenarioId === scenarioId)
  }

  /**
   * 모든 평가 결과 가져오기
   */
  public getAllEvaluationResults(): ScenarioEvaluationResult[] {
    return [...this.evaluationResults]
  }

  /**
   * 평가 통계 생성
   */
  public generateEvaluationStats(): ScenarioEvaluationStats {
    const results = this.evaluationResults

    if (results.length === 0) {
      return {
        totalEvaluated: 0,
        averageMetrics: {
          realism: 0,
          relevance: 0,
          complexity: 0,
          coherence: 0,
          naturalness: 0,
          coverage: 0,
          userFocus: 0,
          technicalAccuracy: 0,
          overallScore: 0,
        },
        metricDistribution: {
          realism: [],
          relevance: [],
          complexity: [],
          coherence: [],
          naturalness: [],
          coverage: [],
          userFocus: [],
          technicalAccuracy: [],
          overallScore: [],
        },
        commonStrengths: [],
        commonWeaknesses: [],
        commonSuggestionTypes: {
          add: 0,
          modify: 0,
          remove: 0,
          replace: 0,
          reorder: 0,
        },
        evaluationMethods: {
          ai: 0,
          rule: 0,
          hybrid: 0,
          human: 0,
        },
        timeRange: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        },
      }
    }

    // 평균 지표 계산
    const averageMetrics: ScenarioQualityMetrics = {
      realism: 0,
      relevance: 0,
      complexity: 0,
      coherence: 0,
      naturalness: 0,
      coverage: 0,
      userFocus: 0,
      technicalAccuracy: 0,
      overallScore: 0,
    }

    // 지표 분포 초기화
    const metricDistribution: Record<keyof ScenarioQualityMetrics, number[]> = {
      realism: [],
      relevance: [],
      complexity: [],
      coherence: [],
      naturalness: [],
      coverage: [],
      userFocus: [],
      technicalAccuracy: [],
      overallScore: [],
    }

    // 평가 방법 분포 초기화
    const evaluationMethods: Record<ScenarioEvaluationResult["evaluationMethod"], number> = {
      ai: 0,
      rule: 0,
      hybrid: 0,
      human: 0,
    }

    // 제안 유형 분포 초기화
    const suggestionTypes: Record<ScenarioImprovementSuggestion["type"], number> = {
      add: 0,
      modify: 0,
      remove: 0,
      replace: 0,
      reorder: 0,
    }

    // 강점과 약점 카운트
    const strengthsCount: Record<string, number> = {}
    const weaknessesCount: Record<string, number> = {}

    // 시간 범위
    let minTime = new Date(results[0].evaluatedAt).getTime()
    let maxTime = minTime

    // 데이터 집계
    for (const result of results) {
      // 지표 합산
      for (const key of Object.keys(averageMetrics) as Array<keyof ScenarioQualityMetrics>) {
        averageMetrics[key] += result.metrics[key]
        metricDistribution[key].push(result.metrics[key])
      }

      // 평가 방법 카운트
      evaluationMethods[result.evaluationMethod]++

      // 제안 유형 카운트
      for (const suggestion of result.improvementSuggestions) {
        suggestionTypes[suggestion.type]++
      }

      // 강점 카운트
      for (const strength of result.strengths) {
        strengthsCount[strength] = (strengthsCount[strength] || 0) + 1
      }

      // 약점 카운트
      for (const weakness of result.weaknesses) {
        weaknessesCount[weakness] = (weaknessesCount[weakness] || 0) + 1
      }

      // 시간 범위 업데이트
      const time = new Date(result.evaluatedAt).getTime()
      if (time < minTime) minTime = time
      if (time > maxTime) maxTime = time
    }

    // 평균 계산
    for (const key of Object.keys(averageMetrics) as Array<keyof ScenarioQualityMetrics>) {
      averageMetrics[key] /= results.length
    }

    // 상위 강점 및 약점 추출
    const commonStrengths = Object.entries(strengthsCount)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const commonWeaknesses = Object.entries(weaknessesCount)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalEvaluated: results.length,
      averageMetrics,
      metricDistribution,
      commonStrengths,
      commonWeaknesses,
      commonSuggestionTypes: suggestionTypes,
      evaluationMethods,
      timeRange: {
        start: new Date(minTime).toISOString(),
        end: new Date(maxTime).toISOString(),
      },
    }
  }

  /**
   * 종합 점수 계산
   */
  private calculateOverallScore(
    metrics: ScenarioQualityMetrics,
    weights: Partial<Record<keyof Omit<ScenarioQualityMetrics, "overallScore">, number>> = {},
  ): number {
    // 기본 가중치
    const defaultWeights: Record<keyof Omit<ScenarioQualityMetrics, "overallScore">, number> = {
      realism: 0.15,
      relevance: 0.15,
      complexity: 0.1,
      coherence: 0.15,
      naturalness: 0.1,
      coverage: 0.1,
      userFocus: 0.15,
      technicalAccuracy: 0.1,
    }

    // 가중치 병합
    const mergedWeights = { ...defaultWeights, ...weights }

    // 가중 평균 계산
    let weightedSum = 0
    let totalWeight = 0

    for (const [metric, weight] of Object.entries(mergedWeights)) {
      const metricKey = metric as keyof Omit<ScenarioQualityMetrics, "overallScore">
      weightedSum += metrics[metricKey] * weight
      totalWeight += weight
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }

  /**
   * AI 평가 프롬프트 생성
   */
  private createEvaluationPrompt(scenario: ChatScenario): string {
    return `
전기차 충전 챗봇을 위한 대화 시나리오를 평가해주세요. 다음 시나리오를 분석하고 품질 지표에 따라 점수를 매겨주세요.

## 평가할 시나리오
카테고리: ${scenario.category}
제목: ${scenario.title}
설명: ${scenario.description}

대화:
${scenario.conversations
  .map(
    (conv, index) => `
[사용자 ${index + 1}] ${conv.user}
[챗봇 ${index + 1}] ${conv.bot}
${conv.intent ? `인텐트: ${conv.intent}` : ""}
${conv.entities ? `엔티티: ${JSON.stringify(conv.entities)}` : ""}
${conv.notes ? `노트: ${conv.notes}` : ""}
`,
  )
  .join("\n")}

핵심 기능:
${scenario.keyFeatures?.map((feature) => `- ${feature}`).join("\n") || "핵심 기능이 명시되지 않았습니다."}

## 평가 지표
다음 지표에 대해 0-10점 척도로 평가해주세요:

1. 현실성 (Realism): 시나리오가 실제 사용자와 챗봇 간의 대화를 얼마나 현실적으로 반영하는지
2. 관련성 (Relevance): 시나리오가 카테고리 및 주제와 얼마나 관련이 있는지
3. 복잡성 (Complexity): 시나리오가 다양한 상황과 질문을 다루는 복잡성 수준
4. 일관성 (Coherence): 대화 흐름이 얼마나 일관되고 자연스러운지
5. 자연스러움 (Naturalness): 사용자 질문과 챗봇 응답이 얼마나 자연스러운지
6. 주제 커버리지 (Coverage): 시나리오가 관련 주제를 얼마나 포괄적으로 다루는지
7. 사용자 중심성 (User Focus): 챗봇 응답이 사용자 요구를 얼마나 잘 충족하는지
8. 기술적 정확성 (Technical Accuracy): 전기차 충전 관련 기술 정보가 얼마나 정확한지

## 강점 및 약점
시나리오의 주요 강점과 약점을 각각 3-5개 식별해주세요.

## 개선 제안
시나리오를 개선하기 위한 구체적인 제안을 3-5개 제공해주세요. 각 제안은 다음 형식을 따라야 합니다:
- 유형: "add" (추가), "modify" (수정), "remove" (제거), "replace" (대체), "reorder" (순서 변경) 중 하나
- 대상: "conversation" (대화), "title" (제목), "description" (설명), "keyFeatures" (핵심 기능), "entire" (전체) 중 하나
- 대상 인덱스: 대화의 경우 해당 대화의 인덱스 (0부터 시작)
- 신뢰도: 제안의 신뢰도 (0-1 사이의 값)
- 영향도: 제안의 영향도 ("high", "medium", "low" 중 하나)
- 제안 내용: 구체적인 제안 내용
- 제안 이유: 이 제안이 필요한 이유
- 구현 예시: 제안을 구현한 예시 (선택 사항)

## 출력 형식
다음 JSON 형식으로 평가 결과를 제공해주세요:

\`\`\`json
{
  "metrics": {
    "realism": 0-10,
    "relevance": 0-10,
    "complexity": 0-10,
    "coherence": 0-10,
    "naturalness": 0-10,
    "coverage": 0-10,
    "userFocus": 0-10,
    "technicalAccuracy": 0-10
  },
  "strengths": [
    "강점 1",
    "강점 2",
    ...
  ],
  "weaknesses": [
    "약점 1",
    "약점 2",
    ...
  ],
  "improvementSuggestions": [
    {
      "type": "add|modify|remove|replace|reorder",
      "target": "conversation|title|description|keyFeatures|entire",
      "targetIndex": 0-N,
      "confidence": 0-1,
      "impact": "high|medium|low",
      "suggestion": "제안 내용",
      "reasoning": "제안 이유",
      "exampleImplementation": "구현 예시"
    },
    ...
  ]
}
\`\`\`

JSON 형식만 반환하고 다른 설명은 포함하지 마세요.
`
  }

  /**
   * 개선 제안 생성 (규칙 기반)
   */
  private generateImprovementSuggestions(
    scenario: ChatScenario,
    metrics: ScenarioQualityMetrics,
    weaknesses: string[],
  ): ScenarioImprovementSuggestion[] {
    const suggestions: ScenarioImprovementSuggestion[] = []

    // 현실성이 낮은 경우
    if (metrics.realism < 6) {
      suggestions.push({
        id: `sugg_${Date.now()}_${uuidv4().substring(0, 8)}`,
        type: "modify",
        target: "conversation",
        confidence: 0.8,
        impact: "high",
        suggestion: "사용자 질문을 더 자연스럽고 일상적인 표현으로 수정",
        reasoning:
          "현재 사용자 질문이 너무 형식적이거나 비현실적입니다. 실제 사용자들은 더 간결하고 일상적인 언어를 사용합니다.",
        exampleImplementation: "예: '충전소 위치 정보를 제공해주세요' → '근처 충전소 어디 있어요?'",
      })
    }

    // 일관성이 낮은 경우
    if (metrics.coherence < 6) {
      suggestions.push({
        id: `sugg_${Date.now()}_${uuidv4().substring(0, 8)}`,
        type: "modify",
        target: "conversation",
        confidence: 0.7,
        impact: "medium",
        suggestion: "후속 질문에 이전 대화 컨텍스트 반영",
        reasoning: "대화 흐름이 자연스럽지 않습니다. 후속 질문은 이전 대화 내용을 참조하거나 연결되어야 합니다.",
        exampleImplementation: "이전 응답에서 언급된 키워드나 정보를 후속 질문에 포함시키세요.",
      })
    }

    // 사용자 중심성이 낮은 경우
    if (metrics.userFocus < 6) {
      suggestions.push({
        id: `sugg_${Date.now()}_${uuidv4().substring(0, 8)}`,
        type: "modify",
        target: "conversation",
        confidence: 0.8,
        impact: "high",
        suggestion: "챗봇 응답에 사용자 중심 표현 추가",
        reasoning:
          "챗봇 응답이 정보 제공에만 집중되어 있습니다. 사용자를 직접 언급하고 도움을 제공하는 표현을 추가하세요.",
        exampleImplementation:
          "예: '충전소는 서울역에 있습니다.' → '고객님, 가장 가까운 충전소는 서울역에 있습니다. 도움이 필요하시면 알려주세요.'",
      })
    }

    // 기술적 정확성이 낮은 경우
    if (metrics.technicalAccuracy < 6) {
      suggestions.push({
        id: `sugg_${Date.now()}_${uuidv4().substring(0, 8)}`,
        type: "modify",
        target: "conversation",
        confidence: 0.9,
        impact: "high",
        suggestion: "전기차 충전 관련 기술 정보 정확도 개선",
        reasoning: "챗봇 응답에 포함된 기술 정보가 부정확하거나 불충분합니다. 정확한 수치와 기술 용어를 사용하세요.",
        exampleImplementation: "충전 속도, 전력량, 커넥터 유형 등에 대한 정확한 정보를 포함시키세요.",
      })
    }

    // 주제 커버리지가 낮은 경우
    if (metrics.coverage < 6) {
      suggestions.push({
        id: `sugg_${Date.now()}_${uuidv4().substring(0, 8)}`,
        type: "add",
        target: "conversation",
        targetIndex: scenario.conversations.length,
        confidence: 0.7,
        impact: "medium",
        suggestion: "관련 주제에 대한 추가 대화 포함",
        reasoning: "시나리오가 카테고리의 주요 주제를 충분히 다루지 않습니다. 관련된 추가 질문과 응답을 포함하세요.",
        exampleImplementation: "카테고리와 관련된 추가 질문-응답 쌍을 1-2개 추가하세요.",
      })
    }

    // 약점 기반 추가 제안
    if (weaknesses.length > 0) {
      // 첫 번째 약점에 대한 제안
      suggestions.push({
        id: `sugg_${Date.now()}_${uuidv4().substring(0, 8)}`,
        type: "modify",
        target: "entire",
        confidence: 0.6,
        impact: "medium",
        suggestion: "식별된 약점 개선",
        reasoning: `시나리오에서 다음 약점이 발견되었습니다: "${weaknesses[0]}"`,
        exampleImplementation: "약점을 해결하기 위해 관련 부분을 검토하고 수정하세요.",
      })
    }

    // 핵심 기능이 부족한 경우
    if (!scenario.keyFeatures || scenario.keyFeatures.length < 3) {
      suggestions.push({
        id: `sugg_${Date.now()}_${uuidv4().substring(0, 8)}`,
        type: "add",
        target: "keyFeatures",
        confidence: 0.8,
        impact: "medium",
        suggestion: "핵심 기능 추가",
        reasoning:
          "시나리오의 핵심 기능이 부족하거나 명확하지 않습니다. 이 시나리오가 보여주는 챗봇의 주요 능력을 명시하세요.",
        exampleImplementation:
          "예: '컨텍스트 유지 능력', '사용자 의도 파악', '단계별 안내 제공' 등의 핵심 기능을 추가하세요.",
      })
    }

    // 최대 5개 제안으로 제한
    return suggestions.slice(0, 5)
  }
}

export const scenarioEvaluationService = ScenarioEvaluationService.getInstance()
