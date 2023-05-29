import { Button, Checkbox, Form, Input } from 'antd';
import { login, sendOtp } from 'api/user';
import { ReactComponent as GoogleSVG } from 'assets/icons/google_icon.svg';
import { ReactComponent as OfficeSVG } from 'assets/icons/office_icon.svg';
import HeaderLogin from 'components/HeaderLogin';
import { config } from 'config';
import React, { useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useMutation } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { ACTION_TYPE } from '../../../constants';
import './style.css';

const Login = () => {
  const search = useLocation().search;
  const token = new URLSearchParams(search).get('token');
  const isRemember = localStorage.getItem('isRemember');
  const history = useNavigate();
  const [form] = Form.useForm();
  const reCaptchaRef = useRef(null);
  const remember = Form.useWatch('remember', form);

  const username = Form.useWatch('username', form);

  useEffect(() => {
    // if (token === 'null') {
    //   // Show error message
    // }
    if (token) {
      if (isRemember) {
        localStorage.setItem('token', JSON.stringify(token));
      } else {
        sessionStorage.setItem('token', JSON.stringify(token));
      }
      window.location.href = '/';
    }
  }, []);

  const { mutate: sendOtpMutate } = useMutation('sendOtp', sendOtp);

  const { mutate, isLoading } = useMutation('useLogin', login, {
    onSuccess: (data) => {
      if (remember) {
        localStorage.setItem('isRemember', remember);
      }

      if (data?.data?.access_token) {
        window.location.href = '/';
        if (remember) {
          localStorage.setItem('token', JSON.stringify(data.data.access_token));
          return;
        }
        sessionStorage.setItem('token', JSON.stringify(data.data.access_token));
      } else if (data?.data?.actionType) {
        const { actionType, twoFactorAuthenticationMethod } = data.data;
        if (actionType === ACTION_TYPE.TWO_FACTOR_AUTHENTICATION) {
          sendOtpMutate({ usernameOrEmail: username, actionType, twoFactorAuthenticationMethod });
          history('/two-factor', {
            state: {
              actionType,
              twoFactorAuthenticationMethod,
              usernameOrEmail: username,
            },
          });
        }
      }
    },
    onError: (error: { response: { data: { message: string } } }) => {
      form.setFields([
        { name: 'password', errors: [error.response.data.message] },
        { name: 'username', errors: [''] },
      ]);
    },
  });

  const onFinish = async ({
    username: vUsername,
    password: vPassword,
  }: {
    username: string;
    password: string;
  }) => {
    // history('/two-factor');
    mutate({ usernameOrEmail: vUsername, password: vPassword });
  };

  return (
    <>
      <HeaderLogin title="Login" />
      <Form
        form={form}
        className="w-full"
        name="basic"
        initialValues={{ remember: true }}
        autoComplete="off"
        onFinish={onFinish}
      >
        <span className="label_custom_login_page">Login ID</span>
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Userid/email is required' }]}
        >
          <Input placeholder="Username/email" className="style_input_custom_login_page" />
        </Form.Item>

        <span className="label_custom_login_page">Password</span>
        <Form.Item name="password" rules={[{ required: true, message: 'Password is required' }]}>
          <Input.Password className="style_input_custom_login_page" />
        </Form.Item>

        <div className="flex justify-between items-center remember_pw mb-4 text-xs xl:text-sm">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox className="main-label-color">Remember me</Checkbox>
          </Form.Item>
          <span
            className="cursor-pointer text-xs xl:text-sm main-label-color"
            onClick={() => {
              history('/forgot-password');
            }}
          >
            Forgot Password?
          </span>
        </div>

        {/* <Form.Item
          name="recaptcha"
          className="w-full"
          rules={[{ required: true, message: 'Please verify recaptcha!' }]}
        >
          <ReCAPTCHA
            className="google-recaptcha"
            theme="light"
            ref={reCaptchaRef}
            sitekey={config.CAPTCHA_KEY || ''}
          />
        </Form.Item> */}

        <Form.Item className="w-full mt-3">
          <Button
            htmlType="submit"
            className="styte_button_primary_login_page"
            size="large"
            loading={isLoading}
          >
            Login
          </Button>
        </Form.Item>
      </Form>

      <span className="text-sm xl:text-base main-label-color">Or Login by</span>
      <div className="flex items-center w-full text-main-button-color my-3 xl:my-5 or-by-login login-outside">
        <button
          type="button"
          className="flex items-center justify-center w-full border-main-button-color text-main-button-color border font-semibold bg-white h-14 rounded-2xl text-sm xl:text-base mr-2 cursor-pointer"
        >
          {/* <img src={GoogleSVG} alt="Google" className="pr-2" /> */}
          <GoogleSVG className="mr-2" />
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center text-main-button-color w-full border-[color:var(--main-button-color)] border font-semibold bg-white h-14 rounded-2xl text-sm xl:text-base ml-2 cursor-pointer"
        >
          {/* <img src={OfficeSVG} alt="Google" className="pr-2" /> */}
          <OfficeSVG className="mr-2" />
          365
        </button>
      </div>
      <span
        className="text-main-button-color text-xxs xl:text-xs uppercase font-bold cursor-pointer"
        onClick={() => {
          window.location.href = '/register';
        }}
      >
        Create new student account
      </span>
    </>
  );
};

export default Login;
