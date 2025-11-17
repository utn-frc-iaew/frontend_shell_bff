import { Routes, Route } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useRef, useState } from 'react'
import HomePage from './pages/HomePage'
import UsersPage from './pages/UsersPage'
import CustomersPage from './pages/CustomersPage'
import LoginPage from './pages/LoginPage'
import LoadingSpinner from './components/LoadingSpinner'
import { setupBffClient } from './services/bffClient'

// Variables globales para almacenar el token y usuario del iframe
export let iframeAccessToken: string | null = null;
export let iframeUser: any | null = null;

const PARENT_ORIGIN = import.meta.env.VITE_PORTAL_SHELL_ORIGIN

if (!PARENT_ORIGIN) {
  throw new Error('VITE_PORTAL_SHELL_ORIGIN must be defined')
}

function App() {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [isInIframe, setIsInIframe] = useState(false)
  const [hasToken, setHasToken] = useState(false)
  const interceptorCleanup = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!interceptorCleanup.current) {
      interceptorCleanup.current = setupBffClient(getAccessTokenSilently)
    }

    // Detectar si estamos dentro de un iframe
    const inIframe = window.self !== window.top
    setIsInIframe(inIframe)

    let removeMessageListener: (() => void) | undefined

    if (inIframe) {
      // Escuchar mensajes del padre (portal-shell) para recibir el token
      const handleMessage = (event: MessageEvent) => {
        // Validar el origen por seguridad
  if (event.origin !== PARENT_ORIGIN) return

        if (event.data.type === 'AUTH_TOKEN' && event.data.token) {
          console.log('Token received from parent!')
          iframeAccessToken = event.data.token
          setHasToken(true)
        }

        if (event.data.type === 'USER_INFO' && event.data.user) {
          console.log('User info received from parent!')
          iframeUser = event.data.user
        }
      }

      window.addEventListener('message', handleMessage)
      removeMessageListener = () => window.removeEventListener('message', handleMessage)
    }

    return () => {
      removeMessageListener?.()
      interceptorCleanup.current?.()
      interceptorCleanup.current = null
    }
  }, [getAccessTokenSilently])

  if (isLoading) {
    return <LoadingSpinner />
  }

  // Si estamos en un iframe, esperar a tener el token
  if (isInIframe) {
    console.log('Running in iframe mode, hasToken:', hasToken)
    
    // Renderizar siempre, incluso sin token para debugging
    return (
      <div className="min-h-screen bg-gray-50">
        {!hasToken && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 m-4">
            <p className="font-bold">Esperando token del portal shell...</p>
            <p className="text-sm">Origin esperado: {PARENT_ORIGIN}</p>
          </div>
        )}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
        </Routes>
      </div>
    )
  }

  // Si NO estamos en iframe y no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/customers" element={<CustomersPage />} />
    </Routes>
  )
}

export default App
