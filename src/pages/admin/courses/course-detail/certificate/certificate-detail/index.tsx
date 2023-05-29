import { Form, Select } from 'antd';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import UploadFile from 'components/UploadFile';
import { IFieldListForm } from 'constants/index';
import { useCallback, useState } from 'react';

const initialFields = [
  {
    label: 'Certificate Type',
    name: 'certificateType',
    type: 'select',
    options: [
      { label: 'Full Attandance', value: 'Full Attandance' },
      { label: 'After Exam', value: 'After Exam' },
      { label: 'Passed exam', value: 'Passed exam' },
    ],
    rules: [{ required: true, message: 'Certificate Type is required!' }],
  },
  {
    label: 'Certificate Template',
    name: 'certificateTemplate',
    type: 'select',
    options: [{ label: 'Certificate Template', value: 'Certificate Template' }],
    rules: [{ required: true, message: 'Certificate Template is required!' }],
  },
  {
    label: 'Upload Thumbnail',
    name: 'certificateTemplateThumbnail',
    type: 'upload',
    rules: [{ required: true, message: 'Thumbnail is required!' }],
  },
  {
    label: 'Principle Name',
    name: 'principleName',
    type: 'string',
    rules: [{ required: true, message: 'Principle Name is required!' }],
  },
  {
    label: 'Upload Signature',
    name: 'certificateTemplateThumbnail',
    type: 'upload',
    rules: [{ required: true, message: 'Signature is required!' }],
  },
];

interface IProps {
  closeAddNew: () => void;
}

const CertificateDetail = (props: IProps) => {
  const { closeAddNew } = props;
  const [form] = Form.useForm();
  const [fieldList] = useState<Array<IFieldListForm>>(initialFields);

  const renderField = useCallback((field: IFieldListForm) => {
    switch (field.type) {
      case 'string':
        return <CustomInput type={field.type} />;
      case 'select':
        return <Select options={field.options} />;
      case 'upload':
        return <UploadFile />;
      default:
        return <CustomInput type={field.type} />;
    }
  }, []);

  const handleSubmit = useCallback(() => {}, []);

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit}>
      {fieldList.map((field, index) => (
        <Form.Item label={field.label} rules={field.rules} key={index} name={field.name}>
          {renderField(field)}
        </Form.Item>
      ))}
      <Form.Item>
        <div className="flex gap-3 justify-end">
          <ButtonCustom onClick={closeAddNew} color="outline">
            Back
          </ButtonCustom>
          <ButtonCustom onClick={form.submit} color="orange">
            Next
          </ButtonCustom>
        </div>
      </Form.Item>
    </Form>
  );
};

export default CertificateDetail;
