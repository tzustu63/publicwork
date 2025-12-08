import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 花蓮縣行政區資料
const hualienDistricts = [
  { township: '花蓮市', villages: ['主權里', '主安里', '主農里', '主力里', '主學里', '主工里', '主商里', '民孝里', '民政里', '民生里', '民心里', '民運里', '民立里', '民樂里', '民勤里', '民享里', '民有里', '民治里', '國聯里', '國光里', '國威里', '國福里', '國強里', '國慶里', '國防里', '國裕里', '國安里', '國盛里', '國華里', '國魂里', '國富里', '國興里', '國廣里', '北濱里', '北昌里', '建國里', '復興里'] },
  { township: '吉安鄉', villages: ['北昌村', '勝安村', '宜昌村', '南昌村', '吉安村', '永興村', '慶豐村', '福興村', '稀仁村', '東昌村', '永安村', '仁安村', '仁里村', '光華村', '太昌村', '干城村', '仁和村', '南華村'] },
  { township: '新城鄉', villages: ['新城村', '北埔村', '康樂村', '嘉里村', '嘉新村', '佳林村', '順安村', '大漢村'] },
  { township: '秀林鄉', villages: ['秀林村', '佳民村', '景美村', '加灣村', '崇德村', '富世村', '銅門村', '文蘭村', '水源村'] },
  { township: '壽豐鄉', villages: ['壽豐村', '共和村', '志學村', '平和村', '池南村', '豐山村', '豐坪村', '豐裡村', '月眉村', '水璉村', '鹽寮村', '樹湖村', '米棧村', '光榮村'] },
  { township: '鳳林鎮', villages: ['鳳信里', '鳳義里', '鳳仁里', '鳳禮里', '鳳智里', '大榮里', '長橋里', '北林里', '南平里', '林榮里', '森榮里', '山興里'] },
  { township: '光復鄉', villages: ['大全村', '大同村', '大安村', '大平村', '大華村', '大進村', '大興村', '大馬村', '大富村', '大豐村', '大農村', '東富村', '南富村', '北富村', '西富村'] },
  { township: '豐濱鄉', villages: ['豐濱村', '港口村', '靜浦村', '磯崎村', '新社村'] },
  { township: '瑞穗鄉', villages: ['瑞穗村', '瑞美村', '瑞良村', '瑞北村', '瑞祥村', '舞鶴村', '鶴岡村', '奇美村', '富興村', '富民村', '富源村'] },
  { township: '萬榮鄉', villages: ['西林村', '見晴村', '萬榮村', '明利村', '紅葉村', '馬遠村'] },
  { township: '玉里鎮', villages: ['玉里里', '國武里', '中城里', '民生里', '中山里', '大同里', '長良里', '永昌里', '源城里', '春日里', '東豐里', '樂合里', '松浦里', '觀音里', '三民里', '泰林里'] },
  { township: '卓溪鄉', villages: ['卓清村', '卓樂村', '立山村', '崙山村', '太平村', '古風村'] },
  { township: '富里鄉', villages: ['富里村', '明里村', '東里村', '萬寧村', '新興村', '竹田村', '石牌村', '永豐村', '學田村', '羅山村', '豐南村', '吳江村', '富南村'] }
]

// 預設選項資料
const defaultOptions = [
  // 案件類型
  { category: 'caseType', value: 'petition', label: '陳情協調' },
  { category: 'caseType', value: 'inspection', label: '公共建設會勘' },
  { category: 'caseType', value: 'legal', label: '法律諮詢' },
  { category: 'caseType', value: 'administrative', label: '行政諮詢' },
  { category: 'caseType', value: 'other', label: '其他' },

  // 案件類別
  { category: 'caseCategory', value: 'labor', label: '勞資糾紛' },
  { category: 'caseCategory', value: 'traffic_ticket', label: '交通罰單' },
  { category: 'caseCategory', value: 'medical', label: '醫療爭議' },
  { category: 'caseCategory', value: 'land', label: '土地徵收' },
  { category: 'caseCategory', value: 'road', label: '道路問題' },
  { category: 'caseCategory', value: 'drainage', label: '水溝排水' },
  { category: 'caseCategory', value: 'streetlight', label: '路燈照明' },
  { category: 'caseCategory', value: 'traffic_signal', label: '交通號誌' },
  { category: 'caseCategory', value: 'park', label: '公園設施' },
  { category: 'caseCategory', value: 'noise', label: '噪音問題' },
  { category: 'caseCategory', value: 'neighbor', label: '鄰里糾紛' },
  { category: 'caseCategory', value: 'welfare', label: '社會福利' },
  { category: 'caseCategory', value: 'other', label: '其他' },

  // 進度動作類型
  { category: 'actionType', value: 'coordination', label: '協調會' },
  { category: 'actionType', value: 'phone', label: '電話追蹤' },
  { category: 'actionType', value: 'site_visit', label: '現場會勘' },
  { category: 'actionType', value: 'document', label: '公文往返' },
  { category: 'actionType', value: 'meeting', label: '會議討論' },
  { category: 'actionType', value: 'other', label: '其他' },

  // 職業身分
  { category: 'occupation', value: 'business_owner', label: '中小企業主' },
  { category: 'occupation', value: 'worker', label: '勞工' },
  { category: 'occupation', value: 'civil_servant', label: '公務員' },
  { category: 'occupation', value: 'farmer', label: '農民' },
  { category: 'occupation', value: 'fisherman', label: '漁民' },
  { category: 'occupation', value: 'retired', label: '退休人員' },
  { category: 'occupation', value: 'student', label: '學生' },
  { category: 'occupation', value: 'freelancer', label: '自由業' },
  { category: 'occupation', value: 'homemaker', label: '家管' },
  { category: 'occupation', value: 'teacher', label: '教師' },
  { category: 'occupation', value: 'medical', label: '醫護人員' },
  { category: 'occupation', value: 'other', label: '其他' },

  // 活動類型
  { category: 'eventType', value: 'wedding', label: '紅帖（婚禮）' },
  { category: 'eventType', value: 'funeral', label: '白帖（喪禮）' },
  { category: 'eventType', value: 'temple', label: '廟會繞境' },
  { category: 'eventType', value: 'school', label: '校慶活動' },
  { category: 'eventType', value: 'community', label: '社區活動' },
  { category: 'eventType', value: 'association', label: '協會聚會' },
  { category: 'eventType', value: 'self_hosted', label: '自辦活動' },
  { category: 'eventType', value: 'other', label: '其他' },

  // 關係等級
  { category: 'relationLevel', value: 'A', label: 'A級 - 鐵票' },
  { category: 'relationLevel', value: 'B', label: 'B級 - 友善' },
  { category: 'relationLevel', value: 'C', label: 'C級 - 搖擺' },

  // 影響力標籤
  { category: 'influence', value: 'village_chief', label: '里長' },
  { category: 'influence', value: 'neighbor_chief', label: '鄰長' },
  { category: 'influence', value: 'clan_association', label: '宗親會' },
  { category: 'influence', value: 'parent_association', label: '家長會' },
  { category: 'influence', value: 'kol', label: '意見領袖' },
  { category: 'influence', value: 'community_leader', label: '社區發展協會' },
  { category: 'influence', value: 'business_association', label: '商業公會' }
]

// 預設標籤分類
const defaultTagCategories = [
  { name: '案件類別', sortOrder: 1 },
  { name: '職業身分', sortOrder: 2 },
  { name: '關係等級', sortOrder: 3 },
  { name: '影響力', sortOrder: 4 },
  { name: '地區標籤', sortOrder: 5 },
  { name: '其他', sortOrder: 99 }
]

async function main() {
  console.log('🌱 開始 Seed 資料...')

  // 1. 建立辦公室
  console.log('📍 建立辦公室...')
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

  // 2. 建立管理員帳號
  console.log('👤 建立管理員帳號...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: '系統管理員',
      password: hashedPassword,
      role: Role.ADMIN,
      officeId: office.id
    }
  })

  // 建立測試助理帳號
  await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      name: '測試助理',
      password: hashedPassword,
      role: Role.STAFF,
      officeId: office.id
    }
  })

  // 3. 建立花蓮縣行政區資料
  console.log('🗺️ 建立花蓮縣行政區資料...')
  for (const district of hualienDistricts) {
    for (const village of district.villages) {
      await prisma.district.upsert({
        where: {
          city_township_village: {
            city: '花蓮縣',
            township: district.township,
            village: village
          }
        },
        update: {},
        create: {
          city: '花蓮縣',
          township: district.township,
          village: village
        }
      })
    }
  }

  // 4. 建立預設選項
  console.log('📝 建立預設選項...')
  for (let i = 0; i < defaultOptions.length; i++) {
    const option = defaultOptions[i]
    await prisma.selectOption.upsert({
      where: {
        category_value: {
          category: option.category,
          value: option.value
        }
      },
      update: { label: option.label },
      create: {
        category: option.category,
        value: option.value,
        label: option.label,
        sortOrder: i
      }
    })
  }

  // 5. 建立標籤分類
  console.log('🏷️ 建立標籤分類...')
  for (const category of defaultTagCategories) {
    await prisma.tagCategory.upsert({
      where: { name: category.name },
      update: { sortOrder: category.sortOrder },
      create: {
        name: category.name,
        sortOrder: category.sortOrder
      }
    })
  }

  console.log('✅ Seed 完成！')
  console.log('')
  console.log('📧 測試帳號：')
  console.log('   管理員：admin@example.com / admin123')
  console.log('   助理：staff@example.com / admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seed 失敗:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


