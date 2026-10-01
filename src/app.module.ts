import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from './core/core.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { FriendsModule } from './modules/friends/friends.module';
import { MatchesModule } from './modules/matches/matches.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { AppController } from './app.controller';

@Module({ imports: [CoreModule, MongooseModule.forRootAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({ uri: config.getOrThrow<string>('MONGODB_URI') }) }), UsersModule, AuthModule, FriendsModule, MatchesModule, RealtimeModule], controllers: [AppController] })
export class AppModule {}
