import { Select } from 'antd';
import React, { useCallback } from 'react';

import './style.css';

const { Option } = Select;

interface IProps {
  options: Array<{ label?: string; value?: string }>;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  className?: string;
  value: string | null;
  color?: string;
  placeholder?: string;
  mode?: 'tags' | 'multiple';
  allowClear?: boolean;
  disabled?: boolean;
  defaultValue?: string;
}
const SelectCustom = (props: IProps) => {
  const {
    options,
    onChange,
    className,
    value,
    color,
    placeholder,
    mode,
    allowClear,
    onSelect,
    disabled,
    defaultValue,
  } = props;
  const classNames = ['rounded-3xl h-12'];

  const initComponent = useCallback(
    (colorValue: string | undefined) => {
      if (className) {
        if (className.includes('h-')) {
          classNames[0] = classNames[0].replace('h-12 ', '');
        }
        classNames.push(className);
      }

      if (colorValue) {
        switch (colorValue) {
          case 'transparent':
            classNames.push('background-transparent');
            break;
          default:
            break;
        }
      }
    },
    [classNames, className],
  );

  initComponent(color);

  return (
    <Select
      mode={mode}
      disabled={disabled}
      dropdownClassName="rounded-xl"
      placeholder={placeholder}
      value={value || undefined}
      className={classNames.join(' ')}
      onChange={onChange || (() => {})}
      allowClear={allowClear}
      onSelect={onSelect || (() => {})}
      defaultValue={defaultValue}
    >
      {options.map((item, index) => (
        <Option key={item.value || index}>{item.label}</Option>
      ))}
    </Select>
  );
};

export default SelectCustom;
