import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateTagSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional()
})

// GET /api/tags/[id] - 取得單一標籤
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { id } = await params

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        category: true,
        _count: { select: { constituents: true } }
      }
    })

    if (!tag) {
      return NextResponse.json({ error: '找不到此標籤' }, { status: 404 })
    }

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error fetching tag:', error)
    return NextResponse.json({ error: '取得標籤失敗' }, { status: 500 })
  }
}

// PUT /api/tags/[id] - 更新標籤（管理員）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '無權限' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateTagSchema.parse(body)

    const tag = await prisma.tag.update({
      where: { id },
      data: validatedData,
      include: { category: true }
    })

    return NextResponse.json(tag)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error updating tag:', error)
    return NextResponse.json({ error: '更新標籤失敗' }, { status: 500 })
  }
}

// DELETE /api/tags/[id] - 刪除標籤（管理員）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '無權限' }, { status: 403 })
    }

    const { id } = await params

    // 軟刪除（設為停用）
    await prisma.tag.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json({ error: '刪除標籤失敗' }, { status: 500 })
  }
}
