import { Dropdown } from 'antd';
import { ReactElement } from 'react';

interface IProps {
  children: ReactElement;
  menu: ReactElement<any>;
}

const DropdownCustom = (props: IProps) => {
  const { children, menu } = props;
  return (
    <Dropdown trigger={['click']} overlay={menu} placement="bottomRight" className="w-full h-full">
      <div onClick={(event) => event.stopPropagation()} className="flex justify-center items-center cursor-pointer">{children}</div>
    </Dropdown>
  );
};

export default DropdownCustom;
