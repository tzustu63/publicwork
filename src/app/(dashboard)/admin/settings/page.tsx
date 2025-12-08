'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Settings,
  Users,
  ListPlus,
  Plus,
  Pencil,
  GripVertical,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'

// 模擬資料
const mockUsers = [
  { id: '1', name: '系統管理員', email: 'admin@example.com', role: 'ADMIN', isActive: true },
  { id: '2', name: '測試助理', email: 'staff@example.com', role: 'STAFF', isActive: true },
  { id: '3', name: '王小明', email: 'wang@example.com', role: 'STAFF', isActive: true },
  { id: '4', name: '李小華', email: 'lee@example.com', role: 'STAFF', isActive: false }
]

const mockOptionCategories = [
  {
    category: 'caseType',
    label: '案件類型',
    options: [
      { value: 'petition', label: '陳情協調', isActive: true },
      { value: 'inspection', label: '公共建設會勘', isActive: true },
      { value: 'legal', label: '法律諮詢', isActive: true },
      { value: 'administrative', label: '行政諮詢', isActive: true }
    ]
  },
  {
    category: 'caseCategory',
    label: '案件類別',
    options: [
      { value: 'labor', label: '勞資糾紛', isActive: true },
      { value: 'traffic', label: '交通罰單', isActive: true },
      { value: 'road', label: '道路問題', isActive: true },
      { value: 'drainage', label: '水溝排水', isActive: true }
    ]
  },
  {
    category: 'relationLevel',
    label: '關係等級',
    options: [
      { value: 'A', label: 'A級 - 鐵票', isActive: true },
      { value: 'B', label: 'B級 - 友善', isActive: true },
      { value: 'C', label: 'C級 - 搖擺', isActive: true }
    ]
  }
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [selectedCategory, setSelectedCategory] = useState(mockOptionCategories[0].category)
  const { theme, setTheme } = useTheme()

  const currentCategory = mockOptionCategories.find(c => c.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">系統設定</h1>
        <p className="text-muted-foreground mt-1">管理用戶帳號與系統選項</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            用戶管理
          </TabsTrigger>
          <TabsTrigger value="options">
            <ListPlus className="w-4 h-4 mr-2" />
            選項管理
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="w-4 h-4 mr-2" />
            系統設定
          </TabsTrigger>
        </TabsList>

        {/* Users Management */}
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>用戶帳號</CardTitle>
                <CardDescription>管理辦公室助理帳號</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    新增用戶
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新增用戶</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>姓名</Label>
                      <Input />
                    </div>
                    <div className="space-y-2">
                      <Label>電子郵件</Label>
                      <Input type="email" />
                    </div>
                    <div className="space-y-2">
                      <Label>角色</Label>
                      <Select defaultValue="STAFF">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">管理員</SelectItem>
                          <SelectItem value="STAFF">一般助理</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
                      建立帳號
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>姓名</TableHead>
                    <TableHead>電子郵件</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          user.role === 'ADMIN'
                            ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                            : 'border-border text-muted-foreground'
                        }>
                          {user.role === 'ADMIN' ? '管理員' : '助理'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          user.isActive
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50'
                            : 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50'
                        }>
                          {user.isActive ? '啟用' : '停用'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Options Management */}
        <TabsContent value="options" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Category List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">選項分類</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {mockOptionCategories.map((cat) => (
                    <button
                      key={cat.category}
                      onClick={() => setSelectedCategory(cat.category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === cat.category
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Options List */}
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{currentCategory?.label}</CardTitle>
                  <CardDescription>
                    管理下拉選單選項（可新增、編輯、停用、排序）
                  </CardDescription>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
                  <Plus className="w-4 h-4 mr-1" />
                  新增選項
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentCategory?.options.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <span className="flex-1 text-foreground">{option.label}</span>
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {option.value}
                      </code>
                      <Switch checked={option.isActive} />
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="mt-4 space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>外觀設定</CardTitle>
              <CardDescription>選擇介面主題</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">主題模式</p>
                  <p className="text-sm text-muted-foreground">選擇淺色或深色主題</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className={theme === 'light' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    淺色
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className={theme === 'dark' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    深色
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('system')}
                    className={theme === 'system' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    系統
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Office Settings */}
          <Card>
            <CardHeader>
              <CardTitle>辦公室設定</CardTitle>
              <CardDescription>基本系統設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>辦公室名稱</Label>
                  <Input defaultValue="花蓮縣議員服務處" />
                </div>
                <div className="space-y-2">
                  <Label>服務縣市</Label>
                  <Input defaultValue="花蓮縣" disabled />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">案件提醒設定</h4>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">案件超期警示天數</p>
                    <p className="text-sm text-muted-foreground">案件超過此天數未更新將標示警告</p>
                  </div>
                  <Input
                    type="number"
                    defaultValue={7}
                    className="w-20 text-center"
                  />
                </div>
              </div>

              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
                儲存設定
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
