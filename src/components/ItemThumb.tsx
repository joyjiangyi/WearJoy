import type { WardrobeItem } from '../types/models'
import { useWardrobeStore } from '../store/useWardrobeStore'

interface Props {
  item: WardrobeItem
  className?: string
}

export function ItemThumb({ item, className = '' }: Props) {
  const removeBg = useWardrobeStore((s) => s.removeBgEnabled)
  const src = removeBg && item.imageNobgUrl ? item.imageNobgUrl : item.imageUrl
  return (
    <div
      className={[
        'relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#1a1614]/5 ring-1 ring-[#1a1614]/10',
        removeBg && item.imageNobgUrl ? 'bg-[linear-gradient(145deg,#fff,#f0ebe4)]' : '',
        className,
      ].join(' ')}
    >
      <img
        src={src}
        alt={item.name ?? item.category}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      {item.imageNobgUrl && removeBg && (
        <span className="absolute bottom-1 right-1 rounded-md bg-[#1a1614]/70 px-1.5 py-0.5 text-[9px] font-display font-bold text-white">
          去底
        </span>
      )}
    </div>
  )
}
