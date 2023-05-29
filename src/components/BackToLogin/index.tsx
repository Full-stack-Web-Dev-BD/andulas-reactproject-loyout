import { Button } from 'antd';
import React from 'react';

interface IBackToLogin {
  text?: string;
  url?: string;
}

const BackToLogin = (props: IBackToLogin) => {
  const { text, url } = props;

  return (
    <Button
      onClick={() => {
        window.location.href = url || '/login';
      }}
      className="styte_button_outline"
      size="large"
    >
      {text}
    </Button>
  );
};

export default BackToLogin;
