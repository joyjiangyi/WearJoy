import { CloudSun } from 'lucide-react'
import type { WeatherSnapshot } from '../types/models'

interface Props {
  weather: WeatherSnapshot | null
  loading?: boolean
}

export function WeatherCard({ weather, loading }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[var(--radius-card)] border border-[#1a1614]/12 bg-gradient-to-br from-[#3d5c4a]/12 via-[#f7f3ee] to-[#c45c3e]/10 p-5 shadow-sm">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#c45c3e]/20 blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#8a8278]">
            今日天气
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-[#1a1614]">
            {loading ? '同步中…' : weather ? `${weather.city}` : '—'}
          </h2>
          {weather && !loading && (
            <p className="mt-2 text-sm text-[#3d5c4a]">
              {weather.condition} · {weather.tempC}°C
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a1614]/5">
          <CloudSun className="h-7 w-7 text-[#3d5c4a]" aria-hidden />
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-[#8a8278]">
        推荐会参考气温筛选厚薄与外套；后续可接入日程与定位授权。
      </p>
    </section>
  )
}
