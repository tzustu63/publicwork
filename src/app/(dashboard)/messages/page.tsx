'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  MessageSquare,
  Send,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

// 模擬資料
const mockMessages = [
  {
    id: '1',
    type: 'SMS',
    content: '王先生您好，您反映的XX路已鋪設完成，感謝您的建議。',
    recipient: '王大明',
    status: 'DELIVERED',
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    type: 'SMS',
    content: '天冷了記得添衣，祝您身體健康！',
    recipient: '批次發送 (156人)',
    status: 'SENT',
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    type: 'LINE',
    content: '您好，我是XX議員，感謝您一直以來的支持...',
    recipient: '李小華',
    status: 'FAILED',
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
]

const mockTemplates = [
  { id: '1', name: '生日祝福', content: '{{name}} 您好，祝您生日快樂！身體健康、萬事如意！' },
  { id: '2', name: '案件完成通知', content: '{{name}} 您好，您反映的{{case}}已處理完成，感謝您的建議。' },
  { id: '3', name: '節慶問候', content: '{{name}} 您好，{{holiday}}愉快！祝您闔家平安！' }
]

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('send')
  const [messageType, setMessageType] = useState('SMS')
  const [content, setContent] = useState('')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50"><CheckCircle className="w-3 h-3 mr-1" />已送達</Badge>
      case 'SENT':
        return <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50"><Clock className="w-3 h-3 mr-1" />已發送</Badge>
      case 'FAILED':
        return <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50"><XCircle className="w-3 h-3 mr-1" />發送失敗</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">通訊中心</h1>
          <p className="text-muted-foreground mt-1">發送 SMS、LINE 訊息給選民</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="send">
            <Send className="w-4 h-4 mr-2" />
            發送訊息
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="w-4 h-4 mr-2" />
            發送紀錄
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="w-4 h-4 mr-2" />
            訊息範本
          </TabsTrigger>
        </TabsList>

        {/* Send Message */}
        <TabsContent value="send" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>撰寫訊息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Select value={messageType} onValueChange={setMessageType}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="類型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMS">SMS 簡訊</SelectItem>
                        <SelectItem value="LINE">LINE</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="選擇範本（選用）" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockTemplates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Textarea
                    placeholder="輸入訊息內容..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-32"
                  />

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>字數：{content.length} / 70（SMS 每則上限）</span>
                    <span>預估費用：NT$ {Math.ceil(content.length / 70) * 1.5}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
                      <Send className="w-4 h-4 mr-2" />
                      發送訊息
                    </Button>
                    <Button variant="outline">
                      預覽
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>收件人</CardTitle>
                  <CardDescription>選擇發送對象</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    從選民列表選擇
                  </Button>
                  <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">尚未選擇收件人</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Message History */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>發送紀錄</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    msg.type === 'SMS' ? 'bg-blue-500/20' : 'bg-green-500/20'
                  }`}>
                    <MessageSquare className={`w-5 h-5 ${
                      msg.type === 'SMS' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{msg.recipient}</span>
                      {getStatusBadge(msg.status)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{msg.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(msg.sentAt, 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>訊息範本</CardTitle>
              <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
                <Plus className="w-4 h-4 mr-1" />
                新增範本
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <h4 className="font-medium text-foreground mb-2">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">{template.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
