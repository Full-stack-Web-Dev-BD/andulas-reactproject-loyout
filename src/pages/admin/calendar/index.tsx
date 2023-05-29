import { Form, Layout, Row, Col } from 'antd';
import ButtonCustom from 'components/Button';
import CalendarList from './component/CalendarList';
import CalendarFilter from './component/CalendarFilter';
import EventModified from './component/CalendarModal/EventModified';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ICalendarListFilter, IEvent } from './constants';
import moment from 'moment';
import { Views } from 'react-big-calendar';
import { useMutation } from 'react-query';
import { getAllEvent } from 'api/event';
import EventDelete from './component/CalendarModal/EventDelete';
import { getDaysArray } from 'helper/function';

const CalendarTab = () => {
  const [visible, setVisible] = useState(false);
  const [visibleModalDelete, setVisibleModalDelete] = useState(false);
  const [form] = Form.useForm();
  const [eventDetail, setEventDetail] = useState<IEvent>();
  const timeout: any = useRef(null);
  const [eventSearch, setEventSearch] = useState<IEvent[]>([]);
  const [eventSearched, setEventSearched] = useState<IEvent>();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<IEvent[]>([]);
  const [dayEvents, setDayEvents] = useState<IEvent[]>([]);
  const [filter, setFilter] = useState<ICalendarListFilter>({
    date: moment(),
    amOrPm: 'AM',
    sort: Views.DAY,
  });
  const [idEventFocused, setIdEventFocused] = useState<{ day?: string; agenda?: string }>({
    day: '',
    agenda: '',
  });

  const handleOpenAdd = () => {
    setVisible(true);
    setIdEventFocused({ day: '', agenda: '' });
  };

  const handleOpenEdit = (event?: IEvent) => {
    setVisible(true);
    setEventDetail(event);
  };

  const handleOpenDelete = (event?: IEvent) => {
    setVisibleModalDelete(true);
    setEventDetail(event);
  };

  const dataEvents = (newEvents: IEvent[]) => {
    const result = [];
    for (const event of newEvents) {
      const startDateTime = new Date(event.startDateTime as string);
      const endDateTime = new Date(event.endDateTime as string);
      const dates = getDaysArray(
        new Date(startDateTime.toLocaleDateString()),
        new Date(endDateTime.toLocaleDateString()),
      );
      if (dates.length == 1) {
        result.push({
          start: startDateTime,
          end: endDateTime,
          title: event.title,
          resource: {
            ...event,
          },
        });
        continue;
      }

      for (const date of dates) {
        if (startDateTime.toLocaleDateString() == date.toLocaleDateString()) {
          result.push({
            start: moment(event.startDateTime).toDate(),
            end: moment(event.startDateTime).endOf('date').toDate(),
            title: event.title,
            resource: {
              ...event,
            },
          });
        } else if (endDateTime.toLocaleDateString() == date.toLocaleDateString()) {
          result.push({
            start: moment(event.endDateTime).startOf('date').toDate(),
            end: moment(event.endDateTime).toDate(),
            title: event.title,
            resource: {
              ...event,
            },
          });
        } else {
          result.push({
            start: moment(date).startOf('date').toDate(),
            end: moment(date).endOf('date').toDate(),
            title: event.title,
            resource: {
              ...event,
            },
          });
        }
      }
    }
    return result;
  };

  const { mutate: getListEvent } = useMutation('getListEvent', getAllEvent, {
    onSuccess: ({ data }: { data: IEvent[] }) => {
      setEvents(dataEvents(data));
      setAgendaEvents(dataEvents(data));

      if (filter?.id) {
        const date =
          moment(data[0].startDateTime).format('YYYY-MM-DD') ===
          moment(new Date()).format('YYYY-MM-DD')
            ? moment(data[0].startDateTime)
            : moment(data[0].startDateTime).startOf('day');

        //if want to display one event
        // setFilter((prev) => ({ sort: prev.sort, date, id: filter?.id }));
        setFilter((prev) => ({ sort: prev.sort, date, idSearched: filter?.id }));
        setEventSearched(data[0]);
      }
    },
  });

  const { mutate: searchListEvent } = useMutation('getListEvent', getAllEvent, {
    onSuccess: ({ data }: { data: IEvent[] }) => {
      const listEvent = data.map((event) => ({
        start: new Date(event.startDateTime || ''),
        end: new Date(event.endDateTime || ''),
        title: event.title,
        resource: {
          ...event,
        },
      }));

      setEventSearch(listEvent);
    },
  });

  useEffect(() => {
    if (filter?.search) {
      getListEvent({ search: filter.search });
    } else if (filter?.id) {
      if (filter?.sort === 'day') {
        const callApi =
          filter?.id?.toString() !==
          (filter?.sort === 'day'
            ? idEventFocused.day?.split('_')[0]
            : idEventFocused.agenda?.split('_')[0]);

        if (callApi) getListEvent({ id: filter?.id });
      } else if (filter?.sort === 'agenda') {
        const findEvent = agendaEvents.find((event) => event?.resource?.id === filter?.id);
        const date =
          moment(findEvent?.resource?.startDateTime).format('YYYY-MM-DD') ===
          moment(new Date()).format('YYYY-MM-DD')
            ? moment(findEvent?.resource?.startDateTime)
            : moment(findEvent?.resource?.startDateTime).startOf('day');

        setEventSearched(findEvent?.resource);
        setFilter({ sort: 'agenda', date, idSearched: filter?.id, id: filter?.id });
      }
    } else {
      getListEvent({ search: '', id: '' });
    }
  }, [filter?.search, filter?.id, filter?.sort]);

  useEffect(() => {
    if (filter?.date && filter?.sort === 'day') {
      const eventsFilter =
        events?.filter(
          (event: IEvent) =>
            moment(event?.start, 'YYYY-MM-DD').format('YYYY-MM-DD') ===
            moment(filter?.date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
        ) || [];

      setDayEvents(eventsFilter);
    }
  }, [filter?.date, filter?.sort, events]);

  const handleChangeFilter = (newFilter?: ICalendarListFilter) => {
    if (eventSearched?.id && newFilter?.sort && newFilter?.sort !== filter.sort) {
      setFilter((prev) => ({
        ...prev,
        ...newFilter,
        date: moment(eventSearched.startDateTime),
        time: moment(eventSearched.startDateTime),
      }));

      return;
    }

    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const handleReload = (type: 'modified' | 'delete') => {
    if (type === 'delete' && filter?.idSearched && filter?.idSearched === eventDetail?.id) {
      const newEventsSearch = eventSearch.filter((x) => x?.resource?.id !== filter?.idSearched);
      setEventSearch([...newEventsSearch]);
    }

    if (filter?.search) {
      getListEvent({ search: filter?.search, id: '' });
    } else if (filter?.id) {
      getListEvent({ search: '', id: filter?.id });
    } else {
      getListEvent({ search: '', id: '' });
    }
  };

  const handleCancelEventModified = () => {
    setEventDetail(undefined);
    setVisible(false);
  };

  const handleCancelEventDelete = () => {
    setEventDetail(undefined);
    setVisibleModalDelete(false);
  };

  const onFinish = (formValues: { search: string; id?: string }) => {
    if (formValues?.search) {
      setFilter((prev) => ({ ...prev, search: formValues.search, id: '' }));
    } else if (formValues?.id) {
      const needToSetFilter =
        formValues?.id?.toString() !==
        (filter?.sort === 'day'
          ? idEventFocused.day?.split('_')[0]
          : idEventFocused.agenda?.split('_')[0]);

      if (needToSetFilter) {
        setFilter((prev) => ({ ...prev, id: formValues.id, search: '' }));
      }
    } else {
      setFilter((prev) => ({
        sort: prev.sort,
        id: '',
        search: '',
        date: moment(),
        time: prev.sort === 'day' ? null : moment(),
      }));

      setEventSearched(undefined);
    }
  };

  const debounceSearch = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchListEvent({ search: value });
      }, 500);
    },
    [timeout],
  );

  const handleChangeSearch = useCallback(
    (value: string) => {
      debounceSearch(value);
    },
    [filter.search],
  );

  const handleReset = () => {
    setFilter((prev) => ({ ...prev, search: '', id: '', date: moment() }));
    searchListEvent({ search: '' });
    setEventSearched(undefined);
  };

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <Row className="flex justify-between items-center bg-transparent px-0 ">
        <Col>
          <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0 mr-2 custom-font-header">
            Admin Calendar
          </p>
        </Col>
        <Col className="">
          <ButtonCustom color="orange" onClick={handleOpenAdd}>
            Create new event
          </ButtonCustom>
        </Col>
      </Row>

      <CalendarFilter
        form={form}
        keyResult="title"
        onFinish={onFinish}
        searchResults={eventSearch}
        handleChangeSearch={handleChangeSearch}
        handleReset={handleReset}
      />

      <CalendarList
        onOpenEdit={handleOpenEdit}
        events={dayEvents}
        filter={filter}
        onChangeFilter={handleChangeFilter}
        onOpenDelete={handleOpenDelete}
        agendarEvents={agendaEvents}
        eventSearched={eventSearched}
        idEventFocused={idEventFocused}
        onChangeIdEventFocused={(value: { day?: string; agenda?: string }) =>
          setIdEventFocused((prev) => ({ ...prev, ...value }))
        }
      />

      <EventModified
        visible={visible}
        onCancel={handleCancelEventModified}
        eventDetail={eventDetail}
        onReload={() => handleReload('modified')}
      />

      <EventDelete
        visible={visibleModalDelete}
        onCancel={handleCancelEventDelete}
        eventDetail={eventDetail}
        onReload={() => handleReload('delete')}
      />
    </Layout>
  );
};

export default CalendarTab;
