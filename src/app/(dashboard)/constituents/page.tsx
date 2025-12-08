'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Plus, Search, Filter, MoreHorizontal, Phone, MapPin, Eye, Pencil, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface Constituent {
  id: string
  name: string
  phone: string | null
  district: { township: string; village: string } | null
  relationLevel: string | null
  tags: { tag: { name: string } }[]
}

export default function ConstituentsPage() {
  const [search, setSearch] = useState('')
  const [relationFilter, setRelationFilter] = useState<string>('all')

  // 從真實 API 獲取資料
  const { data: constituents = [], isLoading } = useQuery({
    queryKey: ['constituents'],
    queryFn: async () => {
      const res = await fetch('/api/constituents')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      return json.data || []
    }
  })

  const filteredConstituents = constituents.filter((c: Constituent) => {
    const districtName = c.district ? `${c.district.township}${c.district.village}` : ''
    const matchSearch = c.name.includes(search) || 
      (c.phone && c.phone.includes(search)) || 
      districtName.includes(search)
    const matchRelation = relationFilter === 'all' || c.relationLevel === relationFilter
    return matchSearch && matchRelation
  })

  const getRelationBadge = (level: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">選民管理</h1>
          <p className="text-muted-foreground mt-1">管理選民資料、標籤與關係等級</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
          <Link href="/constituents/new">
            <Plus className="mr-2 h-4 w-4" />
            新增選民
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋姓名、電話、地址..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={relationFilter} onValueChange={setRelationFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="關係等級" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部等級</SelectItem>
                <SelectItem value="A">A級-鐵票</SelectItem>
                <SelectItem value="B">B級-友善</SelectItem>
                <SelectItem value="C">C級-搖擺</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-muted-foreground">
            共 {filteredConstituents.length} 位選民
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>聯絡方式</TableHead>
                  <TableHead>地區</TableHead>
                  <TableHead>關係等級</TableHead>
                  <TableHead>標籤</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConstituents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      沒有選民資料
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConstituents.map((constituent: Constituent) => (
                    <TableRow key={constituent.id}>
                      <TableCell className="font-medium">
                        {constituent.name}
                      </TableCell>
                      <TableCell>
                        {constituent.phone ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {constituent.phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {constituent.district ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {constituent.district.township}{constituent.district.village}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getRelationBadge(constituent.relationLevel || '')}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {constituent.tags && constituent.tags.length > 0 ? (
                            constituent.tags.map((t) => (
                              <Badge
                                key={t.tag.name}
                                variant="outline"
                                className="text-xs"
                              >
                                {t.tag.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/constituents/${constituent.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                檢視
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/constituents/${constituent.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                編輯
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
