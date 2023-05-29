import { Form, Layout, notification } from 'antd';
import { RuleObject } from 'antd/lib/form';
import { getListRolesAdmin } from 'api/access_control';
import { createAdmin } from 'api/admin';
import { searchCentres } from 'api/centres';
import { ReactComponent as EmailSentSVG } from 'assets/images/emailsent.svg';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import SelectSearch from 'components/SelectSearch';
import usePrompt from 'constants/function';
import {
  DATE_FORMAT,
  ERROR_MESSAGE,
  FIELDS,
  IAdminInfo,
  IFieldListForm,
  PARAMS_SELECT_SEARCH,
  REGEX_EMAIL,
  ROLE,
  ROUTES,
  TEXT_SELECT_SEARCH,
  WARNING_MESSAGE,
} from 'constants/index';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;

export interface IRole {
  id: number;
  roleName: string;
}

const NewAdmin = () => {
  const [form] = Form.useForm();
  const timeout: any = useRef(null);
  const history = useNavigate();
  const firstName = Form.useWatch('firstName', form);
  const lastName = Form.useWatch('lastName', form);
  const role = Form.useWatch('role', form);
  const centre = Form.useWatch('centre', form);

  const [isSubmit, setIsSubmit] = useState(false);
  const [isOpenModalConfirmLeaveCreateAdmin, setIsOpenModalConfirmLeaveCreateAdmin] =
    useState(false);
  const [isFieldsChange, setIsFieldsChange] = useState(false);
  const [isOpenConfirmLeave, setIsOpenConfirmLeave] = useState(false);
  const [dataRequest, setDataRequest] = useState({});
  const [isOpenModalCreateAdmin, setIsOpenModalCreateAdmin] = useState(false);
  const [isOpenModalCreateAdminSuccess, setIsOpenModalCreateAdminSuccess] = useState(false);
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const [centreOptions, setCentreOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);

  usePrompt(WARNING_MESSAGE.LEAVE_CREATE_ADMIN, isOpenConfirmLeave);

  const { mutate: getRoles } = useMutation('getListRoles', getListRolesAdmin, {
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

  const { mutate: createAdminCentre } = useMutation('createAdmin', createAdmin, {
    onSuccess: () => {
      setIsOpenModalCreateAdminSuccess(true);
    },
    onError: ({ response }) => {
      if (response.data.message.includes('already exists')) {
        form.setFields([{ name: 'email', errors: [ERROR_MESSAGE.EMAIL_ALREADY_EXIST] }]);
        return;
      }
      if(response.status == 403) {
        notification.error({ message: "You are not allowed to create admin." });
      } else {
        notification.error({ message: response.data.message });
      }
    },
  });

  useEffect(() => {
    getRoles({
      ...PARAMS_SELECT_SEARCH.role,
      filters: JSON.stringify([{ templateName: ROLE.ADMIN }]),
    });
    getCentres(PARAMS_SELECT_SEARCH.centre);
  }, []);

  const handleCreateNewAdmin = (values: IAdminInfo) => {
    setIsOpenModalCreateAdmin(true);
    const adminInfo = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      centreIDs: values?.centre?.map((item) => Number(item.value)),
      userRoleID: Number(values.role?.value),
      remark: values?.remark?.trim(),
      designation: values.designation,
    };

    setDataRequest(adminInfo);
  };

  const handleConfirmCreateAdmin = useCallback(() => {
    setIsOpenConfirmLeave(false);
    createAdminCentre(dataRequest as IAdminInfo);
  }, [dataRequest]);

  const fieldList = useMemo(
    () => [
      {
        label: 'First Name',
        name: 'firstName',
        type: 'string',
        rules: [{ required: true, message: 'First Name is required!' }],
      },
      {
        label: 'Last Name',
        name: 'lastName',
        type: 'string',
        rules: [{ required: true, message: 'Last Name is required!' }],
      },
      {
        label: 'Email Address',
        name: 'email',
        type: 'string',
        rules: [
          { required: true, message: 'Email Address is required!' },
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
        label: 'Remark',
        name: 'remark',
        type: 'string',
      },
      {
        label: 'Designation',
        name: 'designation',
        type: 'string',
        rules: [{ required: true, message: 'Designation is required!' }],
      },
      {
        label: 'Role',
        name: 'role',
        type: 'select-search',
        rules: [{ required: true, message: 'Role is required!' }],
        options: roleOptions,
      },
      {
        label: 'Centre',
        name: 'centre',
        type: 'select-search',
        rules: [{ required: true, message: 'Centre is required!' }],
        options: centreOptions,
        isMultiple: true,
      },
    ],
    [centreOptions, roleOptions],
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

  const errorSelect = useCallback(
    (fieldName: string) => {
      switch (fieldName) {
        case 'centre':
          return isSubmit && (!centre || centre?.length === 0);
        case 'role':
          return isSubmit && !role;
        default:
          break;
      }
    },
    [centre, isSubmit, role],
  );

  const renderField = useCallback(
    (field: IFieldListForm) => {
      switch (field.type) {
        case FIELDS.STRING:
          return <CustomInput type={field.type} />;

        case FIELDS.SELECT_SEARCH:
          return (
            <SelectSearch
              handleSearchOptions={field.name === fieldList[5].name ? handleSearchCentre : () => {}}
              options={field.options}
              className={errorSelect(field.name) ? 'field-error' : ''}
              isMultiple={field?.isMultiple}
            />
          );

        default:
          return <CustomInput type={field.type} />;
      }
    },
    [DATE_FORMAT, fieldList, errorSelect],
  );

  const handleCancelCreatedAdmin = () => {
    setIsOpenModalCreateAdminSuccess(false);
    history(ROUTES.manage_admin);
  };

  const handleCancelCreateNewAdmin = () => {
    if (isFieldsChange) {
      setIsOpenModalConfirmLeaveCreateAdmin(true);
      return;
    }

    history(ROUTES.manage_admin);
  };

  const renderModalCreateAdmin = useCallback(() => {
    return (
      isOpenModalCreateAdmin && (
        <ModalCustom
          content={`Are you sure you want to create ${firstName + ' ' + lastName} as ${
            roleOptions.find((item) => item.value === role.value)?.label
          }?`}
          visible={true}
          title="Create"
          titleCenter
          cancelText="Cancel"
          okText="Confirm"
          onSubmit={handleConfirmCreateAdmin}
          onCancel={() => setIsOpenModalCreateAdmin(false)}
        />
      )
    );
  }, [isOpenModalCreateAdmin, firstName, lastName, role]);

  const renderModalCreateAdminSuccess = useCallback(() => {
    return (
      isOpenModalCreateAdminSuccess && (
        <ModalCustom
          visible={true}
          title=""
          titleCenter
          cancelText="Back"
          onCancel={handleCancelCreatedAdmin}
        >
          <div>
            <EmailSentSVG />
            <div className="font-semibold text-2xl">
              Account creation successful. An email has been sent to the admin’s email address
            </div>
          </div>
        </ModalCustom>
      )
    );
  }, [isOpenModalCreateAdminSuccess]);

  return (
    <Content className="p-8 bg-white sm:w-full md:w-full lg:w-full xl:w-2/3 2xl-w-2/3 rounded-3xl shadow[#0000000a]">
      <Form
        autoComplete="off"
        form={form}
        layout="vertical"
        colon={false}
        onFinish={handleCreateNewAdmin}
        onFieldsChange={() => {
          setIsFieldsChange(true);
          setIsOpenConfirmLeave(true);
        }}
      >
        <div className="flex flex-wrap gap-x-3">
          {fieldList?.length > 0 &&
            fieldList.map((field, index) => (
              <Form.Item
                className="form-item-half-width"
                rules={field.rules}
                label={field.label}
                key={index}
                name={field.name}
                validateFirst
              >
                {renderField(field)}
              </Form.Item>
            ))}
        </div>

        <Form.Item className="w-full">
          <div className="flex gap-4 float-right mt-3 w-full justify-end">
            <ButtonCustom onClick={handleCancelCreateNewAdmin} color="outline">
              Cancel
            </ButtonCustom>
            <ButtonCustom onClick={() => setIsSubmit(true)} color="orange" htmlType="submit">
              Create
            </ButtonCustom>
          </div>
        </Form.Item>
      </Form>
      {renderModalCreateAdmin()}
      {renderModalCreateAdminSuccess()}
      <ModalCustom
        visible={isOpenModalConfirmLeaveCreateAdmin}
        title="Notice"
        okText="Confirm"
        onCancel={() => setIsOpenModalConfirmLeaveCreateAdmin(false)}
        cancelText="Cancel"
        titleCenter
        onSubmit={() => {
          history(ROUTES.manage_admin);
        }}
        content={WARNING_MESSAGE.LEAVE_CREATE_ADMIN}
      />
    </Content>
  );
};

export default NewAdmin;
