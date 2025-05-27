"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, AlertTriangle, CheckCircle, XCircle, RotateCcw } from "lucide-react"
import type { PromptVersion, PromptDeploymentHistory } from "@/types/prompt-management"

interface PromptDeploymentManagerProps {
  versions: PromptVersion[]
  selectedVersion?: PromptVersion | null
  onVersionDeployed?: (versionId: string) => void
}

export function PromptDeploymentManager({
  versions,
  selectedVersion,
  onVersionDeployed,
}: PromptDeploymentManagerProps) {
  const [loading, setLoading] = useState(false)
  const [deploymentHistory, setDeploymentHistory] = useState<PromptDeploymentHistory[]>([])
  const [deployDialogOpen, setDeployDialogOpen] = useState(false)
  const [deployEnvironment, setDeployEnvironment] = useState<"development" | "testing" | "production">("testing")
  const [activeVersion, setActiveVersion] = useState<PromptVersion | null>(null)

  // 활성 버전 찾기
  useEffect(() => {
    if (versions && versions.length > 0) {
      const active = versions.find((v) => v.status === "active") || versions[0]
      setActiveVersion(active)
    }
  }, [versions])

  // 배포 이력 로드
  useEffect(() => {
    async function loadDeploymentHistory() {
      try {
        setLoading(true)
        // 실제 구현에서는 API 호출
        // 여기서는 샘플 데이터 사용
        const sampleDeployments: PromptDeploymentHistory[] = [
          {
            id: "deploy_1",
            versionId: versions && versions.length > 0 ? versions[0].id : "unknown",
            versionName: versions && versions.length > 0 ? versions[0].name : "Unknown Version",
            deployedAt: "2023-01-20T14:30:00Z",
            deployedBy: "admin",
            environment: "production",
            status: "success",
          },
          {
            id: "deploy_2",
            versionId: versions && versions.length > 1 ? versions[1].id : "unknown",
            versionName: versions && versions.length > 1 ? versions[1].name : "Unknown Version",
            deployedAt: "2023-02-15T10:45:00Z",
            deployedBy: "developer",
            environment: "testing",
            status: "success",
          },
        ]

        setDeploymentHistory(sampleDeployments)
      } catch (error) {
        console.error("배포 이력 로드 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDeploymentHistory()
  }, [versions])

  // 프롬프트 배포 처리
  const handleDeploy = async () => {
    if (!selectedVersion) {
      console.error("선택된 버전이 없습니다")
      return
    }

    try {
      setLoading(true)
      // 실제 구현에서는 API 호출
      // 여기서는 가상의 배포 처리
      const newDeployment: PromptDeploymentHistory = {
        id: `deploy_${Date.now()}`,
        versionId: selectedVersion.id,
        versionName: selectedVersion.name,
        deployedAt: new Date().toISOString(),
        deployedBy: "current_user", // 실제 구현에서는 인증된 사용자 정보 사용
        environment: deployEnvironment,
        status: "success",
      }

      // 배포 이력 업데이트
      setDeploymentHistory([newDeployment, ...deploymentHistory])

      // 버전 상태 업데이트
      if (deployEnvironment === "production" && onVersionDeployed) {
        onVersionDeployed(selectedVersion.id)
      }

      setDeployDialogOpen(false)
    } catch (error) {
      console.error("프롬프트 배포 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // 롤백 처리
  const handleRollback = async (deploymentId: string) => {
    try {
      setLoading(true)
      // 실제 구현에서는 API 호출
      // 여기서는 가상의 롤백 처리

      // 배포 이력 업데이트
      setDeploymentHistory(
        deploymentHistory.map((deployment) =>
          deployment.id === deploymentId
            ? {
                ...deployment,
                status: "rolled-back",
                rollbackInfo: {
                  rolledBackAt: new Date().toISOString(),
                  rolledBackBy: "current_user",
                  reason: "수동 롤백",
                },
              }
            : deployment,
        ),
      )

      // 롤백된 버전으로 상태 업데이트
      const rolledBackDeployment = deploymentHistory.find((d) => d.id === deploymentId)
      if (rolledBackDeployment && rolledBackDeployment.environment === "production" && onVersionDeployed) {
        // 이전 활성 버전 찾기
        const previousVersions = versions.filter((v) => v.id !== (selectedVersion?.id || "") && v.status === "active")
        if (previousVersions.length > 0) {
          onVersionDeployed(previousVersions[0].id)
        }
      }
    } catch (error) {
      console.error("롤백 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // 환경별 배포 이력 필터링
  const devDeployments = deploymentHistory.filter((d) => d.environment === "development")
  const testDeployments = deploymentHistory.filter((d) => d.environment === "testing")
  const prodDeployments = deploymentHistory.filter((d) => d.environment === "production")

  // 환경별 현재 배포된 버전
  const currentDevVersion = devDeployments.length > 0 ? devDeployments[0] : null
  const currentTestVersion = testDeployments.length > 0 ? testDeployments[0] : null
  const currentProdVersion = prodDeployments.length > 0 ? prodDeployments[0] : null

  // 선택된 버전이 이미 배포되었는지 확인
  const isDeployedToDev =
    selectedVersion && currentDevVersion?.versionId === selectedVersion.id && currentDevVersion?.status === "success"
  const isDeployedToTest =
    selectedVersion && currentTestVersion?.versionId === selectedVersion.id && currentTestVersion?.status === "success"
  const isDeployedToProd =
    selectedVersion && currentProdVersion?.versionId === selectedVersion.id && currentProdVersion?.status === "success"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>배포 관리</CardTitle>
          <CardDescription>프롬프트 버전을 다양한 환경에 배포하고 관리합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">개발 환경</CardTitle>
                <CardDescription>내부 테스트용</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {currentDevVersion ? (
                  <div className="space-y-1">
                    <div className="font-medium">{currentDevVersion.versionName}</div>
                    <div className="text-sm text-muted-foreground">
                      배포일: {new Date(currentDevVersion.deployedAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">배포된 버전 없음</div>
                )}
              </CardContent>
              <CardFooter>
                <AlertDialog
                  open={deployDialogOpen && deployEnvironment === "development"}
                  onOpenChange={(open) => {
                    if (open) {
                      setDeployEnvironment("development")
                    }
                    setDeployDialogOpen(open)
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={!selectedVersion || isDeployedToDev || loading}
                    >
                      {isDeployedToDev ? "이미 배포됨" : "배포"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>개발 환경에 배포</AlertDialogTitle>
                      <AlertDialogDescription>
                        선택한 프롬프트 버전을 개발 환경에 배포하시겠습니까?
                        {selectedVersion && (
                          <div className="mt-2 p-2 bg-muted rounded-md">
                            <div className="font-medium">
                              {selectedVersion.name} (v{selectedVersion.version})
                            </div>
                            <div className="text-sm mt-1">{selectedVersion.description}</div>
                          </div>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeploy}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        배포
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">테스트 환경</CardTitle>
                <CardDescription>QA 및 사용자 테스트용</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {currentTestVersion ? (
                  <div className="space-y-1">
                    <div className="font-medium">{currentTestVersion.versionName}</div>
                    <div className="text-sm text-muted-foreground">
                      배포일: {new Date(currentTestVersion.deployedAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">배포된 버전 없음</div>
                )}
              </CardContent>
              <CardFooter>
                <AlertDialog
                  open={deployDialogOpen && deployEnvironment === "testing"}
                  onOpenChange={(open) => {
                    if (open) {
                      setDeployEnvironment("testing")
                    }
                    setDeployDialogOpen(open)
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={!selectedVersion || isDeployedToTest || loading}
                    >
                      {isDeployedToTest ? "이미 배포됨" : "배포"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>테스트 환경에 배포</AlertDialogTitle>
                      <AlertDialogDescription>
                        선택한 프롬프트 버전을 테스트 환경에 배포하시겠습니까?
                        {selectedVersion && (
                          <div className="mt-2 p-2 bg-muted rounded-md">
                            <div className="font-medium">
                              {selectedVersion.name} (v{selectedVersion.version})
                            </div>
                            <div className="text-sm mt-1">{selectedVersion.description}</div>
                          </div>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeploy}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        배포
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">프로덕션 환경</CardTitle>
                <CardDescription>실제 사용자용</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {currentProdVersion ? (
                  <div className="space-y-1">
                    <div className="font-medium">{currentProdVersion.versionName}</div>
                    <div className="text-sm text-muted-foreground">
                      배포일: {new Date(currentProdVersion.deployedAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">배포된 버전 없음</div>
                )}
              </CardContent>
              <CardFooter>
                <AlertDialog
                  open={deployDialogOpen && deployEnvironment === "production"}
                  onOpenChange={(open) => {
                    if (open) {
                      setDeployEnvironment("production")
                    }
                    setDeployDialogOpen(open)
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={!selectedVersion || isDeployedToProd || loading}
                    >
                      {isDeployedToProd ? "이미 배포됨" : "배포"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        <AlertTriangle className="h-5 w-5 text-amber-500 inline-block mr-2" />
                        프로덕션 환경에 배포
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        <div className="text-amber-500 font-medium mb-2">
                          주의: 이 작업은 실제 사용자에게 영향을 미칩니다.
                        </div>
                        선택한 프롬프트 버전을 프로덕션 환경에 배포하시겠습니까?
                        {selectedVersion && (
                          <div className="mt-2 p-2 bg-muted rounded-md">
                            <div className="font-medium">
                              {selectedVersion.name} (v{selectedVersion.version})
                            </div>
                            <div className="text-sm mt-1">{selectedVersion.description}</div>
                          </div>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeploy} className="bg-amber-500 hover:bg-amber-600">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        프로덕션에 배포
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">모든 배포</TabsTrigger>
          <TabsTrigger value="development">개발</TabsTrigger>
          <TabsTrigger value="testing">테스트</TabsTrigger>
          <TabsTrigger value="production">프로덕션</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <DeploymentHistoryTable deployments={deploymentHistory} onRollback={handleRollback} loading={loading} />
        </TabsContent>

        <TabsContent value="development" className="mt-4">
          <DeploymentHistoryTable deployments={devDeployments} onRollback={handleRollback} loading={loading} />
        </TabsContent>

        <TabsContent value="testing" className="mt-4">
          <DeploymentHistoryTable deployments={testDeployments} onRollback={handleRollback} loading={loading} />
        </TabsContent>

        <TabsContent value="production" className="mt-4">
          <DeploymentHistoryTable deployments={prodDeployments} onRollback={handleRollback} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 배포 이력 테이블 컴포넌트
interface DeploymentHistoryTableProps {
  deployments: PromptDeploymentHistory[]
  onRollback: (deploymentId: string) => void
  loading: boolean
}

function DeploymentHistoryTable({ deployments, onRollback, loading }: DeploymentHistoryTableProps) {
  // 환경별 표시 이름
  const environmentLabels: Record<string, string> = {
    development: "개발",
    testing: "테스트",
    production: "프로덕션",
  }

  // 상태별 배지 스타일
  const statusBadgeStyles: Record<string, string> = {
    success: "bg-green-200 text-green-800",
    failed: "bg-red-200 text-red-800",
    "rolled-back": "bg-amber-200 text-amber-800",
  }

  // 상태별 아이콘
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "rolled-back":
        return <RotateCcw className="h-4 w-4 text-amber-600" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>버전</TableHead>
              <TableHead>환경</TableHead>
              <TableHead>배포일</TableHead>
              <TableHead>배포자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deployments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  배포 이력이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              deployments.map((deployment) => (
                <TableRow key={deployment.id}>
                  <TableCell className="font-medium">{deployment.versionName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{environmentLabels[deployment.environment]}</Badge>
                  </TableCell>
                  <TableCell>{new Date(deployment.deployedAt).toLocaleString()}</TableCell>
                  <TableCell>{deployment.deployedBy}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <StatusIcon status={deployment.status} />
                      <Badge className={`ml-2 ${statusBadgeStyles[deployment.status]}`}>
                        {deployment.status === "success" ? "성공" : deployment.status === "failed" ? "실패" : "롤백됨"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {deployment.status === "success" && deployment.environment === "production" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            롤백
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              <AlertTriangle className="h-5 w-5 text-amber-500 inline-block mr-2" />
                              프로덕션 롤백
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              <div className="text-amber-500 font-medium mb-2">
                                주의: 이 작업은 실제 사용자에게 영향을 미칩니다.
                              </div>
                              이 배포를 롤백하시겠습니까? 이전 버전으로 되돌아갑니다.
                              <div className="mt-2 p-2 bg-muted rounded-md">
                                <div className="font-medium">{deployment.versionName}</div>
                                <div className="text-sm mt-1">
                                  배포일: {new Date(deployment.deployedAt).toLocaleString()}
                                </div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onRollback(deployment.id)}
                              className="bg-amber-500 hover:bg-amber-600"
                            >
                              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              롤백 확인
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
