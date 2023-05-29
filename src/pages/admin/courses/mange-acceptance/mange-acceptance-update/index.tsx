import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Breadcrumb, Form, Input, Layout, Select } from 'antd';
import { BaseOptionType, DefaultOptionType } from 'antd/lib/select';
import { getRegistrationById, updateRegistrationStatus } from 'api/courses_by_admission';
import { ReactComponent as AttachSVG } from 'assets/icons/link.svg';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import { ROUTES } from 'constants/constants';
import { FIELDS, IFieldListForm } from 'constants/index';
import React, { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
const { TextArea } = Input;
interface IRegistrationInfo {
  id?: number;
  value: string;
  registrationField: {
    label: string;
    name: string;
    type: string;
  };
}

interface IRegistrationById {
  id?: number;
  status?: string;
  course?: {
    courseName?: string;
  };
  student: {
    userProfile: {
      firstName: string;
      lastName: string;
    };
  };
}

const statusConfig = {
  pending: {
    className: 'text-[#F1A240]',
    text: 'Pending',
  },
  reject: {
    className: 'text-[#EB5757]',
    text: 'Rejected',
  },
  accept: {
    className: 'text-[#007A7B]',
    text: 'Accepted',
  },
};

const isEdit = false;
const checkCourseType = 'Auto Enrolled';

const ManageAcceptanceUpdate = () => {
  const history = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [isKeepOpen, setIsKeepOpen] = useState(true);
  const [isRequireReason, setIsRequireReason] = useState(false);
  const [courseType, setCourseType] = useState('By Admission');

  const [registrationField, setRegistrationField] = useState<Array<IFieldListForm>>([
    {
      label: '',
      name: '',
      type: '',
      value: '',
    },
  ]);
  const [dataUpdate, setDataUpdate] = useState<IRegistrationById>({
    student: { userProfile: { firstName: '', lastName: '' } },
  });
  const [status, setStatus] = useState('');
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [reason, setReason] = useState('');
  const { mutate: mutateUpdateRegistrationStatus } = useMutation(
    'updateRegistrationStatus',
    updateRegistrationStatus,
    {
      onSuccess: ({ data }) => {
        setStatus(data.status);
        form.setFieldsValue({ status: data.status });
        setReason(data.reason);
        form.setFieldsValue({ reason: data.reason });
        setIsKeepOpen(false);
        setIsRequireReason(false);
        setReason('');
      },
    },
  );

  const renderField = useCallback(
    (field: IFieldListForm) => {
      switch (field.type) {
        case FIELDS.STRING:
          return (
            <CustomInput
              type={field.type}
              disabled={!isEdit}
              classNameCustom={
                field.classNameCustom
                  ? status === 'Pending'
                    ? statusConfig.pending.className
                    : status === 'Rejected'
                    ? statusConfig.reject.className
                    : statusConfig.accept.className
                  : ''
              }
            />
          );
        case FIELDS.NUMBER:
          return <CustomInput type={field.type} disabled={!isEdit} />;
        case FIELDS.SELECT:
          return (
            <Select
              options={field.options as (BaseOptionType | DefaultOptionType)[]}
              disabled={!isEdit}
            />
          );
        case '':
          return <div></div>;
        case 'File Upload':
          return (
            <div className="font-fontFamily text-main-font-color text-sm">
              {field.value.length > 0 &&
                field.value.map((item: string, index: number) => (
                  <>
                    <ModalCustom
                      width={1020}
                      cancelText="Back"
                      title="Preview"
                      styleCancel={{ width: '200px' }}
                      buttonFloatRight
                      key={Number(index)}
                      viewComponent={
                        <div className="mb-2 flex items-center gap-x-2 cursor-pointer">
                          <AttachSVG />
                          <div>{item ? item?.split('/')[item?.split('/').length - 1] : ''}</div>
                        </div>
                      }
                    >
                      <div>
                        <div className="mb-2 flex items-center gap-x-2">
                          <AttachSVG />
                          <div>{item ? item?.split('/')[item?.split('/').length - 1] : ''}</div>
                        </div>
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.11.338/build/pdf.worker.js">
                          <div
                            style={{
                              height: '500px',
                              width: '100%',
                            }}
                          >
                            <Viewer fileUrl={item} plugins={[defaultLayoutPluginInstance]} />
                          </div>
                        </Worker>
                      </div>
                    </ModalCustom>
                  </>
                ))}
            </div>
          );
        default:
          return <CustomInput type={field.type} disabled={!isEdit} />;
      }
    },
    [status],
  );

  const renderFieldList = useCallback(() => {
    return registrationField?.map(
      (field, index) =>
        !field?.isHidden && (
          <Form.Item
            className={field?.isFullWidth ? 'w-full' : 'w-full sm:w-full lg:w-[48%]'}
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
  }, [registrationField]);

  const { mutate: mutateGetRegistrationById } = useMutation(
    'getRegistrationById',
    getRegistrationById,
    {
      onSuccess: ({ data }) => {
        setCourseType(data.course.courseType);
        setRegistrationField(
          data.registrationInfos.map((item: IRegistrationInfo) => ({
            label: item.registrationField.label,
            name: `name-field-${item.id}`,
            value: item.value,
            type:
              item.registrationField.type === 'text'
                ? 'string'
                : item.registrationField.type === 'Dropdown'
                ? 'select'
                : item.registrationField.type,
          })),
        );
        data.registrationInfos.forEach((element: IRegistrationInfo) => {
          form.setFieldsValue({ [`name-field-${element.id}`]: element.value });
        });
        setDataUpdate(data);
        setStatus(data.status);
        form.setFieldsValue({ status: data.status });
        setReason(data.reason);
        form.setFieldsValue({ reason: data.reason });
      },
    },
  );

  const handleSubmit = useCallback((values: any) => {}, []);

  useEffect(() => {
    mutateGetRegistrationById({ id: Number(id) });
  }, []);

  return (
    <Layout className="p-0 sm:p-0 md:p-0 lg:p-0 xl:p-16 2xl:p-16 bg-transparent gap-4">
      <Breadcrumb
        style={{
          color: '#AEA8A5',
          fontWeight: '700',
          lineHeight: '36px',
          fontSize: '28px',
        }}
        className="font-fontFamily text-main-font-color"
      >
        <Breadcrumb.Item
          className="opacity-50 cursor-pointer custom-font-header"
          onClick={() => {
            history(ROUTES.by_admission);
          }}
        >
          Manage Acceptance - {courseType || 'By Admission'}
        </Breadcrumb.Item>
        <Breadcrumb.Item className="font-fontFamily text-main-font-color">
          {dataUpdate.student?.userProfile.lastName} - {dataUpdate.student?.userProfile.firstName}
        </Breadcrumb.Item>
      </Breadcrumb>
      <div className="p-10 bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.04)] rounded-3xl w-full">
        <Form
          onFinish={handleSubmit}
          form={form}
          layout="vertical"
          className="flex gap-x-4 flex-wrap"
        >
          {renderFieldList()}

          <div className="w-full flex gap-x-4 flex-wrap">
            <Form.Item
              className={'w-full sm:w-full lg:w-[48%]'}
              validateFirst
              name={'status'}
              label={'Status'}
            >
              <CustomInput
                type={'string'}
                disabled={!isEdit}
                classNameCustom={
                  status === 'Pending'
                    ? statusConfig.pending.className
                    : status === 'Rejected'
                    ? statusConfig.reject.className
                    : statusConfig.accept.className
                }
              />
            </Form.Item>

            <Form.Item
              className={'w-full sm:w-full lg:w-[48%]'}
              validateFirst
              name={'reason'}
              label={'Reason'}
            >
              {renderField({
                label: 'Reason',
                name: 'reason',
                type: 'string',
              })}
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 w-full mr-5 mr-0">
            <ButtonCustom
              color="outline"
              onClick={() => {
                history(
                  courseType !== checkCourseType ? ROUTES.by_admission : ROUTES.auto_enrolled,
                );
              }}
            >
              Back
            </ButtonCustom>

            {status === 'Pending' && courseType !== checkCourseType && (
              <>
                <ModalCustom
                  cancelText="Cancel"
                  okText="Confirm"
                  title="Reject application"
                  titleCenter
                  isKeepOpen={isKeepOpen}
                  onSubmit={() => {
                    if (!reason) {
                      setIsKeepOpen(true);
                      setIsRequireReason(true);
                      return;
                    }

                    mutateUpdateRegistrationStatus({
                      status: 'Rejected',
                      id: Number(id),
                      reason: reason,
                    });
                  }}
                  viewComponent={<ButtonCustom color="outline">Reject</ButtonCustom>}
                >
                  <div>
                    Are you sure you want to reject {dataUpdate.student?.userProfile.lastName}{' '}
                    {dataUpdate.student?.userProfile.firstName} from subscribing to{' '}
                    {dataUpdate.course?.courseName}??
                    <TextArea
                      placeholder="Please enter rejection reason"
                      className="style_input_custom_login_page mt-2 h-[240px]"
                      value={reason}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setReason(e.target.value);
                        if (!e.target.value) {
                          setIsRequireReason(true);
                        } else {
                          setIsRequireReason(false);
                        }
                      }}
                    />
                    {isRequireReason && (
                      <div className="!text-red-500 !text-left w-full">
                        Rejection reason cannot be empty!
                      </div>
                    )}
                  </div>
                </ModalCustom>

                <ModalCustom
                  cancelText="Cancel"
                  okText="Confirm"
                  title="Accept application"
                  titleCenter
                  onSubmit={() => {
                    mutateUpdateRegistrationStatus({ status: 'Accepted', id: Number(id) });
                  }}
                  viewComponent={<ButtonCustom color="orange">Accept</ButtonCustom>}
                >
                  <div>
                    Are you sure you want to allow {dataUpdate.student?.userProfile.lastName}{' '}
                    {dataUpdate.student?.userProfile.firstName} to subscribe to{' '}
                    {dataUpdate.course?.courseName}?
                  </div>
                </ModalCustom>
              </>
            )}
          </div>
        </Form>
      </div>
    </Layout>
  );
};

export default ManageAcceptanceUpdate;
