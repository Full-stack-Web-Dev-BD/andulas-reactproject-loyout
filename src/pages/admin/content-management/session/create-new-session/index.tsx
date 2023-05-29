import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@novicov/ckeditor5-build-classic-full';
import '@novicov/ckeditor5-build-classic-full/build/translations/en';
import { Breadcrumb, DatePicker, Form, Layout, notification, Select } from 'antd';
import { RuleObject } from 'antd/lib/form';
import { Content } from 'antd/lib/layout/layout';
import { BaseOptionType, DefaultOptionType } from 'antd/lib/select';
import { createMultipleUnit, searchUnits } from 'api/content_management';
import { getListCategories } from 'api/courses';
import { getListTopics, searchModules } from 'api/hq_library';
import { createNewSession, getSessionById, updateSession } from 'api/session';
import { createSessionTag, ISessionTag, searchSessionTags } from 'api/session_tag';
import { ReactComponent as EyeSVG } from 'assets/icons/eye.svg';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import Loading from 'components/Loading';
import ModalCustom from 'components/Modal';
import SelectSearch from 'components/SelectSearch';
import {
  DATE_FORMAT,
  EDITOR_CONFIG,
  FIELDS,
  KeyFormChangeData,
  PARAMS_SELECT_SEARCH,
  ROUTES,
  SCREEN,
  Status,
  TEXT_SELECT_SEARCH,
  TopicType,
} from 'constants/constants';
import usePrompt from 'constants/function';
import { ITopic } from 'constants/index';
import { WARNING_MESSAGE } from 'constants/messages';
import { ICategory, IFieldListForm, IModule } from 'constants/types';
import { AppContext } from 'context';
import { KeyboardEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { RoleName } from '../..';
import AddContentSession, { IUnit, ListUnit } from '../add-content-session';
import "./style.css";

export const ACTIVE_TAB = [
  '',
  'Add content',
  'Reorder',
  'View as Student',
  'Rules and Path',
  'Reports',
  'Add web content',
  'Add Assignment',
  'Add Video',
  'Add Audio',
  'Add Presentation | Document',
  'Add Test',
];

export enum ActiveTab {
  Default,
  AddContent,
  ReOrder,
  ViewAsStudent,
  RulesAndPath,
  Reports,
  AddWebContent,
  AddAssignment,
  AddVideo,
  AddAudio,
  AddDocument,
  AddTest,
}

const CreateNewContentManagementSession = () => {
  const [state] : any = useContext(AppContext);
  const roleName = state?.user?.userRole?.roleName;

  const history = useNavigate();
  const timeout: any = useRef(null);
  const location = useLocation();
  const { sessionId } = useParams()

  // Change tab
  const [isContentTab, setIsContentTab] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(0);
  const [listUnits, setListUnits] = useState<ListUnit[]>([]);

  const [sessionData, setSessionData] = useState<any>(undefined);
  const [isEdit, setIsEdit] = useState(true);
  const [form] = Form.useForm();
  const [idSessionSaveAsDaft, setSessionIdSaveAsDaft] = useState<number>();
  const topic = Form.useWatch('topic', form);
  const addToModule = Form.useWatch('addToModule', form);
  const [sessionDetail, setSessionDetail] = useState<string>('');
  const sessionTagIDs = Form.useWatch('sessionTagIDs', form);
  const [isModalNotice, setIsModalNotice] = useState<boolean>(false);
  const [isModalConfirm, setIsModalConfirm] = useState<boolean>(false);
  const [sessionTagValue, setSessionTagValue] = useState('');
  const [screen, setScreen] = useState<string>(SCREEN.newSession);
  const [isDisabledTopic, setIsDisabledTopic] = useState<boolean>(false);
  const [isDisabledModule, setIsDisabledModule] = useState<boolean>(true);
  const [isOpenConfirmLeave, setIsOpenConfirmLeave] = useState<boolean>(false);
  const [isChanging, setIsChanging] = useState(false);

  const [topicOptions, setTopicOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [modulesOptions, setModulesOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [categoriesOptions, setCategoriesOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [sessionTagOptions, setSessionTagOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [isClearSearchingSession, setIsClearSearchingSession] = useState(false);
  const [isShowContactAttached, setIsShowContactAttached] = useState<boolean>(false);
  const [isShowSaveOfDaft, setIsShowSaveOfDaft] = useState<boolean>(true);
  const [isOpenContentFirst, setIsOpenContentFirst] = useState<boolean>(false);

  const { mutate: mutateCreateUnit } = useMutation('createMultipleUnit', createMultipleUnit, {
    onSuccess: ({ data }) => {
      notification.success({ message: `${sessionId ? "Edit" : "Create"} session successfully !` });
      history(`${ROUTES.content_management}`);
    },
    onError: ({ response }) => {
      if(response.status == 403) {
        notification.error({ message: "You are not allowed to create unit." });
      } else {
        notification.error({ message: response.data.message });
      }
      
    },
  });

  const handleCreateUnit = useCallback((id: number) => {
    if (id || sessionId) {
      const temp = [...listUnits];
      if (temp.length > 0) {
        for (let i=0; i<temp.length; i++) {
          if (temp[i].session) delete temp[i].session;
        }
      }
      mutateCreateUnit({
        sessionID: id || Number(sessionId),
        params: [...temp].map((unit, index) => {
          return {
            ...unit,
            order: index + 1,
          }
        }),
      })
    }
  }, [listUnits, sessionId])

  const { mutate: mutateGetSessionById, isLoading } = useMutation(
    'getSessionById',
    getSessionById,
    {
      onSuccess: ({ data }) => {
        setSessionData(data);
        setSessionDetail(data?.sessionDetails || '');
        const codeMudule = data?.module?.moduleCode && data?.module?.moduleCode !== "" ? `(${data?.module?.moduleCode})` : ""
        const dataEdit = {
          addToModule: { label: data?.module?.moduleName + " " + codeMudule, value: data?.module?.id?.toString() },
          authorization: data?.authorization,
          category: data?.category ? { label: data?.category?.categoryName, value: data?.category?.id.toString() } : null,
          contentAttachedPath: 'preview-file.pdf',
          programType: data?.programType,

          sessionDetail: data?.sessionDetails,
          sessionName: data?.sessionName,
          sessionTagIDs: data?.tags?.map((tag: { tagName: string; id: number }) => ({
            label: tag.tagName,
            value: tag.id.toString(),
          })),
          sessionType: data?.sessionType,
          topic: {
            label: data?.module?.topic?.topicName,
            value: data?.module?.topic?.id?.toString(),
          },
        };

        if (data?.status === Status.COMPLETED) {
          // setIsShowContactAttached(true);
          setIsShowSaveOfDaft(false);
        }
        form.setFieldsValue(dataEdit);
        setIsChanging(false);
        setIsDisabledModule(true);
        setIsDisabledTopic(true);
      },
    },
  );

  const handleSetFieldError = useCallback((fieldName: string, message: string) => {
    form.setFields([
      {
        name: fieldName,
        errors: [message],
      },
    ]);
    return;
  }, [form])

  const { mutate: mutateCreateNewSession } = useMutation('createNewSession', createNewSession, {
    onSuccess: ({ data }) => {
      setIsChanging(false);
      if (data?.id) {
        mutateCreateUnit({
          sessionID: data?.id,
          params: [...listUnits],
        })
      }
    },
    onError: ({ response }) => {
      if(response.status == 403) {
        notification.error({ message: "You are not allowed to create content management." });
        return ;
      }
      const message = response.data.message;
      if (message.includes('already exists')) {
        setIsContentTab(false);
        setTimeout(() => handleSetFieldError('sessionName', message), 500)
      }
      else {
        notification.error({ message: response.data.message });
      }
    },
  });

  const { mutate: mutateUpdateSession } = useMutation('updateSession', updateSession, {
    onSuccess: ({ data }) => {
      setIsChanging(false);
      if (data?.id || sessionId) {
        handleCreateUnit(Number(data?.id || sessionId))
      }
    },
    onError: ({ response }) => {
      if(response.status == 403) {
        notification.error({ message: "You are not allowed to edit content management." })
        return ;
      }
      const message = response.data.message;
      if (message.includes('already exists')) {
        setIsContentTab(false);
        setTimeout(() => handleSetFieldError('sessionName', message), 500)
      }
      else {
        notification.error({ message: response.data.message });
      }
    },
  });

  const { mutate: mutateSaveAsDraftSession } = useMutation('createNewSession', createNewSession, {
    onSuccess: ({ data }) => {
      setSessionIdSaveAsDaft(Number(data.id));
      setIsChanging(false);
      setIsDisabledModule(true);
      setIsDisabledTopic(true);
      notification.success({ message: 'Save as draft successfully' });
    },
    onError: ({ response }) => {
      if(response.status == 403) {
        notification.error({ message: "You are not allowed to create content management." });
        return ;
      }
      const message = response.data.message;
      if (message.includes('already exists')) {
        setIsContentTab(false);
        setTimeout(() => handleSetFieldError('sessionName', message), 500)
      }
      else {
        notification.error({ message: response.data.message });
      }
    },
  });

  const { mutate: mutateUpdateSaveAsDraftSession } = useMutation('updateSession', updateSession, {
    onSuccess: () => {
      setIsChanging(false);
      setIsDisabledModule(true);
      setIsDisabledTopic(true);
      notification.success({ message: 'Save as draft successfully' });
    },
    onError: ({ response }) => {
      if(response.status == 403) {
        notification.error({ message: "You are not allowed to create content management." })
        return ;
      }
      const message = response.data.message;
      if (message.includes('already exists')) {
        setIsContentTab(false);
        setTimeout(() => handleSetFieldError('sessionName', message), 500)
      }
      else {
        notification.error({ message: response.data.message });
      }
    },
  });

  const { mutate: getTopics } = useMutation('getListTopics', getListTopics, {
    onSuccess: ({ data }: { data: { records: ITopic[] } }) => {
      const newOptions = data.records
        .map((el) => {
          return { label: el.topicName.toString(), value: el.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.topic, value: '', isDisabled: true }]);
      setTopicOptions(newOptions);
    },
  });

  const { mutate: getModules } = useMutation('searchModules', searchModules, {
    onSuccess: ({ data }: { data: { listModules: IModule[] } }) => {
      const newOptions = data.listModules
        .map((el) => {
          const codeMudule = el?.moduleCode && el?.moduleCode !== "" ? `(${el?.moduleCode})` : ""
          return { label: el.moduleName.toString() + " " + codeMudule, value: el.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.module, value: '', isDisabled: true }]);
      setModulesOptions(newOptions);
      setIsDisabledModule(false);
    },
  });

  const { mutate: getCategories } = useMutation('getListCategories', getListCategories, {
    onSuccess: ({ data }: { data: { listCategories: ICategory[] } }) => {
      const newOptions = data.listCategories
        .map((el) => {
          return { label: el.categoryName.toString(), value: el.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.category, value: '', isDisabled: true }]);
      setCategoriesOptions(newOptions);
    },
  });

  const { mutate: getSessionTags } = useMutation('searchSessionTags', searchSessionTags, {
    onSuccess: ({ data }: { data: { records: ISessionTag[] } }) => {
      if (data?.records?.length > 0) {
        const newOptions = data.records
          .map((el) => {
            return { label: el.tagName.toString(), value: el.id.toString(), isDisabled: false };
          })
          .concat([{ label: TEXT_SELECT_SEARCH.sessionTag, value: '', isDisabled: true }]);
        setSessionTagOptions(newOptions);
        return;
      }
      setSessionTagOptions([]);
    },
  });

  const { mutate: createNewSessionTag } = useMutation('createSessionTag', createSessionTag, {
    onSuccess: ({ data }: { data: { id: number; tagName: string } }) => {
      setSessionTagOptions([
        ...sessionTagOptions,
        { label: data.tagName, value: data.id.toString(), isDisabled: false },
      ]);
      form.setFieldsValue({
        sessionTagIDs: sessionTagIDs
          ? [
            ...sessionTagIDs,
            { label: data.tagName, value: data.id.toString(), isDisabled: false },
          ]
          : [{ label: data.tagName, value: data.id.toString(), isDisabled: false }],
      });
      setIsClearSearchingSession(true);
      setSessionTagValue('');
      setIsChanging(false);
    },
    onError: ({ response }: { response: { data: { message: string } } }) => {
      notification.error({ message: response.data.message });
    },
  });

  const { mutate: getUnits, isLoading: isSearchingUnits } = useMutation(
    'searchUnits',
    searchUnits,
    {
      onSuccess: ({
        data,
      }: {
        data: { records: IUnit[]; total: number; page: number; limit: number };
      }) => {
        const dataPush = data.records.map((el, index) => {
          return {
            ...el,
            isEditable: false,
          };
        });
        setListUnits(dataPush);
      }
    },
  );

  const handleSearchTopics = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        if ([RoleName.SUPER_ADMIN, RoleName.ADMIN].includes(roleName?.trim())) {
          getTopics({ ...PARAMS_SELECT_SEARCH.topic, search: value });
        }
        else {
          getTopics({ ...PARAMS_SELECT_SEARCH.community_topic, search: value });
        }
      }, 500);
    },
    [timeout, roleName],
  );

  const handleSearchModuleOfTopic = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getModules({
          ...(roleName !== RoleName.TEACHER
            ? PARAMS_SELECT_SEARCH.module
            : PARAMS_SELECT_SEARCH.community_module),
          search: value,
          filters: JSON.stringify([
            {
              topicID: Number(topic?.value),
              topicType: roleName === RoleName.TEACHER ? TopicType.COMMUNITY_LIBRARY : '',
            },
          ]),
        });
      }, 500);
    },
    [timeout, topic],
  );

  const handleSearchCategories = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getCategories({ ...PARAMS_SELECT_SEARCH.category, search: value });
      }, 500);
    },
    [timeout],
  );

  const handleSearchSessionTags = useCallback(
    (value: string) => {
      setSessionTagValue(value);
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getSessionTags({ ...PARAMS_SELECT_SEARCH.sessionTag, search: value });
        setIsClearSearchingSession(false);
      }, 500);
    },
    [timeout],
  );

  const handleCreateSessionTag = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (
        event.key === KeyFormChangeData.ENTER &&
        !sessionTagOptions?.some((session) => session.label === sessionTagValue) &&
        sessionTagValue
      ) {
        createNewSessionTag({ tagName: sessionTagValue });
      }
    },
    [sessionTagOptions, sessionTagValue, createNewSessionTag],
  );

  const onChangeTopic = useCallback((value: any) => {
    setIsDisabledModule(true);
    form.setFieldsValue({
      addToModule: null,
    });
    if (value) {
      getModules({
        ...(roleName !== RoleName.TEACHER
          ? PARAMS_SELECT_SEARCH.module
          : PARAMS_SELECT_SEARCH.community_module),
        filters: JSON.stringify([
          {
            topicID: Number(topic?.value || value?.value),
            topicType: roleName === RoleName.TEACHER ? TopicType.COMMUNITY_LIBRARY : '',
          },
        ]),
      });
    }
  }, [state])

  const fields = useMemo(
    () => [
      {
        label: 'Topic',
        name: 'topic',
        type: `select-search`,
        options: topicOptions,
        disabled: isDisabledTopic,
        onChange: onChangeTopic,
        rules: [{ required: true, message: 'Topic is required!' }],
        handleSearch: handleSearchTopics,
      },
      {
        label: 'Add To Module',
        name: 'addToModule',
        type: 'select-search',
        options: modulesOptions,
        disabled: isDisabledModule,
        rules: [{ required: true, message: 'Add To Module is required!' }],
        handleSearch: handleSearchModuleOfTopic,
      },
      {
        label: 'Session Name',
        name: 'sessionName',
        type: 'string',
        isFullWidth: true,
        rules: [
          { required: true, message: 'Session Name is required!' },
          {
            validator(_: RuleObject, value: string) {
              if (value.trim() === "") {
                return Promise.reject('Session Name is required!');
              }
              return Promise.resolve();
            },
          },
        ],
        placeholder: 'Session Name'
      },
      {
        label: 'Session Details',
        name: 'sessionDetails',
        type: 'editor',
        isFullWidth: true,
        rules: [
          { required: true, message: 'Session Details is required!' },
        ],
      },
      {
        label: 'Category',
        name: 'category',
        type: 'select-search',
        options: categoriesOptions,
        rules: [{ required: true, message: 'Category is required!' }],
        handleSearch: handleSearchCategories,
      },
      {
        label: 'Program Type',
        name: 'programType',
        type: 'select',
        options: [
          { label: 'Meeting Session', value: 'Meeting Session' },
          { label: 'Semester', value: 'Semester' },
          { label: 'Short Course', value: 'Short Course' },
        ],
        rules: [{ required: true, message: 'Program Type is required!' }],
        placeholder: 'Select',
      },
      {
        label: 'Session Type',
        name: 'sessionType',
        type: 'select',
        options: [
          { label: 'Free Form Lesson', value: 'Free Form Lesson' },
          { label: 'Sequential Lesson', value: 'Sequential Lesson' },
          { label: 'Time Lesson', value: 'Time Lesson' },
        ],
        rules: [{ required: true, message: 'Session Type is required!' }],
        placeholder: 'Select',
      },
      {
        label: 'Select Tag',
        name: 'sessionTagIDs',
        type: 'select-search',
        options: sessionTagOptions,
        rules: [{ required: true, message: 'Select Tag is required!' }],
        handleSearch: handleSearchSessionTags,
        onKeyPress: handleCreateSessionTag,
        isClearSearchValue: isClearSearchingSession,
        isMultiple: true,
        placeholder: 'Select',
      },
      {
        label: 'Authorisation',
        name: 'authorization',
        type: 'select',
        options: [
          { label: 'Public', value: 'Public' },
          { label: 'Public (Request Permit)', value: 'Public (Request Permit)' },
          { label: 'Private', value: 'Private' },
          { label: 'Private (Select Person)', value: 'Private (Select Person)' },
        ],
        rules: [{ required: true, message: 'Authorisation is required!' }],
        placeholder: 'Select',
      },
      {
        label: 'Content Attached',
        name: 'contentAttachedPath',
        type: 'string',
        disabled: true,
        isHidden: !!(!isShowContactAttached && (status === Status.INCOMPLETE || !status)),
        icon: <EyeSVG />,
      },
    ],
    [
      isShowContactAttached,
      topicOptions,
      categoriesOptions,
      modulesOptions,
      isClearSearchingSession,
      sessionTagOptions,
      isDisabledTopic,
      isDisabledModule,
      status,
      form,
    ],
  );

  const renderField = useCallback(
    (field: IFieldListForm) => {
      switch (field.type) {
        case FIELDS.STRING:
          return (
            <CustomInput icon={field.icon} disabled={!isEdit || field.disabled} type={field.type}
              placeholder={field.placeholder}
            />
          );
        case FIELDS.NUMBER:
          return <CustomInput disabled={!isEdit} type={field.type} />;
        case FIELDS.DATE:
          return (
            <DatePicker
              disabled={!isEdit}
              format={DATE_FORMAT}
              className="style_input_custom_login_page"
            />
          );
        case FIELDS.EDITOR:
          return (
            <CKEditor
              editor={ClassicEditor}
              config={EDITOR_CONFIG}
              onChange={(event: EventTarget, editor: any) => {
                const data = editor.getData();
                setSessionDetail(data);
                setIsChanging(true);
              }}
              data={sessionDetail}
            />
          );
        case FIELDS.SELECT:
          return (
            <Select
              getPopupContainer={(node) => node}
              options={field.options as (BaseOptionType | DefaultOptionType)[]}
              disabled={!isEdit}
              placeholder={field.placeholder ?? "Select"}
            />
          );
        case FIELDS.SELECT_SEARCH:
          return (
            <SelectSearch
              handleSearchOptions={field?.handleSearch ? field?.handleSearch : () => { }}
              options={field.options}
              // className={errorSelect(field.name) ? 'field-error' : ''}
              onChange={field.onChange}
              isMultiple={field?.isMultiple}
              isClearSearchValue={field?.isClearSearchValue}
              onKeyPress={field?.onKeyPress ? field?.onKeyPress : () => { }}
              disable={field.disabled}
              placeholder={field.placeholder ?? "Select"}
            />
          );
        case '':
          return <div></div>;
        default:
          return <CustomInput disabled={!isEdit} type={field.type} />;
      }
    },
    [DATE_FORMAT, isEdit, form, sessionDetail],
  );

  usePrompt(WARNING_MESSAGE.LEAVE_MANAGE_ADMIN_INFO, isOpenConfirmLeave);

  const renderFieldList = useCallback(() => {
    return fields?.map(
      (field, index) =>
        !field.isHidden && (
          <Form.Item
            className={field.isFullWidth ? 'w-full' : 'w-full sm:w-full lg:w-[49%] w-49'}
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
  }, [fields, isEdit]);

  const redirectOption = () => {
    history(ROUTES.content_management);
  };

  const handleBack = () => {
    setIsOpenConfirmLeave(false);
    if (isChanging) {
      setIsModalNotice(true);
      return;
    }
    redirectOption();
  };

  const handleSaveSessionTemporarily = useCallback(() => {

    // setIsOpenConfirmLeave(false);

    const values = form.getFieldsValue();

    const dataSubmit = {
      sessionName: values.sessionName.trim(),
      moduleID: Number(values.addToModule?.value),
      categoryID: values.category ? Number(values?.category?.value) : undefined,
      status: 'Complete',
      sessionDetails: sessionDetail,
      programType: values.programType,
      sessionType: values.sessionType,
      tagIds: values.sessionTagIDs?.map((tag: { value: string; label: string }) =>
        Number(tag.value),
      ),
      contentAttachedPath: values?.contentAttachedPath,
      authorization: values?.authorization,
    };

    setSessionData((prev: any) => {
      return {
        ...prev,
        ...dataSubmit,
      }
    })
  }, [sessionDetail, form, sessionData])

  const handleSubmitInformation = useCallback(() => {
    setIsOpenConfirmLeave(false);

    if (sessionId) {
      mutateUpdateSession({ params: sessionData, sessionID: Number(sessionId) });
      return;
    }
    if (idSessionSaveAsDaft) {
      mutateUpdateSession({
        params: sessionData,
        sessionID: Number(idSessionSaveAsDaft),
      });
    } else {
      mutateCreateNewSession(sessionData);
    }
  }, [sessionDetail, sessionData])

  const handleSubmitAddContentPage = () => {
    setIsModalConfirm(true)
  }

  useEffect(() => {
    getCategories(PARAMS_SELECT_SEARCH.category);
    if ([RoleName.SUPER_ADMIN, RoleName.ADMIN].includes(roleName?.trim())) {
      getTopics({
        ...PARAMS_SELECT_SEARCH.topic,
        filters: JSON.stringify([{ topicType: TopicType.HQ_LIBRARY }]),
      });
    }
    else {
      getTopics({
        ...PARAMS_SELECT_SEARCH.community_topic,
        filters: JSON.stringify([{ topicType: TopicType.COMMUNITY_LIBRARY }]),
      });
    }

    getSessionTags(PARAMS_SELECT_SEARCH.sessionTag);
    setIsChanging(false);
  }, []);

  useEffect(() => {
    setIsOpenConfirmLeave(isChanging);
  }, [isChanging]);

  useEffect(() => {
    form.setFieldsValue({
      sessionDetails: sessionDetail,
    });
  }, [sessionDetail]);

  useEffect(() => {
    if (sessionId) {
      mutateGetSessionById(Number(sessionId));
      getUnits({
        limit: 9999,
        order: 'ASC',
        sort: 'order',
        filters: JSON.stringify([
          Object.fromEntries(
            Object.entries({
              sessionID: Number(sessionId),
            }).filter(([, v]) => (v as any)?.toString() !== ''),
          ),
        ]),
      });
    }
  }, [sessionId]);

  useEffect(() => {
    if (topic && !isDisabledTopic && isDisabledModule) {
      setIsDisabledModule(false);
    }
  }, [topic, isDisabledTopic, isDisabledModule])

  // check if clicked on session name 
  useEffect(() => {
    if (location.search) {
      const searchArr = location.search.slice(1).split('&');
      const searchContentIndex = searchArr.findIndex((x) => x.includes('content'));
      if (searchContentIndex >= 0 && searchArr[searchContentIndex] === 'content=true') {
        setIsOpenContentFirst(true);
        setIsContentTab(true);
      }
    }
  }, [location.search])

  return isLoading ? (
    <Loading isLoading={isLoading} />
  ) :
    (
      <Layout className="bg-transparent gap-y-6">
        <Breadcrumb
          style={{
            color: '#AEA8A5',
            fontWeight: '700',
            lineHeight: '36px',
            fontSize: '28px',
          }}
          className="font-fontFamily text-main-font-color custom-font-header"
        >
          <Breadcrumb.Item
            className="opacity-50 cursor-pointer"
            onClick={() => {
              history(ROUTES.content_management);
            }}
          >
            Content Management
          </Breadcrumb.Item>

          <Breadcrumb.Item
            className={!isContentTab ? "font-fontFamily text-main-font-color" : "opacity-50 cursor-pointer"}
            onClick={() => {
              setIsContentTab(false);
            }}
          >
            {sessionId ? `Edit Session` : 'Create New Session'}
          </Breadcrumb.Item>

          {
            isContentTab ? (
              <Breadcrumb.Item
                className={ACTIVE_TAB.map((item, index) => index).includes(activeTab) && activeTab == 0 ? "font-fontFamily text-main-font-color" : "opacity-50 cursor-pointer"}
                onClick={() => {
                  setActiveTab(0);
                }}
              >
                {sessionData?.sessionName}
              </Breadcrumb.Item>
            ) : ''
          }

          {
            isContentTab && ACTIVE_TAB.map((item, index) => index).includes(activeTab) && activeTab !== 0 ? (
              <Breadcrumb.Item
                className={"font-fontFamily text-main-font-color"}
              >
                {ACTIVE_TAB[activeTab]}
              </Breadcrumb.Item>
            ) : ''
          }
        </Breadcrumb>

        {
          !isContentTab ? (
            <Content className="rounded-3xl bg-white p-8">
              <div className="flex gap-x-3">
                <Form
                  layout="vertical"
                  className="flex flex-wrap gap-x-4 flex-[62%]"
                  form={form}
                  onFieldsChange={(fieldsChange) => {
                    if (
                      !fieldsChange?.some(
                        (field) => Array.isArray(field.name) && field.name.includes('sessionDetails'),
                      )
                    )
                      setIsChanging(true);
                  }}
                // onFinish={(values) => handleSubmitInformation(values)}
                >
                  {renderFieldList()}
                </Form>
              </div>

              <div className="flex gap-x-3 justify-end display-center">
                <ButtonCustom color="outline" onClick={handleBack}>
                  {isChanging || isEdit ? 'Cancel' : 'Back'}
                </ButtonCustom>

                {(!sessionId || status === Status.INCOMPLETE) && isShowSaveOfDaft && (
                  <ButtonCustom
                    color="outline"
                    onClick={() => {
                      const errors = [];
                      const dataFormSaveAs = form.getFieldsValue();
                      if (!dataFormSaveAs.sessionName) {
                        errors.push({ name: 'sessionName', errors: ['Session Name is required!'] });
                      }
                      if (!addToModule) {
                        errors.push({ name: 'addToModule', errors: ['Add to module is required!'] });
                      }
                      if (!topic) {
                        errors.push({ name: 'topic', errors: ['Topic is required!'] });
                      }
                      if (errors.length > 0) {
                        form.setFields(errors);
                        return;
                      }

                      const dataSubmit = {
                        sessionName: dataFormSaveAs.sessionName.trim(),
                        moduleID: Number(dataFormSaveAs.addToModule?.value),
                        categoryID: dataFormSaveAs.category
                          ? Number(dataFormSaveAs?.category?.value)
                          : undefined,
                        status: 'Incomplete',
                        sessionDetails: sessionDetail || undefined,
                        programType: dataFormSaveAs.programType,
                        sessionType: dataFormSaveAs.sessionType,
                        tagIds: dataFormSaveAs.sessionTagIDs?.map(
                          (tag: { value: string; label: string }) => Number(tag.value),
                        ),
                        contentAttachedPath: dataFormSaveAs?.contentAttachedPath,
                        authorization: dataFormSaveAs?.authorization,
                      };
                      if (idSessionSaveAsDaft) {
                        mutateUpdateSaveAsDraftSession({
                          params: dataSubmit,
                          sessionID: Number(idSessionSaveAsDaft),
                        });
                        return;
                      }

                      mutateSaveAsDraftSession(dataSubmit);
                    }}
                  >
                    Save as Draft
                  </ButtonCustom>
                )}

                <ButtonCustom
                  color="orange"
                  onClick={() => {
                    // setIsOpenConfirmLeave(false);
                    form.validateFields().then(() => {
                      // setIsModalConfirm(true);
                      handleSaveSessionTemporarily();
                      setIsContentTab(true);
                      setActiveTab(0);
                    });
                  }}
                >
                  {screen === SCREEN.newSessionSummary
                    ? 'Confirm'
                    : 'Continue'}
                </ButtonCustom>
              </div>
            </Content>
          ) : (
            <AddContentSession
              sessionData={sessionData}
              setSessionData={setSessionData}
              handleSubmitAddContentPage={handleSubmitAddContentPage}
              listUnits={listUnits}
              setListUnits={setListUnits}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setIsChanging={setIsChanging}
              isOpenContentFirst={isOpenContentFirst}
              isChanging={isChanging}
            />
          )
        }
        {isModalNotice && (
          <ModalCustom
            visible={true}
            cancelText="Cancel"
            onCancel={() => {
              setIsModalNotice(false);
              setIsOpenConfirmLeave(isChanging);
            }}
            okText="Leave"
            onSubmit={() => {
              setIsChanging(false);
              redirectOption();
              // setIsEdit(false);
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
            onSubmit={() => {
              // form.submit();
              handleSubmitInformation();
            }}
            onCancel={() => {
              setIsModalConfirm(false);
              setIsOpenConfirmLeave(isChanging);
            }}
            title="Confirmation"
            titleCenter
            content={`Are you sure you want to ${sessionId || sessionData?.Id ? "save" : "create"} ?`}
          />
        )}
      </Layout>
    )
};

export default CreateNewContentManagementSession;
