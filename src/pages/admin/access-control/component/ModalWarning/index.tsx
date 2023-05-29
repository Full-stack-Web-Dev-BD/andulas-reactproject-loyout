import ModalCustom from 'components/Modal';
import React from 'react';

const ModalWarning = ({
  visible,
  onCancel,
  message,
}: {
  visible: boolean;
  onCancel: () => void;
  message: string;
}) => {
  return (
    <ModalCustom
      visible={visible}
      onCancel={onCancel}
      cancelText="Cancel"
      title="Warning"
      titleCenter
      content={message}
    />
  );
};

export default ModalWarning;
