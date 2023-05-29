import { Button, Form } from 'antd';
import { ISendOtp, sendOtp, verifyOtp } from 'api/user';
import AuthCodeInput from 'components/AuthCode';
import BackToLogin from 'components/BackToLogin';
import HeaderLogin from 'components/HeaderLogin';
import { ACTION_TYPE, ERROR_MESSAGE, TwoFAMethod } from 'constants/index';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation } from 'react-router-dom';

const TwoFactor = () => {
  const [form] = Form.useForm();
  const locations = useLocation();
  const state = locations.state as ISendOtp;
  const [isDisable, setIsDisable] = useState(true);
  const [otpCode, setOtpCode] = useState('');

  const isRemember = localStorage.getItem('isRemember');

  const [timeLeft, setTimeLeft] = useState(0);

  const { mutate: resendOtp } = useMutation('resendOtp', sendOtp);

  const { mutate: verifyOtpMutate, isLoading } = useMutation('verifyOtp', verifyOtp, {
    onSuccess: ({ data }) => {
      window.location.href = '/';
      if (isRemember && JSON.parse(isRemember)) {
        localStorage.setItem('token', JSON.stringify(data.token));
        return;
      }
      sessionStorage.setItem('token', JSON.stringify(data.token));
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
    resendOtp(state as ISendOtp);
    setTimeLeft(60);
    form.resetFields();
  }, [timeLeft]);

  const handleFormSubmit = (value: string) => {
    if (value.length === 6) {
      setIsDisable(false);
    }
    setOtpCode(value);
  };

  const onFinish = () => {
    verifyOtpMutate({ otp: otpCode, actionType: ACTION_TYPE.TWO_FACTOR_AUTHENTICATION });
  };

  const isDisableResend = useMemo(() => {
    if (timeLeft > 0) {
      return true;
    }
    return;
  }, [timeLeft]);

  const renderMethodMessage = useCallback(() => {
    switch (state?.twoFactorAuthenticationMethod) {
      case TwoFAMethod.APP:
        return TwoFAMethod.APP.toLowerCase();
      case TwoFAMethod.EMAIL:
        return TwoFAMethod.EMAIL.toLowerCase();
      case TwoFAMethod.SMS:
        return TwoFAMethod.SMS.toLowerCase();
      default:
        break;
    }
  }, [state?.twoFactorAuthenticationMethod]);

  return (
    <>
      <HeaderLogin title="Two-factor Authentication" />
      <span className="font-fontFamily font-normal text-center text-sm mb-2">
        A verification code has been sent to your registered {renderMethodMessage()}. This code will
        be valid for 5 minutes.
      </span>
      <Form
        className="w-full"
        name="basic"
        initialValues={{ remember: true }}
        autoComplete="off"
        onFinish={onFinish}
        form={form}
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
            Verify
          </Button>
          <BackToLogin text="Back" />
        </Form.Item>
      </Form>

      <span className="text-sm">
        Didn&apos;t receive a code?
        <Button
          type="link"
          disabled={isDisableResend}
          className={`${
            isDisableResend ? 'text-[#AEA8A5]' : 'text-main-button-color'
          } font-semibold px-1 cursor-pointer btn-disable-background`}
          onClick={() => {
            onResendCode();
          }}
        >
          Resend code {isDisableResend && `(${timeLeft})`}
        </Button>
      </span>
      {isDisableResend && (
        <span className="text-red-600 text-sm text-center mt-2">
          Your verification code may take a few moment to arrive. Please wait 60 seconds before
          trying to resend.
        </span>
      )}
    </>
  );
};

export default TwoFactor;
