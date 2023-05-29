import { Form, Layout, TablePaginationConfig, Row, Col } from 'antd';
import {
  deleteCourses,
  deleteMultipleCourses,
  getCourseProgramType,
  getLearningMode,
  getListCategories,
  searchCourses,
} from 'api/courses';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import FilterCard from 'components/SearchBar/FilterCard';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom, { DataType } from 'components/SearchBar/Table';
import CustomTooltip from 'components/Tooltip';
import { PARAMS_SELECT_SEARCH, TEXT_SELECT_SEARCH } from 'constants/constants';
import { countDateTime, DATE_FORMAT, ICategory, ROUTES } from 'constants/index';
import moment from 'moment';
import React, { Key, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import './style.css';

interface IFields {
  search: string;
  category: { label: string; value: string };
  learningMethod: { label: string; value: string };
  programType: { label: string; value: string };
}

export interface ICourse {
  id: number;
  courseName: string;
  courseShortName?: string;
  courseCategory?: {
    categoryName: string;
  };
  categoryName?: string;
  learningMethod: string;
  programType: string;
  isActive: boolean;
  updatedAt?: string;
  key?: Key;
}

export const optionsOrder = [
  { label: 'Course Name (A-Z)', value: 'ASC' },
  { label: 'Course Name (Z-A)', value: 'DESC' },
  { label: 'Last Updated On (Ascending)', value: 'UPDATED-ASC' },
  { label: 'Last Updated On (Descending)', value: 'UPDATED-DESC' },
];

const Courses = () => {
  const history = useNavigate();
  const timeout: any = useRef(null);
  const [form] = Form.useForm();
  const [dataCourses, setDataCourses] = useState<ICourse[]>([]);
  const [searchResult, setSearchResult] = useState<{ id: number; courseName: string }[]>([]);
  const [selection, setSelection] = useState<React.Key[]>([]);
  const [limit, setLimit] = useState('5');
  const [learningModes, setLearningModes] = useState([]);
  const [programTypes, setProgramTypes] = useState([]);
  const [messageConfirmDelete, setMessageConfirmDelete] = useState<string | null>('');
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [filters, setFilters] = useState({});
  const [messageWarning, setMessageWarning] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState<string>('ASC');
  const [sort] = useState<string>('courseName');
  const [isModalDeleteCourse, setIsModalDeleteCourse] = useState(false);
  const [idDeleteCourse, setIdDeleteCourse] = useState<number | undefined>();

  const [categories, setCategories] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });

  const { mutate: searchListCourses } = useMutation('searchCourses', searchCourses, {
    onSuccess: ({
      data: courses,
    }: {
      data: { listCourses: { id: number; courseName: string }[] };
    }) => {
      const newData = courses.listCourses.map((item) => {
        return {
          id: item.id,
          courseName: item.courseName,
        };
      });
      setSearchResult(newData);
    },
  });

  const { mutate: getLearningModes } = useMutation('getLearningMode', getLearningMode, {
    onSuccess: ({ data }) => {
      const newOptions = data.map((el: string) => {
        return { label: el, value: el };
      });
      setLearningModes(newOptions);
    },
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

  const { mutate: getCourseProgramTypes } = useMutation(
    'getCourseProgramType',
    getCourseProgramType,
    {
      onSuccess: ({ data }) => {
        const newOptions = data.map((el: string) => {
          return { label: el, value: el };
        });

        setProgramTypes(newOptions);
      },
    },
  );

  const { mutate: getListCourses, isLoading } = useMutation('searchCourses', searchCourses, {
    onSuccess: ({
      data: courses,
    }: {
      data: { listCourses: ICourse[]; total: number; page: 1 };
    }) => {
      setSelection([]);
      if (courses?.listCourses?.length > 0) {
        const newData = courses.listCourses.map((item) => {
          return {
            id: item.id,
            key: item.id.toString(),
            courseName: item.courseName,
            courseShortName: item?.courseShortName,
            categoryName: item?.courseCategory?.categoryName,
            learningMethod: item.learningMethod,
            programType: item.programType,
            lastUpdatedOn:
              countDateTime(item.updatedAt as string) > 7
                ? moment(item.updatedAt)?.utc().format(DATE_FORMAT)
                : moment(item.updatedAt).fromNow(),
            isActive: item.isActive,
          };
        });
        setDataCourses(newData);
        setPagination({
          ...pagination,
          current: courses.page,
          pageSize: Number(limit),
          total: courses?.total,
        });

        return;
      }
      setDataCourses([]);
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

      default:
        break;
    }
  }, [order]);

  const renderSort = useCallback(() => {
    switch (order) {
      case 'ASC':
        return sort;
      case 'DESC':
        return sort;
      case 'UPDATED-DESC':
        return 'updatedAt';
      case 'UPDATED-ASC':
        return 'updatedAt';

      default:
        break;
    }
  }, [sort, order]);

  const messageWarningDeleteCourses = useMemo(() => {
    return selection?.length > 1
      ? `You are not allowed to delete the selected courses as one of the course that you have selected is an ongoing class.`
      : `You are not allowed to delete the selected course as the course that you have selected is an ongoing class.`;
  }, [selection]);

  const messageWarningDeleteCourse = useMemo(() => {
    return `You are not allowed to delete the selected course as the course that you have selected is an ongoing class.`;
  }, []);

  const { mutate: deleteCourse } = useMutation('deleteCourses', deleteCourses, {
    onSuccess: () => {
      setIsModalDeleteCourse(false);
      if (dataCourses?.length === 1 && Number(pagination.current) > 1) {
        setPagination({ ...pagination, current: Number(pagination.current) - 1 });
        return;
      }
      getListCourses({
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
      setIsModalDeleteCourse(false);
      if (response.status == 403) {
        setMessageWarning('You are not allowed to delete course.');
      } else {
        setMessageWarning(messageWarningDeleteCourse);
      }
    },
  });

  const { mutate: deleteMultipleCourse } = useMutation(
    'deleteMultipleCourses',
    deleteMultipleCourses,
    {
      onSuccess: () => {
        setPagination({ ...pagination, current: 1 });
        if (pagination.current === 1) {
          getListCourses({
            page: 1,
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
        }
      },
      onError: ({ response }) => {
        if (response.status == 403) {
          setMessageWarning('You are not allowed to delete courses.');
        } else {
          setMessageWarning(messageWarningDeleteCourses);
        }
      },
    },
  );

  const optionsFilter = useMemo(() => {
    return [
      {
        name: 'category',
        placeholder: 'All Categories',
        className: 'basis-[calc(28.3%_-_0.75rem)] lg:w-[calc(50%_-_0.5rem)] lg:basis-auto',
        options: categories,
        type: 'select-search',
      },
      {
        name: 'learningMethod',
        className: 'basis-[calc(28.3%_-_0.75rem)] lg:w-[calc(50%_-_0.5rem)] lg:basis-auto',
        placeholder: 'All Learning Methods',
        options: learningModes,
      },
      {
        name: 'programType',
        className: 'basis-[calc(28.3%_-_0.75rem)] lg:w-[calc(50%_-_0.5rem)] lg:basis-auto',
        placeholder: 'All Program Types',
        options: programTypes,
      },
    ];
  }, [learningModes, programTypes, categories]);

  useEffect(() => {
    getLearningModes();
    getCourseProgramTypes();
    getCategories(PARAMS_SELECT_SEARCH.category);
  }, []);

  const redirectEditCourse = useCallback((id: number, courseName: string) => {
    history(`${ROUTES.course_detail}/${id}`, {
      state: { courseName: courseName },
    });
  }, []);

  const modalConfirmDeleteCourse = useCallback(() => {
    return (
      isModalDeleteCourse && (
        <ModalCustom
          visible={isModalDeleteCourse}
          onCancel={() => {
            setIsModalDeleteCourse(false);
          }}
          cancelText="Cancel"
          okText="Confirm"
          title="Delete"
          onSubmit={() => deleteCourse({ id: Number(idDeleteCourse) })}
          titleCenter
        >
          <div>Are you sure you want to delete this course? This action cannot be undone.</div>
        </ModalCustom>
      )
    );
  }, [isModalDeleteCourse]);

  const columns = [
    {
      title: 'Course name',
      dataIndex: 'courseName',
      fixed: true,
      width: 190,
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
      title: 'Course Short Name',
      dataIndex: 'courseShortName',
      fixed: true,
      width: 190,
      render: (text: string, record: DataType) => {
        return (
          <div>
            <CustomTooltip title={record?.courseShortName}>
              <div className="custom-text-ellipsis">{record?.courseShortName}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      fixed: true,
      width: 190,
      render: (text: string, record: DataType) => {
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
      title: 'Learning Method',
      dataIndex: 'learningMethod',
      fixed: true,
    },
    {
      title: 'Program Type',
      dataIndex: 'programType',
      fixed: true,
    },
    {
      title: 'Last Updated On',
      dataIndex: 'lastUpdatedOn',
      fixed: true,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      fixed: true,
      width: 100,
      render: (text: string, record: DataType) => {
        return (
          <div className="flex">
            <div
              className="cursor-pointer"
              onClick={() => redirectEditCourse(record?.id as number, record?.courseName as string)}
            >
              <CustomTooltip title="Edit">
                <EditSVG className="icon-hover" />
              </CustomTooltip>
            </div>
            <div
              className="cursor-pointer ml-5"
              onClick={(e) => {
                e.stopPropagation();
                setIdDeleteCourse(Number(record.id));
                setIsModalDeleteCourse(true);
              }}
            >
              <CustomTooltip title="Delete">
                <TrashSVG className="icon-hover" />
              </CustomTooltip>
            </div>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getListCourses({
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
  }, [pagination.current, limit, order, sort, searchValue, filters]);
  const handleTableChange = () => {
    setPagination({ ...pagination, current: 2 });
  };

  const onFinish = useCallback(
    (values: IFields) => {
      setPagination({ ...pagination, pageSize: Number(limit), current: 1 });
      setSearchValue(values.search);
      setFilters({
        courseCategoryID: values?.category?.value ? Number(values?.category?.value) : '',
        learningMethod: values?.learningMethod,
        programType: values?.programType,
      });
    },
    [limit, pagination, order],
  );

  const onChangeSelect = (selectedRowKeys: React.Key[]) => {
    setSelection(selectedRowKeys);
  };

  const debounceSearch = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchListCourses({
          page: 1,
          limit: 10,
          search: value,
          order: 'DESC',
        });
      }, 500);
    },
    [limit, pagination.current, timeout],
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
            selection?.length > 1 ? 'courses' : 'course'
          }? This action cannot be undone.`,
        );
      }
      // else if (value === 'all') {
      //   setMessageWarning(`Can't delete all courses. There are still courses in these courses!`);
      // }
    },
    [selection],
  );

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination]);

  const handleDeleteSelection = () => {
    deleteMultipleCourse({ courseIds: Array.isArray(selection) ? selection : [] });
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
    getListCourses({
      limit: Number(5),
      page: 1,
      search: '',
      sort,
      order: optionsOrder[0].value,
    });
  }, [limit, optionsOrder]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <Row className="flex justify-between items-center bg-transparent px-0" gutter={[0, 12]}>
        <Col>
          <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0 mr-2">
            Courses
          </p>
        </Col>
        <Col>
          <ButtonCustom color="orange" onClick={() => history(ROUTES.course_detail)}>
            New Course
          </ButtonCustom>
        </Col>
      </Row>

      <FilterCard
        handleChangeSearch={handleChangeSearch}
        onFinish={onFinish}
        form={form}
        fields={optionsFilter}
        handleReset={handleReset}
        searchResults={searchResult}
        pathSearchDetail={ROUTES.course_detail}
        keyResult="courseName"
        handleSearchOptions={handleSearchCategory}
      />
      <TableCustom
        columns={columns}
        data={dataCourses}
        isLoading={isLoading}
        pagination={pagination}
        handleTableChange={handleTableChange}
        onChangeSelect={onChangeSelect}
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        onRow={(record) => ({
          onClick: () => {
            redirectEditCourse(record?.id as number, record?.courseName as string);
          },
        })}
        searchNotFound={
          dataCourses.length > 0 ? undefined : (
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
          options: [
            // { value: 'all', label: 'Delete All' },
            { value: 'selection', label: 'Delete' },
          ],
        }}
      />

      {renderModalWarning()}
      {modalConfirmDeleteCourse()}
      {renderModalConfirm()}
    </Layout>
  );
};

export default Courses;
