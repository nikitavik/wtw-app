import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ProfileQueueModule } from './profile';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);

        return {
          connection: {
            host: redisHost,
            port: redisPort,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    ProfileQueueModule,
  ],
  exports: [ProfileQueueModule],
})
export class QueuesModule {}
