import { useAuth0 } from '@auth0/auth0-react'

export default function LoginPage() {
  const { loginWithRedirect } = useAuth0()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Portal Child 1
          </h2>
          <p className="text-gray-600 mb-8">
            Inicia sesión para acceder a la aplicación
          </p>
          <button
            onClick={() => loginWithRedirect()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Iniciar Sesión con Auth0
          </button>
        </div>
      </div>
    </div>
  )
}
