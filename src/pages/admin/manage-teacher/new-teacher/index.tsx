import { Form, Layout, notification } from 'antd';
import { RuleObject } from 'antd/lib/form';
import { getListRolesAdmin } from 'api/access_control';
import { createAdmin } from 'api/admin';
import { searchCentres, searchCentresOfAdmin } from 'api/centres';
import { createSubjectTag, searchSubjectTag } from 'api/subjectTag';
import { createTeacher, createTeacherOfCentreAdmin } from 'api/teacher';
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
  KeyFormChangeData,
  PARAMS_SELECT_SEARCH,
  REGEX_EMAIL,
  ROLE,
  ROUTES,
  TEXT_SELECT_SEARCH,
  WARNING_MESSAGE,
} from 'constants/index';
import { AppContext } from 'context';
import {
  KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import './new-teacher.css';

const { Content } = Layout;

export interface IRole {
  id: number;
  roleName: string;
}

const NewTeacher = () => {
  const [form] = Form.useForm();
  const timeout: any = useRef(null);
  const history = useNavigate();
  const [state]: any = useContext(AppContext);
  const isAdmin = state?.user?.centreAdmin;
  const adminId = state?.user?.centreAdmin?.id;
  const firstName = Form.useWatch('firstName', form);
  const lastName = Form.useWatch('lastName', form);
  const role = Form.useWatch('role', form);
  const subjectTag = Form.useWatch('subjectTag', form);
  const centre = Form.useWatch('centre', form);

  const [isSubmit, setIsSubmit] = useState(false);
  const [isOpenModalConfirmLeaveCreateTeacher, setIsOpenModalConfirmLeaveCreateTeacher] =
    useState(false);
  const [isFieldsChange, setIsFieldsChange] = useState(false);
  const [isOpenConfirmLeave, setIsOpenConfirmLeave] = useState(false);
  const [dataRequest, setDataRequest] = useState({});
  const [subjectTagValue, setSubjectTagValue] = useState('');
  const [isOpenModalCreateTeacher, setIsOpenModalCreateTeacher] = useState(false);
  const [isClearSearchingSubject, setIsClearSearchingSubject] = useState(false);
  const [isOpenModalCreateTeacherSuccess, setIsOpenModalCreateTeacherSuccess] = useState(false);
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const [centreOptions, setCentreOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [subjectTagOptions, setSubjectTagOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);

  usePrompt(WARNING_MESSAGE.LEAVE_CREATE_TEACHER, isOpenConfirmLeave);

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

  const { mutate: getCentreOfAdmin } = useMutation('searchCentresOfAdmin', searchCentresOfAdmin, {
    onSuccess: (res: { data: { listCentres: { centreName: string; id: number }[] } }) => {
      const options = res.data.listCentres.map((centreItem) => {
        return {
          label: centreItem.centreName,
          value: centreItem.id.toString(),
        };
      });
      setCentreOptions(options as { label: string; value: string }[]);
    },
  });

  const { mutate: getSubjectTag } = useMutation('searchSubjectTag', searchSubjectTag, {
    onSuccess: ({ data }: { data: { listSubjectTags: { tagName: string; id: number }[] } }) => {
      if (data?.listSubjectTags?.length > 0) {
        const options = data.listSubjectTags
          .map((item) => {
            return { label: item.tagName, value: item.id.toString(), isDisabled: false };
          })
          .concat([{ label: TEXT_SELECT_SEARCH.subjectTag, value: '', isDisabled: true }]);
        setSubjectTagOptions(options);
        return;
      }
      setSubjectTagOptions([]);
    },
  });

  const { mutate: createNewTeacher } = useMutation('createTeacher', createTeacher, {
    onSuccess: () => {
      setIsOpenModalCreateTeacherSuccess(true);
    },
    onError: ({ response }) => {
      if (response.status == 403) {
        notification.error({ message: 'You are not allowed to create teacher.' });
        return;
      }
      if (response.data.message.includes('already exists')) {
        form.setFields([{ name: 'email', errors: [ERROR_MESSAGE.EMAIL_ALREADY_EXIST] }]);
        return;
      }
      if (response.status == 403) {
        notification.error({ message: 'You are not allowed to create teacher.' });
      } else {
        notification.error({ message: response.data.message });
      }
    },
  });

  const { mutate: createNewTeacherOfCentreAdmin } = useMutation(
    'createTeacher',
    createTeacherOfCentreAdmin,
    {
      onSuccess: () => {
        setIsOpenModalCreateTeacherSuccess(true);
      },
      onError: ({ response }) => {
        if (response.status == 403) {
          notification.error({ message: 'You are not allowed to create teacher.' });
          return;
        }
        if (response.data.message.includes('already exists')) {
          form.setFields([{ name: 'email', errors: [ERROR_MESSAGE.EMAIL_ALREADY_EXIST] }]);
          return;
        }
        notification.error({ message: response.data.message });
      },
    },
  );

  const { mutate: createNewSubjectTag } = useMutation('createSubjectTag', createSubjectTag, {
    onSuccess: ({ data }: { data: { id: number; tagName: string } }) => {
      setSubjectTagOptions([
        ...subjectTagOptions,
        { label: data.tagName, value: data.id.toString(), isDisabled: false },
      ]);
      form.setFieldsValue({
        subjectTag: subjectTag
          ? [...subjectTag, { label: data.tagName, value: data.id.toString(), isDisabled: false }]
          : [{ label: data.tagName, value: data.id.toString(), isDisabled: false }],
      });
      setIsClearSearchingSubject(true);
      setSubjectTagValue('');
      getSubjectTag({ ...PARAMS_SELECT_SEARCH.subjectTag });
    },
    onError: ({ response }: { response: { data: { message: string } } }) => {
      notification.error({ message: response.data.message });
    },
  });

  useEffect(() => {
    getRoles({
      ...PARAMS_SELECT_SEARCH.role,
      filters: JSON.stringify([{ templateName: ROLE.TEACHER }]),
    });
    getSubjectTag(PARAMS_SELECT_SEARCH.subjectTag);

    if (adminId && isAdmin) {
      getCentreOfAdmin({ ...PARAMS_SELECT_SEARCH.centre, id: Number(adminId) });
      return;
    }
    getCentres(PARAMS_SELECT_SEARCH.centre);
  }, [adminId, isAdmin]);

  const handleCreateNewTeacher = (values: IAdminInfo) => {
    setIsOpenModalCreateTeacher(true);
    const teacherInfo = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      centreIDs: values?.centre?.map((item) => Number(item.value)),
      userRoleID: Number(values.role?.value),
      remark: values?.remark?.trim(),
      designation: values.designation,
      subjectTagIDs: values?.subjectTag?.map((item) => Number(item.value)),
    };

    setDataRequest(teacherInfo);
  };

  const handleConfirmCreateTeacher = useCallback(() => {
    setIsOpenConfirmLeave(false);
    if (adminId && isAdmin) {
      createNewTeacherOfCentreAdmin({
        params: dataRequest as IAdminInfo,
        adminId: Number(adminId),
      });
      return;
    }
    createNewTeacher(dataRequest as IAdminInfo);
  }, [dataRequest, isAdmin, adminId]);

  const handleCreateSubjectTag = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (
        event.key === KeyFormChangeData.ENTER &&
        !subjectTagOptions?.some((subject) => subject.label === subjectTagValue) &&
        subjectTagValue
      ) {
        createNewSubjectTag({ tagName: subjectTagValue });
        return;
      }
      return;
    },
    [subjectTagOptions, subjectTagValue, createNewSubjectTag],
  );

  const handleSearchCentre = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        if (adminId && isAdmin) {
          getCentreOfAdmin({ ...PARAMS_SELECT_SEARCH.centre, search: value, id: Number(adminId) });
          return;
        }
        getCentres({ ...PARAMS_SELECT_SEARCH.centre, search: value });
      }, 500);
    },
    [timeout, isAdmin, adminId],
  );

  const handleSearchSubjectTag = useCallback(
    (value: string) => {
      setSubjectTagValue(value);
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getSubjectTag({ ...PARAMS_SELECT_SEARCH.subjectTag, search: value });
        setIsClearSearchingSubject(false);
      }, 500);
    },
    [timeout],
  );

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
        handleSearch: handleSearchCentre,
      },
      {
        label: 'Subject Tag',
        name: 'subjectTag',
        type: 'select-search',
        options: subjectTagOptions,
        isMultiple: true,
        onKeyPress: handleCreateSubjectTag,
        handleSearch: handleSearchSubjectTag,
        isClearSearchValue: isClearSearchingSubject,
        rules: [{ required: true, message: 'Subject Tag is required!' }],
      },
      {
        label: 'Remarks',
        name: 'remark',
        type: 'string',
      },
    ],
    [centreOptions, roleOptions, subjectTagOptions, isClearSearchingSubject],
  );

  const errorSelect = useCallback(
    (fieldName: string) => {
      switch (fieldName) {
        case 'centre':
          return isSubmit && (!centre || centre?.length === 0);
        case 'role':
          return isSubmit && !role;
        case 'subjectTag':
          return isSubmit && (!subjectTag || subjectTag?.length === 0);
        default:
          break;
      }
    },
    [centre, isSubmit, role, subjectTag],
  );

  const renderField = useCallback(
    (field: IFieldListForm) => {
      switch (field.type) {
        case FIELDS.STRING:
          return <CustomInput type={field.type} />;

        case FIELDS.SELECT_SEARCH:
          return (
            <SelectSearch
              handleSearchOptions={field?.handleSearch ? field?.handleSearch : () => {}}
              options={field.options}
              className={errorSelect(field.name) ? 'field-error' : ''}
              isMultiple={field?.isMultiple}
              onKeyPress={field?.onKeyPress ? field?.onKeyPress : () => {}}
              isClearSearchValue={field?.isClearSearchValue}
            />
          );

        default:
          return <CustomInput type={field.type} />;
      }
    },
    [DATE_FORMAT, fieldList, errorSelect],
  );

  const handleCancelCreatedTeacher = () => {
    setIsOpenModalCreateTeacherSuccess(false);
    history(ROUTES.teacher);
  };

  const handleCancelCreateNewTeacher = () => {
    if (isFieldsChange) {
      setIsOpenModalConfirmLeaveCreateTeacher(true);
      return;
    }

    history(ROUTES.teacher);
  };

  const renderModalCreateTeacher = useCallback(() => {
    return (
      isOpenModalCreateTeacher && (
        <ModalCustom
          content={`Are you sure you want to create ${firstName + ' ' + lastName} as ${
            roleOptions.find((item) => item.value === role.value)?.label
          }?`}
          visible={true}
          title="Create"
          titleCenter
          cancelText="Cancel"
          okText="Confirm"
          onSubmit={handleConfirmCreateTeacher}
          onCancel={() => setIsOpenModalCreateTeacher(false)}
        />
      )
    );
  }, [isOpenModalCreateTeacher, firstName, lastName, role]);

  const renderModalCreateTeacherSuccess = useCallback(() => {
    return (
      isOpenModalCreateTeacherSuccess && (
        <ModalCustom
          visible={true}
          title=""
          titleCenter
          cancelText="Back"
          onCancel={handleCancelCreatedTeacher}
        >
          <div>
            <EmailSentSVG />
            <div className="font-semibold text-2xl">
              Account creation successful. An email has been sent to the teacher’s email address
            </div>
          </div>
        </ModalCustom>
      )
    );
  }, [isOpenModalCreateTeacherSuccess]);

  return (
    <Content className="p-8 bg-white sm:w-full md:w-full lg:w-full xl:w-2/3 2xl-w-2/3 rounded-3xl shadow[#0000000a] cus-width">
      <Form
        autoComplete="off"
        form={form}
        layout="vertical"
        colon={false}
        onFinish={handleCreateNewTeacher}
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
            <ButtonCustom onClick={handleCancelCreateNewTeacher} color="outline">
              Cancel
            </ButtonCustom>
            <ButtonCustom
              onClick={() => {
                form.submit();
                setIsSubmit(true);
              }}
              color="orange"
            >
              Create
            </ButtonCustom>
          </div>
        </Form.Item>
      </Form>
      {renderModalCreateTeacher()}
      {renderModalCreateTeacherSuccess()}
      <ModalCustom
        visible={isOpenModalConfirmLeaveCreateTeacher}
        title="Notice"
        okText="Confirm"
        onCancel={() => setIsOpenModalConfirmLeaveCreateTeacher(false)}
        cancelText="Cancel"
        titleCenter
        onSubmit={() => {
          setIsOpenConfirmLeave(false);
          setTimeout(() => {
            history(ROUTES.teacher);
          }, 100);
        }}
        content={WARNING_MESSAGE.LEAVE_CREATE_TEACHER}
      />
    </Content>
  );
};

export default NewTeacher;
