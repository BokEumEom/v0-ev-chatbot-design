import type { TroubleshootingNode } from "@/types/troubleshooting"

// 노드 ID로 노드 찾기
export function findNodeById(nodeId: string, nodes: TroubleshootingNode[]): TroubleshootingNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node
    if (node.children) {
      const found = findNodeById(nodeId, node.children)
      if (found) return found
    }
  }
  return null
}

// 경로 찾기 (루트에서 특정 노드까지)
export function findPathToNode(
  nodeId: string,
  nodes: TroubleshootingNode[],
  path: TroubleshootingNode[] = [],
): TroubleshootingNode[] | null {
  for (const node of nodes) {
    const newPath = [...path, node]

    if (node.id === nodeId) return newPath

    if (node.children) {
      const foundPath = findPathToNode(nodeId, node.children, newPath)
      if (foundPath) return foundPath
    }
  }

  return null
}

// 리프 노드 찾기 (해결책 노드)
export function findLeafNodes(nodes: TroubleshootingNode[]): TroubleshootingNode[] {
  const leafNodes: TroubleshootingNode[] = []

  function traverse(node: TroubleshootingNode) {
    if (!node.children || node.children.length === 0) {
      leafNodes.push(node)
    } else {
      node.children.forEach(traverse)
    }
  }

  nodes.forEach(traverse)
  return leafNodes
}

// 노드 깊이 계산
export function calculateNodeDepth(nodeId: string, nodes: TroubleshootingNode[]): number {
  const path = findPathToNode(nodeId, nodes)
  return path ? path.length - 1 : -1
}
