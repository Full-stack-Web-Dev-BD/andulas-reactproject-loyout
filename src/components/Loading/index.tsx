import React from 'react';
import { Spin } from 'antd';

interface ISpin {
  isLoading?: boolean;
  size?: 'small' | 'large' | 'default';
  children?: React.ReactNode;
  isError?: boolean;
  isDisplayOverlay?: boolean;
}

const Loading = (props: ISpin) => {
  const { isLoading, size = 'large', children, isError = false, isDisplayOverlay } = props;
  return isLoading ? (
    <div className={`${isDisplayOverlay ? 'fixed top-0 left-[216px] right-0 bottom-0 z-50 flex items-center justify-center bg-[rgb(199 209 201 / 30%)]': ''}`}>
      <div className="mb-10 mt-5 py-8 px-12 text-center rounded">
        <Spin size={size} />
      </div>
    </div>
  ) : isError ? (
    <div>Data not found!</div>
  ) : (
    <>{children}</>
  );
};

export default Loading;
