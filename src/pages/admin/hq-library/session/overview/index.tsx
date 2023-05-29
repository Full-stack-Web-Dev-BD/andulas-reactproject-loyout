import { Breadcrumb, Form, Layout, notification } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { getSessionDetail, unAssignSession } from 'api/session';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import { DATE_FORMAT_TWO, IFieldListForm, ISessionDetail, ROUTES } from 'constants/index';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import CardItem from './card-item';

const OverviewSession = () => {
  const history = useNavigate();
  const [form] = Form.useForm();
  const { topicId, sessionId, moduleId } = useParams();
  const isSessionOfModuleTopic = !!(topicId && sessionId && moduleId);
  const isSessionOfModule = !!(!topicId && sessionId && moduleId);
  const [courses, setCourses] = useState<
    { id: number; className: string; courseName: string; isActive: boolean }[]
  >([]);
  const [sessionData, setSessionData] = useState<{
    topicName: string;
    sessionName: string;
    moduleName: string;
  }>({ topicName: '', sessionName: '', moduleName: '' });
  const [sessionDetails, setSessionDetails] = useState('');

  const { mutate: getSessionById } = useMutation('getSessionDetail', getSessionDetail, {
    onSuccess: ({ data }: { data: ISessionDetail }) => {
      setCourses(data?.classes);
      const codeMudule =
        data?.module?.moduleCode && data?.module?.moduleCode !== ''
          ? `(${data?.module?.moduleCode})`
          : '';
      const formValue = {
        sessionDetails: data?.sessionDetails,
        topic: data?.module?.topic?.topicName,
        module: data?.module?.moduleName + ' ' + codeMudule,
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
        moduleName: data?.module?.moduleName + ' ' + codeMudule,
      });
      setSessionDetails(data?.sessionDetails);
    },
  });

  const { mutate: mutateUnAssignSession } = useMutation('unAssignSession', unAssignSession, {
    onSuccess: () => {
      notification.success({ message: 'Removed successfully.' });
      getSessionById(Number(sessionId));
    },
    onError: ({ response }) => {
      notification.error({ message: response.data.message });
    },
  });

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

  const onClickReview = () => {
    if (isSessionOfModuleTopic) {
      history(
        ROUTES.hq_library_topic +
          `/${topicId}/module/${moduleId}/session/${sessionId}/content-creation/teacher`,
      );
    }
    else if (isSessionOfModule) {
      history(
        ROUTES.hq_library_module +
          `/${moduleId}/session/${sessionId}/content-creation/teacher`,
      );
    }
    else {
      history(`${ROUTES.hq_library_session}/${sessionId}/content-creation/teacher`);
    }
  }

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
            if (isSessionOfModuleTopic) {
              history(ROUTES.hq_library_topic);
              return;
            }
            if (isSessionOfModule) {
              history(ROUTES.hq_library_module);
              return;
            }
            history(ROUTES.hq_library_session);
          }}
        >
          {isSessionOfModuleTopic
            ? 'HQ Library - Topic'
            : isSessionOfModule
            ? 'HQ Library - Module'
            : 'HQ Library - Session'}
        </Breadcrumb.Item>
        {isSessionOfModuleTopic && (
          <Breadcrumb.Item
            className="opacity-50 cursor-pointer"
            onClick={() => {
              history(ROUTES.hq_library_topic + `/${topicId}/module`);
            }}
          >
            {sessionData?.topicName}
          </Breadcrumb.Item>
        )}
        {(isSessionOfModule || isSessionOfModuleTopic) && (
          <Breadcrumb.Item
            onClick={() => {
              if (isSessionOfModuleTopic) {
                history(ROUTES.hq_library_topic + `/${topicId}/module/${moduleId}/session`);
                return;
              }
              history(ROUTES.hq_library_module + `/${moduleId}/session`);
            }}
            className="opacity-50 cursor-pointer"
          >
            {sessionData?.moduleName}
          </Breadcrumb.Item>
        )}
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
            <div className="flex gap-3 justify-end sm:flex-col display-center flex-wrap">
              <ButtonCustom color="outline" className="sm:w-full lg:w-full">
                Remind / Notify
              </ButtonCustom>
              <div className="sm:w-full flex gap-3 lg:w-full">
                <ButtonCustom
                  className="sm:w-[calc(50%_-_0.375rem)]"
                  color="outline"
                  onClick={() => {
                    if (isSessionOfModuleTopic) {
                      history(
                        ROUTES.hq_library_topic +
                          `/${topicId}/module/${moduleId}/session/${sessionId}`,
                      );
                      return;
                    }
                    if (isSessionOfModule) {
                      history(ROUTES.hq_library_module + `/${moduleId}/session/${sessionId}`);
                      return;
                    }
                    history(`${ROUTES.hq_library_session}/${sessionId}`);
                  }}
                >
                  Edit Detail
                </ButtonCustom>
                <ButtonCustom className="sm:w-[calc(50%_-_0.375rem)]" color="orange" onClick={onClickReview}>
                  Review
                </ButtonCustom>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Content>
      <h4 className="mt-6 font-semibold text-[28px] font-fontFamily custom-font-header">
        Assigned to Course
      </h4>
      <div className="mt-6 flex flex-wrap gap-4">
        {courses?.map((item) => (
          <CardItem handle={handleRemoveCourse} {...item} actionContent="Remove" key={item.id} />
        ))}
      </div>
    </Layout>
  );
};

export default OverviewSession;
