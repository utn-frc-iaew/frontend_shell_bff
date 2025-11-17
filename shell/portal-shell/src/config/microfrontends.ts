const getEnv = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
};

const childBaseUrl = getEnv('NEXT_PUBLIC_PORTAL_CHILD_URL', 'http://localhost:3001');

export const microfrontends = {
  dashboard: childBaseUrl,
  users: `${childBaseUrl}/users`,
  customers: `${childBaseUrl}/customers`,
};
