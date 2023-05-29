import BackToLogin from 'components/BackToLogin';
import HeaderLogin from 'components/HeaderLogin';
import NotiModal from 'components/NotiModal';
import React from 'react';

const ForgotPasswordFail = () => {
  return (
    <>
      <HeaderLogin />
      <NotiModal
        title="Email link has expired."
        text='Please click on "Back to Forgot Password" to reinsert your Login ID and select your 2FA method to reset your password.'
      />
      <BackToLogin text="Back to Forgot Password" url="/forgot-password" />
    </>
  );
};

export default ForgotPasswordFail;
