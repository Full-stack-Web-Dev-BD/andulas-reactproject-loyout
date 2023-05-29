import { Form, Layout, TablePaginationConfig, Row, Col } from 'antd';
import { searchCentres, searchCentresOfAdmin } from 'api/centres';
import { deleteClass, deleteMultipleClass, searchClass } from 'api/class';
import { getListCategories, searchCourses } from 'api/courses';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import FilterCard from 'components/SearchBar/FilterCard';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom, { DataType } from 'components/SearchBar/Table';
import CustomTooltip from 'components/Tooltip';
import {
  DATE_FORMAT,
  PARAMS_SELECT_SEARCH,
  ROLE,
  ROUTES,
  TEXT_SELECT_SEARCH,
} from 'constants/constants';
import { ICategory } from 'constants/index';
import { AppContext } from 'context';
import moment from 'moment';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

interface IFields {
  search: string;
  category: { label: string; value: string };
  centres: { label: string; value: string };
  courses: { label: string; value: string };
}

interface IClass {
  id: number;
  capacity: number;
  startDate: string;
  endDate: string;
  courseID: number;
  centreID: number;
  centre: {
    centreAddress: string;
    centreName: string;
    centreNumber: string;
    id: number;
  };
  className: string;
  course: {
    id: number;
    courseCategory: {
      categoryName: string;
    };
    courseName: string;
  };
}

const optionsOrder = [
  { label: 'Class Name (A-Z)', value: 'ASC' },
  { label: 'Class Name (Z-A)', value: 'DESC' },
  // { label: 'Last Updated On (Ascending)', value: 'UPDATED-ASC' },
  // { label: 'Last Updated On (Descending)', value: 'UPDATED-DESC' },
  { label: 'Class year (Ascending)', value: 'CLASSYEAR-ASC' },
  { label: 'Class year (Descending)', value: 'CLASSYEAR-DESC' },
];

const ManageClass = () => {
  const history = useNavigate();
  const timeout: any = useRef(null);
  const [state]: any = useContext(AppContext);
  const isAdmin = state?.user?.centreAdmin;
  const adminId = state?.user?.centreAdmin?.id;
  const [form] = Form.useForm();
  const [listClass, setListClass] = useState<
    Array<{
      id: number;
      courseName: string;
      capacity: number;
      centre: string;
      className: string;
      course: string;
      startDate: string;
      endDate: string;
      category: string;
    }>
  >([]);
  const [selection, setSelection] = useState<React.Key[]>([]);
  const [limit, setLimit] = useState('5');
  const [filters, setFilters] = useState({});
  const [messageWarning, setMessageWarning] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [isSearchingCentre, setIsSearchingCentre] = useState(false);
  const [messageConfirmDelete, setMessageConfirmDelete] = useState<string | null>('');
  const [order, setOrder] = useState<string>('ASC');
  const [sort] = useState<string>('');
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [coursesOptions, setCoursesOptions] = useState<{ label: string; value: string }[]>([]);
  const [centresOptions, setCentresOptions] = useState<{ label: string; value: string }[]>([]);
  const [searchResult, setSearchResult] = useState<{ id: number; className: string }[]>([]);
  const [isModalDeleteClass, setIsModalDeleteClass] = useState(false);
  const [manageClassId, setManageClassId] = useState<number | string>();
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });

  const { mutate: getCategories } = useMutation('getListCategories', getListCategories, {
    onSuccess: ({ data }: { data: { listCategories: ICategory[] } }) => {
      const newOptions = data.listCategories
        .map((el) => {
          return { label: el.categoryName.toString(), value: el.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.category, value: '', isDisabled: true }]);
      setCategories(newOptions);
    },
  });

  const { mutate: searchListClass } = useMutation('searchCourses', searchClass, {
    onSuccess: ({ data: courses }: { data: { listClasses: IClass[] } }) => {
      const newData = courses.listClasses.map((item: IClass) => {
        return {
          id: item.id,
          className: item.className,
        };
      });
      setSearchResult(newData);
    },
  });

  const renderOrder = useCallback(() => {
    switch (order) {
      case 'ASC':
        return 'ASC';
      case 'DESC':
        return 'DESC';
      case 'UPDATED-DESC':
        return 'ASC';
      case 'UPDATED-ASC':
        return 'DESC';
      case 'CLASSYEAR-DESC':
        return 'DESC';
      case 'CLASSYEAR-ASC':
        return 'ASC';

      default:
        break;
    }
  }, [order]);

  const renderSort = useCallback(() => {
    switch (order) {
      case 'ASC':
        return 'className';
      case 'DESC':
        return 'className';
      case 'UPDATED-DESC':
        return 'updatedAt';
      case 'UPDATED-ASC':
        return 'updatedAt';
      case 'CLASSYEAR-DESC':
        return 'classYear';
      case 'CLASSYEAR-ASC':
        return 'classYear';

      default:
        break;
    }
  }, [sort, order]);

  const { mutate: getListClass, isLoading } = useMutation('getClass', searchClass, {
    onSuccess: ({
      data: courses,
    }: {
      data: { listClasses: IClass[]; total: number; page: number; limit: number };
    }) => {
      if (courses.listClasses.length > 0) {
        setSelection([]);
        const newData = courses.listClasses.map((item: IClass) => {
          return {
            id: Number(item.id),
            key: item.id.toString(),
            courseName: item.course.courseName,
            capacity: item.capacity,
            centre: item.centre.centreName,
            className: item.className,
            course: item.course.courseName,
            startDate: moment.utc(item.startDate).local().format(DATE_FORMAT),
            endDate: moment.utc(item.endDate).local().format(DATE_FORMAT),
            category: item.course.courseCategory.categoryName,
          };
        });
        setListClass(newData);
        setPagination({
          ...pagination,
          current: courses.page,
          pageSize: Number(courses.limit),
          total: courses?.total || 0,
        });
        return;
      }
      setListClass([]);
    },
  });

  const { mutate: searchListCentres } = useMutation('searchCentres', searchCentres, {
    onSuccess: ({ data }: { data: { listCentres: Array<{ id: number; centreName: string }> } }) => {
      const newData = data.listCentres
        .map((item) => {
          return {
            value: item.id.toString(),
            label: item.centreName,
            isDisabled: false,
          };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.centre, value: '', isDisabled: true }]);
      setCentresOptions(newData);
    },
  });

  const { mutate: searchListCourses } = useMutation('searchCourses', searchCourses, {
    onSuccess: ({ data }: { data: { listCourses: Array<{ id: number; courseName: string }> } }) => {
      const newData = data.listCourses
        .map((item) => {
          return {
            value: item.id.toString(),
            label: item.courseName,
            isDisabled: false,
          };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.course, value: '', isDisabled: true }]);
      setCoursesOptions(newData);
    },
  });

  const { mutate: searchListCentresOfAdmin } = useMutation(
    'searchCentresOfAdmin',
    searchCentresOfAdmin,
    {
      onSuccess: ({
        data,
      }: {
        data: { listCentres: Array<{ id: number; centreName: string }> };
      }) => {
        const newData = data.listCentres
          .map((item) => {
            return {
              value: item.id.toString(),
              label: item.centreName,
              isDisabled: false,
            };
          })
          .concat([{ label: TEXT_SELECT_SEARCH.centre, value: '', isDisabled: true }]);
        setCentresOptions(newData);
      },
    },
  );

  const messageWarningDeleteClass = useMemo(() => {
    return `You are not allowed to delete the selected ${
      selection?.length > 1 ? 'classes as one of the class' : 'class as the class'
    } that you have selected is an ongoing class.`;
  }, [selection]);

  const { mutate: handleDeleteClass } = useMutation('deleteClass', deleteClass, {
    onSuccess: () => {
      setIsModalDeleteClass(false);
      if (listClass?.length === 1 && Number(pagination.current) > 1) {
        setPagination({ ...pagination, current: Number(pagination.current) - 1 });
        return;
      }
      getListClass({
        page: Number(pagination.current),
        limit: Number(limit),
        search: searchValue,
        order: renderOrder(),
        sort: renderSort(),
        filters:
          Object.getOwnPropertyNames(filters).length > 0
            ? JSON.stringify([
                Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
              ])
            : '',
      });
    },
    onError: ({ response }) => {
      setIsModalDeleteClass(false);
      if (response.status == 403) {
        setMessageWarning('You are not allowed to delete class.');
      } else {
        setMessageWarning(messageWarningDeleteClass);
      }
    },
  });

  const { mutate: handleDeleteMultipleClass } = useMutation(
    'deleteMultipleClass',
    deleteMultipleClass,
    {
      onSuccess: () => {
        setPagination({ ...pagination, current: 1 });
        if (pagination.current === 1) {
          getListClass({
            limit: Number(limit),
            page: 1,
            search: searchValue,
            order: renderOrder(),
            sort: renderSort(),
            filters:
              Object.getOwnPropertyNames(filters).length > 0
                ? JSON.stringify([
                    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
                  ])
                : '',
          });
        }
      },
      onError: ({ response }) => {
        if (response.status == 403) {
          setMessageWarning('You are not allowed to delete classes.');
        } else {
          setMessageWarning(messageWarningDeleteClass);
        }
      },
    },
  );

  const redirectEditCourse = useCallback((id: number, className: string) => {
    history(`${ROUTES.new_manage_class}/${id}`, {
      state: { className: className },
    });
  }, []);

  const columns = [
    {
      title: 'Class Name',
      dataIndex: 'className',
      key: 'className',
      render: (text: string, record: DataType) => {
        return (
          <div>
            <CustomTooltip title={record.className}>
              <div className="custom-text-ellipsis">{record.className}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (text: string, record: DataType) => {
        return (
          <div>
            <CustomTooltip title={record.courseName}>
              <div className="custom-text-ellipsis">{record.courseName}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'courseName',
      render: (text: string, record: DataType) => {
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
      title: 'Centre',
      dataIndex: 'centre',
      key: 'centre',
      render: (text: string, record: DataType) => {
        return (
          <div>
            <CustomTooltip title={record.centre}>
              <div className="custom-text-ellipsis">{record.centre}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'courseName',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'courseName',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'courseName',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'courseName',
      render: (text: string, record: DataType) => (
        <div className="flex">
          <div
            className="cursor-pointer"
            onClick={() => redirectEditCourse(record?.id as number, record?.className as string)}
          >
            <CustomTooltip title="Edit">
              <EditSVG className="icon-hover" />
            </CustomTooltip>
          </div>

          <div
            className="cursor-pointer ml-5"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalDeleteClass(true);
              setManageClassId(record.id);
            }}
          >
            <CustomTooltip title="Delete">
              <TrashSVG className="icon-hover" />
            </CustomTooltip>
          </div>
        </div>
      ),
    },
  ];

  const handleSearchCentre = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        if (isAdmin && adminId) {
          setIsSearchingCentre(true);
          searchListCentresOfAdmin({
            ...PARAMS_SELECT_SEARCH.centre,
            search: value,
            id: Number(adminId),
          });
          return;
        }
        searchListCentres({ ...PARAMS_SELECT_SEARCH.centre, search: value });
      }, 500);
    },
    [timeout, isAdmin, adminId],
  );

  const handleSearchCategory = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getCategories({ ...PARAMS_SELECT_SEARCH.category, search: value });
      }, 500);
    },
    [timeout],
  );

  const handleSearchCourse = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchListCourses({ ...PARAMS_SELECT_SEARCH.course, search: value });
      }, 500);
    },
    [timeout],
  );

  const optionsFilter = useMemo(() => {
    return [
      {
        name: 'centres',
        className: 'basis-[calc(28.3%_-_0.75rem)]  lg:w-[calc(50%_-_0.5rem)] lg:basis-auto',

        placeholder: 'All Centres',
        type: 'select-search',
        options: centresOptions,
        handleSearch: handleSearchCentre,
        isDefaultValue: !!(isAdmin && !isSearchingCentre),
      },
      {
        name: 'category',
        placeholder: 'All Categories ',
        className: 'basis-[calc(28.3%_-_0.75rem)]  lg:w-[calc(50%_-_0.5rem)] lg:basis-auto',

        options: categories,
        type: 'select-search',
        handleSearch: handleSearchCategory,
      },
      {
        name: 'courses',
        className: 'basis-[calc(28.3%_-_0.75rem)]  lg:w-[calc(50%_-_0.5rem)] lg:basis-auto',

        placeholder: 'All Courses',
        type: 'select-search',
        options: coursesOptions,
        handleSearch: handleSearchCourse,
      },
    ];
  }, [categories, coursesOptions, centresOptions, isSearchingCentre, isAdmin]);

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

  const handleDeleteSelection = () => {
    handleDeleteMultipleClass({ listClassIds: Array.isArray(selection) ? selection : [] });
  };

  const handleReset = useCallback(() => {
    setOrder('ASC');
    setLimit('5');
    setFilters({});
    setSearchValue('');
    getListClass({
      limit: Number(5),
      page: 1,
      search: '',
      order: optionsOrder[0].value,
      sort: sort,
    });
  }, [limit]);

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

  const renderModalDeleteClass = () => {
    return (
      isModalDeleteClass && (
        <ModalCustom
          visible={true}
          onCancel={() => {
            setIsModalDeleteClass(false);
          }}
          cancelText="Cancel"
          okText="Confirm"
          title="Delete"
          titleCenter
          onSubmit={() => {
            handleDeleteClass({ id: Number(manageClassId) });
          }}
        >
          <div>Are you sure you want to delete this class? This action cannot be undone.</div>
        </ModalCustom>
      )
    );
  };

  const handleTableChange = () => {
    setPagination({ ...pagination, current: 2 });
  };

  const onFinish = (values: IFields) => {
    setPagination({ ...pagination, pageSize: Number(limit), current: 1 });
    setSearchValue(values?.search as string);
    setFilters({
      categoryID: values?.category?.value ? Number(values?.category?.value) : '',
      courseID: values?.courses?.value,
      centreID: values?.centres?.value,
    });
  };

  const onChangeSelect = (selectedRowKeys: React.Key[]) => {
    setSelection(selectedRowKeys.map((item) => Number(item)));
  };

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination]);

  const onFilter = useCallback(
    (value: string) => {
      setOrder(value);
      setPagination({ ...pagination, current: 1 });
    },
    [pagination],
  );

  const onChangeAction = useCallback(
    (value: string) => {
      if (value === 'selection') {
        setIsModalConfirm(true);
        setMessageConfirmDelete(
          `Are you sure you want to delete the selected ${
            selection?.length > 1 ? 'classes' : 'class'
          }? This action cannot be undone.`,
        );
      }
    },
    [selection],
  );

  useEffect(() => {
    getCategories(PARAMS_SELECT_SEARCH.category);
    searchListCourses(PARAMS_SELECT_SEARCH.course);
    if (isAdmin && adminId) {
      searchListCentresOfAdmin({
        ...PARAMS_SELECT_SEARCH.centre,
        id: Number(adminId),
      });
      return;
    }
    searchListCentres(PARAMS_SELECT_SEARCH.centre);
  }, [adminId, isAdmin]);

  useEffect(() => {
    getListClass({
      limit: Number(limit),
      page: Number(pagination.current),
      search: searchValue,
      order: renderOrder(),
      sort: renderSort(),
      filters:
        Object.getOwnPropertyNames(filters).length > 0
          ? JSON.stringify([
              Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
            ])
          : '',
    });
  }, [limit, pagination.current, searchValue, sort, order, filters]);

  const debounceSearch = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchListClass({
          page: 1,
          limit: 10,
          search: value,
          order: 'DESC',
        });
      }, 500);
    },
    [limit, pagination.current, timeout, isAdmin, adminId],
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

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <Row className="flex justify-between items-center bg-transparent px-0 ">
        <Col className="mb-2 mr-2">
          <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
            Manage Class
          </p>
        </Col>
        <Col className="mb-2">
          <ButtonCustom onClick={() => history(ROUTES.new_manage_class)} color="orange">
            New Class
          </ButtonCustom>
        </Col>
      </Row>

      <FilterCard
        handleChangeSearch={handleChangeSearch}
        onFinish={onFinish}
        form={form}
        handleReset={handleReset}
        searchResults={searchResult}
        keyResult="className"
        fields={optionsFilter}
        pathSearchDetail={ROUTES.new_manage_class}
      />

      <TableCustom
        columns={columns}
        data={listClass}
        pagination={pagination}
        isLoading={isLoading}
        searchNotFound={
          listClass?.length > 0 ? undefined : (
            <SearchNotFound isBackgroundWhite text={searchValue} />
          )
        }
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        handleTableChange={handleTableChange}
        onLastPage={() => {
          setPagination({
            ...pagination,
            current: pageSize,
          });
        }}
        onFirstPage={() => {
          setPagination({ ...pagination, current: 1 });
        }}
        onRow={(record) => ({
          onClick: () => {
            redirectEditCourse(record?.id as number, record?.className as string);
          },
        })}
        viewItem={{
          onChange: onChangeLimit,
          value: String(limit),
        }}
        onChangeSelect={onChangeSelect}
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
          options: [
            // { value: 'all', label: 'Delete All' },
            { value: 'selection', label: 'Delete' },
          ],
        }}
      />
      {renderModalConfirm()}
      {renderModalDeleteClass()}
      {renderModalWarning()}
    </Layout>
  );
};

export default ManageClass;
