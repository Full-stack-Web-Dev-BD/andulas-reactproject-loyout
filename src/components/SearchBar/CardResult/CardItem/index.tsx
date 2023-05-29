import { Menu, Row, Col } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { ReactComponent as IconOpenMore } from 'assets/icons/more.svg';
import CheckboxCustom from 'components/Checkbox';
import DropdownCustom from 'components/Dropdown';
import CustomTooltip from 'components/Tooltip';
import { ICardItem } from 'pages/admin/hq-library/topic';
import { useEffect, useState } from 'react';
import "./style.css";

interface IProps {
  data: ICardItem;
  onChangeSelect: (selectedRowKeys: number) => void;
  handleOpenConfirmDelete?: (val: number) => void;
  checkAll: boolean;
  handleOpenModalEdit?: () => void;
  pathToModule?: string;
  onRedirect?: (id: number) => void;
  setMessageWarning: (message: string) => void;
}

const CardItem = (props: IProps) => {
  const {
    data,
    onChangeSelect,
    handleOpenConfirmDelete,
    checkAll,
    handleOpenModalEdit,
    onRedirect,
  } = props;
  const isViewOnly = !(handleOpenModalEdit && handleOpenConfirmDelete);

  const [checked, setChecked] = useState(false);
  const menu = (
    <Menu
      onClick={(event) => event.domEvent.stopPropagation()}
      items={[
        {
          label: 'Edit',
          key: '1',
          onClick: handleOpenModalEdit,
        },
        {
          label: 'Delete',
          key: '2',
          onClick: () => handleOpenConfirmDelete && handleOpenConfirmDelete(data?.id),
        },
      ]}
    />
  );

  const onChangeSelected = (id: number) => (value: CheckboxChangeEvent) => {
    setChecked(value.target.checked);
    onChangeSelect(id);
  };

  useEffect(() => {
    setChecked(checkAll);
  }, [checkAll]);

  return (
    <Row
      className={`rounded-3xl p-4 bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.04)] cus__width__carditems h-fit border border-solid border-transparent hover:!border-main-button-color cursor-pointer`}
      onClick={() => onRedirect && onRedirect(Number(data.id))}
    >
      <Col className="w-full">
        <img className="w-full h-[162px] rounded-2xl object-cover" src={data.thumbnail} />
        <div className="flex justify-between w-full mt-4">
          <div className="flex gap-2 w-[90%]">
            {isViewOnly ? (
              <div className="w-[20px] h-[20px]" />
            ) : (
              <CheckboxCustom
                onClick={(event) => event.stopPropagation()}
                checked={checked}
                onChange={onChangeSelected(data?.id)}
              />
            )}
            <div className="w-[80%]">
              <CustomTooltip title={data.title}>
                <h5 className="font-semibold text-lg font-fontFamily overflow-hidden text-ellipsis whitespace-nowrap w-fit max-w-full">
                  {data.title}
                </h5>
              </CustomTooltip>
              <p className="m-0">Module quantity: {data.quantity}</p>
            </div>
          </div>
          {!isViewOnly && (
            <div className="w-[24px] h-[24px] btn-action">
              <DropdownCustom menu={menu}>
                <IconOpenMore />
              </DropdownCustom>
            </div>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default CardItem;
