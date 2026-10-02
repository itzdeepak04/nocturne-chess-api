import {Body,Controller,Get,Param,Post,UseGuards} from '@nestjs/common';
import {CurrentUser} from '../../../common/decorators/current-user.decorator';
import {JwtAuthGuard} from '../../../core/auth/jwt-auth.guard';
import {createResponse} from '../../../common/utils/create-response.util';
import {MESSAGE} from '../../../common/messages/messages.constant';
import {CommunicationAbstractService} from '../services/communication.abstract.service';
import {MessageDto,SignalDto} from '../dto/communication.dto';
@Controller('matches/:id/communication')
@UseGuards(JwtAuthGuard)
export class CommunicationController {
 constructor(private readonly service:CommunicationAbstractService){}
 @Get('messages') async messages(@CurrentUser() user:{userId:string},@Param('id') id:string){return createResponse(200,MESSAGE.COMMUNICATION.LOADED,await this.service.messages(user.userId,id));}
 @Post('messages') async send(@CurrentUser() user:{userId:string},@Param('id') id:string,@Body() dto:MessageDto){return createResponse(201,MESSAGE.COMMUNICATION.SENT,await this.service.sendMessage(user.userId,id,dto));}
 @Get('signals') async signals(@CurrentUser() user:{userId:string},@Param('id') id:string){return createResponse(200,MESSAGE.COMMUNICATION.LOADED,await this.service.signals(user.userId,id));}
 @Post('signals') async signal(@CurrentUser() user:{userId:string},@Param('id') id:string,@Body() dto:SignalDto){return createResponse(201,MESSAGE.COMMUNICATION.SENT,await this.service.sendSignal(user.userId,id,dto));}
 @Get('config') async config(@CurrentUser() user:{userId:string},@Param('id') id:string){return createResponse(200,MESSAGE.COMMUNICATION.LOADED,await this.service.config(user.userId,id));}
}
