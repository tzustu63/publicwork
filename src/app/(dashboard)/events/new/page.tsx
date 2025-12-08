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

export default function NewEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [eventTypes, setEventTypes] = useState<{ value: string; label: string }[]>([])
  const [selectedType, setSelectedType] = useState<string>('')

  useEffect(() => {
    fetch('/api/options?category=eventType')
      .then(res => res.json())
      .then(data => setEventTypes(data))
      .catch(err => console.error('Error:', err))
  }, [])

  const isRedWhiteEvent = selectedType === 'wedding' || selectedType === 'funeral'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      eventType: formData.get('eventType') as string,
      description: formData.get('description') as string,
      eventDate: formData.get('eventDate') as string,
      location: formData.get('location') as string,
      hostName: formData.get('hostName') as string,
      deceasedName: formData.get('deceasedName') as string
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        toast.success('活動新增成功')
        router.push('/events')
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
        <Link href="/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">新增活動</h1>
          <p className="text-muted-foreground mt-1">建立新的活動或紅白帖</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>活動資訊</CardTitle>
            <CardDescription>填寫活動詳細資訊</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">活動名稱 *</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="例：王先生公祭、陳小姐婚禮"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>活動類型 *</Label>
                <Select
                  name="eventType"
                  required
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇類型" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">活動日期 *</Label>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="datetime-local"
                  required
                />
              </div>
            </div>

            {isRedWhiteEvent && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hostName">主人家姓名</Label>
                  <Input
                    id="hostName"
                    name="hostName"
                    placeholder="例：王家"
                  />
                </div>
                {selectedType === 'funeral' && (
                  <div className="space-y-2">
                    <Label htmlFor="deceasedName">往生者姓名</Label>
                    <Input
                      id="deceasedName"
                      name="deceasedName"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="location">活動地點</Label>
              <Input
                id="location"
                name="location"
                placeholder="例：花蓮市殯儀館、美侖大飯店"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">備註</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="其他需要記錄的資訊..."
                className="min-h-24"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4 mt-6 max-w-2xl">
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
                建立活動
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
