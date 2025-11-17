import type { Metadata } from 'next'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import './globals.css'

export const metadata: Metadata = {
  title: 'Portal Shell - SSR',
  description: 'Portal Shell with Auth0 and BFF Architecture',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <UserProvider>
        <body className="bg-gray-50">
          {children}
        </body>
      </UserProvider>
    </html>
  )
}
