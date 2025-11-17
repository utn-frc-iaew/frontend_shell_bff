import { Router, Request, Response } from 'express';
import { createInternalApiClient } from '../services/tokenService';
import { extractUser } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();

// Apply user extraction middleware
router.use(extractUser);

/**
 * GET /api/customers
 * Get all customers from api-customer service
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const apiClient = await createInternalApiClient(
      env.apis.customerUrl,
      env.apis.customerAudience
    );

    const response = await apiClient.get('/customers');
    
    // BFF can transform/aggregate data here
    res.json({
      customers: response.data,
      count: response.data.length,
    });
  } catch (error: any) {
    console.error('Error fetching customers:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch customers',
      message: error.message,
    });
  }
});

/**
 * GET /api/customers/:id
 * Get customer by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const apiClient = await createInternalApiClient(
      env.apis.customerUrl,
      env.apis.customerAudience
    );

    const response = await apiClient.get(`/customers/${id}`);
    res.json(response.data);
  } catch (error: any) {
    console.error(`Error fetching customer ${req.params.id}:`, error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch customer',
      message: error.message,
    });
  }
});

/**
 * POST /api/customers
 * Create a new customer
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const apiClient = await createInternalApiClient(
      env.apis.customerUrl,
      env.apis.customerAudience
    );

    const response = await apiClient.post('/customers', req.body);
    res.status(201).json(response.data);
  } catch (error: any) {
    console.error('Error creating customer:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to create customer',
      message: error.message,
    });
  }
});

export default router;
