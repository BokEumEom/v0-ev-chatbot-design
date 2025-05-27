import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { gemini } from "@ai-sdk/gemini"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, userPrompt } = await req.json()

    // AI 응답 생성
    const { text: response } = await generateText({
      model: gemini("gemini-1.5-pro"),
      prompt: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 1024,
    })

    return NextResponse.json({
      response,
    })
  } catch (error) {
    console.error("Error testing prompt:", error)
    return NextResponse.json({ error: "Failed to test prompt" }, { status: 500 })
  }
}
