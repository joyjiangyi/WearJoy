import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Wardrobe } from './pages/Wardrobe'
import { AddItem } from './pages/AddItem'
import { Lab } from './pages/Lab'
import { Profile } from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="wardrobe" element={<Wardrobe />} />
        <Route path="add" element={<AddItem />} />
        <Route path="lab" element={<Lab />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
