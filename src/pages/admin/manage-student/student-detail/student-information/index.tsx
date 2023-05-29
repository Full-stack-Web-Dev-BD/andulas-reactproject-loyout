import { DatePicker, Form, Input, notification, Select } from 'antd';
import { RuleObject } from 'antd/lib/form';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType, DefaultOptionType } from 'antd/lib/select';
import { updateStudentProfile } from 'api/student';
import { getFileUrl, uploadAvatar } from 'api/user';
import ButtonCustom from 'components/Button';
import CropUploadFile from 'components/CropUploadFile';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import {
  DATE_FORMAT,
  ERROR_MESSAGE,
  FIELDS,
  IFieldListForm,
  REGEX_EMAIL,
  REGEX_LOGIN_ID,
  REGEX_NUMBER,
  ROUTES,
  WARNING_MESSAGE,
} from 'constants/index';
import { IAdminProfile } from 'constants/types';
import moment from 'moment';
import { codesPhoneNumber } from 'pages/auth/register';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Area } from 'react-easy-crop';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

import './custom-student-info.css';

const StudentInformation = ({
  isEdit,
  setIsEdit,
  isChanging,
  setIsChanging,
  profile,
  mutateGetStudentDetail,
}: {
  isEdit: boolean;
  setIsEdit: (value: boolean) => void;
  isChanging: boolean;
  setIsChanging: (value: boolean) => void;
  profile?: IAdminProfile;
  mutateGetStudentDetail: (value: { id: number }) => void;
}) => {
  const history = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const firstName = Form.useWatch('firstName', form);
  const lastName = Form.useWatch('lastName', form);
  const [isModalNotice, setIsModalNotice] = useState<boolean>(false);
  const [filePath, setFilePath] = useState<string>('');
  const [profilePhotoDestination, setProfilePhotoDestination] = useState<string>('');
  const [isModalConfirm, setIsModalConfirm] = useState<boolean>(false);

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

  const { mutate: mutateUpdateStudentProfile } = useMutation(
    'updateStudentProfile',
    updateStudentProfile,
    {
      onSuccess: () => {
        setIsEdit(false);
        setIsChanging(false);
        mutateGetStudentDetail({ id: Number(id) });
      },
      onError: ({ response }) => {
        if (response.status == 403) {
          notification.error({ message: 'You are not allowed to edit student.' });
          return;
        }
        const message = response.data.message;
        if (message.includes('Username')) {
          form.setFields([
            {
              name: 'username',
              errors: [message],
            },
          ]);
        } else if (message.includes('Email')) {
          form.setFields([
            {
              name: 'email',
              errors: [message],
            },
          ]);
        } else {
          notification.error({ message: message });
        }
      },
    },
  );

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
        label: 'Login ID',
        name: 'username',
        type: 'string',
        rules: [
          { required: true, message: 'Login ID is required!' },
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
          { required: true, message: 'Email Address is required!' },
        ],
      },
      {
        label: 'Contact Number',
        name: 'contactNumber',
        nameChild: ['mobileCountryCode', 'contactNumber'],
        type: 'phoneNumber',
        rules: [{ required: true, message: 'Contact Number is required!' }],
        options: codesPhoneNumber.map((item) => {
          return { label: `+ ${item.code}`, value: item.code.toString() };
        }),
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
        label: 'Remark',
        name: 'remark',
        type: 'string',
      },
    ],
    [],
  );

  const renderField = useCallback(
    (field: IFieldListForm) => {
      switch (field.type) {
        case FIELDS.STRING:
          return <CustomInput disabled={!isEdit || field.disabled} type={field.type} />;
        case FIELDS.NUMBER:
          return <CustomInput disabled={!isEdit} type={field.type} />;
        case FIELDS.DATE:
          return (
            <DatePicker
              inputReadOnly
              disabled={!isEdit}
              format={DATE_FORMAT}
              className="style_input_custom_login_page"
            />
          );
        case FIELDS.GROUP_NAME:
          return (
            <div className="flex gap-x-3 justify-between">
              <Form.Item
                noStyle
                rules={[{ required: true, message: 'First Name is required!' }]}
                name={field.nameChild ? field.nameChild[0] : ''}
              >
                <CustomInput
                  disabled={!isEdit}
                  placeholder="First Name"
                  type="string"
                  classNameWrapper={'w-[calc(50%_-_0.375rem)]'}
                />
              </Form.Item>
              <Form.Item
                noStyle
                rules={[{ required: true, message: 'Last Name is required!' }]}
                name={field.nameChild ? field.nameChild[1] : ''}
              >
                <CustomInput
                  disabled={!isEdit}
                  placeholder="Last Name"
                  type="string"
                  classNameWrapper={'w-[calc(50%_-_0.375rem)]'}
                />
              </Form.Item>
            </div>
          );
        case FIELDS.SELECT:
          return (
            <Select
              getPopupContainer={(node) => node}
              options={field.options as (BaseOptionType | DefaultOptionType)[]}
              disabled={!isEdit}
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
                  disabled={!isEdit}
                />
              </Form.Item>
              <Form.Item
                noStyle
                name={field?.nameChild ? field?.nameChild[1] : ('' as string)}
                rules={[
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
                  },
                ]}
              >
                <Input
                  disabled={!isEdit}
                  className="style_input_custom_login_page w-[75%] rounded-r-2xl"
                />
              </Form.Item>
            </Input.Group>
          );
        case '':
          return <div></div>;
        default:
          return <CustomInput disabled={!isEdit} type={field.type} />;
      }
    },
    [DATE_FORMAT, isEdit],
  );

  const renderFieldList = useCallback(() => {
    return fields?.map((field, index) => (
      <Form.Item
        className={'w-full sm:w-full lg:w-[48%] cus-form-student-if'}
        key={index}
        validateFirst
        name={field.name}
        label={field.label}
        rules={field.rules}
      >
        {renderField(field)}
      </Form.Item>
    ));
  }, [fields, isEdit]);

  const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>, croppedAreaPixels: Area) => {
    if (event && event.target.files && event.target.files[0]) {
      const imgUrl = event.target.files[0];
      const formData = new FormData();
      formData.append('file', imgUrl);
      formData.append('width', croppedAreaPixels.width.toString());
      formData.append('height', croppedAreaPixels.height.toString());
      formData.append('x', croppedAreaPixels.x.toString());
      formData.append('y', croppedAreaPixels.y.toString());
      uploadAvatarProfile({ formData, userId: Number(profile?.user?.id) });
    }
  };

  const handleBack = () => {
    if (isChanging) {
      setIsModalNotice(true);
      return;
    }
    if (isEdit) {
      setIsEdit(false);
      return;
    }
    history(ROUTES.manage_student);
  };

  useEffect(() => {
    const userProfile = profile?.user?.userProfile;
    if (userProfile) {
      form.setFieldsValue({
        lastName: userProfile?.lastName,
        firstName: userProfile?.firstName,
        username: profile?.user?.username,
        email: profile?.user?.email,
        ICNumber: userProfile?.ICNumber,
        gender: userProfile?.gender,
        contactNumber: userProfile?.contactNumber,
        dateOfBirth: userProfile?.dateOfBirth ? moment(userProfile?.dateOfBirth) : '',
        nationality: userProfile?.nationality,
        address1: userProfile?.address1,
        address2: userProfile?.address2,
        country: userProfile?.country,
        postalCode: userProfile?.postalCode,
        mobileCountryCode: userProfile?.mobileCountryCode,
        remark: profile?.remark,
      });

      if (userProfile?.profilePhotoDestination) {
        setFilePath(userProfile.profilePhotoDestination);
        getAvatar(userProfile.profilePhotoDestination);
      }
    }
  }, [profile, isEdit]);

  useEffect(() => {
    form.setFieldsValue({ studentName: firstName + ' ' + lastName });
  }, [firstName, lastName]);

  return (
    <Content className="rounded-3xl bg-white p-8">
      <div className="flex gap-x-3 custom-student-info">
        <Form
          layout="vertical"
          className="flex flex-wrap gap-x-4 flex-[62%]"
          form={form}
          onFieldsChange={() => {
            setIsChanging(true);
          }}
          onFinish={(values) => {
            setIsEdit(false);
            setIsChanging(false);
            mutateUpdateStudentProfile({
              params: {
                ...values,
                profilePhotoDestination: filePath,
                dateOfBirth: moment(values.dateOfBirth).format('YYYY-MM-DD'),
                salutation: values.gender === 'Male' ? 'Mr' : 'Ms',
              },
              id: Number(id),
            });
          }}
        >
          {renderFieldList()}
        </Form>
        <CropUploadFile
          isEdit={isEdit}
          avatarUrl={profilePhotoDestination}
          onChangeFile={onChangeFile}
        />
      </div>

      <div className="flex gap-x-3 justify-end">
        <ButtonCustom color="outline" onClick={handleBack}>
          {isChanging || isEdit ? 'Cancel' : 'Back'}
        </ButtonCustom>
        {isEdit ? (
          <ButtonCustom
            color="orange"
            onClick={() => {
              form.validateFields().then(() => {
                setIsModalConfirm(true);
              });
            }}
          >
            Update
          </ButtonCustom>
        ) : (
          <ButtonCustom
            color="orange"
            onClick={() => {
              setIsEdit(true);
            }}
          >
            Edit
          </ButtonCustom>
        )}
      </div>

      {isModalNotice && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setIsModalNotice(false);
          }}
          okText="Leave"
          onSubmit={() => {
            setIsChanging(false);
            setIsEdit(false);
          }}
          title="Notice"
          titleCenter
          content={WARNING_MESSAGE.LEAVE_MANAGE_ADMIN_INFO}
        />
      )}
      {isModalConfirm && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          okText="Confirm"
          title={'Confirmation'}
          onCancel={() => {
            setIsModalConfirm(false);
          }}
          onSubmit={() => {
            form.submit();
          }}
          titleCenter
        >
          Are you sure want to update {profile?.user.userProfile.firstName}{' '}
          {profile?.user.userProfile.lastName}’s details?
        </ModalCustom>
      )}
    </Content>
  );
};

export default StudentInformation;
