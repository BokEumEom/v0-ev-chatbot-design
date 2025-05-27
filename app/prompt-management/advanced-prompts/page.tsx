import { AdvancedPromptTester } from "@/components/advanced-prompt-tester"

export default function AdvancedPromptsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">고급 프롬프트 관리</h1>
      <p className="text-gray-500 mb-8">
        대화 지속성을 강화한 고급 프롬프트를 생성하고 테스트합니다. 이 도구를 사용하여 AI 챗봇의 대화 능력을 향상시킬 수
        있습니다.
      </p>

      <div className="grid gap-8">
        <AdvancedPromptTester />
      </div>
    </div>
  )
}
