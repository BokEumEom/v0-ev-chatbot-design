"use client"

import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts"

// 일일 대화량 데이터
const conversationsData = [
  { date: "5/1", conversations: 120 },
  { date: "5/2", conversations: 145 },
  { date: "5/3", conversations: 132 },
  { date: "5/4", conversations: 167 },
  { date: "5/5", conversations: 182 },
  { date: "5/6", conversations: 169 },
  { date: "5/7", conversations: 152 },
  { date: "5/8", conversations: 187 },
  { date: "5/9", conversations: 192 },
  { date: "5/10", conversations: 210 },
  { date: "5/11", conversations: 185 },
  { date: "5/12", conversations: 172 },
  { date: "5/13", conversations: 165 },
  { date: "5/14", conversations: 178 },
]

// 인텐트 분포 데이터
const intentData = [
  { name: "충전소 위치", value: 35 },
  { name: "충전 요금", value: 25 },
  { name: "충전기 유형", value: 15 },
  { name: "고장 신고", value: 10 },
  { name: "이용 방법", value: 15 },
]

// 성능 지표 데이터
const performanceData = [
  { date: "5/1", responseTime: 1.5, accuracy: 85, satisfaction: 88 },
  { date: "5/2", responseTime: 1.4, accuracy: 86, satisfaction: 87 },
  { date: "5/3", responseTime: 1.3, accuracy: 87, satisfaction: 89 },
  { date: "5/4", responseTime: 1.4, accuracy: 86, satisfaction: 90 },
  { date: "5/5", responseTime: 1.2, accuracy: 88, satisfaction: 91 },
  { date: "5/6", responseTime: 1.1, accuracy: 89, satisfaction: 92 },
  { date: "5/7", responseTime: 1.0, accuracy: 90, satisfaction: 93 },
  { date: "5/8", responseTime: 1.1, accuracy: 91, satisfaction: 92 },
  { date: "5/9", responseTime: 1.0, accuracy: 92, satisfaction: 94 },
  { date: "5/10", responseTime: 0.9, accuracy: 93, satisfaction: 95 },
]

// 피드백 분석 데이터
const feedbackData = [
  { category: "매우 만족", count: 45 },
  { category: "만족", count: 35 },
  { category: "보통", count: 15 },
  { category: "불만족", count: 3 },
  { category: "매우 불만족", count: 2 },
]

// 색상 배열
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

// BarChart 컴포넌트 추가
export function BarChart({ data, xKey = "name", yKey = "value" }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={yKey} fill="#8884d8" />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

// LineChart 컴포넌트 추가
export function LineChart({ data, xKey = "date", yKey = "value", stroke = "#8884d8" }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={yKey} stroke={stroke} activeDot={{ r: 8 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

// PieChart 컴포넌트 추가
export function PieChart({ data, dataKey = "value", nameKey = "name", colors = COLORS }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          dataKey={dataKey}
          isAnimationActive={false}
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

export const Charts = {
  ConversationsChart: () => (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={conversationsData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="conversations" stroke="#8884d8" activeDot={{ r: 8 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  ),
  IntentDistributionChart: () => (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          dataKey="value"
          isAnimationActive={false}
          data={intentData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {intentData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  ),
  PerformanceMetricsChart: () => (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={performanceData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="responseTime" stroke="#82ca9d" name="응답 시간" />
        <Line type="monotone" dataKey="accuracy" stroke="#8884d8" name="정확도" />
        <Line type="monotone" dataKey="satisfaction" stroke="#ffc658" name="만족도" />
      </RechartsLineChart>
    </ResponsiveContainer>
  ),
  FeedbackAnalysisChart: () => (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          dataKey="count"
          isAnimationActive={false}
          data={feedbackData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {feedbackData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  ),
}
