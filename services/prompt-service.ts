import { generateSystemPrompt } from "@/utils/prompt-utils"
import { getSystemPromptConfig } from "@/config/system-prompt-config"

/**
 * 프롬프트 서비스
 * 시스템 프롬프트 및 사용자 프롬프트 관리
 */
export class PromptService {
  private static instance: PromptService
  private systemPrompt: string

  private constructor() {
    // 환경에 맞는 시스템 프롬프트 설정 로드
    const config = getSystemPromptConfig()
    this.systemPrompt = generateSystemPrompt(config)
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService()
    }
    return PromptService.instance
  }

  /**
   * 시스템 프롬프트 반환
   */
  public getSystemPrompt(): string {
    return this.systemPrompt
  }

  /**
   * 인텐트별 특화 프롬프트 생성
   */
  public createIntentSpecificPrompt(intent: string, userMessage: string, userContext: any): string {
    // 충전기 번호 추출 (있는 경우)
    const chargerNumberMatch = userMessage.match(/(\d+)번/)
    const chargerNumber = chargerNumberMatch ? chargerNumberMatch[1] : ""

    // 인텐트별 특화된 프롬프트 생성
    switch (intent) {
      case "charger_issue":
        return `
사용자가 충전기 고장을 보고했습니다.
사용자 메시지: "${userMessage}"
사용자 컨텍스트: 
- 위치: ${userContext.location}
- 차량 모델: ${userContext.vehicleModel}
- 충전기 번호: ${chargerNumber || "명시되지 않음"}

다음 정보를 포함하여 응답해 주세요:
1. 문제에 대한 공감과 사과
2. 고장 신고가 접수되었음을 알림
3. 가까운 대체 충전소 2-3곳 추천 (위치, 거리, 충전 속도, 대기 상태 포함)
4. 지속적인 문제 발생 시 앱 내 고장 신고 기능 안내
`

      case "usage_guide":
        return `
사용자가 충전 방법에 대해 문의했습니다.
사용자 메시지: "${userMessage}"
사용자 컨텍스트: 
- 차량 모델: ${userContext.vehicleModel}

다음 정보를 포함하여 응답해 주세요:
1. 처음 이용하는 사용자를 위한 환영 메시지
2. 충전 시작부터 종료까지의 단계별 가이드 (번호 매기기)
   - 충전기 화면에서 시작하기
   - 커넥터 연결 방법
   - 결제 방법 (앱/카드)
   - 충전 종료 및 알림
3. 초보자 영상 링크 언급
4. 문제 발생 시 고객센터 연락 방법
`

      case "find_charger":
        return `
사용자가 가용한 충전소를 찾고 있습니다.
사용자 메시지: "${userMessage}"
사용자 컨텍스트: 
- 현재 위치: ${userContext.location}
- 차량 모델: ${userContext.vehicleModel}

다음 정보를 포함하여 응답해 주세요:
1. 현재 위치 기준 가까운 충전소 3곳 추천
   - 충전소 이름과 위치
   - 현재 위치로부터의 거리
   - 충전기 유형 및 속도 (예: 100kW 급속)
   - 현재 대기 상태 (예: 대기 없음, 1대 대기 중 등)
2. 실시간 정보는 앱에서 확인 가능함을 안내
3. 필요시 내비게이션 연동 방법 언급
`

      case "payment_issue":
        return `
사용자가 결제 관련 문의를 하고 있습니다.
사용자 메시지: "${userMessage}"
사용자 컨텍스트: 
- 결제 수단: ${userContext.paymentMethods?.join(", ") || "알 수 없음"}

다음 정보를 포함하여 응답해 주세요:
1. 결제 프로세스 설명 (언제, 어떻게 결제되는지)
2. 지원되는 결제 방법 (카드, 앱 등)
3. 일반적인 결제 문제 해결 방법
4. 결제 영수증 확인 방법
5. 지속적인 문제 발생 시 고객센터 연락 방법
`

      case "charging_history":
        return `
사용자가 충전 이력을 확인하고자 합니다.
사용자 메시지: "${userMessage}"
사용자 컨텍스트: 
- 최근 충전소: ${userContext.recentChargers?.join(", ") || "알 수 없음"}

다음 정보를 포함하여 응답해 주세요:
1. 충전 이력 확인 방법 (앱 내 경로)
2. 확인 가능한 정보 (날짜, 위치, 충전량, 비용 등)
3. 이력 다운로드 또는 공유 방법
4. 필터링 옵션 (기간별, 충전소별 등)
5. 충전 패턴 분석 기능 언급 (있는 경우)
`

      case "pricing_inquiry":
        return `
사용자가 충전 요금에 대해 문의했습니다.
사용자 메시지: "${userMessage}"
사용자 컨텍스트: 
- 회원 등급: ${userContext.membershipLevel || "일반"}

다음 정보를 포함하여 응답해 주세요:
1. 기본 충전 요금 안내 (급속/완속 구분)
2. 회원 등급별 할인 혜택 설명
3. 요금 결제 방법 안내
4. 영수증 발급 방법
5. 요금 관련 자주 묻는 질문 답변
`

      case "membership_inquiry":
        return `
사용자가 회원 정보에 대해 문의했습니다.
사용자 메시지: "${userMessage}"
사용자 컨텍스트: 
- 회원 등급: ${userContext.membershipLevel || "일반"}
- 가입일: ${userContext.joinDate || "알 수 없음"}

다음 정보를 포함하여 응답해 주세요:
1. 회원 가입/로그인 방법 안내
2. 회원 등급 및 혜택 설명
3. 계정 정보 변경 방법
4. 비밀번호 재설정 방법
5. 개인정보 보호 관련 안내
`

      default:
        return `
사용자가 일반적인 문의를 했습니다.
사용자 메시지: "${userMessage}"
사용자 컨텍스트: 
- 차량 모델: ${userContext.vehicleModel || "알 수 없음"}
- 위치: ${userContext.location || "알 수 없음"}

질문에 대한 도움이 되는 정보를 제공해 주세요.
`
    }
  }

  /**
   * 완전한 프롬프트 생성
   * 시스템 프롬프트와 사용자 프롬프트를 결합
   */
  public createFullPrompt(
    intent: string,
    userMessage: string,
    userContext: any,
  ): {
    systemPrompt: string
    userPrompt: string
  } {
    return {
      systemPrompt: this.systemPrompt,
      userPrompt: this.createIntentSpecificPrompt(intent, userMessage, userContext),
    }
  }
}

// 프롬프트 서비스 인스턴스 내보내기
export const promptService = PromptService.getInstance()
