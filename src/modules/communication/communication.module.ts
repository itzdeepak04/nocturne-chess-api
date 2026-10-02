import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {MatchesModule} from '../matches/matches.module';
import {Communication,CommunicationSchema} from './schemas/communication.schema';
import {CommunicationDao} from './dao/communication.dao';
import {CommunicationAbstractDao} from './dao/communication.abstract.dao';
import {CommunicationService} from './services/communication.service';
import {CommunicationAbstractService} from './services/communication.abstract.service';
import {CommunicationController} from './controllers/communication.controller';
@Module({imports:[MatchesModule,MongooseModule.forFeature([{name:Communication.name,schema:CommunicationSchema}])],controllers:[CommunicationController],providers:[{provide:CommunicationAbstractDao,useClass:CommunicationDao},{provide:CommunicationAbstractService,useClass:CommunicationService}]})
export class CommunicationModule {}
