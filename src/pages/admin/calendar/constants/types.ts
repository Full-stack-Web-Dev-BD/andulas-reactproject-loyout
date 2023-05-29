import { View } from 'react-big-calendar';

export interface ICalendarListFilter {
  amOrPm?: 'AM' | 'PM';
  sort?: View;
  search?: string;

  [key: string]: any;
}

export interface IEvent {
  id?: number;
  title?: string;
  userId?: string;
  startDateTime?: Date | string;
  endDateTime?: Date | string;
  endTime?: Date | string;
  startTime?: Date | string;
  remark?: string;
  start?: Date;
  end?: Date;

  resource?: any;
}
