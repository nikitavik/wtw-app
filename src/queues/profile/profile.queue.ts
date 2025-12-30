import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { PROFILE_QUEUE_NAME } from './profile-queue.constants';
import type { ProfileAggregationJobPayload } from './profile-queue.types';

@Injectable()
export class ProfileQueue {
  constructor(
    @InjectQueue(PROFILE_QUEUE_NAME)
    private readonly queue: Queue<ProfileAggregationJobPayload>,
  ) {}

  async enqueueProfileAggregation(userId: string): Promise<void> {
    await this.queue.add(
      'aggregate-profile',
      { userId },
      {
        jobId: userId,
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }
}
