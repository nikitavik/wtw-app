import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { PROFILE_QUEUE_NAME } from './profile-queue.constants';
import type { ProfileAggregationJobPayload } from './profile-queue.types';

@Processor(PROFILE_QUEUE_NAME)
export class ProfileProcessor extends WorkerHost {
  private readonly logger = new Logger(ProfileProcessor.name);

  async process(job: Job<ProfileAggregationJobPayload>): Promise<void> {
    const { userId } = job.data;

    this.logger.log(`Processing profile aggregation for user: ${userId}`);

    // TODO: Implement profile aggregation logic
    // 1. Read user_events from database
    // 2. Read user_item_reactions from database
    // 3. Aggregate user_profile
    // 4. Save user_profile to database

    this.logger.log(`Profile aggregation completed for user: ${userId}`);
  }
}
