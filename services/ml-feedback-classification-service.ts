import type {
  ClassificationModel,
  ClassificationResult,
  ConfidenceLevel,
  FeedbackCategory,
  FeedbackTopic,
  ModelPerformanceMetrics,
  ModelTrainingConfig,
  ModelTrainingResult,
} from "@/types/ml-feedback"
import type { Feedback, TextFeedback, SuggestionFeedback } from "@/types/feedback"

export class MLFeedbackClassificationService {
  private static instance: MLFeedbackClassificationService
  private models: Map<string, ClassificationModel> = new Map()
  private activeModelId: string | null = null

  // 키워드 기반 분류를 위한 카테고리별 키워드 사전
  private categoryKeywords: Record<FeedbackCategory, string[]> = {
    usability: ["사용", "편리", "불편", "UI", "인터페이스", "메뉴", "버튼", "화면", "디자인", "레이아웃"],
    accuracy: ["정확", "오류", "틀림", "잘못", "맞지", "정보", "데이터", "결과", "예측"],
    speed: ["느림", "빠름", "속도", "지연", "대기", "로딩", "응답", "시간", "성능"],
    clarity: ["이해", "명확", "혼란", "복잡", "설명", "안내", "지시", "메시지", "알림"],
    completeness: ["부족", "누락", "완전", "전체", "모든", "빠짐", "추가", "더 많은", "상세"],
    relevance: ["관련", "연관", "필요", "불필요", "맞춤", "적절", "타겟", "맞지 않는"],
    other: [],
  }

  // 주제별 키워드 사전
  private topicKeywords: Record<FeedbackTopic, string[]> = {
    charging_speed: ["충전", "속도", "느림", "빠름", "시간", "급속", "완속", "대기"],
    app_usability: ["앱", "사용성", "UI", "화면", "메뉴", "버튼", "인터페이스", "디자인"],
    payment_issues: ["결제", "지불", "카드", "오류", "실패", "환불", "청구", "비용"],
    station_availability: ["충전소", "이용", "가능", "사용중", "고장", "위치", "찾기", "예약"],
    connection_problems: ["연결", "케이블", "플러그", "소켓", "분리", "인식", "통신"],
    account_issues: ["계정", "로그인", "가입", "비밀번호", "인증", "프로필", "설정"],
    ui_design: ["디자인", "레이아웃", "색상", "폰트", "아이콘", "시각", "보기", "테마"],
    feature_request: ["기능", "추가", "요청", "새로운", "개선", "업데이트", "제안"],
    bug_report: ["버그", "오류", "문제", "크래시", "멈춤", "작동", "실패", "고장"],
    performance: ["성능", "속도", "최적화", "느림", "배터리", "메모리", "소모", "효율"],
    documentation: ["설명", "도움말", "가이드", "문서", "튜토리얼", "안내", "정보"],
    customer_service: ["고객", "서비스", "지원", "응대", "상담", "문의", "답변", "채팅"],
    pricing: ["가격", "요금", "비용", "할인", "무료", "유료", "결제", "구독"],
    other: [],
  }

  private constructor() {
    this.initializeDummyModels()
  }

  public static getInstance(): MLFeedbackClassificationService {
    if (!MLFeedbackClassificationService.instance) {
      MLFeedbackClassificationService.instance = new MLFeedbackClassificationService()
    }
    return MLFeedbackClassificationService.instance
  }

  // 피드백 분류
  public classifyFeedback(feedback: Feedback): ClassificationResult | null {
    // 텍스트가 있는 피드백만 분류
    if (feedback.type !== "text" && feedback.type !== "suggestion") {
      return null
    }

    const textContent =
      feedback.type === "text" ? (feedback as TextFeedback).text : (feedback as SuggestionFeedback).suggestion

    // 활성 모델이 없는 경우 키워드 기반 분류 사용
    if (!this.activeModelId) {
      return this.classifyWithKeywords(textContent)
    }

    // 활성 모델 가져오기
    const activeModel = this.models.get(this.activeModelId)
    if (!activeModel) {
      return this.classifyWithKeywords(textContent)
    }

    // 모델 유형에 따른 분류 수행
    switch (activeModel.type) {
      case "naive-bayes":
        return this.classifyWithNaiveBayes(textContent, activeModel)
      case "random-forest":
        return this.classifyWithRandomForest(textContent, activeModel)
      case "neural-network":
        return this.classifyWithNeuralNetwork(textContent, activeModel)
      case "ensemble":
        return this.classifyWithEnsemble(textContent)
      default:
        return this.classifyWithKeywords(textContent)
    }
  }

  // 키워드 기반 분류 (기본 분류 방법)
  private classifyWithKeywords(text: string): ClassificationResult {
    const normalizedText = text.toLowerCase()

    // 카테고리 점수 계산
    const categoryScores: Record<FeedbackCategory, number> = {
      usability: 0,
      accuracy: 0,
      speed: 0,
      clarity: 0,
      completeness: 0,
      relevance: 0,
      other: 0,
    }

    // 각 카테고리별 키워드 매칭 점수 계산
    Object.entries(this.categoryKeywords).forEach(([category, keywords]) => {
      keywords.forEach((keyword) => {
        if (normalizedText.includes(keyword.toLowerCase())) {
          categoryScores[category as FeedbackCategory] += 1
        }
      })
    })

    // 가장 높은 점수의 카테고리 선택
    let maxScore = 0
    let selectedCategory: FeedbackCategory = "other"

    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score > maxScore) {
        maxScore = score
        selectedCategory = category as FeedbackCategory
      }
    })

    // 주제 점수 계산
    const topicScores: Record<FeedbackTopic, number> = {} as Record<FeedbackTopic, number>

    Object.entries(this.topicKeywords).forEach(([topic, keywords]) => {
      topicScores[topic as FeedbackTopic] = 0
      keywords.forEach((keyword) => {
        if (normalizedText.includes(keyword.toLowerCase())) {
          topicScores[topic as FeedbackTopic] += 1
        }
      })
    })

    // 상위 3개 주제 선택
    const topTopics = Object.entries(topicScores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic, score]) => ({
        topic: topic as FeedbackTopic,
        confidence: Math.min(score / 5, 1), // 최대 1.0
      }))

    // 신뢰도 수준 결정
    let confidenceLevel: ConfidenceLevel = "low"
    if (maxScore >= 3) {
      confidenceLevel = "high"
    } else if (maxScore >= 1) {
      confidenceLevel = "medium"
    }

    return {
      category: selectedCategory,
      topics: topTopics.length > 0 ? topTopics : [{ topic: "other", confidence: 0.5 }],
      confidenceLevel,
      modelUsed: "naive-bayes", // 키워드 기반이지만 모델 타입은 naive-bayes로 설정
      classificationTime: new Date(),
    }
  }

  // 나이브 베이즈 분류
  private classifyWithNaiveBayes(text: string, model: ClassificationModel): ClassificationResult {
    // 실제 구현에서는 학습된 나이브 베이즈 모델 사용
    // 여기서는 키워드 기반 분류에 약간의 무작위성 추가
    const baseResult = this.classifyWithKeywords(text)

    // 신뢰도에 약간의 변동 추가
    baseResult.topics = baseResult.topics.map((topic) => ({
      ...topic,
      confidence: Math.min(topic.confidence * (0.8 + Math.random() * 0.4), 1),
    }))

    baseResult.modelUsed = "naive-bayes"
    return baseResult
  }

  // 랜덤 포레스트 분류
  private classifyWithRandomForest(text: string, model: ClassificationModel): ClassificationResult {
    // 실제 구현에서는 학습된 랜덤 포레스트 모델 사용
    // 여기서는 키워드 기반 분류에 약간의 무작위성 추가
    const baseResult = this.classifyWithKeywords(text)

    // 신뢰도에 약간의 변동 추가 (랜덤 포레스트는 일반적으로 더 높은 신뢰도)
    baseResult.topics = baseResult.topics.map((topic) => ({
      ...topic,
      confidence: Math.min(topic.confidence * (0.9 + Math.random() * 0.3), 1),
    }))

    // 신뢰도 수준 상향 조정
    if (baseResult.confidenceLevel === "low") {
      baseResult.confidenceLevel = "medium"
    } else if (baseResult.confidenceLevel === "medium" && Math.random() > 0.3) {
      baseResult.confidenceLevel = "high"
    }

    baseResult.modelUsed = "random-forest"
    return baseResult
  }

  // 신경망 분류
  private classifyWithNeuralNetwork(text: string, model: ClassificationModel): ClassificationResult {
    // 실제 구현에서는 학습된 신경망 모델 사용
    // 여기서는 키워드 기반 분류에 약간의 무작위성 추가
    const baseResult = this.classifyWithKeywords(text)

    // 신뢰도에 약간의 변동 추가 (신경망은 일반적으로 더 높은 신뢰도)
    baseResult.topics = baseResult.topics.map((topic) => ({
      ...topic,
      confidence: Math.min(topic.confidence * (0.95 + Math.random() * 0.2), 1),
    }))

    // 신뢰도 수준 상향 조정
    if (Math.random() > 0.2) {
      baseResult.confidenceLevel = "high"
    }

    baseResult.modelUsed = "neural-network"
    return baseResult
  }

  // 앙상블 분류 (여러 모델의 결과 조합)
  private classifyWithEnsemble(text: string): ClassificationResult {
    // 각 모델별 분류 결과 수집
    const naiveBayesResult = this.classifyWithKeywords(text)
    naiveBayesResult.modelUsed = "naive-bayes"

    const randomForestResult = { ...naiveBayesResult }
    randomForestResult.modelUsed = "random-forest"
    randomForestResult.topics = randomForestResult.topics.map((topic) => ({
      ...topic,
      confidence: Math.min(topic.confidence * (0.9 + Math.random() * 0.3), 1),
    }))

    const neuralNetworkResult = { ...naiveBayesResult }
    neuralNetworkResult.modelUsed = "neural-network"
    neuralNetworkResult.topics = neuralNetworkResult.topics.map((topic) => ({
      ...topic,
      confidence: Math.min(topic.confidence * (0.95 + Math.random() * 0.2), 1),
    }))

    // 카테고리 투표
    const categoryVotes: Record<FeedbackCategory, number> = {
      usability: 0,
      accuracy: 0,
      speed: 0,
      clarity: 0,
      completeness: 0,
      relevance: 0,
      other: 0,
    }

    categoryVotes[naiveBayesResult.category] += 1
    categoryVotes[randomForestResult.category] += 1
    categoryVotes[neuralNetworkResult.category] += 1

    // 가장 많은 투표를 받은 카테고리 선택
    let maxVotes = 0
    let selectedCategory: FeedbackCategory = "other"

    Object.entries(categoryVotes).forEach(([category, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes
        selectedCategory = category as FeedbackCategory
      }
    })

    // 주제 신뢰도 평균 계산
    const allTopics = [...naiveBayesResult.topics, ...randomForestResult.topics, ...neuralNetworkResult.topics]

    const topicConfidences: Record<FeedbackTopic, { sum: number; count: number }> = {} as Record<
      FeedbackTopic,
      { sum: number; count: number }
    >

    allTopics.forEach(({ topic, confidence }) => {
      if (!topicConfidences[topic]) {
        topicConfidences[topic] = { sum: 0, count: 0 }
      }
      topicConfidences[topic].sum += confidence
      topicConfidences[topic].count += 1
    })

    const averagedTopics = Object.entries(topicConfidences)
      .map(([topic, { sum, count }]) => ({
        topic: topic as FeedbackTopic,
        confidence: sum / count,
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)

    // 신뢰도 수준 결정
    let confidenceLevel: ConfidenceLevel = "low"
    if (maxVotes === 3) {
      confidenceLevel = "high" // 모든 모델이 동의
    } else if (maxVotes === 2) {
      confidenceLevel = "medium" // 2개 모델이 동의
    }

    return {
      category: selectedCategory,
      topics: averagedTopics,
      confidenceLevel,
      modelUsed: "ensemble",
      classificationTime: new Date(),
    }
  }

  // 모델 학습
  public trainModel(config: ModelTrainingConfig): Promise<ModelTrainingResult> {
    return new Promise((resolve) => {
      // 실제 구현에서는 여기서 모델 학습 수행
      // 여기서는 더미 결과 반환

      setTimeout(() => {
        const modelId = `model_${Date.now()}`
        const startTime = new Date()
        const endTime = new Date(startTime.getTime() + 5000) // 5초 후

        const performance: ModelPerformanceMetrics = {
          accuracy: 0.75 + Math.random() * 0.2,
          precision: 0.7 + Math.random() * 0.25,
          recall: 0.65 + Math.random() * 0.3,
          f1Score: 0.7 + Math.random() * 0.25,
          confusionMatrix: [
            [85, 5, 10],
            [10, 80, 10],
            [15, 10, 75],
          ],
          lastEvaluated: endTime,
          sampleSize: 1000,
        }

        const result: ModelTrainingResult = {
          modelId,
          modelType: config.modelType,
          trainingStartTime: startTime,
          trainingEndTime: endTime,
          iterations: 100,
          performance,
          config,
        }

        // 모델 저장
        this.models.set(modelId, {
          id: modelId,
          name: `${config.modelType} Model ${new Date().toISOString().split("T")[0]}`,
          description: `Automatically trained ${config.modelType} model`,
          type: config.modelType,
          version: "1.0.0",
          createdAt: startTime,
          updatedAt: endTime,
          trainedBy: "system",
          isActive: false,
          performance,
          config,
        })

        resolve(result)
      }, 2000) // 2초 지연으로 학습 시간 시뮬레이션
    })
  }

  // 모델 활성화
  public activateModel(modelId: string): boolean {
    if (!this.models.has(modelId)) {
      return false
    }

    // 기존 활성 모델 비활성화
    if (this.activeModelId) {
      const currentActiveModel = this.models.get(this.activeModelId)
      if (currentActiveModel) {
        currentActiveModel.isActive = false
        this.models.set(this.activeModelId, currentActiveModel)
      }
    }

    // 새 모델 활성화
    const model = this.models.get(modelId)!
    model.isActive = true
    this.models.set(modelId, model)
    this.activeModelId = modelId

    return true
  }

  // 모델 목록 조회
  public getModels(): ClassificationModel[] {
    return Array.from(this.models.values())
  }

  // 모델 상세 조회
  public getModel(modelId: string): ClassificationModel | null {
    return this.models.get(modelId) || null
  }

  // 활성 모델 조회
  public getActiveModel(): ClassificationModel | null {
    if (!this.activeModelId) {
      return null
    }
    return this.models.get(this.activeModelId) || null
  }

  // 모델 삭제
  public deleteModel(modelId: string): boolean {
    if (!this.models.has(modelId)) {
      return false
    }

    // 활성 모델인 경우 활성 상태 해제
    if (this.activeModelId === modelId) {
      this.activeModelId = null
    }

    return this.models.delete(modelId)
  }

  // 모델 성능 평가
  public evaluateModel(modelId: string): Promise<ModelPerformanceMetrics> {
    return new Promise((resolve, reject) => {
      const model = this.models.get(modelId)
      if (!model) {
        reject(new Error("Model not found"))
        return
      }

      // 실제 구현에서는 여기서 모델 평가 수행
      // 여기서는 더미 결과 반환
      setTimeout(() => {
        const performance: ModelPerformanceMetrics = {
          accuracy: 0.75 + Math.random() * 0.2,
          precision: 0.7 + Math.random() * 0.25,
          recall: 0.65 + Math.random() * 0.3,
          f1Score: 0.7 + Math.random() * 0.25,
          confusionMatrix: [
            [85, 5, 10],
            [10, 80, 10],
            [15, 10, 75],
          ],
          lastEvaluated: new Date(),
          sampleSize: 1000,
        }

        // 모델 성능 업데이트
        model.performance = performance
        model.updatedAt = new Date()
        this.models.set(modelId, model)

        resolve(performance)
      }, 1500) // 1.5초 지연으로 평가 시간 시뮬레이션
    })
  }

  // 더미 모델 초기화
  private initializeDummyModels() {
    const basePerformance: ModelPerformanceMetrics = {
      accuracy: 0.82,
      precision: 0.79,
      recall: 0.77,
      f1Score: 0.78,
      confusionMatrix: [
        [90, 5, 5],
        [10, 85, 5],
        [5, 10, 85],
      ],
      lastEvaluated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1주일 전
      sampleSize: 1000,
    }

    const baseConfig: ModelTrainingConfig = {
      modelType: "naive-bayes",
      trainingDataPercentage: 0.8,
      features: ["text", "category", "sentiment"],
      hyperparameters: {},
      balanceClasses: true,
    }

    // 나이브 베이즈 모델
    const naiveBayesModel: ClassificationModel = {
      id: "model_naive_bayes_1",
      name: "기본 나이브 베이즈 분류기",
      description: "텍스트 피드백 분류를 위한 기본 나이브 베이즈 모델",
      type: "naive-bayes",
      version: "1.0.0",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      trainedBy: "system",
      isActive: true,
      performance: { ...basePerformance, accuracy: 0.78, precision: 0.75 },
      config: { ...baseConfig, modelType: "naive-bayes" },
    }

    // 랜덤 포레스트 모델
    const randomForestModel: ClassificationModel = {
      id: "model_random_forest_1",
      name: "고급 랜덤 포레스트 분류기",
      description: "더 높은 정확도를 위한 랜덤 포레스트 모델",
      type: "random-forest",
      version: "1.0.0",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15일 전
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      trainedBy: "system",
      isActive: false,
      performance: { ...basePerformance, accuracy: 0.85, precision: 0.83 },
      config: {
        ...baseConfig,
        modelType: "random-forest",
        hyperparameters: {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 5,
        },
      },
    }

    // 신경망 모델
    const neuralNetworkModel: ClassificationModel = {
      id: "model_neural_network_1",
      name: "딥러닝 텍스트 분류기",
      description: "복잡한 패턴 인식을 위한 신경망 모델",
      type: "neural-network",
      version: "1.0.0",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5일 전
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      trainedBy: "system",
      isActive: false,
      performance: { ...basePerformance, accuracy: 0.88, precision: 0.86 },
      config: {
        ...baseConfig,
        modelType: "neural-network",
        hyperparameters: {
          hidden_layers: [64, 32],
          dropout: 0.2,
          learning_rate: 0.001,
          epochs: 50,
        },
      },
    }

    // 앙상블 모델
    const ensembleModel: ClassificationModel = {
      id: "model_ensemble_1",
      name: "앙상블 분류기",
      description: "여러 모델의 결과를 조합한 앙상블 모델",
      type: "ensemble",
      version: "1.0.0",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      trainedBy: "system",
      isActive: false,
      performance: { ...basePerformance, accuracy: 0.9, precision: 0.89 },
      config: {
        ...baseConfig,
        modelType: "ensemble",
        hyperparameters: {
          models: ["naive-bayes", "random-forest", "neural-network"],
          voting: "soft",
        },
      },
    }

    // 모델 저장
    this.models.set(naiveBayesModel.id, naiveBayesModel)
    this.models.set(randomForestModel.id, randomForestModel)
    this.models.set(neuralNetworkModel.id, neuralNetworkModel)
    this.models.set(ensembleModel.id, ensembleModel)

    // 활성 모델 설정
    this.activeModelId = naiveBayesModel.id
  }
}

// 서비스 인스턴스 내보내기
export const mlFeedbackClassificationService = MLFeedbackClassificationService.getInstance()
