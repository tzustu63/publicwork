'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Users,
  FileText,
  TrendingUp,
  MapPin,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react'

// 模擬統計資料
const stats = {
  totalConstituents: 1234,
  levelA: 156,
  levelB: 423,
  levelC: 655,
  totalCases: 89,
  pendingCases: 23,
  closedCases: 66,
  satisfactionRate: 87
}

const townshipStats = [
  { name: '花蓮市', constituents: 456, cases: 34, coverage: 78 },
  { name: '吉安鄉', constituents: 234, cases: 18, coverage: 65 },
  { name: '新城鄉', constituents: 123, cases: 12, coverage: 52 },
  { name: '壽豐鄉', constituents: 98, cases: 8, coverage: 45 },
  { name: '鳳林鎮', constituents: 87, cases: 6, coverage: 38 }
]

const caseTypeStats = [
  { type: '陳情協調', count: 34, percentage: 38 },
  { type: '公共建設會勘', count: 28, percentage: 31 },
  { type: '法律諮詢', count: 15, percentage: 17 },
  { type: '行政諮詢', count: 12, percentage: 14 }
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">分析報表</h1>
          <p className="text-muted-foreground mt-1">選民統計、案件分析、服務覆蓋率</p>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="時間範圍" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部時間</SelectItem>
            <SelectItem value="year">今年</SelectItem>
            <SelectItem value="quarter">本季</SelectItem>
            <SelectItem value="month">本月</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mt-4">{stats.totalConstituents.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">選民總數</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mt-4">{stats.levelA}</p>
            <p className="text-sm text-muted-foreground">A級鐵票</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mt-4">{stats.totalCases}</p>
            <p className="text-sm text-muted-foreground">總案件數</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mt-4">{stats.satisfactionRate}%</p>
            <p className="text-sm text-muted-foreground">滿意度</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Constituent Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              選民分級統計
            </CardTitle>
            <CardDescription>基本盤分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">A級 - 鐵票</span>
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">{stats.levelA} 人 ({Math.round(stats.levelA / stats.totalConstituents * 100)}%)</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    style={{ width: `${stats.levelA / stats.totalConstituents * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">B級 - 友善</span>
                  <span className="text-sm text-blue-600 dark:text-blue-400">{stats.levelB} 人 ({Math.round(stats.levelB / stats.totalConstituents * 100)}%)</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                    style={{ width: `${stats.levelB / stats.totalConstituents * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">C級 - 搖擺</span>
                  <span className="text-sm text-muted-foreground">{stats.levelC} 人 ({Math.round(stats.levelC / stats.totalConstituents * 100)}%)</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-slate-500 to-slate-400 rounded-full"
                    style={{ width: `${stats.levelC / stats.totalConstituents * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">預估基本盤</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.levelA + Math.round(stats.levelB * 0.7)} 票
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                A級 + B級×70% 估算
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Case Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              案件類型統計
            </CardTitle>
            <CardDescription>服務案件分佈</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {caseTypeStats.map((item) => (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">{item.type}</span>
                    <span className="text-sm text-muted-foreground">{item.count} 件 ({item.percentage}%)</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Township Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            鄉鎮市服務覆蓋率
          </CardTitle>
          <CardDescription>各鄉鎮選民與案件統計</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">鄉鎮市</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">選民數</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">案件數</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">覆蓋率</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium">狀態</th>
                </tr>
              </thead>
              <tbody>
                {townshipStats.map((township) => (
                  <tr key={township.name} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-foreground font-medium">{township.name}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{township.constituents}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{township.cases}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={township.coverage >= 60 ? 'text-emerald-600 dark:text-emerald-400' : township.coverage >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>
                        {township.coverage}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {township.coverage >= 60 ? (
                        <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50">良好</Badge>
                      ) : township.coverage >= 40 ? (
                        <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50">普通</Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50">待加強</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
