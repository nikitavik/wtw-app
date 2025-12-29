import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventBusService } from './event-bus.service';

describe('EventController', () => {
  let controller: EventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventBusService,
          useValue: {
            getUserEvents: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
