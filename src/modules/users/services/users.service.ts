import { Injectable } from '@nestjs/common';
import { UsersAbstractDao } from '../dao/users.abstract.dao';
import { UserDocument } from '../schemas/user.schema';
import { UsersAbstractService } from './users.abstract.service';
@Injectable()
export class UsersService implements UsersAbstractService {
  constructor(private readonly usersDao:UsersAbstractDao){}
  getById(id:string){return this.usersDao.findById(id);}
  getByPublicId(publicId:string){return this.usersDao.findByPublicId(publicId);}
  publicProfile(user:UserDocument){return {id:user._id.toString(),publicId:user.publicId,name:user.name,email:user.email};}
}
