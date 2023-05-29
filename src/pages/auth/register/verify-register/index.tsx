import { Button } from 'antd';
import { signup } from 'api/user';
import BackToLogin from 'components/BackToLogin';
import HeaderLogin from 'components/HeaderLogin';
import NotiModal from 'components/NotiModal';
import React, { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation } from 'react-router-dom';

const VerifyRegister = () => {
  const { state } = useLocation();
  const { mutate } = useMutation('forgot', signup);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!countdown) return;

    const intervalId = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [countdown]);

  const handleResendEmail = useCallback(() => {
    setCountdown(60);
    mutate(state);
  }, [state]);

  return (
    <>
      <HeaderLogin />
      <NotiModal
        title="Verify your email"
        text="A verification link has been sent to your registered email. Please click on the link to verify your email address and activate your account. Thank you!"
      />
      <BackToLogin text="Back to login" />
      <div className="mt-1 font-fontFamily text-[#32302D]">
        Didn’t receive an Email Link?
        <Button
          onClick={handleResendEmail}
          type="link"
          disabled={!!(countdown > 0)}
          className={`px-1 text-main-button-color font-bold btn-disable-background ${
            countdown > 0 && 'text-[#AEA8A5]'
          }`}
        >
          Resend link
        </Button>
        {countdown > 0 && <span className="text-[#AEA8A5] font-bold">({countdown})</span>}
      </div>
    </>
  );
};

export default VerifyRegister;
