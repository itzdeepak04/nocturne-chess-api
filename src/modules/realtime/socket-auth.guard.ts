import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
@Injectable()
export class SocketAuthGuard implements CanActivate {
 constructor(private readonly jwt: JwtService) {}
 canActivate(context: ExecutionContext) {
  const socket=context.switchToWs().getClient<Socket>();
  try {
   const token=socket.handshake.auth?.token??socket.handshake.headers.authorization?.replace(/^Bearer /,'');
   const payload=this.jwt.verify<{sub:string}>(token);
   if(payload.sub!==socket.data.user?.userId)throw new Error();
   return true;
  } catch {socket.disconnect(true);return false;}
 }
}
