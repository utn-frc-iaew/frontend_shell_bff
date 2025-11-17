import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  checkHealth() {
    return {
      status: 'ok',
      service: 'api-customer',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  getRoot() {
    return {
      service: 'API Customer',
      version: '1.0.0',
      description: 'Customer management API with NestJS and MongoDB',
    };
  }
}
