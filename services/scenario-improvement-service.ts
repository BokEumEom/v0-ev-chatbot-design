import type { ChatScenario } from "@/data/chatbot-scenarios"
import type {
  ScenarioEvaluationResult,
  ScenarioImprovementSuggestion,
  ScenarioImprovementResult,
  ScenarioImprovementJob,
  ScenarioImprovementSettings,
  ScenarioImprovementStats,
} from "@/types/scenario-evaluation"
import { scenarioEvaluationService } from "./scenario-evaluation-service"
import { v4 as uuidv4 } from "uuid"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export class ScenarioImprovementService {
  private static instance: ScenarioImprovementService
  private improvementResults: ScenarioImprovementResult[] = []
  private improvementJobs: Map<string, ScenarioImprovementJob> = new Map()
  private defaultSettings: ScenarioImprovementSettings

  private constructor() {
    // 기본 개선 설정 초기화
    this.defaultSettings = {
      improvementMethod: "hybrid",
      aiModel: "gemini-1.5-pro",
      suggestionTypes: ["add", "modify", "remove", "replace", "reorder"],
      minConfidence: 0.6,
      minImpact: "medium",
      maxChangesPerScenario: 5,
      preserveOriginalStructure: true,
    }
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): ScenarioImprovementService {
    if (!ScenarioImprovementService.instance) {
      ScenarioImprovementService.instance = new ScenarioImprovementService()
    }
    return ScenarioImprovementService.instance
  }

  /**
   * 시나리오 개선 작업 생성
   */
  public createImprovementJob(
    evaluationResultIds: string[],
    settings: Partial<ScenarioImprovementSettings> = {},
  ): ScenarioImprovementJob {
    const id = `imp_job_${Date.now()}_${uuidv4().substring(0, 8)}`
    const mergedSettings = { ...this.defaultSettings, ...settings }

    const job: ScenarioImprovementJob = {
      id,
      status: "pending",
      evaluationResultIds,
      improvementMethod: mergedSettings.improvementMethod,
      settings: mergedSettings,
      progress: 0,
      createdAt: new Date().toISOString(),
    }

    this.improvementJobs.set(id, job)
    return job
  }

  /**
   * 시나리오 개선 작업 상태 업데이트
   */
  public updateJobStatus(
    jobId: string,
    updates: Partial<
      Pick<ScenarioImprovementJob, "status" | "progress" | "startedAt" | "completedAt" | "results" | "error">
    >,
  ): ScenarioImprovementJob | null {
    const job = this.improvementJobs.get(jobId)
    if (!job) return null

    const updatedJob = { ...job, ...updates }
    this.improvementJobs.set(jobId, updatedJob)
    return updatedJob
  }

  /**
   * 시나리오 개선 작업 가져오기
   */
  public getJob(jobId: string): ScenarioImprovementJob | null {
    return this.improvementJobs.get(jobId) || null
  }

  /**
   * 시나리오 개선 작업 목록 가져오기
   */
  public getJobs(): ScenarioImprovementJob[] {
    return Array.from(this.improvementJobs.values())
  }

  /**
   * 규칙 기반 시나리오 개선
   */
  public improveWithRules(
    scenario: ChatScenario,
    evaluationResult: ScenarioEvaluationResult,
    settings: Partial<ScenarioImprovementSettings> = {},
  ): ScenarioImprovementResult {
    const mergedSettings = { ...this.defaultSettings, ...settings }

    // 적용할 제안 필터링
    const suggestionsToApply = this.filterSuggestionsToApply(evaluationResult.improvementSuggestions, mergedSettings)

    // 개선된 시나리오 생성
    const improvedScenario = this.applyImprovementSuggestions(
      scenario,
      suggestionsToApply,
      mergedSettings.preserveOriginalStructure,
    )

    // 개선 요약 생성
    const improvementSummary = this.generateImprovementSummary(scenario, improvedScenario, suggestionsToApply)

    // 개선 결과 생성
    const result: ScenarioImprovementResult = {
      id: `imp_${Date.now()}_${uuidv4().substring(0, 8)}`,
      originalScenarioId: scenario.id,
      improvedScenario,
      appliedSuggestions: suggestionsToApply.map((s) => s.id),
      improvementSummary,
      improvedAt: new Date().toISOString(),
      improvementMethod: "rule",
    }

    // 결과 저장
    this.improvementResults.push(result)

    return result
  }

  /**
   * AI 기반 시나리오 개선
   */
  public async improveWithAI(
    scenario: ChatScenario,
    evaluationResult: ScenarioEvaluationResult,
    settings: Partial<ScenarioImprovementSettings> = {},
  ): Promise<ScenarioImprovementResult> {
    try {
      const mergedSettings = { ...this.defaultSettings, ...settings }

      // 적용할 제안 필터링
      const suggestionsToApply = this.filterSuggestionsToApply(evaluationResult.improvementSuggestions, mergedSettings)

      // AI 개선 프롬프트 생성
      const prompt = this.createImprovementPrompt(scenario, evaluationResult, suggestionsToApply)

      // Gemini API 호출
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.")
      }

      const { text } = await generateText({
        model: google("gemini-pro"),
        prompt: prompt,
        temperature: 0.5,
      })

      // JSON 응답 파싱
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/)
      let improvedScenarioData

      if (jsonMatch && jsonMatch[1]) {
        improvedScenarioData = JSON.parse(jsonMatch[1])
      } else {
        try {
          improvedScenarioData = JSON.parse(text)
        } catch (e) {
          throw new Error("AI 개선 결과를 파싱할 수 없습니다.")
        }
      }

      // 개선된 시나리오 생성
      const improvedScenario: ChatScenario = {
        ...improvedScenarioData,
        id: `${scenario.id}_improved_${Date.now().toString(36)}`,
      }

      // 개선 요약 생성
      const improvementSummary =
        improvedScenarioData.improvementSummary ||
        this.generateImprovementSummary(scenario, improvedScenario, suggestionsToApply)

      // 개선 결과 생성
      const result: ScenarioImprovementResult = {
        id: `imp_${Date.now()}_${uuidv4().substring(0, 8)}`,
        originalScenarioId: scenario.id,
        improvedScenario,
        appliedSuggestions: suggestionsToApply.map((s) => s.id),
        improvementSummary,
        improvedAt: new Date().toISOString(),
        improvementMethod: "ai",
      }

      // 결과 저장
      this.improvementResults.push(result)

      return result
    } catch (error) {
      console.error("AI 개선 오류:", error)

      // 오류 발생 시 규칙 기반 개선으로 대체
      const ruleBasedResult = this.improveWithRules(scenario, evaluationResult, settings)
      return {
        ...ruleBasedResult,
        improvementSummary: `AI 개선 중 오류 발생: ${error instanceof Error ? error.message : String(error)}. 규칙 기반 개선으로 대체됨.\n\n${ruleBasedResult.improvementSummary}`,
      }
    }
  }

  /**
   * 하이브리드 시나리오 개선 (AI + 규칙)
   */
  public async improveWithHybrid(
    scenario: ChatScenario,
    evaluationResult: ScenarioEvaluationResult,
    settings: Partial<ScenarioImprovementSettings> = {},
  ): Promise<ScenarioImprovementResult> {
    // 규칙 기반으로 적용할 제안 필터링
    const mergedSettings = { ...this.defaultSettings, ...settings }
    const suggestionsToApply = this.filterSuggestionsToApply(evaluationResult.improvementSuggestions, mergedSettings)

    // 규칙 기반으로 기본 개선 적용
    const baseImprovedScenario = this.applyImprovementSuggestions(scenario, suggestionsToApply, true)

    try {
      // AI를 사용하여 추가 개선
      const prompt = this.createHybridImprovementPrompt(
        scenario,
        baseImprovedScenario,
        evaluationResult,
        suggestionsToApply,
      )

      // Gemini API 호출
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.")
      }

      const { text } = await generateText({
        model: google("gemini-pro"),
        prompt: prompt,
        temperature: 0.5,
      })

      // JSON 응답 파싱
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/)
      let finalImprovedScenarioData

      if (jsonMatch && jsonMatch[1]) {
        finalImprovedScenarioData = JSON.parse(jsonMatch[1])
      } else {
        try {
          finalImprovedScenarioData = JSON.parse(text)
        } catch (e) {
          throw new Error("AI 개선 결과를 파싱할 수 없습니다.")
        }
      }

      // 최종 개선된 시나리오 생성
      const finalImprovedScenario: ChatScenario = {
        ...finalImprovedScenarioData,
        id: `${scenario.id}_improved_${Date.now().toString(36)}`,
      }

      // 개선 요약 생성
      const improvementSummary =
        finalImprovedScenarioData.improvementSummary ||
        this.generateImprovementSummary(scenario, finalImprovedScenario, suggestionsToApply)

      // 개선 결과 생성
      const result: ScenarioImprovementResult = {
        id: `imp_${Date.now()}_${uuidv4().substring(0, 8)}`,
        originalScenarioId: scenario.id,
        improvedScenario: finalImprovedScenario,
        appliedSuggestions: suggestionsToApply.map((s) => s.id),
        improvementSummary,
        improvedAt: new Date().toISOString(),
        improvementMethod: "hybrid",
      }

      // 결과 저장
      this.improvementResults.push(result)

      return result
    } catch (error) {
      console.error("하이브리드 개선 오류:", error)

      // 오류 발생 시 규칙 기반 개선 결과 반환
      const improvementSummary = this.generateImprovementSummary(scenario, baseImprovedScenario, suggestionsToApply)

      const result: ScenarioImprovementResult = {
        id: `imp_${Date.now()}_${uuidv4().substring(0, 8)}`,
        originalScenarioId: scenario.id,
        improvedScenario: baseImprovedScenario,
        appliedSuggestions: suggestionsToApply.map((s) => s.id),
        improvementSummary: `하이브리드 개선 중 오류 발생: ${error instanceof Error ? error.message : String(error)}. 규칙 기반 개선 결과만 반환됨.\n\n${improvementSummary}`,
        improvedAt: new Date().toISOString(),
        improvementMethod: "hybrid",
      }

      // 결과 저장
      this.improvementResults.push(result)

      return result
    }
  }

  /**
   * 시나리오 개선 (방법에 따라 적절한 개선 함수 호출)
   */
  public async improveScenario(
    scenario: ChatScenario,
    evaluationResult: ScenarioEvaluationResult,
    method: "ai" | "rule" | "hybrid" = "hybrid",
    settings: Partial<ScenarioImprovementSettings> = {},
  ): Promise<ScenarioImprovementResult> {
    switch (method) {
      case "ai":
        return this.improveWithAI(scenario, evaluationResult, settings)
      case "rule":
        return this.improveWithRules(scenario, evaluationResult, settings)
      case "hybrid":
      default:
        return this.improveWithHybrid(scenario, evaluationResult, settings)
    }
  }

  /**
   * 평가 작업 실행
   */
  public async runImprovementJob(jobId: string): Promise<ScenarioImprovementJob | null> {
    const job = this.improvementJobs.get(jobId)
    if (!job || job.status !== "pending") return null

    try {
      // 작업 상태 업데이트
      this.updateJobStatus(jobId, {
        status: "in_progress",
        startedAt: new Date().toISOString(),
        progress: 0,
      })

      // 평가 결과 목록 가져오기
      const evaluationResults: ScenarioEvaluationResult[] = []
      for (const resultId of job.evaluationResultIds) {
        const result = scenarioEvaluationService.getEvaluationResult(resultId)
        if (result) {
          evaluationResults.push(result)
        }
      }

      // 결과 배열 초기화
      const results: ScenarioImprovementResult[] = []

      // 각 시나리오 개선
      for (let i = 0; i < evaluationResults.length; i++) {
        const evaluationResult = evaluationResults[i]

        // 시나리오 가져오기 (실제 구현에서는 시나리오 서비스에서 가져옴)
        // 여기서는 예시로 빈 객체 사용
        const scenario: ChatScenario = {} as ChatScenario // scenarioService.getScenarioById(evaluationResult.scenarioId)

        // 시나리오 개선
        const result = await this.improveScenario(scenario, evaluationResult, job.improvementMethod, job.settings)
        results.push(result)

        // 진행 상황 업데이트
        const progress = Math.round(((i + 1) / evaluationResults.length) * 100)
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
      console.error("개선 작업 실행 오류:", error)

      // 오류 상태 업데이트
      return this.updateJobStatus(jobId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /**
   * 개선 결과 가져오기
   */
  public getImprovementResult(resultId: string): ScenarioImprovementResult | null {
    return this.improvementResults.find((r) => r.id === resultId) || null
  }

  /**
   * 시나리오별 개선 결과 가져오기
   */
  public getImprovementResultsByScenarioId(scenarioId: string): ScenarioImprovementResult[] {
    return this.improvementResults.filter((r) => r.originalScenarioId === scenarioId)
  }

  /**
   * 모든 개선 결과 가져오기
   */
  public getAllImprovementResults(): ScenarioImprovementResult[] {
    return [...this.improvementResults]
  }

  /**
   * 개선 통계 생성
   */
  public generateImprovementStats(): ScenarioImprovementStats {
    const results = this.improvementResults

    if (results.length === 0) {
      return {
        totalImproved: 0,
        averageMetricImprovement: {},
        suggestionTypeDistribution: {
          add: 0,
          modify: 0,
          remove: 0,
          replace: 0,
          reorder: 0,
        },
        targetDistribution: {
          conversation: 0,
          title: 0,
          description: 0,
          keyFeatures: 0,
          entire: 0,
        },
        averageAppliedSuggestions: 0,
        improvementMethods: {
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

    // 지표 개선 합계 초기화
    const metricImprovementSum: Partial<Record<keyof ScenarioImprovementStats["averageMetricImprovement"], number>> = {}
    const metricImprovementCount: Partial<Record<keyof ScenarioImprovementStats["averageMetricImprovement"], number>> =
      {}

    // 제안 유형 분포 초기화
    const suggestionTypeDistribution: Record<ScenarioImprovementSuggestion["type"], number> = {
      add: 0,
      modify: 0,
      remove: 0,
      replace: 0,
      reorder: 0,
    }

    // 대상 분포 초기화
    const targetDistribution: Record<ScenarioImprovementSuggestion["target"], number> = {
      conversation: 0,
      title: 0,
      description: 0,
      keyFeatures: 0,
      entire: 0,
    }

    // 개선 방법 분포 초기화
    const improvementMethods: Record<ScenarioImprovementResult["improvementMethod"], number> = {
      ai: 0,
      rule: 0,
      hybrid: 0,
      human: 0,
    }

    // 적용된 제안 수 합계
    let totalAppliedSuggestions = 0

    // 시간 범위
    let minTime = new Date(results[0].improvedAt).getTime()
    let maxTime = minTime

    // 데이터 집계
    for (const result of results) {
      // 개선 방법 카운트
      improvementMethods[result.improvementMethod]++

      // 적용된 제안 수 합계
      totalAppliedSuggestions += result.appliedSuggestions.length

      // 지표 개선 계산 (before/after 지표가 있는 경우)
      if (result.beforeMetrics && result.afterMetrics) {
        for (const key of Object.keys(result.afterMetrics) as Array<keyof typeof result.afterMetrics>) {
          const improvement = result.afterMetrics[key] - result.beforeMetrics[key]

          if (!metricImprovementSum[key]) {
            metricImprovementSum[key] = 0
            metricImprovementCount[key] = 0
          }

          metricImprovementSum[key]! += improvement
          metricImprovementCount[key]! += 1
        }
      }

      // 제안 유형 및 대상 분포 계산
      // (실제 구현에서는 평가 결과에서 적용된 제안 정보를 가져와야 함)
      // 여기서는 예시로 임의의 값 사용
      suggestionTypeDistribution.modify += 1
      targetDistribution.conversation += 1

      // 시간 범위 업데이트
      const time = new Date(result.improvedAt).getTime()
      if (time < minTime) minTime = time
      if (time > maxTime) maxTime = time
    }

    // 평균 지표 개선 계산
    const averageMetricImprovement: Partial<
      Record<keyof ScenarioImprovementStats["averageMetricImprovement"], number>
    > = {}
    for (const key of Object.keys(metricImprovementSum) as Array<keyof typeof metricImprovementSum>) {
      if (metricImprovementCount[key]! > 0) {
        averageMetricImprovement[key] = metricImprovementSum[key]! / metricImprovementCount[key]!
      }
    }

    return {
      totalImproved: results.length,
      averageMetricImprovement,
      suggestionTypeDistribution,
      targetDistribution,
      averageAppliedSuggestions: results.length > 0 ? totalAppliedSuggestions / results.length : 0,
      improvementMethods,
      timeRange: {
        start: new Date(minTime).toISOString(),
        end: new Date(maxTime).toISOString(),
      },
    }
  }

  /**
   * 적용할 제안 필터링
   */
  private filterSuggestionsToApply(
    suggestions: ScenarioImprovementSuggestion[],
    settings: ScenarioImprovementSettings,
  ): ScenarioImprovementSuggestion[] {
    // 설정에 따라 제안 필터링
    let filteredSuggestions = suggestions.filter((suggestion) => {
      // 제안 유형 필터링
      if (settings.suggestionTypes && !settings.suggestionTypes.includes(suggestion.type)) {
        return false
      }

      // 최소 신뢰도 필터링
      if (settings.minConfidence && suggestion.confidence < settings.minConfidence) {
        return false
      }

      // 최소 영향도 필터링
      if (settings.minImpact) {
        const impactValues = { high: 3, medium: 2, low: 1 }
        if (impactValues[suggestion.impact] < impactValues[settings.minImpact]) {
          return false
        }
      }

      return true
    })

    // 신뢰도 및 영향도에 따라 정렬
    filteredSuggestions.sort((a, b) => {
      const impactValues = { high: 3, medium: 2, low: 1 }
      const aValue = a.confidence * impactValues[a.impact]
      const bValue = b.confidence * impactValues[b.impact]
      return bValue - aValue
    })

    // 최대 변경 수 제한
    if (settings.maxChangesPerScenario && filteredSuggestions.length > settings.maxChangesPerScenario) {
      filteredSuggestions = filteredSuggestions.slice(0, settings.maxChangesPerScenario)
    }

    return filteredSuggestions
  }

  /**
   * 개선 제안 적용
   */
  private applyImprovementSuggestions(
    scenario: ChatScenario,
    suggestions: ScenarioImprovementSuggestion[],
    preserveOriginalStructure = true,
  ): ChatScenario {
    // 시나리오 복사
    const improvedScenario: ChatScenario = JSON.parse(JSON.stringify(scenario))
    improvedScenario.id = `${scenario.id}_improved_${Date.now().toString(36)}`

    // 각 제안 적용
    for (const suggestion of suggestions) {
      switch (suggestion.type) {
        case "add":
          this.applySuggestionAdd(improvedScenario, suggestion)
          break
        case "modify":
          this.applySuggestionModify(improvedScenario, suggestion)
          break
        case "remove":
          this.applySuggestionRemove(improvedScenario, suggestion)
          break
        case "replace":
          this.applySuggestionReplace(improvedScenario, suggestion)
          break
        case "reorder":
          this.applySuggestionReorder(improvedScenario, suggestion)
          break
      }
    }

    return improvedScenario
  }

  /**
   * 추가 제안 적용
   */
  private applySuggestionAdd(scenario: ChatScenario, suggestion: ScenarioImprovementSuggestion): void {
    switch (suggestion.target) {
      case "conversation":
        // 대화 추가 (예시 구현)
        if (suggestion.exampleImplementation) {
          const newConversation = {
            user: "새로운 사용자 질문",
            bot: "새로운 챗봇 응답",
          }

          if (suggestion.targetIndex !== undefined && suggestion.targetIndex <= scenario.conversations.length) {
            scenario.conversations.splice(suggestion.targetIndex, 0, newConversation)
          } else {
            scenario.conversations.push(newConversation)
          }
        }
        break

      case "keyFeatures":
        // 핵심 기능 추가
        if (suggestion.exampleImplementation) {
          if (!scenario.keyFeatures) {
            scenario.keyFeatures = []
          }
          scenario.keyFeatures.push(suggestion.exampleImplementation)
        }
        break

      // 다른 대상에 대한 추가 구현
      default:
        break
    }
  }

  /**
   * 수정 제안 적용
   */
  private applySuggestionModify(scenario: ChatScenario, suggestion: ScenarioImprovementSuggestion): void {
    switch (suggestion.target) {
      case "conversation":
        // 대화 수정 (예시 구현)
        if (
          suggestion.targetIndex !== undefined &&
          suggestion.targetIndex < scenario.conversations.length &&
          suggestion.exampleImplementation
        ) {
          // 실제 구현에서는 더 정교한 수정 로직 필요
          scenario.conversations[suggestion.targetIndex] = {
            ...scenario.conversations[suggestion.targetIndex],
            // 예시 구현에서 사용자/봇 메시지 파싱 (실제로는 더 정교한 방식 필요)
            user: suggestion.exampleImplementation.includes("사용자:")
              ? suggestion.exampleImplementation.split("사용자:")[1].split("봇:")[0].trim()
              : scenario.conversations[suggestion.targetIndex].user,
            bot: suggestion.exampleImplementation.includes("봇:")
              ? suggestion.exampleImplementation.split("봇:")[1].trim()
              : scenario.conversations[suggestion.targetIndex].bot,
          }
        }
        break

      case "title":
        // 제목 수정
        if (suggestion.exampleImplementation) {
          scenario.title = suggestion.exampleImplementation
        }
        break

      case "description":
        // 설명 수정
        if (suggestion.exampleImplementation) {
          scenario.description = suggestion.exampleImplementation
        }
        break

      // 다른 대상에 대한 수정 구현
      default:
        break
    }
  }

  /**
   * 제거 제안 적용
   */
  private applySuggestionRemove(scenario: ChatScenario, suggestion: ScenarioImprovementSuggestion): void {
    switch (suggestion.target) {
      case "conversation":
        // 대화 제거
        if (suggestion.targetIndex !== undefined && suggestion.targetIndex < scenario.conversations.length) {
          scenario.conversations.splice(suggestion.targetIndex, 1)
        }
        break

      case "keyFeatures":
        // 핵심 기능 제거
        if (
          suggestion.targetIndex !== undefined &&
          scenario.keyFeatures &&
          suggestion.targetIndex < scenario.keyFeatures.length
        ) {
          scenario.keyFeatures.splice(suggestion.targetIndex, 1)
        }
        break

      // 다른 대상에 대한 제거 구현
      default:
        break
    }
  }

  /**
   * 대체 제안 적용
   */
  private applySuggestionReplace(scenario: ChatScenario, suggestion: ScenarioImprovementSuggestion): void {
    // 제거 후 추가 방식으로 구현
    this.applySuggestionRemove(scenario, suggestion)
    this.applySuggestionAdd(scenario, suggestion)
  }

  /**
   * 순서 변경 제안 적용
   */
  private applySuggestionReorder(scenario: ChatScenario, suggestion: ScenarioImprovementSuggestion): void {
    switch (suggestion.target) {
      case "conversation":
        // 대화 순서 변경 (예시 구현)
        if (
          suggestion.targetIndex !== undefined &&
          suggestion.exampleImplementation &&
          suggestion.exampleImplementation.includes("->")
        ) {
          const [fromIndex, toIndex] = suggestion.exampleImplementation
            .split("->")
            .map((s) => Number.parseInt(s.trim()))

          if (
            !isNaN(fromIndex) &&
            !isNaN(toIndex) &&
            fromIndex >= 0 &&
            fromIndex < scenario.conversations.length &&
            toIndex >= 0 &&
            toIndex < scenario.conversations.length
          ) {
            const conversation = scenario.conversations[fromIndex]
            scenario.conversations.splice(fromIndex, 1)
            scenario.conversations.splice(toIndex, 0, conversation)
          }
        }
        break

      // 다른 대상에 대한 순서 변경 구현
      default:
        break
    }
  }

  /**
   * 개선 요약 생성
   */
  private generateImprovementSummary(
    originalScenario: ChatScenario,
    improvedScenario: ChatScenario,
    appliedSuggestions: ScenarioImprovementSuggestion[],
  ): string {
    let summary = "시나리오 개선 요약:\n\n"

    // 적용된 제안 요약
    summary += `적용된 제안 수: ${appliedSuggestions.length}개\n\n`

    if (appliedSuggestions.length > 0) {
      summary += "적용된 제안:\n"
      appliedSuggestions.forEach((suggestion, index) => {
        summary += `${index + 1}. [${suggestion.type}] ${suggestion.target}${suggestion.targetIndex !== undefined ? ` (인덱스: ${suggestion.targetIndex})` : ""}: ${suggestion.suggestion}\n`
      })
      summary += "\n"
    }

    // 변경 사항 요약
    const changes: string[] = []

    // 제목 변경 확인
    if (originalScenario.title !== improvedScenario.title) {
      changes.push(`제목 변경: "${originalScenario.title}" -> "${improvedScenario.title}"`)
    }

    // 설명 변경 확인
    if (originalScenario.description !== improvedScenario.description) {
      changes.push(`설명 변경: "${originalScenario.description}" -> "${improvedScenario.description}"`)
    }

    // 대화 수 변경 확인
    if (originalScenario.conversations.length !== improvedScenario.conversations.length) {
      changes.push(
        `대화 수 변경: ${originalScenario.conversations.length}개 -> ${improvedScenario.conversations.length}개`,
      )
    }

    // 핵심 기능 수 변경 확인
    const originalFeatureCount = originalScenario.keyFeatures?.length || 0
    const improvedFeatureCount = improvedScenario.keyFeatures?.length || 0

    if (originalFeatureCount !== improvedFeatureCount) {
      changes.push(`핵심 기능 수 변경: ${originalFeatureCount}개 -> ${improvedFeatureCount}개`)
    }

    if (changes.length > 0) {
      summary += "주요 변경 사항:\n"
      changes.forEach((change, index) => {
        summary += `${index + 1}. ${change}\n`
      })
    } else {
      summary += "주요 변경 사항이 감지되지 않았습니다."
    }

    return summary
  }

  /**
   * AI 개선 프롬프트 생성
   */
  private createImprovementPrompt(
    scenario: ChatScenario,
    evaluationResult: ScenarioEvaluationResult,
    suggestionsToApply: ScenarioImprovementSuggestion[],
  ): string {
    return `
전기차 충전 챗봇을 위한 대화 시나리오를 개선해주세요. 다음 시나리오와 평가 결과를 분석하고, 제안된 개선 사항을 적용하여 더 나은 시나리오를 생성해주세요.

## 원본 시나리오
\`\`\`json
${JSON.stringify(scenario, null, 2)}
\`\`\`

## 평가 결과
평가 점수:
${Object.entries(evaluationResult.metrics)
  .map(([key, value]) => `- ${key}: ${value.toFixed(2)}`)
  .join("\n")}

강점:
${evaluationResult.strengths.map((s) => `- ${s}`).join("\n")}

약점:
${evaluationResult.weaknesses.map((w) => `- ${w}`).join("\n")}

## 적용할 개선 제안
${suggestionsToApply
  .map(
    (suggestion, index) => `
${index + 1}. 유형: ${suggestion.type}, 대상: ${suggestion.target}${suggestion.targetIndex !== undefined ? `, 인덱스: ${suggestion.targetIndex}` : ""}
   제안: ${suggestion.suggestion}
   이유: ${suggestion.reasoning}
   ${suggestion.exampleImplementation ? `구현 예시: ${suggestion.exampleImplementation}` : ""}
`,
  )
  .join("\n")}

## 요청 사항
1. 위 개선 제안을 적용하여 시나리오를 개선해주세요.
2. 시나리오의 기본 구조(ID, 카테고리 등)는 유지하되, 내용을 개선해주세요.
3. 대화의 자연스러움, 일관성, 사용자 중심성을 향상시켜주세요.
4. 전기차 충전 관련 기술 정보의 정확성을 확인하고 개선해주세요.
5. 개선된 시나리오와 함께 개선 요약을 제공해주세요.

## 출력 형식
다음 JSON 형식으로 개선된 시나리오를 제공해주세요:

\`\`\`json
{
  "id": "${scenario.id}",
  "category": "카테고리",
  "title": "개선된 제목",
  "description": "개선된 설명",
  "conversations": [
    {
      "user": "사용자 메시지",
      "bot": "챗봇 응답",
      "intent": "인텐트명",
      "entities": {
        "엔티티키": "엔티티값"
      },
      "notes": "처리 특징 설명"
    },
    ...
  ],
  "keyFeatures": [
    "핵심 기능 1",
    "핵심 기능 2",
    ...
  ],
  "improvementSummary": "개선 요약 (적용된 변경 사항 설명)"
}
\`\`\`

JSON 형식만 반환하고 다른 설명은 포함하지 마세요.
`
  }

  /**
   * 하이브리드 개선 프롬프트 생성
   */
  private createHybridImprovementPrompt(
    originalScenario: ChatScenario,
    baseImprovedScenario: ChatScenario,
    evaluationResult: ScenarioEvaluationResult,
    appliedSuggestions: ScenarioImprovementSuggestion[],
  ): string {
    return `
전기차 충전 챗봇을 위한 대화 시나리오를 추가로 개선해주세요. 기본적인 개선이 이미 적용된 시나리오를 더 자연스럽고 효과적으로 만들어주세요.

## 원본 시나리오
\`\`\`json
${JSON.stringify(originalScenario, null, 2)}
\`\`\`

## 기본 개선된 시나리오
\`\`\`json
${JSON.stringify(baseImprovedScenario, null, 2)}
\`\`\`

## 평가 결과
평가 점수:
${Object.entries(evaluationResult.metrics)
  .map(([key, value]) => `- ${key}: ${value.toFixed(2)}`)
  .join("\n")}

강점:
${evaluationResult.strengths.map((s) => `- ${s}`).join("\n")}

약점:
${evaluationResult.weaknesses.map((w) => `- ${w}`).join("\n")}

## 이미 적용된 개선 제안
${appliedSuggestions
  .map(
    (suggestion, index) => `
${index + 1}. 유형: ${suggestion.type}, 대상: ${suggestion.target}${suggestion.targetIndex !== undefined ? `, 인덱스: ${suggestion.targetIndex}` : ""}
   제안: ${suggestion.suggestion}
   이유: ${suggestion.reasoning}
`,
  )
  .join("\n")}

## 요청 사항
1. 기본 개선된 시나리오를 기반으로 추가 개선을 진행해주세요.
2. 대화의 자연스러움, 일관성, 사용자 중심성을 더욱 향상시켜주세요.
3. 전기차 충전 관련 기술 정보의 정확성과 구체성을 높여주세요.
4. 사용자 질문과 챗봇 응답 간의 연결성을 강화해주세요.
5. 시나리오의 전반적인 품질을 높이되, 기본 구조와 주제는 유지해주세요.
6. 개선된 시나리오와 함께 개선 요약을 제공해주세요.

## 출력 형식
다음 JSON 형식으로 최종 개선된 시나리오를 제공해주세요:

\`\`\`json
{
  "id": "${originalScenario.id}",
  "category": "카테고리",
  "title": "개선된 제목",
  "description": "개선된 설명",
  "conversations": [
    {
      "user": "사용자 메시지",
      "bot": "챗봇 응답",
      "intent": "인텐트명",
      "entities": {
        "엔티티키": "엔티티값"
      },
      "notes": "처리 특징 설명"
    },
    ...
  ],
  "keyFeatures": [
    "핵심 기능 1",
    "핵심 기능 2",
    ...
  ],
  "improvementSummary": "개선 요약 (적용된 변경 사항 설명)"
}
\`\`\`

JSON 형식만 반환하고 다른 설명은 포함하지 마세요.
`
  }
}

export const scenarioImprovementService = ScenarioImprovementService.getInstance()
