import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const constituentSchema = z.object({
  name: z.string().min(1, '姓名為必填'),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  email: z.string().optional(),
  birthday: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().or(z.literal('')),
  occupation: z.string().optional(),
  note: z.string().optional(),
  districtId: z.string().nullable().optional(),
  address: z.string().optional(),
  relationLevel: z.string().optional(),
  influence: z.string().optional()
})

// GET /api/constituents - 取得選民列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const relationLevel = searchParams.get('relationLevel')
    const districtId = searchParams.get('districtId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = {
      officeId: session.user.officeId,
      isDeleted: false,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
          { address: { contains: search } }
        ]
      }),
      ...(relationLevel && { relationLevel }),
      ...(districtId && { districtId })
    }

    const [constituents, total] = await Promise.all([
      prisma.constituent.findMany({
        where,
        include: {
          district: true,
          tags: { include: { tag: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.constituent.count({ where })
    ])

    return NextResponse.json({
      data: constituents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching constituents:', error)
    return NextResponse.json({ error: '取得選民資料失敗' }, { status: 500 })
  }
}

// POST /api/constituents - 新增選民
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received body:', JSON.stringify(body, null, 2))
    const validatedData = constituentSchema.parse(body)
    console.log('Validated data:', JSON.stringify(validatedData, null, 2))

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
      influence: validatedData.influence || null,
      officeId: session.user.officeId
    }

    const constituent = await prisma.constituent.create({
      data: cleanData,
      include: {
        district: true
      }
    })

    return NextResponse.json(constituent, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', JSON.stringify(error.errors, null, 2))
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating constituent:', error)
    return NextResponse.json({ error: '新增選民失敗' }, { status: 500 })
  }
}

