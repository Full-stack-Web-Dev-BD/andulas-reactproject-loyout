import { Form, Layout, TablePaginationConfig } from 'antd';
import { searchCentres } from 'api/centres';
import { searchClass } from 'api/class';
import { getListCategories, searchCourses } from 'api/courses';
import { deleteMultipleStudents, deleteStudent, searchStudent } from 'api/student';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import ModalCustom from 'components/Modal';
import FilterCard from 'components/SearchBar/FilterCard';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom from 'components/SearchBar/Table';
import CustomTooltip from 'components/Tooltip';
import { DATE_FORMAT, PARAMS_SELECT_SEARCH, TEXT_SELECT_SEARCH } from 'constants/constants';
import { ICategory, ROUTES } from 'constants/index';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

interface IFields {
  search: string;
  centres: { label: string; value: string };
  categories: { label: string; value: string };
  courses: { label: string; value: string };
  classes: { label: string; value: string };
}
export interface IStudentInfo {
  id: number;
  key: string;
  studentName: string;
  ICNumber: string;
  registrationDate: string;
  status: boolean;
}

export const optionsOrder = [
  { label: 'Student Name (A-Z)', value: 'ASC' },
  { label: 'Student Name (Z-A)', value: 'DESC' },
  { label: 'Status (Active)', value: 'ACTIVE' },
  { label: 'Status (Inactive)', value: 'INACTIVE' },
];

enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

interface IStudent {
  id: number;
  isActive: boolean;
  createdAt: string;
  user: {
    userProfile: {
      firstName: string;
      lastName: string;
      ICNumber: string;
    };
  };
  subjectTags: { tagName: string }[];
}

const ManageStudent = () => {
  const history = useNavigate();
  const timeout: any = useRef(null);
  const [form] = Form.useForm();
  const [listStudent, setListStudent] = useState<IStudentInfo[]>([]);
  const [searchResult, setSearchResult] = useState<{ id: number; studentName: string }[]>([]);
  const [selection, setSelection] = useState<React.Key[]>([]);
  const [limit, setLimit] = useState('5');
  const [messageConfirmDelete, setMessageConfirmDelete] = useState<string | null>('');
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [filters, setFilters] = useState({});
  const [messageWarning, setMessageWarning] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [filterClasses, setFilterClasses] = useState('');
  const [order, setOrder] = useState<string>('ASC');
  const [sort] = useState<string>('userProfile.firstName');
  const [isModalDeleteStudent, setIsModalDeleteStudent] = useState(false);
  const [idDeleteStudent, setIdDeleteStudent] = useState<number | undefined>();
  const [status, setStatus] = useState('');
  const [categoriesOptions, setCategoriesOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [courseOptions, setCourseOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [classOptions, setClassOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [classOptionsBackup, setClassOptionsBackup] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [centreOptions, setCentreOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });

  const { mutate: getCourses } = useMutation('searchCourses', searchCourses, {
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
      setCourseOptions(newData);
    },
  });

  const { mutate: searchListStudents } = useMutation('searchStudents', searchStudent, {
    onSuccess: ({
      data: teachersData,
    }: {
      data: {
        records: {
          id: number;
          user: {
            userProfile: {
              firstName: string;
              lastName: string;
            };
          };
        }[];
      };
    }) => {
      const newData = teachersData.records.map((item) => {
        return {
          id: item.id,
          studentName: item.user.userProfile.firstName + ' ' + item.user.userProfile.lastName,
        };
      });
      setSearchResult(newData);
    },
  });

  const { mutate: getListStudent, isLoading } = useMutation('getListStudent', searchStudent, {
    onSuccess: ({
      data: students,
    }: {
      data: { records: IStudent[]; total: number; page: number; limit: number };
    }) => {
      if (students?.records?.length > 0) {
        setSelection([]);
        const newData = students.records.map((item: IStudent) => {
          return {
            id: Number(item.id),
            key: item.id.toString(),
            studentName:
              item?.user?.userProfile?.firstName + ' ' + item?.user?.userProfile?.lastName,
            ICNumber: item?.user?.userProfile?.ICNumber,
            registrationDate: moment.utc(item.createdAt).local().format(DATE_FORMAT),
            status: item?.isActive,
          };
        });
        setListStudent(newData);
        setPagination({
          ...pagination,
          current: students.page,
          pageSize: Number(students.limit),
          total: students?.total || 0,
        });
        return;
      }
      setListStudent([]);
    },
  });

  const { mutate: searchClasses } = useMutation('searchClass', searchClass, {
    onSuccess: ({
      data,
    }: {
      data: { listClasses: { id: number; className: string; course: { courseName: string } }[] };
    }) => {
      const newOptions = data.listClasses
        .map((el) => {
          return {
            label: el.className + ' - ' + el.course.courseName,
            value: el.id.toString(),
            isDisabled: false,
          };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.class, value: '', isDisabled: true }]);
      setClassOptions(newOptions);
    },
  });

  const { mutate: getClasses } = useMutation('searchClass', searchClass, {
    onSuccess: ({
      data,
    }: {
      data: { listClasses: { id: number; className: string; course: { courseName: string } }[] };
    }) => {
      const newOptions = data.listClasses
        .map((el) => {
          return {
            label: el.className + ' - ' + el.course.courseName,
            value: el.id.toString(),
            isDisabled: false,
          };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.class, value: '', isDisabled: true }]);
      setClassOptions(newOptions);
      setClassOptionsBackup(newOptions);
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

  const { mutate: getCentres } = useMutation('searchCentres', searchCentres, {
    onSuccess: ({ data }: { data: { listCentres: { centreName: string; id: number }[] } }) => {
      const options = data.listCentres
        .map((item) => {
          return { label: item.centreName, value: item.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.centre, value: '', isDisabled: true }]);
      setCentreOptions(options);
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

  const messageWarningDeleteStudents = useMemo(() => {
    return selection?.length > 1
      ? `You are not allowed to delete the selected students as one of the student that you have selected has an ongoing class.`
      : `You are not allowed to delete the selected student as the student that you have selected has an ongoing class`;
  }, [selection]);

  // const messageWarningDeleteStudent = useMemo(() => {
  //   return `You are not allowed to delete the selected student as the student that you have selected is an ongoing student.`;
  // }, []);

  const handleSearchCentre = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getCentres({ ...PARAMS_SELECT_SEARCH.centre, search: value });
      }, 500);
    },
    [timeout],
  );

  const handleSearchCourse = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getCourses({ ...PARAMS_SELECT_SEARCH.course, search: value });
      }, 500);
    },
    [timeout],
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

  const handleSearchClass = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchClasses({ ...PARAMS_SELECT_SEARCH.class, search: value, filters: filterClasses });
        return;
      }, 50);
    },
    [timeout, filterClasses, classOptionsBackup],
  );

  const handleSearchClassOfCourse = useCallback(
    (id: string | number) => {
      if (id) {
        setFilterClasses(JSON.stringify([{ courseID: Number(id) }]));
        searchClasses({
          ...PARAMS_SELECT_SEARCH.class,
          filters: JSON.stringify([{ courseID: Number(id) }]),
        });
        return;
      }
      setTimeout(() => {
        searchClasses({
          ...PARAMS_SELECT_SEARCH.class,
          filters: '',
        });
      }, 100);
      setFilterClasses('');
    },
    [timeout],
  );

  const optionsFilter = useMemo(() => {
    return [
      {
        name: 'centres',
        placeholder: 'All Centres',
        className:
          'basis-[18.5%] sm:min-w-[calc(50%_-_0.5rem)] md:min-w-[calc(50%_-_0.5rem)] lg:min-w-[calc(50%_-_0.5rem)] xl:min-w-[calc(33.33%_-_0.75rem)]',
        options: centreOptions,
        type: 'select-search',
        handleSearch: handleSearchCentre,
      },
      {
        name: 'categories',
        className:
          'basis-[18.5%] sm:min-w-[calc(50%_-_0.5rem)] md:min-w-[calc(50%_-_0.5rem)] lg:min-w-[calc(50%_-_0.5rem)] xl:min-w-[calc(33.33%_-_0.75rem)]',
        placeholder: 'All Categories',
        type: 'select-search',
        options: categoriesOptions,
        handleSearch: handleSearchCategories,
      },
      {
        name: 'courses',
        className:
          'basis-[18.5%] sm:min-w-[calc(50%_-_0.5rem)] md:min-w-[calc(50%_-_0.5rem)] lg:min-w-[calc(50%_-_0.5rem)] xl:min-w-[calc(33.33%_-_0.75rem)] ',
        placeholder: 'All Courses',
        type: 'select-search',
        options: courseOptions,
        handleSearch: handleSearchCourse,
      },
      {
        name: 'classes',
        className:
          'basis-[18.5%] sm:min-w-[calc(50%_-_0.5rem)] md:min-w-[calc(50%_-_0.5rem)] lg:min-w-[calc(50%_-_0.5rem)] xl:min-w-[calc(33.33%_-_0.75rem)]',
        placeholder: 'All Classes',
        type: 'select-search',
        options: classOptions,
        handleSearch: handleSearchClass,
      },
    ];
  }, [classOptions, centreOptions, categoriesOptions, courseOptions, filterClasses]);

  useEffect(() => {
    getClasses(PARAMS_SELECT_SEARCH.class);
    getCategories(PARAMS_SELECT_SEARCH.category);
    getCentres(PARAMS_SELECT_SEARCH.centre);
    getCourses(PARAMS_SELECT_SEARCH.course);
  }, []);

  const redirectEditStudent = (id: number, studentName: string) => {
    history(`${ROUTES.student_detail}/${id}`, {
      state: { teacherName: studentName },
    });
  };

  const { mutate: mutateDeleteStudent } = useMutation('deleteStudent', deleteStudent, {
    onSuccess: () => {
      setIsModalDeleteStudent(false);
      if (listStudent?.length === 1 && Number(pagination.current) > 1) {
        setPagination({ ...pagination, current: Number(pagination.current) - 1 });
        return;
      }
      getListStudent({
        limit: Number(limit),
        page: Number(pagination.current),
        search: searchValue,
        order: renderOrder(),
        sort: renderSort(),
        filters:
          Object.getOwnPropertyNames(filters).length > 0
            ? JSON.stringify([
                Object.fromEntries(
                  Object.entries(
                    status
                      ? { ...filters, isActive: status === Status.ACTIVE ? true : false }
                      : filters,
                  ).filter(([, v]) => v?.toString() !== ''),
                ),
              ])
            : status
            ? JSON.stringify([{ isActive: status === Status.ACTIVE ? true : false }])
            : '',
      });
    },
    onError: ({ response }: { response: { data: { message: string }; status: number } }) => {
      setIsModalDeleteStudent(false);
      if (response.status == 403) {
        setMessageWarning('You are not allowed to delete student.');
      } else {
        setMessageWarning(messageWarningDeleteStudents);
      }
    },
  });

  const { mutate: mutateDeleteMultipleStudents } = useMutation(
    'deleteMultipleStudents',
    deleteMultipleStudents,
    {
      onSuccess: () => {
        setPagination({ ...pagination, current: 1 });
        if (pagination.current === 1) {
          getListStudent({
            limit: Number(limit),
            page: 1,
            search: searchValue,
            order: renderOrder(),
            sort: renderSort(),
            filters:
              Object.getOwnPropertyNames(filters).length > 0
                ? JSON.stringify([
                    Object.fromEntries(
                      Object.entries(
                        status
                          ? { ...filters, isActive: status === Status.ACTIVE ? true : false }
                          : filters,
                      ).filter(([, v]) => v?.toString() !== ''),
                    ),
                  ])
                : status
                ? JSON.stringify([{ isActive: status === Status.ACTIVE ? true : false }])
                : '',
          });
        }
      },
      onError: ({ response }: { response: { data: { message: string }; status: number } }) => {
        if (response.status == 403) {
          setMessageWarning('You are not allowed to delete students.');
        } else {
          setMessageWarning(messageWarningDeleteStudents);
        }
      },
    },
  );

  const modalConfirmDeleteStudent = useCallback(() => {
    return (
      isModalDeleteStudent && (
        <ModalCustom
          visible={isModalDeleteStudent}
          onCancel={() => {
            setIsModalDeleteStudent(false);
          }}
          cancelText="Cancel"
          okText="Confirm"
          title="Delete"
          onSubmit={() => {
            mutateDeleteStudent({ id: Number(idDeleteStudent) });
          }}
          titleCenter
        >
          <div>Are you sure you want to delete this student? This action cannot be undone.</div>
        </ModalCustom>
      )
    );
  }, [isModalDeleteStudent]);

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      fixed: true,
      render: (text: string, record: IStudentInfo) => {
        return (
          <div>
            <CustomTooltip title={record.studentName}>
              <div className="custom-text-ellipsis">{record.studentName}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'IC Number',
      dataIndex: 'ICNumber',
      fixed: true,
      render: (text: string, record: IStudentInfo) => {
        return (
          <div>
            <CustomTooltip title={record.ICNumber}>
              <div className="custom-text-ellipsis">{record.ICNumber}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Registration Date',
      dataIndex: 'registrationDate',
      fixed: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text: string, record: IStudentInfo) => {
        return (
          <div
            className={`${
              record.status ? 'bg-[#E6F2F2] text-[#006262]' : 'bg-[#FCECD9] text-[#BE5E2A]'
            } px-[5px] py-[4px] rounded-2xl text-xs uppercase text-center`}
          >
            {record.status ? Status.ACTIVE : Status.INACTIVE}
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
      render: (text: string, record: IStudentInfo) => {
        return (
          <div className="flex">
            <div
              className="cursor-pointer"
              onClick={() =>
                redirectEditStudent(record?.id as number, record?.studentName as string)
              }
            >
              <CustomTooltip title="Edit">
                <EditSVG className="icon-hover" />
              </CustomTooltip>
            </div>
            <div
              className="cursor-pointer ml-5"
              onClick={(e) => {
                e.stopPropagation();
                setIdDeleteStudent(Number(record.id));
                setIsModalDeleteStudent(true);
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

  const handleTableChange = () => {
    setPagination({ ...pagination, current: 2 });
  };

  const onFinish = useCallback(
    (values: IFields) => {
      setPagination({ ...pagination, pageSize: Number(limit), current: 1 });
      setSearchValue(values.search);
      setFilters({
        centreID: values?.centres?.value ? Number(values?.centres?.value) : '',
        categoryID: values?.categories?.value ? Number(values?.categories?.value) : '',
        courseID: values?.courses?.value ? values?.courses?.value : '',
        classID: values?.classes?.value ? values?.classes?.value : '',
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
        searchListStudents({
          ...PARAMS_SELECT_SEARCH.teacher,
          order: 'DESC',
          search: value,
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
      if (value !== Status.ACTIVE && value !== Status.INACTIVE) {
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
            selection?.length > 1 ? 'students' : 'student'
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
    mutateDeleteMultipleStudents({ studentIDs: Array.isArray(selection) ? selection : [] });
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
    setPagination({
      current: 1,
      pageSize: 5,
    });
    setFilters({});
    setSearchValue('');
    setStatus('');
    setFilterClasses('');
  }, [limit, optionsOrder]);

  useEffect(() => {
    getListStudent({
      limit: Number(limit),
      page: Number(pagination.current),
      search: searchValue,
      order: renderOrder(),
      sort: renderSort(),
      filters:
        Object.getOwnPropertyNames(filters).length > 0
          ? JSON.stringify([
              Object.fromEntries(
                Object.entries(
                  status
                    ? { ...filters, isActive: status === Status.ACTIVE ? true : false }
                    : filters,
                ).filter(([, v]) => v?.toString() !== ''),
              ),
            ])
          : status
          ? JSON.stringify([{ isActive: status === Status.ACTIVE ? true : false }])
          : '',
    });
  }, [limit, pagination.current, searchValue, sort, order, filters, status]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <div className="flex justify-between items-center bg-transparent px-0">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
          Students
        </p>

        {/* <ButtonCustom color="orange" onClick={() => history(ROUTES.student_detail)}>
          New Student
        </ButtonCustom> */}
      </div>

      <FilterCard
        handleChangeSearch={handleChangeSearch}
        onFinish={onFinish}
        handleSearchDependency={handleSearchClassOfCourse}
        fieldNameReset="classes"
        dependencyFiled="courses"
        form={form}
        fields={optionsFilter}
        handleReset={handleReset}
        searchResults={searchResult}
        pathSearchDetail={ROUTES.student_detail}
        keyResult="studentName"
      />

      <TableCustom
        columns={columns}
        data={listStudent}
        pagination={pagination}
        handleTableChange={handleTableChange}
        onChangeSelect={onChangeSelect}
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        onRow={(record) => ({
          onClick: () => {
            redirectEditStudent(record?.id as number, record?.studentName as string);
          },
        })}
        searchNotFound={
          listStudent?.length > 0 ? undefined : (
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
          show: selection.length > 0 ? true : false,
          onSelect: onChangeAction,
          options: [{ value: 'selection', label: 'Delete' }],
        }}
      />

      {renderModalWarning()}
      {modalConfirmDeleteStudent()}
      {renderModalConfirm()}
    </Layout>
  );
};

export default ManageStudent;
