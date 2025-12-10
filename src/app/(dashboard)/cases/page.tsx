'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus, Search, Filter, Clock, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import { formatDistanceToNow, differenceInDays } from 'date-fns'
import { zhTW } from 'date-fns/locale'

// 計算超期天數的閾值
const OVERDUE_DAYS = 7

// 模擬資料（使用相對天數）
const createMockDate = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

const mockCases = [
  {
    id: '1',
    title: '花蓮市XX路路面破損',
    type: '會勘',
    category: '道路問題',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    constituent: '王大明',
    createdAt: createMockDate(12),
    updatedAt: createMockDate(2),
    progressCount: 3
  },
  {
    id: '2',
    title: '勞資糾紛協調',
    type: '陳情',
    category: '勞資糾紛',
    status: 'IN_PROGRESS',
    priority: 'NORMAL',
    constituent: '李小華',
    createdAt: createMockDate(5),
    updatedAt: createMockDate(1),
    progressCount: 2
  },
  {
    id: '3',
    title: '社區路燈申請',
    type: '會勘',
    category: '路燈照明',
    status: 'PENDING',
    priority: 'NORMAL',
    constituent: '陳美玲',
    createdAt: createMockDate(3),
    updatedAt: createMockDate(3),
    progressCount: 0
  },
  {
    id: '4',
    title: '低收入戶申請諮詢',
    type: '諮詢',
    category: '社會福利',
    status: 'CLOSED',
    priority: 'LOW',
    constituent: '林淑芬',
    createdAt: createMockDate(10),
    updatedAt: createMockDate(1),
    progressCount: 4
  }
]

export default function CasesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusTab, setStatusTab] = useState('pending')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50">待處理</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50">處理中</Badge>
      case 'CLOSED':
        return <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50">已結案</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      case 'HIGH':
        return <div className="w-2 h-2 rounded-full bg-red-500" />
      case 'NORMAL':
        return <div className="w-2 h-2 rounded-full bg-amber-500" />
      case 'LOW':
        return <div className="w-2 h-2 rounded-full bg-muted-foreground" />
      default:
        return null
    }
  }

  const isOverdue = (updatedAt: Date) => {
    return differenceInDays(new Date(), updatedAt) > OVERDUE_DAYS
  }

  const filteredCases = mockCases.filter((c) => {
    const matchSearch = c.title.includes(search) || c.constituent.includes(search)
    const matchType = typeFilter === 'all' || c.type === typeFilter
    const matchStatus =
      statusTab === 'all' ||
      (statusTab === 'pending' && (c.status === 'PENDING' || c.status === 'IN_PROGRESS')) ||
      (statusTab === 'closed' && c.status === 'CLOSED')
    return matchSearch && matchType && matchStatus
  })

  const pendingCount = mockCases.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length
  const closedCount = mockCases.filter(c => c.status === 'CLOSED').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">案件管理</h1>
          <p className="text-muted-foreground mt-1">追蹤陳情、會勘、諮詢案件進度</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
          <Link href="/cases/new">
            <Plus className="mr-2 h-4 w-4" />
            新增案件
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <TabsList>
          <TabsTrigger value="pending">
            待辦案件 ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="closed">
            已結案 ({closedCount})
          </TabsTrigger>
          <TabsTrigger value="all">
            全部
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusTab} className="mt-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜尋案件標題、選民姓名..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="案件類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部類型</SelectItem>
                    <SelectItem value="陳情">陳情協調</SelectItem>
                    <SelectItem value="會勘">公共建設會勘</SelectItem>
                    <SelectItem value="諮詢">諮詢</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Cases List */}
          <div className="space-y-3">
            {filteredCases.map((caseItem) => (
              <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Priority indicator */}
                      <div className="mt-2">
                        {getPriorityIndicator(caseItem.priority)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-foreground truncate">{caseItem.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {caseItem.constituent} · {caseItem.category}
                            </p>
                          </div>
                          {getStatusBadge(caseItem.status)}
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {caseItem.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(caseItem.updatedAt, { addSuffix: true, locale: zhTW })}更新
                          </span>
                          {caseItem.status !== 'CLOSED' && isOverdue(caseItem.updatedAt) && (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                              <AlertCircle className="h-3 w-3" />
                              超期未更新
                            </span>
                          )}
                          {caseItem.progressCount > 0 && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {caseItem.progressCount} 筆進度
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {filteredCases.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">沒有符合條件的案件</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
