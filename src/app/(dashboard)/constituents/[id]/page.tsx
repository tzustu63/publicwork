'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Pencil, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Briefcase,
  User,
  Loader2
} from 'lucide-react'

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
  tags: { tag: { id: string; name: string } }[]
  createdAt: string
  updatedAt: string
}

export default function ConstituentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: constituent, isLoading, error } = useQuery<Constituent>({
    queryKey: ['constituent', id],
    queryFn: async () => {
      const res = await fetch(`/api/constituents/${id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

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
          <CardHeader>
            <CardTitle className="text-base">標籤</CardTitle>
          </CardHeader>
          <CardContent>
            {constituent.tags && constituent.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {constituent.tags.map((t) => (
                  <Badge key={t.tag.id} variant="outline">
                    {t.tag.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">尚無標籤</p>
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


