import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { auth } from 'express-oauth2-jwt-bearer';

@Injectable()
export class AuthGuard implements CanActivate {
  private jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: 'RS256',
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return new Promise((resolve, reject) => {
      this.jwtCheck(request, response, (err: any) => {
        if (err) {
          reject(new UnauthorizedException('Invalid or missing token'));
        } else {
          resolve(true);
        }
      });
    });
  }
}
