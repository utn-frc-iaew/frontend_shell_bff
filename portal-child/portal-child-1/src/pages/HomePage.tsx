import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import { iframeUser } from '../App'

export default function HomePage() {
  const { user: auth0User, logout } = useAuth0()
  
  // Si estamos en iframe, usar iframeUser, sino usar auth0User
  const isInIframe = window.self !== window.top
  const user = isInIframe ? iframeUser : auth0User

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Portal Child 1</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{user?.name || user?.email}</span>
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Bienvenido a Portal Child 1
          </h2>
          <p className="text-gray-600 mb-4">
            Este es un portal hijo (SPA) con Vite + React 19, integrado con Auth0 y BFF Child 1.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Información del Usuario</h3>
            <p className="text-sm text-blue-800"><strong>Email:</strong> {user?.email}</p>
            <p className="text-sm text-blue-800"><strong>Nombre:</strong> {user?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/users"
            className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Usuarios</h3>
            <p className="text-gray-600">
              Administrar usuarios del sistema
            </p>
          </Link>

          <Link
            to="/customers"
            className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Clientes</h3>
            <p className="text-gray-600">
              Gestionar información de clientes
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}
