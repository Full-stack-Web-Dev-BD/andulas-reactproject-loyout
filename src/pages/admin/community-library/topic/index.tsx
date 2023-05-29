import { Form, Layout, TablePaginationConfig } from 'antd';
import { getCourseProgramType, getListCategories } from 'api/courses';
import { deleteMultipleTopics, deleteTopic, searchTopics } from 'api/topic';
import { getFileUrl } from 'api/user';
import TopicDefault from 'assets/images/topic-default.jpg';
import ModalCustom from 'components/Modal';
import CardResult from 'components/SearchBar/CardResult';
import FilterCard from 'components/SearchBar/FilterCard';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import { ORDER, PARAMS_SELECT_SEARCH, TEXT_SELECT_SEARCH, TopicType } from 'constants/constants';
import { ICategory, ROUTES } from 'constants/index';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

interface IFields {
  search: string;
  categories: { label: string; value: string };
  programType: { label: string; value: string };
}
export interface ICardItem {
  id: number;
  title: string;
  thumbnail?: string;
  thumbnailPath?: string;
  quantity: number;
}

export const optionsOrder = [
  { label: 'Topic Name (A-Z)', value: 'ASC' },
  { label: 'Topic Name (Z-A)', value: 'DESC' },
  { label: 'Module quantity (Ascending)', value: 'Q-ASC' },
  { label: 'Module quantity (Descending)', value: 'Q-DESC' },
];

interface ITopic {
  id: number;
  moduleQuantity: number;
  thumbnailPath: string;
  topicName: string;
  updatedAt: string;
}

enum SORT {
  TOPIC = 'topicName',
  QUANTITY = 'moduleQuantity ',
}

const CommunityLibraryTopic = () => {
  const history = useNavigate();
  const timeout: any = useRef(null);
  const [form] = Form.useForm();
  const [formCreateNewTopic] = Form.useForm();
  const [listTopics, setListTopics] = useState<ICardItem[]>([]);
  const [listTopicsBackUp, setListTopicsBackUp] = useState<ICardItem[]>([]);
  const [searchResult, setSearchResult] = useState<{ id: number; topicName: string }[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<React.Key[]>([]);
  const [limit, setLimit] = useState('9');
  const [messageConfirmDelete, setMessageConfirmDelete] = useState<string | null>('');
  const [isOpenModalConfirmDelete, setIsOpenModalConfirmDelete] = useState(false);
  const [filters, setFilters] = useState({});
  const [messageWarning, setMessageWarning] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState<string>(ORDER.ASC);
  const [sort] = useState<string>(SORT.TOPIC);
  const [isOpenModalDeleteTopic, setIsOpenModalDeleteTopic] = useState(false);
  const [topicId, setTopicId] = useState<number | string>('');
  const [topic, setTopic] = useState<ICardItem | string>('');
  const [status, setStatus] = useState('');
  const [isClearSelected, setIsClearSelected] = useState(false);
  const [isOpenModalCreateNewTopic, setIsOpenModalCreateNewTopic] = useState(false);
  const [isKeepOpen, setIsKeepOpen] = useState(true);
  const [categoriesOptions, setCategoriesOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [programTypeOptions, setProgramTypeOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 9,
  });

  const { mutate: getCourseProgramTypes } = useMutation(
    'getCourseProgramType',
    getCourseProgramType,
    {
      onSuccess: ({ data }) => {
        const newOptions = data.map((el: string) => {
          return { label: el, value: el };
        });

        setProgramTypeOptions(newOptions);
      },
    },
  );

  const { mutate: searchListTopics } = useMutation('searchTopics', searchTopics, {
    onSuccess: ({
      data: teachersData,
    }: {
      data: {
        records: ITopic[];
      };
    }) => {
      const newData = teachersData.records.map((item) => {
        return {
          id: item.id,
          topicName: item.topicName,
        };
      });
      setSearchResult(newData);
    },
  });

  const { mutate: getTopics, isLoading } = useMutation('getTopics', searchTopics, {
    onSuccess: async ({
      data: topics,
    }: {
      data: { records: ITopic[]; total: number; page: number; limit: number };
    }) => {
      if (topics?.records?.length > 0) {
        setSelectedTopics([]);
        const topicsData = await Promise.all(
          topics.records.map(async (item: ITopic) => {
            if (item?.thumbnailPath) {
              const { data: thumbnail } =
                item?.thumbnailPath && (await getFileUrl(item?.thumbnailPath));
              return {
                id: Number(item.id),
                key: item.id.toString(),
                title: item.topicName,
                thumbnail: item?.thumbnailPath ? thumbnail?.fileUrl : '',
                quantity: item?.moduleQuantity,
              };
            }
            return {
              id: Number(item.id),
              key: item.id.toString(),
              title: item.topicName,
              thumbnail: TopicDefault,
              quantity: item?.moduleQuantity,
            };
          }),
        );
        const topicsDataBackUp = topics.records.map((item: ITopic) => {
          return {
            id: Number(item.id),
            key: item.id.toString(),
            title: item.topicName,
            thumbnailPath: item?.thumbnailPath ? item?.thumbnailPath : '',
            quantity: item?.moduleQuantity,
          };
        });
        setListTopics(topicsData);
        setListTopicsBackUp(topicsDataBackUp);
        setPagination({
          ...pagination,
          current: topics.page,
          pageSize: Number(topics.limit),
          total: topics?.total || 0,
        });
        return;
      }
      setListTopics([]);
      setListTopicsBackUp([]);
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

  const renderOrder = useCallback(() => {
    switch (order) {
      case ORDER.ASC:
        return ORDER.ASC;
      case ORDER.DESC:
        return ORDER.DESC;
      case ORDER.QUANTITY_DESC:
        return ORDER.DESC;
      case ORDER.QUANTITY_ASC:
        return ORDER.ASC;
      default:
        return '';
    }
  }, [order]);

  const renderSort = useCallback(() => {
    switch (order) {
      case ORDER.ASC:
        return SORT.TOPIC;
      case ORDER.DESC:
        return SORT.TOPIC;
      case ORDER.QUANTITY_DESC:
        return SORT.QUANTITY;
      case ORDER.QUANTITY_ASC:
        return SORT.QUANTITY;
      default:
        return '';
    }
  }, [order, SORT]);

  const handleGetListTopics = useCallback(
    (page?: number) => {
      getTopics({
        limit: Number(limit),
        page: page ? page : Number(pagination.current),
        search: searchValue,
        order: renderOrder(),
        sort: renderSort(),
        filters: JSON.stringify([
          Object.fromEntries(
            Object.entries({ ...filters, topicType: TopicType.COMMUNITY_LIBRARY }).filter(
              ([, v]) => (v as string)?.toString() !== '',
            ),
          ),
        ]),
      });
    },
    [limit, pagination.current, searchValue, renderOrder, renderSort, filters],
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

  const optionsFilter = useMemo(() => {
    return [
      {
        name: 'categories',
        className: 'basis-[38.6%] cus__width__topic',
        placeholder: 'All Categories',
        type: 'select-search',
        options: categoriesOptions,
        handleSearch: handleSearchCategories,
      },
      {
        name: 'programType',
        className: 'basis-[38.6%] cus__width__topic',
        placeholder: 'All Program Types',
        type: 'select',
        options: programTypeOptions,
      },
    ];
  }, [categoriesOptions, programTypeOptions]);

  useEffect(() => {
    getCategories(PARAMS_SELECT_SEARCH.category);
    getCourseProgramTypes();
  }, []);

  const redirectEditStudent = (id: number, studentName: string) => {
    history(`${ROUTES.student_detail}/${id}`, {
      state: { teacherName: studentName },
    });
  };

  const { mutate: mutateDeleteTopic } = useMutation('deleteTopic', deleteTopic, {
    onSuccess: () => {
      setIsOpenModalDeleteTopic(false);
      if (listTopics?.length === 1 && Number(pagination.current) > 1) {
        setPagination({ ...pagination, current: Number(pagination.current) - 1 });
        return;
      }
      handleGetListTopics();
    },
    onError: ({ response }: { response: { data: { message: string } } }) => {
      setIsOpenModalDeleteTopic(false);
      setMessageWarning(response.data.message);
    },
  });

  const { mutate: mutateDeleteMultipleTopics } = useMutation(
    'deleteMultipleTopics',
    deleteMultipleTopics,
    {
      onSuccess: () => {
        setPagination({ ...pagination, current: 1 });
        if (pagination.current === 1) {
          handleGetListTopics(1);
        }
      },
      onError: ({ response }) => {
        setMessageWarning(response.data.message);
      },
    },
  );

  const modalConfirmDeleteStudent = useCallback(() => {
    return (
      isOpenModalDeleteTopic && (
        <ModalCustom
          visible={isOpenModalDeleteTopic}
          onCancel={() => {
            setIsOpenModalDeleteTopic(false);
            setTopicId('');
          }}
          cancelText="Cancel"
          okText="Confirm"
          title="Delete"
          onSubmit={() => {
            mutateDeleteTopic({ id: Number(topicId) });
          }}
          titleCenter
        >
          <div>Are you sure you want to delete this topic? This action cannot be undone.</div>
        </ModalCustom>
      )
    );
  }, [isOpenModalDeleteTopic, topicId]);

  const onFinish = useCallback(
    (values: IFields) => {
      setPagination({ ...pagination, pageSize: Number(limit), current: 1 });
      setSearchValue(values.search);
      setFilters({
        categoryID: values?.categories?.value ? Number(values?.categories?.value) : '',
        programType: values?.programType ? values?.programType : '',
      });
    },
    [limit, pagination, order],
  );

  const onChangeSelect = useCallback(
    (id: number) => {
      if (selectedTopics?.includes(id)) {
        const newSelectedItems = selectedTopics.filter((item) => item !== id);
        setSelectedTopics(newSelectedItems);
        return;
      }
      setSelectedTopics([...selectedTopics, id]);
    },
    [selectedTopics],
  );

  const onSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const newSelectedItems = listTopics.map((item) => item.id);
        setSelectedTopics(newSelectedItems);
        return;
      }
      setSelectedTopics([]);
    },
    [listTopics],
  );

  const debounceSearch = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchListTopics({
          ...PARAMS_SELECT_SEARCH.teacher,
          order: 'DESC',
          search: value,
          filters: JSON.stringify([{ topicType: TopicType.COMMUNITY_LIBRARY }]),
        });
      }, 500);
    },
    [limit, pagination.current, timeout],
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
    },
    [pagination],
  );

  const onChangeAction = useCallback(
    (value: string) => {
      if (value === 'selection') {
        setIsOpenModalConfirmDelete(true);
        setMessageConfirmDelete(
          `Are you sure you want to delete the selected ${
            selectedTopics?.length > 1 ? 'topics' : 'topic'
          }? This action cannot be undone.`,
        );
      }
    },
    [selectedTopics],
  );

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination]);

  const handleDeleteSelection = () => {
    mutateDeleteMultipleTopics({ topicIDs: Array.isArray(selectedTopics) ? selectedTopics : [] });
  };

  const handleOpenConfirmDelete = (id: number) => {
    setMessageConfirmDelete(
      'Are you sure you want to delete this topic? This action cannot be undone.',
    );
    setIsOpenModalDeleteTopic(true);
    setTopicId(id);
  };

  const renderModalConfirmDelete = useCallback(() => {
    return (
      isOpenModalConfirmDelete && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          okText="Confirm"
          onSubmit={handleDeleteSelection}
          onCancel={() => {
            setIsOpenModalConfirmDelete(false);
          }}
          title="Delete"
          titleCenter
          content={messageConfirmDelete}
        />
      )
    );
  }, [isOpenModalConfirmDelete]);

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

  const handleOpenModalEditTopic = useCallback(
    (data: ICardItem) => {
      setTopic({
        ...data,
        thumbnailPath: listTopicsBackUp.find((item) => item.id === data.id)?.thumbnailPath,
      });
      setIsOpenModalCreateNewTopic(true);
    },
    [listTopicsBackUp],
  );

  const handleReset = useCallback(() => {
    setOrder('ASC');
    setLimit('9');
    setPagination({
      current: 1,
      pageSize: 9,
    });
    setFilters({});
    setSearchValue('');
    setStatus('');
    setIsClearSelected(true);
  }, [limit, optionsOrder]);

  useEffect(() => {
    getTopics({
      limit: Number(limit),
      page: Number(pagination.current),
      search: searchValue,
      order: renderOrder(),
      sort: renderSort(),
      filters: JSON.stringify([
        Object.fromEntries(
          Object.entries({ ...filters, topicType: TopicType.COMMUNITY_LIBRARY }).filter(
            ([, v]) => (v as string)?.toString() !== '',
          ),
        ),
      ]),
    });
  }, [limit, pagination.current, searchValue, sort, order, filters, status]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <div className="flex justify-between items-center bg-transparent px-0">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
          Community Library
        </p>
      </div>

      <FilterCard
        handleChangeSearch={handleChangeSearch}
        onFinish={onFinish}
        form={form}
        fields={optionsFilter}
        handleReset={handleReset}
        searchResults={searchResult}
        pathSearchDetail={`${ROUTES.community_library}/topic`}
        pathEndPointSearchDetail="/module"
        keyResult="topicName"
      />

      <CardResult
        onRedirect={(id) => {
          history(`${ROUTES.community_library}/topic/${id}/module`);
        }}
        setMessageWarning={setMessageWarning}
        isClearSelected={isClearSelected}
        data={listTopics}
        onSelectAll={onSelectAll}
        pagination={pagination}
        onChangeSelect={onChangeSelect}
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        searchNotFound={
          listTopics?.length > 0 ? undefined : (
            <SearchNotFound isBackgroundWhite text={searchValue} />
          )
        }
        isLoading={isLoading}
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
          show: false,
        }}
      />

      {renderModalWarning()}
      {modalConfirmDeleteStudent()}
      {renderModalConfirmDelete()}
    </Layout>
  );
};

export default CommunityLibraryTopic;
