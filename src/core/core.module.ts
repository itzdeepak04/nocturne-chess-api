import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { APP_FILTER } from '@nestjs/core';
import { ApiExceptionFilter } from '../common/filters/api-exception.filter';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('JWT_SECRET'), signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '15m') as never } }) }),
  ],
  providers: [JwtAuthGuard,{provide:APP_FILTER,useClass:ApiExceptionFilter}],
  exports: [ConfigModule, JwtModule, JwtAuthGuard],
})
export class CoreModule {}
