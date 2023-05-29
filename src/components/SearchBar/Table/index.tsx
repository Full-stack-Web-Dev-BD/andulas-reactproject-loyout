import { CheckboxProps, Table, Row, Col } from 'antd';
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
  courseShortName?: string;
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
  isRowSelect?: boolean;
  classNameFilter?: string;
  selectedRowKeys?: any[];
}

const TableCustom = (props: ITableCustom) => {
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
    classNameFilter,
    selectedRowKeys,
  } = props;
  const isRowSelect = props.isRowSelect !== undefined ? props.isRowSelect : true;

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
      <div className="flex items-center mb-3 justify-end sm:justify-start ">
        {isSearch ? (
          <p className="text-2xl font-fontFamily leading-9 font-bold mb-0 table-custom__search-result-header">
            Search Results
          </p>
        ) : null}
        <div className={`flex gap-4 items-center flex-wrap ${classNameFilter}`}>
          {action?.show && (
            <div className="filter-item">
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
            </div>
          )}
          {filters?.show && (
            <div className="filter-item ">
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
          <div className="filter-item ">
            <p className="font-fontFamily font-bold mb-0">View Item</p>
            <SelectCustom
              color="transparent"
              className="min-w-[72px]"
              options={VIEW_ITEMS}
              value={viewItem?.value || '5'}
              onChange={viewItem?.onChange}
            />
          </div>
        </div>
      </div>
      <Loading isLoading={isLoading}>
        {searchNotFound || (
          <>
            {/* <div className="cus-overflow-tb"> */}
            <Table
              rowSelection={{
                type: 'checkbox',
                onChange: onChangeSelect,
                columnWidth: 60,
                getCheckboxProps,
                selectedRowKeys: selectedRowKeys?.map((key) => key.toString()) || undefined,
              }}
              columns={columns}
              dataSource={data}
              pagination={false}
              className={`bg-transparent table-component ${onRow ? 'pointer-row' : ''} ${
                hidePageSize ? 'hidden-page-size' : ''
              } ${onRow ? 'table-hover-component table-hide-col-selection-hover' : ''} ${
                hideColSelection ? 'table-hide-col-selection' : ''
              } ${isRowSelect ? '' : 'table-hide-col-selection'}`}
              onChange={handleTableChange}
              onRow={onRow}
            />
            {/* </div> */}
            {pagination?.total && (
              <Row className="flex justify-between items-center mb-4 custom-margin footer-course-sp mt-4">
                <Col className="mb-3">
                  <span className="font-fontFamily text-sm text-main-font-color bottom-8">
                    {startPageSize} - {endPageSize} of {pagination?.total}
                  </span>
                </Col>
                <Col className="mb-3">
                  <PaginationCustom
                    total={Number(pagination?.total)}
                    pageSize={Number(pagination?.pageSize)}
                    current={Number(pagination?.current)}
                    onChange={onChangePagination}
                    onLastPage={onLastPage}
                    onFirstPage={onFirstPage}
                  ></PaginationCustom>
                </Col>
              </Row>
            )}
          </>
        )}
      </Loading>
    </div>
  );
};

export default TableCustom;
