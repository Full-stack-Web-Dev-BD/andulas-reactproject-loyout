import { Breadcrumb, Form, Layout, TablePaginationConfig } from 'antd';
import { getListCategories } from 'api/courses';
import { duplicateNewModule, getListTopics, searchModules } from 'api/hq_library';
import { getTopicById, searchTopics } from 'api/topic';
import { ReactComponent as DuplicateSVG } from 'assets/icons/duplicate.svg';
import ModalCustom from 'components/Modal';
import FilterCard from 'components/SearchBar/FilterCard';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom from 'components/SearchBar/Table';
import SelectSearch from 'components/SelectSearch';
import CustomTooltip from 'components/Tooltip';
import { PARAMS_SELECT_SEARCH, TEXT_SELECT_SEARCH, TopicType } from 'constants/constants';
import { ICategory, ITopic, ROUTES } from 'constants/index';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

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
  category: string;
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
  }[];
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

const HQLibraryModuleTeacher = () => {
  const history = useNavigate();
  const timeout: any = useRef(null);
  const { topicId: topicIdParam } = useParams();
  const [form] = Form.useForm();
  const [listModule, setListModule] = useState<IModuleInfo[]>([]);
  const [searchResult, setSearchResult] = useState<{ id: number; moduleName: string }[]>([]);
  const [selection, setSelection] = useState<React.Key[]>([]);
  const [limit, setLimit] = useState('5');
  const [filters, setFilters] = useState({});
  const [messageWarning, setMessageWarning] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState<string>('ASC');
  const [sort] = useState<string>('moduleName');
  const [isModalDuplicateModule, setIsModalDuplicateModule] = useState(false);
  const [idForActionModule, setIdForActionModule] = useState<number | undefined>();
  const [status, setStatus] = useState('');
  const [categoriesOptions, setCategoriesOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [topicOptions, setTopicOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [ownerTopics, setOwnerTopic] = useState<
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
            category: item.sessions
              ?.filter((session) => session.category && session.authorization === 'Public')
              .map((session) => session.category.categoryName)
              .join(', '),
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

  const { mutate: getTopics } = useMutation('getTopics', searchTopics, {
    onSuccess: async ({
      data: topics,
    }: {
      data: { records: ITopic[]; total: number; page: number; limit: number };
    }) => {
      const newOptions = topics.records
        .map((el) => {
          return { label: el.topicName.toString(), value: el.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.topic, value: '', isDisabled: true }]);
      setOwnerTopic(newOptions);
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
        filters:
          Object.getOwnPropertyNames(filters).length > 0
            ? JSON.stringify([
                Object.fromEntries(
                  Object.entries(
                    status
                      ? { ...filters, status: status, topicType: TopicType.HQ_LIBRARY }
                      : { ...filters, topicType: TopicType.HQ_LIBRARY },
                  ).filter(([, v]) => v?.toString() !== ''),
                ),
              ])
            : status
            ? JSON.stringify([{ status: status, topicType: TopicType.HQ_LIBRARY }])
            : JSON.stringify([{ topicType: TopicType.HQ_LIBRARY }]),
      });
    },
    [pagination, limit, searchValue, renderOrder, renderSort, filters],
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
        mutateGetTopics({ ...PARAMS_SELECT_SEARCH.topic, search: value });
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
    history(`${ROUTES.hq_library}/topic/${topicID}/module/${moduleID}/session/teacher`);
  };

  const [formDuplicateModule] = Form.useForm();
  const [isKeepOpenDuplicateModule, setIsKeepOpenDuplicateModule] = useState<boolean>(false);
  const [messageDuplicateModuleSuccess, setMessageDuplicateModuleSuccess] = useState<string>('');

  const { mutate: mutateDuplicateModule } = useMutation('duplicateNewModule', duplicateNewModule, {
    onSuccess: ({ data }) => {
      setIsKeepOpenDuplicateModule(false);
      setIsModalDuplicateModule(false);
      handleGetListModule();
      formDuplicateModule.resetFields();
      setMessageDuplicateModuleSuccess(
        `${data.moduleName} from ${topicTitleName} has been successfully duplicated to ${data.topic.topicName}`,
      );
    },
    onError: ({ response }) => {
      setIsKeepOpenDuplicateModule(true);
      formDuplicateModule.setFields([
        {
          name: 'topicNameTo',
          errors: [response.data.message],
        },
      ]);
    },
  });

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
              <SelectSearch handleSearchOptions={handleSearchTopics} options={ownerTopics} />
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
      dataIndex: 'category',
      fixed: true,
      render: (text: string, record: IModuleInfo) => {
        return (
          <div>
            <CustomTooltip title={record.category}>
              <div className="custom-text-ellipsis">{record.category}</div>
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
      width: 160,
      render: (text: string, record: IModuleInfo) => {
        return (
          <div
            className="cursor-pointer flex gap-x-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalDuplicateModule(true);
              setIsKeepOpenDuplicateModule(true);
              setIdForActionModule(Number(record.id));
            }}
          >
            <CustomTooltip title="Duplicate">
              <DuplicateSVG className="icon-hover" />
            </CustomTooltip>
            <span className="font-fontFamily text-sm font-semibold">Duplicate</span>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getCategories(PARAMS_SELECT_SEARCH.category);
    mutateGetTopics(PARAMS_SELECT_SEARCH.topic);
    getTopics(PARAMS_SELECT_SEARCH.community_topic);
  }, []);

  useEffect(() => {
    const filter: any = filters;
    if (filter?.topicID) {
      getListModules({
        page: Number(pagination.current),
        limit: Number(limit),
        search: searchValue,
        order: renderOrder(),
        sort: renderSort(),
        filters:
          Object.getOwnPropertyNames(filters).length > 0
            ? JSON.stringify([
                Object.fromEntries(
                  Object.entries(
                    status
                      ? { ...filters, status: status, topicType: TopicType.HQ_LIBRARY }
                      : { ...filters, topicType: TopicType.HQ_LIBRARY },
                  ).filter(([, v]) => v?.toString() !== ''),
                ),
              ])
            : status
            ? JSON.stringify([{ status: status, topicType: TopicType.HQ_LIBRARY }])
            : JSON.stringify([{ topicType: TopicType.HQ_LIBRARY }]),
      });
    }
  }, [pagination.current, limit, order, sort, searchValue, filters, status]);

  const handleTableChange = () => {
    setPagination({ ...pagination, current: 2 });
  };

  const onFinish = useCallback(
    (values: IFields) => {
      setPagination({ ...pagination, pageSize: Number(limit), current: 1 });
      setSearchValue(values.search);
      setFilters({
        categoryID: values?.categories?.value ? Number(values?.categories?.value) : '',
        topicID: values?.topics?.value,
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
        searchListModules({
          page: 1,
          limit: 10,
          search: value,
          order: 'DESC',
          filters: topicIdParam
            ? JSON.stringify([{ topicID: Number(topicIdParam), topicType: TopicType.HQ_LIBRARY }])
            : JSON.stringify([{ topicType: TopicType.HQ_LIBRARY }]),
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
        setIsModalDuplicateModule(true);
      }
    },
    [selection],
  );

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination]);

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
    if (topicIdParam) {
      setFilters({ ...filters, topicID: topicIdParam });
    }
  }, [limit, optionsOrder]);

  useEffect(() => {
    if (topicIdParam) {
      mutateGetTopicById({ id: Number(topicIdParam) });
      setFilters({ ...filters, topicID: topicIdParam });
    }
  }, [topicIdParam]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <div className="flex justify-between items-center bg-transparent px-0">
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
          <Breadcrumb.Item>{topicTitleName}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <FilterCard
        handleChangeSearch={handleChangeSearch}
        onFinish={onFinish}
        form={form}
        fields={optionsFilter}
        handleReset={handleReset}
        searchResults={searchResult}
        keyResult="moduleName"
        pathSearchDetail={`${ROUTES.hq_library}/topic/${topicIdParam}/module`}
        pathEndPointSearchDetail="/session/teacher"
      />

      <TableCustom
        columns={columns}
        data={listModule}
        isLoading={isLoading}
        pagination={pagination}
        handleTableChange={handleTableChange}
        onChangeSelect={onChangeSelect}
        hideColSelection
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
          options: [{ value: 'selection', label: 'Duplicate to' }],
        }}
      />

      {renderModalWarning()}
      {modalDuplicateModule()}
      {renderModalDuplicateSuccess()}
    </Layout>
  );
};

export default HQLibraryModuleTeacher;
