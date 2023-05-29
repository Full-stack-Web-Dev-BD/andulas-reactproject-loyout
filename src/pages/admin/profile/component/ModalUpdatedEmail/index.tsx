import ModalCustom from "components/Modal";
import React from "react";

import images from 'assets/images';

interface IProps {
    visible?: boolean;
    message: string;
    onCancel: () => void;
}

const ModalUpdatedEmail = (props: IProps) => {
    const {visible, message, onCancel} = props;
    return (
        <ModalCustom visible={visible} onCancel={onCancel} cancelText="Back">
            <div className="flex justify-center text-center flex-col">
                <img src={images.success} alt="Success" />
                <div className="font-bold font-fontFamily text-base text-main-font-color">{message}</div>
            </div>
        </ModalCustom>
    )
}

export default ModalUpdatedEmail;

