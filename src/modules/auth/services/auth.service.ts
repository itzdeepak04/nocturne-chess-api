import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { MESSAGE } from '../../../common/messages/messages.constant';
import { UsersAbstractDao } from '../../users/dao/users.abstract.dao';
import { LoginDto } from '../dto/login.dto';import { RegisterDto } from '../dto/register.dto';import { AuthAbstractService } from './auth.abstract.service';
@Injectable()
export class AuthService implements AuthAbstractService {
 constructor(private readonly usersDao:UsersAbstractDao,private readonly jwt:JwtService){}
 private result(user:{_id:unknown;name:string;email:string;publicId:string}){const payload={sub:String(user._id),publicId:user.publicId};return {accessToken:this.jwt.sign(payload),user:{id:String(user._id),name:user.name,email:user.email,publicId:user.publicId}};}
 async register(dto:RegisterDto){if(dto.password!==dto.confirmPassword)throw new BadRequestException(MESSAGE.AUTH.PASSWORD_MISMATCH);if(await this.usersDao.findByEmail(dto.email))throw new ConflictException(MESSAGE.AUTH.EMAIL_EXISTS);let publicId='';do{publicId=`NC-${randomBytes(3).toString('hex').toUpperCase()}`;}while(await this.usersDao.findByPublicId(publicId));const user=await this.usersDao.create({name:dto.name.trim(),email:dto.email.toLowerCase(),passwordHash:await bcrypt.hash(dto.password,12),publicId} as never);return this.result(user);}
 async login(dto:LoginDto){const user=await this.usersDao.findByEmail(dto.email,true);if(!user||!await bcrypt.compare(dto.password,user.passwordHash))throw new UnauthorizedException(MESSAGE.AUTH.INVALID_CREDENTIALS);return this.result(user);}
}
