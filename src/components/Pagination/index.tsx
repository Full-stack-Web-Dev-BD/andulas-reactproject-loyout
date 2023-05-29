import { Pagination, Grid } from 'antd';
import React from 'react';
import './style.css';

const {useBreakpoint} = Grid
interface IProps {
  total: number;
  pageSize: number;
  onChange?: (value: number) => void;
  current?: number;
  onLastPage?: () => void;
  onFirstPage?: () => void;
}

const PaginationCustom = (props: IProps) => {
  const { total, pageSize, onChange, current = 1, onLastPage, onFirstPage } = props;
  const { lg } = useBreakpoint();
  return (
    <div className="flex items-center">
      <button
        className={`${
          current === 1 ? '' : 'cursor-pointer'
        } bg-transparent border-none border-transparent text-xs outline-none mt-[4px] mr-1`}
        type="button"
        tabIndex={-1}
        onClick={onFirstPage}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.80457 0.528514C10.0649 0.788864 10.0649 1.21097 9.80457 1.47132L6.27598 4.99992L9.80457 8.52851C10.0649 8.78886 10.0649 9.21097 9.80457 9.47132C9.54422 9.73167 9.12211 9.73167 8.86176 9.47132L4.86177 5.47132C4.60142 5.21097 4.60142 4.78886 4.86177 4.52851L8.86176 0.528514C9.12211 0.268165 9.54422 0.268165 9.80457 0.528514ZM5.80457 0.528514C6.06492 0.788864 6.06492 1.21097 5.80457 1.47132L2.27598 4.99992L5.80457 8.52851C6.06492 8.78886 6.06492 9.21097 5.80457 9.47132C5.54423 9.73167 5.12211 9.73167 4.86177 9.47132L0.861766 5.47132C0.736742 5.3463 0.666504 5.17673 0.666504 4.99992C0.666504 4.82311 0.736742 4.65354 0.861766 4.52851L4.86177 0.528514C5.12212 0.268165 5.54423 0.268165 5.80457 0.528514Z"
            fill={current === 1 ? '#D1CDCB' : '#32302D'}
          />
        </svg>
      </button>
      <Pagination
        className="custom-pagination text-center custom-pagination-sp"
        size="small"
        showLessItems={lg ? false : true}
        onChange={onChange}
        total={total}
        showSizeChanger={false}
        pageSize={pageSize}
        current={current}
        responsive
      />
      <button
        className={`${
          Math.ceil(Number(total) / Number(pageSize)) === current ? '' : 'cursor-pointer'
        } bg-transparent border-none border-transparent text-xs outline-none mt-[4px] ml-1`}
        type="button"
        tabIndex={-1}
        onClick={onLastPage}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.19526 0.528514C4.45561 0.268165 4.87772 0.268165 5.13807 0.528514L9.13807 4.52851C9.39842 4.78886 9.39842 5.21097 9.13807 5.47132L5.13807 9.47132C4.87772 9.73167 4.45561 9.73167 4.19526 9.47132C3.93491 9.21097 3.93491 8.78886 4.19526 8.52851L7.72386 4.99992L4.19526 1.47132C3.93491 1.21097 3.93491 0.788863 4.19526 0.528514ZM0.195263 0.528514C0.455612 0.268165 0.877722 0.268165 1.13807 0.528514L5.13807 4.52851C5.2631 4.65354 5.33333 4.82311 5.33333 4.99992C5.33333 5.17673 5.2631 5.3463 5.13807 5.47132L1.13807 9.47132C0.877722 9.73167 0.455612 9.73167 0.195262 9.47132C-0.0650874 9.21097 -0.0650874 8.78886 0.195262 8.52851L3.72386 4.99992L0.195263 1.47132C-0.0650867 1.21097 -0.0650867 0.788864 0.195263 0.528514Z"
            fill={Math.ceil(Number(total) / Number(pageSize)) === current ? '#D1CDCB' : '#32302D'}
          />
        </svg>
      </button>
    </div>
  );
};

export default PaginationCustom;
