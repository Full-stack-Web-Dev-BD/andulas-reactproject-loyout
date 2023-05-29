import { DatePicker, Form, Input, Layout, notification, Select } from 'antd';
import { RuleObject } from 'antd/lib/form';
import { BaseOptionType, DefaultOptionType } from 'antd/lib/select';
import { IAminProfile } from 'api/admin';
import { getStudentProfile } from 'api/student';
import { getTeacherProfileOfCentreAdmin } from 'api/teacher';
import { getAllTemplateThemes } from 'api/theme';
import {
  getFileUrl,
  getProfileMe,
  getProfileTeacher,
  IUser,
  updateNewContactNumber,
  updateNewEmail,
  updateProfileMe,
  uploadAvatar,
} from 'api/user';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import ButtonCustom from 'components/Button';
import CropUploadFile from 'components/CropUploadFile';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import {
  DATE_FORMAT,
  DATE_FORMAT_TWO,
  FIELDS,
  REGEX_EMAIL,
  REGEX_LOGIN_ID,
  REGEX_NUMBER,
  ROUTES,
} from 'constants/constants';
import usePrompt from 'constants/function';
import { ERROR_MESSAGE, IFieldListForm, WARNING_MESSAGE } from 'constants/index';
import { AppContext } from 'context';
import moment from 'moment';
import { codesPhoneNumber } from 'pages/auth/register';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Area } from 'react-easy-crop';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ModalChangeContactNumber from '../component/ModalChangeContactNumber';
import ModalChangeEmail from '../component/ModalChangeEmail';
import ModalUpdatedEmail from '../component/ModalUpdatedEmail';
import ModalUpdateTwoFA from '../component/ModalUpdateTwoFA';
import ModalVerifyChangeEmail from '../component/ModalVerifyChangeEmail';

import "./custom-style-my-info.css";

const { Content } = Layout;

export const fieldsValidation = ['contactNumber', 'ICNumber', 'username', 'Login ID'];

const MyInfo = () => {
  const [form] = Form.useForm();
  const history = useNavigate();
  const { pathname } = useLocation();
  const { id } = useParams();
  const [formChangePassword] = Form.useForm();
  const [isEdit, setIsEdit] = useState<boolean>(true);
  const [state, setState]: any = useContext(AppContext);
  const isAdmin = !!state?.user?.centreAdmin;
  const isStudent = !!state?.user?.student;
  const adminId = state?.user?.centreAdmin?.id;
  const [isOpenTwoFA, setIsOpenTwoFA] = useState<boolean>(false);
  const [isChanging, setIsChanging] = useState<boolean>(false);
  const [isOpenConfirmCancelEditProfile, setIsOpenConfirmCancelEditProfile] =
    useState<boolean>(false);
  const [isOpenConfirmUpdateProfile, setIsOpenConfirmUpdateProfile] = useState<boolean>(false);
  const [dataRequest, setDataRequest] = useState({});
  const [filePath, setFilePath] = useState<string>('');
  const [profilePhotoDestination, setProfilePhotoDestination] = useState('');
  const [formChangeContactNumber] = Form.useForm();
  const [isModalChangeContactNumber, setIsModalChangeContactNumber] = useState(false);
  const [isKeepOpen, setIsKeepOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeLeftEmail, setTimeLeftEmail] = useState(0);
  const newContactNumber = Form.useWatch('newContactNumber', formChangeContactNumber);
  const [isOpenModalVerifyChangeEmail, setIsOpenModalVerifyChangeEmail] = useState(false);
  const [isOpenModalChangeEmail, setIsOpenModalChangeEmail] = useState(false);
  const [formChangeEmail] = Form.useForm();
  const [formInsertEmail] = Form.useForm();
  const [otpCode, setOtpCode] = useState('');
  const [isCentreOfAdmin, setIsCentreOfAdmin] = useState(false);
  const [isModalNotification, setIsModalNotification] = useState(false);
  const [messageNotification, setMessageNotification] = useState('');
  const newEmail = Form.useWatch('newEmail', formChangeEmail);
  const [method, setMethod] = useState<string>('');
  const isViewAsTeacher = !!(
    id &&
    pathname.includes(ROUTES.view_as) &&
    pathname.includes(ROUTES.teacher_detail)
  );
  const isViewAsStudent = !!(
    id &&
    pathname.includes(ROUTES.student_detail) &&
    pathname.includes(ROUTES.view_as)
  );

  const { mutate: mutateTheme, data: dataTheme } = useMutation(
    'getAllTemplateThemes',
    getAllTemplateThemes,
  );

  const { mutate: getAvatar } = useMutation('getFileUrl', getFileUrl, {
    onSuccess: ({ data }: { data: { fileUrl: string } }) => {
      setProfilePhotoDestination(data?.fileUrl || '');
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

  const { mutate: getProfile } = useMutation('getProfileMe', getProfileMe, {
    onSuccess: ({ data }: { data: IUser }) => {
      setState({ ...state, user: data });
      const formValue = {
        fullName: data?.userProfile?.firstName + ' ' + data?.userProfile?.lastName,
        username: data?.username,
        email: data?.email,
        contactNumber: data?.userProfile?.contactNumber,
        dateOfBirth: data?.userProfile?.dateOfBirth ? moment(data?.userProfile?.dateOfBirth) : '',
        designation: data?.userProfile?.designation,
        role: data?.userRole?.roleName,
        theme: data?.theme?.id?.toString(),
        gender: data?.userProfile?.gender,
        ICNumber: data?.userProfile?.ICNumber,
        nationality: data?.userProfile?.nationality,
        postalCode: data?.userProfile?.postalCode,
        address1: data?.userProfile?.address1,
        address2: data?.userProfile?.address2,
        country: data?.userProfile?.country,
        mobileCountryCode: data?.userProfile?.mobileCountryCode,
        centre: Array.isArray(data?.centreAdmin?.centres)
          ? data?.centreAdmin?.centres
              ?.map((centre: { centreName: string }) => centre.centreName)
              .join('; ')
          : '',
      };
      form.setFieldsValue({ ...formValue });
      formChangeContactNumber.setFieldsValue({
        currentContactNumber: data?.userProfile?.contactNumber,
      });
      formChangeEmail.setFieldsValue({ currentEmail: data?.email });
      mutateTheme({ templateID: Number(data?.userRole?.templateID) });
      if (data?.userProfile?.profilePhotoDestination && !pathname.includes(ROUTES.view_as)) {
        setFilePath(data.userProfile.profilePhotoDestination);
        getAvatar(data.userProfile.profilePhotoDestination);
      }
    },
  });

  const { mutate: getTeacherProfile } = useMutation('getProfileTeacher', getProfileTeacher, {
    onSuccess: ({ data }: { data: IUser }) => {
      const formValue = {
        fullName: data?.userProfile?.firstName + ' ' + data?.userProfile?.lastName,
        username: data?.username,
        email: data?.email,
        contactNumber: data?.userProfile?.contactNumber,
        dateOfBirth: data?.userProfile?.dateOfBirth ? moment(data?.userProfile?.dateOfBirth) : '',
        designation: data?.userProfile?.designation,
        role: data?.userRole?.roleName,
        theme: data?.theme?.id?.toString(),
        gender: data?.userProfile?.gender,
        ICNumber: data?.userProfile?.ICNumber,
        nationality: data?.userProfile?.nationality,
        postalCode: data?.userProfile?.postalCode,
        address1: data?.userProfile?.address1,
        address2: data?.userProfile?.address2,
        country: data?.userProfile?.country,
        mobileCountryCode: data?.userProfile?.mobileCountryCode,
        centre: Array.isArray(data?.centreAdmin?.centres)
          ? data?.centreAdmin?.centres
              ?.map((centre: { centreName: string }) => centre.centreName)
              .join('; ')
          : '',
      };
      form.setFieldsValue({ ...formValue });
      formChangeContactNumber.setFieldsValue({
        currentContactNumber: data?.userProfile?.contactNumber,
      });
      formChangeEmail.setFieldsValue({ currentEmail: data?.email });
      mutateTheme({ templateID: Number(data?.userRole?.templateID) });
      if (data?.userProfile?.profilePhotoDestination) {
        setFilePath(data.userProfile.profilePhotoDestination);
        getAvatar(data.userProfile.profilePhotoDestination);
      }
    },
  });

  const { mutate: getProfileTeacherOfCentreAdmin } = useMutation(
    'getTeacherProfileOfCentreAdmin',
    getTeacherProfileOfCentreAdmin,
    {
      onSuccess: ({ data }: { data: IUser }) => {
        const formValue = {
          fullName: data?.userProfile?.firstName + ' ' + data?.userProfile?.lastName,
          username: data?.username,
          email: data?.email,
          contactNumber: data?.userProfile?.contactNumber,
          dateOfBirth: data?.userProfile?.dateOfBirth ? moment(data?.userProfile?.dateOfBirth) : '',
          designation: data?.userProfile?.designation,
          role: data?.userRole?.roleName,
          theme: data?.theme?.id?.toString(),
          gender: data?.userProfile?.gender,
          ICNumber: data?.userProfile?.ICNumber,
          nationality: data?.userProfile?.nationality,
          postalCode: data?.userProfile?.postalCode,
          address1: data?.userProfile?.address1,
          address2: data?.userProfile?.address2,
          country: data?.userProfile?.country,
          mobileCountryCode: data?.userProfile?.mobileCountryCode,
          centre: Array.isArray(data?.centreAdmin?.centres)
            ? data?.centreAdmin?.centres
                ?.map((centre: { centreName: string }) => centre.centreName)
                .join('; ')
            : '',
        };
        form.setFieldsValue({ ...formValue });
        setIsCentreOfAdmin(true);
        formChangeContactNumber.setFieldsValue({
          currentContactNumber: data?.userProfile?.contactNumber,
        });
        formChangeEmail.setFieldsValue({ currentEmail: data?.email });
        mutateTheme({ templateID: Number(data?.userRole?.templateID) });
        if (data?.userProfile?.profilePhotoDestination) {
          setFilePath(data.userProfile.profilePhotoDestination);
          getAvatar(data.userProfile.profilePhotoDestination);
        }
      },
    },
  );

  const { mutate: mutateGetStudentProfile } = useMutation('getStudentProfile', getStudentProfile, {
    onSuccess: ({ data }: { data: IUser }) => {
      const formValue = {
        fullName: data?.userProfile?.firstName + ' ' + data?.userProfile?.lastName,
        username: data?.username,
        email: data?.email,
        contactNumber: data?.userProfile?.contactNumber,
        dateOfBirth: data?.userProfile?.dateOfBirth ? moment(data?.userProfile?.dateOfBirth) : '',
        designation: data?.userProfile?.designation,
        role: data?.userRole?.roleName,
        theme: data?.theme?.id?.toString(),
        gender: data?.userProfile?.gender,
        ICNumber: data?.userProfile?.ICNumber,
        nationality: data?.userProfile?.nationality,
        postalCode: data?.userProfile?.postalCode,
        address1: data?.userProfile?.address1,
        address2: data?.userProfile?.address2,
        country: data?.userProfile?.country,
        mobileCountryCode: data?.userProfile?.mobileCountryCode,
        centre: Array.isArray(data?.centreAdmin?.centres)
          ? data?.centreAdmin?.centres
              ?.map((centre: { centreName: string }) => centre.centreName)
              .join('; ')
          : '',
      };
      form.setFieldsValue({ ...formValue });
      formChangeContactNumber.setFieldsValue({
        currentContactNumber: data?.userProfile?.contactNumber,
      });
      formChangeEmail.setFieldsValue({ currentEmail: data?.email });
      mutateTheme({ templateID: Number(data?.userRole?.templateID) });
      if (data?.userProfile?.profilePhotoDestination) {
        setFilePath(data.userProfile.profilePhotoDestination);
        getAvatar(data.userProfile.profilePhotoDestination);
      }
    },
  });

  usePrompt(WARNING_MESSAGE.LEAVE_MANAGE_ADMIN_INFO, isChanging);

  const { mutate: mutateUpdateProfileMe } = useMutation('updateProfileMe', updateProfileMe, {
    onSuccess: ({ data }: { data: IUser }) => {
      setState({ ...state, themeMain: data?.theme });
      setIsOpenConfirmUpdateProfile(false);
      setIsEdit(true);
      setIsChanging(false);
    },
    onError: ({ response }: { response: { data: { message: string } } }) => {
      if (Array.isArray(response.data.message)) {
        response.data.message.map((error: string) => {
          fieldsValidation.map((field: string) => {
            if (error.includes(field)) {
              form.setFields([{ name: field, errors: [error] }]);
              return;
            }
          });
        });
        return;
      }

      if (response.data.message.includes(fieldsValidation[3])) {
        form.setFields([{ name: fieldsValidation[2], errors: [response.data.message] }]);
        return;
      }

      notification.error({ message: response.data.message });
    },
  });

  const { mutate: mutateUpdateNewEmail } = useMutation('updateNewEmail', updateNewEmail, {
    onSuccess: () => {
      setIsOpenModalVerifyChangeEmail(true);
      setIsOpenModalChangeEmail(false);
      setTimeLeftEmail(120);
      formInsertEmail.resetFields();
    },
    onError: ({ response }) => {
      formInsertEmail.setFields([{ name: 'newEmail', errors: [response.data.message] }]);
    },
  });

  const { mutate: mutateVerifyUpdateNewEmail } = useMutation('updateNewEmail', updateNewEmail, {
    onSuccess: () => {
      setIsKeepOpen(false);
      setIsOpenModalVerifyChangeEmail(false);
      setMessageNotification('Email Address Successfully Updated');
      setIsModalNotification(true);
      form.setFieldsValue({ email: newEmail });
    },
    onError: ({ response }) => {
      formChangeEmail.setFields([{ name: 'otpCode', errors: [response.data.message] }]);
    },
  });

  const { mutate: mutateChangeContactNumber } = useMutation(
    'updateNewContactNumber',
    updateNewContactNumber,
    {
      onSuccess: () => {
        setTimeLeft(120);
      },
      onError: ({ response }) => {
        formChangeContactNumber.setFields([
          { name: 'newContactNumber', errors: [response.data.message] },
        ]);
      },
    },
  );

  const { mutate: mutateVerifyChangeContactNumber } = useMutation(
    'updateNewContactNumber',
    updateNewContactNumber,
    {
      onSuccess: () => {
        setIsKeepOpen(false);
        setIsModalChangeContactNumber(false);
        setMessageNotification('Contact Number Successfully Updated ');
        setIsModalNotification(true);
        form.setFieldsValue({ contactNumber: newContactNumber });
      },
      onError: ({ response }) => {
        setIsKeepOpen(true);
        formChangeContactNumber.setFields([{ name: 'otpCode', errors: [response.data.message] }]);
      },
    },
  );

  const onFinish = (values: IAminProfile) => {
    const userInfo = {
      username: values.username,
      userProfile: {
        ICNumber: values.ICNumber,
        gender: values.gender,
        nationality: values.nationality,
        address1: values.address1,
        address2: values.address2,
        country: values.country,
        postalCode: values.postalCode,
        profilePhotoDestination: filePath,
        dateOfBirth: moment(values.dateOfBirth).format(DATE_FORMAT_TWO),
      },
      themeID: Number(values.theme),
    };
    setDataRequest(userInfo);
    setIsOpenConfirmUpdateProfile(true);
  };

  const handleConfirmUpdateProfile = () => {
    mutateUpdateProfileMe(dataRequest as IAminProfile);
  };

  const handleOpenUpdateProfile = useCallback(() => {
    setIsEdit(!isEdit);
  }, [isEdit]);

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    if (isViewAsTeacher && id && !isCentreOfAdmin) {
      if (isAdmin && adminId) {
        getProfileTeacherOfCentreAdmin({ id: Number(id), adminId: Number(adminId) });
        return;
      }
    }
  }, [id, isViewAsTeacher, isAdmin, adminId, isCentreOfAdmin]);

  useEffect(() => {
    if (isViewAsTeacher && id && !isCentreOfAdmin) {
      setTimeout(() => {
        getTeacherProfile(Number(id));
      }, 100);
    }
  }, [id, isViewAsTeacher, isCentreOfAdmin]);

  useEffect(() => {
    if (isViewAsStudent && id) {
      setTimeout(() => {
        mutateGetStudentProfile({ id: Number(id) });
      }, 100);
      return;
    }
  }, [id, isViewAsStudent]);

  const fieldList = [
    {
      label: 'Full Name',
      name: 'fullName',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Login ID',
      name: 'username',
      type: 'string',
      rules: [
        { required: true, message: 'Please input your login ID!' },
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
        { required: true, message: 'Please input your IC Number!' },
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
      rules: [{ required: true, message: 'Please input your Gender!' }],
    },
    {
      label: 'Email Address',
      name: 'email',
      type: 'string',
      disabled: true,
      icon: (
        <EditSVG
          className="icon-hover cursor-pointer"
          onClick={() => {
            setIsOpenModalChangeEmail(true);
          }}
        />
      ),
      rules: [
        { required: true, message: 'Please input your email address!' },
        {
          validator(_: RuleObject, value: string) {
            const regex = new RegExp(REGEX_EMAIL);
            if (regex.test(value)) {
              return Promise.resolve();
            }
            return Promise.reject(ERROR_MESSAGE.EMAIL);
          },
        },
      ],
    },
    {
      label: 'Contact Number',
      name: 'contactNumber',
      nameChild: ['mobileCountryCode', 'contactNumber'],
      type: 'phoneNumber',
      rules: [
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
      ],
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
      disabled: true,
      type: 'string',
      isHidden: isStudent || isViewAsStudent
    },
    {
      label: 'Role',
      name: 'role',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Theme',
      name: 'theme',
      type: 'select',
      rules: [{ required: true, message: 'Please select Theme!' }],
      options: dataTheme?.data.themes.map(
        (theme: { themeName: string | undefined; id: number | undefined }) => {
          return { label: theme.themeName, value: theme.id?.toString() };
        },
      ),
    },
    {
      label: 'Centre',
      name: 'centre',
      type: 'string',
      disabled: true,
      isHidden: !Array.isArray(state?.user?.centreAdmin?.centres),
    },
  ];

  const renderField = useCallback(
    (field: IFieldListForm) => {
      switch (field.type) {
        case FIELDS.STRING:
          return field.icon ? (
            <Input
              className="style_input_custom_login_page"
              disabled={isEdit || field.disabled}
              suffix={!isEdit && field.icon ? field.icon : <span />}
            />
          ) : (
            <CustomInput disabled={isEdit || field.disabled} type={field.type} />
          );
        case FIELDS.NUMBER:
          return <CustomInput disabled={isEdit} type={field.type} />;
        case FIELDS.DATE:
          return (
            <DatePicker
              disabled={isEdit || field.disabled}
              format={DATE_FORMAT}
              className="style_input_custom_login_page"
              inputReadOnly
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
                <CustomInput disabled={isEdit} placeholder="First Name" type="string" />
              </Form.Item>
              <Form.Item
                noStyle
                rules={[{ required: true, message: 'Last Name is required!' }]}
                name={field.nameChild ? field.nameChild[1] : ''}
              >
                <CustomInput disabled={isEdit} placeholder="Last Name" type="string" />
              </Form.Item>
            </div>
          );
        case FIELDS.SELECT:
          return (
            <Select
              getPopupContainer={(node) => node}
              options={field.options as (BaseOptionType | DefaultOptionType)[]}
              disabled={isEdit}
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
                  disabled={true}
                />
              </Form.Item>
              <Form.Item
                noStyle
                validateFirst
                name={field?.nameChild ? field?.nameChild[1] : ('' as string)}
                rules={field.rules}
              >
                <Input
                  disabled={true}
                  className="style_input_custom_login_page w-[75%] rounded-r-2xl"
                  suffix={
                    !isEdit ? (
                      <EditSVG
                        className="icon-hover cursor-pointer"
                        onClick={() => {
                          setIsModalChangeContactNumber(true);
                        }}
                      />
                    ) : (
                      <span />
                    )
                  }
                />
              </Form.Item>
            </Input.Group>
          );
        case '':
          return <div></div>;
        default:
          return <CustomInput disabled={isEdit} type={field.type} />;
      }
    },
    [DATE_FORMAT, isEdit],
  );

  const renderFieldList = useCallback(() => {
    return fieldList?.map(
      (field, index) =>
        !field?.isHidden && (
          <Form.Item
            className={'w-full sm:w-full md:w-full lg:w-[47%] custom-w-form-input'}
            key={index}
            validateFirst
            name={field.name}
            label={field.label}
            rules={field.rules}
          >
            {renderField(field)}
          </Form.Item>
        ),
    );
  }, [fieldList, isEdit]);

  const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>, croppedAreaPixels: Area) => {
    if (event && event.target.files && event.target.files[0]) {
      const imgUrl = event.target.files[0];
      const formData = new FormData();
      formData.append('file', imgUrl);
      formData.append('width', croppedAreaPixels.width.toString());
      formData.append('height', croppedAreaPixels.height.toString());
      formData.append('x', croppedAreaPixels.x.toString());
      formData.append('y', croppedAreaPixels.y.toString());
      uploadAvatarProfile({ formData, userId: Number(state?.user?.id) });
    }
  };

  const handleCancelEditProfile = useCallback(() => {
    if (isChanging) {
      setIsOpenConfirmCancelEditProfile(true);
      return;
    }
    setIsEdit(true);
  }, [isChanging]);

  const handleConfirmCancelEditProfile = () => {
    getProfile();
    setIsEdit(true);
    setIsChanging(false);
    setIsOpenConfirmCancelEditProfile(false);
  };

  const renderContent = useCallback(() => {
    return (
      <Content className="mt-8 p-8 bg-white rounded-3xl shadow[#0000000a]">
        <div className="md:flex lg:flex xl:flex 2xl:flex gap-x-6 form-edit custom-my-info">
          <Form
            onFinish={onFinish}
            form={form}
            layout="vertical"
            onFieldsChange={() => {
              setIsChanging(true);
            }}
            colon={false}
            autoComplete="off"
            className="flex flex-wrap gap-x-6"
            initialValues={{
              mobileCountryCode: '65',
            }}
          >
            {renderFieldList()}
          </Form>
          <CropUploadFile
            isEdit={!isEdit}
            avatarUrl={profilePhotoDestination}
            onChangeFile={onChangeFile}
          />
        </div>
        {!id && (
          <div className="gap-[10px] flex justify-end flex-wrap cus-width-my-info">
            {isEdit ? (
              <>
                <ButtonCustom color="outline" onClick={() => setIsOpenTwoFA(true)}>
                  2FA
                </ButtonCustom>
                <ModalCustom
                  titleCenter
                  title="Sync your calendar to"
                  content={
                    <div className="flex gap-x-[10px] justify-between mt-3">
                      <ButtonCustom color="outline">Google</ButtonCustom>
                      <ButtonCustom color="outline">Microsoft 365</ButtonCustom>
                    </div>
                  }
                  viewComponent={
                    <ButtonCustom color="outline" >Sync Calendar</ButtonCustom>
                  }
                />
                <ButtonCustom
                  color="outline"
                  onClick={() => history(ROUTES.profile_change_password)}
                >
                  Change Password
                </ButtonCustom>
                <ButtonCustom onClick={handleOpenUpdateProfile} color="orange">
                  Edit Profile
                </ButtonCustom>
              </>
            ) : (
              <>
                <ButtonCustom color="outline" onClick={handleCancelEditProfile}>
                  Cancel
                </ButtonCustom>
                <ButtonCustom htmlType="submit" onClick={form.submit} color="orange">
                  Update
                </ButtonCustom>
              </>
            )}
          </div>
        )}
      </Content>
    );
  }, [
    isEdit,
    form,
    setIsEdit,
    formChangePassword,
    handleOpenUpdateProfile,
    isOpenTwoFA,
    setIsOpenTwoFA,
    dataTheme,
    isChanging,
    profilePhotoDestination,
  ]);

  useEffect(() => {
    if (!timeLeft) {
      return;
    }
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const onResendCode = () => {
    const { mobileCountryCode, newContactNumber: newContactNumberPhone } =
      formChangeContactNumber.getFieldsValue();
    mutateChangeContactNumber({
      newMobileCountryCode: mobileCountryCode,
      newContactNumber: newContactNumberPhone,
    });
  };

  const onFinishContactNumber = (
    values: {
      currentContactNumber: string;
      newContactNumber: string;
      mobileCountryCode: string;
    },
    otp: string,
  ) => {
    mutateVerifyChangeContactNumber({
      newMobileCountryCode: values.mobileCountryCode,
      newContactNumber: values.newContactNumber,
      otp,
    });
  };

  const renderModalChangeContactNumber = useCallback(() => {
    return (
      <ModalChangeContactNumber
        onResendCode={onResendCode}
        setIsKeepOpen={setIsKeepOpen}
        onFinishContactNumber={onFinishContactNumber}
        isOpen={isModalChangeContactNumber}
        isKeepOpen={isKeepOpen}
        timeLeft={timeLeft}
        formChangeContactNumber={formChangeContactNumber}
        setIsOpen={setIsModalChangeContactNumber}
        newContactNumber={newContactNumber}
        setTimeLeft={setTimeLeft}
      />
    );
  }, [isModalChangeContactNumber, timeLeft, isKeepOpen, newContactNumber, setTimeLeft]);

  useEffect(() => {
    if (!timeLeftEmail) {
      return;
    }
    const intervalId = setInterval(() => {
      setTimeLeftEmail(timeLeftEmail - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeftEmail]);

  const onResendCodeEmail = useCallback(() => {
    mutateUpdateNewEmail({ newEmail });
    if (timeLeftEmail > 0) return;
    setTimeLeftEmail(120);
  }, [newEmail]);

  const onFinishChangeEmail = (values: { newEmail: string }, otp: string) => {
    if (otp?.length === 6 && values.newEmail) {
      mutateVerifyUpdateNewEmail({ otp, newEmail: values.newEmail });
    }
  };

  const handleChangeEmail = (values: { newEmail: string }) => {
    mutateUpdateNewEmail({ newEmail: values.newEmail });
    formChangeEmail.setFieldsValue({ newEmail: values.newEmail });
  };

  const renderModalChangeEmail = useCallback(() => {
    return (
      <ModalChangeEmail
        isOpen={isOpenModalChangeEmail}
        handleChangeEmail={handleChangeEmail}
        formInsertEmail={formInsertEmail}
        setIsOpen={setIsOpenModalChangeEmail}
      />
    );
  }, [isOpenModalChangeEmail]);

  const renderModalVerifyChangeEmail = useCallback(() => {
    return (
      <ModalVerifyChangeEmail
        setIsOpen={setIsOpenModalVerifyChangeEmail}
        formChangeEmail={formChangeEmail}
        setOtpCode={setOtpCode}
        otpCode={otpCode}
        timeLeft={timeLeftEmail}
        isOpen={isOpenModalVerifyChangeEmail}
        setIsKeepOpen={setIsKeepOpen}
        isKeepOpen={isKeepOpen}
        onResendCodeEmail={onResendCodeEmail}
        onFinish={onFinishChangeEmail}
      />
    );
  }, [
    isOpenModalVerifyChangeEmail,
    timeLeftEmail,
    isKeepOpen,
    setOtpCode,
    otpCode,
    onResendCodeEmail,
  ]);

  return (
    <>
      {renderContent()}
      {isOpenConfirmUpdateProfile && (
        <ModalCustom
          title="Confirmation"
          visible={true}
          onSubmit={handleConfirmUpdateProfile}
          onCancel={() => setIsOpenConfirmUpdateProfile(false)}
          titleCenter
          content="Are you sure you want to update your profile?"
          okText="Confirm"
          cancelText="Cancel"
        />
      )}
      {isOpenConfirmCancelEditProfile && (
        <ModalCustom
          title="Notice"
          visible={true}
          onSubmit={handleConfirmCancelEditProfile}
          onCancel={() => setIsOpenConfirmCancelEditProfile(false)}
          titleCenter
          content={WARNING_MESSAGE.LEAVE_MANAGE_ADMIN_INFO}
          okText="Confirm"
          cancelText="Cancel"
        />
      )}
      {renderModalChangeContactNumber()}
      {renderModalChangeEmail()}
      {renderModalVerifyChangeEmail()}
      <ModalUpdatedEmail
        visible={isModalNotification}
        onCancel={() => {
          setIsModalNotification(false);
          setMessageNotification('');
        }}
        message={messageNotification}
      />

      <ModalUpdateTwoFA
        onCancel={() => {
          setIsOpenTwoFA(false);
        }}
        setIsOpenTwoFA={setIsOpenTwoFA}
        setMethod={setMethod}
        method={method}
        isOpen={isOpenTwoFA}
      />
    </>
  );
};

export default MyInfo;
