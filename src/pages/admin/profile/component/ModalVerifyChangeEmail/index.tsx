import { Form, FormInstance } from 'antd';
import AuthCodeInput from 'components/AuthCode';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import React from 'react';

interface IProps {
  onFinish: (values: { newEmail: string }, otp: string) => void;
  formChangeEmail: FormInstance;
  timeLeft: number;
  setIsKeepOpen: (val: boolean) => void;
  setIsOpen: (val: boolean) => void;
  otpCode: string;
  isOpen: boolean;
  isKeepOpen: boolean;
  setOtpCode: (val: string) => void;
  onResendCodeEmail: () => void;
}

const ModalVerifyChangeEmail = (props: IProps) => {
  const {
    otpCode,
    formChangeEmail,
    onFinish,
    timeLeft,
    setIsKeepOpen,
    setIsOpen,
    isOpen,
    isKeepOpen,
    setOtpCode,
    onResendCodeEmail,
  } = props;

  const isDisable = !!(timeLeft > 0);

  return (
    <ModalCustom
      visible={isOpen}
      cancelText="Cancel"
      okText="Confirm"
      isKeepOpen={isKeepOpen}
      onSubmit={() => {
        formChangeEmail
          .validateFields()
          .then((values) => {
            if (otpCode?.length === 6) {
              onFinish(values, otpCode);
              return;
            }

            formChangeEmail.setFields([{ name: 'otpCode', errors: ['OTP invalid!'] }]);
          })
          .catch(() => {
            setIsKeepOpen(true);
          });
      }}
      onCancel={() => {
        setIsOpen(false);
        setIsKeepOpen(false);
      }}
      title="Change Email Address"
      titleCenter
    >
      <Form
        form={formChangeEmail}
        layout="vertical"
        className="w-full text-left"
        name="basic"
        autoComplete="off"
      >
        <Form.Item
          name="currentEmail"
          label="Current email :"
          rules={[{ required: true, message: 'Email is require!' }]}
        >
          <CustomInput type="text" classNameCustom="rounded-xl h-11" disabled />
        </Form.Item>

        <div className="flex items-center gap-x-2 relative">
          <Form.Item
            name="newEmail"
            label="New Email :"
            rules={[{ required: true, message: 'Email is require!' }]}
            className="flex-1"
          >
            <CustomInput type="text" classNameCustom="rounded-xl h-11" />
          </Form.Item>
          <ButtonCustom
            color="outline"
            isWidthFitContent
            className={`mt-1 text-main-button-color font-bold ${
              isDisable &&
              'text-[#E9E6E5] !border-[#E9E6E5] hover:!text-[#E9E6E5] hover:!border-[#E9E6E5] cursor-not-allowed'
            }`}
            onClick={onResendCodeEmail}
          >
            {`Resend ${isDisable ? `(${timeLeft})` : ''}`}
          </ButtonCustom>
        </div>
        {isDisable && (
          <span className="font-fontFamily font-normal text-sm mb-3 text-red-500">
            Your verification code may take a few moment to arrive. Please wait 120 seconds before
            trying to resend.
          </span>
        )}

        <Form.Item name="otpCode" label="OTP Code">
          <AuthCodeInput
            removeDefaultStyles
            validChars="0-9"
            placeholder=""
            classNames={{
              container: 'container',
              character: 'character',
              characterInactive: 'character--inactive',
              characterSelected: 'character--selected',
            }}
            inputProps={{
              onKeyUp: (event: React.ChangeEvent<HTMLInputElement>) =>
                setOtpCode(event.target.value),
              type: 'password',
            }}
          />
        </Form.Item>
      </Form>
    </ModalCustom>
  );
};

export default ModalVerifyChangeEmail;
