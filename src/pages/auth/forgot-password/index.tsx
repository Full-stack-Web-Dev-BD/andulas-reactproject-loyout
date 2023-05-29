import { Button, Form, Input, Select } from 'antd';
import { sendOtp } from 'api/user';
import BackToLogin from 'components/BackToLogin';
import HeaderLogin from 'components/HeaderLogin';
import { ACTION_TYPE, TwoFAMethod } from 'constants/constants';
import React, { useMemo } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

const ForgoPassword = () => {
  const history = useNavigate();
  const [form] = Form.useForm();
  const methodValue = Form.useWatch('method', form);
  const usernameValue = Form.useWatch('username', form);
  const { mutate, isLoading } = useMutation('forgot', sendOtp, {
    onSuccess: (data) => {
      if (data?.isSuccess) {
        history(methodValue !== TwoFAMethod.EMAIL ? '/two-factor-forgot-password' : '/email-sent', {
          state: {
            actionType: ACTION_TYPE.FORGOT_PASSWORD,
            twoFactorAuthenticationMethod: form.getFieldValue('method'),
            usernameOrEmail: form.getFieldValue('username'),
            successUrl: `${window.location.origin}/create-new-password`,
            failureUrl: `${window.location.origin}/forgot-password`,
          },
        });
      }
    },
    onError: () => {
      form.setFields([
        { name: 'username', errors: ['Invalid Login ID or email. Please try again. '] },
        { name: 'method', errors: [''] },
      ]);
    },
  });

  const onFinish = ({ username, method }: { username: string; method: string }) => {
    mutate({
      actionType: ACTION_TYPE.FORGOT_PASSWORD,
      twoFactorAuthenticationMethod: method,
      usernameOrEmail: username,
      successUrl: `${window.location.origin}/create-new-password`,
      failureUrl: `${window.location.origin}/forgot-failed`,
    });
  };

  const isDisable = useMemo(() => {
    if (!usernameValue || !methodValue) {
      return true;
    }
    return false;
  }, [usernameValue, methodValue]);

  return (
    <>
      <HeaderLogin title="Forgot Password" />
      <span className="font-normal text-center text-sm mb-2">
        Please enter your registered ID and 2FA method to reset password.
      </span>
      <Form
        className="w-full"
        name="basic"
        initialValues={{ remember: true }}
        autoComplete="off"
        onFinish={onFinish}
        form={form}
      >
        <span className="label_custom_login_page">ID or Email :</span>
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'ID or Email is required!' }]}
        >
          <Input placeholder="Username/email" className="style_input_custom_login_page" />
        </Form.Item>

        <span className="label_custom_login_page">2FA Method:</span>
        <Form.Item name="method" rules={[{ required: true, message: '2FA Method is required!' }]}>
          <Select
            placeholder="Please select"
            allowClear
            className="text-[#32302D] font-fontFamily text-sm"
          >
            <Select.Option value={TwoFAMethod.SMS}>SMS</Select.Option>
            <Select.Option value={TwoFAMethod.EMAIL}>Email</Select.Option>
            <Select.Option value={TwoFAMethod.APP}>App</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item className="w-full">
          <Button
            loading={isLoading}
            htmlType="submit"
            className={`styte_button_primary ${isDisable && 'text-white'}`}
            size="large"
            disabled={isDisable}
          >
            Submit
          </Button>
          <BackToLogin text="Back" />
        </Form.Item>
      </Form>
    </>
  );
};

export default ForgoPassword;
