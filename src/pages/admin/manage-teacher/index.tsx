import { Form, Layout, TablePaginationConfig } from 'antd';
import {
  deleteTeacher,
  deleteMultipleTeachers,
  searchTeacher,
  searchTeacherOfCentreAdmin,
  deleteTeacherOfCentreAdmin,
  deleteMultipleTeachersOfCentreAdmin,
} from 'api/teacher';
import { searchCentres, searchCentresOfAdmin } from 'api/centres';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import FilterCard from 'components/SearchBar/FilterCard';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom from 'components/SearchBar/Table';
import CustomTooltip from 'components/Tooltip';
import { PARAMS_SELECT_SEARCH, TEXT_SELECT_SEARCH } from 'constants/constants';
import { ICategory, ROUTES } from 'constants/index';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { getListCategories, searchCourses } from 'api/courses';
import { searchSubjectTag } from 'api/subjectTag';
import { AppContext } from 'context';
import './style.css';
interface IFields {
  search: string;
  centres: { label: string; value: string };
  subjectTag: { label: string; value: string };
  courses: { label: string; value: string };
  categories: { label: string; value: string };
}
export interface ITeacherInfo {
  id: number;
  key: string;
  teacherName: string;
  subjectTag: string;
  contactNumber: string;
  status: boolean;
  ICNumber: string;
}

interface ITeacher {
  id: number;
  isActive: boolean;
  remark: string;
  centres: { centreName: string }[];
  user: {
    email: string;
    userProfile: {
      firstName: string;
      lastName: string;
      ICNumber: string;
      contactNumber: string;
      mobileCountryCode: string;
    };
  };
  subjectTags: { tagName: string }[];
}

export const optionsOrder = [
  { label: 'Teacher Name (A-Z)', value: 'ASC' },
  { label: 'Teacher Name (Z-A)', value: 'DESC' },
  { label: 'Status (Active)', value: 'ACTIVE' },
  { label: 'Status (Inactive)', value: 'INACTIVE' },
];

enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

const ManageTeacher = () => {
  const history = useNavigate();
  const timeout: any = useRef(null);
  const [form] = Form.useForm();
  const [state]: any = useContext(AppContext);
  const isAdmin = state?.user?.centreAdmin;
  const adminId = state?.user?.centreAdmin?.id;
  const [listTeacher, setListTeacher] = useState<ITeacherInfo[]>([]);
  const [searchResult, setSearchResult] = useState<{ id: number; teacherName: string }[]>([]);
  const [selection, setSelection] = useState<React.Key[]>([]);
  const [limit, setLimit] = useState('5');
  const [messageConfirmDelete, setMessageConfirmDelete] = useState<string | null>('');
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [filters, setFilters] = useState({});
  const [messageWarning, setMessageWarning] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState<string>('ASC');
  const [sort] = useState<string>('userProfile.firstName');
  const [isModalDeleteTeacher, setIsModalDeleteTeacher] = useState(false);
  const [idDeleteTeacher, setIdDeleteTeacher] = useState<number | undefined>();
  const [status, setStatus] = useState('');
  const [isSearchingCentre, setIsSearchingCentre] = useState(false);
  const [categoriesOptions, setCategoriesOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [courseOptions, setCourseOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [subjectTagOptions, setSubjectTagOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [centreOptions, setCentreOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });
  const { mutate: searchListTeachers } = useMutation('searchTeachers', searchTeacher, {
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
          teacherName: item.user.userProfile.firstName + ' ' + item.user.userProfile.lastName,
        };
      });
      setSearchResult(newData);
    },
  });

  const { mutate: searchListTeachersOfCentreAdmin } = useMutation(
    'searchTeacherOfCentreAdmin',
    searchTeacherOfCentreAdmin,
    {
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
            teacherName: item.user.userProfile.firstName + ' ' + item.user.userProfile.lastName,
          };
        });
        setSearchResult(newData);
      },
    },
  );

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

  const { mutate: getSubjectTag } = useMutation('searchSubjectTag', searchSubjectTag, {
    onSuccess: ({ data }: { data: { listSubjectTags: { tagName: string; id: number }[] } }) => {
      if (data?.listSubjectTags?.length > 0) {
        const options = data.listSubjectTags
          .map((item) => {
            return { label: item.tagName, value: item.id.toString(), isDisabled: false };
          })
          .concat([{ label: TEXT_SELECT_SEARCH.subjectTag, value: '', isDisabled: true }]);
        setSubjectTagOptions(options);
        return;
      }
      setSubjectTagOptions([]);
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

  const { mutate: getCentreOfAdmin } = useMutation('searchCentresOfAdmin', searchCentresOfAdmin, {
    onSuccess: (res: { data: { listCentres: { centreName: string; id: number }[] } }) => {
      const options = res.data.listCentres
        .map((centreItem) => {
          return {
            label: centreItem.centreName,
            value: centreItem.id.toString(),
            isDisabled: false,
          };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.centre, value: '', isDisabled: true }]);
      setCentreOptions(options as { label: string; value: string }[]);
    },
  });

  const { mutate: getListTeachers, isLoading } = useMutation('searchTeachers', searchTeacher, {
    onSuccess: ({
      data: teacherData,
    }: {
      data: { records: ITeacher[]; total: number; page: 1 };
    }) => {
      if (teacherData?.records?.length > 0) {
        const newData = teacherData.records.map((item) => {
          const userProfile = item.user.userProfile;
          return {
            id: item.id,
            key: item.id.toString(),
            teacherName: userProfile?.firstName + ' ' + userProfile?.lastName,
            status: item.isActive,
            ICNumber: userProfile.ICNumber,
            contactNumber:
              userProfile?.contactNumber && userProfile?.mobileCountryCode
                ? `(${userProfile?.mobileCountryCode}) ${userProfile.contactNumber}`
                : '',
            subjectTag: Array.isArray(item?.subjectTags)
              ? item.subjectTags.map((subject) => subject.tagName).join('; ')
              : '',
          };
        });
        setListTeacher(newData);
        setPagination({
          ...pagination,
          current: teacherData.page,
          pageSize: Number(limit),
          total: teacherData?.total,
        });

        return;
      }
      setListTeacher([]);
    },
  });

  const { mutate: getListTeachersOfCentreAdmin, isLoading: isLoadingSearchTeacher } = useMutation(
    'searchTeachersOfCentreAdmin',
    searchTeacherOfCentreAdmin,
    {
      onSuccess: ({
        data: teacherData,
      }: {
        data: { records: ITeacher[]; total: number; page: 1 };
      }) => {
        if (teacherData?.records?.length > 0) {
          const newData = teacherData.records.map((item) => {
            const userProfile = item.user.userProfile;
            return {
              id: item.id,
              key: item.id.toString(),
              teacherName: userProfile?.firstName + ' ' + userProfile?.lastName,
              status: item.isActive,
              ICNumber: userProfile.ICNumber,
              contactNumber:
                userProfile?.contactNumber && userProfile?.mobileCountryCode
                  ? `(${userProfile?.mobileCountryCode}) ${userProfile.contactNumber}`
                  : '',
              subjectTag: Array.isArray(item?.subjectTags)
                ? item.subjectTags.map((subject) => subject.tagName).join('; ')
                : '',
            };
          });
          setListTeacher(newData);
          setPagination({
            ...pagination,
            current: teacherData.page,
            pageSize: Number(limit),
            total: teacherData?.total,
          });

          return;
        }
        setListTeacher([]);
      },
    },
  );

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

  const messageWarningDeleteTeachers = useMemo(() => {
    return selection?.length > 1
      ? `You are not allowed to delete the selected teachers as one of the teacher that you have selected has an ongoing class.`
      : `You are not allowed to delete the selected teacher as the teacher that you have selected has an ongoing class.`;
  }, [selection]);

  const messageWarningDeleteTeacher = useMemo(() => {
    return `You are not allowed to delete the selected teacher as the teacher that you have selected has an ongoing class.`;
  }, []);

  const handleGetListTeachers = useCallback(
    (page?: number) => {
      getListTeachers({
        page: page ? page : Number(pagination.current),
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
    [pagination, limit, searchValue, renderOrder, renderSort, filters],
  );

  const handleGetListTeachersOfCentreAdmin = useCallback(
    (page?: number) => {
      getListTeachersOfCentreAdmin({
        page: page ? page : Number(pagination.current),
        limit: Number(limit),
        search: searchValue,
        order: renderOrder(),
        sort: renderSort(),
        id: Number(adminId),
        filters:
          Object.getOwnPropertyNames(filters).length > 0
            ? JSON.stringify([
                Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
              ])
            : '',
      });
    },
    [pagination, limit, searchValue, renderOrder, renderSort, filters, adminId],
  );

  const { mutate: onDeleteTeacher } = useMutation('deleteTeacher', deleteTeacher, {
    onSuccess: () => {
      setIsModalDeleteTeacher(false);
      if (listTeacher?.length === 1 && Number(pagination.current) > 1) {
        setPagination({ ...pagination, current: Number(pagination.current) - 1 });
        return;
      }
      handleGetListTeachers();
    },
    onError: ({ response }) => {
      setIsModalDeleteTeacher(false);
      if (response.status == 403) {
        setMessageWarning('You are not allowed to delete teacher.');
      } else {
        setMessageWarning(messageWarningDeleteTeacher);
      }
    },
  });

  const { mutate: deleteMultipleTeacher } = useMutation(
    'deleteMultipleTeachers',
    deleteMultipleTeachers,
    {
      onSuccess: () => {
        setPagination({ ...pagination, current: 1 });
        if (pagination.current === 1) {
          handleGetListTeachers(1);
        }
      },
      onError: ({ response }) => {
        if (response.status == 403) {
          setMessageWarning('You are not allowed to delete teachers.');
        } else {
          setMessageWarning(messageWarningDeleteTeachers);
        }
      },
    },
  );

  const { mutate: onDeleteTeacherOfCentreAdmin } = useMutation(
    'deleteTeacherOfCentreAdmin',
    deleteTeacherOfCentreAdmin,
    {
      onSuccess: () => {
        setIsModalDeleteTeacher(false);
        if (listTeacher?.length === 1 && Number(pagination.current) > 1) {
          setPagination({ ...pagination, current: Number(pagination.current) - 1 });
          return;
        }
        handleGetListTeachersOfCentreAdmin();
      },
      onError: ({ response }) => {
        setIsModalDeleteTeacher(false);
        if (response.status == 403) {
          setMessageWarning('You are not allowed to delete teacher.');
        } else {
          setMessageWarning(response.data.message);
        }
      },
    },
  );

  const { mutate: onDeleteMultipleTeachersOfCentreAdmin } = useMutation(
    'deleteMultipleTeachersOfCentreAdmin',
    deleteMultipleTeachersOfCentreAdmin,
    {
      onSuccess: () => {
        setPagination({ ...pagination, current: 1 });
        if (pagination.current === 1) {
          handleGetListTeachersOfCentreAdmin(1);
        }
      },
      onError: ({ response }) => {
        if (response.status == 403) {
          setMessageWarning('You are not allowed to delete teachers.');
        } else {
          setMessageWarning(response.data.message);
        }
      },
    },
  );

  const handleSearchCentre = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        if (adminId && isAdmin) {
          setIsSearchingCentre(true);
          getCentreOfAdmin({ ...PARAMS_SELECT_SEARCH.centre, search: value, id: Number(adminId) });
          return;
        }
        getCentres({ ...PARAMS_SELECT_SEARCH.centre, search: value });
      }, 500);
    },
    [timeout, adminId, isAdmin],
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

  const handleSearchSubjectTag = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getSubjectTag({ ...PARAMS_SELECT_SEARCH.subjectTag, search: value });
      }, 500);
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
        isDefaultValue: !!(isAdmin && !isSearchingCentre),
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
          'basis-[18.5%] sm:min-w-[calc(50%_-_0.5rem)] md:min-w-[calc(50%_-_0.5rem)] lg:min-w-[calc(50%_-_0.5rem)] xl:min-w-[calc(33.33%_-_0.75rem)]',
        placeholder: 'All Courses',
        type: 'select-search',
        options: courseOptions,
        handleSearch: handleSearchCourse,
      },
      {
        name: 'subjectTag',
        className:
          'basis-[18.5%] sm:min-w-[calc(50%_-_0.5rem)] md:min-w-[calc(50%_-_0.5rem)] lg:min-w-[calc(50%_-_0.5rem)] xl:min-w-[calc(33.33%_-_0.75rem)]',
        placeholder: 'All Subjects',
        type: 'select-search',
        options: subjectTagOptions,
        handleSearch: handleSearchSubjectTag,
      },
    ];
  }, [
    subjectTagOptions,
    centreOptions,
    categoriesOptions,
    courseOptions,
    isAdmin,
    isSearchingCentre,
  ]);

  useEffect(() => {
    getSubjectTag(PARAMS_SELECT_SEARCH.subjectTag);
    getCategories(PARAMS_SELECT_SEARCH.category);
    getCourses(PARAMS_SELECT_SEARCH.course);
    if (adminId && isAdmin) {
      getCentreOfAdmin({ ...PARAMS_SELECT_SEARCH.centre, id: Number(adminId) });
      return;
    }
    getCentres(PARAMS_SELECT_SEARCH.centre);
  }, [adminId, isAdmin]);

  const redirectEditTeacher = (id: number, teacherName: string) => {
    history(`${ROUTES.teacher_detail}/${id}`, {
      state: { teacherName: teacherName },
    });
  };

  const handleDeleteTeacher = useCallback(() => {
    if (adminId && isAdmin) {
      onDeleteTeacherOfCentreAdmin({ id: Number(idDeleteTeacher), adminId: Number(adminId) });
      return;
    }
    onDeleteTeacher({ id: Number(idDeleteTeacher) });
  }, [adminId, isAdmin, idDeleteTeacher]);

  const modalConfirmDeleteAdmin = useCallback(() => {
    return (
      isModalDeleteTeacher && (
        <ModalCustom
          visible={isModalDeleteTeacher}
          onCancel={() => {
            setIsModalDeleteTeacher(false);
          }}
          cancelText="Cancel"
          okText="Confirm"
          title="Delete"
          onSubmit={handleDeleteTeacher}
          titleCenter
        >
          <div>Are you sure you want to delete this teacher? This action cannot be undone.</div>
        </ModalCustom>
      )
    );
  }, [isModalDeleteTeacher]);

  const columns = [
    {
      title: 'Teacher Name',
      dataIndex: 'teacherName',
      fixed: true,
      render: (text: string, record: ITeacherInfo) => {
        return (
          <div>
            <CustomTooltip title={record.teacherName}>
              <div className="custom-text-ellipsis">{record.teacherName}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'IC Number',
      dataIndex: 'ICNumber',
      fixed: true,
      render: (text: string, record: ITeacherInfo) => {
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
      title: 'Contact Number',
      dataIndex: 'contactNumber',
      fixed: true,
      render: (text: string, record: ITeacherInfo) => {
        return (
          <div>
            <CustomTooltip title={record.contactNumber}>
              <div className="custom-text-ellipsis">{record.contactNumber}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      fixed: true,
      render: (text: string, record: ITeacherInfo) => {
        return (
          <div>
            <CustomTooltip title={record.subjectTag}>
              <div className="custom-text-ellipsis">{record.subjectTag}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text: string, record: ITeacherInfo) => {
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
      render: (text: string, record: ITeacherInfo) => {
        return (
          <div className="flex">
            <div
              className="cursor-pointer"
              onClick={() =>
                redirectEditTeacher(record?.id as number, record?.teacherName as string)
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
                setIdDeleteTeacher(Number(record.id));
                setIsModalDeleteTeacher(true);
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
    const params = {
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
                    ? { ...filters, isActive: status === Status.ACTIVE ? true : false }
                    : filters,
                ).filter(([, v]) => v?.toString() !== ''),
              ),
            ])
          : status
          ? JSON.stringify([{ isActive: status === Status.ACTIVE ? true : false }])
          : '',
    };
    if (adminId && isAdmin) {
      getListTeachersOfCentreAdmin({
        ...params,
        id: Number(adminId),
      });
      return;
    }

    getListTeachers(params);
  }, [pagination.current, limit, order, sort, searchValue, filters, status, isAdmin, adminId]);

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
        courseID: values?.courses?.value ? Number(values?.courses?.value) : '',
        subjectTagID: values?.subjectTag?.value ? Number(values?.subjectTag?.value) : '',
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
        if (adminId && isAdmin) {
          searchListTeachersOfCentreAdmin({
            ...PARAMS_SELECT_SEARCH.teacher,
            order: 'DESC',
            search: value,
            id: Number(adminId),
          });
          return;
        }
        searchListTeachers({
          ...PARAMS_SELECT_SEARCH.teacher,
          order: 'DESC',
          search: value,
        });
      }, 500);
    },
    [limit, pagination.current, timeout, adminId, isAdmin],
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
            selection?.length > 1 ? 'teachers' : 'teacher'
          }? This action cannot be undone.`,
        );
      }
    },
    [selection],
  );

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination]);

  const handleDeleteSelection = useCallback(() => {
    if (adminId && isAdmin) {
      onDeleteMultipleTeachersOfCentreAdmin({
        teacherIDs: Array.isArray(selection) ? selection : [],
        adminId: Number(adminId),
      });
      return;
    }
    deleteMultipleTeacher({ teacherIDs: Array.isArray(selection) ? selection : [] });
  }, [selection, isAdmin, adminId]);

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
  }, [limit, optionsOrder]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6 mt-5">
      <div className="flex justify-between items-center bg-transparent px-0">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0 custom-font-header">
          Teachers
        </p>

        <ButtonCustom
          className="button-fix"
          color="orange"
          onClick={() => history(ROUTES.teacher_detail)}
        >
          New Teacher
        </ButtonCustom>
      </div>

      <FilterCard
        handleChangeSearch={handleChangeSearch}
        onFinish={onFinish}
        form={form}
        fields={optionsFilter}
        handleReset={handleReset}
        searchResults={searchResult}
        pathSearchDetail={ROUTES.teacher_detail}
        keyResult="teacherName"
      />

      <TableCustom
        columns={columns}
        data={listTeacher}
        isLoading={isLoading || isLoadingSearchTeacher}
        pagination={pagination}
        handleTableChange={handleTableChange}
        onChangeSelect={onChangeSelect}
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        onRow={(record) => ({
          onClick: () => {
            redirectEditTeacher(record?.id as number, record?.teacherName as string);
          },
        })}
        searchNotFound={
          listTeacher?.length > 0 ? undefined : (
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
      {modalConfirmDeleteAdmin()}
      {renderModalConfirm()}
    </Layout>
  );
};

export default ManageTeacher;
