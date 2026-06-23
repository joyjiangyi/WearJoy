import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  BodyProfile,
  Inspiration,
  ItemCategory,
  Outfit,
  Season,
  StyleTag,
  WardrobeItem,
  WearLog,
} from '../types/models'
import { createId } from '../lib/id'

const defaultBody: BodyProfile = {
  brandSizes: {},
}

interface WardrobeState {
  items: WardrobeItem[]
  outfits: Outfit[]
  wearLogs: WearLog[]
  inspirations: Inspiration[]
  bodyProfile: BodyProfile
  stylePreferences: StyleTag[]
  removeBgEnabled: boolean
  onboardingDone: boolean

  addItem: (partial: Omit<WardrobeItem, 'id' | 'createdAt' | 'wearCount'> & { wearCount?: number }) => void
  updateItem: (id: string, patch: Partial<WardrobeItem>) => void
  removeItem: (id: string) => void
  applyRemoveBgToItem: (id: string) => void
  setItemNobgUrl: (id: string, nobgUrl: string) => void
  setItemPrimaryImage: (id: string, imageUrl: string) => void
  saveOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt'> & { id?: string }) => void
  logWear: (itemIds: string[], outfitId?: string, weatherNote?: string, occasion?: string) => void
  addInspiration: (imageUrl: string, analysis: string, matchedItemIds: string[]) => void
  setBodyProfile: (p: Partial<BodyProfile>) => void
  setStylePreferences: (s: StyleTag[]) => void
  setRemoveBgEnabled: (v: boolean) => void
  completeOnboarding: () => void
  seedDemoItems: () => void
}

const DEMO_ITEMS: Omit<WardrobeItem, 'id' | 'createdAt'>[] = [
  {
    imageUrl:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop',
    category: '外套',
    colors: ['米色'],
    styles: ['通勤', '休闲'],
    seasons: ['秋', '冬', '春'],
    source: 'manual',
    name: '米色短款外套',
    wearCount: 3,
    tags: ['百搭'],
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop',
    category: '上装',
    colors: ['黑色'],
    styles: ['通勤', '正式'],
    seasons: ['四季'],
    source: 'manual',
    name: '黑色高领打底',
    wearCount: 8,
    tags: [],
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1541099649105-f69ad21a3243?w=400&h=500&fit=crop',
    category: '下装',
    colors: ['蓝色'],
    styles: ['休闲', '通勤'],
    seasons: ['四季'],
    source: 'manual',
    name: '直筒牛仔裤',
    wearCount: 5,
    tags: [],
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop',
    category: '鞋',
    colors: ['白色'],
    styles: ['休闲', '运动'],
    seasons: ['四季'],
    source: 'manual',
    name: '白色休闲鞋',
    wearCount: 12,
    tags: [],
  },
]

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set, get) => ({
      items: [],
      outfits: [],
      wearLogs: [],
      inspirations: [],
      bodyProfile: defaultBody,
      stylePreferences: ['通勤', '休闲'],
      removeBgEnabled: false,
      onboardingDone: false,

      addItem: (partial) => {
        const item: WardrobeItem = {
          ...partial,
          id: createId(),
          wearCount: partial.wearCount ?? 0,
          colors: partial.colors ?? [],
          styles: partial.styles ?? [],
          seasons: partial.seasons ?? ['四季'],
          tags: partial.tags ?? [],
          createdAt: new Date().toISOString(),
        }
        if (get().removeBgEnabled) {
          item.imageNobgUrl = item.imageUrl
        }
        set((s) => ({ items: [item, ...s.items] }))
      },

      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),

      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
          outfits: s.outfits.map((o) => ({
            ...o,
            itemIds: o.itemIds.filter((x) => x !== id),
          })),
        })),

      applyRemoveBgToItem: (id) => {
        const item = get().items.find((i) => i.id === id)
        if (!item) return
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, imageNobgUrl: i.imageUrl } : i,
          ),
        }))
      },

      setItemNobgUrl: (id, nobgUrl) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, imageNobgUrl: nobgUrl } : i)),
        })),

      setItemPrimaryImage: (id, imageUrl) =>
        set((s) => ({
          items: s.items.map((i) => {
            if (i.id !== id) return i
            const others = (i.images ?? [imageUrl]).filter((u) => u !== imageUrl)
            return { ...i, imageUrl, imageNobgUrl: undefined, images: [imageUrl, ...others] }
          }),
        })),

      saveOutfit: (outfit) => {
        const full: Outfit = {
          id: outfit.id ?? createId(),
          name: outfit.name,
          itemIds: outfit.itemIds,
          occasion: outfit.occasion,
          season: outfit.season,
          imageUrl: outfit.imageUrl,
          sourceType: outfit.sourceType,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ outfits: [full, ...s.outfits] }))
      },

      logWear: (itemIds, outfitId, weatherNote, occasion) => {
        const log: WearLog = {
          id: createId(),
          outfitId,
          itemIds,
          date: new Date().toISOString().slice(0, 10),
          weatherNote,
          occasion,
        }
        set((s) => ({
          wearLogs: [log, ...s.wearLogs].slice(0, 400),
          items: s.items.map((i) =>
            itemIds.includes(i.id) ? { ...i, wearCount: i.wearCount + 1 } : i,
          ),
        }))
      },

      addInspiration: (imageUrl, analysis, matchedItemIds) => {
        const row: Inspiration = {
          id: createId(),
          imageUrl,
          analysisResult: analysis,
          matchedItemIds,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ inspirations: [row, ...s.inspirations] }))
      },

      setBodyProfile: (p) =>
        set((s) => {
          const { brandSizes: b, ...rest } = p
          return {
            bodyProfile: {
              ...s.bodyProfile,
              ...rest,
              brandSizes: b
                ? { ...s.bodyProfile.brandSizes, ...b }
                : s.bodyProfile.brandSizes,
            },
          }
        }),

      setStylePreferences: (stylePreferences) => set({ stylePreferences }),

      setRemoveBgEnabled: (removeBgEnabled) => set({ removeBgEnabled }),

      completeOnboarding: () => set({ onboardingDone: true }),

      seedDemoItems: () => {
        if (get().items.length > 0) return
        DEMO_ITEMS.forEach((d) => {
          get().addItem({ ...d, source: d.source })
        })
      },
    }),
    { name: 'smartwardrobe-mvp' },
  ),
)

export const CATEGORY_OPTIONS: ItemCategory[] = [
  '上装',
  '下装',
  '外套',
  '裙装',
  '鞋',
  '包',
  '配饰',
]

export const STYLE_OPTIONS: StyleTag[] = ['通勤', '休闲', '约会', '运动', '正式']

export const SEASON_OPTIONS: Season[] = ['春', '夏', '秋', '冬', '四季']

export const TOP_FIT_OPTIONS: import('../types/models').TopFit[] = ['短款', '常规', '长款', '超长款']

export const BOTTOM_FIT_OPTIONS: import('../types/models').BottomFit[] = ['修身', '直筒', '阔腿', '喇叭']
