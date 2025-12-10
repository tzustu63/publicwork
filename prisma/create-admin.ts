import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 建立管理者帳號...')

  // 確保有預設辦公室
  const office = await prisma.office.upsert({
    where: { id: 'default-office' },
    update: {},
    create: {
      id: 'default-office',
      name: '花蓮縣議員服務處',
      city: '花蓮縣',
      description: '選民服務管理系統'
    }
  })

  // 建立管理者帳號
  const email = 'tsengshihju@gmail.com'
  const password = 'win0958919009'
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
      name: '系統管理員'
    },
    create: {
      email,
      name: '系統管理員',
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
      officeId: office.id
    }
  })

  console.log('✅ 管理者帳號建立成功！')
  console.log('')
  console.log('📧 帳號資訊：')
  console.log(`   電子郵件：${user.email}`)
  console.log(`   密碼：${password}`)
  console.log(`   角色：${user.role}`)
  console.log(`   狀態：${user.isActive ? '啟用' : '停用'}`)
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ 建立失敗:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
