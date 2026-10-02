import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument,Types} from 'mongoose';
@Schema({versionKey:false})
export class Communication {
 @Prop({type:Types.ObjectId,required:true,index:true}) matchId!:Types.ObjectId;
 @Prop({required:true}) sender!:string;
 @Prop({type:String,default:null}) recipient!:string|null;
 @Prop({enum:['message','signal'],required:true}) kind!:string;
 @Prop({required:true}) content!:string;
 @Prop({required:true}) clientId!:string;
 @Prop({type:Date,default:Date.now}) createdAt!:Date;
 @Prop({type:Date,required:true}) expiresAt!:Date;
}
export type CommunicationDocument=HydratedDocument<Communication>;
export const CommunicationSchema=SchemaFactory.createForClass(Communication);
CommunicationSchema.index({expiresAt:1},{expireAfterSeconds:0});
CommunicationSchema.index({matchId:1,kind:1,createdAt:-1});
CommunicationSchema.index({matchId:1,sender:1,clientId:1},{unique:true});
