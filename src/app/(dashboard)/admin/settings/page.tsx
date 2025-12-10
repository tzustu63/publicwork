'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  DialogTrigger,
  DialogFooter,
  DialogClose
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
  Tags,
  Sun,
  Moon,
  Monitor,
  Loader2,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface TagCategory {
  id: string
  name: string
  sortOrder: number
  tags: Tag[]
  _count: { tags: number }
}

interface Tag {
  id: string
  name: string
  color: string | null
  categoryId: string
  isActive: boolean
  sortOrder: number
  category?: TagCategory
  _count?: { constituents: number }
}

// 預設顏色選項
const colorOptions = [
  { value: 'emerald', label: '綠色', class: 'bg-emerald-500' },
  { value: 'blue', label: '藍色', class: 'bg-blue-500' },
  { value: 'purple', label: '紫色', class: 'bg-purple-500' },
  { value: 'amber', label: '橙色', class: 'bg-amber-500' },
  { value: 'red', label: '紅色', class: 'bg-red-500' },
  { value: 'pink', label: '粉色', class: 'bg-pink-500' },
  { value: 'gray', label: '灰色', class: 'bg-gray-500' }
]

// 模擬用戶資料（之後可改接 API）
const mockUsers = [
  { id: '1', name: '系統管理員', email: 'admin@example.com', role: 'ADMIN', isActive: true },
  { id: '2', name: '測試助理', email: 'staff@example.com', role: 'STAFF', isActive: true }
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('tags')
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()

  // 標籤相關 state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('emerald')
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isAddTagOpen, setIsAddTagOpen] = useState(false)

  // 取得標籤分類
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<TagCategory[]>({
    queryKey: ['tag-categories'],
    queryFn: async () => {
      const res = await fetch('/api/tag-categories')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

  // 設定預設選擇的分類
  const currentCategory = selectedCategoryId 
    ? categories.find(c => c.id === selectedCategoryId)
    : categories[0]

  // 新增分類
  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/tag-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, sortOrder: categories.length })
      })
      if (!res.ok) throw new Error('Failed to create')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tag-categories'] })
      setNewCategoryName('')
      setIsAddCategoryOpen(false)
      toast.success('分類已新增')
    },
    onError: () => toast.error('新增失敗')
  })

  // 新增標籤
  const addTagMutation = useMutation({
    mutationFn: async (data: { name: string; categoryId: string; color: string }) => {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tag-categories'] })
      setNewTagName('')
      setNewTagColor('emerald')
      setIsAddTagOpen(false)
      toast.success('標籤已新增')
    },
    onError: () => toast.error('新增失敗')
  })

  // 更新標籤
  const updateTagMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Tag> }) => {
      const res = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tag-categories'] })
      setEditingTag(null)
      toast.success('標籤已更新')
    },
    onError: () => toast.error('更新失敗')
  })

  // 刪除標籤
  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tag-categories'] })
      toast.success('標籤已刪除')
    },
    onError: () => toast.error('刪除失敗')
  })

  const getColorClass = (color: string | null) => {
    const found = colorOptions.find(c => c.value === color)
    return found?.class || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">系統設定</h1>
        <p className="text-muted-foreground mt-1">管理用戶帳號、標籤與系統選項</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tags">
            <Tags className="w-4 h-4 mr-2" />
            標籤管理
          </TabsTrigger>
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

        {/* Tags Management */}
        <TabsContent value="tags" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Category List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">標籤分類</CardTitle>
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>新增標籤分類</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>分類名稱</Label>
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="例如：服務紀錄、特殊身分..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">取消</Button>
                      </DialogClose>
                      <Button
                        onClick={() => addCategoryMutation.mutate(newCategoryName)}
                        disabled={!newCategoryName || addCategoryMutation.isPending}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                      >
                        {addCategoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        新增
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-2">
                {categoriesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                          currentCategory?.id === cat.id
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {cat._count.tags}
                        </Badge>
                      </button>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-center py-4 text-muted-foreground text-sm">
                        尚無分類
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags List */}
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{currentCategory?.name || '選擇分類'}</CardTitle>
                  <CardDescription>
                    管理此分類下的標籤
                  </CardDescription>
                </div>
                {currentCategory && (
                  <Dialog open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
                        <Plus className="w-4 h-4 mr-1" />
                        新增標籤
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>新增標籤</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>標籤名稱</Label>
                          <Input
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="輸入標籤名稱"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>顏色</Label>
                          <div className="flex gap-2 flex-wrap">
                            {colorOptions.map((color) => (
                              <button
                                key={color.value}
                                onClick={() => setNewTagColor(color.value)}
                                className={`w-8 h-8 rounded-full ${color.class} ${
                                  newTagColor === color.value
                                    ? 'ring-2 ring-offset-2 ring-emerald-500'
                                    : ''
                                }`}
                                title={color.label}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">取消</Button>
                        </DialogClose>
                        <Button
                          onClick={() => currentCategory && addTagMutation.mutate({
                            name: newTagName,
                            categoryId: currentCategory.id,
                            color: newTagColor
                          })}
                          disabled={!newTagName || addTagMutation.isPending}
                          className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                        >
                          {addTagMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          新增
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                {currentCategory?.tags && currentCategory.tags.length > 0 ? (
                  <div className="space-y-2">
                    {currentCategory.tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className={`w-4 h-4 rounded-full ${getColorClass(tag.color)}`} />
                        <span className="flex-1 text-foreground">{tag.name}</span>
                        <Switch
                          checked={tag.isActive}
                          onCheckedChange={(checked) => updateTagMutation.mutate({
                            id: tag.id,
                            data: { isActive: checked }
                          })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTag(tag)}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('確定要刪除此標籤？')) {
                              deleteTagMutation.mutate(tag.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    {currentCategory ? '此分類尚無標籤' : '請先選擇分類'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Edit Tag Dialog */}
          <Dialog open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>編輯標籤</DialogTitle>
              </DialogHeader>
              {editingTag && (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>標籤名稱</Label>
                    <Input
                      value={editingTag.name}
                      onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>顏色</Label>
                    <div className="flex gap-2 flex-wrap">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setEditingTag({ ...editingTag, color: color.value })}
                          className={`w-8 h-8 rounded-full ${color.class} ${
                            editingTag.color === color.value
                              ? 'ring-2 ring-offset-2 ring-emerald-500'
                              : ''
                          }`}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">取消</Button>
                </DialogClose>
                <Button
                  onClick={() => editingTag && updateTagMutation.mutate({
                    id: editingTag.id,
                    data: { name: editingTag.name, color: editingTag.color }
                  })}
                  disabled={updateTagMutation.isPending}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                >
                  {updateTagMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  儲存
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

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
          <Card>
            <CardHeader>
              <CardTitle>選項管理</CardTitle>
              <CardDescription>管理案件類型、職業等下拉選單選項（功能開發中）</CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center text-muted-foreground">
              此功能尚在開發中
            </CardContent>
          </Card>
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
