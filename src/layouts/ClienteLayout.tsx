import { Outlet } from 'react-router-dom'
import ClienteSidebar from '../components/ClienteSidebar'

export default function ClienteLayout() {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      <ClienteSidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-4 lg:p-6 pt-16 lg:pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

