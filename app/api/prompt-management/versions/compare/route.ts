import { NextResponse } from "next/server"

// 샘플 데이터 (실제 구현에서는 데이터베이스 사용)
// 이 예제에서는 외부 파일에서 데이터를 가져와야 하지만, 여기서는 간단히 처리
const promptVersions = [
  // 이전 예제의 데이터와 동일
]

// 두 버전 간의 차이점 계산 (간단한 구현)
function calculateDiff(text1: string, text2: string): string[] {
  const lines1 = text1.split("\n")
  const lines2 = text2.split("\n")
  const diff: string[] = []

  // 매우 간단한 diff 알고리즘 (실제 구현에서는 더 정교한 알고리즘 사용)
  const maxLines = Math.max(lines1.length, lines2.length)

  for (let i = 0; i < maxLines; i++) {
    if (i >= lines1.length) {
      diff.push(`+ ${lines2[i]}`)
    } else if (i >= lines2.length) {
      diff.push(`- ${lines1[i]}`)
    } else if (lines1[i] !== lines2[i]) {
      diff.push(`- ${lines1[i]}`)
      diff.push(`+ ${lines2[i]}`)
    } else {
      diff.push(`  ${lines1[i]}`)
    }
  }

  return diff
}

// 프롬프트 버전 비교
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const baseId = searchParams.get("baseId")
    const compareId = searchParams.get("compareId")

    if (!baseId || !compareId) {
      return NextResponse.json({ error: "기준 ID와 비교 ID가 필요합니다" }, { status: 400 })
    }

    // 버전 찾기
    const baseVersion = promptVersions.find((v) => v.id === baseId)
    const compareVersion = promptVersions.find((v) => v.id === compareId)

    if (!baseVersion || !compareVersion) {
      return NextResponse.json({ error: "하나 이상의 프롬프트 버전을 찾을 수 없습니다" }, { status: 404 })
    }

    // 시스템 프롬프트 차이 계산
    const systemPromptDiff = calculateDiff(baseVersion.systemPrompt, compareVersion.systemPrompt)

    // 모듈 차이 계산 (있는 경우)
    const modulesDiff: Record<string, string[]> = {}

    if (baseVersion.modules && compareVersion.modules) {
      const allModuleKeys = new Set([...Object.keys(baseVersion.modules), ...Object.keys(compareVersion.modules)])

      for (const key of allModuleKeys) {
        const baseModule = baseVersion.modules[key] || ""
        const compareModule = compareVersion.modules[key] || ""

        if (baseModule !== compareModule) {
          modulesDiff[key] = calculateDiff(baseModule, compareModule)
        }
      }
    }

    // 성능 지표 포함
    const comparison = {
      baseVersion,
      comparisonVersion: compareVersion,
      differences: {
        systemPrompt: systemPromptDiff,
        modules: Object.keys(modulesDiff).length > 0 ? modulesDiff : undefined,
        performance: compareVersion.performance
          ? {
              qualityScore: compareVersion.performance.qualityScore,
              userRating: compareVersion.performance.userRating,
              latency: compareVersion.performance.latency,
              tokenUsage: compareVersion.performance.tokenUsage,
              intentSuccessRates: compareVersion.performance.intentSuccessRates,
            }
          : undefined,
      },
    }

    return NextResponse.json(comparison)
  } catch (error) {
    console.error("프롬프트 버전 비교 오류:", error)
    return NextResponse.json({ error: "프롬프트 버전 비교 중 오류가 발생했습니다" }, { status: 500 })
  }
}
