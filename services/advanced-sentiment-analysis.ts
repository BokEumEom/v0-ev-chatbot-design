import type { Feedback, SentimentType, TextFeedback, SuggestionFeedback } from "@/types/feedback"

// 감정 분석 결과 확장 타입
export interface DetailedSentimentAnalysis {
  sentiment: SentimentType
  confidence: number // 0-1 사이의 신뢰도
  aspects: {
    [key: string]: {
      sentiment: SentimentType
      score: number // -1에서 1 사이의 점수
      mentions: string[] // 관련 텍스트 부분
    }
  }
  language: string
  keywords: {
    word: string
    sentiment: SentimentType
    importance: number // 0-1 사이의 중요도
  }[]
}

export class AdvancedSentimentAnalysisService {
  private static instance: AdvancedSentimentAnalysisService

  private constructor() {}

  public static getInstance(): AdvancedSentimentAnalysisService {
    if (!AdvancedSentimentAnalysisService.instance) {
      AdvancedSentimentAnalysisService.instance = new AdvancedSentimentAnalysisService()
    }
    return AdvancedSentimentAnalysisService.instance
  }

  // 텍스트 기반 피드백 분석
  public analyzeText(text: string, language = "ko"): DetailedSentimentAnalysis {
    // 실제 구현에서는 NLP API 호출 또는 라이브러리 사용
    // 여기서는 간단한 구현으로 대체

    const positiveWords = {
      ko: ["좋", "만족", "도움", "감사", "편리", "쉽", "빠르", "정확", "유용", "추천", "훌륭", "최고"],
      en: ["good", "great", "excellent", "helpful", "convenient", "easy", "fast", "accurate", "useful", "recommend"],
    }

    const negativeWords = {
      ko: ["나쁨", "불만", "어려움", "복잡", "느림", "오류", "문제", "불편", "혼란", "실패", "최악", "별로"],
      en: ["bad", "poor", "difficult", "complex", "slow", "error", "problem", "inconvenient", "confusing", "failure"],
    }

    // 언어 감지 (실제로는 더 정교한 알고리즘 필요)
    const detectedLanguage = this.detectLanguage(text) || language

    // 사용할 단어 목록
    const posWords = positiveWords[detectedLanguage as keyof typeof positiveWords] || positiveWords.en
    const negWords = negativeWords[detectedLanguage as keyof typeof negativeWords] || negativeWords.en

    // 감정 점수 계산
    let positiveScore = 0
    let negativeScore = 0
    let totalScore = 0

    // 키워드 추출 및 감정 분석
    const keywords: DetailedSentimentAnalysis["keywords"] = []
    const aspects: DetailedSentimentAnalysis["aspects"] = {}

    // 텍스트를 단어로 분리
    const words = text.toLowerCase().split(/\s+/)

    // 각 단어에 대한 감정 분석
    words.forEach((word) => {
      // 긍정적 단어 확인
      const posMatch = posWords.some((pw) => word.includes(pw))
      if (posMatch) {
        positiveScore++
        keywords.push({
          word,
          sentiment: "positive",
          importance: 0.7 + Math.random() * 0.3, // 0.7-1.0 사이의 중요도
        })
      }

      // 부정적 단어 확인
      const negMatch = negWords.some((nw) => word.includes(nw))
      if (negMatch) {
        negativeScore++
        keywords.push({
          word,
          sentiment: "negative",
          importance: 0.7 + Math.random() * 0.3,
        })
      }

      // 중립적 단어는 무시
    })

    // 전체 감정 점수 계산
    totalScore = positiveScore - negativeScore

    // 주요 측면(aspect) 분석
    // 실제 구현에서는 더 정교한 알고리즘 필요
    const aspectKeywords = {
      사용성: ["사용", "인터페이스", "UI", "화면", "버튼", "조작"],
      성능: ["속도", "빠르", "느리", "버벅", "반응", "성능"],
      정확성: ["정확", "오류", "에러", "버그", "문제", "정확도"],
      디자인: ["디자인", "예쁘", "보기", "색상", "레이아웃"],
    }

    Object.entries(aspectKeywords).forEach(([aspect, keywords]) => {
      let aspectScore = 0
      const mentions: string[] = []

      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          // 해당 키워드 주변 텍스트 추출 (실제로는 더 정교한 알고리즘 필요)
          const index = text.indexOf(keyword)
          const start = Math.max(0, index - 10)
          const end = Math.min(text.length, index + keyword.length + 10)
          const mention = text.substring(start, end)

          mentions.push(mention)

          // 해당 키워드가 긍정적인지 부정적인지 확인
          const isPositive = posWords.some((pw) => mention.includes(pw))
          const isNegative = negWords.some((nw) => mention.includes(nw))

          if (isPositive) aspectScore += 1
          if (isNegative) aspectScore -= 1
        }
      })

      if (mentions.length > 0) {
        aspects[aspect] = {
          sentiment: aspectScore > 0 ? "positive" : aspectScore < 0 ? "negative" : "neutral",
          score: Math.max(-1, Math.min(1, aspectScore / mentions.length)), // -1에서 1 사이로 정규화
          mentions,
        }
      }
    })

    // 최종 감정 결정
    let sentiment: SentimentType
    if (totalScore > 0) {
      sentiment = "positive"
    } else if (totalScore < 0) {
      sentiment = "negative"
    } else {
      sentiment = "neutral"
    }

    // 신뢰도 계산 (단순화된 버전)
    const confidence = Math.min(1, (Math.abs(totalScore) + 1) / (words.length / 2))

    return {
      sentiment,
      confidence,
      aspects,
      language: detectedLanguage,
      keywords,
    }
  }

  // 피드백 객체 분석
  public analyzeFeedback(feedback: Feedback): DetailedSentimentAnalysis | null {
    if (feedback.type === "text") {
      return this.analyzeText((feedback as TextFeedback).text)
    } else if (feedback.type === "suggestion") {
      return this.analyzeText((feedback as SuggestionFeedback).suggestion)
    } else if (feedback.type === "rating") {
      // 평점은 이미 감정이 명확하므로 간단한 분석만 수행
      const rating = (feedback as any).rating as number
      const sentiment: SentimentType = rating >= 4 ? "positive" : rating <= 2 ? "negative" : "neutral"

      return {
        sentiment,
        confidence: 0.9, // 평점은 직접적인 감정 표현이므로 높은 신뢰도
        aspects: {},
        language: "ko", // 기본값
        keywords: [],
      }
    } else if (feedback.type === "choice") {
      // 선택형 피드백은 선택지에 따라 감정 결정
      // 실제 구현에서는 선택지의 의미를 분석해야 함
      return null
    }

    return null
  }

  // 언어 감지 (간단한 구현)
  private detectLanguage(text: string): string | null {
    // 한글 포함 여부 확인
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)
    if (hasKorean) return "ko"

    // 영어 포함 여부 확인
    const hasEnglish = /[a-zA-Z]/.test(text)
    if (hasEnglish) return "en"

    // 기타 언어는 null 반환 (실제로는 더 많은 언어 지원 필요)
    return null
  }
}

export const advancedSentimentAnalysisService = AdvancedSentimentAnalysisService.getInstance()
