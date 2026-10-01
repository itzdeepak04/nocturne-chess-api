import { Module } from '@nestjs/common';import { MatchesModule } from '../matches/matches.module';import { RealtimeGateway } from './realtime.gateway';
@Module({imports:[MatchesModule],providers:[RealtimeGateway]})export class RealtimeModule{}
