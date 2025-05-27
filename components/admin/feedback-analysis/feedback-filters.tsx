"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react"
import type { FeedbackFilterOptions, FeedbackType, SentimentType, FeedbackCategory } from "@/types/feedback"

interface FeedbackFiltersProps {
  onApplyFilters: (filters: FeedbackFilterOptions) => void
}

export function FeedbackFilters({ onApplyFilters }: FeedbackFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | undefined>(undefined)
  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([])
  const [sentiments, setSentiments] = useState<SentimentType[]>([])
  const [categories, setCategories] = useState<FeedbackCategory[]>([])
  const [ratingRange, setRatingRange] = useState<[number, number]>([1, 5])
  const [nodeIds, setNodeIds] = useState<string>("")
  const [keywords, setKeywords] = useState<string>("")
  const [hasText, setHasText] = useState<boolean>(false)

  // 필터 적용
  const applyFilters = () => {
    const filters: FeedbackFilterOptions = {}

    if (dateRange) {
      filters.dateRange = dateRange
    }

    if (feedbackTypes.length > 0) {
      filters.feedbackTypes = feedbackTypes
    }

    if (sentiments.length > 0) {
      filters.sentiments = sentiments
    }

    if (categories.length > 0) {
      filters.categories = categories
    }

    if (ratingRange[0] > 1 || ratingRange[1] < 5) {
      filters.minRating = ratingRange[0]
      filters.maxRating = ratingRange[1]
    }

    if (nodeIds.trim()) {
      filters.nodeIds = nodeIds.split(",").map((id) => id.trim())
    }

    if (keywords.trim()) {
      filters.keywords = keywords.split(",").map((keyword) => keyword.trim())
    }

    if (hasText) {
      filters.hasText = true
    }

    onApplyFilters(filters)
    setIsOpen(false)
  }

  // 필터 초기화
  const resetFilters = () => {
    setDateRange(undefined)
    setFeedbackTypes([])
    setSentiments([])
    setCategories([])
    setRatingRange([1, 5])
    setNodeIds("")
    setKeywords("")
    setHasText(false)
    onApplyFilters({})
  }

  // 피드백 유형 토글
  const toggleFeedbackType = (type: FeedbackType) => {
    setFeedbackTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  // 감정 토글
  const toggleSentiment = (sentiment: SentimentType) => {
    setSentiments((prev) => (prev.includes(sentiment) ? prev.filter((s) => s !== sentiment) : [...prev, sentiment]))
  }

  // 카테고리 토글
  const toggleCategory = (category: FeedbackCategory) => {
    setCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]))
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <h3 className="text-lg font-medium">피드백 필터</h3>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>날짜 범위</Label>
                  <DateRangePicker value={dateRange} onChange={setDateRange} />
                </div>

                <div>
                  <Label>피드백 유형</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-rating"
                        checked={feedbackTypes.includes("rating")}
                        onCheckedChange={() => toggleFeedbackType("rating")}
                      />
                      <Label htmlFor="type-rating">평점</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-text"
                        checked={feedbackTypes.includes("text")}
                        onCheckedChange={() => toggleFeedbackType("text")}
                      />
                      <Label htmlFor="type-text">텍스트</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-choice"
                        checked={feedbackTypes.includes("choice")}
                        onCheckedChange={() => toggleFeedbackType("choice")}
                      />
                      <Label htmlFor="type-choice">선택형</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="type-suggestion"
                        checked={feedbackTypes.includes("suggestion")}
                        onCheckedChange={() => toggleFeedbackType("suggestion")}
                      />
                      <Label htmlFor="type-suggestion">제안</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>감정</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sentiment-positive"
                        checked={sentiments.includes("positive")}
                        onCheckedChange={() => toggleSentiment("positive")}
                      />
                      <Label htmlFor="sentiment-positive">긍정적</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sentiment-neutral"
                        checked={sentiments.includes("neutral")}
                        onCheckedChange={() => toggleSentiment("neutral")}
                      />
                      <Label htmlFor="sentiment-neutral">중립적</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sentiment-negative"
                        checked={sentiments.includes("negative")}
                        onCheckedChange={() => toggleSentiment("negative")}
                      />
                      <Label htmlFor="sentiment-negative">부정적</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="categories">
                    <AccordionTrigger>카테고리</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="category-usability"
                            checked={categories.includes("usability")}
                            onCheckedChange={() => toggleCategory("usability")}
                          />
                          <Label htmlFor="category-usability">사용성</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="category-accuracy"
                            checked={categories.includes("accuracy")}
                            onCheckedChange={() => toggleCategory("accuracy")}
                          />
                          <Label htmlFor="category-accuracy">정확성</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="category-speed"
                            checked={categories.includes("speed")}
                            onCheckedChange={() => toggleCategory("speed")}
                          />
                          <Label htmlFor="category-speed">속도</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="category-clarity"
                            checked={categories.includes("clarity")}
                            onCheckedChange={() => toggleCategory("clarity")}
                          />
                          <Label htmlFor="category-clarity">명확성</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="category-completeness"
                            checked={categories.includes("completeness")}
                            onCheckedChange={() => toggleCategory("completeness")}
                          />
                          <Label htmlFor="category-completeness">완전성</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="category-relevance"
                            checked={categories.includes("relevance")}
                            onCheckedChange={() => toggleCategory("relevance")}
                          />
                          <Label htmlFor="category-relevance">관련성</Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div>
                  <Label>
                    평점 범위 ({ratingRange[0]} - {ratingRange[1]})
                  </Label>
                  <Slider
                    value={ratingRange}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={setRatingRange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="node-ids">노드 ID (쉼표로 구분)</Label>
                  <Input
                    id="node-ids"
                    value={nodeIds}
                    onChange={(e) => setNodeIds(e.target.value)}
                    placeholder="예: node1, node2, node3"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">키워드 (쉼표로 구분)</Label>
                  <Input
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="예: 느림, 오류, 개선"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-text"
                    checked={hasText}
                    onCheckedChange={(checked) => setHasText(checked === true)}
                  />
                  <Label htmlFor="has-text">텍스트 포함 피드백만</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={resetFilters}>
                <X className="h-4 w-4 mr-1" />
                초기화
              </Button>
              <Button onClick={applyFilters}>
                <Filter className="h-4 w-4 mr-1" />
                필터 적용
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
