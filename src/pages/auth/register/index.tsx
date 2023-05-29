import { Button, Checkbox, DatePicker, Form, Input, notification, Select } from 'antd';
import { RuleObject } from 'antd/lib/form';
import { BaseOptionType, DefaultOptionType } from 'antd/lib/select';
import { uploadAvatarRegister } from 'api/student';
import { getFileUrl, signup } from 'api/user';
import BackToLogin from 'components/BackToLogin';
import CropUploadFile from 'components/CropUploadFile';
import HeaderLogin from 'components/HeaderLogin';
import CustomInput from 'components/Input';
import { config } from 'config';
import {
  DATE_FORMAT,
  DATE_FORMAT_TWO,
  ERROR_MESSAGE,
  FIELDS,
  IFieldListForm,
  REGEX_EMAIL,
  REGEX_LOGIN_ID,
  REGEX_NUMBER,
  REGEX_PASSWORD,
} from 'constants/index';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Area } from 'react-easy-crop';
import ReCAPTCHA from 'react-google-recaptcha';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

interface IData {
  salutation: string;
  firstName: string;
  lastName: string;
  ICNumber: string;
  gender: string;
  mobileCountryCode: string;
  contactNumber: string;
  dateOfBirth: string;
  nationality: string;
  address1: string;
  address2: string;
  country: string;
  postalCode: string;
  profilePhotoDestination: string;
  email: string;
  username: string;
  password: string;
}

export const codesPhoneNumber = [
  { iso_code: 'SG', code: '65' },
  { iso_code: 'MY', code: '60' },
];

const Register = () => {
  const [form] = Form.useForm();
  const history = useNavigate();
  const reCaptchaRef = useRef(null);

  const username = Form.useWatch('username', form);
  const email = Form.useWatch('email', form);
  const password = Form.useWatch('password', form);
  const confirmPassword = Form.useWatch('confirm', form);
  const firstName = Form.useWatch('firstName', form);
  const lastName = Form.useWatch('lastName', form);
  const contactNumber = Form.useWatch('contactNumber', form);
  const salutation = Form.useWatch('salutation', form);
  const dateOfBirth = Form.useWatch('dateOfBirth', form);
  const reCaptcha = Form.useWatch('reCaptcha', form);
  const agree = Form.useWatch('agree', form);
  const mobileCountryCode = Form.useWatch('mobileCountryCode', form);
  const [profilePhotoDestination, setProfilePhotoDestination] = useState('');
  const [filePath, setFilePath] = useState<string>('');

  const fields = useMemo(
    () => [
      {
        label: 'Student’s Name',
        name: 'studentName',
        type: 'groupName',
        nameChild: ['firstName', 'lastName'],
        rules: [{ required: true, message: '' }],
      },
      {
        label: 'Email Address',
        name: 'email',
        type: 'string',
        rules: [
          {
            validator(_: RuleObject, value: string) {
              const regex = new RegExp(REGEX_EMAIL);
              if (regex.test(value)) {
                return Promise.resolve();
              }
              return Promise.reject(ERROR_MESSAGE.EMAIL);
            },
          },
          { required: true, message: 'Email address is required!' },
        ],
      },
      {
        label: 'Login ID',
        name: 'username',
        type: 'string',
        rules: [
          {
            validator(_: RuleObject, value: string) {
              const regex = new RegExp(REGEX_LOGIN_ID);
              if (regex.test(value)) {
                return Promise.resolve();
              }
              return Promise.reject(ERROR_MESSAGE.LOGIN_ID);
            },
          },
          {
            min: 8,
            message: 'Login ID should consist of at least 8 characters',
          },
          { required: true, message: 'Login ID is required!' },
        ],
      },
      {
        label: 'IC Number',
        name: 'ICNumber',
        type: 'string',
        rules: [
          { required: true, message: 'IC Number is required!' },
          {
            min: 5,
            message: 'IC Number should consist of at least 5 characters',
          },
        ],
      },
      {
        label: 'Gender',
        name: 'gender',
        type: 'select',
        options: [
          { label: 'Male', value: 'Male' },
          { label: 'Female', value: 'Female' },
        ],
      },
      {
        label: 'Salutation',
        name: 'salutation',
        type: 'select',
        options: [
          { label: 'Mr', value: 'mr' },
          { label: 'Ms', value: 'ms' },
        ],
      },
      {
        label: 'Contact Number',
        name: 'phoneNumber',
        nameChild: ['mobileCountryCode', 'contactNumber'],
        type: 'phoneNumber',
        options: codesPhoneNumber.map((item) => {
          return { label: `+ ${item.code}`, value: item.code.toString() };
        }),
        rules: [{ required: true, message: '' }],
      },
      {
        label: 'Date Of Birth',
        name: 'dateOfBirth',
        type: 'date',
        rules: [{ required: true, message: 'Date Of Birth is required!' }],
      },
      {
        label: 'Nationality',
        name: 'nationality',
        type: 'string',
        rules: [{ required: true, message: 'Nationality is required!' }],
      },
      {
        label: 'Country',
        name: 'country',
        type: 'select',
        options: [{ label: 'Singapore', value: 'Singapore' }],
        rules: [{ required: true, message: 'Country is required!' }],
      },
      {
        label: 'Address line 1',
        name: 'address1',
        type: 'string',
        rules: [{ required: true, message: 'Address is required!' }],
      },
      {
        label: 'Address line 2',
        name: 'address2',
        type: 'string',
      },
      {
        label: 'Postal Code',
        name: 'postalCode',
        type: 'string',
        rules: [
          {
            validator(_: RuleObject, value: string) {
              const regex = new RegExp(REGEX_NUMBER);
              if (regex.test(value)) {
                return Promise.resolve();
              }
              return Promise.reject(ERROR_MESSAGE.POSTAL_CODE);
            },
          },
          { required: true, message: 'Postal Code is required!' },
        ],
        isFullWidth: true,
      },
      {
        label: '',
        name: '',
        type: '',
        classNameCustom: 'isHide'
      },
      {
        label: 'Password',
        name: 'password',
        type: 'password',
        rules: [
          {
            min: 8,
            message: 'Password should consist of at least 8 characters',
          },
          { required: true, message: 'Password is required!' },
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
        label: 'Confirm Password',
        name: 'confirmPassword',
        type: 'password',
        dependencies: ['password'],
        rules: [
          ({ getFieldValue }: any) => ({
            validator(_: RuleObject, value: string) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Password and confirm password does not match'));
            },
          }),
        ],
      },
    ],
    [],
  );

  const renderField = useCallback(
    (field: IFieldListForm) => {
      switch (field.type) {
        case FIELDS.STRING:
          return <CustomInput type={field.type} />;
        case FIELDS.NUMBER:
          return <CustomInput type={field.type} />;
        case FIELDS.DATE:
          return <DatePicker inputReadOnly format={DATE_FORMAT} className="style_input_custom_login_page" />;
        case FIELDS.GROUP_NAME:
          return (
            <div className="flex gap-x-3">
              <Form.Item
                noStyle
                rules={[{ required: true, message: 'First Name is required!' }]}
                name={field.nameChild ? field.nameChild[0] : ''}
              >
                <CustomInput placeholder="First Name" type="string" />
              </Form.Item>
              <Form.Item
                noStyle
                rules={[{ required: true, message: 'Last Name is required!' }]}
                name={field.nameChild ? field.nameChild[1] : ''}
              >
                <CustomInput placeholder="Last Name" type="string" />
              </Form.Item>
            </div>
          );
        case FIELDS.SELECT:
          return (
            <Select
              getPopupContainer={(node) => node}
              options={field.options as (BaseOptionType | DefaultOptionType)[]}
            />
          );
        case FIELDS.PHONE_NUMBER:
          return (
            <Input.Group compact>
              <Form.Item
                noStyle
                name={field?.nameChild ? field?.nameChild[0] : ('' as string)}
                rules={[{ required: true, message: 'Prefix is required!' }]}
              >
                <Select
                  options={field.options}
                  getPopupContainer={(node) => node}
                  className="w-[25%]"
                />
              </Form.Item>
              <Form.Item
                noStyle
                name={field?.nameChild ? field?.nameChild[1] : ('' as string)}
                rules={[
                  { required: true, message: 'Contact Number is required!' },
                  {
                    validator(_: RuleObject, value: string) {
                      const regex = new RegExp(REGEX_NUMBER);
                      if (regex.test(value)) {
                        return Promise.resolve();
                      }
                      if (value) return Promise.reject(ERROR_MESSAGE.CONTACT_NUMBER);
                    },
                  },
                  {
                    min: 8,
                    message: 'Contact Number should consist of 8 characters',
                  },
                  {
                    max: 8,
                    message: 'Contact Number should consist of 8 characters',
                  },
                ]}
              >
                <Input className="style_input_custom_login_page w-[75%] rounded-r-2xl" />
              </Form.Item>
            </Input.Group>
          );
        case '':
          return <div className=""></div>;
        default:
          return <CustomInput type={field.type} />;
      }
    },
    [DATE_FORMAT],
  );

  const renderFieldList = useCallback(() => {
    return fields?.map((field, index) => (
      <Form.Item
        className={field.classNameCustom ? `w-full sm:w-full lg:w-[48%] custom-width` + ` ${field.classNameCustom}` : `w-full sm:w-full lg:w-[48%] custom-width`}
        key={index}
        validateFirst
        name={field.name}
        label={field.label}
        rules={field.rules}
      >
        {renderField(field)}
      </Form.Item>
    ));
  }, [fields]);

  const renderError = useCallback((error: string) => {
    if (error.toString().toLowerCase().includes('password')) {
      form.setFields([{ name: 'password', errors: [error] }]);
    } else if (error.toString().toLowerCase().includes('username')) {
      form.setFields([{ name: 'username', errors: [error] }]);
    } else if (error.toString().toLowerCase().includes('contact')) {
      form.setFields([{ name: 'contactNumber', errors: [error] }]);
    } else if (error.toString().toLowerCase().includes('email')) {
      form.setFields([{ name: 'email', errors: [error] }]);
    } else {
      notification.error({ message: error });
    }
  }, []);

  const { mutate, isLoading } = useMutation('signup', signup, {
    onSuccess: () => {
      history('/verify-register', {
        state: {
          username: username,
          email: email,
          password: password,
          userProfile: {
            firstName: firstName,
            lastName: lastName,
            mobileCountryCode: mobileCountryCode,
            contactNumber: contactNumber,
            salutation: salutation,
            gender: salutation === 'MR' ? 'Male' : 'Female',
            languageID: 1,
            dateOfBirth: moment(dateOfBirth).format('YYYY-MM-DD'),
          },
        },
      });
    },
    onError: (error: Array<string> | string) => {
      if (Array.isArray(error)) {
        error.map((item) => {
          renderError(item);
        });
      } else {
        renderError(error);
      }
    },
  });

  const onFinish = (data: IData) => {
    const dataSubmit = {
      username: data.username,
      email: data.email,
      password: data.password,
      userProfile: {
        salutation: data.salutation,
        firstName: data.firstName,
        lastName: data.lastName,
        ICNumber: data.ICNumber,
        gender: data.gender,
        mobileCountryCode: data.mobileCountryCode,
        contactNumber: data.contactNumber,
        dateOfBirth: moment(data.dateOfBirth).format(DATE_FORMAT_TWO),
        nationality: data.nationality,
        address1: data.address1,
        address2: data.address2,
        country: data.country,
        postalCode: data.postalCode,
        profilePhotoDestination: filePath,
        languageID: 1,
      },
    };
    mutate(dataSubmit);
  };

  const isDisable = useMemo(() => {
    if (!reCaptcha || !agree) {
      return true;
    }
    return false;
  }, [reCaptcha, agree]);

  // const isDisable = useMemo(() => {
  //   if (
  //     !username ||
  //     !email ||
  //     !password ||
  //     !firstName ||
  //     !lastName ||
  //     !contactNumber ||
  //     !salutation ||
  //     !dateOfBirth ||
  //     !reCaptcha ||
  //     !agree ||
  //     !confirmPassword ||
  //     !mobileCountryCode
  //   ) {
  //     return true;
  //   }
  //   return false;
  // }, [
  //   username,
  //   email,
  //   password,
  //   firstName,
  //   lastName,
  //   contactNumber,
  //   salutation,
  //   dateOfBirth,
  //   reCaptcha,
  //   agree,
  //   confirmPassword,
  //   mobileCountryCode,
  // ]);

  const renderReCaptcha = useCallback(() => {
    return (
      <ReCAPTCHA
        className="google-recaptcha"
        theme="light"
        ref={reCaptchaRef}
        sitekey={config.CAPTCHA_KEY || ''}
      />
    );
  }, [reCaptchaRef, config]);

  const { mutate: mutateUploadAvatarRegister } = useMutation(
    'uploadAvatarRegister',
    uploadAvatarRegister,
    {
      onSuccess: ({ data }: { data: { filePath: string; fileUrl: string } }) => {
        setProfilePhotoDestination(data.fileUrl);
        setFilePath(data.filePath);
      },
      onError: ({ response }: { response: { data: { message: string } } }) => {
        notification.error({ message: response.data.message });
      },
    },
  );

  const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>, croppedAreaPixels: Area) => {
    if (event && event.target.files && event.target.files[0]) {
      const imgUrl = event.target.files[0];
      const formData = new FormData();
      formData.append('file', imgUrl);
      formData.append('width', croppedAreaPixels.width.toString());
      formData.append('height', croppedAreaPixels.height.toString());
      formData.append('x', croppedAreaPixels.x.toString());
      formData.append('y', croppedAreaPixels.y.toString());
      mutateUploadAvatarRegister({ formData });
    }
  };

  useEffect(() => {
    form.setFieldsValue({ phoneNumber: contactNumber });
  }, [contactNumber]);

  return (
    <>
      <HeaderLogin title="New Student Account" />
      <div className="flex gap-x-4 display-none">
        <Form
          form={form}
          layout="vertical"
          className="flex flex-wrap gap-x-4 flex-[62%]"
          name="basic"
          initialValues={{ remember: true, mobileCountryCode: '65' }}
          autoComplete="off"
          onFinish={onFinish}
        >
          {renderFieldList()}
          <Form.Item name="agree" valuePropName="checked" noStyle>
            <Checkbox className="text-main-font-color">
              I agree with the Terms and Conditions
            </Checkbox>
          </Form.Item>

          <div className="flex justify-center items-center mt-4 w-full">
            <Form.Item name="reCaptcha">{renderReCaptcha()}</Form.Item>
          </div>
        </Form>
        <CropUploadFile
          isEdit={true}
          avatarUrl={profilePhotoDestination}
          onChangeFile={onChangeFile}
        />
      </div>

      <Form.Item className="w-full">
        <Button
          onClick={() => {
            form.submit();
          }}
          className={`styte_button_primary_login_page ${isDisable && 'text-white'}`}
          size="large"
          loading={isLoading}
          disabled={isDisable}
        >
          Register
        </Button>
      </Form.Item>
      <BackToLogin text="Back" />
    </>
  );
};

export default Register;
