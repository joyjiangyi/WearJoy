import { useState, useCallback } from 'react'
import { removeBg, type RemoveBgProgress } from './removeBg'
import { useWardrobeStore } from '../store/useWardrobeStore'

export function useRemoveBg() {
  const setItemNobgUrl = useWardrobeStore((s) => s.setItemNobgUrl)
  const [progress, setProgress] = useState<RemoveBgProgress>({ status: 'idle' })

  const process = useCallback(
    async (itemId: string, imageUrl: string) => {
      setProgress({ status: 'loading', progress: 0 })
      try {
        const nobgUrl = await removeBg(imageUrl, setProgress)
        setItemNobgUrl(itemId, nobgUrl)
        setProgress({ status: 'done', progress: 100 })
      } catch (err) {
        console.error('Background removal failed:', err)
        setProgress({ status: 'error' })
      }
    },
    [setItemNobgUrl],
  )

  const reset = useCallback(() => setProgress({ status: 'idle' }), [])

  return { progress, process, reset }
}
