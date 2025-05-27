import { chatbotScenarios } from "@/data/chatbot-scenarios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, MessageSquare, User } from "lucide-react"

export default function ChatbotScenariosPage() {
  // 카테고리별로 시나리오 그룹화
  const categories = [...new Set(chatbotScenarios.map((scenario) => scenario.category))]

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-2">챗봇 시나리오 구성</h1>
      <p className="text-muted-foreground mb-6">EV 충전 챗봇의 다양한 대화 시나리오 예시와 핵심 기능을 확인하세요.</p>

      <Tabs defaultValue={categories[0]}>
        <TabsList className="mb-4 flex flex-wrap h-auto">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="mb-1">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            {chatbotScenarios
              .filter((scenario) => scenario.category === category)
              .map((scenario) => (
                <Card key={scenario.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{scenario.title}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 대화 내용 */}
                    <div className="space-y-4">
                      {scenario.conversations.map((conversation, index) => (
                        <div key={index} className="space-y-2">
                          {/* 사용자 메시지 */}
                          <div className="flex items-start gap-3">
                            <div className="bg-primary text-primary-foreground rounded-full p-2 mt-0.5">
                              <User className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="bg-muted p-3 rounded-lg">
                                <p>{conversation.user}</p>
                              </div>
                              {conversation.intent && (
                                <div className="flex gap-2 mt-1 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    인텐트: {conversation.intent}
                                  </Badge>
                                  {conversation.entities &&
                                    Object.entries(conversation.entities).map(([key, value]) => (
                                      <Badge key={key} variant="outline" className="text-xs">
                                        {key}: {value}
                                      </Badge>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 챗봇 응답 */}
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-500 text-white rounded-full p-2 mt-0.5">
                              <MessageSquare className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="whitespace-pre-line">{conversation.bot}</p>
                              </div>
                              {conversation.notes && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  <span className="font-medium">처리 특징:</span> {conversation.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 핵심 기능 */}
                    {scenario.keyFeatures && (
                      <div className="mt-4 pt-4 border-t">
                        <h3 className="text-sm font-medium mb-2">핵심 기능</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {scenario.keyFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
