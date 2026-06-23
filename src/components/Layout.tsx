import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface LayoutProps {
  title?: string
  children?: ReactNode
}

export function Layout({ title = 'SmartWardrobe', children }: LayoutProps) {
  return (
    <div className="relative min-h-dvh bg-[#F7F6F2] text-[#1b1c1a]">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#F7F6F2]/80 backdrop-blur-2xl border-b border-black/5">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <button className="text-[#827D60] hover:opacity-70 transition-opacity duration-300">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-headline text-xl font-bold tracking-tighter text-[#1b1c1a]">
            {title}
          </h1>
          <button className="text-[#827D60] hover:opacity-70 transition-opacity duration-300">
            <span className="material-symbols-outlined">face</span>
          </button>
        </div>
      </header>

      <main className="pt-20 pb-28 px-4 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
