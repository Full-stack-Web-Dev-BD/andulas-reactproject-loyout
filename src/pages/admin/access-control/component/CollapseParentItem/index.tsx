import { Collapse } from 'antd';
import React, { ReactElement, useCallback, useState } from 'react';

const Panel = Collapse.Panel;

interface IProps {
  title: string;
  children: ReactElement;
  isCloseVisible?: string | string[];
}

const CollapseParentItem = (props: IProps) => {
  const { title, children, isCloseVisible } = props;
  const [isActive, setIsActive] = useState<string | string[]>('');

  const toggleCollapse = useCallback((key: string | string[]) => {
    setIsActive(key);
  }, []);

  return (
    <Collapse
      expandIconPosition="start"
      className="card-item card-item-update mt-6"
      activeKey={isCloseVisible || isActive}
      onChange={toggleCollapse}
    >
      <Panel
        key={'1'}
        header={
          <div className="flex justify-between items-center w-full">
            <h3 className="font-bold text-lg font-fontFamily mb-0 text-main-font-color">{title}</h3>
          </div>
        }
      >
        {children}
      </Panel>
    </Collapse>
  );
};

export default CollapseParentItem;
