'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  FileText,
  Calendar,
  AlertCircle,
  TrendingUp,
  Plus,
  ChevronRight,
  Clock
} from 'lucide-react'
import Link from 'next/link'

// 模擬資料（之後會從 API 取得）
const stats = [
  { name: '選民總數', value: '1,234', icon: Users, change: '+12%', changeType: 'positive' },
  { name: '待處理案件', value: '23', icon: FileText, change: '5 件超期', changeType: 'warning' },
  { name: '本月活動', value: '8', icon: Calendar, change: '3 場待出席', changeType: 'neutral' },
  { name: 'A級選民', value: '156', icon: TrendingUp, change: '+8 本月', changeType: 'positive' }
]

const pendingCases = [
  { id: '1', title: '花蓮市XX路路面破損', type: '會勘', days: 12, priority: 'high' },
  { id: '2', title: '勞資糾紛協調', type: '陳情', days: 5, priority: 'normal' },
  { id: '3', title: '社區路燈申請', type: '會勘', days: 3, priority: 'normal' },
  { id: '4', title: '低收入戶申請諮詢', type: '諮詢', days: 1, priority: 'low' }
]

const todayEvents = [
  { id: '1', title: '王先生公祭', type: '白帖', time: '10:00', location: '花蓮市殯儀館' },
  { id: '2', title: '社區發展協會餐會', type: '地方活動', time: '18:00', location: '吉安鄉公所' }
]

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            歡迎回來，{session?.user?.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {session?.user?.officeName} · {new Date().toLocaleDateString('zh-TW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
            <Link href="/constituents/new">
              <Plus className="mr-2 h-4 w-4" />
              新增選民
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/cases/new">
              <Plus className="mr-2 h-4 w-4" />
              新增案件
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <Badge
                  variant="outline"
                  className={
                    stat.changeType === 'positive'
                      ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                      : stat.changeType === 'warning'
                      ? 'border-amber-500/50 text-amber-600 dark:text-amber-400'
                      : 'border-border text-muted-foreground'
                  }
                >
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">待辦案件</CardTitle>
              <CardDescription>需要處理的案件</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/cases?status=pending">
                查看全部
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingCases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/cases/${caseItem.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      caseItem.priority === 'high'
                        ? 'bg-red-500'
                        : caseItem.priority === 'normal'
                        ? 'bg-amber-500'
                        : 'bg-muted-foreground'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{caseItem.title}</p>
                    <p className="text-xs text-muted-foreground">{caseItem.type}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {caseItem.days > 7 ? (
                      <span className="flex items-center text-red-600 dark:text-red-400">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {caseItem.days} 天
                      </span>
                    ) : (
                      <span className="flex items-center text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {caseItem.days} 天
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">今日行程</CardTitle>
              <CardDescription>需要出席的活動</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/events">
                查看全部
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todayEvents.length > 0 ? (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-12 text-center">
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{event.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.location}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        event.type === '白帖'
                          ? 'border-border text-muted-foreground'
                          : event.type === '紅帖'
                          ? 'border-red-500/50 text-red-600 dark:text-red-400'
                          : 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                      }
                    >
                      {event.type}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>今日沒有活動</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
