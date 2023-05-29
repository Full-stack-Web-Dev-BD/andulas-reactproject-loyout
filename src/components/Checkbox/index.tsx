import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { MouseEventHandler } from 'react';
import './style.css';

interface IProps {
  onClick?: MouseEventHandler<HTMLElement>;
  onChange?: (checked: CheckboxChangeEvent) => void;
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const CheckboxCustom = (props: IProps) => {
  const { onClick, onChange, checked, label, disabled, className } = props;
  return (
    <Checkbox
      disabled={disabled}
      checked={checked}
      onClick={onClick}
      onChange={onChange}
      className={`custom-checkbox ${className}`}
    >
      {label}
    </Checkbox>
  );
};

export default CheckboxCustom;
