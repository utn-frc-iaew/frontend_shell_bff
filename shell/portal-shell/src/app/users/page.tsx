import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import MicroFrontendLoader from '@/components/MicroFrontendLoader';
import { microfrontends } from '@/config/microfrontends';

export default async function UsersPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/api/auth/login');
  }

  const roles = session.user['https://bff-shell/roles'] || [];
  
  // Verificar que el usuario tenga roles de admin o user-manager
  if (!roles.includes('admin') && !roles.includes('user-manager')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-700 mb-4">
            No tienes permisos para acceder a esta página.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Roles requeridos: <strong>admin</strong> o <strong>user-manager</strong>
          </p>
          <p className="text-sm text-gray-600">
            Tus roles actuales: <strong>{roles.join(', ') || 'ninguno'}</strong>
          </p>
          <a
            href="/"
            className="mt-6 inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <AppLayout userEmail={session.user.email || session.user.name}>
      <div className="h-full">
        <MicroFrontendLoader 
          url={microfrontends.users}
          title="Gestión de Usuarios"
        />
      </div>
    </AppLayout>
  );
}
