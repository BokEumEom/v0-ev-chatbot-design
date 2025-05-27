import { NextResponse } from "next/server"

// 샘플 데이터 (실제 구현에서는 데이터베이스 사용)
// 이 예제에서는 외부 파일에서 데이터를 가져와야 하지만, 여기서는 간단히 처리
const deploymentHistory = [
  // 이전 예제의 데이터와 동일
]

// 배포 롤백
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // 배포 찾기
    const deploymentIndex = deploymentHistory.findIndex((d) => d.id === id)

    if (deploymentIndex === -1) {
      return NextResponse.json({ error: "배포를 찾을 수 없습니다" }, { status: 404 })
    }

    // 롤백 정보 추가
    deploymentHistory[deploymentIndex] = {
      ...deploymentHistory[deploymentIndex],
      status: "rolled-back",
      rollbackInfo: {
        rolledBackAt: new Date().toISOString(),
        rolledBackBy: "current_user", // 실제 구현에서는 인증된 사용자 정보 사용
        reason: "수동 롤백",
      },
    }

    return NextResponse.json(deploymentHistory[deploymentIndex])
  } catch (error) {
    console.error("롤백 오류:", error)
    return NextResponse.json({ error: "롤백 중 오류가 발생했습니다" }, { status: 500 })
  }
}
