import { Collapse } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import CheckboxCustom from 'components/Checkbox';
import { IAccessControl, IAccessControlItem, useOnClickOutside } from 'constants/index';
import React, { useCallback, useRef, useState } from 'react';
import './style.css';

const Panel = Collapse.Panel;
interface IProps {
  data: IAccessControl;
  dataSelected: Array<IAccessControlItem>;
  onChangeSelectedControl: (data: IAccessControlItem, value: CheckboxChangeEvent) => void;
  onChangeSelectedGroupControl: (data: IAccessControl, value: CheckboxChangeEvent) => void;
}

const CardItemRoleUpdate = (props: IProps) => {
  const { data, onChangeSelectedControl, dataSelected, onChangeSelectedGroupControl } = props;
  const refItem = useRef(null);
  const [isActive, setIsActive] = useState<string | string[]>('');
  const [isActiveMenuChildren, setIsActiveMenuChildren] = useState<string | string[]>('');

  const toggleCollapse = useCallback((key: string | string[]) => {
    setIsActive(key);
  }, []);

  const toggleCloseCollapse = useCallback(() => {
    setIsActive('');
  }, []);

  useOnClickOutside(refItem, toggleCloseCollapse);

  const toggleCollapseChildren = useCallback((key: string | string[]) => {
    setIsActiveMenuChildren(key);
  }, []);

  return (
    <div
      className="sm:w-full w-[calc(50%_-_0.5rem)] self-baseline border border-solid border-main-button-color rounded-xl"
      ref={refItem}
    >
      {data.accessControls.length > 0 ? (
        <Collapse
          expandIconPosition="start"
          className="card-item card-item-update"
          activeKey={isActive}
          onChange={toggleCollapse}
        >
          <Panel
            header={
              <div className="flex justify-between items-center w-full">
                <h3 className="font-bold text-lg font-fontFamily mb-0 text-main-font-color">
                  {data.groupName}
                </h3>
              </div>
            }
            extra={
              <CheckboxCustom
                onClick={(event) => event.stopPropagation()}
                onChange={(checked) => {
                  onChangeSelectedGroupControl(data, checked);
                }}
                checked={
                  dataSelected.filter(
                    (item) => item.assetControlGroupID === data.id && item.selected,
                  ).length > 0
                    ? true
                    : false
                }
              />
            }
            key={data?.id?.toString()}
          >
            {data.accessControls.map((item, index) => (
              <ul key={index} className="flex justify-between items-center">
                <li className="pt-4 font-fontFamily text-sm text-main-font-color" key={index}>
                  {item.accessControlName}
                </li>
                <CheckboxCustom
                  onChange={(checked) => {
                    onChangeSelectedControl(item, checked);
                  }}
                  checked={dataSelected.find((x) => x.id === item.id)?.selected}
                />
              </ul>
            ))}
          </Panel>
        </Collapse>
      ) : null}
    </div>
  );
};

export default CardItemRoleUpdate;
