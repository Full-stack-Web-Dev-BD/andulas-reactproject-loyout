import { IClass } from 'api/class';
import { ReactComponent as ClassItemSVG } from 'assets/images/classItem.svg';
import CustomTooltip from 'components/Tooltip';
import { ICategory } from 'constants/types';
import { DATE_FORMAT, ROUTES } from 'constants/constants';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

interface IProps {
  classes: IClass[];
  category?: ICategory;
}

const ClassItem = (props: IProps) => {
  const { classes, category } = props;
  const navigate = useNavigate();

  return (
    <div className="flex gap-4 flex-wrap">
      {classes &&
        classes.length > 0 &&
        classes.map((classItem) => (
          <div
            className={`rounded-3xl p-4 bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.04)] sm:w-[100%] md:w-[calc(50%_-_0.5rem)] lg:w-[calc(50%_-_0.5rem)] xl:w-[calc(33.33%_-_0.67rem)] h-fit border border-solid border-transparent hover:!border-main-button-color cursor-pointer main-search-bar bg-[#FCECD9]`}
            key={classItem.id}
            onClick={() =>
              navigate(`${ROUTES.class_management}/${classItem.id}${ROUTES.attendance}`, {
                state: {
                  className: classItem.className,
                },
              })
            }
          >
            <div className="flex justify-start w-full mt-4">
              <div className="flex gap-4 w-full">
                <div className="flex w-[90%] items-center">
                  <ClassItemSVG />
                  <CustomTooltip title={classItem.className}>
                    <h5 className="font-semibold text-lg font-fontFamily overflow-hidden text-ellipsis whitespace-nowrap w-fit max-w-full ml-2 mb-0 text-[#32302D]">
                      {classItem.className}
                    </h5>
                  </CustomTooltip>
                </div>
              </div>
            </div>
            <p className="mt-2 mb-0 text-[#32302D] overflow-hidden text-ellipsis whitespace-nowrap w-fit max-w-full">
              Category: {category?.categoryName || ''}
            </p>
            <p className="mt-2 mb-0 text-[#32302D]">Capacity: {classItem.capacity}</p>
            <p className="mt-2 text-[#32302D]">
              Start Date - End Date:&nbsp;
              <p className="mt-2 mb-0 text-[#32302D]">
                {moment.utc(classItem.startDate).local().format(DATE_FORMAT)}
                <span className="ml-1 mr-1">-</span>
                {moment.utc(classItem.endDate).local().format(DATE_FORMAT)}
              </p>
            </p>
          </div>
        ))}
    </div>
  );
};

export default ClassItem;
