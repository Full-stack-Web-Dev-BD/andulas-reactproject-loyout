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
import { AppContext } from 'context';
import moment from 'moment';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import ModalDuplicateSession from '../../component/duplicate-session';
import CardItem from './card-item';

const CommunityOverviewSession = () => {
  const history = useNavigate();
  const [form] = Form.useForm();
  const [formDuplicateSession] = Form.useForm();
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
    authorID?: number;
  }>({ topicName: '', sessionName: '', moduleName: '' });
  const [sessionDetails, setSessionDetails] = useState('');
  const [state]: any = useContext(AppContext);
  const [isModalDuplicateSession, setIsModalDuplicateSession] = useState(false);
  const [messageDuplicateSessionSuccess, setMessageDuplicateSessionSuccess] = useState<string>('');
  const topicNameDuplicate = Form.useWatch('topicName', formDuplicateSession);
  const moduleNameDuplicate = Form.useWatch('moduleName', formDuplicateSession);
  const [isKeepOpen, setIsKeepOpen] = useState(true);

  const { mutate: mutateDuplicateSession } = useMutation('duplicateSession', duplicateSession, {
    onSuccess: ({ data }) => {
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
        authorID: data.authorID,
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

  const handleDuplicateSession = (values: { topicName: IOptionItem; moduleName: IOptionItem }) => {
    mutateDuplicateSession({
      moduleId: Number(values?.moduleName?.value),
      sessionId: Number(sessionId),
    });
  };

  const onClickReview = () => {
    if (isSessionOfModuleTopic) {
      history(
        ROUTES.community_library_topic +
          `/${topicId}/module/${moduleId}/session/${sessionId}/content-creation/teacher`,
      );
    }
    else if (isSessionOfModule) {
      history(
        ROUTES.community_library_module +
          `/${moduleId}/session/${sessionId}/content-creation/teacher`,
      );
    }
    else {
      history(`${ROUTES.community_library_session}/${sessionId}/content-creation/teacher`);
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
              history(`${ROUTES.community_library_topic}/teacher`);
              return;
            }
            if (isSessionOfModule) {
              history(`${ROUTES.community_library_module}/teacher`);
              return;
            }
            history(`${ROUTES.community_library_session}/teacher`);
          }}
        >
          {isSessionOfModuleTopic
            ? 'Community Library - Topic'
            : isSessionOfModule
            ? 'Community Library - Module'
            : 'Community Library - Session'}
        </Breadcrumb.Item>
        {isSessionOfModuleTopic && (
          <Breadcrumb.Item
            className="opacity-50 cursor-pointer"
            onClick={() => {
              history(ROUTES.community_library_topic + `/${topicId}/module/teacher`);
            }}
          >
            {sessionData?.topicName}
          </Breadcrumb.Item>
        )}
        {(isSessionOfModule || isSessionOfModuleTopic) && (
          <Breadcrumb.Item
            onClick={() => {
              if (isSessionOfModuleTopic) {
                history(
                  ROUTES.community_library_topic + `/${topicId}/module/${moduleId}/session/teacher`,
                );
                return;
              }
              history(ROUTES.community_library_module + `/${moduleId}/session/teacher`);
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
            <div className="flex gap-3 justify-end">
              {state?.user?.id === sessionData.authorID ? (
                <>
                  <ButtonCustom color="outline">Remind / Notify</ButtonCustom>
                  <ButtonCustom
                    color="outline"
                    onClick={() => {
                      if (isSessionOfModuleTopic) {
                        history(
                          ROUTES.community_library_topic +
                            `/${topicId}/module/${moduleId}/session/${sessionId}/teacher`,
                        );
                        return;
                      }
                      if (isSessionOfModule) {
                        history(
                          ROUTES.community_library_module +
                            `/${moduleId}/session/${sessionId}/teacher`,
                        );
                        return;
                      }
                      history(`${ROUTES.community_library_session}/${sessionId}/teacher`);
                    }}
                  >
                    Edit Detail
                  </ButtonCustom>
                  <ButtonCustom color="orange" onClick={onClickReview}>Review</ButtonCustom>
                </>
              ) : (
                <>
                  <ButtonCustom
                    color="outline"
                    onClick={() => {
                      // history(
                      //   ROUTES.hq_library +
                      //     `/topic/${topicId}/module/${moduleId}/session/${sessionId}/content-creation/teacher`,
                      // );
                      onClickReview()
                    }}
                  >
                    Review
                  </ButtonCustom>
                  <ButtonCustom color="orange" onClick={() => setIsModalDuplicateSession(true)}>
                    Duplicate
                  </ButtonCustom>
                </>
              )}
            </div>
          </Form.Item>
        </Form>
      </Content>
      <h4 className="mt-6 font-semibold text-[28px] font-fontFamily custom-font-header">Assigned to Course</h4>
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

export default CommunityOverviewSession;
