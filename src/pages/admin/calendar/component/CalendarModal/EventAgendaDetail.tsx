import { CalendarOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import moment from 'moment';
import { MouseEvent } from 'react';
import { IEvent } from '../../constants';

interface IProps {
  eventProps?: { event: IEvent; title: string };
  onOpenEdit?: (event?: IEvent) => void;
  onOpenDelete?: (event?: IEvent) => void;
  eventSearched?: IEvent;
  idEventFocused?: string;
  onChangeIdEventFocused: (id?: string) => void;
}

const EventAgendaDetail = (props: IProps) => {
  const {
    eventProps,
    onOpenEdit,
    onOpenDelete,
    eventSearched,
    idEventFocused,
    onChangeIdEventFocused,
  } = props;

  const handleClose = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    onChangeIdEventFocused('');
  };

  const handleOpenEditModal = (e: MouseEvent<HTMLElement>) => {
    handleClose(e);
    if (!onOpenEdit) return;
    onOpenEdit(eventProps?.event.resource || eventSearched);
  };

  const handleOpenDeleteModal = (e: MouseEvent<HTMLElement>) => {
    handleClose(e);
    if (!onOpenDelete) return;
    onOpenDelete(eventProps?.event.resource || eventSearched);
  };

  const renderEventDetail = () => (
    <div className="p-8 event-detail-wrapper text-left">
      <div className="flex justify-between items-center">
        <h3 className="text-main-button-color font-bold text-2xl font-fontFamily w-full text-truncate mb-0">
          {eventProps?.event?.title || eventSearched?.title}
        </h3>
        <DeleteOutlined
          className="text-main-button-color text-xl cursor-pointer"
          onClick={handleOpenDeleteModal}
        />
      </div>
      <div className="flex jutify-start mt-4 items-center">
        <CalendarOutlined className="text-[#6E6B68]" />
        <span className="ml-2 text-[#6E6B68] font-fontFamily">
          {moment(
            eventProps?.event?.resource?.startDateTime || eventSearched?.startDateTime,
          ).format('YYYY/MM/DD hh:mm a')}
        </span>
        <span className="ml-2 text-[#6E6B68] font-fontFamily">-</span>
        <span className="ml-2 text-[#6E6B68] font-fontFamily">
          {moment(eventProps?.event?.resource?.endDateTime || eventSearched?.startDateTime).format(
            'YYYY/MM/DD hh:mm a',
          )}
        </span>
      </div>
      <p
        className={`mt-4 text-[#6E6B68] font-fontFamily mb-0 ${
          eventProps?.event?.resource?.remark ? 'text-truncate-two' : ''
        }`}
      >
        {eventProps?.event?.resource?.remark || eventSearched?.remark}
      </p>
      <div className="flex mt-4">
        <Button
          className="mr-2 h-11 text-[#32302D] font-fontFamily rounded-xl hover:!border-main-button-color hover:!text-main-button-color font-semibold text-sm"
          onClick={handleClose}
        >
          Close
        </Button>
        <Button
          className="h-11 text-[#32302D] font-fontFamily rounded-xl !text-white !border-main-button-color !bg-main-button-color font-semibold text-sm"
          onClick={handleOpenEditModal}
        >
          Edit
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown
      overlay={renderEventDetail}
      placement="bottomRight"
      getPopupContainer={(trigger) => trigger.parentNode as HTMLElement}
      visible={
        idEventFocused ===
        `${eventProps?.event?.resource?.id}_${eventProps?.event?.resource?.eventIndex}`
      }
    >
      <div
        className="flex flex-col justify-center items-center"
        onClick={(e) => {
          e.stopPropagation();
          onChangeIdEventFocused(
            `${eventProps?.event?.resource?.id || eventSearched?.id}_${
              eventProps?.event?.resource?.eventIndex
            }`,
          );
        }}
      >
        <div
          className={`flex justify-start items-center w-full border-main-button-color rounded-lg border border-solid rbc-agenda-event-custom cursor-pointer ${
            idEventFocused ===
            `${eventProps?.event?.resource?.id}_${eventProps?.event?.resource?.eventIndex}`
              ? '!bg-main-button-color'
              : ''
          }`}
        >
          <p
            className={`mb-0 mr-3 font-fontFamily text-xs font-semibold ${
              idEventFocused ===
              `${eventProps?.event?.resource?.id}_${eventProps?.event?.resource?.eventIndex}`
                ? 'text-white'
                : 'text-[#32302D]'
            }`}
          >
            {eventProps?.title}
          </p>
          <p
            className={`mb-0 font-fontFamily text-xs font-semibold ${
              idEventFocused ===
              `${eventProps?.event?.resource?.id}_${eventProps?.event?.resource?.eventIndex}`
                ? 'text-white'
                : 'text-[#32302D]'
            }`}
          >
            {moment(eventProps?.event?.start).format('h:mm a')}-
            {moment(eventProps?.event?.end).format('h:mm a')}
          </p>
        </div>
      </div>
    </Dropdown>
  );
};

export default EventAgendaDetail;
