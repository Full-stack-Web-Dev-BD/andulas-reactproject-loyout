import { Form } from 'antd';
import moment from 'moment';
import { useEffect, useMemo } from 'react';
import { Calendar, EventWrapperProps, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ICalendarListFilter, IEvent } from '../../constants';
import EventAgendaDetail from '../CalendarModal/EventAgendaDetail';
import EventDetail from '../CalendarModal/EventDetail';
import '../style.css';
import CalendarListFilter from './CalendarListFilter';

interface IProps {
  onOpenEdit?: (event?: IEvent) => void;
  onOpenDelete?: (event?: IEvent) => void;
  filter?: ICalendarListFilter;
  events?: IEvent[];
  onChangeFilter?: (newFilter?: ICalendarListFilter) => void;
  agendarEvents?: IEvent[];
  eventSearched?: IEvent;
  idEventFocused: { day?: string; agenda?: string };
  onChangeIdEventFocused: (value: { day?: string; agenda?: string }) => void;
}

const dateFormat = 'YYYY/MM/DD';

const CalendarList = (props: IProps) => {
  const {
    onOpenEdit,
    filter,
    events,
    onChangeFilter,
    onOpenDelete,
    agendarEvents,
    eventSearched,
    idEventFocused,
    onChangeIdEventFocused,
  } = props;
  const [form] = Form.useForm();
  const localizer = momentLocalizer(moment);
  const dateFilter = moment(filter?.date, dateFormat).format(dateFormat);

  const eventFilter = useMemo(() => {
    const time = moment(filter?.date || new Date()).format('YYYY/MM/DD HH:mm');
    const end = moment(filter?.date).add(90, 'days').endOf('date').format('YYYY/MM/DD HH:mm');

    return agendarEvents
      ?.filter((x) => {
        const startDateTime = moment(x?.resource?.startDateTime).format('YYYY/MM/DD HH:mm');
        const endDateTime = moment(x?.resource?.endDateTime).format('YYYY/MM/DD HH:mm');

        return (
          (startDateTime <= end && startDateTime >= time) ||
          (startDateTime <= time && endDateTime >= time)
        );
      })
      .map((event, index) => ({ ...event, resource: { ...event.resource, eventIndex: index } }));
  }, [filter?.date, agendarEvents]);

  useEffect(() => {
    if (eventSearched?.id) {
      if (filter?.sort === 'day') {
        onChangeIdEventFocused({
          day: `${eventSearched?.id}_${moment(eventSearched?.startDateTime).format('YYYY-MM-DD')}`,
        });
      } else if (filter?.sort === 'agenda') {
        const findIndex =
          eventFilter?.findIndex((event) => event?.resource?.id === eventSearched?.id) || 0;

        onChangeIdEventFocused({
          agenda: `${eventSearched?.id}_${eventFilter?.[findIndex]?.resource?.eventIndex}`,
        });
      }
    } else {
      onChangeIdEventFocused({ day: '', agenda: '' });
    }
  }, [eventSearched, eventFilter, filter?.sort]);

  const { formats, view } = useMemo(
    () => ({
      defaultDate: moment().toDate(),
      formats: {
        timeGutterFormat: (date: Date, culture?: string) => localizer.format(date, 'hh A', culture),
      },
      view: filter?.sort || Views.DAY,
    }),
    [filter],
  );

  const handleChangeFilter = (newFilter?: ICalendarListFilter) => {
    if (onChangeFilter) onChangeFilter(newFilter);
  };

  const renderAgendaDate = (dateProps: { day: string; label: string }) => {
    const dateEvents = moment(dateProps?.day, dateFormat).format(dateFormat);

    return (
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center justify-start w-full">
          <p
            className={`mb-0 font-fontFamily text-xs rbc-agenda-day-custom font-semibold  mr-2 ${
              dateFilter === dateEvents
                ? 'text-white !bg-main-button-color border-main-button-color rounded-lg'
                : 'text-[#6E6B68]'
            }`}
          >
            {moment(dateProps?.day, dateFormat).format('DD')}
          </p>
          <p
            className={`fontFamily mb-0 text-xs  font-semibold ${
              dateFilter === dateEvents ? '!text-main-button-color' : 'text-[#6E6B68]'
            }`}
          >
            {moment(dateProps.day, dateFormat).format('MMM, ddd')}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" onClick={() => onChangeIdEventFocused({ day: '', agenda: '' })}>
      <CalendarListFilter form={form} filter={filter} onChangeFilter={handleChangeFilter} />
      <Calendar
        localizer={localizer}
        length={90}
        view={view}
        formats={formats}
        toolbar={false}
        date={filter?.date.toDate()}
        events={filter?.sort === Views.DAY ? events : eventFilter}
        scrollToTime={Views.DAY ? filter?.date.toDate() : undefined}
        className="mt-8 rbc-custom-view"
        components={{
          eventWrapper: (eventWrapper: EventWrapperProps<IEvent>) => (
            <EventDetail
              eventWrapper={eventWrapper}
              onOpenEdit={onOpenEdit}
              onOpenDelete={onOpenDelete}
              eventSearched={eventSearched}
              idEventFocused={idEventFocused.day}
              onChangeIdEventFocused={(id?: number | string) => {
                onChangeIdEventFocused({ day: `${id}`, agenda: '' });
              }}
            />
          ),
          agenda: {
            date: (dateProps) => renderAgendaDate(dateProps as { day: string; label: string }),
            event: (eventProps) => (
              <EventAgendaDetail
                eventProps={eventProps}
                onOpenDelete={onOpenDelete}
                onOpenEdit={onOpenEdit}
                eventSearched={eventSearched}
                idEventFocused={idEventFocused.agenda}
                onChangeIdEventFocused={(id?: string) => {
                  onChangeIdEventFocused({ agenda: id, day: '' });
                }}
              />
            ),
          },
        }}
      />
    </div>
  );
};

export default CalendarList;
