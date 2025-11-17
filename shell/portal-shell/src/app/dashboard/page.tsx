import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/api/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Usuarios</h3>
            <p className="text-3xl font-bold text-primary-600">1,234</p>
            <p className="text-sm text-gray-500 mt-2">Total de usuarios registrados</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Clientes</h3>
            <p className="text-3xl font-bold text-primary-600">567</p>
            <p className="text-sm text-gray-500 mt-2">Clientes activos</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Ventas</h3>
            <p className="text-3xl font-bold text-primary-600">$89,234</p>
            <p className="text-sm text-gray-500 mt-2">Ventas del mes</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
          <p className="text-gray-600">Aquí se mostrarían los datos desde el BFF...</p>
        </div>
      </main>
    </div>
  );
}
