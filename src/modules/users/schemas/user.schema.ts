import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
@Schema({ timestamps: true, versionKey: false })
export class User {
  _id!: Types.ObjectId;
  @Prop({ required: true, trim: true, maxlength: 60 }) name!: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true }) email!: string;
  @Prop({ required: true, select: false }) passwordHash!: string;
  @Prop({ required: true, unique: true, index: true }) publicId!: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] }) friends!: Types.ObjectId[];
}
export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
