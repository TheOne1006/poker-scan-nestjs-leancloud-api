import { Exclude } from 'class-transformer';

export class ChatQueryWhereDto {
  status?: string;
  userId?: string;
  subject?: string;

  @Exclude()
  _end?: string;

  @Exclude()
  _sort?: string;

  @Exclude()
  _order?: string;

  @Exclude()
  _start?: string;
}

export class ChatMessageQueryWhereDto {
  chatId?: string;
  sender?: string;
  messageType?: string;

  @Exclude()
  _end?: string;

  @Exclude()
  _sort?: string;

  @Exclude()
  _order?: string;

  @Exclude()
  _start?: string;
}