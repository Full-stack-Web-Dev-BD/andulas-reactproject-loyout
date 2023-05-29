import BackToLogin from 'components/BackToLogin';
import HeaderLogin from 'components/HeaderLogin';
import NotiModal from 'components/NotiModal';
import React from 'react';

const RegisterFail = () => {
  return (
    <>
      <HeaderLogin />
      <NotiModal
        title="Verify email failed"
        text="The verification link has expired. Please try create again."
      />
      <BackToLogin text="Back to Register" url="/register" />
    </>
  );
};

export default RegisterFail;
