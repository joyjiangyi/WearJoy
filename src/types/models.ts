export type ItemCategory = '上装' | '下装' | '外套' | '裙装' | '鞋' | '包' | '配饰'

export type StyleTag = '通勤' | '休闲' | '约会' | '运动' | '正式'

export type Season = '春' | '夏' | '秋' | '冬' | '四季'

// 上装版型：影响与下装的比例搭配规则
export type TopFit = '短款' | '常规' | '长款' | '超长款'

// 下装版型：影响与上装的比例搭配规则
export type BottomFit = '修身' | '直筒' | '阔腿' | '喇叭'

export type ItemFit = TopFit | BottomFit

export interface WardrobeItem {
  id: string
  imageUrl: string
  imageNobgUrl?: string
  images?: string[]
  category: ItemCategory
  fit?: ItemFit           // 版型（上装：短款/常规/长款/超长款；下装：修身/直筒/阔腿/喇叭）
  pairedWith?: string[]   // AI从商品图提取的推荐配对类型，如 ['阔腿裤','半身裙']
  styleNotes?: string     // AI提取的搭配风格备注
  colors: string[]
  styles: StyleTag[]
  seasons: Season[]
  source: 'taobao' | 'manual'
  sourceUrl?: string
  name?: string
  purchaseDate?: string
  price?: number
  wearCount: number
  tags: string[]
  createdAt: string
}

export interface Outfit {
  id: string
  name: string
  itemIds: string[]
  occasion?: string
  season?: Season
  imageUrl?: string
  sourceType: 'saved' | 'ai' | 'product'
  createdAt: string
}

export interface WearLog {
  id: string
  outfitId?: string
  itemIds: string[]
  date: string
  weatherNote?: string
  occasion?: string
}

export interface BodyProfile {
  height?: number
  weight?: number
  bodyType?: '梨形' | '苹果形' | '沙漏形' | 'H形' | '倒三角'
  skinTone?: '冷色' | '暖色' | '中性'
  topSize?: string
  bottomSize?: string
  shoeSize?: string
  brandSizes: Record<string, string>
  bust?: number
  waist?: number
  hips?: number
  shoulderWidth?: number
  inseam?: number
  preferredFit?: string
  avoidFit?: string
  comfortPriority?: '外观优先' | '舒适优先' | '平衡'
}

export interface Inspiration {
  id: string
  imageUrl: string
  analysisResult?: string
  matchedItemIds: string[]
  createdAt: string
}

export interface WeatherSnapshot {
  tempC: number
  condition: string
  city: string
  fetchedAt: string
}
