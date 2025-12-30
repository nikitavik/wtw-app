import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PROFILE_QUEUE_NAME } from './profile-queue.constants';
import { ProfileQueue } from './profile.queue';
import { ProfileProcessor } from './profile.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: PROFILE_QUEUE_NAME,
    }),
  ],
  providers: [ProfileQueue, ProfileProcessor],
  exports: [ProfileQueue],
})
export class ProfileQueueModule {}
