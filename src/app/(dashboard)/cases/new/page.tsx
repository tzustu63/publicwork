'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NewCasePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [caseTypes, setCaseTypes] = useState<{ value: string; label: string }[]>([])
  const [caseCategories, setCaseCategories] = useState<{ value: string; label: string }[]>([])
  const [townships, setTownships] = useState<string[]>([])
  const [villages, setVillages] = useState<{ id: string; village: string }[]>([])
  const [selectedTownship, setSelectedTownship] = useState<string>('')

  useEffect(() => {
    // 載入案件類型
    fetch('/api/options?category=caseType')
      .then(res => res.json())
      .then(data => setCaseTypes(data))
      .catch(err => console.error('Error:', err))

    // 載入案件類別
    fetch('/api/options?category=caseCategory')
      .then(res => res.json())
      .then(data => setCaseCategories(data))
      .catch(err => console.error('Error:', err))

    // 載入鄉鎮
    fetch('/api/districts')
      .then(res => res.json())
      .then(data => setTownships(data))
      .catch(err => console.error('Error:', err))
  }, [])

  useEffect(() => {
    if (selectedTownship) {
      fetch(`/api/districts?township=${encodeURIComponent(selectedTownship)}`)
        .then(res => res.json())
        .then(data => setVillages(data))
        .catch(err => console.error('Error:', err))
    } else {
      setVillages([])
    }
  }, [selectedTownship])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      caseType: formData.get('caseType') as string,
      caseCategory: formData.get('caseCategory') as string,
      priority: formData.get('priority') as string || 'NORMAL',
      districtId: formData.get('districtId') as string,
      location: formData.get('location') as string
    }

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        toast.success('案件新增成功')
        router.push('/cases')
      } else {
        const error = await res.json()
        toast.error(error.error || '新增失敗')
      }
    } catch (error) {
      toast.error('發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/cases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">新增案件</h1>
          <p className="text-muted-foreground mt-1">建立新的服務案件</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 案件資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>案件資訊</CardTitle>
              <CardDescription>基本案件內容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">案件標題 *</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="簡述案件內容"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>案件類型 *</Label>
                  <Select name="caseType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇類型" />
                    </SelectTrigger>
                    <SelectContent>
                      {caseTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>案件類別</Label>
                  <Select name="caseCategory">
                    <SelectTrigger>
                      <SelectValue placeholder="選擇類別" />
                    </SelectTrigger>
                    <SelectContent>
                      {caseCategories.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>優先程度</Label>
                <Select name="priority" defaultValue="NORMAL">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">低</SelectItem>
                    <SelectItem value="NORMAL">一般</SelectItem>
                    <SelectItem value="HIGH">高</SelectItem>
                    <SelectItem value="URGENT">緊急</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">案件描述</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="詳細描述案件內容..."
                  className="min-h-32"
                />
              </div>
            </CardContent>
          </Card>

          {/* 地點資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>地點資訊</CardTitle>
              <CardDescription>案件發生地點（會勘用）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>鄉鎮市區</Label>
                  <Select value={selectedTownship} onValueChange={setSelectedTownship}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇鄉鎮市區" />
                    </SelectTrigger>
                    <SelectContent>
                      {townships.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>村里</Label>
                  <Select name="districtId" disabled={!selectedTownship}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇村里" />
                    </SelectTrigger>
                    <SelectContent>
                      {villages.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.village}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">詳細地點</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="例：XX路與YY街口"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                儲存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                建立案件
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
