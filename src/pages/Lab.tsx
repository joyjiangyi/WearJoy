import { useState } from 'react'
import { ItemThumb } from '../components/ItemThumb'
import { Layout } from '../components/Layout'
import { mockInspirationAnalysis } from '../lib/recommend'
import { useWardrobeStore } from '../store/useWardrobeStore'

export function Lab() {
  const items = useWardrobeStore((s) => s.items)
  const addInspiration = useWardrobeStore((s) => s.addInspiration)
  const inspirations = useWardrobeStore((s) => s.inspirations)

  const [preview, setPreview] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [matchedIds, setMatchedIds] = useState<string[]>([])

  const runMatch = (dataUrl: string) => {
    const analysisText = mockInspirationAnalysis()
    setAnalysis(analysisText)
    setMatchScore(85)

    const tops = items.filter((i) => ['上装', '外套'].includes(i.category))
    const bottoms = items.filter((i) => ['下装', '裙装'].includes(i.category))
    const shoes = items.filter((i) => i.category === '鞋')
    const pick = [
      tops[0]?.id,
      bottoms[0]?.id,
      shoes[0]?.id,
      tops[1]?.id,
      bottoms[1]?.id,
    ].filter(Boolean) as string[]
    const unique = [...new Set(pick)]
    setMatchedIds(unique)
    addInspiration(dataUrl, analysisText, unique)
  }

  return (
    <Layout title="Inspiration Lab">
    <div className="flex flex-col items-center">
      {/* Split Screen Container */}
      <div className="w-full max-w-lg flex flex-col gap-4 relative">
        {/* Top Half: Inspiration Reference */}
        <section className="relative h-[320px] w-full rounded-xl overflow-hidden group">
          {preview ? (
            <>
              <img
                src={preview}
                alt="灵感参考"
                className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b1c1a]/30 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="font-label text-[9px] tracking-[0.2em] uppercase text-[#F7F6F2]/90 mb-1 block">
                  参考来源
                </span>
                <h2 className="font-headline text-2xl text-white tracking-wide">
                  穿搭灵感
                </h2>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-[#efeeea] flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-[#cbc6ba] mb-4">
                add_photo_alternate
              </span>
              <p className="text-[#8a8278] text-sm">上传穿搭参考图</p>
            </div>
          )}

          {/* Navigation arrows */}
          <div className="absolute inset-y-0 left-4 flex items-center">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/40 transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
          </div>
          <div className="absolute inset-y-0 right-4 flex items-center">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/40 transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Center Match Score Component */}
        {preview && matchScore !== null && (
          <div className="absolute top-[320px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative flex items-center justify-center">
              {/* Outer Ring */}
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  className="text-[#cbc6ba]/30"
                  cx="48"
                  cy="48"
                  fill="transparent"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  className="text-[#827D60]"
                  cx="48"
                  cy="48"
                  fill="transparent"
                  r="44"
                  stroke="currentColor"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 * (1 - matchScore / 100)}
                  strokeWidth="2"
                />
              </svg>
              {/* Inner Score */}
              <div className="absolute flex flex-col items-center bg-[#F7F6F2]/95 backdrop-blur-xl w-18 h-18 rounded-full shadow-xl border border-[#cbc6ba]/10 flex items-center justify-center p-4">
                <span className="font-headline text-xl text-[#827D60]">{matchScore}%</span>
                <span className="font-label text-[8px] tracking-widest text-[#49473d]">
                  匹配度
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Half: Closet Remix */}
        <section className="h-[320px] w-full bg-[#f5f4f0] rounded-xl relative overflow-hidden flex items-center justify-center border border-[#cbc6ba]/5">
          {matchedIds.length > 0 ? (
            <>
              <div className="absolute top-6 left-6 z-10">
                <span className="font-label text-[9px] tracking-[0.2em] uppercase text-[#49473d] mb-1 block">
                  我的衣橱复刻
                </span>
                <h2 className="font-headline text-2xl text-[#1b1c1a] tracking-wide">
                  你的搭配
                </h2>
              </div>

              {/* Floating Wardrobe Items */}
              <div className="relative w-full h-full flex items-center justify-center scale-90">
                {matchedIds.slice(0, 3).map((id, idx) => {
                  const item = items.find((i) => i.id === id)
                  if (!item) return null
                  const configs = [
                    { rot: -3, x: -32, y: 8, w: 140, h: 180 },
                    { rot: 6, x: 48, y: 40, w: 120, h: 150 },
                    { rot: -12, x: -80, y: -48, w: 70, h: 90 },
                  ]
                  const cfg = configs[idx] ?? configs[0]
                  return (
                    <img
                      key={id}
                      alt={item.name ?? item.category}
                      src={item.imageNobgUrl ?? item.imageUrl}
                      className="absolute opacity-90 mix-blend-multiply drop-shadow-2xl"
                      style={{
                        width: cfg.w,
                        height: 'auto',
                        transform: `rotate(${cfg.rot}deg) translate-x-${cfg.x / 4} translate-y-${cfg.y / 4}`,
                      }}
                    />
                  )
                })}
              </div>

              {/* Action Button */}
              <div className="absolute bottom-6 right-6 z-10">
                <button className="bg-gradient-to-br from-[#827D60] to-[#7a7559] text-white px-6 py-2.5 rounded-full font-label text-[10px] tracking-[0.15em] uppercase shadow-lg hover:opacity-90 transition-all active:scale-95">
                  采用此搭配
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-[#cbc6ba] mb-3 block">
                style
              </span>
              <p className="text-sm text-[#8a8278]">
                {items.length === 0 ? '衣橱为空，请先添加单品' : '上传参考图开始匹配'}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Details Section */}
      <div className="w-full max-w-lg px-4 mt-8 flex flex-col gap-6">
        {/* Analysis Card */}
        {analysis && (
          <div className="bg-[#e3e2df]/30 p-6 rounded-xl">
            <h3 className="font-headline text-lg mb-3">搭配笔记</h3>
            <p className="text-[#49473d] text-[13px] leading-relaxed font-light">
              {analysis}
            </p>
          </div>
        )}

        {/* Match Details */}
        {matchedIds.length > 0 && (
          <div className="flex flex-col gap-3 px-2">
            <div className="flex items-center justify-between border-b border-[#cbc6ba]/10 pb-3">
              <span className="font-label text-[11px] uppercase tracking-widest text-[#49473d]">
                色调统一性
              </span>
              <span className="font-headline text-[#827D60]">极佳</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#cbc6ba]/10 pb-3">
              <span className="font-label text-[11px] uppercase tracking-widest text-[#49473d]">
                轮廓匹配度
              </span>
              <span className="font-headline text-[#827D60]">高</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-label text-[11px] uppercase tracking-widest text-[#49473d]">
                材质质感
              </span>
              <span className="font-headline text-[#827D60]">{matchScore}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <section className="w-full max-w-lg px-4 mt-8">
        <div className="rounded-xl border border-[#cbc6ba]/10 bg-white/70 p-4">
          <label className="block text-sm font-medium text-[#5c534a]">
            上传穿搭参考图
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm text-[#8a8278] file:mr-3 file:rounded-full file:border-0 file:bg-[#1b1c1a] file:px-4 file:py-2 file:font-label file:text-xs file:font-bold file:text-[#f7f3ee]"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                const r = new FileReader()
                r.onload = () => {
                  const url = String(r.result)
                  setPreview(url)
                  runMatch(url)
                }
                r.readAsDataURL(f)
              }}
            />
          </label>
        </div>

        {items.length === 0 && preview && (
          <p className="mt-4 text-sm text-[#ba1a1a]">
            衣橱为空，请先在「添加」录入几件单品。
          </p>
        )}
      </section>

      {/* Recent Inspirations */}
      {inspirations.length > 0 && (
        <section className="w-full max-w-lg px-4 mt-6 pb-8">
          <h3 className="font-headline text-lg mb-3">最近灵感</h3>
          <ul className="space-y-2">
            {inspirations.slice(0, 5).map((insp) => (
              <li
                key={insp.id}
                className="flex gap-3 rounded-2xl border border-[#cbc6ba]/10 bg-white/60 p-2"
              >
                <img
                  src={insp.imageUrl}
                  alt=""
                  className="h-16 w-12 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1 text-xs text-[#8a8278]">
                  <p className="line-clamp-2">{insp.analysisResult}</p>
                  <p className="mt-1 text-[#827D60]">
                    匹配 {insp.matchedItemIds.length} 件
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
    </Layout>
  )
}
