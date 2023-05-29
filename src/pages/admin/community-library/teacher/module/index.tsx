import { Breadcrumb, Form, Layout, notification, TablePaginationConfig } from 'antd';
import { getListCategories } from 'api/courses';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import { ReactComponent as DuplicateSVG } from 'assets/icons/duplicate.svg';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import FilterCard from 'components/SearchBar/FilterCard';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom from 'components/SearchBar/Table';
import CustomTooltip from 'components/Tooltip';
import { PARAMS_SELECT_SEARCH, TEXT_SELECT_SEARCH, TopicType } from 'constants/constants';
import { ICategory, ITopic, ROUTES } from 'constants/index';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SelectCustom from 'components/Select';
import CustomInput from 'components/Input';
import {
  createNewModule,
  deleteModule,
  deleteMultipleModules,
  duplicateNewModule,
  getListTopics,
  searchModules,
  updateModule,
} from 'api/hq_library';
import SelectSearch from 'components/SelectSearch';
import { getTopicById } from 'api/topic';
import { AppContext } from 'context';

interface IFields {
  search: string;
  categories: { label: string; value: string };
  topics: { label: string; value: string };
  value: string;
}
export interface IModuleInfo {
  id: number;
  key: string;
  moduleName: string;
  moduleCode?: string;
  topicName: string;
  status: string;
  topicID: number;
  categoryName: string;
  userId?: number;
}

interface IModuleTable {
  id: number;
  moduleName: string;
  moduleCode?: string;
  status: string;
  topic: {
    topicName: string;
  };
  topicID: number;
  sessions: {
    category: {
      categoryName: string;
    };
    authorization: string;
    authorID: string;
  }[];
  userId?: number;
}

enum Status {
  COMPLETE = 'Complete',
  INCOMPLETE = 'Incomplete',
}

export const optionsOrder = [
  { label: 'Module Name (A-Z)', value: 'ASC' },
  { label: 'Module Name (Z-A)', value: 'DESC' },
  { label: 'Status (Completed)', value: 'Complete' },
  { label: 'Status (Incomplete)', value: 'Incomplete' },
];

const CommunityLibraryModule = () => {
  const history = useNavigate();
  const timeout: any = useRef(null);
  const location = useLocation();
  const { topicId: topicIdParam } = useParams();
  const [form] = Form.useForm();
  const [formEditModule] = Form.useForm();
  const [listModule, setListModule] = useState<IModuleInfo[]>([]);
  const [searchResult, setSearchResult] = useState<{ id: number; moduleName: string }[]>([]);
  const [selection, setSelection] = useState<React.Key[]>([]);
  const [limit, setLimit] = useState('5');
  const [messageConfirmDelete, setMessageConfirmDelete] = useState<string | null>('');
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({
    topicType: TopicType.COMMUNITY_LIBRARY,
  });
  const [messageWarning, setMessageWarning] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState<string>('ASC');
  const [sort] = useState<string>('moduleName');
  const [isModalDeleteModule, setIsModalDeleteModule] = useState(false);
  const [isModalDuplicateModule, setIsModalDuplicateModule] = useState(false);
  const [isModalEditModule, setIsModalEditModule] = useState(false);
  const [idForActionModule, setIdForActionModule] = useState<number | undefined>();
  const [status, setStatus] = useState('');
  const [topicNameEdit, setTopicNameEdit] = useState<string>('');
  const [messageDuplicateModuleSuccess, setMessageDuplicateModuleSuccess] = useState<string>('');
  const [topicIdSearch, setTopicIdSearch] = useState<number | undefined>();
  const [topicNameDuplicate, setTopicNameDuplicate] = useState<string>('');
  const [state]: any = useContext(AppContext);

  const [categoriesOptions, setCategoriesOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [topicOptions, setTopicOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });
  const [topicTitleName, setTopicTitleName] = useState<string>('');

  const { mutate: mutateGetTopicById } = useMutation('getTopicById', getTopicById, {
    onSuccess: ({ data }) => {
      setTopicTitleName(data.topicName);
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

  const { mutate: mutateGetTopics } = useMutation('getListTopics', getListTopics, {
    onSuccess: ({ data }: { data: { records: ITopic[] } }) => {
      const newOptions = data.records
        .map((el) => {
          return { label: el.topicName.toString(), value: el.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.topic, value: '', isDisabled: true }]);
      setTopicOptions(newOptions);
    },
  });

  const { mutate: searchListModules } = useMutation('searchModules', searchModules, {
    onSuccess: ({
      data: dataModules,
    }: {
      data: {
        listModules: IModuleTable[];
      };
    }) => {
      const newData = dataModules.listModules.map((item) => {
        const codeMudule =
          item?.moduleCode && item?.moduleCode !== '' ? `(${item?.moduleCode})` : '';
        return {
          id: Number(item.id),
          moduleName: item.moduleName + ' ' + codeMudule,
        };
      });
      setSearchResult(newData);
    },
  });

  const { mutate: getListModules, isLoading } = useMutation('searchModules', searchModules, {
    onSuccess: ({
      data: dataModules,
    }: {
      data: { listModules: IModuleTable[]; total: number; page: 1 };
    }) => {
      if (dataModules?.listModules?.length > 0) {
        const newData = dataModules.listModules.map((item) => {
          return {
            id: item.id,
            key: item.id.toString(),
            moduleName: item.moduleName,
            moduleCode: item?.moduleCode,
            topicName: item.topic.topicName,
            status: item.status,
            topicID: item.topicID,
            categoryName: item.sessions
              ?.filter(
                (session) =>
                  session.category &&
                  (session.authorID === state?.user?.id || session.authorization === 'Public'),
              )
              .map((session) => session.category.categoryName)
              .join(', '),
            userId: item.userId,
          };
        });
        setListModule(newData);
        setPagination({
          ...pagination,
          current: dataModules.page,
          pageSize: Number(limit),
          total: dataModules?.total,
        });
        return;
      }
      setListModule([]);
    },
  });

  const renderOrder = useCallback(() => {
    switch (order) {
      case 'ASC':
        return 'ASC';
      case 'DESC':
        return 'DESC';
      default:
        return '';
    }
  }, [order]);

  const renderSort = useCallback(() => {
    switch (order) {
      case 'ASC':
        return sort;
      case 'DESC':
        return sort;

      default:
        return '';
    }
  }, [sort, order]);

  const handleGetListModule = useCallback(
    (page?: number) => {
      getListModules({
        page: page ? page : Number(pagination.current),
        limit: Number(limit),
        search: searchValue,
        order: renderOrder(),
        sort: renderSort(),
        filters: JSON.stringify([
          Object.fromEntries(
            Object.entries({
              ...filters,
              status: status,
              topicID: topicIdParam ? topicIdParam : topicIdSearch,
            }).filter(([, v]) => v?.toString() !== ''),
          ),
        ]),
      });
    },
    [pagination, limit, searchValue, renderOrder, renderSort, filters, topicIdParam],
  );

  const { mutate: onDeleteModule } = useMutation('deleteModule', deleteModule, {
    onSuccess: () => {
      setIsModalDeleteModule(false);
      if (listModule?.length === 1 && Number(pagination.current) > 1) {
        setPagination({ ...pagination, current: Number(pagination.current) - 1 });
        return;
      }
      handleGetListModule();
    },
    onError: ({ response }: { response: { data: { message: string }; status: number } }) => {
      if (response.status == 403) {
        setMessageWarning('You are not allowed to delete module.');
      } else {
        setMessageWarning(response.data.message);
      }
      setIsModalDeleteModule(false);
    },
  });

  const { mutate: onDeleteMultipleModules } = useMutation(
    'deleteMultipleModules',
    deleteMultipleModules,
    {
      onSuccess: () => {
        setPagination({ ...pagination, current: 1 });
        if (pagination.current === 1) {
          handleGetListModule(1);
        }
      },
      onError: ({ response }: { response: { data: { message: string }; status: number } }) => {
        if (response.status == 403) {
          setMessageWarning('You are not allowed to delete modules.');
        } else {
          setMessageWarning(response.data.message);
        }
        setIsModalConfirm(false);
      },
    },
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

  const handleSearchTopics = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        mutateGetTopics({ ...PARAMS_SELECT_SEARCH.community_topic, search: value });
      }, 500);
    },
    [timeout],
  );

  const optionsFilter = useMemo(() => {
    return [
      {
        name: 'categories',
        className: 'w-[calc(42.5%_-_0.7rem)]  xl:w-[calc(50%_-_0.5rem)] check',
        placeholder: 'All Categories',
        type: 'select-search',
        options: categoriesOptions,
        handleSearch: handleSearchCategories,
      },
      {
        name: 'topics',
        className: 'w-[calc(42.5%_-_0.7rem)]  xl:w-[calc(50%_-_0.5rem)] check',
        placeholder: 'All Topics',
        type: `select-search`,
        options: topicOptions,
        valueDefaultSelectSearch: {
          default: topicIdParam ? true : false,
          fieldsValue: { label: topicTitleName, value: String(topicIdParam) },
        },
        disabled: topicIdParam ? true : false,
        handleSearch: handleSearchTopics,
      },
    ];
  }, [categoriesOptions, topicOptions, topicIdParam, topicTitleName]);

  const redirectListSession = (moduleID: number, topicID: number) => {
    if (location.pathname.includes('topic') && location.pathname.includes('module')) {
      history(`${ROUTES.community_library_topic}/${topicID}/module/${moduleID}/session/teacher`);
    } else {
      history(`${ROUTES.community_library_module}/${moduleID}/session/teacher`);
    }
  };

  const modalConfirmDeleteModule = useCallback(() => {
    return (
      isModalDeleteModule && (
        <ModalCustom
          visible={isModalDeleteModule}
          onCancel={() => {
            setIsModalDeleteModule(false);
          }}
          cancelText="Cancel"
          okText="Confirm"
          title="Delete"
          onSubmit={() => {
            onDeleteModule({ id: Number(idForActionModule) });
          }}
          titleCenter
        >
          <div>Are you sure you want to delete this module? This action cannot be undone.</div>
        </ModalCustom>
      )
    );
  }, [isModalDeleteModule]);

  const [isKeepOpenEditModule, setIsKeepOpenEditModule] = useState<boolean>(true);

  const { mutate: mutateEditModule } = useMutation('updateModule', updateModule, {
    onSuccess: () => {
      setIsKeepOpenEditModule(false);
      setIsModalEditModule(false);
      handleGetListModule();
      formEditModule.resetFields();
    },
    onError: ({ response }) => {
      setIsKeepOpenEditModule(true);
      if (response.status == 403) {
        notification.error({ message: 'You are not allowed to edit module.' });
      } else {
        formEditModule.setFields([
          {
            name: 'moduleNameEdit',
            errors: [response.data.message],
          },
        ]);
      }
    },
  });

  const onFinishEditModule = ({ moduleNameEdit }: { moduleNameEdit: string }) => {
    mutateEditModule({ id: Number(idForActionModule), moduleName: moduleNameEdit });
  };

  const modalEditModule = useCallback(() => {
    return (
      isModalEditModule && (
        <ModalCustom
          visible={isModalEditModule}
          onCancel={() => {
            setIsModalEditModule(false);
            formEditModule.resetFields();
          }}
          isKeepOpen={isKeepOpenEditModule}
          cancelText="Cancel"
          okText="Confirm"
          title="Edit Module"
          onSubmit={() => {
            formEditModule
              .validateFields()
              .then((values) => {
                onFinishEditModule(values);
              })
              .catch(() => {});
          }}
        >
          <Form layout="vertical" form={formEditModule} onFinish={onFinishEditModule}>
            <Form.Item
              label="Module Name:"
              name="moduleNameEdit"
              rules={[{ required: true, message: 'Module name is required!' }]}
            >
              <CustomInput />
            </Form.Item>
            <Form.Item label="Topic Name:" name="topicNameEdit" className="mb-0">
              <SelectCustom
                disabled
                options={[]}
                value={topicNameEdit}
                defaultValue={topicNameEdit}
              />
            </Form.Item>
          </Form>
        </ModalCustom>
      )
    );
  }, [isModalEditModule]);

  const [formCreateModule] = Form.useForm();
  const [isModalCreateModule, setIsModalCreateModule] = useState<boolean>(false);
  const [isKeepOpenCreateModule, setIsKeepOpenCreateModule] = useState<boolean>(false);

  const { mutate: mutateCreateNewModule } = useMutation('createNewModule', createNewModule, {
    onSuccess: () => {
      setIsKeepOpenCreateModule(false);
      setIsModalCreateModule(false);
      handleGetListModule();
      formCreateModule.resetFields();
    },
    onError: ({ response }) => {
      setIsKeepOpenCreateModule(true);
      if (response.status == 403) {
        notification.error({ message: 'You are not allowed to create module.' });
      } else {
        formCreateModule.setFields([
          {
            name: 'moduleNameCreate',
            errors: [response.data.message],
          },
        ]);
      }
    },
  });

  const onFinishCreateModule = ({
    moduleNameCreate,
    topicNameCreate,
  }: {
    moduleNameCreate: string;
    topicNameCreate: { label: string; value: string };
  }) => {
    mutateCreateNewModule({ topicID: Number(topicNameCreate.value), moduleName: moduleNameCreate });
  };

  const modalCreateModule = useCallback(() => {
    return (
      isModalCreateModule && (
        <ModalCustom
          visible={isModalCreateModule}
          onCancel={() => {
            setIsModalCreateModule(false);
            formCreateModule.resetFields();
          }}
          isKeepOpen={isKeepOpenCreateModule}
          cancelText="Cancel"
          okText="Confirm"
          title="Create New Module"
          onSubmit={() => {
            formCreateModule
              .validateFields()
              .then((values) => {
                onFinishCreateModule(values);
              })
              .catch(() => {});
          }}
        >
          <Form layout="vertical" form={formCreateModule} onFinish={onFinishEditModule}>
            <Form.Item
              label="Module Name:"
              name="moduleNameCreate"
              rules={[{ required: true, message: 'Module name is required!' }]}
            >
              <CustomInput />
            </Form.Item>
            <Form.Item
              label="Topic Name:"
              name="topicNameCreate"
              className="mb-0"
              rules={[{ required: true, message: 'Topic name is required!' }]}
            >
              <SelectSearch
                disable={topicIdParam ? true : false}
                handleSearchOptions={handleSearchTopics}
                options={topicOptions}
              />
            </Form.Item>
          </Form>
        </ModalCustom>
      )
    );
  }, [isModalCreateModule, topicOptions, topicIdParam]);

  const [formDuplicateModule] = Form.useForm();
  const [isKeepOpenDuplicateModule, setIsKeepOpenDuplicateModule] = useState<boolean>(false);

  const { mutate: mutateDuplicateModule } = useMutation('duplicateNewModule', duplicateNewModule, {
    onSuccess: ({ data }) => {
      setIsKeepOpenDuplicateModule(false);
      setIsModalDuplicateModule(false);
      handleGetListModule();
      formDuplicateModule.resetFields();
      setMessageDuplicateModuleSuccess(
        `${data.moduleName} from ${topicNameDuplicate} has been successfully duplicated to ${data.topic.topicName}`,
      );
    },
    onError: ({ response }) => {
      setIsKeepOpenDuplicateModule(true);
      if (response.status == 403) {
        notification.error({ message: 'You are not allowed to create module.' });
      } else {
        formDuplicateModule.setFields([
          {
            name: 'topicNameTo',
            errors: [response.data.message],
          },
        ]);
      }
    },
  });

  const onFinishDuplicateModule = ({
    topicNameTo,
  }: {
    topicNameTo: { label: string; value: string };
  }) => {
    mutateDuplicateModule({
      topicID: Number(topicNameTo.value),
      moduleID: Number(idForActionModule),
    });
  };

  const modalDuplicateModule = useCallback(() => {
    return (
      isModalDuplicateModule && (
        <ModalCustom
          visible={isModalDuplicateModule}
          isKeepOpen={isKeepOpenDuplicateModule}
          onCancel={() => {
            setIsModalDuplicateModule(false);
            formDuplicateModule.resetFields();
          }}
          cancelText="Cancel"
          okText="Confirm"
          title="Duplicate Module to"
          onSubmit={() => {
            formDuplicateModule
              .validateFields()
              .then((values) => {
                onFinishDuplicateModule(values);
              })
              .catch(() => {});
          }}
        >
          <Form layout="vertical" form={formDuplicateModule}>
            <Form.Item
              label="Topic Name:"
              name="topicNameTo"
              className="mb-0"
              rules={[{ required: true, message: 'Topic name is required!' }]}
            >
              <SelectSearch handleSearchOptions={handleSearchTopics} options={topicOptions} />
            </Form.Item>
          </Form>
        </ModalCustom>
      )
    );
  }, [isModalDuplicateModule, topicOptions]);

  const columns = [
    {
      title: 'Module',
      dataIndex: 'moduleName',
      fixed: true,
      render: (text: string, record: IModuleInfo) => {
        return (
          <div>
            <CustomTooltip title={record.moduleName}>
              <div className="custom-text-ellipsis">{record.moduleName}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Module Code',
      dataIndex: 'moduleCode',
      fixed: true,
      render: (text: string, record: IModuleInfo) => {
        return (
          <div>
            <CustomTooltip title={record?.moduleCode}>
              <div className="custom-text-ellipsis">{record?.moduleCode}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      fixed: true,
      render: (text: string, record: IModuleInfo) => {
        return (
          <div>
            <CustomTooltip title={record.categoryName}>
              <div className="custom-text-ellipsis">{record.categoryName}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Topic',
      dataIndex: 'topicName',
      fixed: true,
      render: (text: string, record: IModuleInfo) => {
        return (
          <div>
            <CustomTooltip title={record.topicName}>
              <div className="custom-text-ellipsis">{record.topicName}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text: string, record: IModuleInfo) => {
        return (
          <div
            className={`${
              record.status === Status.COMPLETE
                ? 'bg-[#E6F2F2] text-[#006262]'
                : 'bg-[#FCECD9] text-[#BE5E2A]'
            } px-[5px] py-[4px] rounded-2xl text-xs uppercase text-center w-[100px]`}
          >
            {record.status}
          </div>
        );
      },
      fixed: true,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      fixed: true,
      width: 100,
      render: (text: string, record: IModuleInfo) => {
        return (
          <div className="flex">
            {(record?.userId === null ||
              (record?.userId !== null && record?.userId === state?.user?.id)) && (
              <>
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalEditModule(true);
                    setIsKeepOpenEditModule(true);
                    setTopicNameEdit(record.topicName);
                    setIdForActionModule(Number(record.id));
                    formEditModule.setFieldsValue({ moduleNameEdit: record.moduleName });
                  }}
                >
                  <CustomTooltip title="Edit">
                    <EditSVG className="icon-hover" />
                  </CustomTooltip>
                </div>
                <div
                  className="cursor-pointer ml-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdForActionModule(Number(record.id));
                    setIsModalDeleteModule(true);
                  }}
                >
                  <CustomTooltip title="Delete">
                    <TrashSVG className="icon-hover" />
                  </CustomTooltip>
                </div>
              </>
            )}
            <div
              className="cursor-pointer ml-5"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalDuplicateModule(true);
                setIsKeepOpenDuplicateModule(true);
                setIdForActionModule(Number(record.id));
                setTopicNameDuplicate(record.topicName);
              }}
            >
              <CustomTooltip title="Duplicate">
                <DuplicateSVG className="icon-hover" />
              </CustomTooltip>
            </div>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getCategories(PARAMS_SELECT_SEARCH.category);
    mutateGetTopics(PARAMS_SELECT_SEARCH.community_topic);
  }, []);

  useEffect(() => {
    getListModules({
      page: Number(pagination.current),
      limit: Number(limit),
      search: searchValue,
      order: renderOrder(),
      sort: renderSort(),
      filters: JSON.stringify([
        Object.fromEntries(
          Object.entries({
            ...filters,
            status: status,
            topicID: topicIdParam ? Number(topicIdParam) : topicIdSearch,
          }).filter(([, v]) => v?.toString() !== ''),
        ),
      ]),
    });
  }, [pagination.current, limit, order, sort, searchValue, filters, status, topicIdParam]);

  const handleTableChange = () => {
    setPagination({ ...pagination, current: 2 });
  };
  const onFinish = useCallback(
    (values: IFields) => {
      setPagination({ ...pagination, pageSize: Number(limit), current: 1 });
      setSearchValue(values.search);
      setTopicIdSearch(Number(values?.topics?.value));
      setFilters({
        ...filters,
        categoryID: values?.categories?.value ? Number(values?.categories?.value) : '',
        topicID: values?.topics?.value,
      });
    },
    [limit, pagination, order],
  );

  const onChangeSelect = (selectedRowKeys: React.Key[]) => {
    setSelection(selectedRowKeys.map((item) => Number(item)));
  };

  const handleDisableSelect = (record: any) => ({
    disabled: record?.userId !== null && record?.userId !== state?.user?.id,
  });

  const debounceSearch = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchListModules({
          page: 1,
          limit: 10,
          search: value,
          order: 'DESC',
          filters: topicIdParam
            ? JSON.stringify([
                {
                  topicID: Number(topicIdParam) | Number(topicIdSearch),
                  topicType: TopicType.COMMUNITY_LIBRARY,
                },
              ])
            : JSON.stringify([{ topicType: TopicType.COMMUNITY_LIBRARY }]),
        });
      }, 500);
    },
    [limit, pagination.current, timeout, topicIdParam],
  );

  const handleChangeSearch = useCallback(
    (value: string) => {
      debounceSearch(value);
    },
    [topicIdParam],
  );

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
      if (value !== Status.COMPLETE && value !== Status.INCOMPLETE) {
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
        setIsModalConfirm(true);
        setMessageConfirmDelete(
          `Are you sure you want to delete the selected ${
            selection?.length > 1 ? 'modules' : 'module'
          }? This action cannot be undone.`,
        );
      }
    },
    [selection],
  );

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination]);

  const handleDeleteSelection = () => {
    onDeleteMultipleModules({ moduleIDs: Array.isArray(selection) ? selection : [] });
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

  const renderModalDuplicateSuccess = useCallback(() => {
    return (
      messageDuplicateModuleSuccess && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setMessageDuplicateModuleSuccess('');
          }}
          title="Duplicate Module"
          titleCenter
          content={messageDuplicateModuleSuccess}
        />
      )
    );
  }, [messageDuplicateModuleSuccess]);

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
    setSearchValue('');
    setStatus('');
    setFilters({ topicType: TopicType.COMMUNITY_LIBRARY });
    setTopicIdSearch(undefined);
  }, [limit, optionsOrder]);

  useEffect(() => {
    if (topicIdParam) {
      mutateGetTopicById({ id: Number(topicIdParam) });
    } else {
      //reset filter when inside module tab
      form.resetFields();
      setFilters({ topicType: TopicType.COMMUNITY_LIBRARY });
    }
  }, [topicIdParam]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <div className="flex justify-between items-center bg-transparent px-0 ">
        {location.pathname.includes('topic') && location.pathname.includes('module') ? (
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
                history(`${ROUTES.community_library_topic}/teacher`);
              }}
            >
              Community Library - Topic
            </Breadcrumb.Item>
            <Breadcrumb.Item>{topicTitleName}</Breadcrumb.Item>
          </Breadcrumb>
        ) : (
          <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
            Community Library - Module
          </p>
        )}

        <ButtonCustom
          color="orange"
          onClick={() => {
            setIsKeepOpenCreateModule(true);
            setIsModalCreateModule(true);
            if (topicIdParam) {
              formCreateModule.setFieldsValue({
                topicNameCreate: {
                  label: String(topicTitleName),
                  value: String(topicIdParam),
                },
              });
            }
          }}
        >
          New Module
        </ButtonCustom>
      </div>

      <FilterCard
        handleChangeSearch={handleChangeSearch}
        onFinish={onFinish}
        form={form}
        fields={optionsFilter}
        handleReset={handleReset}
        searchResults={searchResult}
        keyResult="moduleName"
        pathSearchDetail={
          location.pathname.includes('topic') && location.pathname.includes('module')
            ? `${ROUTES.community_library_topic}/${topicIdParam}/module`
            : ROUTES.community_library_module
        }
        pathEndPointSearchDetail="/session/teacher"
      />

      <TableCustom
        getCheckboxProps={handleDisableSelect}
        columns={columns}
        data={listModule}
        isLoading={isLoading}
        pagination={pagination}
        handleTableChange={handleTableChange}
        onChangeSelect={onChangeSelect}
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        onRow={(record) => ({
          onClick: () => {
            redirectListSession(record?.id as number, record.topicID as number);
          },
        })}
        searchNotFound={
          listModule?.length > 0 ? undefined : (
            <SearchNotFound isBackgroundWhite text={searchValue} />
          )
        }
        onLastPage={() => {
          setPagination({
            ...pagination,
            current: pageSize,
          });
        }}
        onFirstPage={() => {
          setPagination({ ...pagination, current: 1 });
        }}
        viewItem={{
          onChange: onChangeLimit,
          value: String(limit),
        }}
        filters={{
          show: true,
          options: optionsOrder,
          onChange: onFilter,
          value: order,
          minWidth: 'min-w-[270px]',
        }}
        action={{
          show: selection.length > 0 ? true : false,
          onSelect: onChangeAction,
          options: [{ value: 'selection', label: 'Delete' }],
        }}
      />

      {renderModalWarning()}
      {modalConfirmDeleteModule()}
      {renderModalConfirm()}
      {modalDuplicateModule()}
      {modalEditModule()}
      {modalCreateModule()}
      {renderModalDuplicateSuccess()}
    </Layout>
  );
};

export default CommunityLibraryModule;
