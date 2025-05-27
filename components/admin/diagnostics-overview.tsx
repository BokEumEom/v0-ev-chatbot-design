import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DiagnosticsStats } from "@/types/diagnostics"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, Clock, BarChart3, ThumbsUp, Lightbulb, Wrench } from "lucide-react"

interface DiagnosticsOverviewProps {
  stats: DiagnosticsStats
  isLoading: boolean
}

export function DiagnosticsOverview({ stats, isLoading }: DiagnosticsOverviewProps) {
  if (isLoading) {
    return <DiagnosticsOverviewSkeleton />
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}분 ${seconds}초`
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 진단 세션</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              완료율: {((stats.completedSessions / stats.totalSessions) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 진단</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">포기: {stats.abandonedSessions.toLocaleString()} 세션</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 완료 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.averageCompletionTime)}</div>
            <p className="text-xs text-muted-foreground">평균 단계: {stats.averageStepsPerSession.toFixed(1)}단계</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">사용자 만족도</CardTitle>
            <ThumbsUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userSatisfactionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">도움이 되었다고 응답한 사용자 비율</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>가장 흔한 문제</CardTitle>
            <CardDescription>사용자들이 가장 많이 겪는 문제 유형</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.mostCommonProblems.map((problem, index) => (
                <div key={index} className="flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{problem.category}</p>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${problem.percentage}%` }} />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">
                    {problem.count} ({problem.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>가장 흔한 해결책</CardTitle>
            <CardDescription>가장 많이 제시된 해결책</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.mostCommonSolutions.map((solution, index) => (
                <div key={index} className="flex items-center">
                  <Wrench className="h-4 w-4 mr-2 text-blue-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{solution.title}</p>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${solution.percentage}%` }} />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">
                    {solution.count} ({solution.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DiagnosticsOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array(5)
                    .fill(0)
                    .map((_, j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
