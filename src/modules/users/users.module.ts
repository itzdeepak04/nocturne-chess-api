import { UsersController } from './controllers/users.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersAbstractDao } from './dao/users.abstract.dao';
import { UsersDao } from './dao/users.dao';
import { UsersAbstractService } from './services/users.abstract.service';
import { UsersService } from './services/users.service';
@Module({controllers:[UsersController],imports:[MongooseModule.forFeature([{name:User.name,schema:UserSchema}])],providers:[{provide:UsersAbstractDao,useClass:UsersDao},{provide:UsersAbstractService,useClass:UsersService}],exports:[UsersAbstractDao,UsersAbstractService]})
export class UsersModule{}
