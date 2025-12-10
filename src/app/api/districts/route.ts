import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/districts - 取得行政區列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city') || '花蓮縣'
    const township = searchParams.get('township')
    const all = searchParams.get('all') === 'true'

    // 取得所有行政區（供 cascading select 用）
    if (all) {
      const districts = await prisma.district.findMany({
        where: { city },
        orderBy: [{ township: 'asc' }, { village: 'asc' }]
      })
      return NextResponse.json(districts)
    }

    // 取得鄉鎮列表
    if (!township) {
      const townships = await prisma.district.findMany({
        where: { city },
        select: { township: true },
        distinct: ['township'],
        orderBy: { township: 'asc' }
      })
      return NextResponse.json(townships.map(t => t.township))
    }

    // 取得村里列表
    const villages = await prisma.district.findMany({
      where: { city, township },
      orderBy: { village: 'asc' }
    })

    return NextResponse.json(villages)
  } catch (error) {
    console.error('Error fetching districts:', error)
    return NextResponse.json({ error: '取得行政區資料失敗' }, { status: 500 })
  }
}


