import CustomTooltip from 'components/Tooltip';
import { ICardItemCourse } from '../../..';

import "./cus-style.css";

interface IProps {
  data: ICardItemCourse;
  onRedirect?: (id: number, classId: number) => void;
}

const CardItem = (props: IProps) => {
  const {
    data,
    onRedirect,
  } = props;

  return (
    <div
      className={`rounded-3xl p-4 bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.04)] md:w-[32%] lg:w-[32.2%] h-fit border border-solid border-transparent hover:!border-main-button-color cursor-pointer cus-w-full`}
      onClick={() => onRedirect && onRedirect(Number(data.id), data?.classId)}
      key={data?.key}
    >
      <img className="w-full h-[162px] rounded-2xl object-cover" src={data.thumbnail} />
      <div className="flex justify-between w-full mt-4">
        <div className="flex gap-4 w-[90%]">
          <div className="w-[80%]">
            <CustomTooltip 
            title={
              data.title
            }
            >
              <h5 className="font-semibold text-lg font-fontFamily overflow-hidden text-ellipsis whitespace-nowrap w-fit max-w-full">
                {data.title}
              </h5>
            </CustomTooltip>
          </div>
        </div>
        
        {/* {!isViewOnly && (
          <div className="w-[24px] h-[24px] btn-action">
            <DropdownCustom menu={menu}>
              <IconOpenMore />
            </DropdownCustom>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default CardItem;
