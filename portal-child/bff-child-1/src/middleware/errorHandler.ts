import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // JWT validation errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message || 'Invalid or missing token',
    });
  }

  // Axios errors from internal API calls
  if (err.isAxiosError) {
    return res.status(err.response?.status || 500).json({
      error: 'Internal API Error',
      message: err.response?.data?.message || 'Error calling internal API',
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
};
