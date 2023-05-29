import { Tooltip } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import { ReactElement } from 'react';

interface IProps {
    title?: string;
    placement?: TooltipPlacement;
    children: ReactElement | string;
}

const CustomTooltip = (props: IProps) => {
    const {title, placement = 'top', children} = props;
  return (
    <Tooltip placement={placement} title={title}>
      {children}
    </Tooltip>
  );
};

export default CustomTooltip;
