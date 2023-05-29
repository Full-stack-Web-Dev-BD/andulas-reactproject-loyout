import { Input, InputNumber } from 'antd';
import React, { KeyboardEventHandler, useCallback } from 'react';
interface IPropsInput {
  value?: string;
  onChange?: (value?: any) => void;
  bgColor?: string;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  rows?: number;
  onClick?: () => void;
  classNameCustom?: string;
  onPressEnter?: (e: any) => void;
  suffix?: React.ReactNode;
  classNameWrapper?: string;
}

const { TextArea } = Input;

const CustomInput = (props: IPropsInput) => {
  const {
    value,
    onChange,
    bgColor,
    disabled,
    type,
    placeholder,
    icon,
    rows,
    onClick,
    classNameCustom,
    onPressEnter,
    suffix,
    classNameWrapper,
  } = props;
  const classNames = [`style_input_custom_login_page ${classNameCustom}`];
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

  const renderComponent = useCallback(() => {
    switch (type) {
      case 'text':
        return (
          <Input
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={classNames.join(' ')}
            value={value}
            onChange={onChange}
            onClick={onClick}
            onPressEnter={onPressEnter}
            suffix={suffix}
          />
        );

      case 'number':
        return (
          <InputNumber
            min="1"
            placeholder={placeholder}
            disabled={disabled}
            className={classNames.join(' ')}
            value={value}
            onChange={onChange}
          />
        );

      case 'password':
        return (
          <Input.Password
            placeholder={placeholder}
            disabled={disabled}
            className={classNames.join(' ')}
            value={value}
            onChange={onChange}
          />
        );

      case 'textArea':
        return (
          <TextArea
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            className={classNames.join(' ')}
            value={value}
            onChange={onChange}
          />
        );

      default:
        return (
          <Input
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            className={classNames.join(' ')}
            value={value}
            onChange={onChange}
            suffix={suffix}
          />
        );
    }
  }, [type, disabled, value]);

  initClassName(bgColor);

  return (
    <div className={`${icon ? 'relative' : ''} ${classNameWrapper}`}>
      {renderComponent()}
      <div className="absolute top-[50%] right-[2%] cursor-pointer translate-y-[-50%]">{icon}</div>
    </div>
  );
};

export default CustomInput;
