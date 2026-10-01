import { UserDocument } from '../schemas/user.schema';
export abstract class UsersAbstractService {
  abstract getById(id:string):Promise<UserDocument|null>;
  abstract getByPublicId(publicId:string):Promise<UserDocument|null>;
  abstract publicProfile(user:UserDocument):{id:string;publicId:string;name:string;email?:string};
}
