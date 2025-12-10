import { PrismaClient, Role, Gender } from '@prisma/client'
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

// 預設標籤分類和標籤
const defaultTagsData = [
  {
    categoryName: '服務紀錄',
    sortOrder: 1,
    tags: [
      { name: '曾協助案件', color: 'emerald' },
      { name: '曾出席活動', color: 'blue' },
      { name: '曾捐款支持', color: 'amber' },
      { name: '志工', color: 'purple' }
    ]
  },
  {
    categoryName: '特殊身分',
    sortOrder: 2,
    tags: [
      { name: '里長', color: 'red' },
      { name: '鄰長', color: 'pink' },
      { name: '社區理事長', color: 'amber' },
      { name: '學校家長會', color: 'blue' },
      { name: '宗親會', color: 'purple' },
      { name: '農會', color: 'emerald' }
    ]
  },
  {
    categoryName: '議題關注',
    sortOrder: 3,
    tags: [
      { name: '環保議題', color: 'emerald' },
      { name: '教育議題', color: 'blue' },
      { name: '交通建設', color: 'amber' },
      { name: '社會福利', color: 'pink' },
      { name: '農業發展', color: 'emerald' }
    ]
  },
  {
    categoryName: '選舉標記',
    sortOrder: 4,
    tags: [
      { name: '樁腳', color: 'red' },
      { name: '積極支持者', color: 'emerald' },
      { name: '需關注', color: 'amber' },
      { name: '對手支持者', color: 'gray' }
    ]
  }
]

// 測試選民資料
const testConstituents = [
  {
    name: '王大明',
    phone: '0912-345-678',
    email: 'wang@example.com',
    birthday: new Date('1975-03-15'),
    gender: Gender.MALE,
    occupation: 'business_owner',
    relationLevel: 'A',
    note: '經營早餐店，在地方有影響力',
    township: '花蓮市',
    village: '民生里',
    address: '中山路123號'
  },
  {
    name: '李小華',
    phone: '0923-456-789',
    email: 'lee@example.com',
    birthday: new Date('1982-07-22'),
    gender: Gender.FEMALE,
    occupation: 'teacher',
    relationLevel: 'A',
    note: '國小老師，熱心公益',
    township: '吉安鄉',
    village: '北昌村',
    address: '中央路456號'
  },
  {
    name: '陳美玲',
    phone: '0934-567-890',
    birthday: new Date('1968-11-08'),
    gender: Gender.FEMALE,
    occupation: 'homemaker',
    relationLevel: 'B',
    note: '社區媽媽教室成員',
    township: '花蓮市',
    village: '國光里',
    address: '國光街78號'
  },
  {
    name: '林志明',
    phone: '0945-678-901',
    birthday: new Date('1990-05-30'),
    gender: Gender.MALE,
    occupation: 'worker',
    relationLevel: 'B',
    township: '新城鄉',
    village: '北埔村',
    address: '北埔路99號'
  },
  {
    name: '張淑芬',
    phone: '0956-789-012',
    email: 'chang@example.com',
    birthday: new Date('1978-09-12'),
    gender: Gender.FEMALE,
    occupation: 'civil_servant',
    relationLevel: 'A',
    note: '縣府員工，里長太太',
    township: '花蓮市',
    village: '民政里',
    address: '民政路55號'
  },
  {
    name: '黃建國',
    phone: '0967-890-123',
    birthday: new Date('1965-01-25'),
    gender: Gender.MALE,
    occupation: 'farmer',
    relationLevel: 'A',
    note: '農會理事',
    township: '壽豐鄉',
    village: '壽豐村',
    address: '壽豐路168號'
  },
  {
    name: '劉雅婷',
    phone: '0978-901-234',
    birthday: new Date('1995-12-03'),
    gender: Gender.FEMALE,
    occupation: 'freelancer',
    relationLevel: 'C',
    township: '花蓮市',
    village: '國安里'
  },
  {
    name: '吳文賢',
    phone: '0989-012-345',
    birthday: new Date('1958-06-18'),
    gender: Gender.MALE,
    occupation: 'retired',
    relationLevel: 'B',
    note: '退休校長',
    township: '吉安鄉',
    village: '宜昌村',
    address: '宜昌路200號'
  },
  {
    name: '許家豪',
    phone: '0911-222-333',
    birthday: new Date('1988-04-07'),
    gender: Gender.MALE,
    occupation: 'business_owner',
    relationLevel: 'B',
    note: '經營便利商店',
    township: '花蓮市',
    village: '主權里',
    address: '中正路88號'
  },
  {
    name: '周美珍',
    phone: '0922-333-444',
    email: 'chou@example.com',
    birthday: new Date('1972-08-20'),
    gender: Gender.FEMALE,
    occupation: 'medical',
    relationLevel: 'A',
    note: '護理師，社區健康志工',
    township: '花蓮市',
    village: '國福里',
    address: '國福路66號'
  }
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
  const districtMap: Record<string, string> = {} // township_village -> districtId
  for (const district of hualienDistricts) {
    for (const village of district.villages) {
      const created = await prisma.district.upsert({
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
      districtMap[`${district.township}_${village}`] = created.id
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

  // 5. 建立標籤分類和標籤
  console.log('🏷️ 建立標籤分類和標籤...')
  const tagMap: Record<string, string> = {} // tagName -> tagId
  for (const categoryData of defaultTagsData) {
    const category = await prisma.tagCategory.upsert({
      where: { name: categoryData.categoryName },
      update: { sortOrder: categoryData.sortOrder },
      create: {
        name: categoryData.categoryName,
        sortOrder: categoryData.sortOrder
      }
    })

    for (let i = 0; i < categoryData.tags.length; i++) {
      const tagData = categoryData.tags[i]
      const tag = await prisma.tag.upsert({
        where: {
          categoryId_name: {
            categoryId: category.id,
            name: tagData.name
          }
        },
        update: { color: tagData.color, sortOrder: i },
        create: {
          name: tagData.name,
          color: tagData.color,
          categoryId: category.id,
          sortOrder: i
        }
      })
      tagMap[tagData.name] = tag.id
    }
  }

  // 6. 建立測試選民資料
  console.log('👥 建立測試選民資料...')
  for (const data of testConstituents) {
    const districtId = districtMap[`${data.township}_${data.village}`]
    
    await prisma.constituent.upsert({
      where: {
        id: `test-${data.name}`
      },
      update: {},
      create: {
        id: `test-${data.name}`,
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        birthday: data.birthday || null,
        gender: data.gender || null,
        occupation: data.occupation || null,
        relationLevel: data.relationLevel || null,
        note: data.note || null,
        districtId: districtId || null,
        address: data.address || null,
        officeId: office.id
      }
    })
  }

  // 7. 為部分選民加上標籤
  console.log('🔖 為選民加上標籤...')
  const tagAssignments = [
    { constituentName: '王大明', tags: ['曾協助案件', '積極支持者'] },
    { constituentName: '李小華', tags: ['曾出席活動', '志工', '教育議題'] },
    { constituentName: '張淑芬', tags: ['里長', '樁腳'] },
    { constituentName: '黃建國', tags: ['農會', '農業發展', '積極支持者'] },
    { constituentName: '周美珍', tags: ['志工', '社會福利', '曾協助案件'] }
  ]

  for (const assignment of tagAssignments) {
    const constituent = await prisma.constituent.findFirst({
      where: { name: assignment.constituentName }
    })
    if (constituent) {
      for (const tagName of assignment.tags) {
        const tagId = tagMap[tagName]
        if (tagId) {
          await prisma.constituentTag.upsert({
            where: {
              constituentId_tagId: {
                constituentId: constituent.id,
                tagId: tagId
              }
            },
            update: {},
            create: {
              constituentId: constituent.id,
              tagId: tagId
            }
          })
        }
      }
    }
  }

  console.log('✅ Seed 完成！')
  console.log('')
  console.log('📧 測試帳號：')
  console.log('   管理員：admin@example.com / admin123')
  console.log('   助理：staff@example.com / admin123')
  console.log('')
  console.log('👥 測試選民：已建立 10 筆選民資料')
  console.log('🏷️ 標籤分類：已建立 4 個分類，共 19 個標籤')
}

main()
  .catch((e) => {
    console.error('❌ Seed 失敗:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
