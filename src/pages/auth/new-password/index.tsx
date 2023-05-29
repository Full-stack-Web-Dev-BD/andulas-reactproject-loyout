import { Button, Form, Input } from 'antd';
import { changePasswordFirstLogin } from 'api/admin';
import { newPassword } from 'api/user';
import ButtonCustom from 'components/Button';
import HeaderLogin from 'components/HeaderLogin';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import { ERROR_MESSAGE, REGEX_PASSWORD, ROUTES } from 'constants/index';
import React, { useMemo } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

interface IState {
  isFirstLogin: boolean;
  isChangePasswordTeacher?: boolean;
}

const CreateNewPassword = () => {
  const history = useNavigate();
  const location = useLocation();   
  const state = location.state as IState;
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const passwordValue = Form.useWatch('password', form);
  const confirmPasswordValue = Form.useWatch('confirm', form);
  const oldPasswordValue = Form.useWatch('oldPassword', form);

  const { mutate, isLoading } = useMutation('updatePassword', newPassword, {
    onSuccess: (data) => {
      if (data?.isSuccess) {
        history('/password-update');
      }
    },
    onError: () => {
      form.setFields([
        { name: 'password', errors: ['The change password link is incorrect or expired!'] },
        { name: 'confirm', errors: [''] },
      ]);
    },
  });

  const { mutate: updatePasswordAdminAccount, isLoading: isUpdatePassword } = useMutation(
    'changePasswordFirstLogin',
    changePasswordFirstLogin,
    {
      onSuccess: () => {
        if (state?.isChangePasswordTeacher) {
          history(ROUTES.profile_teacher_login_first_time);
          return;
        }
        history(ROUTES.profile_admin_login_first_time);
      },
      onError: ({ response }) => {
        form.setFields([{ name: 'oldPassword', errors: [response.data.message] }]);
      },
    },
  );

  const onFinish = ({ password, oldPassword }: { password: string; oldPassword: string }) => {
    if (state?.isFirstLogin) {
      updatePasswordAdminAccount({ oldPassword, newPassword: password });
      return;
    }
    mutate({ token: searchParams?.get('token'), password });
  };

  const isDisable = useMemo(() => {
    if (!passwordValue || !confirmPasswordValue || (!oldPasswordValue && state?.isFirstLogin)) {
      return true;
    }
    return false;
  }, [passwordValue, confirmPasswordValue, oldPasswordValue, state?.isFirstLogin]);

  const handleBackToLogin = () => {
    sessionStorage.clear();
    localStorage.clear();
    history(ROUTES.login);
  };

  return (
    <>
      <HeaderLogin title="Create new password" />
      <Form
        form={form}
        className="w-full"
        name="basic"
        initialValues={{ remember: true }}
        autoComplete="off"
        onFinish={onFinish}
        layout="vertical"
      >
        {state?.isFirstLogin && (
          <Form.Item
            label="Current Password"
            validateFirst
            name="oldPassword"
            rules={[
              {
                required: true,
                message: 'Current password is required',
              },
            ]}
          >
            <CustomInput type="password" />
          </Form.Item>
        )}
        <Form.Item
          name="password"
          validateFirst
          label="New Password"
          rules={[
            {
              required: true,
              message: 'New password is required',
            },
            {
              min: 8,
              message: 'Password should consist of at least 8 characters',
            },
            {
              validator(_, value) {
                const regex = new RegExp(REGEX_PASSWORD);
                if (regex.test(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(ERROR_MESSAGE.PASSWORD);
              },
            },
          ]}
          hasFeedback
        >
          <Input.Password className="style_input_custom_login_page" />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Confirm New Password"
          dependencies={['password']}
          hasFeedback
          validateFirst
          rules={[
            {
              required: true,
              message: 'Confirm password is required',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('New password and confirm password does not match '),
                );
              },
            }),
          ]}
        >
          <Input.Password className="style_input_custom_login_page" />
        </Form.Item>

        <Form.Item className="w-full">
          <Button
            loading={isLoading || isUpdatePassword}
            htmlType="submit"
            className={`styte_button_primary_login_page ${isDisable && 'text-white'} mb-3`}
            size="large"
            disabled={isDisable}
          >
            Confirm
          </Button>
          {state?.isFirstLogin && (
            <ModalCustom
              onSubmit={handleBackToLogin}
              title="Notice"
              titleCenter
              cancelText="Cancel"
              okText="Confirm"
              content="Are you sure want to leave update profile to back to the Login page?"
              viewComponent={
                <ButtonCustom fullWidth color="outline">
                  Back to login
                </ButtonCustom>
              }
            />
          )}
        </Form.Item>
      </Form>
    </>
  );
};

export default CreateNewPassword;
