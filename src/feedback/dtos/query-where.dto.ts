import { Exclude } from 'class-transformer';

export class FeedbackQueryWhereDto {
  type?: string;
  status?: string;
  userEmail?: string;

  @Exclude()
  _end?: string;

  @Exclude()
  _sort?: string;

  @Exclude()
  _order?: string;

  @Exclude()
  _start?: string;
}