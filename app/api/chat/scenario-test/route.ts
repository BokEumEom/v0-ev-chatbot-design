import { NextResponse } from "next/server"
import { chatbotScenarios } from "@/data/chatbot-scenarios"
import { improvedIntentDetectionService } from "@/services/intent-detection-service-improved"
import { generateConsistencyCheckPrompt, checkResponseConsistency } from "@/utils/prompt-consistency-utils"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  try {
    // 요청 본문 파싱
    const body = await req.json()
    const { scenarioId, messageIndex = 0, customMessage } = body

    // 시나리오 찾기
    const scenario = chatbotScenarios.find((s) => s.id === scenarioId)
    if (!scenario) {
      return NextResponse.json({ error: "시나리오를 찾을 수 없습니다." }, { status: 404 })
    }

    // 대화 이력 구성
    const conversationHistory = []
    for (let i = 0; i < messageIndex; i++) {
      conversationHistory.push({ role: "user", content: scenario.conversations[i].user })
      conversationHistory.push({ role: "assistant", content: scenario.conversations[i].bot })
    }

    // 테스트할 메시지 (사용자 정의 메시지 또는 시나리오의 메시지)
    const message = customMessage || scenario.conversations[messageIndex].user

    // API 키 확인
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 })
    }

    // 향상된 인텐트 감지 서비스 사용
    const intentResult = await improvedIntentDetectionService.detectIntent(message, conversationHistory)
    const intent = intentResult.intent

    // 일관성 검사 프롬프트 생성
    const consistencyPrompt = generateConsistencyCheckPrompt(message, intent, conversationHistory)

    // 시스템 프롬프트 (간단한 예시)
    const systemPrompt = `당신은 전기차 충전 관련 상담을 제공하는 AI 어시스턴트입니다. 
사용자의 질문에 정확하고 유용한 정보를 제공하세요.
전문적이지만 친절한 톤으로 응답하세요.
불필요한 정보는 제공하지 말고 질문과 직접 관련된 내용만 답변하세요.`

    // 최종 프롬프트 조합
    const finalPrompt = `${systemPrompt}\n\n${consistencyPrompt}`

    // Gemini API를 사용하여 응답 생성
    const { text: generatedResponse } = await generateText({
      model: google("gemini-pro"),
      prompt: [{ role: "system", content: finalPrompt }, ...conversationHistory, { role: "user", content: message }],
      temperature: 0.7,
      maxTokens: 1500,
    })

    // 응답 일관성 검사
    const consistencyCheck = checkResponseConsistency(message, generatedResponse, intent)

    // 예상 응답 (시나리오에서)
    const expectedResponse = scenario.conversations[messageIndex].bot
    const expectedIntent = scenario.conversations[messageIndex].intent || "unknown"

    // 인텐트 일치 여부
    const intentMatch = intent === expectedIntent

    return NextResponse.json({
      userMessage: message,
      generatedResponse,
      expectedResponse,
      intent,
      expectedIntent,
      intentMatch,
      consistencyScore: consistencyCheck.confidenceScore,
      consistencyIssues: consistencyCheck.issues,
      metadata: {
        confidence: intentResult.confidence,
        entities: intentResult.entities,
        alternativeIntents: intentResult.alternativeIntents,
      },
    })
  } catch (error) {
    console.error("오류:", error)
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}
