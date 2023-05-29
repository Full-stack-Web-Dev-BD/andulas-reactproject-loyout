import { Breadcrumb, Form, Layout, notification } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { duplicateSession, getSessionDetail, unAssignSession } from 'api/session';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import {
  DATE_FORMAT_TWO,
  IFieldListForm,
  IOptionItem,
  ISessionDetail,
  ROUTES,
} from 'constants/index';
import moment from 'moment';
import ModalDuplicateSession from 'pages/admin/community-library/teacher/component/duplicate-session';
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import CardItem from './card-item';
import { createMultipleUnit, searchUnits } from 'api/content_management';

const HQLibraryOverviewTeacher = () => {
  const history = useNavigate();
  const [form] = Form.useForm();
  const [formDuplicateSession] = Form.useForm();
  const { topicId, sessionId, moduleId } = useParams();
  const [courses, setCourses] = useState<
    { id: number; className: string; courseName: string; isActive: boolean }[]
  >([]);
  const [sessionData, setSessionData] = useState<{
    topicName: string;
    sessionName: string;
    moduleName: string;
  }>({ topicName: '', sessionName: '', moduleName: '' });
  const [sessionDetails, setSessionDetails] = useState('');
  const [isModalDuplicateSession, setIsModalDuplicateSession] = useState(false);
  const [messageDuplicateSessionSuccess, setMessageDuplicateSessionSuccess] = useState<string>('');
  const topicNameDuplicate = Form.useWatch('topicName', formDuplicateSession);
  const moduleNameDuplicate = Form.useWatch('moduleName', formDuplicateSession);
  const [isKeepOpen, setIsKeepOpen] = useState(true);
  const [newSession, setNewSession] = useState('');

  const { mutate: mutateDuplicateSession } = useMutation('duplicateSession', duplicateSession, {
    onSuccess: ({ data }) => {
      setNewSession(data?.id)
      setIsModalDuplicateSession(false);
      formDuplicateSession.resetFields();
      setMessageDuplicateSessionSuccess(
        `${sessionData?.sessionName} from ${
          sessionData?.topicName + '-' + sessionData?.moduleName
        } has been successfully duplicated to ${
          topicNameDuplicate?.label + '-' + moduleNameDuplicate?.label
        }`,
      );
    },
    onError: ({ response }) => {
      setIsKeepOpen(true);
      formDuplicateSession.setFields([{ name: 'moduleName', errors: [response.data.message] }]);
    },
  });

  const { mutate: getSessionById } = useMutation('getSessionDetail', getSessionDetail, {
    onSuccess: ({ data }: { data: ISessionDetail }) => {
      setCourses(data?.classes);
      const codeMudule = data?.module?.moduleCode && data?.module?.moduleCode !== "" ? `(${data?.module?.moduleCode})` : ""
      const formValue = {
        sessionDetails: data?.sessionDetails,
        topic: data?.module?.topic?.topicName,
        module: data?.module?.moduleName + " " + codeMudule,
        category: data?.category?.categoryName,
        programType: data?.programType,
        sessionType: data?.sessionType,
        searchTags:
          data?.tags?.length > 0 ? data?.tags?.map((item) => `#${item.tagName}`).join('; ') : '',
        authorization: data?.authorization,
        contentAttached: data?.contentAttachedPath,
        author: data?.author?.userProfile?.firstName + ' ' + data?.author?.userProfile?.lastName,
        status: data?.status,
        lastUpdated: moment.utc(data?.updatedAt).local().format(DATE_FORMAT_TWO),
      };
      form.setFieldsValue(formValue);
      setSessionData({
        topicName: data?.module?.topic?.topicName,
        sessionName: data?.sessionName,
        moduleName: data?.module?.moduleName + " " + codeMudule,
      });
      setSessionDetails(data?.sessionDetails);
    },
  });

  const { mutate: mutateUnAssignSession } = useMutation('unAssignSession', unAssignSession, {
    onSuccess: () => {
      notification.success({ message: 'Removed successfully' });
      getSessionById(Number(sessionId));
    },
    onError: ({ response }) => {
      notification.error({ message: response.data.message });
    },
  });
  const getUnit = useQuery(['getUnit',[sessionId]], () => searchUnits({ filters: `[{"sessionID":"${sessionId}"}]` }))

  const { mutate: mutateCreateUnit } = useMutation('createMultipleUnit', createMultipleUnit, {
    onSuccess: ({ data }) => { },
    onError: ({ response }) => {
      notification.error({ message: response.data.message });
    },
  });


 const handleDuplicateUnits = (newSessionId: number) => {
    if (getUnit.status == "success") {
      const data = getUnit.data.data.records

      const dataSave = data.map((item: any) => {
        const {
          id,
          session,
          sessionID,
          updatedAt,
          createdAt,
          ...rest
        } = item

        return rest
      })

      mutateCreateUnit({
        sessionID: newSessionId,
        params: dataSave
      });
    }
  }

  useEffect(()=> {
    if(newSession != ''){
      handleDuplicateUnits(Number(newSession))
      setNewSession('');
    }
  },[newSession])


  const fieldList = [
    {
      label: 'Session details',
      name: 'sessionDetails',
      type: 'html',
      disabled: true,
      isFullWidth: true,
    },
    {
      label: 'Topic',
      name: 'topic',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Module',
      name: 'module',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Category',
      name: 'category',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Program Type',
      name: 'programType',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Session Type',
      name: 'sessionType',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Search Tags',
      name: 'searchTags',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Authorization',
      name: 'authorization',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Content Attached',
      name: 'contentAttached',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Author',
      name: 'author',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Status',
      name: 'status',
      type: 'string',
      disabled: true,
    },
    {
      label: 'Last Updated Date',
      name: 'lastUpdated',
      type: 'string',
      disabled: true,
    },
  ];

  useEffect(() => {
    if (sessionId) {
      getSessionById(Number(sessionId));
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionDetails && document) {
      const element = document.getElementById('session-detail');
      if (element) {
        element.innerHTML = sessionDetails;
      }
    }
  }, [sessionDetails]);

  const renderField = useCallback(
    (field: IFieldListForm) => {
      switch (field.type) {
        case 'string':
          return <CustomInput disabled={field.disabled} type={field.type} />;
        case 'html':
          return (
            <div
              id="session-detail"
              className="w-full px-[18px] py-[5px] min-h-[3rem] flex items-center rounded-2xl bg-white border border-solid text-sm border-[#d9d9d9] !text-[#0000003f] cursor-not-allowed max-w-full  session-detail-preview"
            />
          );
        default:
          return <CustomInput disabled={field.disabled} type={field.type} />;
      }
    },
    [sessionDetails],
  );

  const handleRemoveCourse = useCallback(
    (classID: number) => {
      mutateUnAssignSession({ classID, sessionId: Number(sessionId) });
    },
    [sessionId],
  );

  const handleDuplicateSession = (values: { topicName: IOptionItem; moduleName: IOptionItem }) => {
    mutateDuplicateSession({
      moduleId: Number(values?.moduleName?.value),
      sessionId: Number(sessionId),
    });
  };

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
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
          className="opacity-50 cursor-pointer"
          onClick={() => {
            history(`${ROUTES.hq_library}/teacher`);
          }}
        >
          HQ Library
        </Breadcrumb.Item>
        <Breadcrumb.Item
          className="opacity-50 cursor-pointer"
          onClick={() => {
            history(ROUTES.hq_library + `/topic/${topicId}/module/teacher`);
          }}
        >
          {sessionData?.topicName}
        </Breadcrumb.Item>
        <Breadcrumb.Item
          onClick={() => {
            history(ROUTES.hq_library + `/topic/${topicId}/module/${moduleId}/session/teacher`);
          }}
          className="opacity-50 cursor-pointer"
        >
          {sessionData?.moduleName}
        </Breadcrumb.Item>
        <Breadcrumb.Item className="font-fontFamily text-main-font-color cursor-pointer">
          {sessionData?.sessionName}
        </Breadcrumb.Item>
      </Breadcrumb>
      <Content className="bg-white rounded-3xl p-8">
        <h5 className="font-semibold text-2xl font-fontFamily">Overview</h5>
        <Form className="flex flex-wrap gap-x-6" layout="vertical" form={form}>
          {fieldList.map((field, index) => (
            <Form.Item
              className={
                field?.isFullWidth
                  ? 'w-full'
                  : 'lg:w-[calc(50%_-_0.75rem)] md:w-[calc(50%_-_0.75rem)] xl:w-[calc(33.33%_-_1rem)]'
              }
              label={field.label}
              key={index}
              name={field.name}
            >
              {renderField(field)}
            </Form.Item>
          ))}
          <Form.Item className="w-full">
            <div className="flex gap-3 justify-end">
              <ButtonCustom
                color="outline"
                onClick={() => {
                  history(
                    ROUTES.hq_library +
                      `/topic/${topicId}/module/${moduleId}/session/${sessionId}/content-creation/teacher`,
                  );
                }}
              >
                Review
              </ButtonCustom>
              <ButtonCustom color="orange" onClick={() => setIsModalDuplicateSession(true)}>
                Duplicate
              </ButtonCustom>
            </div>
          </Form.Item>
        </Form>
      </Content>
      <h4 className="mt-6 font-semibold text-[28px] font-fontFamily custom-font-header">
        Used in Course
      </h4>
      <div className="mt-6 flex flex-wrap gap-4">
        {courses?.map((item) => (
          <CardItem handle={handleRemoveCourse} {...item} actionContent="Remove" key={item.id} />
        ))}
      </div>

      <ModalDuplicateSession
        isModalDuplicateSession={isModalDuplicateSession}
        formDuplicateSession={formDuplicateSession}
        onCancel={() => {
          setIsModalDuplicateSession(false);
          formDuplicateSession.resetFields();
        }}
        isKeepOpen={isKeepOpen}
        handleDuplicateSession={handleDuplicateSession}
      />

      {messageDuplicateSessionSuccess && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setMessageDuplicateSessionSuccess('');
          }}
          title="Duplicate Session"
          titleCenter
          content={messageDuplicateSessionSuccess}
        />
      )}
    </Layout>
  );
};

export default HQLibraryOverviewTeacher;
