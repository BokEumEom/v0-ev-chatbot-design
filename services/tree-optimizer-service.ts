import type {
  NodeUsageStats,
  PathStats,
  OptimizationSuggestion,
  TreeOptimizationResult,
  OptimizationSettings,
  SimulationResult,
  TreeChangeHistory,
} from "@/types/tree-optimizer"
import type { TroubleshootingNode } from "@/types/troubleshooting"
import type { DiagnosticSession } from "@/types/diagnostics"
import { troubleshootingTree } from "@/data/troubleshooting-tree"
import { diagnosticsService } from "./diagnostics-service"

export class TreeOptimizerService {
  private static instance: TreeOptimizerService
  private changeHistory: TreeChangeHistory[] = []
  private currentTree: TroubleshootingNode[] = [...troubleshootingTree]

  private constructor() {
    // 개발용 더미 변경 이력 생성
    this.generateDummyChangeHistory()
  }

  public static getInstance(): TreeOptimizerService {
    if (!TreeOptimizerService.instance) {
      TreeOptimizerService.instance = new TreeOptimizerService()
    }
    return TreeOptimizerService.instance
  }

  // 노드 사용 통계 분석
  public analyzeNodeUsage(
    sessions: DiagnosticSession[] = diagnosticsService.getSessions(),
  ): Record<string, NodeUsageStats> {
    const nodeStats: Record<string, NodeUsageStats> = {}
    const nodeVisits: Record<string, number> = {}
    const nodeExits: Record<string, number> = {}
    const nodeTimeSpent: Record<string, number[]> = {}
    const nodeSuccesses: Record<string, number> = {}

    // 각 세션의 단계를 분석
    sessions.forEach((session) => {
      const steps = diagnosticsService.getSessionSteps(session.id)
      if (steps.length === 0) return

      // 각 단계별 통계 수집
      steps.forEach((step, index) => {
        const { nodeId } = step

        // 노드 방문 횟수 증가
        nodeVisits[nodeId] = (nodeVisits[nodeId] || 0) + 1

        // 마지막 단계인 경우 종료 횟수 증가
        if (index === steps.length - 1) {
          nodeExits[nodeId] = (nodeExits[nodeId] || 0) + 1
        }

        // 노드에서 소요된 시간 계산 (다음 단계가 있는 경우)
        if (index < steps.length - 1) {
          const timeSpent = steps[index + 1].timestamp.getTime() - step.timestamp.getTime()
          if (!nodeTimeSpent[nodeId]) nodeTimeSpent[nodeId] = []
          nodeTimeSpent[nodeId].push(timeSpent)
        }

        // 성공적으로 완료된 세션인 경우
        if (session.completionStatus === "completed") {
          nodeSuccesses[nodeId] = (nodeSuccesses[nodeId] || 0) + 1
        }
      })
    })

    // 통계 계산
    Object.keys(nodeVisits).forEach((nodeId) => {
      const visits = nodeVisits[nodeId] || 0
      const exits = nodeExits[nodeId] || 0
      const timeSpentArray = nodeTimeSpent[nodeId] || []
      const successes = nodeSuccesses[nodeId] || 0

      const exitRate = visits > 0 ? exits / visits : 0
      const averageTimeSpent =
        timeSpentArray.length > 0 ? timeSpentArray.reduce((sum, time) => sum + time, 0) / timeSpentArray.length : 0
      const successRate = visits > 0 ? successes / visits : 0

      nodeStats[nodeId] = {
        nodeId,
        visits,
        exitRate,
        averageTimeSpent,
        successRate,
      }
    })

    return nodeStats
  }

  // 경로 통계 분석
  public analyzePathStats(sessions: DiagnosticSession[] = diagnosticsService.getSessions()): PathStats[] {
    const pathCounts: Record<string, number> = {}
    const pathCompletions: Record<string, number> = {}
    const pathTimes: Record<string, number[]> = {}
    const pathSatisfaction: Record<string, number[]> = {}

    // 각 세션의 경로 분석
    sessions.forEach((session) => {
      const steps = diagnosticsService.getSessionSteps(session.id)
      if (steps.length === 0) return

      // 경로 생성 (노드 ID 배열)
      const path = steps.map((step) => step.nodeId)
      const pathKey = path.join(",")

      // 경로 사용 횟수 증가
      pathCounts[pathKey] = (pathCounts[pathKey] || 0) + 1

      // 완료된 세션인 경우
      if (session.completionStatus === "completed") {
        pathCompletions[pathKey] = (pathCompletions[pathKey] || 0) + 1

        // 완료 시간 계산
        if (session.startTime && session.endTime) {
          const completionTime = session.endTime.getTime() - session.startTime.getTime()
          if (!pathTimes[pathKey]) pathTimes[pathKey] = []
          pathTimes[pathKey].push(completionTime)
        }

        // 만족도 기록
        if (session.userFeedback) {
          const satisfactionScore = session.userFeedback.helpful ? 1 : 0
          if (!pathSatisfaction[pathKey]) pathSatisfaction[pathKey] = []
          pathSatisfaction[pathKey].push(satisfactionScore)
        }
      }
    })

    // 경로 통계 계산
    const pathStats: PathStats[] = Object.keys(pathCounts).map((pathKey) => {
      const path = pathKey.split(",")
      const frequency = pathCounts[pathKey]
      const completions = pathCompletions[pathKey] || 0
      const completionRate = frequency > 0 ? completions / frequency : 0

      const times = pathTimes[pathKey] || []
      const averageCompletionTime = times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0

      const satisfactionScores = pathSatisfaction[pathKey] || []
      const satisfactionRate =
        satisfactionScores.length > 0
          ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
          : 0

      return {
        path,
        frequency,
        completionRate,
        averageCompletionTime,
        satisfactionRate,
      }
    })

    // 빈도 기준 내림차순 정렬
    return pathStats.sort((a, b) => b.frequency - a.frequency)
  }

  // 최적화 제안 생성
  public generateOptimizationSuggestions(
    nodeStats: Record<string, NodeUsageStats>,
    pathStats: PathStats[],
    settings: OptimizationSettings,
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // 1. 사용 빈도가 낮은 노드 제거 제안
    Object.values(nodeStats)
      .filter((stat) => stat.visits < settings.minDataPoints && !settings.preserveNodes.includes(stat.nodeId))
      .forEach((stat) => {
        const node = this.findNodeInCurrentTree(stat.nodeId)
        if (!node) return

        suggestions.push({
          type: "remove",
          description: `사용 빈도가 낮은 노드 제거: "${node.title}"`,
          confidence: 0.7,
          impact: "low",
          affectedNodes: [stat.nodeId],
          before: [{ id: stat.nodeId, title: node.title }],
          after: [],
          reasoning: `이 노드는 ${stat.visits}번만 방문되었으며, 최소 데이터 포인트 기준(${settings.minDataPoints})보다 적습니다.`,
        })
      })

    // 2. 높은 종료율을 가진 중간 노드 최적화 제안
    Object.values(nodeStats)
      .filter(
        (stat) =>
          stat.exitRate > 0.5 && stat.visits >= settings.minDataPoints && !settings.preserveNodes.includes(stat.nodeId),
      )
      .forEach((stat) => {
        const node = this.findNodeInCurrentTree(stat.nodeId)
        if (!node || node.type === "solution") return // 이미 솔루션 노드면 제외

        suggestions.push({
          type: "modify",
          description: `높은 종료율을 가진 노드를 솔루션 노드로 변환: "${node.title}"`,
          confidence: 0.8,
          impact: "medium",
          affectedNodes: [stat.nodeId],
          before: [{ id: stat.nodeId, type: node.type, title: node.title }],
          after: [{ id: stat.nodeId, type: "solution", title: node.title }],
          reasoning: `이 노드는 방문자의 ${Math.round(
            stat.exitRate * 100,
          )}%가 여기서 진단을 종료합니다. 솔루션 노드로 변환하면 사용자 경험이 향상될 수 있습니다.`,
        })
      })

    // 3. 자주 사용되는 경로의 단계 순서 최적화
    pathStats
      .filter((pathStat) => pathStat.frequency >= settings.minDataPoints)
      .slice(0, 5) // 상위 5개 경로만 고려
      .forEach((pathStat) => {
        // 경로에 있는 노드들의 평균 소요 시간 분석
        const pathNodeTimes = pathStat.path.map((nodeId) => ({
          nodeId,
          time: nodeStats[nodeId]?.averageTimeSpent || 0,
        }))

        // 소요 시간이 긴 노드가 경로 초반에 있는 경우 순서 변경 제안
        for (let i = 0; i < pathNodeTimes.length - 1; i++) {
          const current = pathNodeTimes[i]
          const next = pathNodeTimes[i + 1]

          if (
            current.time > next.time * 1.5 &&
            !settings.preserveNodes.includes(current.nodeId) &&
            !settings.preserveNodes.includes(next.nodeId)
          ) {
            const currentNode = this.findNodeInCurrentTree(current.nodeId)
            const nextNode = this.findNodeInCurrentTree(next.nodeId)
            if (!currentNode || !nextNode) continue

            suggestions.push({
              type: "reorder",
              description: `노드 순서 최적화: "${currentNode.title}" 노드와 "${nextNode.title}" 노드의 순서 변경`,
              confidence: 0.6,
              impact: "medium",
              affectedNodes: [current.nodeId, next.nodeId],
              before: [
                { id: current.nodeId, title: currentNode.title },
                { id: next.nodeId, title: nextNode.title },
              ],
              after: [
                { id: next.nodeId, title: nextNode.title },
                { id: current.nodeId, title: currentNode.title },
              ],
              reasoning: `"${currentNode.title}" 노드에서 평균 ${Math.round(
                current.time / 1000,
              )}초가 소요되는 반면, "${nextNode.title}" 노드는 ${Math.round(
                next.time / 1000,
              )}초만 소요됩니다. 더 빠른 노드를 먼저 배치하면 사용자 경험이 향상될 수 있습니다.`,
            })
          }
        }
      })

    // 4. 성공률이 높은 경로 기반 새 노드 추가 제안
    const highSuccessPath = pathStats
      .filter((path) => path.completionRate > 0.8 && path.frequency >= settings.minDataPoints)
      .sort((a, b) => b.satisfactionRate - a.satisfactionRate)[0]

    if (highSuccessPath) {
      const firstNodeId = highSuccessPath.path[0]
      const firstNode = this.findNodeInCurrentTree(firstNodeId)
      if (firstNode) {
        const newNodeId = `suggested_shortcut_${Date.now()}`
        suggestions.push({
          type: "add",
          description: "성공률이 높은 경로를 위한 바로가기 노드 추가",
          confidence: 0.7,
          impact: "high",
          affectedNodes: [firstNodeId, newNodeId],
          before: [],
          after: [
            {
              id: newNodeId,
              type: "question",
              title: "빠른 진단 경로",
              description: "가장 성공률이 높은 진단 경로로 바로 이동합니다.",
            },
          ],
          reasoning: `만족도 ${Math.round(highSuccessPath.satisfactionRate * 100)}%와 완료율 ${Math.round(
            highSuccessPath.completionRate * 100,
          )}%를 가진 고성능 경로를 발견했습니다. 이 경로에 대한 바로가기를 제공하면 사용자 경험이 향상될 수 있습니다.`,
        })
      }
    }

    // 5. 중복 경로 병합 제안
    const pathGroups: Record<string, PathStats[]> = {}
    pathStats.forEach((path) => {
      // 경로의 시작과 끝 노드를 키로 사용
      const key = `${path.path[0]}_${path.path[path.path.length - 1]}`
      if (!pathGroups[key]) pathGroups[key] = []
      pathGroups[key].push(path)
    })

    Object.values(pathGroups)
      .filter((group) => group.length > 1) // 같은 시작과 끝을 가진 경로가 여러 개인 경우
      .forEach((group) => {
        // 가장 성공률이 높은 경로 선택
        const bestPath = group.sort((a, b) => b.completionRate - a.completionRate)[0]
        const otherPaths = group.filter((p) => p !== bestPath)

        if (bestPath.completionRate > 0.7) {
          const startNodeId = bestPath.path[0]
          const endNodeId = bestPath.path[bestPath.path.length - 1]
          const startNode = this.findNodeInCurrentTree(startNodeId)
          const endNode = this.findNodeInCurrentTree(endNodeId)

          if (!startNode || !endNode) return

          const affectedNodes = Array.from(
            new Set(otherPaths.flatMap((p) => p.path).filter((id) => id !== startNodeId && id !== endNodeId)),
          )

          suggestions.push({
            type: "merge",
            description: `중복 경로 최적화: "${startNode.title}"에서 "${endNode.title}"까지의 경로 병합`,
            confidence: 0.75,
            impact: "high",
            affectedNodes: [startNodeId, endNodeId, ...affectedNodes],
            reasoning: `"${startNode.title}"에서 "${
              endNode.title
            }"까지 ${group.length}개의 유사한 경로가 발견되었습니다. 완료율 ${Math.round(
              bestPath.completionRate * 100,
            )}%의 최적 경로로 통합하면 진단 효율성이 향상될 수 있습니다.`,
          })
        }
      })

    // 최적화 강도에 따라 제안 필터링
    let filteredSuggestions = [...suggestions]

    if (settings.optimizationStrength === "conservative") {
      // 보수적: 높은 신뢰도와 낮은/중간 영향도를 가진 제안만 포함
      filteredSuggestions = suggestions.filter(
        (s) => s.confidence > 0.8 && (s.impact === "low" || s.impact === "medium"),
      )
    } else if (settings.optimizationStrength === "balanced") {
      // 균형: 중간 이상의 신뢰도를 가진 제안 포함
      filteredSuggestions = suggestions.filter((s) => s.confidence > 0.6)
    }
    // aggressive는 모든 제안 포함

    return filteredSuggestions
  }

  // 트리 최적화 실행
  public optimizeTree(settings: OptimizationSettings): TreeOptimizationResult {
    // 세션 데이터 가져오기 (날짜 범위 필터 적용)
    const sessions = settings.dateRange
      ? diagnosticsService.getSessions({
          dateRange: settings.dateRange,
        })
      : diagnosticsService.getSessions()

    // 노드 및 경로 통계 분석
    const nodeStats = this.analyzeNodeUsage(sessions)
    const pathStats = this.analyzePathStats(sessions)

    // 최적화 제안 생성
    const suggestions = this.generateOptimizationSuggestions(nodeStats, pathStats, settings)

    // 원본 트리 복사
    const originalTree = this.cloneTree(this.currentTree)

    // 최적화된 트리 생성
    const optimizedTree = this.applyOptimizationSuggestions(originalTree, suggestions)

    // 메트릭 계산
    const originalMetrics = this.calculateTreeMetrics(originalTree, sessions)
    const optimizedMetrics = this.calculateTreeMetrics(optimizedTree, sessions)

    // 개선율 계산
    const improvementMetrics = {
      averagePathLength: {
        before: originalMetrics.averagePathLength,
        after: optimizedMetrics.averagePathLength,
        improvement:
          ((originalMetrics.averagePathLength - optimizedMetrics.averagePathLength) /
            originalMetrics.averagePathLength) *
          100,
      },
      averageCompletionTime: {
        before: originalMetrics.averageCompletionTime,
        after: optimizedMetrics.averageCompletionTime,
        improvement:
          ((originalMetrics.averageCompletionTime - optimizedMetrics.averageCompletionTime) /
            originalMetrics.averageCompletionTime) *
          100,
      },
      estimatedSuccessRate: {
        before: originalMetrics.estimatedSuccessRate,
        after: optimizedMetrics.estimatedSuccessRate,
        improvement:
          ((optimizedMetrics.estimatedSuccessRate - originalMetrics.estimatedSuccessRate) /
            originalMetrics.estimatedSuccessRate) *
          100,
      },
    }

    return {
      originalTree,
      optimizedTree,
      suggestions,
      metrics: improvementMetrics,
    }
  }

  // 최적화 제안 적용
  private applyOptimizationSuggestions(
    tree: TroubleshootingNode[],
    suggestions: OptimizationSuggestion[],
  ): TroubleshootingNode[] {
    // 트리 복사
    const newTree = this.cloneTree(tree)

    // 각 제안 적용
    suggestions.forEach((suggestion) => {
      switch (suggestion.type) {
        case "remove":
          this.removeNodes(newTree, suggestion.affectedNodes)
          break
        case "modify":
          this.modifyNodes(newTree, suggestion)
          break
        case "reorder":
          this.reorderNodes(newTree, suggestion)
          break
        case "add":
          this.addNodes(newTree, suggestion)
          break
        case "merge":
          this.mergeNodes(newTree, suggestion)
          break
        case "split":
          this.splitNodes(newTree, suggestion)
          break
      }
    })

    return newTree
  }

  // 노드 제거
  private removeNodes(tree: TroubleshootingNode[], nodeIds: string[]): void {
    // 재귀적으로 노드 제거
    const removeNodeRecursive = (nodes: TroubleshootingNode[]): TroubleshootingNode[] => {
      return nodes
        .filter((node) => !nodeIds.includes(node.id))
        .map((node) => {
          if (node.children) {
            return {
              ...node,
              children: removeNodeRecursive(node.children),
            }
          }
          return node
        })
    }

    // 트리에서 노드 제거
    const result = removeNodeRecursive(tree)
    tree.length = 0
    tree.push(...result)
  }

  // 노드 수정
  private modifyNodes(tree: TroubleshootingNode[], suggestion: OptimizationSuggestion): void {
    // 수정할 노드와 수정 내용 매핑
    const modifications: Record<string, Partial<TroubleshootingNode>> = {}
    if (suggestion.after) {
      suggestion.after.forEach((mod) => {
        if (mod.id) {
          modifications[mod.id] = mod
        }
      })
    }

    // 재귀적으로 노드 수정
    const modifyNodeRecursive = (nodes: TroubleshootingNode[]): TroubleshootingNode[] => {
      return nodes.map((node) => {
        if (modifications[node.id]) {
          // 노드 수정
          const updatedNode = {
            ...node,
            ...modifications[node.id],
          }

          // 자식 노드가 있으면 재귀적으로 처리
          if (node.children) {
            updatedNode.children = modifyNodeRecursive(node.children)
          }

          return updatedNode
        } else if (node.children) {
          // 자식 노드만 재귀적으로 처리
          return {
            ...node,
            children: modifyNodeRecursive(node.children),
          }
        }
        return node
      })
    }

    // 트리에서 노드 수정
    const result = modifyNodeRecursive(tree)
    tree.length = 0
    tree.push(...result)
  }

  // 노드 순서 변경
  private reorderNodes(tree: TroubleshootingNode[], suggestion: OptimizationSuggestion): void {
    if (!suggestion.before || suggestion.before.length < 2) return

    const nodeId1 = suggestion.before[0].id
    const nodeId2 = suggestion.before[1].id

    // 부모 노드 찾기
    const findParentNode = (
      nodes: TroubleshootingNode[],
      childId: string,
    ): { parent: TroubleshootingNode; index: number } | null => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (node.id === childId) {
          return { parent: { id: "root", children: nodes } as TroubleshootingNode, index: i }
        }
        if (node.children) {
          for (let j = 0; j < node.children.length; j++) {
            if (node.children[j].id === childId) {
              return { parent: node, index: j }
            }
          }
          const result = findParentNode(node.children, childId)
          if (result) return result
        }
      }
      return null
    }

    // 첫 번째 노드의 부모 찾기
    const parent1 = findParentNode(tree, nodeId1)
    if (!parent1) return

    // 두 번째 노드의 부모 찾기
    const parent2 = findParentNode(tree, nodeId2)
    if (!parent2) return

    // 같은 부모 내에서 순서 변경
    if (parent1.parent.id === parent2.parent.id && parent1.parent.children) {
      const children = parent1.parent.children
      const node1 = children[parent1.index]
      const node2 = children[parent2.index]

      // 노드 교체
      children[parent1.index] = node2
      children[parent2.index] = node1
    }
  }

  // 새 노드 추가
  private addNodes(tree: TroubleshootingNode[], suggestion: OptimizationSuggestion): void {
    if (!suggestion.after || suggestion.after.length === 0) return

    // 새 노드 생성
    const newNodes = suggestion.after.map((nodeData) => {
      return {
        id: nodeData.id || `new_node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: nodeData.type || "question",
        title: nodeData.title || "New Node",
        description: nodeData.description || "",
        children: [],
      } as TroubleshootingNode
    })

    // 루트 레벨에 노드 추가
    tree.push(...newNodes)
  }

  // 노드 병합
  private mergeNodes(tree: TroubleshootingNode[], suggestion: OptimizationSuggestion): void {
    // 병합 로직은 케이스별로 다를 수 있어 복잡합니다.
    // 여기서는 간단한 구현만 제공합니다.
    if (suggestion.affectedNodes.length < 2) return

    const sourceNodeId = suggestion.affectedNodes[0]
    const targetNodeId = suggestion.affectedNodes[1]

    // 소스 노드와 타겟 노드 찾기
    const sourceNode = this.findNodeInTree(tree, sourceNodeId)
    const targetNode = this.findNodeInTree(tree, targetNodeId)

    if (!sourceNode || !targetNode) return

    // 타겟 노드에 소스 노드의 자식 추가
    if (sourceNode.children && targetNode.children) {
      targetNode.children.push(...sourceNode.children)
    }

    // 소스 노드 제거
    this.removeNodes(tree, [sourceNodeId])
  }

  // 노드 분할
  private splitNodes(tree: TroubleshootingNode[], suggestion: OptimizationSuggestion): void {
    // 분할 로직 구현
    // 복잡한 로직이므로 여기서는 구현하지 않습니다.
  }

  // 트리 메트릭 계산
  private calculateTreeMetrics(
    tree: TroubleshootingNode[],
    sessions: DiagnosticSession[],
  ): {
    averagePathLength: number
    averageCompletionTime: number
    estimatedSuccessRate: number
  } {
    // 완료된 세션만 필터링
    const completedSessions = sessions.filter((s) => s.completionStatus === "completed")

    // 평균 경로 길이 계산
    const pathLengths = completedSessions.map((session) => {
      const steps = diagnosticsService.getSessionSteps(session.id)
      return steps.length
    })

    const averagePathLength =
      pathLengths.length > 0 ? pathLengths.reduce((sum, length) => sum + length, 0) / pathLengths.length : 0

    // 평균 완료 시간 계산
    const completionTimes = completedSessions
      .filter((s) => s.startTime && s.endTime)
      .map((s) => s.endTime!.getTime() - s.startTime.getTime())

    const averageCompletionTime =
      completionTimes.length > 0 ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length : 0

    // 예상 성공률 계산 (완료된 세션 / 전체 세션)
    const estimatedSuccessRate = sessions.length > 0 ? completedSessions.length / sessions.length : 0

    return {
      averagePathLength,
      averageCompletionTime,
      estimatedSuccessRate,
    }
  }

  // 트리 시뮬레이션
  public simulateOptimizedTree(
    originalTree: TroubleshootingNode[],
    optimizedTree: TroubleshootingNode[],
    sessions: DiagnosticSession[] = diagnosticsService.getSessions(),
  ): SimulationResult {
    // 원본 트리 메트릭 계산
    const originalMetrics = this.calculateTreeMetrics(originalTree, sessions)

    // 최적화된 트리 메트릭 추정
    // 실제로는 더 복잡한 시뮬레이션이 필요하지만, 여기서는 간단한 추정만 제공합니다.
    const optimizedMetrics = {
      averageSteps: originalMetrics.averagePathLength * 0.8, // 20% 감소 가정
      averageTime: originalMetrics.averageCompletionTime * 0.85, // 15% 감소 가정
      completionRate: Math.min(originalMetrics.estimatedSuccessRate * 1.1, 1), // 10% 증가 가정 (최대 1)
      satisfactionRate: Math.min(0.85, originalMetrics.estimatedSuccessRate * 1.15), // 15% 증가 가정 (최대 0.85)
    }

    // 개선율 계산
    const improvement = {
      steps:
        ((originalMetrics.averagePathLength - optimizedMetrics.averageSteps) / originalMetrics.averagePathLength) * 100,
      time:
        ((originalMetrics.averageCompletionTime - optimizedMetrics.averageTime) /
          originalMetrics.averageCompletionTime) *
        100,
      completionRate:
        ((optimizedMetrics.completionRate - originalMetrics.estimatedSuccessRate) /
          originalMetrics.estimatedSuccessRate) *
        100,
      satisfactionRate: ((optimizedMetrics.satisfactionRate - 0.75) / 0.75) * 100, // 기존 만족도를 0.75로 가정
    }

    return {
      sessionCount: sessions.length,
      originalMetrics: {
        averageSteps: originalMetrics.averagePathLength,
        averageTime: originalMetrics.averageCompletionTime,
        completionRate: originalMetrics.estimatedSuccessRate,
        satisfactionRate: 0.75, // 기존 만족도를 0.75로 가정
      },
      optimizedMetrics,
      improvement,
    }
  }

  // 최적화 적용
  public applyOptimization(optimizationResult: TreeOptimizationResult, author: string): string {
    const changeId = `change_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // 변경 이력 기록
    const change: TreeChangeHistory = {
      id: changeId,
      timestamp: new Date(),
      description: `트리 최적화 (${optimizationResult.suggestions.length}개 제안 적용)`,
      author,
      changes: optimizationResult.suggestions,
      metrics: {
        before: {
          averagePathLength: optimizationResult.metrics.averagePathLength.before,
          averageCompletionTime: optimizationResult.metrics.averageCompletionTime.before,
          estimatedSuccessRate: optimizationResult.metrics.estimatedSuccessRate.before,
        },
        after: {
          averagePathLength: optimizationResult.metrics.averagePathLength.after,
          averageCompletionTime: optimizationResult.metrics.averageCompletionTime.after,
          estimatedSuccessRate: optimizationResult.metrics.estimatedSuccessRate.after,
        },
      },
      applied: true,
    }

    this.changeHistory.push(change)

    // 현재 트리 업데이트
    this.currentTree = this.cloneTree(optimizationResult.optimizedTree)

    return changeId
  }

  // 변경 롤백
  public rollbackChange(changeId: string): boolean {
    const changeIndex = this.changeHistory.findIndex((change) => change.id === changeId)
    if (changeIndex === -1 || !this.changeHistory[changeIndex].applied) return false

    // 롤백 변경 이력 생성
    const originalChange = this.changeHistory[changeIndex]
    const rollbackId = `rollback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const rollbackChange: TreeChangeHistory = {
      id: rollbackId,
      timestamp: new Date(),
      description: `변경 롤백: ${originalChange.description}`,
      author: originalChange.author,
      changes: originalChange.changes.map((change) => ({
        ...change,
        type: this.getReverseChangeType(change.type),
        description: `롤백: ${change.description}`,
        before: change.after,
        after: change.before,
      })),
      metrics: originalChange.metrics
        ? {
            before: originalChange.metrics.after,
            after: originalChange.metrics.before,
          }
        : undefined,
      applied: true,
      rollbackId: originalChange.id,
    }

    // 원래 변경을 비활성화
    this.changeHistory[changeIndex] = {
      ...originalChange,
      applied: false,
    }

    // 롤백 변경 추가
    this.changeHistory.push(rollbackChange)

    // TODO: 실제 트리 롤백 구현
    // 여기서는 간단히 원본 트리로 복원한다고 가정합니다.
    this.currentTree = [...troubleshootingTree]

    return true
  }

  // 변경 유형 반전
  private getReverseChangeType(type: OptimizationSuggestion["type"]): OptimizationSuggestion["type"] {
    switch (type) {
      case "add":
        return "remove"
      case "remove":
        return "add"
      case "merge":
        return "split"
      case "split":
        return "merge"
      default:
        return type // reorder와 modify는 그대로 유지
    }
  }

  // 변경 이력 조회
  public getChangeHistory(): TreeChangeHistory[] {
    return [...this.changeHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // 현재 트리 조회
  public getCurrentTree(): TroubleshootingNode[] {
    return this.cloneTree(this.currentTree)
  }

  // 트리 복제
  private cloneTree(tree: TroubleshootingNode[]): TroubleshootingNode[] {
    return JSON.parse(JSON.stringify(tree))
  }

  // 트리에서 노드 찾기
  private findNodeInTree(tree: TroubleshootingNode[], nodeId: string): TroubleshootingNode | null {
    for (const node of tree) {
      if (node.id === nodeId) return node
      if (node.children) {
        const found = this.findNodeInTree(node.children, nodeId)
        if (found) return found
      }
    }
    return null
  }

  // 현재 트리에서 노드 찾기
  private findNodeInCurrentTree(nodeId: string): TroubleshootingNode | null {
    return this.findNodeInTree(this.currentTree, nodeId)
  }

  // 개발용 더미 변경 이력 생성
  private generateDummyChangeHistory() {
    const authors = ["시스템", "관리자", "개발자"]
    const changeTypes: OptimizationSuggestion["type"][] = ["add", "remove", "modify", "reorder", "merge", "split"]
    const impacts: OptimizationSuggestion["impact"][] = ["high", "medium", "low"]

    // 지난 30일 동안의 더미 변경 이력 생성
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    // 10개의 더미 변경 이력 생성
    for (let i = 0; i < 10; i++) {
      // 랜덤 날짜 (지난 30일 이내)
      const changeDate = new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()))

      // 랜덤 변경 데이터
      const author = authors[Math.floor(Math.random() * authors.length)]
      const changeCount = 1 + Math.floor(Math.random() * 5) // 1-5개 변경

      // 변경 생성
      const changes: OptimizationSuggestion[] = []
      for (let j = 0; j < changeCount; j++) {
        const changeType = changeTypes[Math.floor(Math.random() * changeTypes.length)]
        const impact = impacts[Math.floor(Math.random() * impacts.length)]
        const nodeId = `node_${Math.floor(Math.random() * 100)}`

        changes.push({
          type: changeType,
          description: `${changeType} 작업: 노드 "${nodeId}"`,
          confidence: 0.5 + Math.random() * 0.5, // 0.5-1.0
          impact,
          affectedNodes: [nodeId],
          reasoning: "더미 데이터입니다.",
        })
      }

      // 변경 이력 생성
      const changeId = `dummy_change_${i}`
      const change: TreeChangeHistory = {
        id: changeId,
        timestamp: changeDate,
        description: `트리 최적화 (${changeCount}개 변경)`,
        author,
        changes,
        metrics: {
          before: {
            averagePathLength: 5 + Math.random() * 3,
            averageCompletionTime: 120000 + Math.random() * 60000,
            estimatedSuccessRate: 0.6 + Math.random() * 0.2,
          },
          after: {
            averagePathLength: 4 + Math.random() * 2,
            averageCompletionTime: 100000 + Math.random() * 40000,
            estimatedSuccessRate: 0.7 + Math.random() * 0.2,
          },
        },
        applied: Math.random() > 0.2, // 80% 확률로 적용됨
      }

      // 20% 확률로 롤백 변경 추가
      if (Math.random() < 0.2 && i > 0) {
        const originalChangeId = `dummy_change_${i - 1}`
        change.rollbackId = originalChangeId
        change.description = `변경 롤백: 트리 최적화 (${changeCount}개 변경)`
      }

      this.changeHistory.push(change)
    }
  }
}

// 서비스 인스턴스 내보내기
export const treeOptimizerService = TreeOptimizerService.getInstance()
