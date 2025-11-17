import { tokenManager } from '../tokenService';

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('B2BTokenManager', () => {
  beforeEach(() => {
    tokenManager.clearCache();
    jest.clearAllMocks();
  });

  it('should request a new token from Auth0', async () => {
    const mockToken = 'mock-b2b-token';
    axios.post.mockResolvedValue({
      data: {
        access_token: mockToken,
        expires_in: 3600,
      },
    });

    const token = await tokenManager.getToken('https://api-user');
    
    expect(token).toBe(mockToken);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('should use cached token when still valid', async () => {
    const mockToken = 'mock-b2b-token';
    axios.post.mockResolvedValue({
      data: {
        access_token: mockToken,
        expires_in: 3600,
      },
    });

    // First call
    await tokenManager.getToken('https://api-user');
    
    // Second call should use cache
    const token = await tokenManager.getToken('https://api-user');
    
    expect(token).toBe(mockToken);
    expect(axios.post).toHaveBeenCalledTimes(1); // Only called once
  });

  it('should clear cache', async () => {
    const mockToken = 'mock-b2b-token';
    axios.post.mockResolvedValue({
      data: {
        access_token: mockToken,
        expires_in: 3600,
      },
    });

    await tokenManager.getToken('https://api-user');
    tokenManager.clearCache('https://api-user');
    await tokenManager.getToken('https://api-user');
    
    expect(axios.post).toHaveBeenCalledTimes(2); // Called twice after clearing cache
  });
});
