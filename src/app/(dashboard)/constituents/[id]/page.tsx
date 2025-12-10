'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowLeft, 
  Pencil, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Briefcase,
  User,
  Loader2,
  Tags,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'

interface Tag {
  id: string
  name: string
  color: string | null
  category: { id: string; name: string }
}

interface TagCategory {
  id: string
  name: string
  tags: Tag[]
}

interface Constituent {
  id: string
  name: string
  phone: string | null
  phone2: string | null
  email: string | null
  birthday: string | null
  gender: string | null
  occupation: string | null
  note: string | null
  address: string | null
  relationLevel: string | null
  influence: string | null
  district: { township: string; village: string } | null
  tags: { tag: Tag }[]
  createdAt: string
  updatedAt: string
}

const colorClasses: Record<string, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50',
  blue: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50',
  purple: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/50',
  amber: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50',
  red: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50',
  pink: 'bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/50',
  gray: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/50'
}

export default function ConstituentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  const { data: constituent, isLoading, error } = useQuery<Constituent>({
    queryKey: ['constituent', id],
    queryFn: async () => {
      const res = await fetch(`/api/constituents/${id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

  // 取得所有標籤分類
  const { data: categories = [] } = useQuery<TagCategory[]>({
    queryKey: ['tag-categories'],
    queryFn: async () => {
      const res = await fetch('/api/tag-categories')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

  // 更新選民標籤
  const updateTagsMutation = useMutation({
    mutationFn: async (tagIds: string[]) => {
      const res = await fetch(`/api/constituents/${id}/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds })
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['constituent', id] })
      queryClient.invalidateQueries({ queryKey: ['constituents'] })
      setIsTagDialogOpen(false)
      toast.success('標籤已更新')
    },
    onError: () => toast.error('更新失敗')
  })

  // 打開標籤對話框時，初始化已選標籤
  const handleOpenTagDialog = () => {
    if (constituent) {
      setSelectedTagIds(constituent.tags.map(t => t.tag.id))
    }
    setIsTagDialogOpen(true)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const getRelationBadge = (level: string | null) => {
    switch (level) {
      case 'A':
        return <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50">A級-鐵票</Badge>
      case 'B':
        return <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50">B級-友善</Badge>
      case 'C':
        return <Badge className="bg-muted text-muted-foreground border-border">C級-搖擺</Badge>
      default:
        return <Badge variant="outline">未分級</Badge>
    }
  }

  const getGenderText = (gender: string | null) => {
    switch (gender) {
      case 'MALE': return '男'
      case 'FEMALE': return '女'
      case 'OTHER': return '其他'
      default: return '-'
    }
  }

  const getTagColorClass = (color: string | null) => {
    return colorClasses[color || 'gray'] || colorClasses.gray
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !constituent) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            找不到此選民資料
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{constituent.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getRelationBadge(constituent.relationLevel)}
              {constituent.influence && (
                <Badge variant="outline">{constituent.influence}</Badge>
              )}
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href={`/constituents/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            編輯
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本資料 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本資料</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">性別</p>
                <p className="font-medium">{getGenderText(constituent.gender)}</p>
              </div>
            </div>
            {constituent.birthday && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">生日</p>
                  <p className="font-medium">{new Date(constituent.birthday).toLocaleDateString('zh-TW')}</p>
                </div>
              </div>
            )}
            {constituent.occupation && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">職業</p>
                  <p className="font-medium">{constituent.occupation}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 聯絡資訊 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">聯絡資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {constituent.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">電話</p>
                  <p className="font-medium">{constituent.phone}</p>
                </div>
              </div>
            )}
            {constituent.phone2 && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">電話2</p>
                  <p className="font-medium">{constituent.phone2}</p>
                </div>
              </div>
            )}
            {constituent.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{constituent.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">地址</p>
                <p className="font-medium">
                  {constituent.district 
                    ? `${constituent.district.township}${constituent.district.village}` 
                    : ''}
                  {constituent.address || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 標籤 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">標籤</CardTitle>
            <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleOpenTagDialog}>
                  <Tags className="mr-2 h-4 w-4" />
                  編輯標籤
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>編輯選民標籤</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[400px] pr-4">
                  <div className="space-y-6 py-4">
                    {categories.map((category) => (
                      <div key={category.id}>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">
                          {category.name}
                        </h4>
                        <div className="space-y-2">
                          {category.tags.map((tag) => (
                            <div
                              key={tag.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                              onClick={() => toggleTag(tag.id)}
                            >
                              <Checkbox
                                checked={selectedTagIds.includes(tag.id)}
                                onCheckedChange={() => toggleTag(tag.id)}
                              />
                              <Badge className={getTagColorClass(tag.color)}>
                                {tag.name}
                              </Badge>
                            </div>
                          ))}
                          {category.tags.length === 0 && (
                            <p className="text-sm text-muted-foreground">此分類尚無標籤</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        尚未建立任何標籤，請先至「系統設定」新增標籤
                      </p>
                    )}
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">取消</Button>
                  </DialogClose>
                  <Button
                    onClick={() => updateTagsMutation.mutate(selectedTagIds)}
                    disabled={updateTagsMutation.isPending}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                  >
                    {updateTagsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    儲存
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {constituent.tags && constituent.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {constituent.tags.map((t) => (
                  <Badge key={t.tag.id} className={getTagColorClass(t.tag.color)}>
                    {t.tag.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plus className="h-4 w-4" />
                <span>點擊「編輯標籤」新增標籤</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 備註 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">備註</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">
              {constituent.note || '無備註'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
