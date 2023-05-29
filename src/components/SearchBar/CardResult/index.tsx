import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import type { TablePaginationConfig } from 'antd/lib/table';
import CheckboxCustom from 'components/Checkbox';
import Loading from 'components/Loading';
import PaginationCustom from 'components/Pagination';
import SelectCustom from 'components/Select';
import { VIEW_ITEMS_HQ_LIBRARY } from 'constants/constants';
import { ICardItem } from 'pages/admin/hq-library/topic';
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import '../Table/style.css';
import CardItem from './CardItem';

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
  data: ICardItem[];
  pagination?: TablePaginationConfig;
  isLoading?: boolean;
  onChangeSelect: (selectedRowKeys: number) => void;
  onChangePagination?: (value: number) => void;
  filters?: SelectCustomType;
  action?: SelectCustomType;
  viewItem?: SelectCustomType;
  hidePageSize?: boolean;
  searchNotFound?: ReactElement;
  isSearch?: boolean;
  onLastPage?: () => void;
  onFirstPage?: () => void;
  onSelectAll: (val: boolean) => void;
  handleOpenConfirmDelete?: (val: number) => void;
  isClearSelected: boolean;
  handleOpenModalEdit?: (val: any) => void;
  onRedirect?: (id: number) => void;
  setMessageWarning: (message: string) => void;
}

const CardResult = (props: ITableCustom) => {
  const {
    data,
    isLoading,
    pagination,
    onChangeSelect,
    onChangePagination,
    filters,
    action,
    viewItem,
    searchNotFound,
    isSearch,
    onLastPage,
    onFirstPage,
    onSelectAll,
    handleOpenConfirmDelete,
    isClearSelected,
    handleOpenModalEdit,
    onRedirect,
    setMessageWarning,
  } = props;
  const isViewOnly = handleOpenModalEdit && handleOpenConfirmDelete;
  const [checked, setChecked] = useState(false);
  const [checkAll, setCheckAll] = useState(false);

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

  const onChangeSelected = (value: CheckboxChangeEvent) => {
    setChecked(value.target.checked);
    onSelectAll(value.target.checked);
    setCheckAll(value.target.checked);
  };

  useEffect(() => {
    if (isClearSelected) {
      setCheckAll(false);
      setChecked(false);
    }
  }, [isClearSelected]);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        {isSearch ? (
          <p className="text-2xl font-fontFamily leading-9 font-bold mb-0">Search Results</p>
        ) : (
          <div></div>
        )}
        <div className="flex gap-4 items-center flex-wrap justify-between w-full">
          {isViewOnly ? (
            <div className="flex gap-4 items-center">
              <CheckboxCustom onChange={onChangeSelected} checked={checked} />
              <p className="font-fontFamily font-bold mb-0">Select All</p>
            </div>
          ) : (
            <div />
          )}

          <div className="flex gap-4 items-center flex-wrap">
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
              <div className="filter-item">
                <p className="font-fontFamily font-bold mb-0">Filter</p>
                <SelectCustom
                  placeholder="All"
                  color="transparent"
                  className={`${filters?.minWidth ? filters?.minWidth : 'min-w-[120px] min-w-270'}`}
                  options={filters?.options || []}
                  onChange={filters?.onChange}
                  value={filters?.value || ''}
                />
              </div>
            )}
            <div className="filter-item">
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
      </div>
      <Loading isLoading={isLoading}>
        {searchNotFound || (
          <>
            <div className="flex gap-4 justify-center flex-wrap min-h-[42vh]">
              {data?.length > 0 &&
                data?.map((item) => (
                  <CardItem
                    handleOpenConfirmDelete={handleOpenConfirmDelete}
                    onChangeSelect={onChangeSelect}
                    key={item.id}
                    data={item}
                    checkAll={checkAll}
                    handleOpenModalEdit={() => handleOpenModalEdit && handleOpenModalEdit(item)}
                    onRedirect={onRedirect}
                    setMessageWarning={setMessageWarning}
                  />
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
