import axios, { AxiosHeaders } from 'axios'
import { useAuth0 } from '@auth0/auth0-react'
import { iframeAccessToken } from '../App'

const BFF_URL = import.meta.env.VITE_BFF_CHILD_URL ?? 'http://localhost:4001'

// Create axios instance
export const bffClient = axios.create({
  baseURL: BFF_URL,
  timeout: 10000,
})

// Add request interceptor to include Auth0 access token
export const setupBffClient = (
  getAccessTokenSilently: ReturnType<typeof useAuth0>['getAccessTokenSilently']
) => {
  const interceptorId = bffClient.interceptors.request.use(
    async (config) => {
      try {
        // Si estamos en iframe, usar el token del iframe
        const isInIframe = window.self !== window.top

        let token: string | undefined
        if (isInIframe) {
          // Esperar hasta que el token del iframe esté disponible
          let attempts = 0
          while (!iframeAccessToken && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100))
            attempts++
          }
          
          if (iframeAccessToken) {
            token = iframeAccessToken
            console.log('Using iframe token')
          } else {
            console.warn('Iframe token not available after waiting, trying Auth0...')
            token = await getAccessTokenSilently()
          }
        } else {
          token = await getAccessTokenSilently()
          console.log('Using Auth0 token')
        }

        if (token) {
          const headers = (config.headers ?? new AxiosHeaders()) as AxiosHeaders
          headers.set('Authorization', `Bearer ${token}`)
          config.headers = headers
        }
      } catch (error) {
        console.error('Error getting access token:', error)
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  return () => {
    bffClient.interceptors.request.eject(interceptorId)
  }
}
