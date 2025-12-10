import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const tagSchema = z.object({
  name: z.string().min(1, '名稱為必填'),
  categoryId: z.string().min(1, '分類為必填'),
  color: z.string().optional(),
  sortOrder: z.number().optional()
})

// GET /api/tags - 取得標籤列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where = {
      ...(categoryId && { categoryId }),
      ...(!includeInactive && { isActive: true })
    }

    const tags = await prisma.tag.findMany({
      where,
      include: {
        category: true,
        _count: { select: { constituents: true } }
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }]
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: '取得標籤失敗' }, { status: 500 })
  }
}

// POST /api/tags - 新增標籤（管理員）
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
    const validatedData = tagSchema.parse(body)

    const tag = await prisma.tag.create({
      data: validatedData,
      include: { category: true }
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: '新增標籤失敗' }, { status: 500 })
  }
}
