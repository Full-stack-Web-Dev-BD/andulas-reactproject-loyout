import { Form, FormInstance } from 'antd';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import UploadFile from 'components/UploadFile';
import { useCallback, useEffect } from 'react';
import { ICardItem } from '..';

interface IProps {
  visible: boolean;
  onCancel: () => void;
  onEdit: ({
    params,
    id,
  }: {
    params: { topicName: string; thumbnailPath: string };
    id: number;
  }) => void;
  onSubmit: (values: { topicName: string; thumbnailPath: string }) => void;
  isKeepOpen: boolean;
  form: FormInstance<any>;
  topic?: ICardItem;
}

const ModalCreateNewTopic = (props: IProps) => {
  const { visible, onCancel, onSubmit, isKeepOpen, form, topic, onEdit } = props;

  const handleSubmit = useCallback(
    (values: { topicName: string; thumbnailPath: string }) => {
      if (topic && onEdit instanceof Function) {
        onEdit({ params: values, id: topic?.id });
        return;
      }
      onSubmit(values);
    },
    [topic],
  );

  const getFilePath = (file: { filePath: string }) => {
    form.setFieldsValue({ thumbnailPath: file?.filePath });
  };

  useEffect(() => {
    if (topic) {
      form.setFieldsValue({ thumbnailPath: topic?.thumbnailPath, topicName: topic?.title });
    }
  }, [topic]);

  return (
    <ModalCustom
      onCancel={onCancel}
      onSubmit={form.submit}
      visible={visible}
      title={topic ? 'Edit Topic' : 'Create New Topic'}
      cancelText="Cancel"
      okText={topic ? 'Confirm' : 'Create'}
      isKeepOpen={isKeepOpen}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          label="Topic Name"
          rules={[{ required: true, message: 'Topic Name is required!' }]}
          name="topicName"
        >
          <CustomInput />
        </Form.Item>
        <Form.Item
          label="Upload thumbnail"
          name="thumbnailPath"
        >
          <UploadFile
            sizeWidth={250}
            sizeHeight={160}
            defaultFileList={
              topic?.thumbnailPath ? [{ uid: '1', name: topic?.thumbnailPath as string }] : []
            }
            getFilePath={getFilePath}
          />
        </Form.Item>
      </Form>
    </ModalCustom>
  );
};

export default ModalCreateNewTopic;
