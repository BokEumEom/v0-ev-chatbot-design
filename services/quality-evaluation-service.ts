import type {
  QualityMetrics,
  EvaluationResult,
  EvaluationRule,
  EvaluationJob,
  EvaluationConfig,
  EvaluationMethod,
} from "@/types/quality-evaluation"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"

/**
 * 품질 평가 서비스
 * 프롬프트 응답의 품질을 자동으로 평가하는 서비스
 */
export class QualityEvaluationService {
  private static instance: QualityEvaluationService
  private config: EvaluationConfig
  private evaluationJobs: Map<string, EvaluationJob> = new Map()
  private evaluationResults: EvaluationResult[] = []
  private rules: Map<string, EvaluationRule> = new Map()

  private constructor() {
    // 기본 평가 설정 초기화
    this.config = {
      defaultMethod: "hybrid",
      metrics: {
        relevance: {
          weight: 0.2,
          threshold: 7,
          description: "응답이 사용자 질문과 얼마나 관련이 있는지 평가",
        },
        accuracy: {
          weight: 0.2,
          threshold: 8,
          description: "응답에 포함된 정보가 얼마나 정확한지 평가",
        },
        completeness: {
          weight: 0.15,
          threshold: 7,
          description: "응답이 사용자 질문에 얼마나 완전하게 답변하는지 평가",
        },
        clarity: {
          weight: 0.15,
          threshold: 7,
          description: "응답이 얼마나 명확하고 이해하기 쉬운지 평가",
        },
        helpfulness: {
          weight: 0.15,
          threshold: 7,
          description: "응답이 사용자 문제 해결에 얼마나 도움이 되는지 평가",
        },
        conciseness: {
          weight: 0.05,
          threshold: 6,
          description: "응답이 불필요한 정보 없이 간결한지 평가",
        },
        tone: {
          weight: 0.1,
          threshold: 7,
          description: "응답의 어조가 적절하고 친절한지 평가",
        },
      },
      rules: [],
      aiEvaluator: {
        model: "gemini-2.0-flash",
        prompt: `당신은 AI 응답 품질 평가 전문가입니다. 다음 대화에서 AI 응답의 품질을 평가해주세요.

사용자 질문: {{userMessage}}
AI 응답: {{botResponse}}
감지된 인텐트: {{detectedIntent}}

다음 7가지 지표에 대해 0-10점 척도로 평가해주세요:
1. 관련성 (Relevance): 응답이 사용자 질문과 얼마나 관련이 있는지
2. 정확성 (Accuracy): 응답에 포함된 정보가 얼마나 정확한지
3. 완전성 (Completeness): 응답이 사용자 질문에 얼마나 완전하게 답변하는지
4. 명확성 (Clarity): 응답이 얼마나 명확하고 이해하기 쉬운지
5. 유용성 (Helpfulness): 응답이 사용자 문제 해결에 얼마나 도움이 되는지
6. 간결성 (Conciseness): 응답이 불필요한 정보 없이 간결한지
7. 어조 (Tone): 응답의 어조가 적절하고 친절한지

각 지표에 대한 점수와 간단한 설명을 제공해주세요. 그리고 마지막에 종합 평가와 개선 제안을 추가해주세요.

응답 형식:
{
  "metrics": {
    "relevance": 0-10,
    "accuracy": 0-10,
    "completeness": 0-10,
    "clarity": 0-10,
    "helpfulness": 0-10,
    "conciseness": 0-10,
    "tone": 0-10
  },
  "feedback": "종합 평가 및 개선 제안",
  "examples": {
    "good": "더 나은 응답 예시",
    "bad": "피해야 할 응답 예시"
  }
}`,
        temperature: 0.2,
      },
    }

    // 기본 평가 규칙 초기화
    this.initializeDefaultRules()
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): QualityEvaluationService {
    if (!QualityEvaluationService.instance) {
      QualityEvaluationService.instance = new QualityEvaluationService()
    }
    return QualityEvaluationService.instance
  }

  /**
   * 기본 평가 규칙 초기화
   */
  private initializeDefaultRules(): void {
    const defaultRules: EvaluationRule[] = [
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
      {
        id: "rule_clarity_1",
        name: "명확한 설명",
        description: "응답이 명확하고 이해하기 쉬운지 확인",
        metric: "clarity",
        condition: "응답이 전문 용어를 최소화하고 명확한 언어를 사용해야 함",
        weight: 0.6,
        examples: {
          pass: ["충전기 연결 후 앱에서 '충전 시작' 버튼을 누르세요."],
          fail: ["TCP/IP 연결이 설정되면 충전 프로토콜이 시작됩니다."],
        },
      },
      {
        id: "rule_helpfulness_1",
        name: "실행 가능한 해결책",
        description: "응답이 실행 가능한 해결책을 제공하는지 확인",
        metric: "helpfulness",
        condition: "응답이 사용자가 실행할 수 있는 구체적인 해결책을 제공해야 함",
        weight: 0.7,
        examples: {
          pass: [
            "충전이 중단된 경우, 앱을 재시작하고 다시 시도해보세요. 계속 문제가 발생하면 1588-0000으로 연락주세요.",
          ],
          fail: ["충전이 중단되었군요. 불편을 드려 죄송합니다."],
        },
      },
      {
        id: "rule_conciseness_1",
        name: "간결한 응답",
        description: "응답이 불필요한 정보 없이 간결한지 확인",
        metric: "conciseness",
        condition: "응답이 150단어 이내로 핵심 정보만 포함해야 함",
        weight: 0.5,
        examples: {
          pass: ["가장 가까운 충전소는 강남역 2번 출구 앞(500m)입니다."],
          fail: [
            "가장 가까운 충전소를 알려드리겠습니다. 현재 위치에서 가장 가까운 충전소는 강남역 2번 출구 앞에 있습니다. 이 충전소는 귀하의 현재 위치에서 약 500미터 떨어져 있습니다. 이 충전소에는 여러 대의 충전기가 있으며, 24시간 운영됩니다.",
          ],
        },
      },
      {
        id: "rule_tone_1",
        name: "공손한 어조",
        description: "응답이 공손하고 친절한 어조를 유지하는지 확인",
        metric: "tone",
        condition: "응답이 공손한 표현과 존칭을 사용해야 함",
        weight: 0.6,
        examples: {
          pass: ["불편을 드려 죄송합니다. 문제 해결을 도와드리겠습니다."],
          fail: ["그건 사용자 실수입니다. 매뉴얼을 읽어보세요."],
        },
      },
    ]

    // 규칙 등록
    for (const rule of defaultRules) {
      this.rules.set(rule.id, rule)
    }

    // 설정에 규칙 추가
    this.config.rules = defaultRules
  }

  /**
   * 평가 설정 가져오기
   */
  public getConfig(): EvaluationConfig {
    return this.config
  }

  /**
   * 평가 설정 업데이트
   */
  public updateConfig(newConfig: Partial<EvaluationConfig>): EvaluationConfig {
    this.config = { ...this.config, ...newConfig }
    return this.config
  }

  /**
   * 규칙 추가
   */
  public addRule(rule: Omit<EvaluationRule, "id">): EvaluationRule {
    const id = `rule_${Date.now()}`
    const newRule: EvaluationRule = { ...rule, id }
    this.rules.set(id, newRule)
    this.config.rules = Array.from(this.rules.values())
    return newRule
  }

  /**
   * 규칙 업데이트
   */
  public updateRule(id: string, updates: Partial<EvaluationRule>): EvaluationRule | null {
    const rule = this.rules.get(id)
    if (!rule) return null

    const updatedRule = { ...rule, ...updates }
    this.rules.set(id, updatedRule)
    this.config.rules = Array.from(this.rules.values())
    return updatedRule
  }

  /**
   * 규칙 삭제
   */
  public deleteRule(id: string): boolean {
    const deleted = this.rules.delete(id)
    if (deleted) {
      this.config.rules = Array.from(this.rules.values())
    }
    return deleted
  }

  /**
   * 규칙 목록 가져오기
   */
  public getRules(): EvaluationRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * 평가 작업 생성
   */
  public createEvaluationJob(
    promptVersionId: string,
    method: EvaluationMethod = this.config.defaultMethod,
  ): EvaluationJob {
    const id = `job_${Date.now()}`
    const job: EvaluationJob = {
      id,
      promptVersionId,
      status: "pending",
      method,
      createdAt: new Date().toISOString(),
      totalConversations: 0, // 실제 구현에서는 대화 수 계산
      evaluatedConversations: 0,
    }

    this.evaluationJobs.set(id, job)
    return job
  }

  /**
   * 평가 작업 상태 업데이트
   */
  public updateJobStatus(
    jobId: string,
    updates: Partial<Pick<EvaluationJob, "status" | "startedAt" | "completedAt" | "evaluatedConversations" | "error">>,
  ): EvaluationJob | null {
    const job = this.evaluationJobs.get(jobId)
    if (!job) return null

    const updatedJob = { ...job, ...updates }
    this.evaluationJobs.set(jobId, updatedJob)
    return updatedJob
  }

  /**
   * 평가 작업 가져오기
   */
  public getJob(jobId: string): EvaluationJob | null {
    return this.evaluationJobs.get(jobId) || null
  }

  /**
   * 평가 작업 목록 가져오기
   */
  public getJobs(promptVersionId?: string): EvaluationJob[] {
    const jobs = Array.from(this.evaluationJobs.values())
    if (promptVersionId) {
      return jobs.filter((job) => job.promptVersionId === promptVersionId)
    }
    return jobs
  }

  /**
   * 단일 응답 평가 (AI 기반)
   */
  public async evaluateWithAI(
    userMessage: string,
    botResponse: string,
    detectedIntent: string,
    promptVersionId: string,
    conversationId: string,
  ): Promise<EvaluationResult> {
    try {
      // AI 평가 프롬프트 생성
      const prompt = this.config.aiEvaluator.prompt
        .replace("{{userMessage}}", userMessage)
        .replace("{{botResponse}}", botResponse)
        .replace("{{detectedIntent}}", detectedIntent)

      // Gemini API 호출 (실제 구현에서는 API 호출)
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.")
      }

      // const response = await fetch(
      //   `https://generativelanguage.googleapis.com/v1beta/models/${this.config.aiEvaluator.model}:generateContent?key=${apiKey}`,
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
      //         temperature: this.config.aiEvaluator.temperature,
      //         topK: 40,
      //         topP: 0.95,
      //         maxOutputTokens: 1024,
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

      const responseText = text

      // JSON 응답 파싱
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/({[\s\S]*})/)
      let evaluationData

      if (jsonMatch && jsonMatch[1]) {
        evaluationData = JSON.parse(jsonMatch[1])
      } else {
        try {
          evaluationData = JSON.parse(responseText)
        } catch (e) {
          throw new Error("AI 평가 결과를 파싱할 수 없습니다.")
        }
      }

      // 종합 점수 계산
      const metrics = evaluationData.metrics
      const overallScore = this.calculateOverallScore(metrics)

      // 평가 결과 생성
      const result: EvaluationResult = {
        id: `eval_${Date.now()}`,
        promptVersionId,
        conversationId,
        userMessage,
        botResponse,
        detectedIntent,
        metrics: {
          ...metrics,
          overallScore,
        },
        method: "ai",
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: this.config.aiEvaluator.model,
        feedback: evaluationData.feedback,
        examples: evaluationData.examples,
      }

      // 결과 저장
      this.evaluationResults.push(result)

      return result
    } catch (error) {
      console.error("AI 평가 오류:", error)

      // 오류 발생 시 기본 평가 결과 반환
      return {
        id: `eval_${Date.now()}_error`,
        promptVersionId,
        conversationId,
        userMessage,
        botResponse,
        detectedIntent,
        metrics: {
          relevance: 5,
          accuracy: 5,
          completeness: 5,
          clarity: 5,
          helpfulness: 5,
          conciseness: 5,
          tone: 5,
          overallScore: 5,
        },
        method: "ai",
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: this.config.aiEvaluator.model,
        feedback: `평가 중 오류 발생: ${error.message}`,
      }
    }
  }

  /**
   * 단일 응답 평가 (규칙 기반)
   */
  public evaluateWithRules(
    userMessage: string,
    botResponse: string,
    detectedIntent: string,
    promptVersionId: string,
    conversationId: string,
  ): EvaluationResult {
    // 각 지표별 점수 초기화
    const metrics: Partial<QualityMetrics> = {
      relevance: 0,
      accuracy: 0,
      completeness: 0,
      clarity: 0,
      helpfulness: 0,
      conciseness: 0,
      tone: 0,
    }

    // 각 지표별 가중치 합계 초기화
    const weightSums: Record<keyof Omit<QualityMetrics, "overallScore">, number> = {
      relevance: 0,
      accuracy: 0,
      completeness: 0,
      clarity: 0,
      helpfulness: 0,
      conciseness: 0,
      tone: 0,
    }

    // 간단한 규칙 기반 평가 (실제 구현에서는 더 정교한 규칙 적용)
    for (const rule of this.rules.values()) {
      const metric = rule.metric
      let score = 0

      // 간단한 규칙 적용 예시 (실제 구현에서는 더 정교한 로직 사용)
      switch (rule.id) {
        case "rule_relevance_1":
          // 질문 키워드 포함 여부 확인
          const keywords = this.extractKeywords(userMessage)
          const keywordCount = keywords.filter((keyword) =>
            botResponse.toLowerCase().includes(keyword.toLowerCase()),
          ).length
          score = keywordCount > 0 ? Math.min(10, (keywordCount / keywords.length) * 10) : 0
          break

        case "rule_accuracy_1":
          // 정확한 정보 제공 여부 확인 (실제 구현에서는 지식 베이스와 비교)
          score = 8 // 예시 점수
          break

        case "rule_completeness_1":
          // 질문 완전 응답 여부 확인
          score = botResponse.length > 50 ? 8 : 5 // 간단한 예시
          break

        case "rule_clarity_1":
          // 명확한 설명 여부 확인
          const avgWordLength =
            botResponse.split(" ").reduce((sum, word) => sum + word.length, 0) / botResponse.split(" ").length
          score = avgWordLength < 6 ? 9 : 6 // 간단한 예시
          break

        case "rule_helpfulness_1":
          // 실행 가능한 해결책 제공 여부 확인
          score = botResponse.includes("다음") || botResponse.includes("방법") || botResponse.includes("해결") ? 8 : 5
          break

        case "rule_conciseness_1":
          // 간결한 응답 여부 확인
          score = botResponse.split(" ").length < 100 ? 9 : 5
          break

        case "rule_tone_1":
          // 공손한 어조 유지 여부 확인
          score =
            botResponse.includes("감사") || botResponse.includes("죄송") || botResponse.includes("도와드리") ? 9 : 6
          break

        default:
          score = 5 // 기본 점수
      }

      // 지표별 점수 누적
      metrics[metric] = (metrics[metric] || 0) + score * rule.weight
      weightSums[metric] += rule.weight
    }

    // 지표별 최종 점수 계산
    for (const metric of Object.keys(metrics) as Array<keyof Omit<QualityMetrics, "overallScore">>) {
      metrics[metric] = weightSums[metric] > 0 ? (metrics[metric] as number) / weightSums[metric] : 5
    }

    // 종합 점수 계산
    const overallScore = this.calculateOverallScore(metrics as QualityMetrics)

    // 평가 결과 생성
    const result: EvaluationResult = {
      id: `eval_${Date.now()}`,
      promptVersionId,
      conversationId,
      userMessage,
      botResponse,
      detectedIntent,
      metrics: {
        ...(metrics as QualityMetrics),
        overallScore,
      },
      method: "rule",
      evaluatedAt: new Date().toISOString(),
      feedback: "규칙 기반 자동 평가 결과입니다.",
    }

    // 결과 저장
    this.evaluationResults.push(result)

    return result
  }

  /**
   * 단일 응답 평가 (하이브리드 방식)
   */
  public async evaluateWithHybrid(
    userMessage: string,
    botResponse: string,
    detectedIntent: string,
    promptVersionId: string,
    conversationId: string,
  ): Promise<EvaluationResult> {
    // AI 평가 수행
    const aiResult = await this.evaluateWithAI(
      userMessage,
      botResponse,
      detectedIntent,
      promptVersionId,
      conversationId,
    )

    // 규칙 기반 평가 수행
    const ruleResult = this.evaluateWithRules(userMessage, botResponse, detectedIntent, promptVersionId, conversationId)

    // 두 평가 결과 병합 (가중 평균)
    const aiWeight = 0.7 // AI 평가 가중치
    const ruleWeight = 0.3 // 규칙 기반 평가 가중치

    const metrics: QualityMetrics = {
      relevance: aiResult.metrics.relevance * aiWeight + ruleResult.metrics.relevance * ruleWeight,
      accuracy: aiResult.metrics.accuracy * aiWeight + ruleResult.metrics.accuracy * ruleWeight,
      completeness: aiResult.metrics.completeness * aiWeight + ruleResult.metrics.completeness * ruleWeight,
      clarity: aiResult.metrics.clarity * aiWeight + ruleResult.metrics.clarity * ruleWeight,
      helpfulness: aiResult.metrics.helpfulness * aiWeight + ruleResult.metrics.helpfulness * ruleWeight,
      conciseness: aiResult.metrics.conciseness * aiWeight + ruleResult.metrics.conciseness * ruleWeight,
      tone: aiResult.metrics.tone * ruleWeight + ruleResult.metrics.tone * ruleWeight,
      overallScore: aiResult.metrics.overallScore * aiWeight + ruleResult.metrics.overallScore * ruleWeight,
    }

    // 평가 결과 생성
    const result: EvaluationResult = {
      id: `eval_${Date.now()}`,
      promptVersionId,
      conversationId,
      userMessage,
      botResponse,
      detectedIntent,
      metrics,
      method: "hybrid",
      evaluatedAt: new Date().toISOString(),
      feedback: `하이브리드 평가 결과입니다. AI 평가: ${aiResult.feedback}`,
      examples: aiResult.examples,
    }

    // 결과 저장
    this.evaluationResults.push(result)

    return result
  }

  /**
   * 사람 평가 결과 추가
   */
  public addHumanEvaluation(
    userMessage: string,
    botResponse: string,
    detectedIntent: string,
    promptVersionId: string,
    conversationId: string,
    metrics: Omit<QualityMetrics, "overallScore">,
    evaluatedBy: string,
    feedback?: string,
  ): EvaluationResult {
    // 종합 점수 계산
    const overallScore = this.calculateOverallScore(metrics)

    // 평가 결과 생성
    const result: EvaluationResult = {
      id: `eval_${Date.now()}`,
      promptVersionId,
      conversationId,
      userMessage,
      botResponse,
      detectedIntent,
      metrics: {
        ...metrics,
        overallScore,
      },
      method: "human",
      evaluatedAt: new Date().toISOString(),
      evaluatedBy,
      feedback,
    }

    // 결과 저장
    this.evaluationResults.push(result)

    return result
  }

  /**
   * 평가 결과 가져오기
   */
  public getEvaluationResults(filters?: {
    promptVersionId?: string
    conversationId?: string
    method?: EvaluationMethod
    startDate?: Date
    endDate?: Date
  }): EvaluationResult[] {
    let results = this.evaluationResults

    if (filters) {
      if (filters.promptVersionId) {
        results = results.filter((r) => r.promptVersionId === filters.promptVersionId)
      }
      if (filters.conversationId) {
        results = results.filter((r) => r.conversationId === filters.conversationId)
      }
      if (filters.method) {
        results = results.filter((r) => r.method === filters.method)
      }
      if (filters.startDate) {
        results = results.filter((r) => new Date(r.evaluatedAt) >= filters.startDate)
      }
      if (filters.endDate) {
        results = results.filter((r) => new Date(r.evaluatedAt) <= filters.endDate)
      }
    }

    return results
  }

  /**
   * 평가 결과 요약 생성
   */
  public generateEvaluationSummary(promptVersionId: string): {
    promptVersionId: string
    totalEvaluations: number
    averageScores: QualityMetrics
    intentDistribution: Record<string, number>
    methodDistribution: Record<EvaluationMethod, number>
    timeRange: { start: Date; end: Date }
  } | null {
    const results = this.getEvaluationResults({ promptVersionId })

    if (results.length === 0) return null

    // 평균 점수 계산
    const averageScores: QualityMetrics = {
      relevance: 0,
      accuracy: 0,
      completeness: 0,
      clarity: 0,
      helpfulness: 0,
      conciseness: 0,
      tone: 0,
      overallScore: 0,
    }

    for (const result of results) {
      averageScores.relevance += result.metrics.relevance
      averageScores.accuracy += result.metrics.accuracy
      averageScores.completeness += result.metrics.completeness
      averageScores.clarity += result.metrics.clarity
      averageScores.helpfulness += result.metrics.helpfulness
      averageScores.conciseness += result.metrics.conciseness
      averageScores.tone += result.metrics.tone
      averageScores.overallScore += result.metrics.overallScore
    }

    for (const key of Object.keys(averageScores) as Array<keyof QualityMetrics>) {
      averageScores[key] /= results.length
    }

    // 인텐트 분포 계산
    const intentDistribution: Record<string, number> = {}
    for (const result of results) {
      intentDistribution[result.detectedIntent] = (intentDistribution[result.detectedIntent] || 0) + 1
    }

    // 평가 방법 분포 계산
    const methodDistribution: Record<EvaluationMethod, number> = {
      ai: 0,
      rule: 0,
      human: 0,
      hybrid: 0,
    }

    for (const result of results) {
      methodDistribution[result.method] += 1
    }

    // 시간 범위 계산
    const timestamps = results.map((r) => new Date(r.evaluatedAt).getTime())
    const start = new Date(Math.min(...timestamps))
    const end = new Date(Math.max(...timestamps))

    return {
      promptVersionId,
      totalEvaluations: results.length,
      averageScores,
      intentDistribution,
      methodDistribution,
      timeRange: { start, end },
    }
  }

  /**
   * 종합 점수 계산
   */
  private calculateOverallScore(metrics: QualityMetrics): number {
    let weightedSum = 0
    let totalWeight = 0

    for (const [metric, weight] of Object.entries(this.config.metrics)) {
      if (metric === "overallScore") continue

      const metricKey = metric as keyof Omit<QualityMetrics, "overallScore">
      weightedSum += metrics[metricKey] * weight.weight
      totalWeight += weight.weight
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0
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
}

// 품질 평가 서비스 인스턴스 내보내기
export const qualityEvaluationService = QualityEvaluationService.getInstance()
