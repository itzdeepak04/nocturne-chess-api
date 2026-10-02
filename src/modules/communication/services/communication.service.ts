import {BadRequestException,ConflictException,Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {createHmac} from 'crypto';
import {MatchesAbstractService} from '../../matches/services/matches.abstract.service';
import {CommunicationAbstractDao} from '../dao/communication.abstract.dao';
import {CommunicationAbstractService} from './communication.abstract.service';
import {MessageDto,SignalDto} from '../dto/communication.dto';
import {MESSAGE} from '../../../common/messages/messages.constant';
@Injectable()
export class CommunicationService implements CommunicationAbstractService {
 constructor(private readonly matches:MatchesAbstractService,private readonly dao:CommunicationAbstractDao,private readonly settings:ConfigService){}
 private async match(userId:string,id:string,active=false){
  const match=await this.matches.get(userId,id) as {white:string;black:string|null;status:string};
  if(active&&match.status!=='active')throw new ConflictException(MESSAGE.COMMUNICATION.CLOSED);
  return match;
 }
 async messages(userId:string,id:string){await this.match(userId,id);return this.dao.list(id,'message');}
 async sendMessage(userId:string,id:string,dto:MessageDto){
  await this.match(userId,id,true);
  const text=dto.text.trim();
  if(!text)throw new BadRequestException(MESSAGE.COMMUNICATION.EMPTY);
  return this.dao.append({matchId:id,sender:userId,recipient:null,kind:'message',content:text,clientId:dto.clientId,expiresAt:new Date(Date.now()+86400000)});
 }
 async signals(userId:string,id:string){await this.match(userId,id,true);return this.dao.list(id,'signal',userId);}
 async sendSignal(userId:string,id:string,dto:SignalDto){
  const match=await this.match(userId,id,true);
  let payload:any;try{payload=JSON.parse(dto.payload);}catch{throw new BadRequestException(MESSAGE.COMMUNICATION.INVALID);}
  if(!payload||!['ready','description','candidate'].includes(payload.kind)||typeof payload.session!=='string'||payload.session.length>100)throw new BadRequestException(MESSAGE.COMMUNICATION.INVALID);
  if(payload.kind==='description'&&(!['offer','answer'].includes(payload.description?.type)||typeof payload.description?.sdp!=='string'))throw new BadRequestException(MESSAGE.COMMUNICATION.INVALID);
  if(payload.kind==='candidate'&&typeof payload.candidate?.candidate!=='string')throw new BadRequestException(MESSAGE.COMMUNICATION.INVALID);
  return this.dao.append({matchId:id,sender:userId,recipient:match.white===userId?match.black:match.white,kind:'signal',content:dto.payload,clientId:dto.clientId,expiresAt:new Date(Date.now()+120000)});
 }
 async config(userId:string,id:string){
  await this.match(userId,id,true);
  const iceServers:object[]=[{urls:['stun:stun.l.google.com:19302']}];
  const urls=this.settings.get<string>('TURN_URLS')?.split(',').map(v=>v.trim()).filter(Boolean);
  const secret=this.settings.get<string>('TURN_SECRET');
  const turnUsername=this.settings.get<string>('TURN_USERNAME');
  const turnPassword=this.settings.get<string>('TURN_PASSWORD');
  // Managed providers supply a username/password, not a Coturn shared secret.
  // Prefer a complete managed credential pair when both modes are configured.
  if(urls?.length&&turnUsername&&turnPassword){
   iceServers.push({urls,username:turnUsername,credential:turnPassword});
  }else if(urls?.length&&secret){
   const username=`${Math.floor(Date.now()/1000)+3600}:${userId}`;
   iceServers.push({urls,username,credential:createHmac('sha1',secret).update(username).digest('base64')});
  }
  return {iceServers,relayAvailable:iceServers.length>1};
 }
}
