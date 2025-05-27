import { QualityEvaluationDashboard } from "@/components/quality-evaluation/quality-evaluation-dashboard"

export const metadata = {
  title: "품질 평가 대시보드 | 전기차 충전 도우미",
  description: "프롬프트 응답 품질 자동 평가 시스템",
}

// 서버 컴포넌트에서 프롬프트 버전 데이터 가져오기
async function getPromptVersions() {
  // 실제 구현에서는 API 호출
  // 임시 데이터 반환
  return [
    {
      id: "version-1",
      name: "기본 프롬프트",
      version: "1.0",
      description: "전기차 충전소 안내를 위한 기본 프롬프트",
      content: "당신은 전기차 충전소 안내 도우미입니다...",
      createdAt: "2023-05-15T09:00:00Z",
      createdBy: "admin",
      isActive: true,
    },
    {
      id: "version-2",
      name: "개선된 프롬프트",
      version: "1.1",
      description: "사용자 만족도 향상을 위해 개선된 프롬프트",
      content: "당신은 친절한 전기차 충전소 안내 도우미입니다...",
      createdAt: "2023-06-20T14:30:00Z",
      createdBy: "admin",
      isActive: false,
    },
    {
      id: "version-3",
      name: "다국어 지원 프롬프트",
      version: "2.0",
      description: "한국어와 영어를 지원하는 프롬프트",
      content: "당신은 다국어를 지원하는 전기차 충전소 안내 도우미입니다...",
      createdAt: "2023-08-10T11:15:00Z",
      createdBy: "admin",
      isActive: false,
    },
  ]
}

export default async function QualityEvaluationPage() {
  const promptVersions = await getPromptVersions()

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">품질 평가 대시보드</h1>
        <p className="text-muted-foreground">프롬프트 응답의 품질을 자동으로 평가하고 분석하는 시스템입니다.</p>
      </div>

      <QualityEvaluationDashboard promptVersions={promptVersions} />
    </div>
  )
}
