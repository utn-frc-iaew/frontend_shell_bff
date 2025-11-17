import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import userRoutes from './routes/userRoutes';
import customerRoutes from './routes/customerRoutes';
import { allowedOrigins, env } from './config/env';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bff-child-1' });
});

// Protected routes - require user JWT from Auth0
app.use('/api', authMiddleware);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);

// Error handler
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`🚀 BFF Child 1 running on port ${env.port}`);
});

export default app;
