import { Controller, Get, HttpStatus } from '@nestjs/common';
import { MESSAGE } from './common/messages/messages.constant';
import { createResponse } from './common/utils/create-response.util';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return createResponse(HttpStatus.OK, MESSAGE.COMMON.HEALTHY, {
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }
}
