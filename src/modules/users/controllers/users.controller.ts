import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { UsersAbstractService } from '../services/users.abstract.service';
import { createResponse } from '../../../common/utils/create-response.util';
import { MESSAGE } from '../../../common/messages/messages.constant';
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
 constructor(private readonly users: UsersAbstractService) {}
 @Get(':id')
 async profile(@Param('id') id: string) {
  if(!/^[a-f0-9]{24}$/i.test(id))throw new NotFoundException(MESSAGE.FRIEND.USER_NOT_FOUND);
  const user=await this.users.getById(id);
  if(!user)throw new NotFoundException(MESSAGE.FRIEND.USER_NOT_FOUND);
  return createResponse(200,MESSAGE.AUTH.PROFILE,{id:String(user._id),name:user.name,publicId:user.publicId});
 }
}
