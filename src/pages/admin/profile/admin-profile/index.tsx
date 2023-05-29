import { Breadcrumb, DatePicker, Form, Input, Layout, notification, Select } from 'antd';
import { RuleObject } from 'antd/lib/form';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType, DefaultOptionType } from 'antd/lib/select';
import { IAminProfile, updateCentreAdminProfileFirstLogin } from 'api/admin';
import { updateTeacherProfileFirstLogin } from 'api/teacher';
import { getFileUrl, uploadAvatar } from 'api/user';
import ButtonCustom from 'components/Button';
import CropUploadFile from 'components/CropUploadFile';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import {
  DATE_FORMAT_TWO,
  ERROR_MESSAGE,
  FIELDS,
  IFieldListForm,
  REGEX_LOGIN_ID,
  REGEX_NUMBER,
  ROUTES,
} from 'constants/index';
import { AppContext } from 'context';
import moment from 'moment';
import { codesPhoneNumber } from 'pages/auth/register';
import { useContext, useEffect, useState } from 'react';
import { Area } from 'react-easy-crop';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

const fieldsValidation = [
  { key: 'email', fieldName: 'email' },
  { key: 'Username', fieldName: 'username' },
  { key: 'username', fieldName: 'username' },
  { key: 'ICNumber', fieldName: 'ICNumber' },
  { key: 'This number is already', fieldName: 'contactNumber' },
];

const AdminProfile = () => {
  const [form] = Form.useForm();
  const history = useNavigate();
  const [stateContext]: any = useContext(AppContext);
  const userInfo = stateContext?.user;
  const [dataRequest, setDataRequest] = useState({});
  const [filePath, setFilePath] = useState<string>('');
  const [profilePhotoDestination, setProfilePhotoDestination] = useState('');
  const [isOpenConfirmUpdate, setIsOpenConfirmUpdate] = useState(false);
  const contactNumber = Form.useWatch('contactNumber', form);
  const firstName = Form.useWatch('firstName', form);
  const lastName = Form.useWatch('lastName', form);
  const isTeacher = userInfo?.teacher;

  const { mutate: updateProfile } = useMutation(
    isTeacher ? 'updateTeacherProfile' : 'updateAdminProfile',
    isTeacher ? updateTeacherProfileFirstLogin : updateCentreAdminProfileFirstLogin,
    {
      onSuccess: () => {
        window.location.href = '/';
      },
      onError: ({ response }) => {
        if (Array.isArray(response.data.message)) {
          response.data.message.map((error: string) => {
            fieldsValidation.map((field: { key: string; fieldName: string }) => {
              if (error.includes(field.key)) {
                form.setFields([{ name: field.fieldName, errors: [error] }]);
                return;
              }
              if (error.includes('empty')) {
                notification.error({ message: "The picture shouldn't be empty." });
              }
            });
          });
          return;
        }

        let isErrorValid = false;
        fieldsValidation.map((field: { key: string; fieldName: string }) => {
          if (response.data.message.includes(field.key)) {
            form.setFields([{ name: field.fieldName, errors: [response.data.message] }]);
            isErrorValid = true;
            return;
          }
        });

        if (!isErrorValid) {
          notification.error({ message: response.data.message });
        }
      },
    },
  );

  const { mutate: getAvatar } = useMutation('getFileUrl', getFileUrl, {
    onSuccess: ({ data }: { data: { fileUrl: string } }) => {
      setProfilePhotoDestination(data.fileUrl);
    },
    onError: ({ response }: { response: { data: { message: string } } }) => {
      notification.error({ message: response.data.message });
    },
  });

  const { mutate: uploadAvatarProfile } = useMutation('uploadAvatar', uploadAvatar, {
    onSuccess: ({ data }: { data: { filePath: string } }) => {
      getAvatar(data.filePath);
      setFilePath(data.filePath);
    },
    onError: ({ response }: { response: { data: { message: string } } }) => {
      notification.error({ message: response.data.message });
    },
  });

  useEffect(() => {
    if (contactNumber) {
      form.setFieldsValue({ phoneNumber: contactNumber });
    }
  }, [contactNumber]);

  const fieldList = [
    {
      label: isTeacher ? 'Teacher Name': 'Admin Name',
      name: 'adminName',
      type: 'groupName',
      nameChild: ['firstName', 'lastName'],
      rules: [{ required: true, message: '' }],
    },
    {
      label: 'Login ID',
      name: 'username',
      type: 'string',
      rules: [
        { required: true, message: 'Login ID is required!' },
        {
          min: 8,
          message: 'Login ID should consist of at least 8 characters',
        },
        {
          validator(_: RuleObject, value: string) {
            const regex = new RegExp(REGEX_LOGIN_ID);
            if (regex.test(value)) {
              return Promise.resolve();
            }
            return Promise.reject(ERROR_MESSAGE.LOGIN_ID);
          },
        },
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
      rules: [{ required: true, message: 'Gender is required!' }],
    },
    {
      label: 'Email Address',
      name: 'email',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Contact Number',
      name: 'phoneNumber',
      nameChild: ['mobileCountryCode', 'contactNumber'],
      type: 'phoneNumber',
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
      label: 'Address Line 1',
      name: 'address1',
      type: 'string',
      rules: [{ required: true, message: 'Address is required!' }],
    },

    {
      label: 'Address Line 2',
      name: 'address2',
      type: 'string',
    },
    {
      label: 'Country',
      name: 'country',
      type: 'select',
      options: [{ label: 'Singapore', value: 'Singapore' }],
      rules: [{ required: true, message: 'Country is required!' }],
    },
    {
      label: 'Postal Code',
      name: 'postalCode',
      type: 'string',
      rules: [
        { required: true, message: 'Postal Code is required!' },
        {
          validator(_: RuleObject, value: string) {
            const regex = new RegExp(REGEX_NUMBER);
            if (regex.test(value)) {
              return Promise.resolve();
            }
            return Promise.reject(ERROR_MESSAGE.POSTAL_CODE);
          },
        },
      ],
    },
    {
      label: 'Designation',
      name: 'designation',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Role',
      name: 'role',
      type: 'string',
      disabled: true,
    },
    {
      label: 'SubjectTags',
      name: 'subjectTags',
      type: 'string',
      disabled: true,
      isHidden: !isTeacher,
    },
    {
      label: 'Centre',
      name: 'centre',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Remark',
      name: 'remark',
      type: 'string',
      disabled: true,
    },
  ];

  useEffect(() => {
    const formValue = {
      firstName: userInfo?.userProfile?.firstName,
      lastName: userInfo?.userProfile?.lastName,
      username: userInfo?.username,
      mobileCountryCode: userInfo?.userProfile?.mobileCountryCode,
      email: userInfo?.email,
      role: userInfo?.userRole?.roleName,
      remark: isTeacher ? userInfo?.teacher?.remark : userInfo?.centreAdmin?.remark,
      designation: userInfo?.userProfile?.designation,
      centre: isTeacher
        ? Array.isArray(userInfo?.teacher?.centres)
          ? userInfo?.teacher?.centres
              ?.map((centre: { centreName: string }) => centre.centreName)
              .join('; ')
          : []
        : Array.isArray(userInfo?.centreAdmin?.centres)
        ? userInfo?.centreAdmin?.centres
            ?.map((centre: { centreName: string }) => centre.centreName)
            .join('; ')
        : [],
        subjectTags: Array.isArray(userInfo?.teacher?.subjectTags)
        ? userInfo?.teacher?.subjectTags
            ?.map((subject: { tagName: string }) => subject.tagName)
            .join('; ')
        : [],
    };

    form.setFieldsValue(formValue);

    if (userInfo?.userProfile?.profilePhotoDestination) {
      setFilePath(userInfo.userProfile.profilePhotoDestination);
      getAvatar(userInfo.userProfile.profilePhotoDestination);
    }
  }, [userInfo, isTeacher]);

  useEffect(() => {
    form.setFieldsValue({ adminName: firstName + ' ' + lastName });
  }, [firstName, lastName]);

  const handleBackToLogin = () => {
    sessionStorage.clear();
    localStorage.clear();
    history(ROUTES.login);
  };

  const renderField = (field: IFieldListForm) => {
    switch (field.type) {
      case FIELDS.STRING:
        return <CustomInput disabled={field?.disabled} type={field.type} />;
      case FIELDS.DATE:
        return <DatePicker format={DATE_FORMAT_TWO} className="style_input_custom_login_page" />;
      case FIELDS.SELECT:
        return (
          <Select
            disabled={field?.disabled}
            getPopupContainer={(node) => node}
            options={field.options as (BaseOptionType | DefaultOptionType)[]}
          />
        );
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
      case FIELDS.PHONE_NUMBER:
        return (
          <Input.Group compact>
            <Form.Item
              noStyle
              name={field?.nameChild ? field?.nameChild[0] : ('' as string)}
              rules={[{ required: true, message: 'Prefix is required!' }]}
            >
              <Select getPopupContainer={(node) => node} className="w-[25%]">
                {codesPhoneNumber.map((item, index) => {
                  return (
                    <Select.Option key={index} value={item.code}>
                      +{item.code}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item
              noStyle
              validateFirst
              name={field?.nameChild ? field?.nameChild[1] : ('' as string)}
              rules={[
                { required: true, message: 'Contact Number is required!' },
                {
                  validator(_: RuleObject, value: string) {
                    const regex = new RegExp(REGEX_NUMBER);
                    if (regex.test(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(ERROR_MESSAGE.CONTACT_NUMBER);
                  },
                },
                {
                  min: 8,
                  message: 'Contact Number should consist of 8 characters',
                },
                {
                  max: 8,
                  message: 'Contact Number should consist of 8 characters',
                }
              ]}
            >
              <Input className="style_input_custom_login_page w-[75%] rounded-r-2xl" />
            </Form.Item>
          </Input.Group>
        );
      default:
        break;
    }
  };

  const handleUpdateProfile = (values: IAminProfile) => {
    const adminInfo = {
      ...values,
      dateOfBirth: moment(values.dateOfBirth).format(DATE_FORMAT_TWO),
      profilePhotoDestination: filePath,
    };
    setDataRequest(adminInfo);
    setIsOpenConfirmUpdate(true);
  };

  const handleConfirmUpdateAdminProfile = () => {
    updateProfile(dataRequest as IAminProfile);
  };

  const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>, croppedAreaPixels: Area) => {
    if (event && event.target.files && event.target.files[0]) {
      const imgUrl = event.target.files[0];
      const formData = new FormData();
      formData.append('file', imgUrl);
      formData.append('width', croppedAreaPixels.width.toString());
      formData.append('height', croppedAreaPixels.height.toString());
      formData.append('x', croppedAreaPixels.x.toString());
      formData.append('y', croppedAreaPixels.y.toString());
      uploadAvatarProfile({ formData, userId: Number(stateContext?.user?.id) });
    }
  };

  return (
    <Layout className="p-0 sm:p-0 md:p-0 lg:p-0 bg-transparent">
      <Breadcrumb className="text-[28px] text-main-font-color font-bold font-fontFamily leading-9">
        <Breadcrumb.Item className="text-main-font-color font-fontFamily">
          {isTeacher ? 'Teacher’s' : 'Admin’s'} Profile Details
        </Breadcrumb.Item>
      </Breadcrumb>
      <Content className="mt-6 p-8 bg-white w-full rounded-3xl shadow[#0000000a]">
        <div className="md:flex lg:flex xl:flex 2xl:flex gap-x-6 form-edit">
          <Form
            autoComplete="off"
            form={form}
            layout="vertical"
            colon={false}
            className="flex flex-wrap gap-x-6"
            initialValues={{ mobileCountryCode: '65' }}
            onFinish={handleUpdateProfile}
          >
            {fieldList.map(
              (field) =>
                !field?.isHidden && (
                  <Form.Item
                    key={field.name}
                    label={field.label}
                    validateFirst
                    name={field.name}
                    className={'item-half-width'}
                    rules={field.rules}
                  >
                    {renderField(field)}
                  </Form.Item>
                ),
            )}
          </Form>
          <CropUploadFile avatarUrl={profilePhotoDestination} onChangeFile={onChangeFile} />
        </div>
        <div className="float-right flex gap-x-3">
          <ModalCustom
            onSubmit={handleBackToLogin}
            title="Notice"
            titleCenter
            cancelText="Cancel"
            okText="Confirm"
            content="Are you sure you want to leave update profile to go back to the login page?"
            viewComponent={<ButtonCustom color="outline">Back to login</ButtonCustom>}
          />
          <ButtonCustom onClick={form.submit} color="orange">
            Save
          </ButtonCustom>
        </div>
        {isOpenConfirmUpdate && (
          <ModalCustom
            title="Confirmation"
            cancelText="Cancel"
            visible={true}
            okText="Confirm"
            onSubmit={handleConfirmUpdateAdminProfile}
            onCancel={() => setIsOpenConfirmUpdate(false)}
            content="Are you sure you want to save your personal profile details?"
            titleCenter
          />
        )}
      </Content>
    </Layout>
  );
};

export default AdminProfile;
