import { UserDocument } from '../schemas/user.schema';
export abstract class UsersAbstractDao {
  abstract create(input: Pick<UserDocument, 'name'|'email'|'passwordHash'|'publicId'>): Promise<UserDocument>;
  abstract findByEmail(email: string, withPassword?: boolean): Promise<UserDocument|null>;
  abstract findById(id: string): Promise<UserDocument|null>;
  abstract findByPublicId(publicId: string): Promise<UserDocument|null>;
  abstract addFriend(userId: string, friendId: string): Promise<void>;
  abstract listFriends(userId: string): Promise<UserDocument[]>;
}
