import { useState, useEffect } from 'react'
import { User } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import { useUsers } from '../hooks/useUsers'

export default function Usuarios() {
  const [searchTerm, setSearchTerm] = useState('')
  const { users, loading, fetchAllUsers, deleteUser } = useUsers()

  useEffect(() => {
    fetchAllUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await deleteUser(id)
      } catch (err) {
        alert('Erro ao deletar usuário')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Usuários</h1>
          <p className="text-gray-400">Gerencie os usuários do sistema</p>
        </div>
      </div>

      {/* Search */}
      <SearchBar
        placeholder="Buscar por nome ou email..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {/* Error Message */}

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Usuário</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Cadastro</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Função</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Carregando...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-white">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{user.registrationDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        user.role === 'admin' 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="px-4 py-2 text-sm bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

