import { updateTwoFactor } from 'api/user';
import AuthCodeInput from 'components/AuthCode';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import { TwoFAMethod } from 'constants/index';
import { AppContext } from 'context';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { AuthCodeRef } from 'react-auth-code-input';
import { useMutation } from 'react-query';

enum MethodMessage {
  EMAIL = 'Email', 
  SMS = 'mobile SMS',
  APP = 'mobile APP'
}

const ModalEnterOtp = ({
  isOpen,
  onCancel,
  method,
  setIsOpenModalVerified,
  newIs2FAEnabled,
  setMethod,
  timeLeft,
  handleResend,
}: {
  isOpen: boolean;
  onCancel: () => void;
  method: string;
  setIsOpenModalVerified: (value: boolean) => void;
  newIs2FAEnabled: boolean;
  setMethod: (val: string) => void;
  timeLeft: number;
  handleResend: () => void;
}) => {
  const [state, setState]: any = useContext(AppContext);
  const [otp, setOtp] = useState<string>('');
  const otpInputRef: any = useRef<AuthCodeRef>(null);
  const [messageError, setMessageError] = useState<string>('');
  const [isKeepOpen, setIsKeepOpen] = useState(true);
  const [isClearValue, setIsClearValue] = useState(false);
  const isDisableResend = !!(timeLeft > 0);
  const { mutate: mutateUpdateTwoFactor } = useMutation('updateTwoFactor', updateTwoFactor, {
    onSuccess: () => {
      setState({
        ...state,
        user: {
          ...state.user,
          is2FAEnabled: method === TwoFAMethod.OFF ? 0 : 1,
          '2FAMethod': method === TwoFAMethod.OFF ? state.user['2FAMethod'] : method,
        },
      });
      setOtp('');
      setMessageError('');
      setIsKeepOpen(false);
      setIsClearValue(true);
      onCancel();
      setIsOpenModalVerified(true);
    },
    onError: ({ response }) => {
      setMessageError(response.data.message);
    },
  });

  const handleFormSubmit = () => {
    if (otp?.length === 6) {
      mutateUpdateTwoFactor({
        new2FAMethod: method !== TwoFAMethod.OFF ? method : state?.user?.['2FAMethod'],
        newIs2FAEnabled,
        otp,
      });
      return;
    }
    setMessageError('OTP invalid!');
  };

  const handleChange = (value: string) => {
    setOtp(value);
  };

  const renderMessage = useCallback(() => {
    switch (state?.user?.['2FAMethod']) {
      case TwoFAMethod.EMAIL:
        return MethodMessage.EMAIL;
      case TwoFAMethod.SMS:
        return MethodMessage.SMS;
      case TwoFAMethod.APP:
        return MethodMessage.APP;
      default:
        break;
    }
  }, [state?.user?.['2FAMethod']]);

  return (
    <>
      <ModalCustom
        visible={isOpen}
        onCancel={() => {
          onCancel();
          setIsClearValue(true);
        }}
        onUnSubmitted={() => {
          if (state?.user?.is2FAEnabled === 0) {
            setMethod(TwoFAMethod.OFF);
          } else {
            setMethod(state?.user?.['2FAMethod']);
          }
        }}
        onSubmit={handleFormSubmit}
        okText="Submit"
        title={`Please enter the 6 digit code sent to your ${renderMessage()}`}
        isKeepOpen={isKeepOpen}
      >
        <AuthCodeInput
          ref={otpInputRef}
          isClearValue={isClearValue}
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
            onKeyUp: (event: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(event.target.value);
              setMessageError('');
              setIsClearValue(false);
            },
            type: 'text',
          }}
        />
        {messageError && <div className="font-fontFamily mt-2 text-red-600">{messageError}</div>}
        <ButtonCustom
          className={`mt-8 mb-[-20px] mr-[-10px] w-[101.5%] text-base text-main-button-color font-bold ${
            isDisableResend &&
            '!text-[#E9E6E5] !border-[#E9E6E5] hover:!text-[#E9E6E5] hover:!border-[#E9E6E5] cursor-not-allowed'
          }`}
          onClick={handleResend}
          color="outline"
        >
           {`Resend ${isDisableResend && timeLeft ? `(${timeLeft})` : ''}`}
        </ButtonCustom>
      </ModalCustom>
    </>
  );
};

export default ModalEnterOtp;
