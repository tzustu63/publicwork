import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateTagsSchema = z.object({
  tagIds: z.array(z.string())
})

// GET /api/constituents/[id]/tags - 取得選民的標籤
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

    const constituentTags = await prisma.constituentTag.findMany({
      where: { constituentId: id },
      include: {
        tag: {
          include: { category: true }
        }
      }
    })

    return NextResponse.json(constituentTags.map(ct => ct.tag))
  } catch (error) {
    console.error('Error fetching constituent tags:', error)
    return NextResponse.json({ error: '取得選民標籤失敗' }, { status: 500 })
  }
}

// PUT /api/constituents/[id]/tags - 更新選民的標籤（覆蓋）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { tagIds } = updateTagsSchema.parse(body)

    // 確認選民存在
    const constituent = await prisma.constituent.findFirst({
      where: {
        id,
        officeId: session.user.officeId,
        isDeleted: false
      }
    })

    if (!constituent) {
      return NextResponse.json({ error: '找不到此選民' }, { status: 404 })
    }

    // 刪除現有標籤，重新建立
    await prisma.$transaction([
      prisma.constituentTag.deleteMany({
        where: { constituentId: id }
      }),
      prisma.constituentTag.createMany({
        data: tagIds.map(tagId => ({
          constituentId: id,
          tagId
        }))
      })
    ])

    // 回傳更新後的標籤
    const updatedTags = await prisma.constituentTag.findMany({
      where: { constituentId: id },
      include: {
        tag: {
          include: { category: true }
        }
      }
    })

    return NextResponse.json(updatedTags.map(ct => ct.tag))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error updating constituent tags:', error)
    return NextResponse.json({ error: '更新選民標籤失敗' }, { status: 500 })
  }
}

// POST /api/constituents/[id]/tags - 新增選民標籤（追加）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { tagIds } = updateTagsSchema.parse(body)

    // 確認選民存在
    const constituent = await prisma.constituent.findFirst({
      where: {
        id,
        officeId: session.user.officeId,
        isDeleted: false
      }
    })

    if (!constituent) {
      return NextResponse.json({ error: '找不到此選民' }, { status: 404 })
    }

    // 取得現有標籤
    const existingTags = await prisma.constituentTag.findMany({
      where: { constituentId: id },
      select: { tagId: true }
    })
    const existingTagIds = new Set(existingTags.map(t => t.tagId))

    // 只新增不存在的標籤
    const newTagIds = tagIds.filter(tagId => !existingTagIds.has(tagId))

    if (newTagIds.length > 0) {
      await prisma.constituentTag.createMany({
        data: newTagIds.map(tagId => ({
          constituentId: id,
          tagId
        }))
      })
    }

    // 回傳更新後的標籤
    const updatedTags = await prisma.constituentTag.findMany({
      where: { constituentId: id },
      include: {
        tag: {
          include: { category: true }
        }
      }
    })

    return NextResponse.json(updatedTags.map(ct => ct.tag))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error adding constituent tags:', error)
    return NextResponse.json({ error: '新增選民標籤失敗' }, { status: 500 })
  }
}
