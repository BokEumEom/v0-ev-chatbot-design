import { NextResponse } from "next/server"
import type { PromptDeploymentHistory } from "@/types/prompt-management"

// 샘플 데이터 (실제 구현에서는 데이터베이스 사용)
const deploymentHistory: PromptDeploymentHistory[] = [
  {
    id: "deploy_1",
    versionId: "version_1",
    versionName: "기본 프롬프트 v1.0.0",
    deployedAt: "2023-01-20T14:30:00Z",
    deployedBy: "admin",
    environment: "production",
    status: "success",
    metrics: {
      beforeDeployment: {
        qualityScore: 0,
        userRating: 0,
        latency: 0,
        tokenUsage: 0,
        intentSuccessRates: {},
        sampleSize: 0,
        lastUpdated: "2023-01-20T14:30:00Z",
      },
      afterDeployment: {
        qualityScore: 8.5,
        userRating: 4.2,
        latency: 350,
        tokenUsage: 520,
        intentSuccessRates: {
          charger_issue: 0.92,
          usage_guide: 0.95,
          find_charger: 0.88,
          payment_issue: 0.85,
          charging_history: 0.9,
          pricing_inquiry: 0.93,
          membership_inquiry: 0.87,
          general_inquiry: 0.82,
        },
        sampleSize: 1250,
        lastUpdated: "2023-03-10T15:30:00Z",
      },
    },
  },
]

// 배포 이력 조회
export async function GET() {
  return NextResponse.json(deploymentHistory)
}

// 새 배포 생성
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 필수 필드 검증
    if (!body.versionId || !body.environment) {
      return NextResponse.json({ error: "버전 ID와 환경이 필요합니다" }, { status: 400 })
    }

    // 프롬프트 버전 정보 가져오기 (실제 구현에서는 데이터베이스 조회)
    // 여기서는 간단히 처리
    const versionName =
      body.versionId === "version_1"
        ? "기본 프롬프트 v1.0.0"
        : body.versionId === "version_2"
          ? "개선된 충전기 문제 해결 v1.1.0"
          : "알 수 없는 버전"

    // 새 배포 생성
    const newDeployment: PromptDeploymentHistory = {
      id: `deploy_${Date.now()}`,
      versionId: body.versionId,
      versionName,
      deployedAt: new Date().toISOString(),
      deployedBy: "current_user", // 실제 구현에서는 인증된 사용자 정보 사용
      environment: body.environment,
      status: "success",
    }

    // 배포 이력에 추가
    deploymentHistory.unshift(newDeployment)

    return NextResponse.json(newDeployment)
  } catch (error) {
    console.error("배포 생성 오류:", error)
    return NextResponse.json({ error: "배포 생성 중 오류가 발생했습니다" }, { status: 500 })
  }
}
