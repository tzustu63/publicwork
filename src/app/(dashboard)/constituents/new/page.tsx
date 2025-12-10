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

interface District {
  id: string
  township: string
  village: string
}

export default function NewConstituentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const [selectedCounty, setSelectedCounty] = useState('花蓮縣')
  const [selectedTownship, setSelectedTownship] = useState('')
  const [selectedDistrictId, setSelectedDistrictId] = useState('')
  const [occupations, setOccupations] = useState<{ value: string; label: string }[]>([])
  const [relationLevels, setRelationLevels] = useState<{ value: string; label: string }[]>([])

  // 載入所有行政區資料
  useEffect(() => {
    fetch('/api/districts?all=true')
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(err => console.error('Error loading districts:', err))

    fetch('/api/options?category=occupation')
      .then(res => res.json())
      .then(data => setOccupations(data))
      .catch(err => console.error('Error loading occupations:', err))

    fetch('/api/options?category=relationLevel')
      .then(res => res.json())
      .then(data => setRelationLevels(data))
      .catch(err => console.error('Error loading relation levels:', err))
  }, [])

  // 取得所有鄉鎮（不重複）
  const townships = [...new Set(districts.map(d => d.township))]

  // 根據選擇的鄉鎮篩選村里
  const villagesByTownship = districts.filter(d => d.township === selectedTownship)

  // 當鄉鎮變更時，清除村里選擇
  const handleTownshipChange = (township: string) => {
    setSelectedTownship(township)
    setSelectedDistrictId('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      phone2: formData.get('phone2') as string,
      email: formData.get('email') as string,
      birthday: formData.get('birthday') as string,
      gender: formData.get('gender') as string,
      occupation: formData.get('occupation') as string,
      districtId: selectedDistrictId,
      address: formData.get('address') as string,
      relationLevel: formData.get('relationLevel') as string,
      note: formData.get('note') as string
    }

    try {
      const res = await fetch('/api/constituents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        toast.success('選民新增成功')
        router.push('/constituents')
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
        <Link href="/constituents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">新增選民</h1>
          <p className="text-muted-foreground mt-1">建立新的選民資料</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基本資料 */}
          <Card>
            <CardHeader>
              <CardTitle>基本資料</CardTitle>
              <CardDescription>選民基本聯絡資訊</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">手機號碼</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="0912-345-678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone2">第二支電話</Label>
                  <Input
                    id="phone2"
                    name="phone2"
                    type="tel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">電子郵件</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthday">生日</Label>
                  <Input
                    id="birthday"
                    name="birthday"
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">性別</Label>
                  <Select name="gender">
                    <SelectTrigger>
                      <SelectValue placeholder="選擇性別" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">男</SelectItem>
                      <SelectItem value="FEMALE">女</SelectItem>
                      <SelectItem value="OTHER">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">職業</Label>
                <Select name="occupation">
                  <SelectTrigger>
                    <SelectValue placeholder="選擇職業" />
                  </SelectTrigger>
                  <SelectContent>
                    {occupations.map(occ => (
                      <SelectItem key={occ.value} value={occ.value}>{occ.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 地址與關係 */}
          <Card>
            <CardHeader>
              <CardTitle>地址與關係經營</CardTitle>
              <CardDescription>戶籍地與關係分級</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 縣市 */}
              <div className="space-y-2">
                <Label>縣市</Label>
                <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇縣市" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="花蓮縣">花蓮縣</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 鄉鎮市區 */}
                <div className="space-y-2">
                  <Label>鄉鎮市區</Label>
                  <Select value={selectedTownship} onValueChange={handleTownshipChange}>
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
                {/* 村里 */}
                <div className="space-y-2">
                  <Label>村里</Label>
                  <Select 
                    value={selectedDistrictId} 
                    onValueChange={setSelectedDistrictId}
                    disabled={!selectedTownship}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedTownship ? "選擇村里" : "請先選擇鄉鎮"} />
                    </SelectTrigger>
                    <SelectContent>
                      {villagesByTownship.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.village}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 詳細地址 */}
              <div className="space-y-2">
                <Label htmlFor="address">詳細地址</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="路街巷弄門牌號"
                />
              </div>

              <div className="space-y-2">
                <Label>關係等級</Label>
                <Select name="relationLevel">
                  <SelectTrigger>
                    <SelectValue placeholder="選擇關係等級" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationLevels.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">備註</Label>
                <Textarea
                  id="note"
                  name="note"
                  placeholder="其他需要記錄的資訊..."
                  className="min-h-24"
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
                儲存
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
