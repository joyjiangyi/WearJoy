import type { WeatherSnapshot } from '../types/models'

const SHANGHAI = { lat: 31.23, lon: 121.47, city: '上海' }

export async function fetchWeather(
  lat = SHANGHAI.lat,
  lon = SHANGHAI.lon,
  city = SHANGHAI.city,
): Promise<WeatherSnapshot> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Asia%2FShanghai`
    const res = await fetch(url)
    if (!res.ok) throw new Error('weather http')
    const data = (await res.json()) as {
      current: { temperature_2m: number; weather_code: number }
    }
    const code = data.current.weather_code
    const condition = wmoLabel(code)
    return {
      tempC: Math.round(data.current.temperature_2m),
      condition,
      city,
      fetchedAt: new Date().toISOString(),
    }
  } catch {
    return {
      tempC: 22,
      condition: '多云（离线演示）',
      city,
      fetchedAt: new Date().toISOString(),
    }
  }
}

function wmoLabel(code: number): string {
  if (code === 0) return '晴朗'
  if (code <= 3) return '多云'
  if (code <= 48) return '雾或霾'
  if (code <= 57) return '细雨'
  if (code <= 67) return '雨'
  if (code <= 77) return '雪'
  if (code <= 82) return '阵雨'
  if (code <= 86) return '雪阵'
  return '恶劣天气'
}
