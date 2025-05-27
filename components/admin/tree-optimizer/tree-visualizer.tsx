"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import type { TroubleshootingNode } from "@/types/troubleshooting"
import { treeOptimizerService } from "@/services/tree-optimizer-service"

interface TreeVisualizerProps {
  tree: TroubleshootingNode[]
}

export function TreeVisualizer({ tree }: TreeVisualizerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [nodeStats, setNodeStats] = useState<Record<string, any>>({})
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)

  // 노드 통계 로드
  useEffect(() => {
    setIsLoading(true)
    // 비동기 처리를 시뮬레이션
    setTimeout(() => {
      const stats = treeOptimizerService.analyzeNodeUsage()
      setNodeStats(stats)
      setIsLoading(false)
    }, 500)
  }, [tree])

  // 줌 인
  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2))
  }

  // 줌 아웃
  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))
  }

  // 줌 리셋
  const resetZoom = () => {
    setZoomLevel(1)
  }

  // 노드 검색
  const handleSearch = () => {
    if (!searchTerm) {
      setHighlightedNodeId(null)
      return
    }

    // 트리에서 노드 검색
    const findNode = (nodes: TroubleshootingNode[]): string | null => {
      for (const node of nodes) {
        if (
          node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.title.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return node.id
        }
        if (node.children) {
          const found = findNode(node.children)
          if (found) return found
        }
      }
      return null
    }

    const foundNodeId = findNode(tree)
    setHighlightedNodeId(foundNodeId)

    // 찾은 노드로 스크롤
    if (foundNodeId && svgRef.current) {
      const nodeElement = svgRef.current.querySelector(`[data-node-id="${foundNodeId}"]`)
      if (nodeElement) {
        nodeElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  // 노드 색상 계산 (사용 빈도에 따라)
  const getNodeColor = (nodeId: string) => {
    const stats = nodeStats[nodeId]
    if (!stats) return "#e2e8f0" // 기본 색상

    // 방문 횟수에 따른 색상 계산
    const visits = stats.visits
    if (visits > 100) return "#4ade80" // 많은 방문
    if (visits > 50) return "#a3e635" // 중간 방문
    if (visits > 20) return "#facc15" // 적은 방문
    return "#f87171" // 매우 적은 방문
  }

  // 노드 테두리 색상 계산 (성공률에 따라)
  const getNodeBorderColor = (nodeId: string) => {
    const stats = nodeStats[nodeId]
    if (!stats) return "#94a3b8" // 기본 테두리 색상

    // 성공률에 따른 테두리 색상 계산
    const successRate = stats.successRate
    if (successRate > 0.8) return "#22c55e" // 높은 성공률
    if (successRate > 0.6) return "#84cc16" // 중간 성공률
    if (successRate > 0.4) return "#eab308" // 낮은 성공률
    return "#ef4444" // 매우 낮은 성공률
  }

  // 노드 렌더링 함수
  const renderNode = (node: TroubleshootingNode, x: number, y: number, level: number) => {
    const isHighlighted = highlightedNodeId === node.id
    const nodeWidth = 180
    const nodeHeight = 80
    const horizontalSpacing = 200
    const verticalSpacing = 120

    // 노드 통계
    const stats = nodeStats[node.id]
    const visits = stats?.visits || 0
    const successRate = stats?.successRate || 0
    const exitRate = stats?.exitRate || 0

    // 자식 노드 렌더링
    const childrenCount = node.children?.length || 0
    const childrenElements = []
    const connections = []

    if (node.children) {
      const totalWidth = childrenCount * horizontalSpacing
      const startX = x - totalWidth / 2 + horizontalSpacing / 2

      for (let i = 0; i < childrenCount; i++) {
        const childX = startX + i * horizontalSpacing
        const childY = y + verticalSpacing

        // 연결선
        connections.push(
          <path
            key={`connection-${node.id}-${node.children[i].id}`}
            d={`M${x},${y + nodeHeight / 2} C${x},${y + verticalSpacing / 2} ${childX},${
              y + verticalSpacing / 2
            } ${childX},${childY - nodeHeight / 2}`}
            stroke="#94a3b8"
            strokeWidth={isHighlighted ? 3 : 1.5}
            fill="none"
          />,
        )

        // 자식 노드 재귀적 렌더링
        childrenElements.push(renderNode(node.children[i], childX, childY, level + 1))
      }
    }

    return (
      <g key={node.id}>
        {/* 연결선 */}
        {connections}

        {/* 노드 */}
        <g transform={`translate(${x - nodeWidth / 2}, ${y - nodeHeight / 2})`} data-node-id={node.id}>
          <rect
            width={nodeWidth}
            height={nodeHeight}
            rx={8}
            fill={getNodeColor(node.id)}
            stroke={getNodeBorderColor(node.id)}
            strokeWidth={isHighlighted ? 3 : 1.5}
            className="transition-all duration-200"
            opacity={searchTerm && !isHighlighted ? 0.5 : 1}
          />
          <text x={10} y={20} fontSize={12} fontWeight="bold" fill="#1e293b">
            {node.title.length > 20 ? node.title.substring(0, 18) + "..." : node.title}
          </text>
          <text x={10} y={40} fontSize={10} fill="#475569">
            ID: {node.id}
          </text>
          <text x={10} y={55} fontSize={10} fill="#475569">
            방문: {visits}회
          </text>
          <text x={10} y={70} fontSize={10} fill="#475569">
            성공률: {(successRate * 100).toFixed(1)}%
          </text>
        </g>

        {/* 자식 노드 */}
        {childrenElements}
      </g>
    )
  }

  // 트리 높이 계산
  const calculateTreeHeight = (nodes: TroubleshootingNode[], level = 0): number => {
    let maxHeight = level
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        const childHeight = calculateTreeHeight(node.children, level + 1)
        maxHeight = Math.max(maxHeight, childHeight)
      }
    }
    return maxHeight
  }

  // 트리 너비 계산
  const calculateTreeWidth = (nodes: TroubleshootingNode[]): number => {
    let count = 0
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        count += calculateTreeWidth(node.children)
      } else {
        count += 1
      }
    }
    return Math.max(count, nodes.length)
  }

  const treeHeight = calculateTreeHeight(tree) + 1
  const treeWidth = Math.max(calculateTreeWidth(tree), 5)
  const svgHeight = treeHeight * 120 + 100
  const svgWidth = treeWidth * 200 + 100

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="search-node" className="sr-only">
            노드 검색
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="search-node"
              placeholder="노드 ID 또는 제목으로 검색..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleSearch}>
          검색
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={resetZoom}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-auto bg-gray-50 h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="relative overflow-auto h-full">
            <svg
              ref={svgRef}
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: "0 0" }}
            >
              <g transform="translate(50, 50)">
                {tree.map((rootNode, index) => {
                  const x = (svgWidth - 100) / 2
                  const y = 50
                  return renderNode(rootNode, x, y, 0)
                })}
              </g>
            </svg>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mt-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-400"></div>
            <span className="text-sm">많은 방문 (100+)</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-lime-400"></div>
            <span className="text-sm">중간 방문 (50+)</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span className="text-sm">적은 방문 (20+)</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-400"></div>
            <span className="text-sm">매우 적은 방문 (&lt;20)</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
