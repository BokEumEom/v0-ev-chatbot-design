import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ApiDocumentation() {
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>API 문서</CardTitle>
        <CardDescription>Gemini 2.0 Flash API 엔드포인트 사용 방법</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chat-api">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat-api">고객지원 API</TabsTrigger>
            <TabsTrigger value="direct-api">직접 호출 API</TabsTrigger>
          </TabsList>
          <TabsContent value="chat-api">
            <Card>
              <CardHeader>
                <CardTitle>고객지원 API</CardTitle>
                <CardDescription>고객지원 컨텍스트를 포함한 Gemini 2.0 Flash API 호출</CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">엔드포인트</h3>
                <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                  <code>POST /api/chat</code>
                </pre>

                <h3 className="text-lg font-semibold mt-4 mb-2">요청 본문</h3>
                <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                  <code>{`{
  "message": "고객 문의 내용"
}`}</code>
                </pre>

                <h3 className="text-lg font-semibold mt-4 mb-2">응답</h3>
                <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                  <code>{`{
  "response": "AI 응답 내용"
}`}</code>
                </pre>

                <h3 className="text-lg font-semibold mt-4 mb-2">예제</h3>
                <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                  <code>{`curl -X POST http://localhost:3000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "배송 상태를 확인하고 싶습니다."}'`}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="direct-api">
            <Card>
              <CardHeader>
                <CardTitle>직접 호출 API</CardTitle>
                <CardDescription>Google의 Gemini API를 직접 호출하는 방법</CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">엔드포인트</h3>
                <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                  <code>POST /api/gemini-direct</code>
                </pre>

                <h3 className="text-lg font-semibold mt-4 mb-2">요청 본문</h3>
                <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                  <code>{`{
  "contents": [{
    "parts":[{"text": "질문 내용"}]
  }],
  "generationConfig": {
    "temperature": 0.2,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 1024
  }
}`}</code>
                </pre>

                <h3 className="text-lg font-semibold mt-4 mb-2">응답</h3>
                <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                  <code>{`{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "AI 응답 내용"
          }
        ]
      },
      "finishReason": "STOP",
      "index": 0
    }
  ]
}`}</code>
                </pre>

                <h3 className="text-lg font-semibold mt-4 mb-2">예제</h3>
                <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                  <code>{`curl -X POST http://localhost:3000/api/gemini-direct \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [{
      "parts":[{"text": "AI란 무엇인가요?"}]
    }]
  }'`}</code>
                </pre>

                <h3 className="text-lg font-semibold mt-4 mb-2">원본 Google API</h3>
                <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                  <code>{`curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \\
  -H 'Content-Type: application/json' \\
  -X POST \\
  -d '{
    "contents": [{
      "parts":[{"text": "AI란 무엇인가요?"}]
    }]
  }'`}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
