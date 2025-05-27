import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TroubleshootingVisualGuide } from "@/components/troubleshooting-visual-guide"

// 실제 구현에서는 이 데이터를 API나 데이터베이스에서 가져옵니다
const troubleshootingData = {
  charging: {
    "charging-1": {
      title: "충전이 시작되지 않아요",
      description: "충전 시작 문제 해결 가이드",
      content: `
# 충전이 시작되지 않는 문제 해결하기

전기차 충전이 시작되지 않는 것은 여러 가지 원인이 있을 수 있습니다. 아래 단계별 가이드를 따라 문제를 해결해 보세요.

## 기본 확인 사항

1. **충전 케이블 연결 상태 확인**
   - 충전 케이블이 차량과 충전기에 완전히 연결되었는지 확인하세요.
   - 커넥터가 손상되었거나 이물질이 있는지 확인하세요.

2. **충전기 상태 확인**
   - 충전기 디스플레이에 오류 메시지가 있는지 확인하세요.
   - 충전기의 전원이 켜져 있는지 확인하세요.
   - 다른 사용자가 이미 충전기를 사용 중인지 확인하세요.

3. **앱 상태 확인**
   - 앱을 최신 버전으로 업데이트했는지 확인하세요.
   - 앱에서 충전 시작 버튼을 다시 눌러보세요.
   - 앱을 재시작해 보세요.

## 고급 문제 해결

1. **다른 충전 커넥터 시도**
   - 가능하다면 다른 충전 커넥터를 사용해 보세요.
   - 다른 충전소를 방문해 보세요.

2. **차량 충전 시스템 재설정**
   - 차량의 충전 포트를 재설정하세요 (차량 매뉴얼 참조).
   - 차량을 재시작해 보세요.

3. **결제 정보 확인**
   - 결제 카드가 유효한지 확인하세요.
   - 충전 크레딧이나 잔액이 충분한지 확인하세요.

## 문제가 지속되는 경우

여전히 문제가 해결되지 않으면 다음 정보를 준비하여 고객센터에 문의하세요:

- 차량 모델 및 연식
- 충전기 ID 또는 위치
- 충전기에 표시된 오류 코드
- 문제가 발생한 날짜와 시간
- 시도한 문제 해결 단계

고객센터는 24시간 연중무휴로 운영되며, 앱 내 채팅이나 전화(1234-5678)로 연락할 수 있습니다.
      `,
      relatedGuides: ["charging-2", "charging-3", "payment-1"],
    },
    // 다른 가이드 항목들...
  },
  // 다른 카테고리들...
}

export default function HelpGuidePage({ params }: { params: { category: string; id: string } }) {
  const { category, id } = params

  // 해당 카테고리와 ID에 맞는 가이드 찾기
  const guide = troubleshootingData[category as keyof typeof troubleshootingData]?.[id as string]

  if (!guide) {
    return notFound()
  }

  // 관련 가이드 제목 가져오기 (실제 구현에서는 API나 데이터베이스에서 가져옵니다)
  const getRelatedGuideTitle = (guideId: string) => {
    const [relatedCategory, relatedId] = guideId.split("-")
    return troubleshootingData[relatedCategory as keyof typeof troubleshootingData]?.[guideId]?.title || guideId
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-2">
          <Link href="/help">
            <ChevronLeft className="mr-2 h-4 w-4" />
            도움말 목록으로 돌아가기
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{guide.title}</h1>
        <p className="text-muted-foreground">{guide.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 prose prose-slate max-w-none">
              <div dangerouslySetInnerHTML={{ __html: guide.content.replace(/\n/g, "<br />") }} />
            </CardContent>
          </Card>

          {/* 시각적 가이드 */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">시각적 가이드</h2>
            <TroubleshootingVisualGuide category={category} guideId={id} />
          </div>
        </div>

        <div>
          {/* 관련 가이드 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>관련 가이드</CardTitle>
              <CardDescription>이 문제와 관련된 다른 가이드</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {guide.relatedGuides.map((relatedGuide) => (
                  <li key={relatedGuide}>
                    <Link
                      href={`/help/${relatedGuide.split("-")[0]}/${relatedGuide}`}
                      className="text-blue-600 hover:underline"
                    >
                      {getRelatedGuideTitle(relatedGuide)}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 도움이 필요하신가요? */}
          <Card>
            <CardHeader>
              <CardTitle>도움이 필요하신가요?</CardTitle>
              <CardDescription>추가 지원을 받을 수 있는 방법</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">고객센터 채팅</Button>
              <Button variant="outline" className="w-full">
                전화 문의 (1234-5678)
              </Button>
              <Separator />
              <div className="text-sm text-muted-foreground">
                운영 시간: 24시간 연중무휴
                <br />
                평균 응답 시간: 5분 이내
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
