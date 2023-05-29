import { Form, Input } from 'antd';
import { createEvent, updateEvent } from 'api/event';
import ModalCustom from 'components/Modal';
import RangePickerCustom from 'components/RangePicker';
import { CLASS_NAME_FIELD } from 'constants/index';
import { isEmptyObject } from 'helper/function';
import moment, { Moment } from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { IEvent } from '../../constants';

interface IProps {
  visible: boolean;
  onCancel: () => void;
  eventDetail?: IEvent;
  onReload: () => void;
}

const EventModified = (props: IProps) => {
  const { visible, onCancel, eventDetail, onReload } = props;
  const [form] = Form.useForm();
  const [isKeepOpen, setIsKeepOpen] = useState(true);
  const [duration, setDuration] = useState<[Moment, Moment]>();
  const [loading, setLoading] = useState(false);
  const title = Form.useWatch('title', form);
  const remark = Form.useWatch('remark', form);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        title: !isEmptyObject(eventDetail) ? eventDetail?.title : '',
        remark: !isEmptyObject(eventDetail) ? eventDetail?.remark : '',
        duration: !isEmptyObject(eventDetail)
          ? [
              moment.utc(eventDetail?.startDateTime, 'YYYY/MM/DD hh:mm a').local(),
              moment.utc(eventDetail?.endDateTime, 'YYYY/MM/DD hh:mm a').local(),
            ]
          : undefined,
      });

      setDuration(
        !isEmptyObject(eventDetail)
          ? [
              moment.utc(eventDetail?.startDateTime, 'YYYY/MM/DD hh:mm a').local(),
              moment.utc(eventDetail?.endDateTime, 'YYYY/MM/DD hh:mm a').local(),
            ]
          : undefined,
      );
    }
  }, [eventDetail, visible]);

  const handleCancel = () => {
    onCancel();
    form.resetFields();
    setDuration(undefined);
    setIsKeepOpen(true);
    setLoading(false);
  };

  const { mutate: mutateCreateNewEvent } = useMutation('createEvent', createEvent, {
    onSuccess: () => {
      handleCancel();
      onReload();
    },
  });

  const { mutate: mutateUpdateEvent } = useMutation('updateEvent', updateEvent, {
    onSuccess: () => {
      handleCancel();
      onReload();
    },
  });

  const onFinish = useCallback(
    (formValues: { title: string; remark: string; duration: [Moment, Moment] }) => {
      if (!duration) {
        form.setFields([
          {
            name: 'duration',
            errors: ['Duration is required!'],
          },
        ]);

        return;
      }
      setLoading(true);
      if (!eventDetail) {
        mutateCreateNewEvent({
          title: title || formValues.title,
          remark: remark || formValues.remark,
          startDateTime: moment(duration?.[0], 'YYYY-MM-DD HH:mm A').toDate(),
          endDateTime: moment(duration?.[1], 'YYYY-MM-DD HH:mm A').toDate(),
        });
      } else {
        mutateUpdateEvent({
          ...eventDetail,
          title: title || formValues.title,
          remark: remark || formValues.remark,
          startDateTime: moment(duration?.[0], 'YYYY-MM-DD HH:mm A').toDate(),
          endDateTime: moment(duration?.[1], 'YYYY-MM-DD HH:mm A').toDate(),
        });
      }
    },
    [title, remark, duration],
  );

  const handleChangeDuration = (newDuration: [Moment, Moment]) => {
    setDuration(newDuration);
  };

  const onFinishFailed = ({ errorFields }: { errorFields: any }) => {
    if (!duration) {
      form.setFields([
        {
          name: 'duration',
          errors: ['Duration is required!'],
        },
      ]);
    }
  };

  return (
    <ModalCustom
      title={`${!eventDetail ? 'Create New Event' : 'Edit Event'}`}
      okText="Save"
      cancelText="Cancel"
      visible={visible}
      onCancel={handleCancel}
      onSubmit={form.submit}
      isKeepOpen={isKeepOpen}
      titleCenter
      contentLeft
      styleCancel={{ border: '1px solid #D1CDCB' }}
      className="modal-event-modified-custom"
      loading={loading}
    >
      <Form layout="vertical" form={form} onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item
          required
          name="title"
          rules={[
            { required: true, message: 'Title is required!' },
            { whitespace: true, message: 'Title is required!' },
          ]}
          label={eventDetail ? 'Edit Title :' : 'Add Title :'}
        >
          <Input maxLength={200} className={`${CLASS_NAME_FIELD} rounded-xl`} />
        </Form.Item>
        <Form.Item
          label="Duration"
          required
          name="duration"
          rules={[{ required: !!!duration, message: 'Duration is required' }]}
        >
          <RangePickerCustom
            form={form}
            placeholder={['Start date time', 'End date time']}
            dateFormat="YYYY/MM/DD hh:mm a"
            timeFormat="hh:mm A"
            duration={duration}
            onChangeDuration={handleChangeDuration}
            dropdownClassname="sm:top-[10%] sm:fixed"
          />
        </Form.Item>
        <Form.Item name="remark" label="Remark " required={false} className="mb-0">
          <Input maxLength={200} className={`${CLASS_NAME_FIELD} rounded-xl`} />
        </Form.Item>
      </Form>
    </ModalCustom>
  );
};

export default EventModified;
