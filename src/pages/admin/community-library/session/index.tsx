import { Form, notification } from 'antd';
import { getListCategories } from 'api/courses';
import { getModuleById, searchModules } from 'api/module';
import {
  deleteMultipleSessions,
  deleteSession,
  duplicateSession,
  searchSessions,
} from 'api/session';
import { searchTopics } from 'api/topic';
import ModalCustom from 'components/Modal';
import { ORDER, PARAMS_SELECT_SEARCH, ROUTES, TEXT_SELECT_SEARCH } from 'constants/constants';
import { ICategory, IModule, IOptionItem, ISession, ITopic } from 'constants/index';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import ModalDuplicateSession from '../component/duplicate-session';
import SessionList from '../component/session-list';
import { createMultipleUnit, searchUnits } from 'api/content_management';

interface IFields {
  search: string;
  modules: { label: string; value: string };
  categories: { label: string; value: string };
  topics: { label: string; value: string };
}

export interface ISessionInfo {
  id?: number;
  key?: string;
  moduleName: string;
  moduleCode?: string;
  categoryName?: string;
  topicName: string;
  sessionName: string;
  status?: string;
}

enum Status {
  COMPLETED = 'Complete',
  INCOMPLETE = 'Incomplete',
}

export const SESSION_DEFAULT = {
  sessionName: '',
  moduleName: '',
  topicName: '',
};

const CommunityLibrarySession = () => {
  const timeout: any = useRef(null);
  const history = useNavigate();
  const [formDuplicateSession] = Form.useForm();
  const { topicId, moduleId } = useParams();
  const topicNameDuplicate = Form.useWatch('topicName', formDuplicateSession);
  const moduleNameDuplicate = Form.useWatch('moduleName', formDuplicateSession);
  const [topicIdFilter, setTopicIdFilter] = useState<string>('');
  const [listSession, setListSession] = useState<ISessionInfo[]>([]);
  const [searchResult, setSearchResult] = useState<{ id: number; sessionName: string }[]>([]);
  const [selection, setSelection] = useState<React.Key[]>([]);
  const [limit, setLimit] = useState('5');
  const [messageConfirmDelete, setMessageConfirmDelete] = useState<string | null>('');
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [isKeepOpen, setIsKeepOpen] = useState(true);
  const [filters, setFilters] = useState({});
  const [messageWarning, setMessageWarning] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState<string>('ASC');
  const [moduleName, setModuleName] = useState<string>('');
  const [topicName, setTopicName] = useState<string>('');
  const [sort] = useState<string>('sessionName');
  const [isModalDeleteSession, setIsModalDeleteSession] = useState(false);
  const [isModalDuplicateSession, setIsModalDuplicateSession] = useState(false);
  const [sessionId, setSessionId] = useState<number | string>('');
  const [status, setStatus] = useState('');
  const [sessionDuplicate, setSessionDuplicate] = useState<ISessionInfo>(SESSION_DEFAULT);
  const [categoriesOptions, setCategoriesOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [topicsOptions, setTopicsOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [modulesOptions, setModulesOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);

  const [pagination, setPagination] = useState<{
    current: number;
    pageSize: number;
    total?: number;
  }>({
    current: 1,
    pageSize: 5,
  });
  const [newSession, setNewSession] = useState('');


  const { mutate: searchListSessions } = useMutation('searchSessions', searchSessions, {
    onSuccess: ({ data }: { data: { records: ISession[] } }) => {
      const sessions = data.records.map((el) => {
        return { sessionName: el.sessionName, id: el.id };
      });
      setSearchResult(sessions);
    },
  });

  const { mutate: getListSessions } = useMutation('searchSessions', searchSessions, {
    onSuccess: ({
      data,
    }: {
      data: { records: ISession[]; total: number; page: number; limit: number };
    }) => {
      const sessions = data.records.map((el) => {
        const codeMudule = el?.module?.moduleCode && el?.module?.moduleCode !== "" ? `(${el?.module?.moduleCode})` : ""
        return {
          id: el.id,
          key: el.id.toString(),
          sessionName: el?.sessionName,
          categoryName: el?.category?.categoryName,
          moduleName: el?.module?.moduleName + " " + codeMudule,
          topicName: el?.module?.topic?.topicName,
          status: el?.status,
        };
      });
      setListSession(sessions);
      setPagination({
        ...pagination,
        current: data?.page,
        pageSize: Number(data?.limit),
        total: data?.total || 0,
      });
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

  const { mutate: getTopics } = useMutation('searchTopics', searchTopics, {
    onSuccess: ({ data }: { data: { records: ITopic[] } }) => {
      const newOptions = data.records
        .map((el) => {
          return { label: el.topicName.toString(), value: el.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.topic, value: '', isDisabled: true }]);
      setTopicsOptions(newOptions);
    },
  });

  const { mutate: getModuleDetail } = useMutation('getModuleById', getModuleById, {
    onSuccess: ({
      data,
    }: {
      data: { moduleName: string; moduleCode: string; id: number; topic: { topicName: string; id: number } };
    }) => {
      const codeMudule = data?.moduleCode && data?.moduleCode !== "" ? `(${data?.moduleCode})` : ""
      setModuleName(data?.moduleName + " " + codeMudule);
      setTopicName(data?.topic?.topicName);
      setTopicIdFilter(String(data?.topic?.id));
    },
  });

  const { mutate: getModules } = useMutation('searchModules', searchModules, {
    onSuccess: ({ data }: { data: { listModules: IModule[] } }) => {
      const newOptions = data.listModules
        .map((el) => {
          return { label: el.moduleName.toString(), value: el.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.module, value: '', isDisabled: true }]);
      setModulesOptions(newOptions);
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

  const renderOrder = useCallback(() => {
    switch (order) {
      case ORDER.ASC:
        return ORDER.ASC;
      case ORDER.DESC:
        return ORDER.DESC;
      default:
        return '';
    }
  }, [order]);

  const renderSort = useCallback(() => {
    switch (order) {
      case ORDER.ASC:
        return sort;
      case ORDER.DESC:
        return sort;

      default:
        return '';
    }
  }, [sort, order]);

  const handleGetListSessions = useCallback(
    (page?: number) => {
      getListSessions({
        limit: Number(limit),
        page: page ? page : Number(pagination.current),
        search: searchValue,
        order: renderOrder(),
        sort: renderSort(),
        filters:
          Object.getOwnPropertyNames(filters).length > 0
            ? JSON.stringify([
                Object.fromEntries(
                  Object.entries({
                    ...filters,
                    status: status ? status : '',
                    moduleID:
                      filters.hasOwnProperty('moduleID') &&
                      (filters as { moduleID: number })?.moduleID
                        ? Number((filters as { moduleID: number })?.moduleID)
                        : moduleId
                        ? Number(moduleId)
                        : '',
                    topicID:
                      filters.hasOwnProperty('topicID') && (filters as { topicID: number })?.topicID
                        ? Number((filters as { topicID: number })?.topicID)
                        : topicId
                        ? Number(topicId)
                        : '',
                  }).filter(([, v]) => (v as string)?.toString() !== ''),
                ),
              ])
            : JSON.stringify([
                Object.fromEntries(
                  Object.entries({
                    moduleID: moduleId ? Number(moduleId) : '',
                    topicID: topicId ? Number(topicId) : '',
                    status: status ? status : '',
                  }).filter(([, v]) => (v as string)?.toString() !== ''),
                ),
              ]),
      });
    },
    [
      limit,
      pagination.current,
      searchValue,
      renderOrder,
      renderSort,
      filters,
      moduleId,
      status,
      topicId,
    ],
  );
  const [messageDuplicateSessionSuccess, setMessageDuplicateSessionSuccess] = useState<string>('');
  const { mutate: mutateDuplicateSession } = useMutation('duplicateSession', duplicateSession, {
    onSuccess: ({ data }) => {
      setNewSession(data?.id)
      setIsModalDuplicateSession(false);
      handleGetListSessions();
      formDuplicateSession.resetFields();
      setMessageDuplicateSessionSuccess(
        `${sessionDuplicate?.sessionName} from ${
          sessionDuplicate?.topicName + '-' + sessionDuplicate?.moduleName
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

  const renderModalDuplicateSuccess = useCallback(() => {
    return (
      messageDuplicateSessionSuccess && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setMessageDuplicateSessionSuccess('');
            setSessionDuplicate(SESSION_DEFAULT);
          }}
          title="Duplicate Session"
          titleCenter
          content={messageDuplicateSessionSuccess}
        />
      )
    );
  }, [messageDuplicateSessionSuccess]);

  const { mutate: mutateDeleteSession } = useMutation('deleteSession', deleteSession, {
    onSuccess: () => {
      setIsModalDeleteSession(false);
      if (listSession?.length === 1 && Number(pagination.current) > 1) {
        setPagination({ ...pagination, current: Number(pagination.current) - 1 });
        return;
      }
      handleGetListSessions();
    },
    onError: ({ response }: { response: { data: { message: string } } }) => {
      setIsModalDeleteSession(false);
      setMessageWarning(response.data.message);
    },
  });

  const { mutate: mutateDeleteMultipleSessions } = useMutation(
    'deleteMultipleSessions',
    deleteMultipleSessions,
    {
      onSuccess: () => {
        setPagination({ ...pagination, current: 1 });
        if (pagination.current === 1) {
          handleGetListSessions(1);
        }
      },
      onError: ({ response }) => {
        setMessageWarning(response.data.message);
      },
    },
  );

  useEffect(() => {
    handleGetListSessions();
  }, [limit, pagination.current, searchValue, sort, order, filters, status, moduleId, topicId]);

  const handleSearchCategories = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getCategories({ ...PARAMS_SELECT_SEARCH.category, search: value });
      }, 500);
    },
    [timeout],
  );

  useEffect(() => {
    getCategories(PARAMS_SELECT_SEARCH.category);
    getTopics(PARAMS_SELECT_SEARCH.topic);
    getModules(PARAMS_SELECT_SEARCH.module);
  }, []);

  useEffect(() => {
    if (moduleId) {
      getModuleDetail(Number(moduleId));
    }
  }, [moduleId]);

  const redirectSessionDetail = (id: number, statusRedirect: string) => {
    history(
      `${ROUTES.community_library}/topic/${topicId}/module/${moduleId}/session/${id}/overview`,
    );
  };

  const handleDuplicateSession = (values: { topicName: IOptionItem; moduleName: IOptionItem }) => {
    mutateDuplicateSession({
      moduleId: Number(values?.moduleName?.value),
      sessionId: Number(sessionId),
    });
  };

  const renderModalConfirmDelete = useCallback(() => {
    return (
      isModalDeleteSession && (
        <ModalCustom
          visible={isModalDeleteSession}
          onCancel={() => {
            setIsModalDeleteSession(false);
          }}
          cancelText="Cancel"
          okText="Confirm"
          title="Delete"
          onSubmit={() => mutateDeleteSession(Number(sessionId))}
          titleCenter
        >
          <div>Are you sure you want to delete this session? This action cannot be undone.</div>
        </ModalCustom>
      )
    );
  }, [isModalDeleteSession, sessionId]);

  const renderModalDuplicateSession = useCallback(() => {
    return (
      isModalDuplicateSession && (
        <ModalDuplicateSession
          onCancel={() => {
            setIsModalDuplicateSession(false);
            formDuplicateSession.resetFields();
            setSessionId('');
          }}
          formDuplicateSession={formDuplicateSession}
          isKeepOpen={isKeepOpen}
          isModalDuplicateSession={true}
          handleDuplicateSession={handleDuplicateSession}
        />
      )
    );
  }, [isModalDuplicateSession, isKeepOpen]);

  const handleTableChange = () => {
    setPagination({ ...pagination, current: 2 });
  };

  const onFinish = useCallback(
    (values: IFields) => {
      setPagination({ ...pagination, pageSize: Number(limit), current: 1 });
      setSearchValue(values.search);
      setFilters({
        categoryID: values?.categories?.value ? Number(values?.categories?.value) : '',
        moduleID: values?.modules?.value ? Number(values?.modules?.value) : '',
        topicID: values?.topics?.value ? Number(values?.topics?.value) : '',
      });
    },
    [limit, pagination, order],
  );

  const onChangeSelect = (selectedRowKeys: React.Key[]) => {
    setSelection(selectedRowKeys.map((item) => Number(item)));
  };

  const debounceSearch = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchListSessions({
          limit: Number(limit),
          page: 1,
          search: value,
          order: 'ASC',
          sort,
          filters: JSON.stringify([{ moduleID: Number(moduleId) }]),
        });
      }, 500);
    },
    [limit, pagination.current, timeout, sort, moduleId],
  );

  const handleChangeSearch = useCallback((value: string) => {
    debounceSearch(value);
  }, []);

  const onChangeLimit = (value: string) => {
    const total = pagination.total;
    const maxPage = Math.ceil(Number(total) / Number(value));
    setLimit(String(value));
    if (Number(pagination.current) > maxPage) setPagination({ ...pagination, current: maxPage });
    else setPagination(pagination);
  };

  const onFilter = useCallback(
    (value: string) => {
      setPagination({ ...pagination, current: 1 });
      setOrder(value);
      if (value !== Status.COMPLETED && value !== Status.INCOMPLETE) {
        setStatus('');
        return;
      }
      setStatus(value);
    },
    [pagination],
  );

  const onChangeAction = useCallback(
    (value: string) => {
      if (value === 'selection') {
        setIsModalDuplicateSession(true);
      }
    },
    [selection],
  );

  const handleDeleteSelection = () => {
    mutateDeleteMultipleSessions({ sessionIDs: Array.isArray(selection) ? selection : [] });
  };

  const renderModalConfirm = useCallback(() => {
    return (
      isModalConfirm && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          okText="Confirm"
          onSubmit={handleDeleteSelection}
          onCancel={() => {
            setIsModalConfirm(false);
          }}
          title="Delete"
          titleCenter
          content={messageConfirmDelete}
        />
      )
    );
  }, [isModalConfirm]);

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

  const handleReset = useCallback(() => {
    setOrder('ASC');
    setLimit('5');
    setFilters({});
    setSearchValue('');
    setStatus('');
  }, [limit]);

  return (
    <>
      <SessionList
        topicName={topicName}
        moduleName={moduleName}
        isSessionOfModule={true}
        listSession={listSession}
        searchResult={searchResult}
        limit={limit}
        order={order}
        categoriesOptions={categoriesOptions}
        pagination={pagination}
        topicsOptions={topicsOptions}
        modulesOptions={modulesOptions}
        handleSearchCategories={handleSearchCategories}
        handleTableChange={handleTableChange}
        onFilter={onFilter}
        onFinish={onFinish}
        setPagination={setPagination}
        handleReset={handleReset}
        onChangeSelect={onChangeSelect}
        onChangeLimit={onChangeLimit}
        setSessionId={setSessionId}
        searchValue={searchValue}
        selection={selection}
        handleChangeSearch={handleChangeSearch}
        onChangeAction={onChangeAction}
        renderModalDuplicateSession={renderModalDuplicateSession}
        renderModalWarning={renderModalWarning}
        renderModalConfirm={renderModalConfirm}
        renderModalConfirmDelete={renderModalConfirmDelete}
        setIsModalDeleteSession={setIsModalDeleteSession}
        setIsModalDuplicateSession={setIsModalDuplicateSession}
        redirectSessionDetail={redirectSessionDetail}
        isDisabledFilterField={true}
        topicIdFilter={topicIdFilter}
        setSessionDuplicate={setSessionDuplicate}
      />
      {renderModalDuplicateSuccess()}
    </>
  );
};

export default CommunityLibrarySession;
