import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PROFILE_QUEUE_NAME } from './profile-queue.constants';
import { ProfileQueue } from './profile.queue';
import { ProfileProcessor } from './profile.processor';
import { ProfileModule } from '../../profile/profile.module';

/**
 * Infrastructure Module: Profile Queue
 * Depends on ProfileModule (application layer).
 * No circular dependencies - infrastructure depends on application.
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: PROFILE_QUEUE_NAME,
    }),
    ProfileModule,
  ],
  providers: [ProfileQueue, ProfileProcessor],
  exports: [ProfileQueue],
})
export class ProfileQueueModule {}
