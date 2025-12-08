'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface District {
  id: string
  township: string
  village: string
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
  districtId: string | null
  district: District | null
}

export default function EditConstituentPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    phone2: '',
    email: '',
    birthday: '',
    gender: '',
    occupation: '',
    note: '',
    districtId: '',
    address: '',
    relationLevel: '',
    influence: ''
  })

  // 階層式地址選擇
  const [selectedCounty, setSelectedCounty] = useState('花蓮縣')
  const [selectedTownship, setSelectedTownship] = useState('')

  // 獲取選民資料
  const { data: constituent, isLoading } = useQuery<Constituent>({
    queryKey: ['constituent', id],
    queryFn: async () => {
      const res = await fetch(`/api/constituents/${id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

  // 獲取行政區資料
  const { data: districts = [] } = useQuery<District[]>({
    queryKey: ['districts'],
    queryFn: async () => {
      const res = await fetch('/api/districts')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })

  // 填入現有資料
  useEffect(() => {
    if (constituent) {
      setFormData({
        name: constituent.name || '',
        phone: constituent.phone || '',
        phone2: constituent.phone2 || '',
        email: constituent.email || '',
        birthday: constituent.birthday ? constituent.birthday.split('T')[0] : '',
        gender: constituent.gender || '',
        occupation: constituent.occupation || '',
        note: constituent.note || '',
        districtId: constituent.districtId || '',
        address: constituent.address || '',
        relationLevel: constituent.relationLevel || '',
        influence: constituent.influence || ''
      })
      // 設定鄉鎮
      if (constituent.district) {
        setSelectedTownship(constituent.district.township)
      }
    }
  }, [constituent])

  // 更新 mutation
  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/constituents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '更新失敗')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['constituents'] })
      queryClient.invalidateQueries({ queryKey: ['constituent', id] })
      toast.success('選民資料已更新')
      router.push(`/constituents/${id}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 取得所有鄉鎮（不重複）
  const townships = [...new Set(districts.map(d => d.township))]

  // 根據選擇的鄉鎮篩選村里
  const villagesByTownship = districts.filter(d => d.township === selectedTownship)

  // 當鄉鎮變更時，清除村里選擇
  const handleTownshipChange = (township: string) => {
    setSelectedTownship(township)
    setFormData(prev => ({ ...prev, districtId: '' }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">編輯選民</h1>
          <p className="text-muted-foreground mt-1">修改 {constituent?.name} 的資料</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* 基本資料 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">基本資料</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">性別</Label>
                <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
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
              <div className="space-y-2">
                <Label htmlFor="birthday">生日</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleChange('birthday', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">職業</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 聯絡資訊 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">聯絡資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">電話</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone2">電話2</Label>
                <Input
                  id="phone2"
                  value={formData.phone2}
                  onChange={(e) => handleChange('phone2', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 地區 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">地區</CardTitle>
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

              {/* 鄉鎮市區 */}
              <div className="space-y-2">
                <Label>鄉鎮市區</Label>
                <Select value={selectedTownship} onValueChange={handleTownshipChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="請先選擇鄉鎮市區" />
                  </SelectTrigger>
                  <SelectContent>
                    {townships.map((township) => (
                      <SelectItem key={township} value={township}>
                        {township}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 村里 */}
              <div className="space-y-2">
                <Label>村里</Label>
                <Select 
                  value={formData.districtId} 
                  onValueChange={(v) => handleChange('districtId', v)}
                  disabled={!selectedTownship}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedTownship ? "選擇村里" : "請先選擇鄉鎮市區"} />
                  </SelectTrigger>
                  <SelectContent>
                    {villagesByTownship.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.village}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 詳細地址 */}
              <div className="space-y-2">
                <Label htmlFor="address">詳細地址</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="路街巷弄門牌號"
                />
              </div>
            </CardContent>
          </Card>

          {/* 關係分級 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">關係分級</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="relationLevel">關係等級</Label>
                <Select value={formData.relationLevel} onValueChange={(v) => handleChange('relationLevel', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇關係等級" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A級-鐵票</SelectItem>
                    <SelectItem value="B">B級-友善</SelectItem>
                    <SelectItem value="C">C級-搖擺</SelectItem>
                    <SelectItem value="D">D級-敵對</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="influence">影響力</Label>
                <Select value={formData.influence} onValueChange={(v) => handleChange('influence', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇影響力" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">高</SelectItem>
                    <SelectItem value="MEDIUM">中</SelectItem>
                    <SelectItem value="LOW">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 備註 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">備註</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
                rows={4}
                placeholder="輸入備註..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            取消
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
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

