import React from 'react';
import { Switch } from 'antd';
import { SwitchChangeEventHandler } from 'antd/lib/switch';
import "./style.css";

interface IProps {
    value?: boolean;
    onChange?: SwitchChangeEventHandler ;
}
const CustomSwitch = (props: IProps) => {
  return <Switch {...props} />;
};

export default CustomSwitch;
