import { EventType } from './event-type.enum';
import { EventSource } from './event-source.enum';

export class UserEventDto {
  user_id: string;
  item_id: number;
  event_type: EventType;
  event_value: number | null;
  source: EventSource;
}
