import { NextResponse } from "next/server"
import { mlFeedbackClassificationService } from "@/services/ml-feedback-classification-service"
import type { ModelTrainingConfig } from "@/types/ml-feedback"

export async function POST(request: Request) {
  try {
    const config = (await request.json()) as ModelTrainingConfig

    if (!config) {
      return NextResponse.json({ error: "Invalid training configuration" }, { status: 400 })
    }

    const result = await mlFeedbackClassificationService.trainModel(config)

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Error training classification model:", error)
    return NextResponse.json({ error: "Failed to train classification model" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { modelId } = await request.json()

    if (!modelId) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 })
    }

    const success = await mlFeedbackClassificationService.activateModel(modelId)

    if (!success) {
      return NextResponse.json({ error: "Failed to activate model" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error activating classification model:", error)
    return NextResponse.json({ error: "Failed to activate classification model" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { modelId } = await request.json()

    if (!modelId) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 })
    }

    const success = mlFeedbackClassificationService.deleteModel(modelId)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete model" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting classification model:", error)
    return NextResponse.json({ error: "Failed to delete classification model" }, { status: 500 })
  }
}
