import ModalCustom from 'components/Modal';
import React from 'react';

interface IProps {
    visible?: boolean;
    onSubmit?: () => void;
    message: string;
}
const ModalConfirm = (props: IProps) => {
    const {visible, onSubmit, message} = props;
    return (
        <ModalCustom title="Confirmation" visible={visible} cancelText="Cancel" okText="Confirm" onSubmit={onSubmit}>
            <div>{message}</div>
        </ModalCustom>
    )
}

export default ModalConfirm;