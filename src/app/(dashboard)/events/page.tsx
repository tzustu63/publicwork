'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Calendar, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { zhTW } from 'date-fns/locale'

// 模擬資料
const mockEvents = [
  {
    id: '1',
    title: '王先生公祭',
    eventType: '白帖',
    eventDate: new Date(),
    location: '花蓮市殯儀館',
    hostName: '王家',
    attendance: 'PENDING'
  },
  {
    id: '2',
    title: '社區發展協會餐會',
    eventType: '地方活動',
    eventDate: new Date(),
    location: '吉安鄉公所',
    attendance: 'PENDING'
  },
  {
    id: '3',
    title: '陳小姐婚禮',
    eventType: '紅帖',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    location: '花蓮美侖大飯店',
    hostName: '陳家',
    attendance: 'PENDING'
  },
  {
    id: '4',
    title: '媽祖遶境',
    eventType: '廟會',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    location: '花蓮市',
    attendance: 'PENDING'
  }
]

export default function EventsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case '紅帖':
        return <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50">紅帖</Badge>
      case '白帖':
        return <Badge className="bg-muted text-muted-foreground border-border">白帖</Badge>
      case '廟會':
        return <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50">廟會</Badge>
      case '地方活動':
        return <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50">地方活動</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getAttendanceBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">待出席</Badge>
      case 'ATTENDED':
        return <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50">已出席</Badge>
      case 'DELEGATED':
        return <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50">已派代表</Badge>
      case 'MISSED':
        return <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50">未出席</Badge>
      default:
        return null
    }
  }

  const eventsOnDay = (day: Date) => mockEvents.filter(e => isSameDay(e.eventDate, day))

  const upcomingEvents = mockEvents
    .filter(e => e.eventDate >= new Date())
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">活動管理</h1>
          <p className="text-muted-foreground mt-1">紅白帖、地方活動追蹤</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            新增活動
          </Link>
        </Button>
      </div>

      {/* View Toggle */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'calendar' | 'list')}>
        <TabsList>
          <TabsTrigger value="list">
            列表檢視
          </TabsTrigger>
          <TabsTrigger value="calendar">
            日曆檢視
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">即將到來的活動</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    {/* Date */}
                    <div className="text-center min-w-16">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {format(event.eventDate, 'd')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(event.eventDate, 'EEE', { locale: zhTW })}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{event.title}</h3>
                        {getEventTypeBadge(event.eventType)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                        {event.hostName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {event.hostName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    {getAttendanceBadge(event.attendance)}
                  </div>
                </Link>
              ))}

              {upcomingEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>沒有即將到來的活動</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {format(currentMonth, 'yyyy年 MMMM', { locale: zhTW })}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month start */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 p-1" />
                ))}

                {days.map((day) => {
                  const dayEvents = eventsOnDay(day)
                  return (
                    <div
                      key={day.toISOString()}
                      className={`h-24 p-1 rounded-lg border ${
                        isToday(day)
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <p className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                        {format(day, 'd')}
                      </p>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((event) => (
                          <Link
                            key={event.id}
                            href={`/events/${event.id}`}
                            className={`block text-xs truncate px-1 py-0.5 rounded ${
                              event.eventType === '白帖'
                                ? 'bg-muted text-muted-foreground'
                                : event.eventType === '紅帖'
                                ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {event.title}
                          </Link>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-xs text-muted-foreground px-1">+{dayEvents.length - 2} 更多</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
