import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

