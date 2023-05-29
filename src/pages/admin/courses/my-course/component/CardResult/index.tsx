import type { TablePaginationConfig } from 'antd/lib/table';
import Loading from 'components/Loading';
import PaginationCustom from 'components/Pagination';
import SelectCustom from 'components/Select';
import { VIEW_ITEMS_HQ_LIBRARY } from 'constants/constants';
import React, { ReactElement, useMemo } from 'react';
import { ICardItemCourse } from '../..';
import CardItem from './CardItem';

import './custom-style.css';

export interface DataType {
  key?: React.Key;
  id?: number;
  courseName?: string;
  className?: string;
  categoryName?: string;
  centre?: string;
  category?: string;
}

interface SelectCustomType {
  options?: Array<{ label?: string; value?: string }>;
  onChange?: (value: string) => void;
  value?: string | null;
  show?: boolean;
  onSelect?: (value: string) => void;
  minWidth?: string;
}

interface ITableCustom {
  data: ICardItemCourse[];
  pagination?: TablePaginationConfig;
  isLoading?: boolean;
  onChangePagination?: (value: number) => void;
  filters?: SelectCustomType;
  action?: SelectCustomType;
  viewItem?: SelectCustomType;
  hidePageSize?: boolean;
  searchNotFound?: ReactElement;
  isSearch?: boolean;
  onLastPage?: () => void;
  onFirstPage?: () => void;
  onRedirect?: (id: number, classId: number) => void;
}

const CardResult = (props: ITableCustom) => {
  const {
    data,
    isLoading,
    pagination,
    onChangePagination,
    filters,
    action,
    viewItem,
    searchNotFound,
    isSearch,
    onLastPage,
    onFirstPage,
    onRedirect,
  } = props;

  const startPageSize = useMemo(() => {
    const startSize =
      Number(pagination?.current) * Number(pagination?.pageSize) -
      (Number(pagination?.pageSize) - 1);

    return startSize;
  }, [pagination]);

  const endPageSize = useMemo(() => {
    let endSize = Number(pagination?.current) * Number(pagination?.pageSize);
    endSize =
      pagination?.total && endSize < pagination?.total ? endSize : (pagination?.total as number);

    return endSize;
  }, [pagination]);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        {isSearch ? (
          <p className="text-2xl font-fontFamily leading-9 font-bold mb-0">Search Results</p>
        ) : (
          <div></div>
        )}
        <div className="flex gap-4 items-center flex-wrap justify-end w-full">
          <div className="flex gap-4 items-center flex-wrap cus-view-item">
            {action?.show && (
              <>
                <p className="font-fontFamily font-bold mb-0">Action</p>
                <SelectCustom
                  placeholder="Select"
                  color="transparent"
                  className="min-w-[167px]"
                  options={action?.options || []}
                  onSelect={action?.onSelect}
                  value={action.value || ''}
                  allowClear
                />
              </>
            )}
            {filters?.show && (
              <>
                <p className="font-fontFamily font-bold mb-0">Filter</p>
                <SelectCustom
                  placeholder="All"
                  color="transparent"
                  className={`${filters?.minWidth ? filters?.minWidth : 'min-w-[120px]'}`}
                  options={filters?.options || []}
                  onChange={filters?.onChange}
                  value={filters?.value || ''}
                />
              </>
            )}
            <p className="font-fontFamily font-bold mb-0">View Item</p>
            <SelectCustom
              color="transparent"
              className="min-w-[72px]"
              options={VIEW_ITEMS_HQ_LIBRARY}
              value={viewItem?.value || '5'}
              onChange={viewItem?.onChange}
            />
          </div>
        </div>
      </div>
      <Loading isLoading={isLoading}>
        {searchNotFound || (
          <>
            <div className="gap-4 flex-wrap min-h-[42vh] grid grid-cols-3">
              {data?.length > 0 &&
                data?.map((item) => (
                  <CardItem key={item?.key} data={item} onRedirect={onRedirect} />
                ))}
            </div>
            {pagination?.total && (
              <div className="flex justify-between items-center my-4 footer-course-sp sm:gap-3">
                <span className="font-fontFamily text-sm text-main-font-color bottom-8">
                  {startPageSize} - {endPageSize} of {pagination?.total}
                </span>
                <PaginationCustom
                  total={Number(pagination?.total)}
                  pageSize={Number(pagination?.pageSize)}
                  current={Number(pagination?.current)}
                  onChange={onChangePagination}
                  onLastPage={onLastPage}
                  onFirstPage={onFirstPage}
                ></PaginationCustom>
              </div>
            )}
          </>
        )}
      </Loading>
    </div>
  );
};

export default CardResult;
