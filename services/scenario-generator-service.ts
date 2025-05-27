import type { ChatScenario } from "@/data/chatbot-scenarios"
import type { ScenarioGenerationSettings } from "@/types/scenario-generator"
import { v4 as uuidv4 } from "uuid"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export class ScenarioGeneratorService {
  private static instance: ScenarioGeneratorService

  private constructor() {}

  public static getInstance(): ScenarioGeneratorService {
    if (!ScenarioGeneratorService.instance) {
      ScenarioGeneratorService.instance = new ScenarioGeneratorService()
    }
    return ScenarioGeneratorService.instance
  }

  /**
   * Gemini API를 사용하여 시나리오 생성
   */
  public async generateScenario(
    settings: ScenarioGenerationSettings,
    existingScenarios: string[] = [],
  ): Promise<ChatScenario> {
    try {
      const prompt = this.createGenerationPrompt(settings, existingScenarios)
      const response = await this.callGeminiAPI(prompt)
      const scenario = this.parseScenarioFromResponse(response)

      // 생성된 시나리오에 ID 추가
      scenario.id = `auto_${settings.category.toLowerCase().replace(/\s+/g, "_")}_${uuidv4().substring(0, 8)}`

      return scenario
    } catch (error) {
      console.error("시나리오 생성 오류:", error)
      throw new Error(`시나리오 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 시나리오 생성을 위한 프롬프트 생성
   */
  private createGenerationPrompt(settings: ScenarioGenerationSettings, existingScenarios: string[]): string {
    return `
전기차 충전 챗봇을 위한 대화 시나리오를 생성해주세요. 다음 요구사항에 맞게 생성해주세요:

## 시나리오 요구사항
- 카테고리: ${settings.category}
- 주제: ${settings.topic}
- 복잡도: ${this.getComplexityDescription(settings.complexity)}
- 사용자 유형: ${this.getUserTypeDescription(settings.userType)}
- 대화 턴 수: ${settings.conversationTurns}회 (사용자 질문과 챗봇 응답 쌍)
- 엔티티 포함 여부: ${settings.includeEntities ? "포함" : "미포함"}
- 처리 특징 설명 포함 여부: ${settings.includeNotes ? "포함" : "미포함"}
${settings.specificRequirements ? `- 특별 요구사항: ${settings.specificRequirements}` : ""}

## 기존 시나리오 ID 목록 (중복 방지)
${existingScenarios.join(", ")}

## 출력 형식
다음 JSON 형식으로 시나리오를 생성해주세요:

\`\`\`json
{
  "category": "카테고리명",
  "title": "시나리오 제목",
  "description": "시나리오 설명",
  "conversations": [
    {
      "user": "사용자 메시지",
      "bot": "챗봇 응답",
      "intent": "인텐트명",
      "entities": {
        "엔티티키": "엔티티값"
      },
      "notes": "이 응답에서 중요한 처리 특징 설명"
    },
    // 추가 대화...
  ],
  "keyFeatures": [
    "이 시나리오의 핵심 기능 1",
    "이 시나리오의 핵심 기능 2",
    // 추가 핵심 기능...
  ]
}
\`\`\`

다음 사항을 고려해주세요:
1. 전기차 충전과 관련된 현실적이고 구체적인 상황을 다루세요.
2. 사용자 질문은 간결하고 자연스러워야 합니다.
3. 챗봇 응답은 정보를 구조화하고 명확하게 제공해야 합니다.
4. 인텐트는 사용자 의도를 정확히 반영해야 합니다.
5. 엔티티는 질문에서 추출된 중요 정보를 포함해야 합니다.
6. 처리 특징은 해당 응답에서 챗봇이 어떤 중요한 처리를 했는지 설명해야 합니다.
7. 핵심 기능은 이 시나리오가 보여주는 챗봇의 주요 능력을 나열해야 합니다.
8. 대화는 자연스럽게 이어져야 하며, 후속 질문은 이전 대화 컨텍스트를 고려해야 합니다.

JSON 형식만 반환하고 다른 설명은 포함하지 마세요.
`
  }

  /**
   * 복잡도 설명 반환
   */
  private getComplexityDescription(complexity: string): string {
    switch (complexity) {
      case "simple":
        return "간단한 질문과 응답 (기본 정보 제공)"
      case "medium":
        return "중간 수준의 복잡성 (여러 정보 요소 포함, 약간의 컨텍스트 유지 필요)"
      case "complex":
        return "복잡한 상황 (다중 주제, 깊은 컨텍스트 유지, 복잡한 문제 해결)"
      default:
        return "중간 수준의 복잡성"
    }
  }

  /**
   * 사용자 유형 설명 반환
   */
  private getUserTypeDescription(userType: string): string {
    switch (userType) {
      case "beginner":
        return "초보자 (전기차/충전 경험 없음, 기본 용어 설명 필요)"
      case "intermediate":
        return "중급자 (기본적인 전기차/충전 경험 있음, 일부 전문 용어 이해)"
      case "expert":
        return "전문가 (풍부한 전기차/충전 경험, 기술적 세부사항 이해)"
      default:
        return "중급자"
    }
  }

  /**
   * Gemini API 호출
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: google("gemini-pro"),
        prompt: prompt,
        temperature: 0.7,
      })

      const generatedText = text

      // JSON 부분만 추출
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch && jsonMatch[1]) {
        return jsonMatch[1]
      }

      return generatedText
    } catch (error) {
      console.error("Gemini API 호출 오류:", error)
      throw error
    }
  }

  /**
   * API 응답에서 시나리오 파싱
   */
  private parseScenarioFromResponse(response: string): ChatScenario {
    try {
      // 응답이 이미 JSON 문자열인지 확인
      const trimmedResponse = response.trim()
      const scenario = JSON.parse(trimmedResponse)

      // 필수 필드 검증
      if (!scenario.category || !scenario.title || !scenario.description || !Array.isArray(scenario.conversations)) {
        throw new Error("생성된 시나리오에 필수 필드가 누락되었습니다.")
      }

      return scenario as ChatScenario
    } catch (error) {
      console.error("시나리오 파싱 오류:", error, "원본 응답:", response)
      throw new Error("생성된 응답을 시나리오로 파싱할 수 없습니다.")
    }
  }

  /**
   * 시나리오 유효성 검사
   */
  public validateScenario(scenario: ChatScenario): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!scenario.category) errors.push("카테고리가 누락되었습니다.")
    if (!scenario.title) errors.push("제목이 누락되었습니다.")
    if (!scenario.description) errors.push("설명이 누락되었습니다.")

    if (!Array.isArray(scenario.conversations) || scenario.conversations.length === 0) {
      errors.push("대화 내용이 누락되었습니다.")
    } else {
      scenario.conversations.forEach((conv, index) => {
        if (!conv.user) errors.push(`대화 ${index + 1}: 사용자 메시지가 누락되었습니다.`)
        if (!conv.bot) errors.push(`대화 ${index + 1}: 챗봇 응답이 누락되었습니다.`)
      })
    }

    if (!Array.isArray(scenario.keyFeatures) || scenario.keyFeatures.length === 0) {
      errors.push("핵심 기능이 누락되었습니다.")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

export const scenarioGeneratorService = ScenarioGeneratorService.getInstance()
