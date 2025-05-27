import { NextResponse } from "next/server"
import { mlFeedbackClassificationService } from "@/services/ml-feedback-classification-service"
import type { Feedback } from "@/types/feedback"

export async function POST(request: Request) {
  try {
    const feedback = (await request.json()) as Feedback

    if (!feedback) {
      return NextResponse.json({ error: "Invalid feedback data" }, { status: 400 })
    }

    const classification = mlFeedbackClassificationService.classifyFeedback(feedback)

    return NextResponse.json({ classification })
  } catch (error) {
    console.error("Error classifying feedback:", error)
    return NextResponse.json({ error: "Failed to classify feedback" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const models = mlFeedbackClassificationService.getModels()
    const activeModel = mlFeedbackClassificationService.getActiveModel()

    return NextResponse.json({
      models,
      activeModel: activeModel ? activeModel.id : null,
    })
  } catch (error) {
    console.error("Error fetching classification models:", error)
    return NextResponse.json({ error: "Failed to fetch classification models" }, { status: 500 })
  }
}
