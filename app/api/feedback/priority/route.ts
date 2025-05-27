import { NextResponse } from "next/server"
import { feedbackPriorityService } from "@/services/feedback-priority-service"
import type { Feedback } from "@/types/feedback"

export async function POST(request: Request) {
  try {
    const feedback = (await request.json()) as Feedback

    if (!feedback) {
      return NextResponse.json({ error: "Invalid feedback data" }, { status: 400 })
    }

    const priority = feedbackPriorityService.calculatePriority(feedback)

    return NextResponse.json({ priority })
  } catch (error) {
    console.error("Error calculating feedback priority:", error)
    return NextResponse.json({ error: "Failed to calculate feedback priority" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const config = feedbackPriorityService.getConfig()

    return NextResponse.json({ config })
  } catch (error) {
    console.error("Error fetching priority configuration:", error)
    return NextResponse.json({ error: "Failed to fetch priority configuration" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const newConfig = await request.json()

    if (!newConfig) {
      return NextResponse.json({ error: "Invalid configuration data" }, { status: 400 })
    }

    const updatedConfig = feedbackPriorityService.updateConfig(newConfig)

    return NextResponse.json({ config: updatedConfig })
  } catch (error) {
    console.error("Error updating priority configuration:", error)
    return NextResponse.json({ error: "Failed to update priority configuration" }, { status: 500 })
  }
}
