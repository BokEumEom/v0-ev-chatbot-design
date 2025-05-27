import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ConversationAnalyticsSummary } from "@/types/conversation-analytics"

interface IssueTypeAnalysisTableProps {
  summary: ConversationAnalyticsSummary
}

export function IssueTypeAnalysisTable({ summary }: IssueTypeAnalysisTableProps) {
  const { topIssueTypes } = summary

  // 해결률에 따른 배지 색상 결정
  const getResolutionBadgeVariant = (rate: number) => {
    if (rate >= 0.8) return "success"
    if (rate >= 0.5) return "default"
    return "destructive"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>이슈 타입별 분석</CardTitle>
        <CardDescription>가장 빈번한 이슈 타입과 각각의 해결률을 보여줍니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>순위</TableHead>
              <TableHead>이슈 타입</TableHead>
              <TableHead className="text-right">대화 수</TableHead>
              <TableHead className="text-right">비율</TableHead>
              <TableHead className="text-right">해결률</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topIssueTypes.map((issue, index) => (
              <TableRow key={issue.issueType}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{issue.issueType}</TableCell>
                <TableCell className="text-right">{issue.count}</TableCell>
                <TableCell className="text-right">
                  {((issue.count / summary.totalConversations) * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={getResolutionBadgeVariant(issue.resolutionRate)}>
                    {(issue.resolutionRate * 100).toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
