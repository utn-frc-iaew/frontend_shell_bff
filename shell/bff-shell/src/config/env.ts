import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (name: string, defaultValue?: string): string => {
  const value = process.env[name] ?? defaultValue;

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
};

const parsePort = (value: string): number => {
  const port = Number(value);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid port value: ${value}`);
  }

  return port;
};

export const env = {
  nodeEnv: requireEnv('NODE_ENV', 'development'),
  port: parsePort(requireEnv('PORT', '4000')),
  auth0: {
    domain: requireEnv('AUTH0_DOMAIN'),
    audience: requireEnv('AUTH0_AUDIENCE'),
    clientId: requireEnv('AUTH0_CLIENT_ID'),
    clientSecret: requireEnv('AUTH0_CLIENT_SECRET'),
    tokenUrl: requireEnv('AUTH0_TOKEN_URL'),
  },
  apis: {
    userUrl: requireEnv('API_USER_URL'),
    userAudience: requireEnv('API_USER_AUDIENCE'),
    customerUrl: requireEnv('API_CUSTOMER_URL'),
    customerAudience: requireEnv('API_CUSTOMER_AUDIENCE'),
  },
  portals: {
    shellUrl: requireEnv('PORTAL_SHELL_URL'),
    childUrl: requireEnv('PORTAL_CHILD_URL'),
  },
} as const;

export const allowedOrigins = [env.portals.shellUrl, env.portals.childUrl];
