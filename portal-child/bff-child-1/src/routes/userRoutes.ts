import { Router, Request, Response } from 'express';
import { createInternalApiClient } from '../services/tokenService';
import { extractUser } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();

// Apply user extraction middleware
router.use(extractUser);

/**
 * GET /api/users
 * Get all users from api-user service
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const apiClient = await createInternalApiClient(
      env.apis.userUrl,
      env.apis.userAudience
    );

    const response = await apiClient.get('/users');
    
    // BFF can transform/aggregate data here
    res.json({
      users: response.data,
      count: response.data.length,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch users',
      message: error.message,
    });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const apiClient = await createInternalApiClient(
      env.apis.userUrl,
      env.apis.userAudience
    );

    const response = await apiClient.get(`/users/${id}`);
    res.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching user ${req.params.id}:`, error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch user',
      message: error.message,
    });
  }
});

/**
 * POST /api/users
 * Create a new user (example)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const apiClient = await createInternalApiClient(
      env.apis.userUrl,
      env.apis.userAudience
    );

    const response = await apiClient.post('/users', req.body);
    res.status(201).json(response.data);
  } catch (error: any) {
    console.error('Error creating user:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to create user',
      message: error.message,
    });
  }
});

export default router;
