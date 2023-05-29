import React, { useEffect, useState } from 'react';
import VerificationInput, { VerificationInputProps } from 'react-verification-input';

const AuthCode = (props: VerificationInputProps | any) => {
  const {
    isClearValue,
    removeDefaultStyles,
    validChars,
    placeholder,
    classNames,
    inputProps,
    ref,
  } = props;
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isClearValue) {
      setValue('');
    }
  }, [isClearValue]);

  return (
    <VerificationInput
      ref={ref}
      removeDefaultStyles={removeDefaultStyles}
      validChars={validChars}
      placeholder={placeholder}
      classNames={classNames}
      inputProps={inputProps}
      onChange={(val) => setValue(val)}
      value={value}
    />
  );
};

export default AuthCode;
