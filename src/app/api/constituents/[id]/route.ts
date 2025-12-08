import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1, '姓名為必填'),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  email: z.string().optional(),
  birthday: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().or(z.literal('')),
  occupation: z.string().optional(),
  note: z.string().optional(),
  districtId: z.string().optional(),
  address: z.string().optional(),
  relationLevel: z.string().optional(),
  influence: z.string().optional()
})

// GET /api/constituents/[id] - 取得單一選民
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

    const constituent = await prisma.constituent.findFirst({
      where: {
        id,
        officeId: session.user.officeId,
        isDeleted: false
      },
      include: {
        district: true,
        tags: { include: { tag: true } }
      }
    })

    if (!constituent) {
      return NextResponse.json({ error: '找不到此選民' }, { status: 404 })
    }

    return NextResponse.json(constituent)
  } catch (error) {
    console.error('Error fetching constituent:', error)
    return NextResponse.json({ error: '取得選民資料失敗' }, { status: 500 })
  }
}

// PUT /api/constituents/[id] - 更新選民
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
    const validatedData = updateSchema.parse(body)

    // 確認選民存在且屬於此辦公室
    const existing = await prisma.constituent.findFirst({
      where: {
        id,
        officeId: session.user.officeId,
        isDeleted: false
      }
    })

    if (!existing) {
      return NextResponse.json({ error: '找不到此選民' }, { status: 404 })
    }

    // 清理空字串為 null
    const cleanData = {
      name: validatedData.name,
      phone: validatedData.phone || null,
      phone2: validatedData.phone2 || null,
      email: validatedData.email || null,
      birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
      gender: (validatedData.gender && validatedData.gender !== '') ? validatedData.gender : null,
      occupation: validatedData.occupation || null,
      note: validatedData.note || null,
      districtId: validatedData.districtId || null,
      address: validatedData.address || null,
      relationLevel: validatedData.relationLevel || null,
      influence: validatedData.influence || null
    }

    const constituent = await prisma.constituent.update({
      where: { id },
      data: cleanData,
      include: {
        district: true,
        tags: { include: { tag: true } }
      }
    })

    return NextResponse.json(constituent)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating constituent:', error)
    return NextResponse.json({ error: '更新選民失敗' }, { status: 500 })
  }
}

// DELETE /api/constituents/[id] - 刪除選民 (軟刪除)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { id } = await params

    // 確認選民存在且屬於此辦公室
    const existing = await prisma.constituent.findFirst({
      where: {
        id,
        officeId: session.user.officeId,
        isDeleted: false
      }
    })

    if (!existing) {
      return NextResponse.json({ error: '找不到此選民' }, { status: 404 })
    }

    // 軟刪除
    await prisma.constituent.update({
      where: { id },
      data: { isDeleted: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting constituent:', error)
    return NextResponse.json({ error: '刪除選民失敗' }, { status: 500 })
  }
}


