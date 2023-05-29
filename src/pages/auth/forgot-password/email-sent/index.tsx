import React, { useCallback, useEffect, useState } from 'react';
import BackToLogin from 'components/BackToLogin';
import HeaderLogin from 'components/HeaderLogin';
import NotiModal from 'components/NotiModal';
import { Button } from 'antd';
import { useMutation } from 'react-query';
import { sendOtp } from 'api/user';
import { useLocation } from 'react-router-dom';

const EmailSent = () => {
  const { state } = useLocation();
  const { mutate } = useMutation('forgot', sendOtp);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!countdown) return;

    const intervalId = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [countdown]);

  const handleResendEmail = useCallback(() => {
    if (countdown === 0 && state) {
      setCountdown(60);
      mutate(state);
    }
  }, [countdown, state]);

  return (
    <>
      <HeaderLogin />
      <NotiModal
        title="Email has been sent!"
        text="If your email is registered with us, you will receive an email shortly with a message to reset your password. Please follow the instructions in the email."
        image={true}
      />
      <BackToLogin text="Back to login" />
      <div className="mt-1 font-fontFamily text-main-font-color">
        Didn’t receive an Email Link?
        <Button
          onClick={handleResendEmail}
          disabled={!!(countdown > 0)}
          type="link"
          className={`px-1 text-main-button-color btn-disable-background font-bold ${
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

export default EmailSent;
