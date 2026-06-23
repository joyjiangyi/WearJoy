import { useState } from 'react'
import { STYLE_OPTIONS, useWardrobeStore } from '../store/useWardrobeStore'
import { Layout } from '../components/Layout'
import { getStoredApiKey, setStoredApiKey } from '../lib/visionAnalysis'
import type { BodyProfile, StyleTag } from '../types/models'

export function Profile() {
  const bodyProfile = useWardrobeStore((s) => s.bodyProfile)
  const setBodyProfile = useWardrobeStore((s) => s.setBodyProfile)
  const stylePreferences = useWardrobeStore((s) => s.stylePreferences)
  const setStylePreferences = useWardrobeStore((s) => s.setStylePreferences)
  const removeBgEnabled = useWardrobeStore((s) => s.removeBgEnabled)
  const setRemoveBgEnabled = useWardrobeStore((s) => s.setRemoveBgEnabled)
  const items = useWardrobeStore((s) => s.items)
  const wearLogs = useWardrobeStore((s) => s.wearLogs)

  const [brandKey, setBrandKey] = useState('')
  const [brandVal, setBrandVal] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState(getStoredApiKey())
  const [apiKeySaved, setApiKeySaved] = useState(false)

  const handleSaveApiKey = () => {
    setStoredApiKey(apiKeyInput)
    setApiKeySaved(true)
    setTimeout(() => setApiKeySaved(false), 2000)
  }

  const togglePref = (s: StyleTag) => {
    setStylePreferences(
      stylePreferences.includes(s)
        ? stylePreferences.filter((x) => x !== s)
        : [...stylePreferences, s],
    )
  }

  const idleCount = items.filter((i) => i.wearCount === 0).length

  // Mock silhouette URL
  const silhouetteUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcCeLEMueioWcjWE77yxFbydt2sYeR0587CqMa7j-NIc5_-63kGqJGd8BT1R0fNmIkUEmhFJ1QiLY5wqOLvk4V9s1Sz3cF4igkANBohO43PcEQJwIsAcwh_ZERUVKUoctkab3yqtW6YkE5x1GRHZwhKTWwT_4ajo1giIZocxKwHTNH_MBmsJ_ToeLsZMz1bbYbyL8tSOkjk2lqV2z2zcd5WhOQiEhT_8lFdQ6DRP7IbMi0qMKPcX41PhCIuxAeMbVVnauU-KWx0hI'

  const brands = [
    { name: 'ZARA', color: '#000000', system: '系统推荐' },
    { name: 'UNIQLO', color: '#E60012', system: '标准尺码' },
    { name: 'COS', color: '#000000', system: '廓形设计' },
  ]

  return (
    <Layout title="Archive">
    <div className="pb-8">
      {/* 页面标题 */}
      <header className="mb-6">
        <h1 className="font-headline text-3xl font-extrabold text-[#1b1c1a]">ARCHIVE</h1>
        <p className="mt-1 text-sm text-[#8a8278]">身材档案与偏好会影响推荐排序</p>
      </header>

      {/* 数据统计 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="font-headline text-2xl text-[#1b1c1a]">{items.length}</p>
          <p className="text-[10px] text-[#8a8278] mt-1">单品总数</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="font-headline text-2xl text-[#1b1c1a]">{wearLogs.length}</p>
          <p className="text-[10px] text-[#8a8278] mt-1">穿搭日数</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="font-headline text-2xl text-[#ba1a1a]">{idleCount}</p>
          <p className="text-[10px] text-[#8a8278] mt-1">未穿着</p>
        </div>
      </div>

      {/* 身型轮廓 */}
      <div className="relative bg-[#f5f4f0] rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-center py-6">
          <div className="relative w-[200px] h-[240px]">
            <img
              alt="身型轮廓"
              src={silhouetteUrl}
              className="w-full h-full object-contain mix-blend-multiply opacity-80"
            />
            <div className="absolute top-[15%] left-[-20%]">
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md">
                <span className="w-1 h-1 rounded-full bg-[#827D60] animate-pulse"></span>
                <span className="font-body text-[9px] tracking-widest">肩宽</span>
              </div>
            </div>
            <div className="absolute top-[45%] right-[-25%]">
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md">
                <span className="w-1 h-1 rounded-full bg-[#827D60] animate-pulse"></span>
                <span className="font-body text-[9px] tracking-widest">腰围</span>
              </div>
            </div>
            <div className="absolute bottom-[25%] left-[-20%]">
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md">
                <span className="w-1 h-1 rounded-full bg-[#827D60] animate-pulse"></span>
                <span className="font-body text-[9px] tracking-widest">臀围</span>
              </div>
            </div>
            <div className="absolute bottom-2 right-0 bg-white/80 px-3 py-1 rounded-full border border-[#cbc6ba]/30 shadow-sm">
              <p className="font-headline text-[10px] tracking-widest text-[#827D60]">
                {bodyProfile.bodyType ?? '未设置体型'}
              </p>
            </div>
          </div>
        </div>
        {/* 三围数据横排 */}
        <div className="grid grid-cols-3 divide-x divide-[#cbc6ba]/20 border-t border-[#cbc6ba]/20">
          {[
            { label: '肩宽', value: bodyProfile.shoulderWidth },
            { label: '腰围', value: bodyProfile.waist },
            { label: '臀围', value: bodyProfile.hips },
          ].map(({ label, value }) => (
            <div key={label} className="py-3 text-center">
              <p className="font-body text-[9px] uppercase tracking-widest text-[#49473d]">{label}</p>
              <p className="font-headline text-lg mt-0.5">
                {value ?? '--'}<span className="text-[9px] ml-0.5">cm</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI 造型建议 */}
      <div className="bg-gradient-to-br from-[#827D60] to-[#5f5c4c] rounded-xl p-5 text-white mb-6">
        <p className="font-body text-[9px] uppercase tracking-[0.2em] mb-2 opacity-80">AI 造型建议</p>
        <p className="font-headline text-sm leading-relaxed">
          {bodyProfile.bodyType
            ? `建议选择剪裁考究的西装外套和高腰长裤，以平衡您的${bodyProfile.bodyType}身型比例。`
            : '完善您的身材档案，获取更精准的穿搭建议。'}
        </p>
      </div>

      {/* 尺码记忆 */}
      <div className="bg-[#efeeea] rounded-xl p-4 mb-6">
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-[#49473d] mb-3">尺码记忆</p>
        <div className="space-y-2">
          {brands.map((brand) => {
            const savedSize = bodyProfile.brandSizes[brand.name]
            return (
              <div
                key={brand.name}
                className="bg-white rounded-lg p-3 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center text-white rounded-sm text-[8px] font-bold shrink-0"
                    style={{ backgroundColor: brand.color }}
                  >
                    {brand.name.slice(0, 4)}
                  </div>
                  <div>
                    <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#1b1c1a]">{brand.name}</p>
                    <p className="text-[9px] text-[#8a8278]">{brand.system}</p>
                  </div>
                </div>
                <span className="font-headline text-2xl text-[#827D60]">
                  {savedSize ?? (brand.name === 'ZARA' ? 'M' : brand.name === 'UNIQLO' ? 'S' : '36')}
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={brandKey}
            onChange={(e) => setBrandKey(e.target.value)}
            placeholder="品牌"
            className="flex-1 rounded-full border border-[#cbc6ba] px-3 py-2 text-xs"
          />
          <input
            value={brandVal}
            onChange={(e) => setBrandVal(e.target.value)}
            placeholder="尺码"
            className="w-16 rounded-full border border-[#cbc6ba] px-3 py-2 text-xs"
          />
          <button
            type="button"
            className="rounded-full bg-[#827D60] px-4 py-2 font-label text-[10px] uppercase tracking-wider text-white"
            onClick={() => {
              if (!brandKey.trim() || !brandVal.trim()) return
              setBodyProfile({ brandSizes: { [brandKey.trim()]: brandVal.trim() } })
              setBrandKey('')
              setBrandVal('')
            }}
          >
            添加
          </button>
        </div>
      </div>

      {/* Style Preferences */}
      <section className="mt-8 rounded-xl border border-[#cbc6ba]/10 bg-white/70 p-4">
        <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-[#8a8278] mb-4">
          风格偏好
        </h2>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => togglePref(s)}
              className={[
                'rounded-full px-4 py-2 font-label text-xs font-semibold transition-all',
                stylePreferences.includes(s)
                  ? 'bg-[#827D60] text-white'
                  : 'bg-white text-[#49473d] border border-[#cbc6ba]/20',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Body Profile Form */}
      <section className="mt-6 rounded-xl border border-[#cbc6ba]/10 bg-white/70 p-4">
        <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-[#8a8278] mb-4">
          身材档案
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-[#5c534a]">
            身高 cm
            <input
              type="number"
              value={bodyProfile.height ?? ''}
              onChange={(e) =>
                setBodyProfile({
                  height: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="mt-1 w-full rounded-xl border border-[#cbc6ba]/20 bg-white px-3 py-2.5 text-sm"
            />
          </label>
          <label className="text-xs text-[#5c534a]">
            体重 kg
            <input
              type="number"
              value={bodyProfile.weight ?? ''}
              onChange={(e) =>
                setBodyProfile({
                  weight: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="mt-1 w-full rounded-xl border border-[#cbc6ba]/20 bg-white px-3 py-2.5 text-sm"
            />
          </label>
        </div>

        <label className="mt-4 block text-xs text-[#5c534a]">
          体型
          <select
            value={bodyProfile.bodyType ?? ''}
            onChange={(e) => {
              const v = e.target.value
              setBodyProfile({
                bodyType:
                  v === '' ? undefined : (v as NonNullable<BodyProfile['bodyType']>),
              })
            }}
            className="mt-1 w-full rounded-xl border border-[#cbc6ba]/20 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">未填写</option>
            <option value="梨形">梨形</option>
            <option value="苹果形">苹果形</option>
            <option value="沙漏形">沙漏形</option>
            <option value="H形">H形</option>
            <option value="倒三角">倒三角</option>
          </select>
        </label>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {(['topSize', 'bottomSize', 'shoeSize'] as const).map((field) => (
            <label key={field} className="text-xs text-[#5c534a]">
              {field === 'topSize' ? '上装' : field === 'bottomSize' ? '下装' : '鞋码'}
              <input
                value={String(bodyProfile[field] ?? '')}
                onChange={(e) => setBodyProfile({ [field]: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#cbc6ba]/20 bg-white px-2 py-2 text-sm"
              />
            </label>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <label className="text-xs text-[#5c534a]">
            肩宽 cm
            <input
              type="number"
              value={bodyProfile.shoulderWidth ?? ''}
              onChange={(e) =>
                setBodyProfile({
                  shoulderWidth: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="mt-1 w-full rounded-xl border border-[#cbc6ba]/20 bg-white px-2 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-[#5c534a]">
            腰围 cm
            <input
              type="number"
              value={bodyProfile.waist ?? ''}
              onChange={(e) =>
                setBodyProfile({
                  waist: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="mt-1 w-full rounded-xl border border-[#cbc6ba]/20 bg-white px-2 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-[#5c534a]">
            臀围 cm
            <input
              type="number"
              value={bodyProfile.hips ?? ''}
              onChange={(e) =>
                setBodyProfile({
                  hips: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="mt-1 w-full rounded-xl border border-[#cbc6ba]/20 bg-white px-2 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      {/* Background Removal Toggle */}
      <section className="mt-6 rounded-xl border border-[#cbc6ba]/10 bg-white/70 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-sm font-bold text-[#1b1c1a]">
              图片背景移除
            </h2>
            <p className="mt-1 text-xs text-[#8a8278]">
              开启后新录入单品会自动去除背景
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={removeBgEnabled}
            onClick={() => setRemoveBgEnabled(!removeBgEnabled)}
            className={[
              'relative h-8 w-14 shrink-0 rounded-full transition-colors',
              removeBgEnabled ? 'bg-[#827D60]' : 'bg-[#cbc6ba]',
            ].join(' ')}
          >
            <span
              className={[
                'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform flex items-center justify-center',
                removeBgEnabled ? 'left-7' : 'left-1',
              ].join(' ')}
            >
              <span className="material-symbols-outlined text-sm text-[#827D60]">
                {removeBgEnabled ? 'done' : ''}
              </span>
            </span>
          </button>
        </div>
      </section>

      {/* Claude API Key */}
      <section className="rounded-2xl bg-white/70 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#827D60]">auto_awesome</span>
          <h2 className="font-headline text-sm font-bold text-[#1b1c1a]">AI 搭配分析</h2>
        </div>
        <p className="text-xs text-[#8a8278] leading-relaxed">
          填入 Claude API Key 后，导入淘宝商品时系统会自动分析商家搭配图，提取推荐的配对单品类型，让推荐更有审美。
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="sk-ant-..."
            className="flex-1 rounded-xl border border-[#cbc6ba]/20 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#827D60]/20 font-mono"
          />
          <button
            type="button"
            onClick={handleSaveApiKey}
            className="shrink-0 rounded-xl bg-[#827D60] px-4 py-2.5 font-label text-xs font-bold text-white active:scale-95 transition-transform"
          >
            {apiKeySaved ? '已保存 ✓' : '保存'}
          </button>
        </div>
        <p className="text-[10px] text-[#8a8278]">
          Key 仅存储在本地浏览器，不会上传。前往{' '}
          <span className="text-[#827D60]">console.anthropic.com</span> 获取。
        </p>
      </section>
    </div>
    </Layout>
  )
}
