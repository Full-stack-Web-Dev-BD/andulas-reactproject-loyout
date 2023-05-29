import { Form, FormInstance, Input, Select } from 'antd';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import AuthCodeInput from 'components/AuthCode';
import { codesPhoneNumber } from 'pages/auth/register';
import { RuleObject } from 'antd/lib/form';
import { REGEX_NUMBER, ERROR_MESSAGE } from 'constants/index';
import { useCallback, useEffect, useState } from 'react';

interface IProps {
  formChangeContactNumber: FormInstance;
  isKeepOpen: boolean;
  onFinishContactNumber: (
    val: { currentContactNumber: string; newContactNumber: string; mobileCountryCode: string },
    otpCode: string,
  ) => void;
  setIsKeepOpen: (val: boolean) => void;
  setIsOpen: (val: boolean) => void;
  timeLeft: number;
  onResendCode: () => void;
  isOpen: boolean;
  newContactNumber: string;
  setTimeLeft: (val: number) => void;
}

const ModalChangeContactNumber = (props: IProps) => {
  const {
    formChangeContactNumber,
    isKeepOpen,
    onFinishContactNumber,
    setIsKeepOpen,
    setIsOpen,
    timeLeft,
    onResendCode,
    isOpen,
    newContactNumber,
    setTimeLeft
  } = props;

  const [otpCode, setOtpCode] = useState('');
  const [isResend, setIsResend] = useState(false);

  const isDisableResend = !!(timeLeft > 0);

  const handleCancelModal = () => {
    setIsOpen(false);
    setIsKeepOpen(false);
    formChangeContactNumber.setFieldsValue({otpCode: '', phoneNumber: '', newContactNumber: '' });
    setOtpCode('');
    setTimeLeft(0);
  };

  const handleSubmit = useCallback(() => {
    formChangeContactNumber
      .validateFields()
      .then((values) => {
        if (otpCode?.length === 6) {
          onFinishContactNumber(values, otpCode);
          return;
        }
        formChangeContactNumber.setFields([{ name: 'otpCode', errors: ['OTP invalid!'] }]);
      })
      .catch(() => {
        setIsKeepOpen(true);
      });
  }, [otpCode]);

  useEffect(() => {
    formChangeContactNumber.setFieldsValue({ otpCode: otpCode, phoneNumber: newContactNumber });
  }, [otpCode, newContactNumber]);

  return (
    <ModalCustom
      visible={isOpen}
      cancelText="Cancel"
      okText="Confirm"
      isKeepOpen={isKeepOpen}
      onSubmit={handleSubmit}
      onCancel={handleCancelModal}
      title="Change Contact Number"
      titleCenter
      width={560}
    >
      <Form
        form={formChangeContactNumber}
        layout="vertical"
        className="w-full text-left"
        name="basic"
        autoComplete="off"
        initialValues={{ mobileCountryCode: '65' }}
        colon={true}
      >
        <Form.Item
          name="currentContactNumber"
          label="Current Contact Number"
          rules={[{ required: true, message: 'Current Contact Number is require!' }]}
        >
          <CustomInput disabled={true} type="text" classNameCustom="rounded-xl h-11" />
        </Form.Item>

        <div className="flex gap-x-2 relative display-none">
          <Form.Item
            validateFirst
            name="phoneNumber"
            rules={[{ required: true, message: '' }]}
            className="flex-1"
            label="New Contact Number"
          >
            <Input.Group compact>
              <Form.Item
                noStyle
                name="mobileCountryCode"
                rules={[{ required: true, message: 'Prefix is required!' }]}
              >
                <Select
                  options={codesPhoneNumber.map((item) => {
                    return { label: `+ ${item.code}`, value: item.code.toString() };
                  })}
                  getPopupContainer={(node) => node}
                  className="w-[25%] w-30"
                />
              </Form.Item>
              <Form.Item
                noStyle
                name={'newContactNumber'}
                validateFirst
                rules={[
                  { required: true, message: 'New Contact Number is required!' },
                  {
                    min: 8,
                    message: 'Contact Number should consist of 8 characters',
                  },
                  {
                    max: 8,
                    message: 'Contact Number should consist of 8 characters',
                  },
                  {
                    validator(_: RuleObject, value: string) {
                      const regex = new RegExp(REGEX_NUMBER);
                      if (regex.test(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(ERROR_MESSAGE.CONTACT_NUMBER);
                    },
                  },
                ]}
              >
                <Input className="style_input_custom_login_page w-[75%] rounded-r-2xl w-70" />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <ButtonCustom
            color="outline"
            isWidthFitContent
            className={`mt-[30px] text-main-button-color font-bold mt-10 ${
              isDisableResend &&
              'text-[#E9E6E5] !border-[#E9E6E5] hover:!text-[#E9E6E5] hover:!border-[#E9E6E5] cursor-not-allowed'
            }`}
            onClick={() => {
              setIsResend(true);
              onResendCode();
            }}
          >
            {isResend ? `Resend ${isDisableResend ? `(${timeLeft})` : ''}` : 'Send'}
          </ButtonCustom>
        </div>
        {isDisableResend && (
          <span className="font-fontFamily font-normal text-sm mb-3 text-red-500">
            Your verification code may take a few moment to arrive. Please wait 120 seconds before
            trying to resend.
          </span>
        )}

        <Form.Item
          rules={[{ required: true, message: 'OTP Code is required!' }]}
          name="otpCode"
          label="OTP Code"
        >
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

export default ModalChangeContactNumber;
