import React, { useCallback } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';

import './style.css';

interface IProps {
  items: any;
  onChange?: (value: string) => void;
  className?: string;
  color?: string;
  disabled?: boolean;
  title: string;
}
const DropDownCustom = (props: IProps) => {
  const { items, onChange, className, color, disabled, title } = props;

  const classNames = [
    'flex justify-center items-center ant-btn ant-btn-default rounded-xl h-11 min-w-[188px] font-fontFamily bg-white font-bold hover:!text-main-button-color hover:!border-main-button-color pt-1',
  ];

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
    <Dropdown
      overlay={items}
      trigger={['click']}
      disabled={disabled}
      className={classNames.join(' ')}
    >
      <a>
        {title}
        <DownOutlined className="ml-3" />
      </a>
    </Dropdown>
  );
};

export default DropDownCustom;
