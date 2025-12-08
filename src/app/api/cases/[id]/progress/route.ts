import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const progressSchema = z.object({
  content: z.string().min(1, '進度說明為必填'),
  actionType: z.string().min(1, '動作類型為必填'),
  actionDate: z.string(),
  nextAction: z.string().optional()
})

// GET /api/cases/[id]/progress - 取得案件進度
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

    const progresses = await prisma.caseProgress.findMany({
      where: { caseId: id },
      include: {
        createdBy: { select: { id: true, name: true } },
        attachments: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(progresses)
  } catch (error) {
    console.error('Error fetching case progress:', error)
    return NextResponse.json({ error: '取得案件進度失敗' }, { status: 500 })
  }
}

// POST /api/cases/[id]/progress - 新增案件進度
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
    const validatedData = progressSchema.parse(body)

    // 使用 transaction 同時新增進度並更新案件狀態
    const result = await prisma.$transaction(async (tx) => {
      // 新增進度
      const progress = await tx.caseProgress.create({
        data: {
          caseId: id,
          content: validatedData.content,
          actionType: validatedData.actionType,
          actionDate: new Date(validatedData.actionDate),
          nextAction: validatedData.nextAction,
          createdById: session.user.id
        },
        include: {
          createdBy: { select: { id: true, name: true } }
        }
      })

      // 更新案件狀態為處理中（如果是待處理）
      await tx.case.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          updatedAt: new Date()
        }
      })

      return progress
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating case progress:', error)
    return NextResponse.json({ error: '新增案件進度失敗' }, { status: 500 })
  }
}


