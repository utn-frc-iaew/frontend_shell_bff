import { Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import { env } from '../config/env';

// JWT validation middleware using Auth0
export const authMiddleware = auth({
  audience: env.auth0.audience,
  issuerBaseURL: `https://${env.auth0.domain}`,
  tokenSigningAlg: 'RS256',
});

// Optional: Extract user info from JWT
export const extractUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    // The auth object is populated by express-oauth2-jwt-bearer
    const auth = req.auth;
    
    if (auth) {
      // Store user info in request for downstream use
      req.user = {
        sub: auth.payload.sub as string | undefined,
        roles: (auth.payload['https://bff-shell/roles'] as string[]) || [],
        permissions: (auth.payload.permissions as string[]) || [],
      };
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];
    
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You do not have the required role to access this resource' 
      });
    }
    
    next();
  };
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub?: string;
        roles: string[];
        permissions: string[];
      };
    }
  }
}
