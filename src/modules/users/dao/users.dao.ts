import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersAbstractDao } from './users.abstract.dao';
import { User, UserDocument } from '../schemas/user.schema';
@Injectable()
export class UsersDao implements UsersAbstractDao {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}
  create(input: Pick<UserDocument,'name'|'email'|'passwordHash'|'publicId'>) { return this.model.create(input); }
  findByEmail(email: string, withPassword=false) { const query=this.model.findOne({email:email.toLowerCase()});if(withPassword)query.select('+passwordHash');return query.exec(); }
  findById(id: string) { return this.model.findById(id).exec(); }
  findByPublicId(publicId: string) { return this.model.findOne({publicId:publicId.toUpperCase()}).exec(); }
  async addFriend(userId: string, friendId: string) { await this.model.updateOne({_id:userId},{$addToSet:{friends:friendId}}).exec(); }
  listFriends(userId: string) { return this.model.find({friends:userId}).select('name publicId').exec(); }
}
