import {MessageDto,SignalDto} from '../dto/communication.dto';
import {Entry} from '../dao/communication.abstract.dao';
export abstract class CommunicationAbstractService {
 abstract messages(userId:string,matchId:string):Promise<Entry[]>;
 abstract sendMessage(userId:string,matchId:string,dto:MessageDto):Promise<Entry>;
 abstract signals(userId:string,matchId:string):Promise<Entry[]>;
 abstract sendSignal(userId:string,matchId:string,dto:SignalDto):Promise<Entry>;
 abstract config(userId:string,matchId:string):Promise<object>;
}
