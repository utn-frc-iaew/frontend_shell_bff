import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import MicroFrontendLoader from '@/components/MicroFrontendLoader';
import { microfrontends } from '@/config/microfrontends';

export default async function Home() {
  const session = await getSession();
  
  if (!session) {
    redirect('/api/auth/login');
  }

  const user = session.user;
  const roles = user['https://bff-shell/roles'] || [];

  return (
    <AppLayout userEmail={user.email || user.name}>
      <div className="h-full">
        <MicroFrontendLoader 
          url={microfrontends.dashboard}
          title="Dashboard"
        />
      </div>
    </AppLayout>
  );
}
