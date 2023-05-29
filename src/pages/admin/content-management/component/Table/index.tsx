import { CheckboxProps, Table } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import Loading from 'components/Loading';
import PaginationCustom from 'components/Pagination';
import SelectCustom from 'components/Select';
import { VIEW_ITEMS } from 'constants/constants';
import React, { ReactElement, useMemo } from 'react';
import './style.css';

export interface DataType {
  key?: React.Key;
  id?: number;
  courseName?: string;
  className?: string;
  categoryName?: string;
  centre?: string;
  category?: string;

  name?: string;
  updatedAt?: string;
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
  data: DataType[];
  columns: ColumnsType<DataType> | any;
  pagination?: TablePaginationConfig;
  isLoading?: boolean;
  handleTableChange?: (pagination: TablePaginationConfig) => void;
  onChangeSelect?: (selectedRowKeys: React.Key[]) => void;
  onChangeLimit?: (value: string) => void;
  onChangePagination?: (value: number) => void;
  filters?: SelectCustomType;
  action?: SelectCustomType;
  viewItem?: SelectCustomType;
  hidePageSize?: boolean;
  searchNotFound?: ReactElement;
  isSearch?: boolean;
  onLastPage?: () => void;
  onFirstPage?: () => void;
  onRow?: (record: any) => { onClick: () => void };
  getCheckboxProps?: (record: any) => Partial<Omit<CheckboxProps, 'checked' | 'defaultChecked'>>;
  hideColSelection?: boolean;
  title: string;
}

const TableCustomContent = (props: ITableCustom) => {
  const {
    data,
    columns,
    isLoading,
    pagination,
    handleTableChange,
    onChangeSelect,
    onChangePagination,
    filters,
    action,
    hidePageSize,
    viewItem,
    searchNotFound,
    isSearch,
    onLastPage,
    onFirstPage,
    onRow,
    getCheckboxProps,
    hideColSelection,
    title,
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
      <div className="flex items-center mb-3 justify-end sm:justify-start">
        {isSearch ? (
          <p className="text-2xl font-fontFamily leading-9 font-bold mb-0">Search Results</p>
        ) : (
          <div></div>
        )}
      </div>
      <Loading isLoading={isLoading}>
        {searchNotFound || (
          <>
            <div className="rounded-2xl bg-white shadow-[0px_0px_8px_rgba(0,0,0,0.04)] p-8">
              {title && (
                <p className="text-2xl font-fontFamily font-bold mb-0 tracking-tight">{title}</p>
              )}
              <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                className={`bg-transparent table-component ${onRow ? 'pointer-row' : ''} ${
                  hidePageSize ? 'hidden-page-size' : ''
                } ${onRow ? 'table-hover-component table-hide-col-selection-hover' : ''} ${
                  hideColSelection ? 'table-hide-col-selection' : ''
                }`}
                onChange={handleTableChange}
                onRow={onRow}
              />
            </div>
            {pagination?.total && (
              <div className="flex justify-between items-center mt-6">
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

export default TableCustomContent;
