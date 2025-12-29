import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EventBusService } from './event-bus.service';
import { UserEvent } from './user-event.entity';

describe('EventBusService', () => {
  let service: EventBusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventBusService,
        {
          provide: getRepositoryToken(UserEvent),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventBusService>(EventBusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
