import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  checkHealth() {
    return {
      status: 'ok',
      service: 'api-user',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  getRoot() {
    return {
      service: 'API User',
      version: '1.0.0',
      description: 'User management API with NestJS and MongoDB',
    };
  }
}
