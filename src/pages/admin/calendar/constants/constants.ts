import { Views } from 'react-big-calendar';

export const CALENDAR_SORT = [
  {
    value: Views.DAY,
    label: 'Sort by: Day',
    title: 'Day',
    disabled: false,
  },
  {
    value: Views.WEEK,
    label: 'Sort by: Week',
    title: 'Week',
    disabled: true,
  },
  {
    value: Views.MONTH,
    label: 'Sort by: Month',
    title: 'Month',
    disabled: true,
  },
  {
    value: '',
    label: 'Sort by: Year',
    title: 'Year',
    disabled: true,
  },
  {
    value: Views.AGENDA,
    label: 'Sort by: Schedule',
    title: 'Schedule',
    disabled: false,
  },
];
