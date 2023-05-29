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
import { getModuleById } from 'api/module';
import { createNewSession, getSessionById, updateSession } from 'api/session';
import { createSessionTag, ISessionTag, searchSessionTags } from 'api/session_tag';
import { ReactComponent as EyeSVG } from 'assets/icons/eye.svg';
import ButtonCustom from 'components/Button';
import CheckboxCustom from 'components/Checkbox';
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
} from 'constants/constants';
import usePrompt from 'constants/function';
import { ITopic } from 'constants/index';
import { WARNING_MESSAGE } from 'constants/messages';
import { ICategory, IFieldListForm, IModule } from 'constants/types';
import AddContentSession, {
  IUnit,
  ListUnit,
} from 'pages/admin/content-management/session/add-content-session';
import { ACTIVE_TAB } from 'pages/admin/content-management/session/create-new-session';
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CreateNewContent from './create-new-content';

const CreateNewSession = () => {
  const history = useNavigate();
  const timeout: any = useRef(null);
  const location = useLocation();
  const { moduleId: moduleIdParam, topicId: topicIdParam, sessionId } = useParams();
  console.log('moduleIdParam', moduleIdParam, 'topicIdParam', topicIdParam);
  const [sessionNameEdit, setSessionNameEdit] = useState<string>('');
  const [isEdit, setIsEdit] = useState(true);
  const [form] = Form.useForm();
  const [idSessionSaveAsDaft, setSessionIdSaveAsDaft] = useState<number>();
  const sessionName = Form.useWatch('sessionName', form);
  const topic = Form.useWatch('topic', form);
  const addToModule = Form.useWatch('addToModule', form);
  const [sessionDetail, setSessionDetail] = useState<string>('');
  const sessionTagIDs = Form.useWatch('sessionTagIDs', form);
  const [isModalNotice, setIsModalNotice] = useState<boolean>(false);
  const [isModalConfirm, setIsModalConfirm] = useState<boolean>(false);
  const [sessionTagValue, setSessionTagValue] = useState('');
  const [screen, setScreen] = useState<string>(SCREEN.newSession);
  const [isDisabledTopic, setIsDisabledTopic] = useState<boolean>(true);
  const [isDisabledModule, setIsDisabledModule] = useState<boolean>(true);
  const [isOpenConfirmLeave, setIsOpenConfirmLeave] = useState<boolean>(false);
  const [isChanging, setIsChanging] = useState(false);
  const [topicTitleName, setTopicTitleName] = useState<string>('');
  const [moduleTitleName, setModuleTitleName] = useState<string>('');
  const [isShowSaveOfDaft, setIsShowSaveOfDaft] = useState<boolean>(true);
  const [status, setStatus] = useState<string>('');
  const [sessionDetailBackup, setSessionDetailBackup] = useState<string>('');
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
  const [tabActive, setTabActive] = useState<string>('');

  const [sessionData, setSessionData] = useState<any>(undefined);
  console.log('sessionData', sessionData);
  const [listUnits, setListUnits] = useState<ListUnit[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);

  const { mutate: mutateCreateUnit } = useMutation('createMultipleUnit', createMultipleUnit, {
    onSuccess: ({ data }) => {},
    onError: ({ response }) => {
      notification.error({ message: response.data.message });
    },
  });

  const { mutate: mutateGetSessionById, isLoading } = useMutation(
    'getSessionById',
    getSessionById,
    {
      onSuccess: ({ data }) => {
        setSessionNameEdit(data?.sessionName);
        setSessionDetail(data?.sessionDetails || '');
        setStatus(data?.status);
        const codeMudule =
          data?.module?.moduleCode && data?.module?.moduleCode !== ''
            ? `(${data?.module?.moduleCode})`
            : '';
        const dataEdit = {
          addToModule: {
            label: data?.module?.moduleName + ' ' + codeMudule,
            value: data?.module?.id?.toString(),
          },
          authorization: data?.authorization,
          category: data?.category
            ? { label: data?.category?.categoryName, value: data?.category?.id.toString() }
            : null,
          contentAttachedPath: 'preview-file.pdf',
          programType: data?.programType,

          // sessionDetail: data?.sessionDetails,
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

        if (data?.status === Status.COMPLETED) setIsShowContactAttached(true);
        form.setFieldsValue(dataEdit);
        setIsChanging(false);
        setSessionDetailBackup(data?.sessionDetails || '');
        setSessionData(data);
      },
    },
  );

  const handleCreateUnit = useCallback(
    (id: number) => {
      if (id || sessionId) {
        const temp = [...listUnits];
        if (temp.length > 0) {
          for (let i = 0; i < temp.length; i++) {
            if (temp[i].session) delete temp[i].session;
          }
        }
        mutateCreateUnit({
          sessionID: id || Number(sessionId),
          params: [...temp].map((unit, index) => {
            return {
              ...unit,
              order: index + 1,
            };
          }),
        });
      }
    },
    [listUnits, sessionId],
  );

  const { mutate: mutateCreateNewSession } = useMutation('createNewSession', createNewSession, {
    onSuccess: ({ data }) => {
      // create units after create session
      setIsChanging(false);
      if (data?.id || sessionId) {
        handleCreateUnit(Number(data?.id || sessionId));
      }
      console.log('tabActive', tabActive);
      if (tabActive === SCREEN.topic_tab) {
        history(
          `${ROUTES.hq_library_topic}/${topicIdParam}/module/${
            addToModule?.value || moduleIdParam?.toString()
          }/session/${data?.id}/overview`,
        );
      } else if (tabActive === SCREEN.module_tap) {
        history(
          `${ROUTES.hq_library_module}/${addToModule?.value || moduleIdParam?.toString()}/session/${
            data?.id
          }/overview`,
        );
      } else {
        history(`${ROUTES.hq_library_session}/${data?.id}/overview`);
      }
    },
    onError: ({ response }) => {
      if (response.status == 403) {
        notification.error({ message: 'You are not allowed to create session.' });
        return;
      }
      const message = response.data.message;
      // if (message.includes('already exists')) {
      //   form.setFields([
      //     {
      //       name: 'sessionName',
      //       errors: [message],
      //     },
      //   ]);
      //   return;
      // }

      if (message.includes('already exists')) {
        setScreen(SCREEN.newSession);
        setTimeout(() => {
          form.setFields([
            {
              name: 'sessionName',
              errors: [message],
            },
          ]);
          return;
        }, 500);
      }
      notification.error({ message: response.data.message });
    },
  });

  const { mutate: mutateUpdateSession } = useMutation('updateSession', updateSession, {
    onSuccess: ({ data }) => {
      // create units after create session
      setIsChanging(false);
      if (data?.id || sessionId) {
        handleCreateUnit(Number(data?.id || sessionId));
      }

      if (tabActive === SCREEN.topic_tab) {
        history(
          `${ROUTES.hq_library_topic}/${topicIdParam}/module/${
            addToModule?.value || moduleIdParam?.toString()
          }/session/${data?.id}/overview`,
        );
      } else if (tabActive === SCREEN.module_tap) {
        history(
          `${ROUTES.hq_library_module}/${addToModule?.value || moduleIdParam?.toString()}/session/${
            data?.id
          }/overview`,
        );
      } else {
        history(`${ROUTES.hq_library_session}/${data?.id}/overview`);
      }
    },
    onError: ({ response }) => {
      if (response.status == 403) {
        notification.error({ message: 'You are not allowed to edit session.' });
        return;
      }
      const message = response.data.message;
      // if (message.includes('already exists')) {
      //   form.setFields([
      //     {
      //       name: 'sessionName',
      //       errors: [message],
      //     },
      //   ]);
      //   return;
      // }

      if (message.includes('already exists')) {
        setScreen(SCREEN.newSession);
        setTimeout(() => {
          form.setFields([
            {
              name: 'sessionName',
              errors: [message],
            },
          ]);
          return;
        }, 500);
      }

      notification.error({ message: response.data.message });
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
      if (response.status == 403) {
        notification.error({ message: 'You are not allowed to create session.' });
        return;
      }
      const message = response.data.message;
      if (message.includes('already exists')) {
        form.setFields([
          {
            name: 'sessionName',
            errors: [message],
          },
        ]);
        return;
      }
      notification.error({ message: response.data.message });
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
      if (response.status == 403) {
        notification.error({ message: 'You are not allowed to create session.' });
        return;
      }
      const message = response.data.message;
      if (message.includes('already exists')) {
        form.setFields([
          {
            name: 'sessionName',
            errors: [message],
          },
        ]);
        return;
      }
      notification.error({ message: response.data.message });
    },
  });

  const { mutate: mutateGetModuleById } = useMutation('getModuleById', getModuleById, {
    onSuccess: ({ data }) => {
      const codeMudule = data?.moduleCode && data?.moduleCode !== '' ? `(${data?.moduleCode})` : '';
      setTopicTitleName(data.topic.topicName);
      setModuleTitleName(data.moduleName + ' ' + codeMudule);
      form.setFieldsValue({
        topic: { label: data.topic.topicName, value: topicIdParam?.toString() },
        addToModule: {
          label: data.moduleName + ' ' + codeMudule,
          value: moduleIdParam?.toString(),
        },
      });
      setIsChanging(false);
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
          const codeMudule = el?.moduleCode && el?.moduleCode !== '' ? `(${el?.moduleCode})` : '';
          return {
            label: el.moduleName.toString() + ' ' + codeMudule,
            value: el.id.toString(),
            isDisabled: false,
          };
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
    onError: ({ response }: { response: { data: { message: string }; status: number } }) => {
      if (response.status == 403) {
        notification.error({ message: 'You are not allowed to create session tag.' });
      } else {
        notification.error({ message: response.data.message });
      }
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
      },
    },
  );

  const handleSearchTopics = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getTopics({ ...PARAMS_SELECT_SEARCH.topic, search: value });
      }, 500);
    },
    [timeout],
  );

  const handleSearchModuleOfTopic = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getModules({
          ...PARAMS_SELECT_SEARCH.module,
          search: value,
          filters: JSON.stringify([{ topicID: Number(topic?.value) }]),
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

  const onChangeTopic = (value: any) => {
    setIsDisabledModule(true);
    form.setFieldsValue({
      addToModule: null,
    });
    if (value) {
      getModules({
        ...PARAMS_SELECT_SEARCH.module,
        filters: JSON.stringify([{ topicID: Number(value?.value) }]),
      });
    }
  };

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
              if (value.trim() === '') {
                return Promise.reject('Session Name is required!');
              }
              return Promise.resolve();
            },
          },
        ],
      },
      {
        label: 'Session Details',
        name: 'sessionDetails',
        type: 'editor',
        isFullWidth: true,
        rules: [{ required: true, message: 'Session Details is required!' }],
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
            <CustomInput icon={field.icon} disabled={!isEdit || field.disabled} type={field.type} />
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
            />
          );
        case FIELDS.SELECT_SEARCH:
          return (
            <SelectSearch
              handleSearchOptions={field?.handleSearch ? field?.handleSearch : () => {}}
              options={field.options}
              // className={errorSelect(field.name) ? 'field-error' : ''}
              onChange={field.onChange}
              isMultiple={field?.isMultiple}
              isClearSearchValue={field?.isClearSearchValue}
              onKeyPress={field?.onKeyPress ? field?.onKeyPress : () => {}}
              disable={field.disabled}
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
            className={field.isFullWidth ? 'w-full' : 'sm:w-full w-[calc(50%_-_0.5rem)]'}
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
    if (tabActive === SCREEN.topic_tab) {
      history(`${ROUTES.hq_library_topic}/${topicIdParam}/module/${addToModule.value}/session`);
    } else if (tabActive === SCREEN.module_tap) {
      history(`${ROUTES.hq_library_module}/${addToModule.value}/session`);
    } else {
      history(ROUTES.hq_library_session);
    }
  };

  const handleBack = () => {
    setIsOpenConfirmLeave(false);
    if (isChanging) {
      setIsModalNotice(true);
      return;
    }
    redirectOption();
  };

  // handle submit of add content tab
  const handleSubmitAddContentPage = () => {
    setIsModalConfirm(true);
  };

  const handleSubmitInformation = useCallback(() => {
    setIsOpenConfirmLeave(false);
    setIsChanging(false);
    console.log('sessionData subbmittt', sessionData);
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
  }, [sessionDetail, sessionData]);

  useEffect(() => {
    if (JSON.stringify(sessionDetail) !== JSON.stringify(sessionDetailBackup)) {
      setIsChanging(true);
    }
  }, [sessionDetail, sessionDetailBackup]);

  useEffect(() => {
    if (sessionId) mutateGetSessionById(Number(sessionId));

    if (moduleIdParam) mutateGetModuleById(Number(moduleIdParam));
    getCategories(PARAMS_SELECT_SEARCH.category);
    getTopics(PARAMS_SELECT_SEARCH.topic);
    // getModules(PARAMS_SELECT_SEARCH.module);
    getSessionTags(PARAMS_SELECT_SEARCH.sessionTag);
    setIsChanging(false);
  }, []);

  useEffect(() => {
    setIsOpenConfirmLeave(isChanging);
  }, [isChanging]);

  useEffect(() => {
    if (
      location.pathname.includes('topic') &&
      location.pathname.includes('module') &&
      location.pathname.includes('session')
    ) {
      setTabActive(SCREEN.topic_tab);
      setIsDisabledTopic(true);
      setIsDisabledModule(true);
    } else if (location.pathname.includes('module') && location.pathname.includes('/session')) {
      setTabActive(SCREEN.module_tap);
      setIsDisabledModule(true);
      setIsDisabledTopic(true);
    } else {
      setTabActive(SCREEN.session_tap);
      if (!sessionId) setIsDisabledTopic(false);
      setIsDisabledModule(true);
    }
  }, [location.pathname]);

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

  return [SCREEN.newSession, SCREEN.newSessionSummary].includes(screen) ? (
    isLoading ? (
      <Loading isLoading={isLoading} />
    ) : (
      <Layout className="bg-transparent gap-y-6">
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
              if (tabActive === SCREEN.topic_tab) {
                history(ROUTES.hq_library_topic);
              } else if (tabActive === SCREEN.module_tap) {
                history(ROUTES.hq_library_module);
              } else {
                history(ROUTES.hq_library_session);
              }
            }}
          >
            HQ Library - {tabActive.charAt(0).toUpperCase() + tabActive.slice(1)}
          </Breadcrumb.Item>
          {tabActive === SCREEN.topic_tab ? (
            <>
              <Breadcrumb.Item
                className="opacity-50 cursor-pointer"
                onClick={() => {
                  history(`${ROUTES.hq_library_topic}/${topicIdParam}/module`);
                }}
              >
                {topicTitleName}
              </Breadcrumb.Item>
              <Breadcrumb.Item
                className="opacity-50 cursor-pointer"
                onClick={() => {
                  history(
                    `${ROUTES.hq_library_topic}/${topicIdParam}/module/${addToModule.value}/session`,
                  );
                }}
              >
                {moduleTitleName}
              </Breadcrumb.Item>
            </>
          ) : tabActive === SCREEN.module_tap ? (
            <Breadcrumb.Item
              className="opacity-50 cursor-pointer"
              onClick={() => {
                history(`${ROUTES.hq_library_module}/${addToModule.value}/session`);
              }}
            >
              {moduleTitleName}
            </Breadcrumb.Item>
          ) : (
            <></>
          )}
          <Breadcrumb.Item className="font-fontFamily text-main-font-color">
            {sessionId ? `Edit ${sessionNameEdit}` : 'Create New Session'}
          </Breadcrumb.Item>
        </Breadcrumb>

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
              onFinish={(values) => {
                setIsOpenConfirmLeave(false);

                const dataSubmit = {
                  sessionName: sessionName.trim(),
                  moduleID: values.addToModule
                    ? Number(values.addToModule?.value)
                    : Number(moduleIdParam),
                  categoryID: values.category ? Number(values?.category?.value) : undefined,
                  status: 'Complete',
                  sessionDetails: sessionDetail || undefined,
                  programType: values.programType,
                  sessionType: values.sessionType,
                  tagIds: values.sessionTagIDs?.map((tag: { value: string; label: string }) =>
                    Number(tag.value),
                  ),
                  contentAttachedPath: values?.contentAttachedPath,
                  authorization: values?.authorization,
                };

                if (sessionId) {
                  mutateUpdateSession({ params: dataSubmit, sessionID: Number(sessionId) });
                  return;
                }
                if (idSessionSaveAsDaft) {
                  mutateUpdateSession({
                    params: dataSubmit,
                    sessionID: Number(idSessionSaveAsDaft),
                  });
                } else {
                  mutateCreateNewSession(dataSubmit);
                }
              }}
            >
              {renderFieldList()}
            </Form>
          </div>

          {sessionId && status === Status.COMPLETED && (
            <CheckboxCustom
              disabled={true}
              label="Notify to teacher & admin"
              className="sm:pb-4 md:pb-4 lg:pb-4"
            ></CheckboxCustom>
          )}

          <div className="flex gap-x-3 justify-end">
            <ButtonCustom color="outline" onClick={handleBack}>
              {isChanging || isEdit ? 'Cancel' : 'Back'}
            </ButtonCustom>
            {(!sessionId || status === Status.INCOMPLETE) && isShowSaveOfDaft && (
              <ButtonCustom
                color="outline"
                onClick={() => {
                  const errors = [];
                  if (!sessionName) {
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

                  const dataFormSaveAs = form.getFieldsValue();

                  const dataSubmit = {
                    sessionName: sessionName.trim(),
                    moduleID: dataFormSaveAs.addToModule
                      ? Number(dataFormSaveAs.addToModule?.value)
                      : Number(moduleIdParam),
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
                form.validateFields().then((data) => {
                  // set data into state
                  const dataSubmit = {
                    sessionName: sessionName.trim(),
                    moduleID: data.addToModule
                      ? Number(data.addToModule?.value)
                      : Number(moduleIdParam),
                    categoryID: data.category ? Number(data?.category?.value) : undefined,
                    status: 'Complete',
                    sessionDetails: sessionDetail || undefined,
                    programType: data.programType,
                    sessionType: data.sessionType,
                    tagIds: data.sessionTagIDs?.map((tag: { value: string; label: string }) =>
                      Number(tag.value),
                    ),
                    contentAttachedPath: data?.contentAttachedPath || 'preview-file.pdf',
                    authorization: data?.authorization,
                  };
                  setSessionData((prev: any) => {
                    return {
                      ...prev,
                      ...dataSubmit,
                    };
                  });
                  setScreen(SCREEN.newContent);
                  // if (
                  //   screen === SCREEN.newSessionSummary ||
                  //   (sessionId && status === Status.COMPLETED)
                  // ) {
                  //   setIsModalConfirm(true);
                  // } else {
                  //   setScreen(SCREEN.newContent);
                  //   form.setFieldsValue({
                  //     contentAttachedPath: 'preview-file.pdf',
                  //   });
                  // }
                });
              }}
            >
              {/* {screen === SCREEN.newSessionSummary || (sessionId && status === Status.COMPLETED)
                ? 'Confirm'
                : 'Continue'} */}
              Continue
            </ButtonCustom>
          </div>

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
              content={`Are you sure you want to ${
                sessionId ? 'update' : 'create'
              } ${sessionName} ?`}
            />
          )}
        </Content>
      </Layout>
    )
  ) : (
    // <CreateNewContent
    //   setIsShowSaveOfDaft={setIsShowSaveOfDaft}
    //   setScreen={setScreen}
    //   setIsShowContactAttached={setIsShowContactAttached}
    // />
    <Layout className="bg-transparent gap-y-6">
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
            // history(ROUTES.content_management);
            if (tabActive === SCREEN.topic_tab) {
              history(ROUTES.hq_library_topic);
            } else if (tabActive === SCREEN.module_tap) {
              history(ROUTES.hq_library_module);
            } else {
              history(ROUTES.hq_library_session);
            }
          }}
        >
          {/* Content Management */}
          HQ Library
        </Breadcrumb.Item>

        <Breadcrumb.Item
          className="opacity-50 cursor-pointer"
          onClick={() => {
            setScreen(SCREEN.newSession);
          }}
        >
          {sessionId ? `Edit Session` : 'Create New Session'}
        </Breadcrumb.Item>

        <Breadcrumb.Item
          className={
            ACTIVE_TAB.map((item, index) => index).includes(activeTab) && activeTab == 0
              ? 'font-fontFamily text-main-font-color'
              : 'opacity-50 cursor-pointer'
          }
          onClick={() => {
            setActiveTab(0);
          }}
        >
          {sessionData?.sessionName}
        </Breadcrumb.Item>

        {ACTIVE_TAB.map((item, index) => index).includes(activeTab) && activeTab !== 0 ? (
          <Breadcrumb.Item className={'font-fontFamily text-main-font-color'}>
            {ACTIVE_TAB[activeTab]}
          </Breadcrumb.Item>
        ) : (
          ''
        )}

        {/* <Breadcrumb.Item
          className={![1, 2, 4, 5].includes(activeTab) ? "font-fontFamily text-main-font-color" : "opacity-50 cursor-pointer"}
          onClick={() => {
            setActiveTab(0);
          }}
        >
          {sessionData?.sessionName}
        </Breadcrumb.Item>

        {
          screen === SCREEN.newContent && [1, 2, 4, 5].includes(activeTab) ? (
            <Breadcrumb.Item
              className={"font-fontFamily text-main-font-color"}
            >
              {ACTIVE_TAB[activeTab]}
            </Breadcrumb.Item>
          ) : ''
        } */}
      </Breadcrumb>
      <AddContentSession
        sessionData={sessionData}
        setSessionData={setSessionData}
        handleSubmitAddContentPage={handleSubmitAddContentPage}
        listUnits={listUnits}
        setListUnits={setListUnits}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsChanging={setIsChanging}
        isChanging={isChanging}
      />
      {isModalConfirm && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          okText="Confirm"
          onSubmit={() => {
            handleSubmitInformation();
          }}
          onCancel={() => {
            setIsModalConfirm(false);
            setIsOpenConfirmLeave(isChanging);
          }}
          title="Confirmation"
          titleCenter
          content={`Are you sure you want to ${sessionId ? 'update' : 'create'} ${
            sessionData.sessionName
          } ?`}
        />
      )}
    </Layout>
  );
};

export default CreateNewSession;
