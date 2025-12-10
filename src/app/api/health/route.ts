import { NextResponse } from 'next/server'

// GET /api/health - 健康檢查端點
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'constituent-crm'
  })
}
