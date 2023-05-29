import React from 'react';
import EmailSentSVG from 'assets/images/emailsent.svg';
import BackToLogin from 'components/BackToLogin';
import HeaderLogin from 'components/HeaderLogin';

const PasswordUpdate = () => {
  return (
    <>
      <HeaderLogin />
      <img src={EmailSentSVG} alt="email sent" />

      <span className="font-fontFamily text-center font-bold text-[28px] tracking-tight my-6">
        Password Updated!
      </span>
      <span className="font-fontFamily font-normal text-center text-sm mb-2 text-main-font-color">
        Your password has been changed successfully. Use your new password to log in
      </span>
      <BackToLogin text="Back to login" />
    </>
  );
};

export default PasswordUpdate;
