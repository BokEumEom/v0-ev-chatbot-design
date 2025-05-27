import { NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { promptService } from "@/services/prompt-service"

// 인텐트 감지 함수를 더 정교하게 개선
function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase()

  // 고장 대응 인텐트
  if (
    lowerMessage.includes("고장") ||
    lowerMessage.includes("작동 안") ||
    lowerMessage.includes("먹통") ||
    lowerMessage.includes("안 돼요") ||
    lowerMessage.includes("문제") ||
    /\d+번.*충전기/.test(lowerMessage)
  ) {
    return "charger_issue"
  }

  // 사용법 안내 인텐트
  if (
    lowerMessage.includes("어떻게") ||
    lowerMessage.includes("방법") ||
    lowerMessage.includes("사용법") ||
    lowerMessage.includes("처음") ||
    lowerMessage.includes("시작")
  ) {
    return "usage_guide"
  }

  // 충전기 추천 인텐트
  if (
    lowerMessage.includes("어디") ||
    lowerMessage.includes("가까운") ||
    lowerMessage.includes("근처") ||
    lowerMessage.includes("추천") ||
    lowerMessage.includes("충전할 수 있는 곳") ||
    lowerMessage.includes("대기 없")
  ) {
    return "find_charger"
  }

  // 결제 이슈 인텐트
  if (
    lowerMessage.includes("결제") ||
    lowerMessage.includes("카드") ||
    lowerMessage.includes("앱") ||
    lowerMessage.includes("지불") ||
    lowerMessage.includes("돈")
  ) {
    return "payment_issue"
  }

  // 이력 확인 인텐트
  if (
    lowerMessage.includes("이력") ||
    lowerMessage.includes("내역") ||
    lowerMessage.includes("지난") ||
    lowerMessage.includes("기록") ||
    lowerMessage.includes("보여줘")
  ) {
    return "charging_history"
  }

  // 요금 문의 인텐트
  if (
    lowerMessage.includes("요금") ||
    lowerMessage.includes("가격") ||
    lowerMessage.includes("비용") ||
    lowerMessage.includes("얼마") ||
    lowerMessage.includes("할인")
  ) {
    return "pricing_inquiry"
  }

  // 회원 정보 인텐트
  if (
    lowerMessage.includes("회원") ||
    lowerMessage.includes("가입") ||
    lowerMessage.includes("로그인") ||
    lowerMessage.includes("계정") ||
    lowerMessage.includes("비밀번호")
  ) {
    return "membership_inquiry"
  }

  return "general_inquiry"
}

export async function POST(req: Request) {
  try {
    // API 키 확인
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 })
    }

    // 요청 본문 파싱 - 한 번만 파싱
    let message
    try {
      const body = await req.json()
      message = body.message

      if (!message || typeof message !== "string") {
        return NextResponse.json(
          {
            error: "유효한 메시지가 필요합니다.",
            received: body,
          },
          { status: 400 },
        )
      }
    } catch (error) {
      return NextResponse.json({ error: "잘못된 JSON 형식입니다." }, { status: 400 })
    }

    if (!message) {
      return NextResponse.json({ error: "메시지가 필요합니다." }, { status: 400 })
    }

    // 사용자 컨텍스트 (예시)
    const userContext = {
      location: "강남역",
      vehicleModel: "아이오닉 5",
      paymentMethods: ["신용카드", "앱 결제"],
      recentChargers: ["강남 충전소", "역삼 충전소"],
      membershipLevel: "골드",
      joinDate: "2023-01-15",
    }

    // 인텐트 감지
    const intent = detectIntent(message)

    // 프롬프트 서비스를 사용하여 프롬프트 생성
    const { systemPrompt, userPrompt } = promptService.createFullPrompt(intent, message, userContext)

    const fullPrompt = systemPrompt + "\n" + userPrompt

    // 시작 시간 기록 (성능 측정용)
    const startTime = Date.now()

    // Gemini API 호출 (REST 방식)
    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt: fullPrompt,
      temperature: 0.7,
      maxTokens: 1500,
    })

    // 종료 시간 기록 (성능 측정용)
    const endTime = Date.now()
    const processingTime = endTime - startTime

    // 응답 로깅 (실제 구현에서는 DB에 저장)
    console.log({
      timestamp: new Date().toISOString(),
      intent,
      userMessage: message,
      processingTime: `${processingTime}ms`,
      botResponse: text.substring(0, 100) + "...",
    })

    return NextResponse.json({
      response: text,
      metadata: {
        intent,
        processingTime,
      },
    })
  } catch (error) {
    console.error("오류:", error)
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}
