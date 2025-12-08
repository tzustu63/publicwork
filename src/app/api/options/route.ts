import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const optionSchema = z.object({
  category: z.string().min(1),
  value: z.string().min(1),
  label: z.string().min(1),
  sortOrder: z.number().optional()
})

// GET /api/options - 取得選項列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where = {
      ...(category && { category }),
      ...(!includeInactive && { isActive: true })
    }

    const options = await prisma.selectOption.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }]
    })

    // 依分類分組
    const grouped = options.reduce((acc, opt) => {
      if (!acc[opt.category]) {
        acc[opt.category] = []
      }
      acc[opt.category].push(opt)
      return acc
    }, {} as Record<string, typeof options>)

    return NextResponse.json(category ? options : grouped)
  } catch (error) {
    console.error('Error fetching options:', error)
    return NextResponse.json({ error: '取得選項失敗' }, { status: 500 })
  }
}

// POST /api/options - 新增選項（管理員）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '無權限' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = optionSchema.parse(body)

    const option = await prisma.selectOption.create({
      data: validatedData
    })

    return NextResponse.json(option, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating option:', error)
    return NextResponse.json({ error: '新增選項失敗' }, { status: 500 })
  }
}


