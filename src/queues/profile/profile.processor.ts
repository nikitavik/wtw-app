import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { PROFILE_QUEUE_NAME } from './profile-queue.constants';
import type { ProfileAggregationJobPayload } from './profile-queue.types';
import { ProfileAggregationService } from '../../profile/profile-aggregation.service';

@Processor(PROFILE_QUEUE_NAME)
export class ProfileProcessor extends WorkerHost {
  private readonly logger = new Logger(ProfileProcessor.name);

  constructor(
    private readonly profileAggregationService: ProfileAggregationService,
  ) {
    super();
  }

  async process(job: Job<ProfileAggregationJobPayload>): Promise<void> {
    const { userId } = job.data;

    this.logger.log(`Processing profile aggregation for user: ${userId}`);

    await this.profileAggregationService.aggregateProfile(userId);

    this.logger.log(`Profile aggregation completed for user: ${userId}`);
  }
}
