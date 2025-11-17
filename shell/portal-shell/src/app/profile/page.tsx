import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/api/auth/login');
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Mi Perfil</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Información del Usuario</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <p className="mt-1 text-gray-900">{user.name || 'No especificado'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nickname</label>
              <p className="mt-1 text-gray-900">{user.nickname || 'No especificado'}</p>
            </div>

            {user.picture && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
                <img 
                  src={user.picture} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full"
                />
              </div>
            )}

            {user.roles && user.roles.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Roles</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.roles.map((role: string) => (
                    <span 
                      key={role}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Sesión actualizada</label>
              <p className="mt-1 text-gray-900 text-sm">
                {new Date(session.user.updated_at || Date.now()).toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
