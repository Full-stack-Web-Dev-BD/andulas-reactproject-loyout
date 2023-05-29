import ModalCustom from 'components/Modal';
import React from 'react';

interface IProps {
  visible: boolean;
  onSubmit?: () => void;
  onClose: () => void;
  content: string;
  title: string;
}

const ModalConfirmDeleteTheme = (props: IProps) => {
  const { visible, onSubmit, onClose, content, title } = props;
  return (
    <ModalCustom
      okText="Confirm"
      titleCenter
      cancelText="Cancel"
      onCancel={onClose}
      onSubmit={onSubmit}
      visible={visible}
      content={content}
      title={title}
    />
  );
};

export default ModalConfirmDeleteTheme;
