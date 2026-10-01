import { ArgumentsHost,Catch,ExceptionFilter,HttpException,HttpStatus } from '@nestjs/common';
import { createResponse } from '../utils/create-response.util';
import { MESSAGE } from '../messages/messages.constant';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception:unknown,host:ArgumentsHost){
    const response=host.switchToHttp().getResponse();
    const code=exception instanceof HttpException?exception.getStatus():HttpStatus.INTERNAL_SERVER_ERROR;
    const body=exception instanceof HttpException?exception.getResponse():null;
    const value=typeof body==='string'?body:body&&typeof body==='object'&&'message'in body?(body as {message:string|string[]}).message:MESSAGE.COMMON.INTERNAL_ERROR;
    response.status(code).json(createResponse(code,Array.isArray(value)?value.join(', '):value,null));
  }
}
