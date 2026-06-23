import { NavLink } from 'react-router-dom'

interface TabItem {
  to: string
  icon: string
  label: string
  end?: boolean
}

const tabs: TabItem[] = [
  { to: '/', label: '首页', icon: 'auto_awesome', end: true },
  { to: '/wardrobe', label: '衣橱', icon: 'grid_view' },
  { to: '/add', label: '添加', icon: 'add_circle' },
  { to: '/lab', label: '实验室', icon: 'science' },
  { to: '/profile', label: '我的', icon: 'person' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-6 left-0 w-full z-40 flex justify-center items-center pointer-events-none">
      <div className="bg-[#F7F6F2]/70 backdrop-blur-3xl shadow-xl w-[85%] max-w-sm rounded-full px-5 py-3 flex justify-between items-center border border-black/5 pointer-events-auto">
        {tabs.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 active:scale-90',
                isActive
                  ? 'bg-[#827D60] text-white shadow-lg'
                  : 'text-[#49473d] hover:bg-black/5',
              ].join(' ')
            }
          >
            <span className="material-symbols-outlined text-xl">{icon}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
