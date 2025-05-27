import { NextResponse } from "next/server"
import { promptService } from "@/services/prompt-service"
import { improvedIntentDetectionService } from "@/services/intent-detection-service-improved"
import { generateConsistencyCheckPrompt, checkResponseConsistency } from "@/utils/prompt-consistency-utils"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  try {
    // API 키 확인
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 })
    }

    // 요청 본문 파싱
    let message, conversationHistory, userContext, conversationState
    try {
      const body = await req.json()
      message = body.message
      conversationHistory = body.conversationHistory || []
      userContext = body.userContext || {}
      conversationState = body.conversationState || {}

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

    // 시작 시간 기록 (성능 측정용)
    const startTime = Date.now()

    // 향상된 인텐트 감지 서비스 사용
    const intentResult = await improvedIntentDetectionService.detectIntent(message, conversationHistory)
    const intent = intentResult.intent

    // 시스템 프롬프트 가져오기
    const systemPrompt = promptService.getSystemPrompt()

    // 일관성 검사 프롬프트 생성
    const consistencyPrompt = generateConsistencyCheckPrompt(message, intent, conversationHistory)

    // 최종 프롬프트 조합
    const finalPrompt = `${systemPrompt}\n\n${consistencyPrompt}`

    // Gemini API를 사용하여 응답 생성
    const { text: generatedResponse } = await generateText({
      model: google("gemini-pro"),
      prompt: [
        { role: "system", content: finalPrompt },
        ...conversationHistory.slice(-6), // 최근 6개 메시지만 포함
        { role: "user", content: message },
      ],
      temperature: 0.7,
      maxTokens: 1500,
    })

    // 응답 일관성 검사
    const consistencyCheck = checkResponseConsistency(message, generatedResponse, intent)

    // 일관성이 낮은 경우 재시도
    let finalResponse = generatedResponse
    if (!consistencyCheck.isConsistent && consistencyCheck.issues) {
      console.log("응답 일관성 문제 감지:", consistencyCheck.issues)

      // 일관성 문제를 해결하기 위한 개선된 프롬프트
      const improvedPrompt = `
${finalPrompt}

## 일관성 문제 해결
이전 응답에서 다음과 같은 일관성 문제가 감지되었습니다:
${consistencyCheck.issues.map((issue) => `- ${issue}`).join("\n")}

사용자 질문: "${message}"

다음 사항에 주의하여 더 일관성 있는 응답을 생성하세요:
1. 질문의 핵심 주제와 키워드에 직접 응답하세요.
2. 질문과 관련 없는 정보는 제외하세요.
3. 질문 유형에 맞는 형식으로 응답하세요.
4. 간결하고 명확하게 답변하세요.
`

      // 개선된 프롬프트로 재시도
      const { text: improvedResponse } = await generateText({
        model: google("gemini-pro"),
        prompt: improvedPrompt,
        temperature: 0.7,
        maxTokens: 1500,
      })

      // 개선된 응답으로 업데이트
      finalResponse = improvedResponse
    }

    // 종료 시간 기록 (성능 측정용)
    const endTime = Date.now()
    const processingTime = endTime - startTime

    return NextResponse.json({
      response: finalResponse,
      metadata: {
        intent,
        confidence: intentResult.confidence,
        entities: intentResult.entities,
        alternativeIntents: intentResult.alternativeIntents,
        processingTime,
        consistencyScore: consistencyCheck.confidenceScore,
        consistencyIssues: consistencyCheck.issues,
      },
    })
  } catch (error) {
    console.error("오류:", error)
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}
