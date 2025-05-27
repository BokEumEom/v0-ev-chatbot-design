"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Brain } from "lucide-react"
import type { ClassificationModelType, ModelTrainingConfig } from "@/types/ml-feedback"

// 폼 스키마 정의
const formSchema = z.object({
  modelType: z.enum(["naive-bayes", "random-forest", "neural-network", "ensemble"]),
  trainingDataPercentage: z.number().min(0.1).max(1),
  features: z.array(z.string()).min(1, "최소 하나 이상의 특성을 선택해야 합니다."),
  balanceClasses: z.boolean(),
  hyperparameters: z.record(z.any()),
})

interface ModelTrainingFormProps {
  onSubmit: (config: ModelTrainingConfig) => void
}

export function ModelTrainingForm({ onSubmit }: ModelTrainingFormProps) {
  const [selectedModelType, setSelectedModelType] = useState<ClassificationModelType>("naive-bayes")

  // 폼 초기화
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelType: "naive-bayes",
      trainingDataPercentage: 0.8,
      features: ["text", "category", "sentiment"],
      balanceClasses: true,
      hyperparameters: {},
    },
  })

  // 모델 유형 변경 시 하이퍼파라미터 초기화
  const handleModelTypeChange = (value: ClassificationModelType) => {
    setSelectedModelType(value)

    // 모델 유형에 따른 기본 하이퍼파라미터 설정
    let defaultHyperparameters = {}

    switch (value) {
      case "naive-bayes":
        defaultHyperparameters = {
          alpha: 1.0,
          fit_prior: true,
        }
        break
      case "random-forest":
        defaultHyperparameters = {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 5,
        }
        break
      case "neural-network":
        defaultHyperparameters = {
          hidden_layers: [64, 32],
          dropout: 0.2,
          learning_rate: 0.001,
          epochs: 50,
        }
        break
      case "ensemble":
        defaultHyperparameters = {
          models: ["naive-bayes", "random-forest", "neural-network"],
          voting: "soft",
        }
        break
    }

    form.setValue("hyperparameters", defaultHyperparameters)
  }

  // 폼 제출 처리
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as ModelTrainingConfig)
  }

  // 사용 가능한 특성 목록
  const availableFeatures = [
    { id: "text", label: "텍스트 내용" },
    { id: "category", label: "카테고리" },
    { id: "sentiment", label: "감정" },
    { id: "keywords", label: "키워드" },
    { id: "length", label: "텍스트 길이" },
    { id: "user_segment", label: "사용자 세그먼트" },
    { id: "device_info", label: "디바이스 정보" },
    { id: "timestamp", label: "시간 정보" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="modelType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>모델 유형</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  handleModelTypeChange(value as ClassificationModelType)
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="모델 유형 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="naive-bayes">나이브 베이즈 (Naive Bayes)</SelectItem>
                  <SelectItem value="random-forest">랜덤 포레스트 (Random Forest)</SelectItem>
                  <SelectItem value="neural-network">신경망 (Neural Network)</SelectItem>
                  <SelectItem value="ensemble">앙상블 (Ensemble)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>피드백 분류에 사용할 머신러닝 모델 유형을 선택하세요.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trainingDataPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>학습 데이터 비율: {(field.value * 100).toFixed(0)}%</FormLabel>
              <FormControl>
                <Slider
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={[field.value]}
                  onValueChange={(values) => field.onChange(values[0])}
                />
              </FormControl>
              <FormDescription>
                전체 데이터 중 학습에 사용할 데이터의 비율을 설정하세요. 나머지는 검증에 사용됩니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>사용할 특성</FormLabel>
                <FormDescription>모델 학습에 사용할 특성을 선택하세요. 최소 하나 이상 선택해야 합니다.</FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableFeatures.map((feature) => (
                  <FormField
                    key={feature.id}
                    control={form.control}
                    name="features"
                    render={({ field }) => {
                      return (
                        <FormItem key={feature.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(feature.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, feature.id])
                                  : field.onChange(field.value?.filter((value) => value !== feature.id))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{feature.label}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="balanceClasses"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>클래스 균형 조정</FormLabel>
                <FormDescription>불균형한 클래스 분포를 자동으로 조정합니다.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">하이퍼파라미터 설정</h3>

          {selectedModelType === "naive-bayes" && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hyperparameters.alpha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>알파 (스무딩 파라미터)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>스무딩을 위한 알파 값입니다. 0보다 큰 값이어야 합니다.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hyperparameters.fit_prior"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>사전 확률 학습</FormLabel>
                      <FormDescription>클래스 사전 확률을 학습할지 여부를 설정합니다.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}

          {selectedModelType === "random-forest" && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hyperparameters.n_estimators"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>트리 개수</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="10"
                        max="500"
                        step="10"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>랜덤 포레스트에서 사용할 결정 트리의 개수입니다.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hyperparameters.max_depth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>최대 깊이</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>각 트리의 최대 깊이입니다. 과적합을 방지하기 위해 제한합니다.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hyperparameters.min_samples_split"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>최소 분할 샘플 수</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2"
                        max="20"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>노드를 분할하기 위한 최소 샘플 수입니다.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {selectedModelType === "neural-network" && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hyperparameters.hidden_layers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>은닉층 구성</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 64,32"
                        value={field.value.join(",")}
                        onChange={(e) => {
                          const values = e.target.value
                            .split(",")
                            .map((v) => Number.parseInt(v.trim()))
                            .filter((v) => !isNaN(v))
                          field.onChange(values)
                        }}
                      />
                    </FormControl>
                    <FormDescription>은닉층의 뉴런 수를 쉼표로 구분하여 입력하세요. 예: 64,32</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hyperparameters.dropout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>드롭아웃 비율: {(field.value * 100).toFixed(0)}%</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={0.5}
                        step={0.05}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                    </FormControl>
                    <FormDescription>과적합 방지를 위한 드롭아웃 비율입니다.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hyperparameters.learning_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>학습률</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(Number.parseFloat(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="학습률 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0.01">0.01 (빠른 학습)</SelectItem>
                        <SelectItem value="0.001">0.001 (균형)</SelectItem>
                        <SelectItem value="0.0001">0.0001 (안정적)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>모델 학습 속도를 결정하는 학습률입니다.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hyperparameters.epochs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>에포크 수</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="10"
                        max="200"
                        step="10"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>전체 데이터셋을 몇 번 반복하여 학습할지 설정합니다.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {selectedModelType === "ensemble" && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hyperparameters.models"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>앙상블에 포함할 모델</FormLabel>
                      <FormDescription>
                        앙상블에 포함할 모델을 선택하세요. 최소 두 개 이상 선택해야 합니다.
                      </FormDescription>
                    </div>
                    <div className="space-y-2">
                      {["naive-bayes", "random-forest", "neural-network"].map((model) => (
                        <FormItem key={model} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(model)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, model])
                                  : field.onChange(field.value?.filter((value) => value !== model))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {model === "naive-bayes"
                              ? "나이브 베이즈"
                              : model === "random-forest"
                                ? "랜덤 포레스트"
                                : "신경망"}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hyperparameters.voting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>투표 방식</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="투표 방식 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hard">하드 보팅 (다수결)</SelectItem>
                        <SelectItem value="soft">소프트 보팅 (확률 평균)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>앙상블 모델의 최종 결정 방식을 선택하세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <Button type="submit" className="w-full">
          <Brain className="mr-2 h-4 w-4" />
          모델 학습 시작
        </Button>
      </form>
    </Form>
  )
}
