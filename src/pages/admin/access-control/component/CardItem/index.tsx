import { Collapse } from 'antd';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import { ROUTES } from 'constants/index';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './style.css';

const Panel = Collapse.Panel;

interface IProps {
  data: {
    id?: number;
    roleName?: string;
    accessControls?: any;
    accessAssetGroups: 
      {
        id: number;
        templateName: string;
        accessAssetGroups: []
      };

    
  };
  handleDelete: (id: number) => void;
  expandIconPosition?: 'end' | 'start';
}

const CardItem = (props: IProps) => {
  const history = useNavigate();
  const { data, handleDelete, expandIconPosition = 'end' } = props;
  const [isActive, setIsActive] = useState<string | string[]>('');
  const [visibleDelete, setVisibleDelete] = useState(false);

  const toggleCollapse = useCallback((key: string | string[]) => {
    setIsActive(key);
  }, []);

  const handleOpenEdit = useCallback(() => {
    if(data.id) {
      history(`${ROUTES.access_control}/${data.id}`);
    }
  },[data])

  const filterData = (dataAccessControl: any) => {
    const listData = dataAccessControl?.accessControls?.map((dataItem: any, index: number, arr: any[]) => {
          const findSameKey = (item: any) => dataItem?.assetControlGroupID  === item?.assetControlGroupID;
          if (arr.findIndex(findSameKey) === index) {
            return {
              ...dataItem,
            };
          }

          return undefined;
        })
        .filter((x: any) => x);
      return (
        <div>{listData?.map((e:any) => <p key={e.assetControlGroupID}>{e.accessControlGroup?.groupName}</p>)}</div>
      )
  }

  return (
    <Collapse
      expandIconPosition={expandIconPosition}
      className="card-item"
      activeKey={isActive}
      onChange={toggleCollapse}
    >
      <Panel header={data?.roleName} key="1">
        <div>{filterData(data)}</div>
        {/* {data.accessControls?.map(
          (item: { id: React.Key | null | undefined; groupName: string | undefined }) => (
            <div className="py-2 font-fontFamily text-sm text-main-font-color" key={item.id}>
              {item?.groupName}
            </div>
          ),
        )} */}
        <div className="flex justify-end gap-4">
          <ButtonCustom
            color="outline"
            onClick={() => {
              setVisibleDelete(true);
            }}
          >
            Delete
          </ButtonCustom>
          <ButtonCustom onClick={handleOpenEdit} color="orange">Edit</ButtonCustom>
        </div>
        <ModalCustom
          content={`Are you sure you want to delete ${data?.roleName}? This action cannot be undone.`}
          title="Delete"
          titleCenter
          okText="Confirm"
          onCancel={() => {
            setVisibleDelete(false);
          }}
          onSubmit={() => {
            setVisibleDelete(false);
            handleDelete(Number(data.id));
          }}
          cancelText="Cancel"
          visible={visibleDelete}
        />
      </Panel>
    </Collapse>
  );
};

export default CardItem;
