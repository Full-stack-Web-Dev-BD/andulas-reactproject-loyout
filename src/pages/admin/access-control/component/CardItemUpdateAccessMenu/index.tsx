import { Collapse } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import CheckboxCustom from 'components/Checkbox';
import { IMenuAccess, useOnClickOutside } from 'constants/index';
import React, { useCallback, useRef, useState } from 'react';
import './style.css';

const Panel = Collapse.Panel;
interface IProps {
  data: IMenuAccess;
  dataSelected: Array<IMenuAccess>;
  onChangeSelectedMenu: (data: IMenuAccess, value: CheckboxChangeEvent) => void;
}

const CardItemUpdateAccessMenu = (props: IProps) => {
  const { data, dataSelected, onChangeSelectedMenu } = props;
  const refItem = useRef(null);
  const [isActive, setIsActive] = useState<string | string[]>('');
  const [isActiveMenuChildren, setIsActiveMenuChildren] = useState<string | string[]>('');

  const toggleCollapse = useCallback(
    (key?: string | string[]) => {
      if (data.menuChildren.length > 0 && key) {
        setIsActive(key);
      }
    },
    [data],
  );

  const toggleCloseCollapse = useCallback(() => {
    setIsActive('');
  }, [isActive]);

  useOnClickOutside(refItem, toggleCloseCollapse);

  const toggleCollapseChildren = useCallback((key: string | string[]) => {
    setIsActiveMenuChildren(key);
  }, []);

  return (
    <div
      className="sm:w-full w-[calc(50%_-_0.5rem)] self-baseline border border-solid border-main-button-color rounded-xl"
      ref={refItem}
    >
      {data.menuChildren.length > 0 ? (
        <Collapse
          expandIconPosition="start"
          className="card-item card-item-update self-baseline"
          activeKey={isActive}
          onChange={toggleCollapse}
        >
          <Panel
            header={
              <div className="flex justify-between items-center w-full">
                <h3 className="font-bold text-lg font-fontFamily mb-0 text-main-font-color">
                  {data.menuName}
                </h3>
              </div>
            }
            extra={
              <CheckboxCustom
                onClick={(event) => event.stopPropagation()}
                onChange={(checked) => {
                  onChangeSelectedMenu(data, checked);
                }}
                checked={dataSelected.find((item) => item.id === data.id)?.selected}
              />
            }
            key={data?.id?.toString()}
          >
            {data.menuChildren.map((item, index) =>
              item?.menuChildren?.length === 0 ? (
                <ul key={index} className="flex justify-between items-center">
                  <li className="pt-4 font-fontFamily text-sm text-main-font-color" key={index}>
                    {item.menuName}
                  </li>
                  <CheckboxCustom
                    onChange={(checked) => onChangeSelectedMenu(item, checked)}
                    checked={dataSelected.find((el) => el.id === item.id)?.selected}
                  />
                </ul>
              ) : (
                <Collapse
                  expandIconPosition="start"
                  className="card-item card-item-update card-item-children w-full self-baseline"
                  activeKey={isActiveMenuChildren}
                  onChange={toggleCollapseChildren}
                >
                  <Panel
                    header={
                      <div className="flex justify-between items-center w-full">
                        <div className="font-semibold text-sm font-fontFamily mb-0 text-main-font-color">
                          {item.menuName}
                        </div>
                      </div>
                    }
                    extra={
                      <CheckboxCustom
                        onClick={(event) => event.stopPropagation()}
                        onChange={(checked) => onChangeSelectedMenu(item, checked)}
                        checked={dataSelected.find((el) => el.id === item.id)?.selected}
                      />
                    }
                    key={item?.id?.toString()}
                  >
                    {item?.menuChildren?.map((itemChild) => (
                      <ul
                        key={itemChild.id}
                        className="w-full pt-4 flex justify-between items-center"
                      >
                        <li className="font-fontFamily text-sm text-main-font-color" key={index}>
                          {itemChild.menuName}
                        </li>
                        <CheckboxCustom
                          onChange={(checked) => onChangeSelectedMenu(itemChild, checked)}
                          checked={dataSelected.find((el) => el.id === itemChild.id)?.selected}
                        />
                      </ul>
                    ))}
                  </Panel>
                </Collapse>
              ),
            )}
          </Panel>
        </Collapse>
      ) : (
        <div className="flex justify-between items-center w-full px-[18px] h-[57px]">
          <h3 className="font-bold text-lg font-fontFamily mb-0 text-main-font-color pl-[25px]">
            {data.menuName}
          </h3>
          <CheckboxCustom
            onClick={(event) => event.stopPropagation()}
            onChange={(checked) => {
              onChangeSelectedMenu(data, checked);
            }}
            checked={dataSelected.find((item) => item.id === data.id)?.selected}
          />
        </div>
      )}
    </div>
  );
};

export default CardItemUpdateAccessMenu;
