import { Button, Form } from 'antd';
import { sendOtp, verifyOtp } from 'api/user';
import AuthCodeInput from 'components/AuthCode';
import BackToLogin from 'components/BackToLogin';
import HeaderLogin from 'components/HeaderLogin';
import { ERROR_MESSAGE, ACTION_TYPE } from 'constants/index';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';

const TwoFactorForgotPassword = () => {
  const history = useNavigate();
  const { state } = useLocation();
  const [form] = Form.useForm();
  const [isDisable, setIsDisable] = useState(true);
  const [otpCode, setOtpCode] = useState('');

  const [timeLeft, setTimeLeft] = useState(0);

  const { mutate: resendOtp } = useMutation('resendOtp', sendOtp);

  const { mutate, isLoading } = useMutation('verifyOtp', verifyOtp, {
    onSuccess: ({ data }) => {
      history(`/create-new-password?token=${data.token}`);
    },
    onError: () => {
      form.setFields([
        {
          name: 'otpCode',
          errors: [ERROR_MESSAGE.OTP],
        },
      ]);
    },
  });
  useEffect(() => {
    if (!timeLeft) return;

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const onResendCode = useCallback(() => {
    if (timeLeft > 0) return;
    resendOtp(state);
    setTimeLeft(120);
    form.resetFields();
  }, [timeLeft]);

  const handleFormSubmit = (value: string) => {
    if (value.length === 6) {
      setIsDisable(false);
    }
    setOtpCode(value);
  };

  const onFinish = () => {
    mutate({ otp: otpCode, actionType: ACTION_TYPE.FORGOT_PASSWORD });
  };

  const isDisableResend = useMemo(() => {
    if (timeLeft > 0) {
      return true;
    }
    return;
  }, [timeLeft]);

  return (
    <>
      <HeaderLogin title="Enter the verification code" />
      <span className="font-fontFamily font-normal text-center text-sm mb-2 text-main-font-color">
        A verification code has been sent to your registered device. This code will be valid for 2
        minutes.
      </span>
      <Form
        form={form}
        className="w-full"
        name="basic"
        initialValues={{ remember: true }}
        autoComplete="off"
        onFinish={onFinish}
      >
        <Form.Item name="otpCode">
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
                handleFormSubmit(event.target.value),
              type: 'password',
            }}
          />
        </Form.Item>

        <Form.Item className="w-full">
          <Button
            disabled={isDisable}
            htmlType="submit"
            className="styte_button_primary"
            size="large"
            loading={isLoading}
          >
            Submit
          </Button>
          <BackToLogin text="Back" url="/forgot-password" />
        </Form.Item>
      </Form>

      <span className="text-main-font-color text-sm font-fontFamily">
        Didn&apos;t receive a code?
        <Button
          type="link"
          disabled={isDisableResend}
          className={`px-1 text-main-button-color font-bold btn-disable-background ${
            isDisableResend && 'text-[#AEA8A5]'
          }`}
          onClick={onResendCode}
        >
          Resend code {isDisableResend && `(${timeLeft})`}
        </Button>
      </span>
      {isDisableResend && (
        <span className="text-red-600 text-sm font-fontFamily text-center mt-2">
          Your verification code may take a few moment to arrive. Please wait 120 seconds before
          trying to resend.
        </span>
      )}
    </>
  );
};

export default TwoFactorForgotPassword;
