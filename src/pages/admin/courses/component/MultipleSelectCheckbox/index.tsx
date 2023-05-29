import { Dropdown, Menu } from 'antd';
import CustomInput from 'components/Input';
import CheckboxCustom from 'components/Checkbox';
import React from 'react';

const MultipleSelectCheckbox = () => {
  const menu = (
    <Menu
      items={[
        {
          key: '1',
          label: (
            <div className="flex gap-3 items-center">
              <CheckboxCustom />
              Select All
            </div>
          ),
        },
        {
          key: '1',
          label: (
            <div className="flex gap-3 items-center">
              <CheckboxCustom />
              Teacher 1
            </div>
          ),
        },
      ]}
    />
  );
  return (
    <div>
      <Dropdown
        trigger={['click']}
        overlay={menu}
        placement="bottomRight"
        className="w-full h-full"
      >
        <div className="w-[192px]">
          <CustomInput type="text" onClick={() => {}}></CustomInput>
        </div>
      </Dropdown>
    </div>
  );
};

export default MultipleSelectCheckbox;
