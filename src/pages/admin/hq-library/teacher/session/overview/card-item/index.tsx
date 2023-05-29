import { Content } from 'antd/lib/layout/layout';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import CustomTooltip from 'components/Tooltip';
import { Status } from 'constants/index';
import { useState } from 'react';

interface IProps {
  id: number;
  courseName: string;
  isActive: boolean;
  className: string;
  actionContent: string;
  handle: (id: number) => void;
}

const CardItem = (props: IProps) => {
  const [isOpenModalConfirmRemove, setIsOpenModalConfirmRemove] = useState(false);
  const { courseName, isActive, className, actionContent, handle, id } = props;

  return (
    <Content className="bg-white rounded-2xl p-8 w-[49%] max-w-[49%] custom-width custom-max-width">
      <div className="flex items-center justify-between">
        <CustomTooltip title={courseName}><h5 className="font-semibold text-2xl max-w-[65%] text-ellipsis whitespace-nowrap overflow-hidden">{courseName}</h5></CustomTooltip>
        {/* <ButtonCustom className='w-48' isWidthFitContent color="outline" onClick={() => setIsOpenModalConfirmRemove(true)}>
          {actionContent}
        </ButtonCustom> */}
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-[7px] py-[5px] rounded-2xl text-xs uppercase text-center ${isActive ? 'bg-[#E6F2F2] text-[#006262]' : 'bg-[#FCECD9] text-[#BE5E2A]'}`}>
          {isActive ? Status.ACTIVE : Status.INACTIVE}
        </span>
        <span>{className}</span>
      </div>
      {isOpenModalConfirmRemove && (
        <ModalCustom
          visible={true}
          titleCenter
          title="Confirm"
          cancelText="Cancel"
          okText="Confirm"
          content="Are you sure want to remove this course? This action can't be undone!"
          onSubmit={() => handle(id)}
          onCancel={() => setIsOpenModalConfirmRemove(false)}
        />
      )}
    </Content>
  );
};

export default CardItem;
