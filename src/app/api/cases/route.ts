import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const caseSchema = z.object({
  title: z.string().min(1, '標題為必填'),
  description: z.string().optional(),
  caseType: z.string().min(1, '案件類型為必填'),
  caseCategory: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  districtId: z.string().optional(),
  location: z.string().optional(),
  constituentIds: z.array(z.string()).optional()
})

// GET /api/cases - 取得案件列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const caseType = searchParams.get('caseType')
    const assigneeId = searchParams.get('assigneeId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = {
      officeId: session.user.officeId,
      ...(status && { status: status as 'PENDING' | 'IN_PROGRESS' | 'CLOSED' }),
      ...(caseType && { caseType }),
      ...(assigneeId && { assigneeId })
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          district: true,
          createdBy: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
          constituents: {
            include: { constituent: { select: { id: true, name: true } } }
          },
          progresses: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: { select: { progresses: true } }
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.case.count({ where })
    ])

    return NextResponse.json({
      data: cases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching cases:', error)
    return NextResponse.json({ error: '取得案件資料失敗' }, { status: 500 })
  }
}

// POST /api/cases - 新增案件
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const body = await request.json()
    const { constituentIds, ...caseData } = caseSchema.parse(body)

    const newCase = await prisma.case.create({
      data: {
        ...caseData,
        createdById: session.user.id,
        officeId: session.user.officeId,
        constituents: constituentIds?.length
          ? {
              create: constituentIds.map((id) => ({
                constituentId: id,
                role: '陳情人'
              }))
            }
          : undefined
      },
      include: {
        district: true,
        createdBy: { select: { id: true, name: true } },
        constituents: {
          include: { constituent: { select: { id: true, name: true } } }
        }
      }
    })

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error creating case:', error)
    return NextResponse.json({ error: '新增案件失敗' }, { status: 500 })
  }
}


