"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { ConversationAnalyticsFilters } from "@/types/conversation-analytics"

interface ConversationFiltersProps {
  onChange: (filters: ConversationAnalyticsFilters) => void
}

export function ConversationFilters({ onChange }: ConversationFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<ConversationAnalyticsFilters>({
    resolutionStatus: "all",
  })

  // 이슈 타입 옵션
  const issueTypeOptions = [
    { id: "charging_start", label: "충전이 시작되지 않음" },
    { id: "charging_error", label: "충전 중 오류 발생" },
    { id: "payment", label: "결제 문제" },
    { id: "app_connection", label: "앱 연결 문제" },
    { id: "charging_speed", label: "충전 속도 저하" },
    { id: "account", label: "계정 문제" },
    { id: "location", label: "충전소 위치 문제" },
    { id: "reservation", label: "예약 문제" },
  ]

  // 기기 타입 옵션
  const deviceTypeOptions = [
    { id: "mobile", label: "모바일" },
    { id: "desktop", label: "데스크톱" },
    { id: "tablet", label: "태블릿" },
    { id: "unknown", label: "알 수 없음" },
  ]

  // 이슈 타입 변경 처리
  const handleIssueTypeChange = (issueType: string, checked: boolean) => {
    setFilters((prev) => {
      const currentIssueTypes = prev.issueTypes || []
      let newIssueTypes: string[]

      if (checked) {
        newIssueTypes = [...currentIssueTypes, issueType]
      } else {
        newIssueTypes = currentIssueTypes.filter((type) => type !== issueType)
      }

      return {
        ...prev,
        issueTypes: newIssueTypes.length > 0 ? newIssueTypes : undefined,
      }
    })
  }

  // 기기 타입 변경 처리
  const handleDeviceTypeChange = (deviceType: string, checked: boolean) => {
    setFilters((prev) => {
      const currentDeviceTypes = prev.deviceTypes || []
      let newDeviceTypes: string[]

      if (checked) {
        newDeviceTypes = [...currentDeviceTypes, deviceType]
      } else {
        newDeviceTypes = currentDeviceTypes.filter((type) => type !== deviceType)
      }

      return {
        ...prev,
        deviceTypes: newDeviceTypes.length > 0 ? (newDeviceTypes as any) : undefined,
      }
    })
  }

  // 해결 상태 변경 처리
  const handleResolutionStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      resolutionStatus: value as "resolved" | "unresolved" | "all",
    }))
  }

  // 만족도 범위 변경 처리
  const handleSatisfactionRangeChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      satisfactionRange: {
        min: value[0],
        max: value[1],
      },
    }))
  }

  // 상담원 연결 변경 처리
  const handleTransferredToAgentChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      transferredToAgent: value === "yes" ? true : value === "no" ? false : undefined,
    }))
  }

  // 필터 적용
  const applyFilters = () => {
    onChange(filters)
  }

  // 필터 초기화
  const resetFilters = () => {
    const newFilters: ConversationAnalyticsFilters = {
      resolutionStatus: "all",
    }
    setFilters(newFilters)
    onChange(newFilters)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">필터</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="ml-2">{isOpen ? "접기" : "펼치기"}</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <Card className="mt-2">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 이슈 타입 필터 */}
              <div>
                <h4 className="font-medium mb-3">이슈 타입</h4>
                <div className="space-y-2">
                  {issueTypeOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`issue-${option.id}`}
                        checked={filters.issueTypes?.includes(option.id) || false}
                        onCheckedChange={(checked) => handleIssueTypeChange(option.id, checked === true)}
                      />
                      <Label htmlFor={`issue-${option.id}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 해결 상태 및 기기 타입 필터 */}
              <div className="space-y-6">
                {/* 해결 상태 필터 */}
                <div>
                  <h4 className="font-medium mb-3">해결 상태</h4>
                  <RadioGroup value={filters.resolutionStatus || "all"} onValueChange={handleResolutionStatusChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="resolution-all" />
                      <Label htmlFor="resolution-all">전체</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="resolved" id="resolution-resolved" />
                      <Label htmlFor="resolution-resolved">해결됨</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unresolved" id="resolution-unresolved" />
                      <Label htmlFor="resolution-unresolved">미해결</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* 기기 타입 필터 */}
                <div>
                  <h4 className="font-medium mb-3">기기 타입</h4>
                  <div className="space-y-2">
                    {deviceTypeOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`device-${option.id}`}
                          checked={filters.deviceTypes?.includes(option.id as any) || false}
                          onCheckedChange={(checked) => handleDeviceTypeChange(option.id, checked === true)}
                        />
                        <Label htmlFor={`device-${option.id}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 만족도 및 상담원 연결 필터 */}
              <div className="space-y-6">
                {/* 만족도 범위 필터 */}
                <div>
                  <h4 className="font-medium mb-3">
                    만족도 범위: {filters.satisfactionRange?.min || 1} - {filters.satisfactionRange?.max || 5}
                  </h4>
                  <Slider
                    defaultValue={[filters.satisfactionRange?.min || 1, filters.satisfactionRange?.max || 5]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={handleSatisfactionRangeChange}
                  />
                </div>

                {/* 상담원 연결 필터 */}
                <div>
                  <h4 className="font-medium mb-3">상담원 연결</h4>
                  <RadioGroup
                    value={filters.transferredToAgent === undefined ? "all" : filters.transferredToAgent ? "yes" : "no"}
                    onValueChange={handleTransferredToAgentChange}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="transfer-all" />
                      <Label htmlFor="transfer-all">전체</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="transfer-yes" />
                      <Label htmlFor="transfer-yes">연결됨</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="transfer-no" />
                      <Label htmlFor="transfer-no">연결 안됨</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={resetFilters}>
                초기화
              </Button>
              <Button onClick={applyFilters}>적용</Button>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}
