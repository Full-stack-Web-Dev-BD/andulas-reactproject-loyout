import { DatePicker, Form, Input, notification, Select } from 'antd';
import { RuleObject } from 'antd/lib/form';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType, DefaultOptionType } from 'antd/lib/select';
import { getListRoles, getListRolesAdmin } from 'api/access_control';
import { updateCentreAdminProfile } from 'api/admin';
import { searchCentres } from 'api/centres';
import { getFileUrl, uploadAvatar } from 'api/user';
import ButtonCustom from 'components/Button';
import CropUploadFile from 'components/CropUploadFile';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import SelectSearch from 'components/SelectSearch';
import {
  DATE_FORMAT,
  ERROR_MESSAGE,
  FIELDS,
  IFieldListForm,
  PARAMS_SELECT_SEARCH,
  REGEX_EMAIL,
  REGEX_LOGIN_ID,
  REGEX_NUMBER,
  ROLE,
  ROUTES,
  TEXT_SELECT_SEARCH,
  WARNING_MESSAGE,
} from 'constants/index';
import { IAdminProfile } from 'constants/types';
import { AppContext } from 'context';
import moment from 'moment';
import { codesPhoneNumber } from 'pages/auth/register';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Area } from 'react-easy-crop';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

export interface IRole {
  id: number;
  roleName: string;
}

const errorValidation = [
  { key: 'email', fieldName: 'email' },
  { key: 'Username', fieldName: 'username' },
  { key: 'This number is already', fieldName: 'contactNumber' },
];

const AdminInformation = ({
  isEdit,
  setIsEdit,
  isChanging,
  setIsChanging,
  profile,
  isDisableEdit,
  mutateGetCentreAdminDetail,
}: {
  isEdit: boolean;
  setIsEdit: (value: boolean) => void;
  isChanging: boolean;
  setIsChanging: (value: boolean) => void;
  profile?: IAdminProfile;
  isDisableEdit: boolean;
  mutateGetCentreAdminDetail: (value: { id: number }) => void;
}) => {
  const history = useNavigate();
  const { id } = useParams();
  const timeout: any = useRef(null);
  const [state]: any = useContext(AppContext);

  const [form] = Form.useForm();
  const centreIDs = Form.useWatch('centreIDs', form);
  const userRoleID = Form.useWatch('userRoleID', form);
  const firstName = Form.useWatch('firstName', form);
  const lastName = Form.useWatch('lastName', form);
  const [isModalNotice, setIsModalNotice] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [filePath, setFilePath] = useState<string>('');
  const [profilePhotoDestination, setProfilePhotoDestination] = useState('');
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [centreOptions, setCentreOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const contactNumber = Form.useWatch('contactNumber', form);

  const handleBack = () => {
    if (isChanging) {
      setIsModalNotice(true);
      return;
    }
    if (isEdit) {
      setIsEdit(false);
      return;
    }
    history(ROUTES.manage_admin);
  };

  const { mutate: getRoles } = useMutation('getListRolesAdmin', getListRolesAdmin, {
    onSuccess: ({ data }: { data: { listRoles: IRole[] } }) => {
      const options = data.listRoles
        .map((item) => {
          return { label: item.roleName, value: item.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.role, value: '', isDisabled: true }]);
      setRoleOptions(options);
    },
  });

  const { mutate: getCentres } = useMutation('searchCentres', searchCentres, {
    onSuccess: ({ data }: { data: { listCentres: { centreName: string; id: number }[] } }) => {
      const options = data.listCentres
        .map((item) => {
          return { label: item.centreName, value: item.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.centre, value: '', isDisabled: true }]);
      setCentreOptions(options);
    },
  });

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

  const { mutate: mutateUpdateCentreAdminProfile } = useMutation(
    'updateCentreAdminProfile',
    updateCentreAdminProfile,
    {
      onSuccess: () => {
        setIsEdit(false);
        setIsSubmit(true);
        setIsChanging(false);
        mutateGetCentreAdminDetail({ id: Number(id) });
        // history(ROUTES.manage_admin);
      },
      onError: ({ response }) => {
        const message = response.data.message;
        if (response.status == 403) {
          notification.error({ message: 'You are not allowed to edit admin.' });
          return;
        }
        let isErrorValid = false;
        errorValidation.map((error) => {
          if (message.includes(error.key)) {
            isErrorValid = true;
            form.setFields([
              {
                name: error.fieldName,
                errors: [message],
              },
            ]);
            return;
          }
        });

        if (!isErrorValid) {
          notification.error({ message: message });
        }
      },
    },
  );

  useEffect(() => {
    form.setFieldsValue({ phoneNumber: contactNumber });
  }, [contactNumber]);

  const fields = useMemo(
    () => [
      {
        label: 'Admin Name 1',
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
        name: 'phoneNumber',
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
        label: 'Designation',
        name: 'designation',
        type: 'string',
        rules: [{ required: true, message: 'Please input your Designation!' }],
      },
      {
        label: 'Role',
        name: 'userRoleID',
        type: 'select-search',
        rules: [{ required: true, message: 'Role is required!' }],
        options: roleOptions,
      },
      {
        label: 'Centre',
        name: 'centreIDs',
        type: 'select-search',
        rules: [{ required: true, message: 'Centre is required!' }],
        options: centreOptions,
        isMultiple: true,
      },
      {
        label: 'Remark',
        name: 'remark',
        type: 'string',
      },
      {
        label: 'Registration Date',
        name: 'registrationDate',
        type: 'string',
        disabled: true,
      },
      {
        label: 'Last Login Date',
        name: 'lastLoginDate',
        type: 'string',
        disabled: true,
      },
    ],
    [roleOptions, centreOptions],
  );

  const errorSelect = useCallback(
    (fieldName: string) => {
      switch (fieldName) {
        case 'centreIDs':
          return isSubmit && (!centreIDs || centreIDs?.length === 0);
        case 'userRoleID':
          return isSubmit && !userRoleID;
        default:
          break;
      }
    },
    [centreIDs, isSubmit, userRoleID],
  );

  const handleSearchCentre = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getCentres({ ...PARAMS_SELECT_SEARCH.centre, search: value });
      }, 500);
    },
    [timeout],
  );

  useEffect(() => {
    form.setFieldsValue({ adminName: firstName + ' ' + lastName });
  }, [firstName, lastName]);

  const renderField = useCallback(
    (field: IFieldListForm) => {
      switch (field.type) {
        case FIELDS.STRING:
          return (
            <CustomInput disabled={!isEdit || field.disabled || isDisableEdit} type={field.type} />
          );
        case FIELDS.NUMBER:
          return <CustomInput disabled={!isEdit || isDisableEdit} type={field.type} />;
        case FIELDS.DATE:
          return (
            <DatePicker
              disabled={!isEdit || isDisableEdit}
              format={DATE_FORMAT}
              inputReadOnly
              className="style_input_custom_login_page"
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
                <CustomInput
                  disabled={!isEdit || isDisableEdit}
                  placeholder="First Name"
                  type="string"
                  classNameWrapper="w-[calc(50%_-_0.375rem)]"
                />
              </Form.Item>
              <Form.Item
                noStyle
                rules={[{ required: true, message: 'Last Name is required!' }]}
                name={field.nameChild ? field.nameChild[1] : ''}
              >
                <CustomInput
                  disabled={!isEdit || isDisableEdit}
                  placeholder="Last Name"
                  type="string"
                  classNameWrapper="w-[calc(50%_-_0.375rem)]"
                />
              </Form.Item>
            </div>
          );
        case FIELDS.SELECT:
          return (
            <Select
              getPopupContainer={(node) => node}
              options={field.options as (BaseOptionType | DefaultOptionType)[]}
              disabled={!isEdit || isDisableEdit}
            />
          );
        case FIELDS.SELECT_SEARCH:
          return (
            <SelectSearch
              handleSearchOptions={field.name === fields[4].name ? handleSearchCentre : () => {}}
              options={field.options}
              className={errorSelect(field.name) ? 'field-error' : ''}
              isMultiple={field?.isMultiple}
              disable={!isEdit || isDisableEdit}
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
                  disabled={!isEdit || isDisableEdit}
                />
              </Form.Item>
              <Form.Item
                noStyle
                validateFirst
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
                  disabled={!isEdit || isDisableEdit}
                  className="style_input_custom_login_page w-[75%] rounded-r-2xl"
                />
              </Form.Item>
            </Input.Group>
          );
        case '':
          return <div></div>;
        default:
          return <CustomInput disabled={!isEdit || isDisableEdit} type={field.type} />;
      }
    },
    [DATE_FORMAT, isEdit, errorSelect, isDisableEdit],
  );

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
        userRoleID: {
          label: profile?.user?.userRole?.roleName,
          value: profile?.user?.userRole?.id?.toString(),
        },
        centreIDs: profile?.centres?.map((x) => ({ value: x.id.toString(), label: x.centreName })),
        remark: profile?.remark,
        designation: userProfile?.designation,
        registrationDate: moment.utc(profile?.createdAt).local().format('DD/MM/YYYY'),
        lastLoginDate: moment.utc(profile?.user?.lastLogin).local().format('DD/MM/YYYY'),
      });

      if (userProfile?.profilePhotoDestination) {
        setFilePath(userProfile.profilePhotoDestination);
        getAvatar(userProfile.profilePhotoDestination);
      }
    }
  }, [profile, isEdit]);

  useEffect(() => {
    getRoles({
      ...PARAMS_SELECT_SEARCH.role,
      filters: JSON.stringify([{ templateName: ROLE.ADMIN }]),
    });
    getCentres(PARAMS_SELECT_SEARCH.centre);
  }, []);

  const renderFieldList = useCallback(() => {
    return fields?.map((field, index) => (
      <Form.Item
        className={'sm:w-full w-[calc(50%_-_0.5rem)]'}
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

  return (
    <Content className="rounded-3xl bg-white p-8">
      <div className="flex gap-x-3 xl:flex-col">
        <Form
          layout="vertical"
          className="flex flex-wrap gap-x-4 flex-[62%]"
          form={form}
          onFieldsChange={() => {
            setIsChanging(true);
          }}
          onFinish={(values) => {
            mutateUpdateCentreAdminProfile({
              params: {
                ...values,
                centreIDs: values.centreIDs.map((x: { value: number; label: string }) =>
                  Number(x.value),
                ),
                profilePhotoDestination: filePath,
                userRoleID: Number(values.userRoleID.value),
                dateOfBirth: moment(values.dateOfBirth).format('YYYY-MM-DD'),
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

      {!isDisableEdit && (
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
      )}
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

export default AdminInformation;
