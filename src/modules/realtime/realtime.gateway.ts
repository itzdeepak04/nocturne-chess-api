import { Injectable, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket,MessageBody,OnGatewayConnection,OnGatewayDisconnect,SubscribeMessage,WebSocketGateway,WebSocketServer } from '@nestjs/websockets';
import { Server,Socket } from 'socket.io';
import { MatchesAbstractService } from '../matches/services/matches.abstract.service';

import { SocketAuthGuard } from './socket-auth.guard';
type AuthSocket=Socket&{data:{user:{userId:string;publicId:string}}};
@Injectable()
@UseGuards(SocketAuthGuard)
@WebSocketGateway({namespace:'/game',cors:{origin:process.env.CLIENT_ORIGIN?.split(',')??['http://localhost:5173'],credentials:true}})
export class RealtimeGateway implements OnGatewayConnection,OnGatewayDisconnect{
 @WebSocketServer()server!:Server;private readonly socketsByUser=new Map<string,Set<string>>();
 constructor(private readonly jwt:JwtService,private readonly matches:MatchesAbstractService){}
 handleConnection(socket:AuthSocket){try{const raw=socket.handshake.auth?.token??socket.handshake.headers.authorization?.replace(/^Bearer /,'');const payload=this.jwt.verify<{sub:string;publicId:string}>(raw);socket.data.user={userId:payload.sub,publicId:payload.publicId};const ids=this.socketsByUser.get(payload.sub)??new Set();ids.add(socket.id);this.socketsByUser.set(payload.sub,ids);socket.join(`user:${payload.sub}`);this.server.emit('presence:changed',{userId:payload.sub,online:true});}catch{socket.disconnect(true);}}
 handleDisconnect(socket:AuthSocket){const userId=socket.data.user?.userId;if(!userId)return;const ids=this.socketsByUser.get(userId);ids?.delete(socket.id);if(!ids?.size){this.socketsByUser.delete(userId);this.server.emit('presence:changed',{userId,online:false});}}
 @SubscribeMessage('presence:check')presence(@MessageBody()ids:string[]){return Object.fromEntries(ids.map(id=>[id,this.socketsByUser.has(id)]));}
 @SubscribeMessage('match:subscribe')async subscribe(@ConnectedSocket()socket:AuthSocket,@MessageBody()body:{matchId:string}){const match=await this.matches.get(socket.data.user.userId,body.matchId);await socket.join(`match:${body.matchId}`);return match;}
 @SubscribeMessage('match:move')async move(@ConnectedSocket()socket:AuthSocket,@MessageBody()body:{matchId:string;from:string;to:string;promotion?:string}){const match=await this.matches.move(socket.data.user.userId,body.matchId,{from:body.from,to:body.to,promotion:body.promotion});this.server.to(`match:${body.matchId}`).emit('match:updated',match);return match;}
 @SubscribeMessage('invite:send')async invite(@ConnectedSocket()socket:AuthSocket,@MessageBody()body:{userId:string;matchId:string;code:string}){const match=await this.matches.get(socket.data.user.userId,body.matchId) as {code:string;status:string};if(match.status!=='waiting'||match.code!==body.code)return;this.server.to(`user:${body.userId}`).emit('invite:received',{from:socket.data.user,matchId:body.matchId,code:body.code});return {sent:this.socketsByUser.has(body.userId)};}
 @SubscribeMessage('invite:respond')inviteResponse(@ConnectedSocket()socket:AuthSocket,@MessageBody()body:{userId:string;matchId:string;accepted:boolean}){this.server.to(`user:${body.userId}`).emit('invite:responded',{from:socket.data.user,matchId:body.matchId,accepted:body.accepted});}
 @SubscribeMessage('voice:signal')async voiceSignal(@ConnectedSocket()socket:AuthSocket,@MessageBody()body:{userId:string;matchId:string;signal:unknown}){const match=await this.matches.get(socket.data.user.userId,body.matchId) as {white:string;black:string|null};if(![match.white,match.black].includes(body.userId)||body.userId===socket.data.user.userId)return;this.server.to(`user:${body.userId}`).emit('voice:signal',{fromUserId:socket.data.user.userId,matchId:body.matchId,signal:body.signal});}
 @SubscribeMessage('voice:state')voiceState(@ConnectedSocket()socket:AuthSocket,@MessageBody()body:{matchId:string;muted:boolean}){socket.to(`match:${body.matchId}`).emit('voice:state',{userId:socket.data.user.userId,muted:body.muted});}
}
