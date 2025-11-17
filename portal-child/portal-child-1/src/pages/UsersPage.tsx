import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { bffClient } from '../services/bffClient'

export default function UsersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await bffClient.get('/api/users')
      return response.data
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Usuarios</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          {isLoading && <p className="text-gray-600">Cargando usuarios...</p>}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">Error al cargar usuarios: {(error as Error).message}</p>
            </div>
          )}
          
          {data && (
            <div>
              <p className="text-gray-600 mb-4">
                Total de usuarios: <strong>{data.count || 0}</strong>
              </p>
              <div className="space-y-2">
                {data.users && data.users.length > 0 ? (
                  data.users.map((user: any) => (
                    <div key={user._id || user.id} className="border-b pb-2">
                      <p className="font-semibold">{user.name || user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No hay usuarios disponibles</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
