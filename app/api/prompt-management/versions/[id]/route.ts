import { NextResponse } from "next/server"

// 샘플 데이터 (실제 구현에서는 데이터베이스 사용)
// 이 예제에서는 외부 파일에서 데이터를 가져와야 하지만, 여기서는 간단히 처리
const promptVersions = [
  // 이전 예제의 데이터와 동일
]

// 프롬프트 버전 조회
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id

  const version = promptVersions.find((v) => v.id === id)

  if (!version) {
    return NextResponse.json({ error: "프롬프트 버전을 찾을 수 없습니다" }, { status: 404 })
  }

  return NextResponse.json(version)
}

// 프롬프트 버전 업데이트
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json()

    // 버전 찾기
    const versionIndex = promptVersions.findIndex((v) => v.id === id)

    if (versionIndex === -1) {
      return NextResponse.json({ error: "프롬프트 버전을 찾을 수 없습니다" }, { status: 404 })
    }

    // 업데이트할 필드 검증
    const allowedFields = ["description", "systemPrompt", "changeLog"]
    const updates: Record<string, any> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    // 버전 업데이트
    promptVersions[versionIndex] = {
      ...promptVersions[versionIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(promptVersions[versionIndex])
  } catch (error) {
    console.error("프롬프트 버전 업데이트 오류:", error)
    return NextResponse.json({ error: "프롬프트 버전 업데이트 중 오류가 발생했습니다" }, { status: 500 })
  }
}
