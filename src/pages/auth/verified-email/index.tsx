import BackToLogin from 'components/BackToLogin';
import HeaderLogin from 'components/HeaderLogin';
import NotiModal from 'components/NotiModal';
import React from 'react';

const VerifiedEmail = () => {
  return (
    <>
      <HeaderLogin />
      <NotiModal
        title="Email Verified!"
        text="Your email has been verified! You may now log in with your new account."
        image={true}
      />
      <BackToLogin text="Back to login" />
    </>
  );
};

export default VerifiedEmail;
