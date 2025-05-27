import { NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

// 이 엔드포인트는 Gemini API를 직접 호출하는 방법을 보여줍니다
export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 })
    }

    // 요청 본문 파싱
    const body = await req.json()
    const { prompt } = body

    const fullPrompt = `
      You are a helpful AI assistant.
      ${prompt}
    `

    const { text } = await generateText({
      model: google("gemini-pro"),
      prompt: fullPrompt,
      temperature: 0.7,
      maxTokens: 1500,
    })

    return NextResponse.json({ output: text })
  } catch (error) {
    console.error("오류:", error)
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}
