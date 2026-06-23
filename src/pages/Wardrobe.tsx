import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ItemThumb } from '../components/ItemThumb'
import { Layout } from '../components/Layout'
import {
  CATEGORY_OPTIONS,
  useWardrobeStore,
} from '../store/useWardrobeStore'
import { useRemoveBg } from '../lib/useRemoveBg'
import type { ItemCategory, WardrobeItem } from '../types/models'

const CATEGORY_TABS = ['全部单品', ...CATEGORY_OPTIONS]

export function Wardrobe() {
  const items = useWardrobeStore((s) => s.items)
  const removeItem = useWardrobeStore((s) => s.removeItem)
  const removeBgEnabled = useWardrobeStore((s) => s.removeBgEnabled)
  const setItemPrimaryImage = useWardrobeStore((s) => s.setItemPrimaryImage)
  const { progress: bgProgress, process: processBg, reset: resetBg } = useRemoveBg()

  const [cat, setCat] = useState<ItemCategory | '全部单品'>('全部单品')
  const [q, setQ] = useState('')
  const [detail, setDetail] = useState<WardrobeItem | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (cat !== '全部单品' && i.category !== cat) return false
      if (!q.trim()) return true
      const n = (i.name ?? '').toLowerCase()
      const t = i.tags.join(' ').toLowerCase()
      const c = i.colors.join(' ').toLowerCase()
      const qq = q.toLowerCase()
      return (
        n.includes(qq) || t.includes(qq) || c.includes(qq) || i.category.includes(qq)
      )
    })
  }, [items, cat, q])

  return (
    <Layout title="Digital Wardrobe">
    <div className="space-y-6">
      {/* 搜索和导入 */}
      <section className="flex flex-col gap-2">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#49473d]/40 text-lg">
            search
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索您的衣橱..."
            className="w-full bg-[#f5f4f0]/50 border-none rounded-2xl py-3 pl-12 pr-6 focus:ring-1 focus:ring-[#827D60]/20 text-[#1b1c1a] placeholder:text-[#49473d]/30 text-sm transition-all duration-300 outline-none"
          />
        </div>
        <button className="w-full bg-[#f5f4f0] border border-black/5 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl hover:bg-[#e9e8e4] transition-all duration-300 active:scale-[0.98]">
          <span className="material-symbols-outlined text-sm text-[#827D60]">link</span>
          <span className="font-label text-sm font-medium tracking-wide">链接导入</span>
        </button>
      </section>

      {/* 分类筛选 */}
      <nav className="overflow-x-auto no-scrollbar">
        <div className="flex gap-8 items-center min-w-max">
          {CATEGORY_TABS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c as ItemCategory | '全部单品')}
              className={[
                'text-sm tracking-widest pb-2 transition-colors',
                cat === c
                  ? 'text-[#827D60] font-semibold border-b-2 border-[#827D60]'
                  : 'text-[#49473d]/60 hover:text-[#827D60]',
              ].join(' ')}
            >
              {c}
            </button>
          ))}
        </div>
      </nav>

      {/* 衣橱网格 */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <span className="material-symbols-outlined text-5xl text-[#cbc6ba] mb-3 block">
            checkroom
          </span>
          <p className="text-sm text-[#8a8278]">
            {q ? '没有匹配的单品' : '衣橱为空，去「添加」录入衣服吧'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10">
          {filtered.map((item) => (
            <div key={item.id} className="group cursor-pointer" onClick={() => { setDetail(item); setPreviewUrl(null) }}>
              {/* 图片区域 */}
              <div className="relative aspect-[3/4] flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.03]">
                <img
                  src={item.imageNobgUrl ?? item.imageUrl}
                  alt={item.name ?? item.category}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                />
                {/* 穿着次数标签 */}
                {item.wearCount > 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/60 backdrop-blur-md rounded-full border border-black/5">
                    <span className="text-[9px] font-bold tracking-tighter text-[#1b1c1a]">
                      已穿{item.wearCount}次
                    </span>
                  </div>
                )}
                {/* 相似款标签 */}
                {item.wearCount < 3 && item.wearCount > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-[#FEFCE8]/80 backdrop-blur-md rounded-full border border-[#827D60]/10">
                    <div className="w-1 h-1 rounded-full bg-[#827D60] animate-pulse"></div>
                    <span className="text-[9px] font-medium text-[#827D60] tracking-wide">
                      相似款
                    </span>
                  </div>
                )}
              </div>
              {/* 文字信息 */}
              <div className="flex justify-between items-start mt-2.5">
                <div>
                  <h3 className="font-headline font-bold text-base text-[#1b1c1a] leading-tight">
                    {item.name ?? item.category}
                  </h3>
                  {item.colors.length > 0 && (
                    <p className="font-label text-[9px] text-[#827D60] uppercase tracking-wider mt-1">
                      {item.colors[0]}
                    </p>
                  )}
                </div>
                <button
                  className="text-[#49473d]/40"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDetail(item)
                  }}
                >
                  <span className="material-symbols-outlined text-lg">more_vert</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空状态提示 */}
      {filtered.length === 0 && items.length > 0 && q && (
        <p className="text-center text-sm text-[#8a8278]">没有找到匹配 "{q}" 的单品</p>
      )}

      {/* 快捷添加按钮 */}
      {items.length > 0 && (
        <Link
          to="/add"
          className="fixed bottom-28 right-4 w-12 h-12 bg-[#827D60] text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-30"
        >
          <span className="material-symbols-outlined">add</span>
        </Link>
      )}

      {/* 单品详情弹窗 */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#1b1c1a]/40 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal
          aria-labelledby="item-detail-title"
          onClick={() => { setDetail(null); setPreviewUrl(null) }}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-[#F7F6F2] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <h2 id="item-detail-title" className="font-headline text-xl font-bold">
                {detail.name ?? detail.category}
              </h2>
              <button
                type="button"
                className="rounded-full p-1 hover:bg-black/10"
                onClick={() => { setDetail(null); setPreviewUrl(null) }}
                aria-label="关闭"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* 预览图（点缩略图时切换，不影响主图） */}
            <div className="mt-3 max-w-xs mx-auto">
              <img
                src={previewUrl ?? detail.imageNobgUrl ?? detail.imageUrl}
                alt={detail.name ?? detail.category}
                className="w-full aspect-[4/4] object-contain rounded-lg bg-[#efeeea]"
              />
            </div>

            {/* 多图图库 */}
            {(detail.images?.length ?? 0) > 1 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-[#8a8278] uppercase tracking-wider">
                    全部图片 · 点击预览
                  </p>
                  {previewUrl && previewUrl !== detail.imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setItemPrimaryImage(detail.id, previewUrl)
                        setDetail({ ...detail, imageUrl: previewUrl, imageNobgUrl: undefined, images: [previewUrl, ...(detail.images ?? []).filter(u => u !== previewUrl)] })
                        setPreviewUrl(null)
                      }}
                      className="text-[10px] font-semibold text-[#827D60] border border-[#827D60] rounded-full px-3 py-1 active:scale-95 transition-transform"
                    >
                      设为主图
                    </button>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {(detail.images ?? []).map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setPreviewUrl(url)}
                      className={[
                        'shrink-0 w-14 h-[4.5rem] rounded-lg overflow-hidden border-2 transition-all',
                        (previewUrl ?? detail.imageUrl) === url
                          ? 'border-[#827D60]'
                          : 'border-transparent opacity-50 hover:opacity-80',
                      ].join(' ')}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 统计卡片 */}
            <div className="mt-4 grid grid-cols-2 gap-px bg-[#cbc6ba]/10 bg-[#f5f4f0] rounded-lg overflow-hidden border border-[#cbc6ba]/10">
              <div className="bg-white/40 p-4 flex flex-col justify-center">
                <p className="text-[9px] uppercase tracking-widest text-[#49473d]/60 font-semibold mb-1">
                  穿搭次数
                </p>
                <p className="font-headline italic text-xl">{detail.wearCount}次</p>
              </div>
              <div className="bg-white/40 p-4 flex flex-col justify-center border-l border-[#cbc6ba]/10">
                <p className="text-[9px] uppercase tracking-widest text-[#49473d]/60 font-semibold mb-1">
                  估算成本
                </p>
                <p className="font-headline italic text-xl">
                  {detail.price ? `¥${Math.round(detail.price / Math.max(detail.wearCount, 1))}` : '--'}
                </p>
              </div>
            </div>

            {/* 标签 */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-white/60 border border-[#cbc6ba]/10 text-[9px] font-label tracking-widest text-[#49473d] uppercase">
                {detail.category}
              </span>
              {detail.fit && (
                <span className="px-3 py-1 rounded-full bg-[#f0ede4] border border-[#827D60]/20 text-[9px] font-label tracking-widest text-[#827D60] uppercase">
                  {detail.fit}
                </span>
              )}
              {detail.colors.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1 rounded-full bg-white/60 border border-[#cbc6ba]/10 text-[9px] font-label tracking-widest text-[#49473d] uppercase"
                >
                  {c}
                </span>
              ))}
              {detail.styles.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full bg-white/60 border border-[#cbc6ba]/10 text-[9px] font-label tracking-widest text-[#49473d] uppercase"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* AI 搭配建议 */}
            {(detail.pairedWith?.length ?? 0) > 0 && (
              <div className="mt-4 rounded-xl bg-[#f5f4f0] p-3 space-y-1.5">
                <p className="text-[10px] font-semibold text-[#827D60] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  商家推荐搭配
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {detail.pairedWith!.map((p) => (
                    <span key={p} className="px-2.5 py-1 rounded-full bg-[#827D60]/10 text-[10px] text-[#5c534a] font-medium">
                      {p}
                    </span>
                  ))}
                </div>
                {detail.styleNotes && (
                  <p className="text-[10px] text-[#8a8278] italic">{detail.styleNotes}</p>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={bgProgress.status === 'loading' || !!detail.imageNobgUrl}
                className="rounded-full border border-[#cbc6ba] px-4 py-2 font-label text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => processBg(detail.id, detail.imageUrl)}
              >
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">auto_fix</span>
                  {detail.imageNobgUrl ? '已去背景' : 'AI 背景移除'}
                </span>
              </button>
              <button
                type="button"
                className="rounded-full bg-[#ba1a1a] px-4 py-2 font-label text-xs uppercase tracking-wider text-white"
                onClick={() => {
                  removeItem(detail.id)
                  resetBg()
                  setDetail(null)
                }}
              >
                删除单品
              </button>
            </div>

            {/* 去背景进度条 */}
            {bgProgress.status === 'loading' && (
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-[#5c534a]">AI 正在处理…首次加载约 10 秒</p>
                  <span className="font-headline text-xs text-[#827D60]">{bgProgress.progress ?? 0}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#cbc6ba]/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#827D60] transition-all duration-300"
                    style={{ width: `${bgProgress.progress ?? 0}%` }}
                  />
                </div>
              </div>
            )}
            {bgProgress.status === 'error' && (
              <p className="mt-2 text-xs text-[#ba1a1a]">处理失败，请检查图片链接后重试。</p>
            )}
            {bgProgress.status === 'done' && (
              <p className="mt-2 text-xs text-[#3d5c4a]">✓ 背景已移除，效果已更新。</p>
            )}
            <p className="mt-2 text-[10px] text-[#8a8278]">
              {removeBgEnabled ? '全局开启时新单品自动处理。' : '在「我的」中开启全局自动去背景。'}
            </p>
          </div>
        </div>
      )}
    </div>
    </Layout>
  )
}
