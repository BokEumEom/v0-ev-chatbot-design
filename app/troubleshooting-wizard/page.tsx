"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TroubleshootingWizard } from "@/components/troubleshooting-wizard"
import type { WizardNode } from "@/data/troubleshooting-tree"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, ThumbsUp, Lightbulb, HelpCircle, Wrench } from "lucide-react"

export default function TroubleshootingWizardPage() {
  const router = useRouter()
  const [completedSolution, setCompletedSolution] = useState<WizardNode | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [activeTab, setActiveTab] = useState("wizard")

  const handleComplete = (result: WizardNode) => {
    setCompletedSolution(result)
    // 실제 구현에서는 완료된 진단 결과를 저장하거나 분석할 수 있습니다
    console.log("진단 완료:", result)
  }

  const handleRedirect = (redirectTo: string) => {
    if (redirectTo === "support") {
      // 고객 지원 페이지로 이동
      router.push("/support")
    }
  }

  const handleFeedback = (helpful: boolean) => {
    // 실제 구현에서는 피드백을 서버에 저장
    console.log("피드백:", helpful)
    setShowFeedback(true)

    // 피드백 후 3초 후에 피드백 UI 숨기기
    setTimeout(() => {
      setShowFeedback(false)
    }, 3000)
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-2">전기차 충전 문제 진단 마법사</h1>
        <p className="text-muted-foreground mb-6">
          단계별 질문에 답하여 전기차 충전 문제를 진단하고 맞춤형 해결책을 찾아보세요.
        </p>

        <Tabs defaultValue="wizard" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="wizard" className="flex items-center gap-1">
              <Wrench className="h-4 w-4" />
              <span>진단 마법사</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              <span>충전 팁</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>자주 묻는 질문</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wizard" className="mt-0">
            <TroubleshootingWizard onComplete={handleComplete} onRedirect={handleRedirect} />

            {completedSolution && (
              <Card className="max-w-3xl mx-auto mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-primary" />이 해결책이 도움이 되었나요?
                  </CardTitle>
                  <CardDescription>여러분의 피드백은 더 나은 해결책을 제공하는 데 도움이 됩니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  {showFeedback ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>피드백을 보내주셔서 감사합니다!</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleFeedback(true)}>
                        예, 도움이 되었습니다
                      </Button>
                      <Button variant="outline" onClick={() => handleFeedback(false)}>
                        아니오, 문제가 해결되지 않았습니다
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">문제가 해결되지 않았다면 고객센터에 문의하세요.</p>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tips">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>전기차 충전 효율성 높이기</CardTitle>
                <CardDescription>충전 시간을 단축하고 배터리 수명을 연장하는 팁</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">최적의 충전 습관</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>배터리를 20%~80% 사이로 유지하면 배터리 수명이 연장됩니다.</li>
                    <li>급속 충전은 장거리 여행 시에만 사용하고, 일상적인 충전은 완속 충전을 이용하세요.</li>
                    <li>배터리가 너무 뜨겁거나 차가울 때는 충전 속도가 느려질 수 있습니다.</li>
                    <li>충전 예약 기능을 활용하여 전기 요금이 저렴한 시간대에 충전하세요.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">충전소 이용 팁</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>충전소 도착 전에 앱으로 충전기 상태를 확인하세요.</li>
                    <li>인기 충전소는 피크 시간대를 피해 이용하세요.</li>
                    <li>충전 케이블은 꼬이지 않게 정리하여 사용하세요.</li>
                    <li>충전 완료 후에는 즉시 차량을 이동하여 다른 사용자가 이용할 수 있게 해주세요.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">배터리 관리 팁</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>장기간 주차 시 배터리를 50% 정도로 유지하세요.</li>
                    <li>극단적인 온도에서는 배터리 성능이 저하될 수 있으니 가능하면 온도가 적절한 곳에 주차하세요.</li>
                    <li>정기적인 소프트웨어 업데이트를 통해 배터리 관리 시스템을 최신 상태로 유지하세요.</li>
                    <li>급가속과 급제동을 자제하면 배터리 효율이 향상됩니다.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>자주 묻는 질문</CardTitle>
                <CardDescription>전기차 충전에 관한 일반적인 질문과 답변</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Q: 전기차 충전은 얼마나 자주 해야 하나요?</h3>
                  <p>
                    A: 일반적으로 배터리가 20% 이하로 떨어지기 전에 충전하는 것이 좋습니다. 대부분의 사용자는 2-3일에 한
                    번 또는 주행 거리에 따라 충전합니다. 매일 충전할 필요는 없으며, 배터리를 20%~80% 사이로 유지하는
                    것이 배터리 수명에 좋습니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Q: 완속 충전과 급속 충전의 차이점은 무엇인가요?</h3>
                  <p>
                    A: 완속 충전(AC)은 일반적으로 3.3kW~11kW 출력으로 4~10시간이 소요되며, 배터리에 부담이 적어 일상적인
                    충전에 적합합니다. 급속 충전(DC)은 50kW~350kW 출력으로 30분~1시간 내에 80%까지 충전 가능하지만, 자주
                    사용하면 배터리 수명에 영향을 줄 수 있습니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Q: 충전 중에 차량을 떠나도 되나요?</h3>
                  <p>
                    A: 네, 충전 중에 차량을 떠나도 됩니다. 충전 케이블은 충전 중에 잠기며, 충전이 완료되거나 중단되면
                    앱으로 알림을 받을 수 있습니다. 다만, 일부 충전소는 시간당 요금이나 주차 요금이 부과될 수 있으니
                    확인하세요.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Q: 비가 오는 날에도 충전해도 안전한가요?</h3>
                  <p>
                    A: 네, 전기차 충전 시스템은 비나 눈이 오는 날씨에도 안전하게 설계되어 있습니다. 충전 커넥터와 포트는
                    방수 처리되어 있으며, 안전 기능이 내장되어 있어 문제가 감지되면 자동으로 충전이 중단됩니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Q: 충전 중에 차량을 시동할 수 있나요?</h3>
                  <p>
                    A: 대부분의 전기차는 충전 중에 시동을 걸 수 없도록 설계되어 있습니다. 충전 케이블이 연결된 상태에서
                    시동을 걸면 충전이 자동으로 중단되거나, 차량이 움직이지 않도록 기어가 잠깁니다. 안전을 위한
                    조치입니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
