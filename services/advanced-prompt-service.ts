import { generateAdvancedSystemPrompt, createAdvancedUserPrompt } from "@/utils/advanced-prompt-utils"
import { getSystemPromptConfig } from "@/config/system-prompt-config"
import type { ConversationState } from "@/services/conversation-continuity-service"

/**
 * 고급 프롬프트 서비스
 * 대화 지속성을 강화한 프롬프트 관리
 */
export class AdvancedPromptService {
  private static instance: AdvancedPromptService
  private systemPrompt: string

  private constructor() {
    // 환경에 맞는 시스템 프롬프트 설정 로드
    const config = getSystemPromptConfig()
    this.systemPrompt = generateAdvancedSystemPrompt(config)
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): AdvancedPromptService {
    if (!AdvancedPromptService.instance) {
      AdvancedPromptService.instance = new AdvancedPromptService()
    }
    return AdvancedPromptService.instance
  }

  /**
   * 고급 시스템 프롬프트 반환
   */
  public getAdvancedSystemPrompt(): string {
    return this.systemPrompt
  }

  /**
   * 고급 사용자 프롬프트 생성
   */
  public createAdvancedUserPrompt(
    intent: string,
    userMessage: string,
    userContext: any,
    conversationState: ConversationState,
    conversationHistory: Array<{ role: string; content: string }>,
  ): string {
    return createAdvancedUserPrompt(intent, userMessage, userContext, conversationState, conversationHistory)
  }

  /**
   * 완전한 고급 프롬프트 생성
   * 시스템 프롬프트와 사용자 프롬프트를 결합
   */
  public createFullAdvancedPrompt(
    intent: string,
    userMessage: string,
    userContext: any,
    conversationState: ConversationState,
    conversationHistory: Array<{ role: string; content: string }>,
  ): {
    systemPrompt: string
    userPrompt: string
  } {
    return {
      systemPrompt: this.systemPrompt,
      userPrompt: this.createAdvancedUserPrompt(
        intent,
        userMessage,
        userContext,
        conversationState,
        conversationHistory,
      ),
    }
  }
}

// 고급 프롬프트 서비스 인스턴스 내보내기
export const advancedPromptService = AdvancedPromptService.getInstance()
