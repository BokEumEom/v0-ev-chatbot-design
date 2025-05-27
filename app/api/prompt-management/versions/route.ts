import { NextResponse } from "next/server"

// 샘플 데이터 (실제 구현에서는 데이터베이스 사용)
const promptVersions = [
  {
    id: "version_1",
    name: "기본 프롬프트",
    version: "1.0.0",
    description: "전기차 충전소 챗봇의 기본 시스템 프롬프트",
    createdAt: "2023-01-15T09:00:00Z",
    createdBy: "admin",
    systemPrompt: `당신은 전기차 충전소 운영 회사 '차지코리아(ChargeKorea)'의 AI 고객 지원 어시스턴트 '차지봇(ChargeBot)'입니다.

## 역할과 책임
1. 충전소 이용 관련 질문에 정확하고 친절하게 답변
2. 충전기 고장 신고 접수 및 대안 제시
3. 충전 방법 안내 및 문제 해결 지원
4. 결제 관련 문의 응대
5. 충전 이력 및 통계 정보 안내
6. 충전소 위치 및 이용 가능 여부 안내

## 응답 지침
- 항상 정중하고 전문적인 어조 유지하되, 친근감 있게 대화
- 간결하고 명확한 정보 제공 (150단어 이내)
- 단계별 안내가 필요한 경우 번호 매기기 사용 (1️⃣, 2️⃣, 3️⃣ 등)
- 이모티콘을 적절히 사용하여 친근감 제공 (과도하게 사용하지 않음)
- 해결할 수 없는 문제는 고객센터 연결 안내 (전화: 1588-0000)
- 개인정보 보호 규정 준수 (주민번호, 카드번호 등 요구하지 않음)
- 사용자의 감정에 공감하고, 불편함에 대해 진심 어린 사과 표현
- 정확한 정보만 제공하고, 불확실한 정보는 제공하지 않음`,
    targetIntents: [
      "charger_issue",
      "usage_guide",
      "find_charger",
      "payment_issue",
      "charging_history",
      "pricing_inquiry",
      "membership_inquiry",
      "general_inquiry",
    ],
    changeLog: "초기 버전",
    status: "active",
    performance: {
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
  {
    id: "version_2",
    name: "개선된 충전기 문제 해결",
    version: "1.1.0",
    description: "충전기 문제 해결 응답의 명확성과 해결책 제시 개선",
    createdAt: "2023-02-20T10:15:00Z",
    createdBy: "admin",
    systemPrompt: `당신은 전기차 충전소 운영 회사 '차지코리아(ChargeKorea)'의 AI 고객 지원 어시스턴트 '차지봇(ChargeBot)'입니다.

## 역할과 책임
1. 충전소 이용 관련 질문에 정확하고 친절하게 답변
2. 충전기 고장 신고 접수 및 대안 제시
3. 충전 방법 안내 및 문제 해결 지원
4. 결제 관련 문의 응대
5. 충전 이력 및 통계 정보 안내
6. 충전소 위치 및 이용 가능 여부 안내

## 응답 지침
- 항상 정중하고 전문적인 어조 유지하되, 친근감 있게 대화
- 간결하고 명확한 정보 제공 (150단어 이내)
- 단계별 안내가 필요한 경우 번호 매기기 사용 (1️⃣, 2️⃣, 3️⃣ 등)
- 이모티콘을 적절히 사용하여 친근감 제공 (과도하게 사용하지 않음)
- 해결할 수 없는 문제는 고객센터 연결 안내 (전화: 1588-0000)
- 개인정보 보호 규정 준수 (주민번호, 카드번호 등 요구하지 않음)
- 사용자의 감정에 공감하고, 불편함에 대해 진심 어린 사과 표현
- 정확한 정보만 제공하고, 불확실한 정보는 제공하지 않음

## 충전기 문제 해결 지침
1. 문제 상황에 대한 공감 표현으로 시작
2. 충전기 번호와 위치 확인
3. 일반적인 문제해결 단계 안내 (재시도, 앱 재시작 등)
4. 문제가 지속될 경우 대체 충전소 추천 (3곳 이내, 거리순)
5. 고장 신고 접수 방법 안내
6. 추가 지원이 필요한 경우 고객센터 연결 방법 안내`,
    targetIntents: ["charger_issue"],
    changeLog:
      "1. 충전기 문제 해결을 위한 상세 지침 추가\n2. 단계별 문제해결 프로세스 개선\n3. 대체 충전소 추천 로직 추가",
    baseVersion: "version_1",
    status: "inactive",
    performance: {
      qualityScore: 9.1,
      userRating: 4.5,
      latency: 380,
      tokenUsage: 550,
      intentSuccessRates: {
        charger_issue: 0.96,
      },
      sampleSize: 450,
      lastUpdated: "2023-03-15T11:20:00Z",
    },
  },
]

// 프롬프트 버전 목록 조회
export async function GET() {
  return NextResponse.json(promptVersions)
}

// 새 프롬프트 버전 추가
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 필수 필드 검증
    if (!body.name || !body.version || !body.systemPrompt || !body.targetIntents) {
      return NextResponse.json({ error: "필수 필드가 누락되었습니다" }, { status: 400 })
    }

    // 새 버전 생성
    const newVersion = {
      id: `version_${Date.now()}`,
      name: body.name,
      version: body.version,
      description: body.description || "",
      createdAt: new Date().toISOString(),
      createdBy: "current_user", // 실제 구현에서는 인증된 사용자 정보 사용
      systemPrompt: body.systemPrompt,
      targetIntents: body.targetIntents,
      changeLog: body.changeLog || "",
      baseVersion: body.baseVersion || undefined,
      status: "draft" as const,
    }

    // 버전 목록에 추가
    promptVersions.push(newVersion)

    return NextResponse.json(newVersion)
  } catch (error) {
    console.error("프롬프트 버전 추가 오류:", error)
    return NextResponse.json({ error: "프롬프트 버전 추가 중 오류가 발생했습니다" }, { status: 500 })
  }
}
