"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { DiagnosticsFilterOptions } from "@/types/diagnostics"
import { diagnosticsService } from "@/services/diagnostics-service"
import { Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

interface DiagnosticsFiltersProps {
  onChange: (filters: DiagnosticsFilterOptions) => void
}

export function DiagnosticsFilters({ onChange }: DiagnosticsFiltersProps) {
  const [filters, setFilters] = useState<DiagnosticsFilterOptions>({})
  const [filterOptions, setFilterOptions] = useState<{
    vehicleModels: string[]
    chargingStationTypes: string[]
    problemCategories: string[]
  }>({
    vehicleModels: [],
    chargingStationTypes: [],
    problemCategories: [],
  })
  const [isOpen, setIsOpen] = useState(false)

  // 필터 옵션 로드
  useEffect(() => {
    // 실제 구현에서는 API 호출
    const options = diagnosticsService.getFilterOptions()
    setFilterOptions(options)
  }, [])

  // 필터 변경 처리
  const handleFilterChange = (newFilters: DiagnosticsFilterOptions) => {
    setFilters(newFilters)
    onChange(newFilters)
  }

  // 차량 모델 필터 변경
  const handleVehicleModelChange = (models: string[]) => {
    handleFilterChange({
      ...filters,
      vehicleModels: models.length > 0 ? models : undefined,
    })
  }

  // 충전소 타입 필터 변경
  const handleChargingTypeChange = (types: string[]) => {
    handleFilterChange({
      ...filters,
      chargingStationTypes: types.length > 0 ? types : undefined,
    })
  }

  // 문제 카테고리 필터 변경
  const handleProblemCategoryChange = (categories: string[]) => {
    handleFilterChange({
      ...filters,
      problemCategories: categories.length > 0 ? categories : undefined,
    })
  }

  // 완료 상태 필터 변경
  const handleCompletionStatusChange = (status: Array<"completed" | "abandoned" | "in_progress">) => {
    handleFilterChange({
      ...filters,
      completionStatus: status.length > 0 ? status : undefined,
    })
  }

  // 필터 초기화
  const handleResetFilters = () => {
    setFilters({})
    onChange({})
  }

  // 활성 필터 개수
  const activeFilterCount = [
    filters.vehicleModels?.length || 0,
    filters.chargingStationTypes?.length || 0,
    filters.problemCategories?.length || 0,
    filters.completionStatus?.length || 0,
  ].reduce((a, b) => a + (b > 0 ? 1 : 0), 0)

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-4 w-4" />
              필터
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">필터 옵션</h4>
                <p className="text-sm text-muted-foreground">진단 데이터를 필터링할 조건을 선택하세요.</p>
              </div>

              <div className="grid gap-2">
                <div className="space-y-1">
                  <Label htmlFor="vehicle-model">차량 모델</Label>
                  <MultiSelect
                    options={filterOptions.vehicleModels.map((model) => ({ label: model, value: model }))}
                    selected={filters.vehicleModels || []}
                    onChange={handleVehicleModelChange}
                    placeholder="차량 모델 선택..."
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="charging-type">충전소 타입</Label>
                  <MultiSelect
                    options={filterOptions.chargingStationTypes.map((type) => ({ label: type, value: type }))}
                    selected={filters.chargingStationTypes || []}
                    onChange={handleChargingTypeChange}
                    placeholder="충전소 타입 선택..."
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="problem-category">문제 카테고리</Label>
                  <MultiSelect
                    options={filterOptions.problemCategories.map((category) => ({ label: category, value: category }))}
                    selected={filters.problemCategories || []}
                    onChange={handleProblemCategoryChange}
                    placeholder="문제 카테고리 선택..."
                  />
                </div>

                <div className="space-y-1">
                  <Label>완료 상태</Label>
                  <div className="flex flex-col space-y-2 pt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-completed"
                        checked={filters.completionStatus?.includes("completed")}
                        onCheckedChange={(checked) => {
                          const currentStatus = filters.completionStatus || []
                          const newStatus = checked
                            ? [...currentStatus, "completed"]
                            : currentStatus.filter((s) => s !== "completed")
                          handleCompletionStatusChange(newStatus)
                        }}
                      />
                      <label
                        htmlFor="status-completed"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        완료됨
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-abandoned"
                        checked={filters.completionStatus?.includes("abandoned")}
                        onCheckedChange={(checked) => {
                          const currentStatus = filters.completionStatus || []
                          const newStatus = checked
                            ? [...currentStatus, "abandoned"]
                            : currentStatus.filter((s) => s !== "abandoned")
                          handleCompletionStatusChange(newStatus)
                        }}
                      />
                      <label
                        htmlFor="status-abandoned"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        중단됨
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-in-progress"
                        checked={filters.completionStatus?.includes("in_progress")}
                        onCheckedChange={(checked) => {
                          const currentStatus = filters.completionStatus || []
                          const newStatus = checked
                            ? [...currentStatus, "in_progress"]
                            : currentStatus.filter((s) => s !== "in_progress")
                          handleCompletionStatusChange(newStatus)
                        }}
                      />
                      <label
                        htmlFor="status-in-progress"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        진행 중
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2">
                <X className="mr-2 h-4 w-4" />
                필터 초기화
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* 활성 필터 표시 */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.vehicleModels?.length ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                차량: {filters.vehicleModels.length}개
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => handleFilterChange({ ...filters, vehicleModels: undefined })}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">차량 필터 제거</span>
                </Button>
              </Badge>
            ) : null}

            {filters.chargingStationTypes?.length ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                충전소: {filters.chargingStationTypes.length}개
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => handleFilterChange({ ...filters, chargingStationTypes: undefined })}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">충전소 필터 제거</span>
                </Button>
              </Badge>
            ) : null}

            {filters.problemCategories?.length ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                문제: {filters.problemCategories.length}개
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => handleFilterChange({ ...filters, problemCategories: undefined })}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">문제 필터 제거</span>
                </Button>
              </Badge>
            ) : null}

            {filters.completionStatus?.length ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                상태: {filters.completionStatus.length}개
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => handleFilterChange({ ...filters, completionStatus: undefined })}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">상태 필터 제거</span>
                </Button>
              </Badge>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

// 다중 선택 컴포넌트
interface MultiSelectProps {
  options: { label: string; value: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

function MultiSelect({ options, selected, onChange, placeholder }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={isOpen} className="w-full justify-between">
          {selected.length > 0 ? `${selected.length}개 선택됨` : placeholder || "선택..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="p-2 space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`option-${option.value}`}
                checked={selected.includes(option.value)}
                onCheckedChange={(checked) => {
                  const newSelected = checked
                    ? [...selected, option.value]
                    : selected.filter((value) => value !== option.value)
                  onChange(newSelected)
                }}
              />
              <label
                htmlFor={`option-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
