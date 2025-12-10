import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const eventSchema = z.object({
  title: z.string().min(1, '活動名稱為必填'),
  eventType: z.string().min(1, '活動類型為必填'),
  description: z.string().optional(),
  eventDate: z.string(),
  location: z.string().optional(),
  hostName: z.string().optional(),
  deceasedName: z.string().optional()
})

// GET /api/events - 取得活動列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const eventType = searchParams.get('eventType')
    const attendance = searchParams.get('attendance')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    const where = {
      officeId: session.user.officeId,
      ...(eventType && { eventType }),
      ...(attendance && { attendance: attendance as 'PENDING' | 'ATTENDED' | 'DELEGATED' | 'MISSED' }),
      ...(fromDate && { eventDate: { gte: new Date(fromDate) } }),
      ...(toDate && { eventDate: { lte: new Date(toDate) } })
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
        participants: {
          include: { constituent: { select: { id: true, name: true } } }
        }
      },
      orderBy: { eventDate: 'asc' }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: '取得活動資料失敗' }, { status: 500 })
  }
}

// POST /api/events - 新增活動
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = eventSchema.parse(body)

    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        eventType: validatedData.eventType,
        description: validatedData.description,
        eventDate: new Date(validatedData.eventDate),
        location: validatedData.location,
        hostName: validatedData.hostName,
        deceasedName: validatedData.deceasedName,
        createdById: session.user.id,
        officeId: session.user.officeId
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error creating event:', error)
    return NextResponse.json({ error: '新增活動失敗' }, { status: 500 })
  }
}


