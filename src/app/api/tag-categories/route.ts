import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, '名稱為必填'),
  sortOrder: z.number().optional()
})

// GET /api/tag-categories - 取得標籤分類列表
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const categories = await prisma.tagCategory.findMany({
      include: {
        tags: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        _count: { select: { tags: true } }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching tag categories:', error)
    return NextResponse.json({ error: '取得標籤分類失敗' }, { status: 500 })
  }
}

// POST /api/tag-categories - 新增標籤分類（管理員）
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
    const validatedData = categorySchema.parse(body)

    const category = await prisma.tagCategory.create({
      data: validatedData
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error creating tag category:', error)
    return NextResponse.json({ error: '新增標籤分類失敗' }, { status: 500 })
  }
}
