import { CloseOutlined } from '@ant-design/icons';
import { Form, Switch, Tag } from 'antd';
import {
  createNewRegistrationField,
  deleteRegistrationById,
  getAllRegistrationField,
  getAllRegistrationFieldTypes,
  updateRegistrationFieldOfCourse,
} from 'api/courses';
import { ReactComponent as CloseIcon } from 'assets/icons/close.svg';
import ButtonCustom from 'components/Button';
import CheckboxCustom from 'components/Checkbox';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import SelectCustom from 'components/Select';
import { WARNING_MESSAGE } from 'constants/messages';
import { INPUT_TYPE, ROUTES } from 'constants/constants';
import React, { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import './style.css';

interface IRegistration {
  label: string;
  type: string;
  listOfValues?: string[];
  selected: boolean;
  required: number | boolean;
  id: number;
}

interface IDataCreate {
  label: string;
  type: string;
  value: string;
  required: boolean;
}

const fields = [
  {
    label: 'Label Name',
    name: 'label',
    rules: [{ required: true, message: 'Label is required!' }],
    type: 'text',
  },
  {
    label: 'Input Type',
    name: 'type',
    rules: [{ required: true, message: 'Input Type is required!' }],
    type: 'select',
    options: [
      { label: 'Text', value: 'Text' },
      { label: 'Dropdown', value: 'Dropdown' },
      { label: 'Radio', value: 'Radio' },
      { label: 'Checkbox', value: 'Checkbox' },
      { label: 'Upload', value: 'Upload' },
    ],
  },
];

const RegistrationDetails = ({
  courseTypeValue,
  idCreate,
  onBackTab,
  // setIsEdit,
  // isEdit,
  setCheckEdit,
  checkEdit,
  isChangeCourseValue,
  courseName,
  setIsChangeCourseValue,
  setIsOpenConfirmLeave,
}: {
  courseTypeValue: string;
  idCreate?: number;
  onBackTab: () => void;
  // setIsEdit: (value: boolean) => void;
  // isEdit: boolean;
  setCheckEdit: (value: boolean) => void;
  checkEdit: boolean;
  isChangeCourseValue?: boolean;
  courseName: string;
  setIsChangeCourseValue: (value: boolean) => void;
  setIsOpenConfirmLeave: (value: boolean) => void;
}) => {
  const history = useNavigate();
  const [courseId, setCourseId] = useState<number | undefined>();
  const { id } = useParams();
  const [registration, setRegistration] = useState<IRegistration[]>([]);
  const [checkAll, setCheckAll] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [form] = Form.useForm();
  const value = Form.useWatch('value', form);
  const [visible, setVisible] = useState(false);
  const type = Form.useWatch('type', form);
  const [listOfValue, setListOfValue] = useState<string[]>([]);
  const [fieldTypes, setFieldTypes] = useState<{ label: string; value: string }[]>([]);
  const [messageWarning, setMessageWarning] = useState<React.ReactNode>('');
  // const [checkEdit, setCheckEdit] = useState(false);
  const [modalNotice, setModalNotice] = useState(false);
  const [isKeepOpen, setIsKeepOpen] = useState(true);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);

  const { mutate: mutateGetAllRegistrationField } = useMutation(
    'getAllRegistrationField',
    getAllRegistrationField,
    {
      onSuccess: ({ data }) => {
        setRegistration(
          data.map((item: IRegistration) => ({
            id: item.id,
            type: item.type,
            label: item.label,
            selected: item.selected,
            required: item.required,
            listOfValues: item.listOfValues ? item.listOfValues.join(', ') : 'N/A',
          })),
        );
      },
    },
  );

  const { mutate: mutateGetAllRegistrationFieldTypes } = useMutation(
    'getAllRegistrationFieldTypes',
    getAllRegistrationFieldTypes,
    {
      onSuccess: ({ data }) => {
        setFieldTypes(
          data.map((item: string[]) => ({
            label: item,
            value: item,
          })),
        );
      },
    },
  );

  useEffect(() => {
    setCourseId(idCreate || Number(id));
  }, []);

  const { mutate: mutateCreateNewRegistrationField } = useMutation(
    'createNewRegistrationField',
    createNewRegistrationField,
    {
      onSuccess: () => {
        setIsKeepOpen(false);
        setVisible(false);
        mutateGetAllRegistrationField({ courseId: Number(courseId) });
        form.resetFields();
      },
      onError: ({ response }) => {
        setIsKeepOpen(true);
        form.setFields([
          {
            name: 'label',
            errors: [response.data.message],
          },
        ]);
      },
    },
  );

  const { mutate: mutateDeleteRegistrationById } = useMutation(
    'deleteRegistrationById',
    deleteRegistrationById,
    {
      onSuccess: () => {
        mutateGetAllRegistrationField({ courseId: Number(courseId) });
      },
      onError: ({ response }) => {
        setMessageWarning(response.data.message);
      },
    },
  );

  const { mutate: mutateUpdateRegistrationFieldOfCourse } = useMutation(
    'updateRegistrationFieldOfCourse',
    updateRegistrationFieldOfCourse,
    {
      onSuccess: () => {
        if (!isUpdate) {
          history(ROUTES.manage_course);
          return;
        }
        mutateGetAllRegistrationField({ courseId: Number(courseId) });
        setIsEdit(!isEdit);
        setIsUpdate(true);
        setCheckEdit(false);
      },
      onError: ({ response }) => {
        if (response.status == 403) {
          setMessageWarning('You are not allowed to edit course.');
        }
      },
    },
  );

  const handleCheckAll = () => {
    setRegistration(
      registration.map((card) => ({
        ...card,
        selected: !checkAll,
      })),
    );
    setCheckEdit(true);
    setIsOpenConfirmLeave(true);
  };

  const handleCloseCard = (registrationFieldId: number) => {
    mutateDeleteRegistrationById({ id: registrationFieldId });
  };

  const handleChecked = (registrationFieldId: number, status: boolean) => {
    const newRegistration = [...registration];
    const index = newRegistration.findIndex((card) => card.id === registrationFieldId);
    newRegistration[index].selected = !status;
    setRegistration(newRegistration);
    setCheckEdit(true);
    setIsOpenConfirmLeave(true);
  };

  const onFinish = (data: IDataCreate) => {
    if (listOfValue.length > 0) {
      mutateCreateNewRegistrationField({
        label: data.label,
        type: data.type,
        required: data.required || false,
        listOfValues: listOfValue,
      });
    } else {
      mutateCreateNewRegistrationField({
        label: data.label,
        type: data.type,
        required: data.required || false,
      });
    }
    // setVisible(false);
  };

  const renderModalWarning = useCallback(() => {
    return (
      messageWarning && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setMessageWarning('');
          }}
          title="Warning"
          titleCenter
          content={messageWarning}
        />
      )
    );
  }, [messageWarning]);
  const [isOpenModalNoticeChangeType, setIsOpenModalNoticeChangeType] = useState(false);

  const renderModalNoticeChangeType = useCallback(() => {
    return (
      isOpenModalNoticeChangeType && (
        <ModalCustom
          visible={true}
          cancelText="Close"
          onCancel={() => {
            setIsOpenModalNoticeChangeType(false);
            setIsChangeCourseValue(false);
            setIsEdit(true);
          }}
          title="Notice"
          titleCenter
          content={`You have changed the course type for ${courseName}, Please check and confirm the registration details required.`}
        />
      )
    );
  }, [isOpenModalNoticeChangeType]);

  const renderModalNotice = useCallback(() => {
    return (
      modalNotice && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setModalNotice(false);
          }}
          onSubmit={() => {
            setCheckEdit(false);
            if (isUpdate) {
              setIsEdit(!isEdit);
            }
          }}
          okText="Confirm"
          title="Notice"
          titleCenter
          content={WARNING_MESSAGE.CANCEL_REGISTRATION_DETAIL}
        />
      )
    );
  }, [modalNotice]);

  useEffect(() => {
    if (isChangeCourseValue && id) {
      setIsOpenModalNoticeChangeType(true);
    } else {
      setIsOpenModalNoticeChangeType(false);
    }
  }, [isChangeCourseValue]);

  useEffect(() => {
    if (!checkEdit) {
      mutateGetAllRegistrationField({ courseId: Number(courseId) });
    }
  }, [checkEdit]);

  useEffect(() => {
    if (!id) {
      setIsEdit(true);
    }
  }, [isEdit]);

  useEffect(() => {
    if (registration.filter((card) => card.selected).length === registration.length) {
      setCheckAll(true);
    } else {
      setCheckAll(false);
    }
  }, [registration]);

  useEffect(() => {
    if (!INPUT_TYPE.includes(type)) {
      setListOfValue([]);
    }
  }, [type]);

  useEffect(() => {
    if (courseId) {
      mutateGetAllRegistrationField({ courseId: Number(courseId) });
      mutateGetAllRegistrationFieldTypes();
      if (!id) setIsEdit(true);
    }
  }, [courseId]);

  useEffect(() => {
    if (id) {
      setIsUpdate(true);
    }
  }, []);

  return (
    <>
      {isEdit && (
        <div className="flex justify-between items-center display-none xl:block">
          {((['By Admission', 'By Assignment'].includes(courseTypeValue) || !id) &&
            registration.filter((card) => card.selected).length < 1) ||
          courseTypeValue === 'Auto Enrolled' ? (
            <span>
              {WARNING_MESSAGE.REQUIRE_SELECT_REGISTRATION_DETAIL_1}
              <br />
              <i>{WARNING_MESSAGE.REQUIRE_SELECT_REGISTRATION_DETAIL_2}</i>
            </span>
          ) : (
            <span></span>
          )}

          <div className="flex gap-x-8 items-center space-between mt-10 justify-end">
            <CheckboxCustom
              checked={checkAll}
              disabled={!isEdit}
              onClick={handleCheckAll}
              label="Select All"
              className="lg:w-full"
            />

            <ButtonCustom
              color="orange"
              className="w-50"
              onClick={() => {
                setVisible(true);
                setIsKeepOpen(true);
              }}
            >
              Create New Label
            </ButtonCustom>
          </div>
        </div>
      )}
      <ModalCustom
        visible={visible}
        cancelText="Cancel"
        onCancel={() => {
          setVisible(false);
          form.resetFields();
        }}
        okText="Create"
        title="Create New Label"
        isKeepOpen={isKeepOpen}
        onSubmit={() => {
          form
            .validateFields()
            .then((values) => {
              if (INPUT_TYPE.includes(type)) {
                if (listOfValue.length < 1) {
                  form.setFields([
                    {
                      name: 'value',
                      errors: [`This registration field should be had a list of values!`],
                    },
                  ]);
                  return;
                }
                if (value) {
                  form.setFields([
                    {
                      name: 'value',
                      errors: [`Do you want to include the "${value}" value?`],
                    },
                  ]);
                  // setVisible(true);
                  return;
                }
              }
              onFinish(values);
            })
            .catch(() => {
              // setVisible(true);
            });
        }}
        titleCenter
      >
        <Form
          form={form}
          className="w-full text-left"
          name="basic"
          autoComplete="off"
          onFinish={onFinish}
          layout="vertical"
        >
          {fields.map((item, index) => (
            <>
              <Form.Item
                label={item.label}
                className="w-full"
                name={item.name}
                key={Number(index)}
                rules={item.rules}
              >
                {item.type === 'select' ? (
                  <SelectCustom
                    color="transparent"
                    value={type}
                    options={fieldTypes}
                  ></SelectCustom>
                ) : (
                  <CustomInput type={item.type} />
                )}
              </Form.Item>
            </>
          ))}
          {INPUT_TYPE.includes(type) && (
            <Form.Item label="Value" className="w-full mb-1" name="value">
              <CustomInput
                type="text"
                placeholder="Please type and press enter"
                onPressEnter={(e) => {
                  setListOfValue([...listOfValue, e.target.value]);
                  form.resetFields(['value', '']);
                }}
              />
            </Form.Item>
          )}
          <div className="mb-3">
            {listOfValue.map((item: string, index: number) => (
              <Tag key={Number(index)}>
                {item}{' '}
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    const newListOfValue = [...listOfValue];
                    newListOfValue.splice(index, 1);
                    setListOfValue(newListOfValue);
                  }}
                >
                  <CloseOutlined />
                </span>
              </Tag>
            ))}
          </div>

          <Form.Item
            label="Required"
            className="w-full mb-0 modal-create-new-detail"
            name="required"
            valuePropName="checked"
          >
            <Switch className="bg-main-button-color" />
          </Form.Item>
        </Form>
      </ModalCustom>
      <div className="flex gap-y-5 flex-wrap w-full my-4 justify-between">
        {registration.map((item, index) => (
          <>
            <div
              className="gap-3 sm:w-[100%] xl:w-[49%] 2xl:w-[49%] 2xl-min:w-[49%] relative bg-[#FAF9F9] border border-solid border-[#E9E6E5] rounded-2xl py-4 px-6 flex lg:px-2 xl:py-7 "
              key={Number(index)}
            >
              <CheckboxCustom
                disabled={!isEdit}
                checked={item.selected}
                onClick={() => {
                  handleChecked(item.id, item.selected);
                }}
              />

              <div className="w-full">
                <div className="flex justify-between font-fontFamily text-sm mb-2">
                  <span className="!opacity-50 w-[30%] ">Label Name</span>
                  <span className="font-bold w-[68%]">{item.label}</span>
                </div>
                <div className="flex justify-between font-fontFamily text-sm mb-2">
                  <span className="!opacity-50 w-[30%] ">Input Type</span>
                  <span className="font-bold w-[68%]">{item.type}</span>
                </div>
                <div className="flex justify-between font-fontFamily text-sm mb-2">
                  <span className="!opacity-50 w-[30%] ">Value</span>
                  <span className="font-bold w-[68%]">{item.listOfValues}</span>
                </div>
                <div className="flex justify-between font-fontFamily text-sm mb-2">
                  <span className="!opacity-50 w-[30%] ">Required</span>
                  <span className="font-bold w-[68%]">{Boolean(item.required) ? 'Yes' : 'No'}</span>
                </div>
                {isEdit && (
                  <ModalCustom
                    cancelText="Cancel"
                    okText="Confirm"
                    title="Delete"
                    titleCenter
                    onSubmit={() => {
                      handleCloseCard(item.id);
                    }}
                    viewComponent={
                      <div className="text-black text-xs cursor-pointer absolute top-3 right-4">
                        <CloseIcon />
                      </div>
                    }
                  >
                    <div>Are you sure you want to delete {item.label} field?</div>
                  </ModalCustom>
                )}
              </div>
            </div>
          </>
        ))}
      </div>
      {renderModalNoticeChangeType()}
      {renderModalWarning()}
      {renderModalNotice()}
      <div className="flex justify-end gap-3 items-center">
        <div className="lg:w-[calc(50%_-_0.375rem)]">
          <ButtonCustom
            color="outline"
            onClick={() => {
              if (checkEdit) {
                if (
                  ['By Admission', 'By Assignment'].includes(courseTypeValue) &&
                  registration.filter((card) => card.selected).length < 1 &&
                  id
                ) {
                  setMessageWarning(WARNING_MESSAGE.REQUIRE_SELECT_REGISTRATION_DETAIL_1);
                  return;
                }
                setModalNotice(true);
                return;
              }
              onBackTab();
              setIsEdit(false);
              // mutateGetAllRegistrationField({ courseId: Number(courseId) });
            }}
          >
            {checkEdit ? 'Cancel' : 'Back'}
          </ButtonCustom>
        </div>

        {isEdit ? (
          <div className="lg:w-[calc(50%_-_0.375rem)]">
            <ModalCustom
              cancelText="Cancel"
              okText="Confirm"
              title={isUpdate ? 'Confirmation' : 'Create Course'}
              onSubmit={() => {
                if (
                  ['By Admission', 'By Assignment'].includes(courseTypeValue) &&
                  registration.filter((card) => card.selected).length < 1
                ) {
                  setMessageWarning(WARNING_MESSAGE.REQUIRE_SELECT_REGISTRATION_DETAIL_1);

                  return;
                }
                setIsOpenConfirmLeave(false);

                mutateUpdateRegistrationFieldOfCourse({
                  courseId: Number(courseId),
                  registrationFieldIds: registration
                    .filter((item) => item.selected)
                    .map((item) => item.id),
                });
              }}
              viewComponent={
                <ButtonCustom color="orange">{isUpdate && id ? 'Update' : 'Create'}</ButtonCustom>
              }
              titleCenter
            >
              {isUpdate
                ? 'Are you sure want to update the registration detail?'
                : 'Are you sure you want to create this Course?'}
            </ModalCustom>
          </div>
        ) : (
          <div className="lg:w-[calc(50%_-_0.375rem)]">
            <ButtonCustom
              color="orange"
              onClick={() => {
                setIsEdit(!isEdit);
              }}
            >
              Edit
            </ButtonCustom>
          </div>
        )}
      </div>
    </>
  );
};

export default RegistrationDetails;
