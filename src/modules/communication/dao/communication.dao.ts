import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Communication,CommunicationDocument} from '../schemas/communication.schema';
import {CommunicationAbstractDao,NewEntry,Entry} from './communication.abstract.dao';
@Injectable()
export class CommunicationDao implements CommunicationAbstractDao {
 constructor(@InjectModel(Communication.name) private readonly model:Model<CommunicationDocument>){}
 private view(doc:CommunicationDocument):Entry{return {id:String(doc._id),sender:doc.sender,content:doc.content,clientId:doc.clientId,createdAt:doc.createdAt.toISOString()};}
 async append(entry:NewEntry){
  const filter={matchId:entry.matchId,sender:entry.sender,clientId:entry.clientId};
  const doc=await this.model.findOneAndUpdate(filter,{$setOnInsert:entry},{upsert:true,new:true,setDefaultsOnInsert:true}).exec();
  return this.view(doc!);
 }
 async list(matchId:string,kind:'message'|'signal',recipient?:string){
  const docs=await this.model.find({matchId,kind,...(recipient?{recipient}:{}),expiresAt:{$gt:new Date()}}).sort({createdAt:-1,_id:-1}).limit(100).exec();
  return docs.reverse().map(doc=>this.view(doc));
 }
}
