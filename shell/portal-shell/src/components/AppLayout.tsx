'use client';

import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  userEmail: string;
}

export default function AppLayout({ children, userEmail }: AppLayoutProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Usuarios', href: '/users', icon: '👥' },
    { label: 'Clientes', href: '/customers', icon: '🏢' },
    { label: 'Reportes', href: '/reports', icon: '📈' },
    { label: 'Configuración', href: '/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Portal Shell</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{userEmail}</span>
            <a
              href="/api/auth/logout"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              Cerrar Sesión
            </a>
          </div>
        </div>
      </header>

      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Menú a la IZQUIERDA */}
        <aside className="w-64 bg-white shadow-lg border-r border-gray-200 overflow-auto">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700 font-semibold shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main content - Iframe a la DERECHA */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
