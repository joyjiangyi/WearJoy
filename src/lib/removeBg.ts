import { removeBackground } from '@imgly/background-removal'

export type RemoveBgStatus = 'idle' | 'loading' | 'done' | 'error'

export interface RemoveBgProgress {
  status: RemoveBgStatus
  progress?: number
}

/**
 * Removes background from an image (URL or base64 data URL).
 * Returns a PNG data URL with transparent background.
 * First call downloads ~10MB WASM model; subsequent calls use cache.
 */
export async function removeBg(
  imageSource: string,
  onProgress?: (p: RemoveBgProgress) => void,
): Promise<string> {
  onProgress?.({ status: 'loading', progress: 0 })

  let blob: Blob

  if (imageSource.startsWith('data:')) {
    const res = await fetch(imageSource)
    blob = await res.blob()
  } else {
    const res = await fetch(imageSource)
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
    blob = await res.blob()
  }

  onProgress?.({ status: 'loading', progress: 30 })

  const resultBlob = await removeBackground(blob, {
    progress: (key, current, total) => {
      if (key === 'compute:inference') {
        const pct = Math.round(30 + (current / total) * 60)
        onProgress?.({ status: 'loading', progress: pct })
      }
    },
  })

  onProgress?.({ status: 'loading', progress: 95 })

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      onProgress?.({ status: 'done', progress: 100 })
      resolve(reader.result as string)
    }
    reader.onerror = () => reject(new Error('Failed to convert result to data URL'))
    reader.readAsDataURL(resultBlob)
  })
}
