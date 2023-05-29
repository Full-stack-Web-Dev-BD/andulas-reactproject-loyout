import React from 'react';

import WrapperModal from './WrapperModal';
import { Modal } from 'antd';
import './style.css';

interface IModalHocProps {
  open?: boolean;
  toggleModal?: () => void;
}

interface IProps {
  viewComponent?: React.ReactNode;
  content?: React.ReactNode;
  title?: React.ReactNode;
  modalHocProps?: IModalHocProps | any;
  onSubmit?: () => void;
  okText?: string;
  titleCenter?: boolean | false;
  cancelText?: string;
  visible?: boolean | undefined;
  children?: React.ReactNode;
  width?: number;
  onCancel?: () => void;
  contentLeft?: boolean;
  styleCancel?: any;
  buttonFloatRight?: boolean;
  isKeepOpen?: boolean;
  disabledSubmit?: boolean;
  onUnSubmitted?: () => void;
  className?: string;
  loading?: boolean;
}

const objectOrFunction = (component: any, props: { toggleModal: () => void }) => {
  if (typeof component === 'function') {
    return component(props);
  }
  return component;
};

const ModalComponent = (props: IProps) => {
  const {
    content,
    title,
    onSubmit,
    modalHocProps: { open, toggleModal },
    okText,
    cancelText,
    titleCenter,
    visible,
    children,
    width,
    onCancel,
    contentLeft,
    styleCancel,
    buttonFloatRight,
    isKeepOpen,
    disabledSubmit,
    onUnSubmitted,
    className,
    loading,
  } = props;

  const styleButton = {
    height: '44px',
    width: onSubmit || cancelText ? '100%' : '50%',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '16px',
    fontFamily: 'var(--main-font-family)',
    borderColor: 'var(--main-button-color)',
  };
  return (
    <Modal
      className={buttonFloatRight ? `modal-button-right ${className || ''}` : `${className || ''}`}
      okText={okText}
      cancelText={cancelText}
      onOk={() => {
        if (onSubmit instanceof Function) {
          onSubmit();
        }

        if (!isKeepOpen) {
          if (onCancel instanceof Function) {
            onCancel();
            return;
          }
          toggleModal();
        }
      }}
      width={width ? width : 520}
      onCancel={() => {
        if (onUnSubmitted instanceof Function) {
          onUnSubmitted();
        }
        if (onCancel instanceof Function) {
          onCancel();
          return;
        }

        toggleModal();
      }}
      visible={open || visible}
      okButtonProps={
        !okText
          ? { style: { ...styleButton, display: 'none', background: 'var(--main-button-color)' } }
          : {
              style: { ...styleButton, background: 'var(--main-button-color)' },
              disabled: disabledSubmit,
              loading,
            }
      }
      cancelButtonProps={
        !cancelText
          ? { style: { ...styleButton, display: 'none', color: 'var(--main-black)' } }
          : {
              style: { ...styleButton, ...styleCancel, color: 'var(--main-black)' },
            }
      }
    >
      {title && (
        <span
          className={`font-fontFamily text-main-font-color ${
            !titleCenter || `flex justify-center text-center`
          } font-bold text-2xl tracking-tight mt-6`}
        >
          {title}
        </span>
      )}
      <div
        className={`font-fontFamily text-main-font-color font-normal text-sm mt-3 ${
          titleCenter && !contentLeft ? 'text-center flex justify-center' : ''
        }`}
      >
        {content ? objectOrFunction(content, { toggleModal }) : children}
      </div>
    </Modal>
  );
};

const ModalCustom = (props: IProps) => {
  const { viewComponent } = props;
  return (
    <WrapperModal
      viewComponent={viewComponent}
      modalComponent={(modalHocProps: IModalHocProps) => (
        <ModalComponent {...props} modalHocProps={modalHocProps} />
      )}
    />
  );
};

export default ModalCustom;
