'use client';

interface DynamicMenuProps {
  roles: string[];
}

interface MenuItem {
  label: string;
  href: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', href: '/dashboard', roles: [] }, // Visible para todos
  { label: 'Usuarios', href: '/users', roles: ['admin', 'user-manager'] },
  { label: 'Clientes', href: '/customers', roles: ['admin', 'sales'] },
  { label: 'Reportes', href: '/reports', roles: ['admin', 'analyst'] },
  { label: 'Configuración', href: '/settings', roles: ['admin'] },
];

export default function DynamicMenu({ roles }: DynamicMenuProps) {
  const visibleItems = menuItems.filter(item => {
    // Si el item no tiene roles requeridos, es visible para todos
    if (item.roles.length === 0) return true;
    // Verificar si el usuario tiene alguno de los roles requeridos
    return item.roles.some(role => roles.includes(role));
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Menú Dinámico (basado en roles)
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Los siguientes ítems son visibles según tus roles: 
        <span className="font-semibold"> {roles.length > 0 ? roles.join(', ') : 'ninguno'}</span>
      </p>
      <nav className="space-y-2">
        {visibleItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-md transition-colors"
          >
            {item.label}
            {item.roles.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                (requiere: {item.roles.join(' o ')})
              </span>
            )}
          </a>
        ))}
      </nav>
    </div>
  );
}
