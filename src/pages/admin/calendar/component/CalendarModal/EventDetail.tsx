import { CalendarOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import moment from 'moment';
import { CSSProperties, MouseEvent } from 'react';
import { EventWrapperProps } from 'react-big-calendar';
import { IEvent } from '../../constants';

interface IProps {
  eventWrapper?: EventWrapperProps<IEvent>;
  onOpenEdit?: (event?: IEvent) => void;
  onOpenDelete?: (event?: IEvent) => void;
  eventSearched?: IEvent;
  idEventFocused?: string;
  onChangeIdEventFocused: (id?: number | string) => void;
}

const EventDetail = (props: IProps) => {
  const {
    eventWrapper,
    onOpenEdit,
    onOpenDelete,
    eventSearched,
    idEventFocused,
    onChangeIdEventFocused,
  } = props;

  const roleName = eventWrapper?.event?.resource.roleName;

  const styledDiv: CSSProperties = {
    height: `${eventWrapper?.style?.height}%`,
    top: `${eventWrapper?.style?.top}%`,
    width: `${eventWrapper?.style?.width}%`,
    minHeight: 20,
    backgroundColor:
      roleName === 'Teacher' ? '#EB5757' : roleName === 'Student' ? '#F1A240' : '#007A7B',
    overflow: 'hidden',
    maxHeight: '100%',
    boxSizing: 'border-box',
    left: `${eventWrapper?.style?.xOffset}%`,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: (eventWrapper?.style?.xOffset as number) > 0 ? '#ffffff' : '#007A7B',
  };

  const handleClose = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    onChangeIdEventFocused('');
  };

  const handleOpenEditModal = (e: MouseEvent<HTMLElement>) => {
    handleClose(e);
    if (!onOpenEdit) return;
    onOpenEdit(eventWrapper?.event?.resource || eventSearched);
  };

  const handleOpenDeleteModal = (e: MouseEvent<HTMLElement>) => {
    handleClose(e);
    if (!onOpenDelete) return;
    onOpenDelete(eventWrapper?.event?.resource || eventSearched);
  };

  const renderEventDetail = () => (
    <div className="p-8 event-detail-wrapper text-left">
      <div className="flex justify-between items-center">
        <h3 className="text-main-button-color font-bold text-2xl font-fontFamily w-full text-truncate mb-0">
          {eventWrapper?.event?.title || eventSearched?.title}
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
            eventWrapper?.event?.resource?.startDateTime || eventSearched?.startDateTime,
          ).format('YYYY/MM/DD hh:mm a')}
        </span>
        <span className="ml-2 text-[#6E6B68] font-fontFamily">-</span>
        <span className="ml-2 text-[#6E6B68] font-fontFamily">
          {moment(eventWrapper?.event?.resource?.endDateTime || eventSearched?.endDateTime).format(
            'YYYY/MM/DD hh:mm a',
          )}
        </span>
      </div>
      <p
        className={`mt-4 text-[#6E6B68] font-fontFamily mb-0 ${
          eventWrapper?.event?.resource?.remark || eventSearched?.remark ? 'text-truncate-two' : ''
        }`}
      >
        {eventWrapper?.event?.resource?.remark || eventSearched?.remark}
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
        `${eventWrapper?.event?.resource?.id || eventSearched?.id}_${moment(
          eventWrapper?.event?.start,
        ).format('YYYY-MM-DD')}`
      }
      overlayClassName={
        idEventFocused ===
          `${eventWrapper?.event?.resource?.id || eventSearched?.id}_${moment(
            eventWrapper?.event?.start,
          ).format('YYYY-MM-DD')}` && moment(eventWrapper?.event?.end).format('HH:mm') > '22:00'
          ? 'custom-dropdown-event-detail'
          : ''
      }
    >
      <div
        className="flex flex-col justify-center items-center absolute rounded-lg rbc-event-custom text-white cursor-pointer"
        style={styledDiv}
        onClick={(e) => {
          e.stopPropagation();
          onChangeIdEventFocused(
            `${eventWrapper?.event?.resource?.id || eventSearched?.id}_${moment(
              eventWrapper?.event?.start,
            ).format('YYYY-MM-DD')}`,
          );
        }}
      >
        <p className="mb-1 text-xs font-semibold text-truncate">
          {eventWrapper?.event.title}
          {eventWrapper?.style?.height && eventWrapper?.style?.height > 5 ? ',' : ''}
        </p>
        {eventWrapper?.style?.height && eventWrapper?.style?.height > 5 ? (
          <p className="mb-0 text-xs font-semibold">
            {moment(eventWrapper?.event?.start).format('h:mm a')}-
            {moment(eventWrapper?.event?.end).format('h:mm a')}
          </p>
        ) : (
          ''
        )}
      </div>
    </Dropdown>
  );
};

export default EventDetail;
