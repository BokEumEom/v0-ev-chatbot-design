// 고급 인텐트 감지 서비스

// 인텐트 타입 정의
export type Intent = {
  id: string
  name: string
  confidence: number
  entities?: Record<string, any>
}

// 인텐트 감지 결과 타입
export type IntentDetectionResult = {
  topIntent: Intent
  allIntents: Intent[]
  entities: Record<string, any>
  originalText: string
}

// 인텐트 패턴 정의
type IntentPattern = {
  id: string
  name: string
  patterns: string[]
  keywords: string[]
  entityExtractors?: Array<{
    entity: string
    pattern: RegExp
  }>
}

// 인텐트 패턴 데이터
const intentPatterns: IntentPattern[] = [
  {
    id: "charger_issue",
    name: "충전기 고장/문제",
    patterns: [
      "충전기가 (.*) 안 (돼요|됩니다|되네요)",
      "(\\d+)번 충전기(가|에서) (.*)",
      "충전기 (고장|문제|오류|에러)",
    ],
    keywords: ["고장", "작동", "안 됨", "문제", "오류", "에러", "먹통", "반응 없음"],
    entityExtractors: [
      {
        entity: "charger_number",
        pattern: /((\d+)번 충전기|충전기 (\d+)번)/,
      },
      {
        entity: "issue_type",
        pattern: /(고장|작동|반응|켜지지|꺼짐|멈춤|중단|오류|에러)/,
      },
    ],
  },
  {
    id: "usage_guide",
    name: "사용 방법 안내",
    patterns: ["어떻게 (충전|사용)(하나요|하죠|할까요|해요)", "(처음|첫) (이용|사용)", "(충전|사용) 방법"],
    keywords: ["어떻게", "방법", "사용법", "처음", "시작", "이용", "가이드", "매뉴얼"],
    entityExtractors: [
      {
        entity: "user_experience",
        pattern: /(처음|첫|초보|입문)/,
      },
    ],
  },
  {
    id: "find_charger",
    name: "충전소 찾기",
    patterns: ["(가까운|근처) 충전(소|기)", "충전(소|기) (어디|위치|찾기)", "(어디서|어디에서) 충전"],
    keywords: ["어디", "가까운", "근처", "주변", "위치", "찾기", "충전소", "충전기", "지도"],
    entityExtractors: [
      {
        entity: "location",
        pattern: /(강남|서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/,
      },
      {
        entity: "charger_type",
        pattern: /(급속|완속|슈퍼차저|콤보|차데모|AC|DC)/,
      },
    ],
  },
  {
    id: "payment_issue",
    name: "결제 문제",
    patterns: ["결제(가|에서) (.*) (안 돼요|문제|오류)", "(카드|앱) 결제 (.*)", "요금 (.*) (얼마|비용|가격)"],
    keywords: ["결제", "카드", "앱", "지불", "요금", "비용", "청구", "영수증", "환불"],
    entityExtractors: [
      {
        entity: "payment_method",
        pattern: /(카드|신용카드|체크카드|삼성페이|애플페이|앱|계좌)/,
      },
      {
        entity: "issue_type",
        pattern: /(실패|오류|에러|취소|중복|이중|환불)/,
      },
    ],
  },
  {
    id: "charging_history",
    name: "충전 이력 확인",
    patterns: ["(충전|이용) (이력|내역|기록)", "(지난|이전) (충전|이용)", "(언제|어디서) 충전(했|했었)나요"],
    keywords: ["이력", "내역", "기록", "히스토리", "지난", "이전", "보여줘", "확인"],
    entityExtractors: [
      {
        entity: "time_period",
        pattern: /(오늘|어제|그제|지난주|지난달|이번 주|이번 달|최근|(\d+)일|(\d+)주|(\d+)개월)/,
      },
    ],
  },
  {
    id: "pricing_inquiry",
    name: "요금 문의",
    patterns: ["요금(이|은) (얼마|어떻게)", "(충전|이용) (요금|비용|가격)", "얼마(나|를) (내야|지불|결제)"],
    keywords: ["요금", "가격", "비용", "얼마", "지불", "할인", "요율", "kWh", "킬로와트"],
    entityExtractors: [
      {
        entity: "charger_type",
        pattern: /(급속|완속|슈퍼차저|콤보|차데모|AC|DC)/,
      },
      {
        entity: "membership_type",
        pattern: /(회원|멤버십|구독|정기권|일반|할인)/,
      },
    ],
  },
  {
    id: "membership_inquiry",
    name: "회원 정보 문의",
    patterns: [
      "(회원|계정|로그인) (정보|문제|방법)",
      "(가입|등록) (방법|절차|과정)",
      "(비밀번호|아이디) (찾기|변경|재설정)",
    ],
    keywords: ["회원", "가입", "로그인", "계정", "비밀번호", "아이디", "정보", "변경", "수정"],
    entityExtractors: [
      {
        entity: "account_action",
        pattern: /(가입|로그인|변경|수정|삭제|탈퇴|찾기|재설정)/,
      },
    ],
  },
  {
    id: "reservation_inquiry",
    name: "충전 예약 문의",
    patterns: ["(예약|미리) (충전|잡아)", "충전(을|소를) (예약|미리)", "예약 (방법|취소|변경)"],
    keywords: ["예약", "미리", "선점", "잡아", "스케줄", "일정", "시간", "취소", "변경"],
    entityExtractors: [
      {
        entity: "reservation_action",
        pattern: /(예약|취소|변경|확인)/,
      },
      {
        entity: "time",
        pattern: /(\d+시|\d+:\d+|오전|오후|저녁|아침|점심|새벽)/,
      },
    ],
  },
  {
    id: "vehicle_compatibility",
    name: "차량 호환성 문의",
    patterns: [
      "(내|우리|제|저의) 차(는|에) (맞|호환|사용)",
      "(차종|차량|모델)(이|은|과) (호환|맞|사용)",
      "(.*) 차량(은|는) (.*) 충전(기|소)",
    ],
    keywords: ["차량", "차종", "모델", "호환", "맞나요", "사용 가능", "지원", "커넥터", "플러그"],
    entityExtractors: [
      {
        entity: "vehicle_model",
        pattern:
          /(아이오닉|코나|니로|모델\s?[3SXY]|테슬라|포터|봉고|쏘울|쏘나타|그랜저|투싼|싼타페|팰리세이드|타이칸|EV6|GV|벤츠|BMW|아우디)/,
      },
      {
        entity: "connector_type",
        pattern: /(콤보|차데모|AC|DC|5핀|7핀|슈퍼차저|CCS|CHAdeMO)/,
      },
    ],
  },
  {
    id: "general_inquiry",
    name: "일반 문의",
    patterns: ["(.*)"],
    keywords: [],
    entityExtractors: [],
  },
]

// 인텐트 감지 서비스 클래스
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export class IntentDetectionService {
  private static instance: IntentDetectionService

  private constructor() {}

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): IntentDetectionService {
    if (!IntentDetectionService.instance) {
      IntentDetectionService.instance = new IntentDetectionService()
    }
    return IntentDetectionService.instance
  }

  /**
   * 인텐트 감지 함수
   * @param message 사용자 메시지
   * @returns 감지된 인텐트 정보
   */
  public detectIntent(message: string): IntentDetectionResult {
    const lowerMessage = message.toLowerCase()
    const intents: Intent[] = []

    // 각 인텐트 패턴에 대해 점수 계산
    for (const intentPattern of intentPatterns) {
      let score = 0
      const matchedEntities: Record<string, any> = {}

      // 패턴 매칭 검사
      for (const pattern of intentPattern.patterns) {
        const regex = new RegExp(pattern, "i")
        if (regex.test(message)) {
          score += 0.5 // 패턴 매치 시 가중치
        }
      }

      // 키워드 매칭 검사
      for (const keyword of intentPattern.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          score += 0.3 // 키워드 매치 시 가중치
        }
      }

      // 엔티티 추출
      if (intentPattern.entityExtractors) {
        for (const extractor of intentPattern.entityExtractors) {
          const match = message.match(extractor.pattern)
          if (match) {
            matchedEntities[extractor.entity] = match[0]
            score += 0.2 // 엔티티 매치 시 가중치
          }
        }
      }

      // 일반 문의는 다른 인텐트가 없을 때만 높은 점수
      if (intentPattern.id === "general_inquiry") {
        score = 0.1 // 기본 점수 낮게 설정
      }

      // 최소 점수 이상인 경우만 추가
      if (score > 0) {
        intents.push({
          id: intentPattern.id,
          name: intentPattern.name,
          confidence: Math.min(score, 1), // 최대 1.0
          entities: Object.keys(matchedEntities).length > 0 ? matchedEntities : undefined,
        })
      }
    }

    // 점수 기준 내림차순 정렬
    intents.sort((a, b) => b.confidence - a.confidence)

    // 엔티티 통합
    const allEntities: Record<string, any> = {}
    for (const intent of intents) {
      if (intent.entities) {
        Object.assign(allEntities, intent.entities)
      }
    }

    return {
      topIntent: intents.length > 0 ? intents[0] : { id: "general_inquiry", name: "일반 문의", confidence: 0.1 },
      allIntents: intents,
      entities: allEntities,
      originalText: message,
    }
  }

  /**
   * 인텐트 기반 후속 질문 생성
   * @param intent 감지된 인텐트
   * @returns 후속 질문 목록
   */
  public generateFollowUpQuestions(intent: Intent): string[] {
    switch (intent.id) {
      case "charger_issue":
        return [
          "충전기 화면에 오류 코드가 표시되나요?",
          "다른 충전기도 시도해 보셨나요?",
          "차량의 충전 포트에 문제가 있나요?",
          "앱에서 충전 시작 버튼을 눌러보셨나요?",
        ]
      case "usage_guide":
        return [
          "어떤 차량을 사용하고 계신가요?",
          "급속 충전과 완속 충전 중 어떤 방법을 알고 싶으신가요?",
          "충전 카드나 앱은 준비되어 있으신가요?",
          "처음 충전해 보시는 건가요?",
        ]
      case "find_charger":
        return [
          "현재 위치가 어디신가요?",
          "급속 충전이 필요하신가요, 완속 충전이 필요하신가요?",
          "특정 브랜드의 충전소를 찾고 계신가요?",
          "얼마나 긴급하게 충전이 필요하신가요?",
        ]
      case "payment_issue":
        return [
          "어떤 결제 수단을 사용하고 계신가요?",
          "결제 시 어떤 오류 메시지가 표시되나요?",
          "앱에서 결제 정보가 최신 상태인가요?",
          "이전에는 정상적으로 결제가 되었나요?",
        ]
      case "charging_history":
        return [
          "어떤 기간의 충전 이력을 확인하고 싶으신가요?",
          "특정 충전소에서의 이력만 보고 싶으신가요?",
          "영수증이나 세금계산서가 필요하신가요?",
          "충전 이력을 어떤 목적으로 확인하시나요?",
        ]
      case "pricing_inquiry":
        return [
          "회원이신가요?",
          "어떤 충전 방식(급속/완속)의 요금이 궁금하신가요?",
          "특정 시간대의 요금이 궁금하신가요?",
          "요금 할인 프로모션에 대해 알고 싶으신가요?",
        ]
      case "membership_inquiry":
        return [
          "현재 회원이신가요?",
          "어떤 회원 정보를 변경하고 싶으신가요?",
          "회원 등급이나 혜택에 대해 알고 싶으신가요?",
          "로그인에 문제가 있으신가요?",
        ]
      case "reservation_inquiry":
        return [
          "언제 충전 예약을 하고 싶으신가요?",
          "어떤 충전소에서 예약하고 싶으신가요?",
          "예약 변경이나 취소에 대해 알고 싶으신가요?",
          "예약 알림을 받고 싶으신가요?",
        ]
      case "vehicle_compatibility":
        return [
          "차량 모델이 무엇인가요?",
          "어떤 충전 커넥터를 사용하나요?",
          "특정 충전소와의 호환성이 궁금하신가요?",
          "충전 속도에 대해 알고 싶으신가요?",
        ]
      default:
        return [
          "더 자세한 정보가 필요합니다. 어떤 도움이 필요하신가요?",
          "충전과 관련된 질문이신가요?",
          "계정이나 결제에 관한 문의인가요?",
          "특정 충전소에 대한 정보가 필요하신가요?",
        ]
    }
  }

  async generateFollowUpQuestionsWithLLM(intent: Intent, message: string): Promise<string[]> {
    const prompt = `
      사용자 메시지: ${message}
      감지된 인텐트 ID: ${intent.id}
      감지된 인텐트 이름: ${intent.name}

      위 정보를 바탕으로 사용자에게 추가적으로 물어볼 질문 3개를 생성해주세요.
      답변은 한국어로, 각 질문은 50자 이내로 생성해주세요.
      각 질문은 번호와 함께 나열해주세요. 예시:
      1. ...
      2. ...
      3. ...
    `

    try {
      const { text } = await generateText({
        model: google("gemini-pro"),
        prompt: prompt,
        temperature: 0.3,
      })

      // LLM 응답에서 질문 목록 추출
      const questions = text
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim()) // 번호 제거 및 공백 제거
        .filter((line) => line !== "") // 빈 줄 제거

      return questions
    } catch (error) {
      console.error("LLM 기반 후속 질문 생성 중 오류 발생:", error)
      return this.generateFollowUpQuestions(intent) // 에러 발생 시 기존 방식 사용
    }
  }
}

// 인텐트 감지 서비스 인스턴스 내보내기
export const intentDetectionService = IntentDetectionService.getInstance()
