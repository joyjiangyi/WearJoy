import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import {
  BOTTOM_FIT_OPTIONS,
  CATEGORY_OPTIONS,
  SEASON_OPTIONS,
  STYLE_OPTIONS,
  TOP_FIT_OPTIONS,
  useWardrobeStore,
} from '../store/useWardrobeStore'
import { useRemoveBg } from '../lib/useRemoveBg'
import { fetchTaobaoImages } from '../lib/taobao'
import { analyzeOutfitImages, getStoredApiKey } from '../lib/visionAnalysis'
import type { BottomFit, ItemCategory, ItemFit, Season, StyleTag, TopFit } from '../types/models'

type Tab = 'link' | 'upload'

export function AddItem() {
  const addItem = useWardrobeStore((s) => s.addItem)
  const removeBgEnabled = useWardrobeStore((s) => s.removeBgEnabled)
  const navigate = useNavigate()
  const { progress: bgProgress, process: processBg } = useRemoveBg()
  const [tab, setTab] = useState<Tab>('link')
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [taobaoUrl, setTaobaoUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [allImages, setAllImages] = useState<string[]>([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ItemCategory>('上装')
  const [colors, setColors] = useState('')
  const [styles, setStyles] = useState<StyleTag[]>(['通勤'])
  const [seasons, setSeasons] = useState<Season[]>(['四季'])
  const [fit, setFit] = useState<ItemFit | ''>('')

  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [pairedWith, setPairedWith] = useState<string[]>([])
  const [styleNotes, setStyleNotes] = useState('')
  const hasApiKey = !!getStoredApiKey()

  const resetForm = () => {
    setTaobaoUrl('')
    setImageUrl('')
    setAllImages([])
    setName('')
    setColors('')
    setFilePreview(null)
    setFetchError(null)
    setFit('')
    setPairedWith([])
    setStyleNotes('')
  }

  const handleFetchTaobao = async () => {
    if (!taobaoUrl.trim()) return
    setFetching(true)
    setFetchError(null)
    setPairedWith([])
    setStyleNotes('')
    try {
      const result = await fetchTaobaoImages(taobaoUrl.trim())
      setImageUrl(result.primaryImage)
      setAllImages(result.images)

      // 有 API Key 且是上装/下装/外套/裙装时，自动触发搭配分析
      if (hasApiKey && ['上装', '下装', '外套', '裙装'].includes(category) && result.images.length > 1) {
        setAnalyzing(true)
        try {
          const analysis = await analyzeOutfitImages(result.images, category)
          setPairedWith(analysis.pairedWith)
          setStyleNotes(analysis.styleNotes)
        } catch {
          // 分析失败不阻断主流程，静默忽略
        } finally {
          setAnalyzing(false)
        }
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : '抓取失败，请手动粘贴图片地址')
    } finally {
      setFetching(false)
    }
  }

  const toggleStyle = (s: StyleTag) => {
    setStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )
  }

  const toggleSeason = (s: Season) => {
    setSeasons((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )
  }

  const submit = async () => {
    const src = tab === 'upload' ? filePreview : imageUrl
    if (!src?.trim()) return

    addItem({
      imageUrl: src.trim(),
      images: tab === 'link' && allImages.length > 0
        ? [src.trim(), ...allImages.filter((u) => u !== src.trim())]
        : undefined,
      category,
      fit: fit || undefined,
      pairedWith: pairedWith.length > 0 ? pairedWith : undefined,
      styleNotes: styleNotes || undefined,
      colors: colors
        .split(/[,，、\s]+/)
        .map((c) => c.trim())
        .filter(Boolean),
      styles: styles.length ? styles : ['休闲'],
      seasons: seasons.length ? seasons : ['四季'],
      source: tab === 'link' ? 'taobao' : 'manual',
      sourceUrl: tab === 'link' ? taobaoUrl.trim() || undefined : undefined,
      name: name.trim() || undefined,
      tags: [],
    })

    // Find the newly created item (it's prepended to the list)
    const newItem = useWardrobeStore.getState().items[0]
    if (removeBgEnabled && newItem) {
      await processBg(newItem.id, src.trim())
    }

    resetForm()
    navigate('/wardrobe')
  }

  return (
    <Layout title="添加单品">
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-extrabold text-[#1b1c1a]">添加单品</h1>
        <p className="mt-1 text-sm leading-relaxed text-[#8a8278]">
          淘宝自动抓取需后端代理。当前可粘贴商品页主图 URL，或使用相册/拍照生成本地预览。
        </p>
      </header>

      {/* Tab Switcher */}
      <div className="flex rounded-2xl bg-[#efeeea] p-1">
        {(
          [
            ['link', '链接导入'],
            ['upload', '相册 / 拍照'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={[
              'flex-1 rounded-xl py-2.5 font-label text-xs font-semibold transition-colors',
              tab === key
                ? 'bg-white text-[#1b1c1a] shadow-sm'
                : 'text-[#8a8278]',
            ].join(' ')}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Link Import */}
      {tab === 'link' && (
        <div className="space-y-4 rounded-xl border border-[#cbc6ba]/10 bg-white/70 p-4">
          <div>
            <p className="text-sm font-medium text-[#5c534a] mb-1">淘宝商品链接</p>
            <div className="flex gap-2">
              <input
                value={taobaoUrl}
                onChange={(e) => { setTaobaoUrl(e.target.value); setFetchError(null) }}
                placeholder="https://item.taobao.com/..."
                className="flex-1 rounded-xl border border-[#cbc6ba]/20 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#827D60]/20"
              />
              <button
                type="button"
                disabled={!taobaoUrl.trim() || fetching}
                onClick={handleFetchTaobao}
                className="shrink-0 rounded-xl bg-[#827D60] px-4 py-2.5 font-label text-xs font-bold text-white disabled:opacity-40 active:scale-95 transition-transform"
              >
                {fetching ? '抓取中…' : '自动抓取'}
              </button>
            </div>
            {fetchError && (
              <p className="mt-2 text-xs text-[#ba1a1a]">{fetchError}</p>
            )}
            {fetching && (
              <p className="mt-2 text-xs text-[#827D60]">正在通过代理读取页面，约 3-5 秒…</p>
            )}
          </div>

          <label className="block text-sm font-medium text-[#5c534a]">
            商品主图 URL
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="自动抓取后自动填入，也可手动粘贴"
              className="mt-1 w-full rounded-xl border border-[#cbc6ba]/20 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#827D60]/20"
            />
          </label>
          {/* 多图选择器 */}
          {allImages.length > 1 && (
            <div>
              <p className="text-xs text-[#8a8278] mb-2">
                共 {allImages.length} 张图，点击选择主图（⭐ 优先选无模特的实拍图）
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {allImages.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setImageUrl(url)}
                    className={[
                      'shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all',
                      imageUrl === url ? 'border-[#827D60]' : 'border-transparent opacity-60',
                    ].join(' ')}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* AI 搭配分析状态 */}
          {analyzing && (
            <div className="flex items-center gap-2 py-2">
              <span className="material-symbols-outlined text-sm text-[#827D60] animate-spin">refresh</span>
              <p className="text-xs text-[#827D60]">AI 正在分析商家搭配图…</p>
            </div>
          )}
          {!analyzing && pairedWith.length > 0 && (
            <div className="rounded-xl bg-[#f5f4f0] p-3 space-y-1.5">
              <p className="text-[10px] font-semibold text-[#827D60] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                AI 从商家图提取的搭配建议
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pairedWith.map((p) => (
                  <span key={p} className="px-2.5 py-1 rounded-full bg-[#827D60]/10 text-[10px] text-[#5c534a] font-medium">
                    {p}
                  </span>
                ))}
              </div>
              {styleNotes && (
                <p className="text-[10px] text-[#8a8278] italic">{styleNotes}</p>
              )}
            </div>
          )}
          {!hasApiKey && ['上装', '下装', '外套', '裙装'].includes(category) && (
            <p className="text-[10px] text-[#8a8278]">
              💡 在「我的」页面填入 Claude API Key，可自动从商家图分析搭配建议
            </p>
          )}

          {imageUrl && (
            <img
              src={imageUrl}
              alt="预览"
              className="max-h-48 w-full rounded-xl object-contain bg-[#efeeea] ring-1 ring-[#cbc6ba]/10"
            />
          )}
        </div>
      )}

      {/* Upload */}
      {tab === 'upload' && (
        <div className="space-y-4 rounded-xl border border-[#cbc6ba]/10 bg-white/70 p-4">
          <label className="block text-sm font-medium text-[#5c534a]">
            选择图片
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="mt-2 block w-full text-sm text-[#8a8278] file:mr-3 file:rounded-full file:border-0 file:bg-[#827D60] file:px-4 file:py-2 file:font-label file:text-xs file:font-semibold file:text-white"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                const r = new FileReader()
                r.onload = () => setFilePreview(String(r.result))
                r.readAsDataURL(f)
              }}
            />
          </label>
          {filePreview && (
            <img
              src={filePreview}
              alt="预览"
              className="max-h-56 w-full rounded-2xl object-cover ring-1 ring-[#cbc6ba]/10"
            />
          )}
        </div>
      )}

      {/* Item Details */}
      <div className="space-y-4 rounded-xl border border-[#cbc6ba]/10 bg-white/70 p-4">
        <label className="block text-sm font-medium text-[#5c534a]">
          名称（可选）
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#cbc6ba]/20 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#827D60]/20"
          />
        </label>
        <label className="block text-sm font-medium text-[#5c534a]">
          类别
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ItemCategory)}
            className="mt-1 w-full rounded-xl border border-[#cbc6ba]/20 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#827D60]/20"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-[#5c534a]">
          颜色（逗号分隔）
          <input
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder="米白, 藏青"
            className="mt-1 w-full rounded-xl border border-[#cbc6ba]/20 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#827D60]/20"
          />
        </label>

        {/* Style Tags */}
        <div>
          <p className="text-sm font-medium text-[#5c534a] mb-2">风格</p>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleStyle(s)}
                className={[
                  'rounded-full px-3 py-1.5 font-label text-xs font-semibold transition-all',
                  styles.includes(s)
                    ? 'bg-[#827D60] text-white'
                    : 'bg-[#efeeea] text-[#5c534a]',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Season Tags */}
        <div>
          <p className="text-sm font-medium text-[#5c534a] mb-2">季节</p>
          <div className="flex flex-wrap gap-2">
            {SEASON_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSeason(s)}
                className={[
                  'rounded-full px-3 py-1.5 font-label text-xs font-semibold transition-all',
                  seasons.includes(s)
                    ? 'bg-[#5f5c4c] text-white'
                    : 'bg-[#efeeea] text-[#5c534a]',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Fit — only show for tops / bottoms / outerwear / skirts */}
        {['上装', '下装', '外套', '裙装'].includes(category) && (
          <div>
            <p className="text-sm font-medium text-[#5c534a] mb-1">版型</p>
            <p className="text-[10px] text-[#8a8278] mb-2">
              {['上装', '外套'].includes(category)
                ? '上装版型影响与下装的比例搭配'
                : '下装版型影响与上装的比例搭配'}
            </p>
            <div className="flex flex-wrap gap-2">
              {(['上装', '外套'].includes(category) ? TOP_FIT_OPTIONS : BOTTOM_FIT_OPTIONS).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFit((prev) => (prev === f ? '' : f))}
                  className={[
                    'rounded-full px-3 py-1.5 font-label text-xs font-semibold transition-all',
                    fit === f
                      ? 'bg-[#827D60] text-white'
                      : 'bg-[#efeeea] text-[#5c534a]',
                  ].join(' ')}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={submit}
        disabled={
          (tab === 'link' ? !imageUrl.trim() : !filePreview) ||
          bgProgress.status === 'loading'
        }
        className="w-full rounded-2xl bg-[#827D60] py-4 font-label text-sm font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] transition-transform"
      >
        {bgProgress.status === 'loading' ? '保存中...' : '保存到衣橱'}
      </button>

      {/* Background Removal Progress */}
      {bgProgress.status === 'loading' && (
        <div className="rounded-xl bg-[#f5f4f0] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-label text-xs text-[#5c534a] tracking-wide">
              <span className="material-symbols-outlined text-sm align-middle mr-1 text-[#827D60]">
                auto_fix
              </span>
              AI 正在移除背景…首次加载约 10 秒
            </p>
            <span className="font-headline text-sm text-[#827D60]">
              {bgProgress.progress ?? 0}%
            </span>
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
        <p className="text-center text-xs text-[#ba1a1a]">
          背景移除失败，已保留原图。可在衣橱详情页重试。
        </p>
      )}

      <p className="text-center text-xs text-[#8a8278]">
        保存后可去{' '}
        <Link className="text-[#827D60] underline" to="/wardrobe">
          衣橱
        </Link>{' '}
        查看与管理。
      </p>
    </div>
    </Layout>
  )
}
