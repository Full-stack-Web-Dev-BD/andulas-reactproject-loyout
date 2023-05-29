import { Breadcrumb, Form, Input, Layout } from 'antd';
import { RuleObject } from 'antd/lib/form';
import { Content } from 'antd/lib/layout/layout';
import { changePasswordFirstLogin } from 'api/admin';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import usePrompt from 'constants/function';
import { CLASS_NAME_FIELD, ERROR_MESSAGE, REGEX_PASSWORD, ROUTES, WARNING_MESSAGE } from 'constants/index';
import { useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

const ProfileChangePassword = () => {
  const [formChangePassword] = Form.useForm();
  const history = useNavigate();
  const [isChanging, setIsChanging] = useState<boolean>(false);
  const [isOpenConfirmCancelEditProfile, setIsOpenConfirmCancelEditProfile] = useState<boolean>(false);

  const { mutate: updatePassword, isLoading } = useMutation(
    'changePassword',
    changePasswordFirstLogin,
    {
      onSuccess: () => {
        history(ROUTES.profile_me);
      },
      onError: ({ response }) => {
        formChangePassword.setFields([{ name: 'oldPassword', errors: [response.data.message] }]);
      },
    },
  );

  const fieldListChangePassword = [
    {
      label: 'Old Password',
      name: 'oldPassword',
      type: 'password',
      rules: [{ required: true, message: 'Please input your Old Password!' }],
    },
    {
      label: 'New Password',
      name: 'password',
      type: 'password',
      rules: [
        { required: true, message: 'Please input your New Password!' },
        {
          min: 8,
          message: 'Password should consist of at least 8 characters',
        },
        {
          validator(_: RuleObject, value: string) {
            const regex = new RegExp(REGEX_PASSWORD);
            if (regex.test(value)) {
              return Promise.resolve();
            }
            return Promise.reject(ERROR_MESSAGE.PASSWORD);
          },
        },
      ],
    },
    {
      label: 'Confirm New Password',
      name: 'confirmPassword',
      type: 'password',
      dependencies: ['password'],
      rules: [
        { required: true, message: 'Please input your Confirm New Password!' },
        ({ getFieldValue }: any) => ({
          validator(_: RuleObject, value: string) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('New password and confirm password does not match '));
          },
        }),
      ],
    },
  ];

  usePrompt(WARNING_MESSAGE.LEAVE_PROFILE_CHANGE_PASSWORD, isChanging);

  const handleCancelChangePassword = () => {
    if (isChanging) {
      setIsOpenConfirmCancelEditProfile(true);
      setIsChanging(false);
      
      return;
    }
    history(ROUTES.profile_me);
  };
  
  const handleConfirmCancelEditProfile = () => {
    history(ROUTES.profile_me);
  }

  const handleChangePassword = ({ password, oldPassword }: { password: string; oldPassword: string }) => {
    setIsChanging(false);
    updatePassword({ oldPassword, newPassword: password });
  };

  return (
    <Layout className="bg-transparent">
      <Breadcrumb className="text-[28px] text-main-font-color font-bold font-fontFamily leading-9">
        <Breadcrumb.Item onClick={() => history(ROUTES.profile_me)} className={'!opacity-50 cursor-pointer'}>My Profile</Breadcrumb.Item>
        <Breadcrumb.Item className="text-main-font-color font-fontFamily">
          Change Password
        </Breadcrumb.Item>
      </Breadcrumb>

      <Content className="mt-8 p-8 bg-white sm:w-full md:w-full lg:w-full xl:w-1/2 2xl-w-1/2 rounded-3xl shadow[#0000000a]">
        <Form
          autoComplete="off"
          form={formChangePassword}
          layout="vertical"
          colon={false}
          onFieldsChange={() => {
            setIsChanging(true);
          }}
          onFinish={handleChangePassword}
        >
          {fieldListChangePassword?.length > 0 &&
            fieldListChangePassword.map((field, index) => (
              <Form.Item
                rules={field.rules}
                label={field.label}
                key={index}
                name={field.name}
                dependencies={field?.dependencies}
                validateFirst
              >
                <Input.Password className={CLASS_NAME_FIELD} />
              </Form.Item>
            ))}
          <Form.Item>
            <div className="flex gap-4 justify-end mt-1 flex-wrap display-center">
              <ButtonCustom color="outline" onClick={handleCancelChangePassword}>
                Cancel
              </ButtonCustom>
              <ButtonCustom isLoading={isLoading} color="orange" htmlType="submit">
                Confirm
              </ButtonCustom>
            </div>
          </Form.Item>
        </Form>
      </Content>
      {isOpenConfirmCancelEditProfile && (
        <ModalCustom
          title="Notice"
          visible={true}
          onSubmit={handleConfirmCancelEditProfile}
          onCancel={() => setIsOpenConfirmCancelEditProfile(false)}
          titleCenter
          content={WARNING_MESSAGE.LEAVE_PROFILE_CHANGE_PASSWORD}
          okText="Confirm"
          cancelText="Cancel"
        />
      )}
    </Layout>
  );
};

export default ProfileChangePassword;
