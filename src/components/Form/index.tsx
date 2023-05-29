import React, { useCallback } from 'react';
import { Button, Form, Select } from 'antd';

import './style.css';
import CustomInput from 'components/Input';
import CheckboxCustom from 'components/Checkbox';

interface IProps {
  onFinish?: () => void;
  onFinishFail?: () => void;
  fieldList: Array<{
    name: string;
    value?: string | number;
    type: string;
    label: string;
    rules: Array<object>;
  }>;
  submitText?: string;
  form: any;
  isHalfWidth: boolean;
  isDisable?: boolean;
}
const CustomForm = (props: IProps) => {
  const {
    fieldList,
    onFinish,
    onFinishFail,
    submitText,
    form,
    isHalfWidth = false,
    isDisable = false,
  } = props;

  const renderField = useCallback((type: string) => {
    switch (type) {
      case 'string':
        return <CustomInput type="string" />;
      case 'number':
        return <CustomInput type="number" />;
      case 'checkbox':
        return <CheckboxCustom />;
      case 'select':
        return <Select />;
      default:
        break;
    }
  }, []);
  return (
    <Form
      className={isHalfWidth ? 'form-layout-custom' : ''}
      form={form}
      layout="vertical"
      colon={false}
      onFinish={onFinish}
      onFinishFailed={onFinishFail}
    >
      {fieldList.map((field, index) => (
        <Form.Item
          className={isHalfWidth ? 'item-half-width' : ''}
          rules={field.rules}
          label={field.label}
          key={index}
          name={field.name}
        >
          {renderField(field.type)}
        </Form.Item>
      ))}
      {submitText && (
        <Form.Item>
          <Button htmlType="submit">{submitText}</Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default CustomForm;
