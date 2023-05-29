import { Select } from 'antd';
import ButtonCustom from 'components/Button';
import CheckboxCustom from 'components/Checkbox';
import CustomInput from 'components/Input';
import React, { useCallback } from 'react';
import './style.css';

interface IProps {
  isDisable?: boolean;
  bgColor?: string;
  type: string;
  options?: Array<{ label: string; value: string }>;
  rows?: number;
}
const Field = (props: IProps) => {
  const { isDisable, type, bgColor, options, rows } = props;

  const classNames = [
    'h-12 rounded-2xl py-3 px-4 border border-solid border-[#E9E6E5] text-[#32302D] focus:border-[#E9E6E5]',
  ];
  const initClassName = useCallback(
    (bgColors: string | undefined) => {
      switch (bgColors) {
        case 'gray':
          return classNames.push('!bg-andalus-border');
        default:
          return;
      }
    },
    [classNames],
  );

  const renderField = useCallback(
    (typeField: string) => {
      switch (typeField) {
        case 'string':
          return <CustomInput type={typeField} disabled={isDisable} />;

        case 'number':
          return <CustomInput type={typeField} disabled={isDisable} />;

        case 'password':
          return <CustomInput type={typeField} disabled={isDisable} />;
        case 'textArea':
          return <CustomInput rows={rows} type={typeField} disabled={isDisable} />;
        case 'checkbox':
          return <CheckboxCustom />;
        case 'sendEmail':
          return (
            <div className="flex gap-x-4">
              <CustomInput type={type} disabled={isDisable} />
              <ButtonCustom isWidthFitContent={true}>Send</ButtonCustom>
            </div>
          );
        case 'select':
          return <Select options={options} />;
        default:
          return <CustomInput type={typeField} />;
      }
    },
    [type, isDisable],
  );

  initClassName(bgColor);

  return renderField(type);
};

export default Field;
