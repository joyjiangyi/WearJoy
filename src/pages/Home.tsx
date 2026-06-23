import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWardrobeStore } from '../store/useWardrobeStore'
import { fetchWeather } from '../lib/weather'
import { buildOutfitRecommendations } from '../lib/recommend'
import { ItemThumb } from '../components/ItemThumb'
import { Layout } from '../components/Layout'
import type { WeatherSnapshot } from '../types/models'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function Home() {
  const items = useWardrobeStore((s) => s.items)
  const stylePreferences = useWardrobeStore((s) => s.stylePreferences)
  const wearLogs = useWardrobeStore((s) => s.wearLogs)
  const logWear = useWardrobeStore((s) => s.logWear)
  const saveOutfit = useWardrobeStore((s) => s.saveOutfit)
  const onboardingDone = useWardrobeStore((s) => s.onboardingDone)
  const completeOnboarding = useWardrobeStore((s) => s.completeOnboarding)
  const seedDemoItems = useWardrobeStore((s) => s.seedDemoItems)

  const [weather, setWeather] = useState<WeatherSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const w = await fetchWeather()
      if (alive) {
        setWeather(w)
        setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const recentItemIds = useMemo(() => {
    const last = wearLogs[0]
    return last?.itemIds ?? []
  }, [wearLogs])

  const recommendations = useMemo(() => {
    if (!weather) return []
    return buildOutfitRecommendations({
      items,
      tempC: weather.tempC,
      stylePreferences,
      recentItemIds,
    })
  }, [items, weather, stylePreferences, recentItemIds])

  const todayLabel = format(new Date(), 'M月d日 EEEE', { locale: zhCN })

  // Mock schedule for demo
  const scheduleItems = ['辛皮奥内公园野餐', '创意会议', '画廊开幕']

  return (
    <Layout title="SmartWardrobe">
    <div className="space-y-6">
      {/* 天气 & 今日日程 */}
      <section className="space-y-3">
        {/* 天气卡片 */}
        <div className="bg-[#f5f4f0]/40 glass-effect p-4 rounded-lg flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#827D60] text-2xl">light_mode</span>
            <div>
              <p className="font-label text-[9px] tracking-widest uppercase text-[#49473d]">
                {weather?.city ?? '加载中'}，{weather?.condition ?? ''}
              </p>
              <h2 className="font-headline text-xl">
                {weather ? `${weather.tempC}°C` : '--°C'}
              </h2>
            </div>
          </div>
          <p className="font-body text-[11px] text-[#49473d] text-right leading-snug">
            {weather?.condition === '晴天'
              ? '空气清新微凉，\n适合轻盈叠穿。'
              : '今日天气宜人，\n适合出行。'}
          </p>
        </div>

        {/* 日程卡片 */}
        <div className="bg-[#f5f4f0]/40 glass-effect p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="font-label text-[9px] tracking-widest uppercase text-[#49473d]">
              今日日程
            </p>
            <span className="w-1 h-1 bg-[#827D60] rounded-full"></span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {scheduleItems.map((item, idx) => (
              <span
                key={idx}
                className="flex-shrink-0 px-3 py-1 rounded-full bg-white/60 text-[#1b1c1a] text-[10px] font-medium border border-[#cbc6ba]/10"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 今日穿搭建议 */}
      <section>
        <div className="flex justify-between items-baseline mb-4 px-1">
          <h3 className="font-headline text-xl">今日穿搭建议</h3>
          <span className="font-label text-[10px] tracking-widest text-[#49473d] uppercase">
            OOTD_{format(new Date(), 'MMdd')}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="space-y-4">
            {/* Onboarding */}
            {!onboardingDone && (
              <div className="rounded-lg border border-[#c45c3e]/30 bg-[#c45c3e]/10 p-4">
                <p className="font-headline font-bold">快速开始</p>
                <p className="mt-1 text-sm text-[#5c534a]">
                  可先载入演示单品体验推荐与实验室；正式使用请从「添加」录入自己的衣服。
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-[#1b1c1a] px-4 py-2 font-label text-xs font-bold text-white"
                    onClick={() => {
                      seedDemoItems()
                      completeOnboarding()
                    }}
                  >
                    载入演示单品
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-[#1b1c1a]/20 px-4 py-2 font-label text-xs font-bold text-[#1b1c1a]"
                    onClick={() => completeOnboarding()}
                  >
                    跳过
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-dashed border-[#cbc6ba] bg-white/40 p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-[#cbc6ba] mb-2">checkroom</span>
              <p className="text-sm text-[#8a8278]">
                衣橱为空。去「添加」录入衣服，即可生成推荐。
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* 穿搭组合展示 */}
            <div className="relative bg-[#efeeea] rounded-lg overflow-hidden h-[340px] flex items-center justify-center border border-[#cbc6ba]/5">
              {/* 背景装饰 */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-br from-[#827D60]/20 to-transparent" />
              </div>

              {/* 穿搭叠放 */}
              <div className="relative w-full h-full flex items-center justify-center scale-[0.85]">
                {recommendations[0]?.itemIds.map((id, idx) => {
                  const item = items.find((i) => i.id === id)
                  if (!item) return null
                  const rotations = [-2, 6, -12, 12]
                  const xOffsets = [-16, 48, -64, 64]
                  const yOffsets = [0, 32, -48, -80]
                  return (
                    <div
                      key={id}
                      className="absolute bg-white/95 p-2 rounded-lg shadow-lg"
                      style={{
                        transform: `rotate(${rotations[idx] ?? 0}deg) translate-x-${Math.abs(xOffsets[idx] ?? 0) / 4} translate-y-${Math.abs(yOffsets[idx] ?? 0) / 4}`,
                        zIndex: idx + 10,
                        width: idx === 0 ? '140px' : idx === 1 ? '100px' : idx === 2 ? '72px' : '60px',
                      }}
                    >
                      <img
                        src={item.imageNobgUrl ?? item.imageUrl}
                        alt={item.name ?? item.category}
                        className="w-full h-auto object-contain mix-blend-multiply"
                        style={{ height: idx === 0 ? '120px' : idx === 1 ? '90px' : idx === 2 ? '50px' : '30px' }}
                      />
                      <p className="font-headline text-[8px] mt-1 truncate">
                        {item.name ?? item.category}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* 详情按钮 */}
              <Link
                to="/wardrobe"
                className="absolute bottom-5 right-5 bg-[#827D60] text-white px-5 py-2.5 rounded-full font-label text-[10px] tracking-widest uppercase shadow-lg active:scale-95 transition-transform z-40"
              >
                穿搭详情
              </Link>
            </div>

            {/* 推荐套装列表 */}
            <div className="mt-4 space-y-3">
              {recommendations.map((outfit, idx) => (
                <div
                  key={outfit.id}
                  className="bg-white/70 backdrop-blur p-4 rounded-lg border border-[#1b1c1a]/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-label text-[9px] font-semibold uppercase tracking-widest text-[#8a8278]">
                        方案 {idx + 1}
                      </p>
                      <h4 className="font-headline text-base text-[#1b1c1a]">
                        {outfit.name}
                      </h4>
                      {outfit.occasion && (
                        <p className="text-xs text-[#3d5c4a]">{outfit.occasion}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="shrink-0 bg-[#827D60] text-white px-3 py-2 rounded-full font-label text-[10px] tracking-wider"
                      onClick={() => {
                        logWear(
                          outfit.itemIds,
                          outfit.id,
                          weather
                            ? `${weather.condition} ${weather.tempC}°C`
                            : undefined,
                          outfit.occasion,
                        )
                        saveOutfit({
                          name: outfit.name,
                          itemIds: outfit.itemIds,
                          occasion: outfit.occasion,
                          sourceType: 'ai',
                        })
                      }}
                    >
                      就穿这套
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {outfit.itemIds.map((id) => {
                      const item = items.find((i) => i.id === id)
                      if (!item) return null
                      return (
                        <div key={id} className="space-y-1">
                          <ItemThumb item={item} />
                          <p className="truncate text-center text-[10px] text-[#8a8278]">
                            {item.name ?? item.category}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 衣橱周报 */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-headline text-xl">衣橱周报</h3>
          <Link
            to="/profile"
            className="font-label text-[9px] tracking-widest uppercase border-b border-[#827D60]/40 text-[#827D60]"
          >
            完整分析
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
          {/* 利用率卡片 */}
          <div className="snap-center min-w-[260px] bg-white p-6 rounded-lg flex flex-col justify-between h-44 border border-[#cbc6ba]/10 shadow-sm">
            <div>
              <p className="font-label text-[9px] tracking-widest text-[#49473d] mb-1 uppercase">
                本周衣橱利用率
              </p>
              <h4 className="font-headline text-4xl text-[#827D60]">
                {items.length > 0 ? Math.min(82 + Math.floor(items.length * 2), 99) : 0}%
              </h4>
            </div>
            <p className="font-body text-[11px] text-[#49473d] leading-relaxed">
              您本周尝试了{' '}
              <span className="font-bold text-[#827D60]">
                {Math.max(1, Math.floor(items.length / 3))} 种新风格
              </span>
              。出色的策展意识，有效减少了闲置。
            </p>
          </div>

          {/* 色调卡片 */}
          <div className="snap-center min-w-[260px] bg-[#827D60] text-white p-6 rounded-lg flex flex-col justify-between h-44">
            <div>
              <p className="font-label text-[9px] tracking-widest opacity-80 mb-1 uppercase">
                主打色调
              </p>
              <h4 className="font-headline text-2xl">大地色系</h4>
              <p className="font-body text-[10px] opacity-70 mt-1">
                橄榄绿 & 燕麦色 & 暖木棕
              </p>
            </div>
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-[#615c42] border border-white/20"></div>
              <div className="w-7 h-7 rounded-full bg-[#e7e3ce] border border-white/20"></div>
              <div className="w-7 h-7 rounded-full bg-[#8b7355] border border-white/20"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </Layout>
  )
}
