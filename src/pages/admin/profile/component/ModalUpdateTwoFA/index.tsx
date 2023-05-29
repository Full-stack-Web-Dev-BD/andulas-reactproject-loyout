import { Radio, RadioChangeEvent, Space } from 'antd';
import { updateTwoFactor } from 'api/user';
import ModalCustom from 'components/Modal';
import { TwoFAMethod } from 'constants/index';
import { AppContext } from 'context';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import ModalEnterOtp from '../ModalEnterOtp';
import ModalUpdatedEmail from '../ModalUpdatedEmail';

const ModalUpdateTwoFA = ({
  isOpen,
  onCancel,
  setMethod,
  method,
  setIsOpenTwoFA,
}: {
  isOpen: boolean;
  onCancel: () => void;
  setMethod: (value: string) => void;
  setIsOpenTwoFA: (value: boolean) => void;
  method: string;
}) => {
  const [state, setState]: any = useContext(AppContext);
  const [timeLeft, setTimeLeft] = useState(0);
  const [twoFaMethod, setTwoFaMethod] = useState('');
  const [isOpenModalOtp, setIsOpenModalOtp] = useState<boolean>(false);
  const [newIs2FAEnabled, setNewIs2FAEnabled] = useState<boolean>(false);
  const [isOpenModalVerified, setIsOpenModalVerified] = useState<boolean>(false);
  const isDisableUpdate = !!(JSON.stringify(method) === JSON.stringify(twoFaMethod));

  const { mutate: mutateUpdateTwoFactor } = useMutation('updateTwoFactor', updateTwoFactor, {
    onSuccess: () => {
      if (state?.user?.is2FAEnabled === 0) {
        setIsOpenModalVerified(true);
        setState({ ...state, user: { ...state.user, is2FAEnabled: 1, '2FAMethod': method } });
      }
      setIsOpenTwoFA(false);
    },
  });

  const onChange = (e: RadioChangeEvent) => {
    const value = e.target.value;
    setMethod(value);
    if (value === TwoFAMethod.OFF) {
      setNewIs2FAEnabled(false);
    } else {
      setNewIs2FAEnabled(true);
    }
  };

  const handleUpdateTwoFactor = () => {
    setTimeLeft(120);
    mutateUpdateTwoFactor({
      new2FAMethod: method !== TwoFAMethod.OFF ? method : state?.user?.['2FAMethod'],
      newIs2FAEnabled,
    });
  };

  const onSubmit = () => {
    if (!isDisableUpdate) {
      if (state?.user?.is2FAEnabled === 0) {
        mutateUpdateTwoFactor({ new2FAMethod: method, newIs2FAEnabled });
        return;
      }
      setIsOpenModalOtp(true);
      setIsOpenTwoFA(false);
      handleUpdateTwoFactor();
    }
  };

  useEffect(() => {
    if (!timeLeft) {
      return;
    }
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  useEffect(() => {
    if (state?.user?.is2FAEnabled === 0) {
      setMethod(TwoFAMethod.OFF);
      setTwoFaMethod(TwoFAMethod.OFF);
    } else {
      setMethod(state?.user?.['2FAMethod']);
      setTwoFaMethod(state?.user?.['2FAMethod']);
    }
  }, [state?.user?.is2FAEnabled, state?.user?.['2FAMethod']]);

  const renderModalSendOtp = useCallback(() => {
    return (
      <ModalEnterOtp
        newIs2FAEnabled={newIs2FAEnabled}
        setIsOpenModalVerified={setIsOpenModalVerified}
        isOpen={isOpenModalOtp}
        onCancel={() => setIsOpenModalOtp(false)}
        method={method}
        setMethod={setMethod}
        timeLeft={timeLeft}
        handleResend={handleUpdateTwoFactor}
      />
    );
  }, [isOpenModalOtp, setIsOpenModalOtp, newIs2FAEnabled, timeLeft]);

  return (
    <>
      <ModalCustom
        okText="Update 2FA Method"
        onSubmit={onSubmit}
        visible={isOpen}
        disabledSubmit={isDisableUpdate}
        onCancel={onCancel}
        onUnSubmitted={() => {
          if (state?.user?.is2FAEnabled === 0) {
            setMethod(TwoFAMethod.OFF);
          } else {
            setMethod(state?.user?.['2FAMethod']);
          }
        }}
        title="Two Factor Authentication (2FA) Methods"
      >
        <div>
          <p className="font-fontFamily text-sm leading-5 text-main-font-color text-left">
            Please select your preferred method to receive the two-factor authentication code.
          </p>
          <Radio.Group className="font-fontFamily" onChange={onChange} value={method}>
            <Space direction="vertical">
              <Radio value={TwoFAMethod.SMS}>SMS</Radio>
              <Radio value={TwoFAMethod.EMAIL}>Email</Radio>
              <Radio value={TwoFAMethod.APP} disabled>
                App
              </Radio>
              <Radio value={TwoFAMethod.OFF}>Off 2FA</Radio>
            </Space>
          </Radio.Group>
        </div>
      </ModalCustom>
      {renderModalSendOtp()}
      <ModalUpdatedEmail
        onCancel={() => setIsOpenModalVerified(false)}
        visible={isOpenModalVerified}
        message="Successfully update the 2FA method"
      />
    </>
  );
};

export default ModalUpdateTwoFA;
