import { deleteEvent } from 'api/event';
import ModalCustom from 'components/Modal';
import { useMutation } from 'react-query';
import { IEvent } from '../../constants';

interface IProps {
  visible: boolean;
  onCancel: () => void;
  eventDetail?: IEvent;
  onReload: () => void;
}

const EventDelete = (props: IProps) => {
  const { visible, onCancel, eventDetail, onReload } = props;

  const { mutate: mutateDeleteEvent } = useMutation('deleteEvent', deleteEvent, {
    onSuccess: () => {
      onCancel();
      onReload();
    },
  });

  return (
    <ModalCustom
      visible={visible}
      cancelText="Cancel"
      okText="Confirm"
      onSubmit={() => mutateDeleteEvent(eventDetail?.id || 0)}
      onCancel={onCancel}
      title="Delete Event"
      titleCenter
      content="Are you sure you want to delete this event? This action cannot be undone."
    />
  );
};

export default EventDelete;
