import { Button } from 'antd';
import { MouseEvent, ReactNode, useCallback } from 'react';
import './style.css';
interface IProps {
  children?: string;
  color?: string | undefined;
  onClick?: (e?: MouseEvent<HTMLElement>) => void;
  fullWidth?: boolean;
  isWidthFitContent?: boolean;
  className?: string;
  htmlType?: 'button' | 'submit' | 'reset' | undefined;
  isLoading?: boolean;
  icon?: ReactNode;
  isRound?: boolean;
  disabled?: boolean;
}

const ButtonCustom = (props: IProps) => {
  const {
    children,
    color,
    onClick,
    fullWidth,
    isWidthFitContent,
    className,
    htmlType = 'button',
    isLoading,
    icon,
    isRound,
    disabled,
  } = props;
  const classNames = [
    'rounded-xl h-11 cus-button font-fontFamily bg-white font-bold text-main-button-color button-sp',
  ];

  const initComponent = useCallback(
    (colorValue: string | undefined) => {
      switch (colorValue) {
        case 'orange':
          classNames.push('!bg-main-button-color !text-white border-main-button-color');
          break;
        case 'outline':
          classNames.push(
            'hover:!border-main-button-color hover:!text-main-button-color !text-main-button-color !border-main-button-color',
          );
          break;
        default:
          break;
      }

      if (fullWidth) {
        classNames.push('w-full');
      }

      if (isWidthFitContent) {
        classNames.push('w-fit min-w-fit h-12');
      }

      if (isRound) {
        classNames[0] = classNames[0].replace('min-w-[188px] ', '');
        classNames.push('w-12 !min-w-12 h-12 rounded-full');
      }

      if (className) {
        if (className.includes('h-')) {
          classNames[0] = classNames[0].replace('h-11 ', '');
        }
        classNames.unshift(className);
      }
    },
    [classNames, fullWidth, isWidthFitContent, className, isRound],
  );

  initComponent(color);

  return (
    <Button
      disabled={disabled}
      icon={icon}
      loading={isLoading}
      htmlType={htmlType}
      onClick={onClick}
      className={classNames.join(' ')}
    >
      {children}
    </Button>
  );
};

export default ButtonCustom;
