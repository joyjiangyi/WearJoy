import type { BottomFit, Outfit, StyleTag, TopFit, WardrobeItem } from '../types/models'
import { createId } from './id'

const TOP: WardrobeItem['category'][] = ['上装', '外套']
const BOTTOM: WardrobeItem['category'][] = ['下装', '裙装']
const FEET: WardrobeItem['category'][] = ['鞋']

export interface RecommendInput {
  items: WardrobeItem[]
  tempC: number
  stylePreferences: StyleTag[]
  recentItemIds: string[]
}

/**
 * 比例搭配规则：
 * 长款/超长款上衣 → 只配修身/直筒下装（避免上下都宽松撑大）
 * 短款上衣 → 配所有下装
 * 常规上衣 → 避开阔腿裤（两者都偏宽松，比例难控）
 */
function fitCompatible(top: WardrobeItem, bottom: WardrobeItem): boolean {
  const topFit = top.fit as TopFit | undefined
  const bottomFit = bottom.fit as BottomFit | undefined
  if (!topFit || !bottomFit) return true // 无版型信息不限制

  if (topFit === '超长款') return bottomFit === '修身'
  if (topFit === '长款') return bottomFit === '修身' || bottomFit === '直筒'
  if (topFit === '常规') return bottomFit !== '阔腿'
  return true // 短款百搭
}

/** 风格相性：共享越多风格标签越好，完全不重叠扣分 */
function pairStyleScore(top: WardrobeItem, bottom: WardrobeItem): number {
  const shared = top.styles.filter((s) => bottom.styles.includes(s)).length
  if (shared === 0) return -2
  return shared
}

/**
 * AI 配对相性：如果 top.pairedWith 里提到了 bottom 的版型或类别，给大幅加分。
 * 例如：top.pairedWith = ['阔腿裤','半身裙']，bottom 是「下装」且 fit 为「阔腿」→ +3
 */
function pairAiScore(top: WardrobeItem, bottom: WardrobeItem): number {
  const hints = [
    ...(top.pairedWith ?? []),
    ...(bottom.pairedWith ?? []),
  ]
  if (hints.length === 0) return 0

  // 把 bottom 的信息转成关键词来匹配
  const bottomKeywords = [
    bottom.category,
    bottom.fit ?? '',
    ...(bottom.name?.split(/\s+/) ?? []),
  ].filter(Boolean)

  const matched = hints.some((hint) =>
    bottomKeywords.some((kw) => hint.includes(kw) || kw.includes(hint))
  )
  return matched ? 3 : 0
}

function tempToSeason(tempC: number): string[] {
  if (tempC >= 26) return ['夏', '四季']
  if (tempC >= 18) return ['春', '秋', '四季']
  if (tempC >= 8)  return ['秋', '冬', '四季']
  return ['冬', '四季']
}

export function buildOutfitRecommendations(input: RecommendInput): Outfit[] {
  const { items, tempC, stylePreferences, recentItemIds } = input
  if (items.length === 0) return []

  const needOuter = tempC < 18
  const validSeasons = tempToSeason(tempC)

  // 只保留当前季节适穿的单品（seasons 为空视为四季）
  const seasonalItems = items.filter(
    (i) => i.seasons.length === 0 || i.seasons.some((s) => validSeasons.includes(s))
  )

  const scored = [...seasonalItems].sort((a, b) => {
    const sa = scoreItem(a, stylePreferences, recentItemIds)
    const sb = scoreItem(b, stylePreferences, recentItemIds)
    return sb - sa
  })

  const tops = scored.filter((i) => TOP.includes(i.category))
  const bottoms = scored.filter((i) => BOTTOM.includes(i.category))
  const shoes = scored.filter((i) => FEET.includes(i.category))
  const outers = scored.filter((i) => i.category === '外套')
  const bags = scored.filter((i) => i.category === '包')

  // 生成所有 top×bottom 组合，按版型相性 + 风格相性排序
  type Pair = { top: WardrobeItem; bottom: WardrobeItem; score: number }
  const pairs: Pair[] = []
  for (const top of tops) {
    for (const bottom of bottoms) {
      if (!fitCompatible(top, bottom)) continue
      const score =
        scoreItem(top, stylePreferences, recentItemIds) +
        scoreItem(bottom, stylePreferences, recentItemIds) +
        pairStyleScore(top, bottom) +
        pairAiScore(top, bottom)
      pairs.push({ top, bottom, score })
    }
  }
  pairs.sort((a, b) => b.score - a.score)

  const combos: string[][] = []
  const usedTopIds = new Set<string>()
  const usedBottomIds = new Set<string>()

  for (const { top, bottom } of pairs) {
    if (combos.length >= 3) break
    if (usedTopIds.has(top.id) || usedBottomIds.has(bottom.id)) continue
    usedTopIds.add(top.id)
    usedBottomIds.add(bottom.id)

    const i = combos.length
    const shoe = shoes[i % Math.max(shoes.length, 1)] ?? shoes[0]
    const ids = [top.id, bottom.id]
    if (shoe) ids.push(shoe.id)
    if (needOuter && outers.length) {
      const o = outers[(i + recentItemIds.length) % outers.length]
      if (o && o.id !== top.id) ids.splice(1, 0, o.id)
    }
    if (bags.length) {
      const b = bags[i % bags.length]
      if (b) ids.push(b.id)
    }
    combos.push([...new Set(ids)])
  }

  // 兜底：版型信息不足时退回原始排名凑组合
  if (combos.length === 0) {
    for (let i = 0; i < Math.min(3, tops.length); i++) {
      const top = tops[i]
      const bottom = bottoms[i % Math.max(bottoms.length, 1)] ?? bottoms[0]
      if (!top || !bottom) continue
      const shoe = shoes[i % Math.max(shoes.length, 1)] ?? shoes[0]
      const ids = [top.id, bottom.id]
      if (shoe) ids.push(shoe.id)
      combos.push([...new Set(ids)])
    }
  }
  if (combos.length === 0) {
    const fallback = scored.slice(0, Math.min(3, scored.length)).map((x) => x.id)
    if (fallback.length) combos.push(fallback)
  }

  return combos.slice(0, 3).map((itemIds, idx) => ({
    id: `rec-${createId()}`,
    name: ['清爽通勤', '轻松休闲', '约会精致'][idx] ?? `推荐 ${idx + 1}`,
    itemIds,
    occasion: ['办公日', '日常', '小聚'][idx],
    sourceType: 'ai' as const,
    createdAt: new Date().toISOString(),
  }))
}

function scoreItem(
  item: WardrobeItem,
  prefs: StyleTag[],
  recent: string[],
): number {
  let s = item.wearCount * -0.15
  if (prefs.some((p) => item.styles.includes(p))) s += 2
  if (recent.includes(item.id)) s -= 3
  return s
}

export function mockInspirationAnalysis(): string {
  return [
    '结构：上装 + 下装 + 鞋履；整体偏中性通勤色调。',
    '风格关键词：利落剪裁、低饱和、轻微对比。',
    '可在衣橱中按相近色系与版型做单品替换。',
  ].join('\n')
}
