import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';

interface TokenCache {
  token: string;
  expiresAt: number;
}

class B2BTokenManager {
  private tokenCache: Map<string, TokenCache> = new Map();

  /**
   * Get a B2B token for calling internal APIs using Client Credentials flow
   */
  async getToken(audience: string): Promise<string> {
    // Check cache
    const cached = this.tokenCache.get(audience);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.token;
    }

    // Request new token from Auth0
    try {
      const response = await axios.post(
        env.auth0.tokenUrl,
        {
          grant_type: 'client_credentials',
          client_id: env.auth0.clientId,
          client_secret: env.auth0.clientSecret,
          audience: audience,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const token = response.data.access_token;
      const expiresIn = response.data.expires_in || 3600; // Default 1 hour

      // Cache token (with 5 minute buffer before expiration)
      this.tokenCache.set(audience, {
        token,
        expiresAt: Date.now() + (expiresIn - 300) * 1000,
      });

      return token;
    } catch (error) {
      console.error('Error obtaining B2B token:', error);
      throw new Error('Failed to obtain B2B token');
    }
  }

  /**
   * Clear token cache for a specific audience or all
   */
  clearCache(audience?: string) {
    if (audience) {
      this.tokenCache.delete(audience);
    } else {
      this.tokenCache.clear();
    }
  }
}

export const tokenManager = new B2BTokenManager();

/**
 * Create an Axios instance configured for internal API calls
 */
export async function createInternalApiClient(
  baseURL: string,
  audience: string
): Promise<AxiosInstance> {
  const token = await tokenManager.getToken(audience);

  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
  });
}
