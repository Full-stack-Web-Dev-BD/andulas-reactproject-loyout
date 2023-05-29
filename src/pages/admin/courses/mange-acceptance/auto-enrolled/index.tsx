import { Form, Layout, TablePaginationConfig } from 'antd';
import { searchCentres } from 'api/centres';
import { searchCourses } from 'api/courses';
import { getManageAcceptanceByAdmission } from 'api/courses_by_admission';
import FilterCard from 'components/SearchBar/FilterCard';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom from 'components/SearchBar/Table';
import { DATE_FORMAT, PARAMS_SELECT_SEARCH, ROUTES, TEXT_SELECT_SEARCH } from 'constants/constants';
import moment from 'moment';
import React, { Key, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

interface IFields {
  search: string;
  course: { label: string; value: string };
  centres: { label: string; value: string };
  status: string;
}

export interface IAutoEnrolled {
  id: number;
  studentName: string;
  courseName: string;
  centre: string;
  dateSubmitted: string;
  status: string;
  key?: Key;
}

const sort = 'createdAt';
const courseType = 'Auto Enrolled';

const AutoEnrolled = () => {
  // table component
  const [dataManageAcceptance, setDataManageAcceptance] = useState<IAutoEnrolled[]>([]);
  // const [selection, setSelection] = useState<React.Key[]>([]);
  const [limit, setLimit] = useState<string>('5');
  const history = useNavigate();
  const [order, setOrder] = useState<string>('DESC');

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 1,
    position: [],
  });

  const {
    mutate: mutateGetManageAcceptanceByAdmission,
    isLoading: isLoadingGetManageAcceptanceByAdmission,
  } = useMutation('getManageAcceptanceByAdmission', getManageAcceptanceByAdmission, {
    onSuccess: ({ data }) => {
      setPagination({
        current: data.page,
        pageSize: Number(limit),
        total: data.total,
      });
      setDataManageAcceptance(
        data.listRegistrations.map((item: any) => ({
          studentName: item.student.userProfile.lastName + ' ' + item.student.userProfile.firstName,
          courseName: item.course.courseName,
          centre: item.centre.centreName,
          dateSubmitted: moment(item.createdAt)?.utc().format(DATE_FORMAT),
          id: item.id,
          key: item.id,
        })),
      );
    },
  });

  const handleTableChange = (paginate: TablePaginationConfig) => {
    setPagination({ ...pagination, ...paginate });
  };

  // const onChangeSelect = (selectedRowKeys: React.Key[]) => {
  //   setSelection(selectedRowKeys as number[]);
  // };

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'studentName',
    },
    {
      title: 'Course Name',
      dataIndex: 'courseName',
    },
    {
      title: 'Centre',
      dataIndex: 'centre',
    },
    {
      title: 'Date Submitted',
      dataIndex: 'dateSubmitted',
      fixed: true,
      width: 180,
    },
  ];
  // handle filter card
  const [searchResult, setSearchResult] = useState<{ id: number; courseName: string }[]>([]);
  const [coursesOptions, setCoursesOptions] = useState<{ label: string; value: string }[]>([]);
  const [centresOptions, setCentresOptions] = useState<{ label: string; value: string }[]>([]);
  const timeout: any = useRef(null);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});
  const [form] = Form.useForm();
  const centres = Form.useWatch('centres', form);
  const course = Form.useWatch('course', form);
  const { mutate: mutateDropdownSearch } = useMutation(
    'getManageAcceptanceByAdmission',
    getManageAcceptanceByAdmission,
    {
      onSuccess: ({ data }) => {
        const newData = data.listRegistrations.map((item: any) => {
          return {
            id: item.id,
            student: `${item.student.userProfile.lastName} ${item.student.userProfile.firstName} - ${item.course.courseName} - ${item.centre.centreName}`,
          };
        });
        setSearchResult(newData);
      },
    },
  );

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

  const debounceSearch = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        mutateDropdownSearch({
          page: 1,
          limit: 10,
          search: value,
          sort: sort,
          order: 'DESC',
          filters: JSON.stringify([{ courseType: courseType }]),
        });
      }, 500);
    },
    [limit, pagination.current, timeout],
  );

  const handleChangeSearch = useCallback((keySearch: string) => {
    debounceSearch(keySearch);
  }, []);

  const onFinish = useCallback(
    (values: IFields) => {
      setPagination({ ...pagination, pageSize: Number(limit), current: 1 });
      setSearchValue(values.search as string);
      setFilters({
        courseType: courseType,
        centreID: values?.centres?.value ? Number(values?.centres?.value) : '',
        courseID: values?.course?.value ? Number(values?.course?.value) : '',
        status: values?.status || '',
      });
    },
    [limit, pagination, order],
  );

  const onChangeLimit = (value: string) => {
    const total = pagination.total;
    const maxPage = Math.ceil(Number(total) / Number(value));
    setLimit(String(value));
    if (Number(pagination.current) > maxPage) setPagination({ ...pagination, current: maxPage });
    else setPagination(pagination);
  };

  const onFilter = (value: string) => {
    setOrder(value);
  };

  const handleSearchCentre = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchListCentres({ ...PARAMS_SELECT_SEARCH.centre, search: value });
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
        placeholder: 'All Centres',
        className: 'basis-[38%] cus-width-min-180',
        options: centresOptions,
        type: 'select-search',
        handleSearch: handleSearchCentre,
      },
      {
        name: 'course',
        className: 'basis-[38%] cus-width-min-180',
        placeholder: 'All Courses',
        type: 'select-search',
        options: coursesOptions,
        handleSearch: handleSearchCourse,
      },
    ];
  }, [coursesOptions, centresOptions]);

  useEffect(() => {
    searchListCourses(PARAMS_SELECT_SEARCH.course);
    searchListCentres(PARAMS_SELECT_SEARCH.centre);
  }, []);

  useEffect(() => {
    mutateGetManageAcceptanceByAdmission({
      page: Number(pagination.current),
      limit: Number(limit),
      search: searchValue,
      sort: sort,
      order: order,
      filters:
        Object.getOwnPropertyNames(filters).length > 0
          ? JSON.stringify([{ ...filters, courseType: courseType }])
          : JSON.stringify([{ courseType: courseType }]),
    });
  }, [pagination.current, limit, order, filters]);

  const handleReset = useCallback(() => {
    setOrder('DESC');
    setLimit('5');
    setFilters({});
    setSearchValue('');
    getManageAcceptanceByAdmission({
      limit: 5,
      page: 1,
      search: '',
      sort: sort,
      order: 'DESC',
    });
  }, [limit]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <div className="flex justify-between items-center bg-transparent px-0">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0 mt-5">
          Manage Acceptance - Auto Enrolled
        </p>
      </div>

      <FilterCard
        handleChangeSearch={handleChangeSearch}
        onFinish={onFinish}
        fields={optionsFilter}
        searchResults={searchResult}
        handleReset={handleReset}
        // pathSearchDetail={`${ROUTES.manage_acceptance_update}`}
        keyResult="student"
        form={form}
      />

      <TableCustom
        columns={columns}
        data={dataManageAcceptance}
        isLoading={isLoadingGetManageAcceptanceByAdmission}
        pagination={pagination}
        handleTableChange={handleTableChange}
        // onChangeSelect={onChangeSelect}
        onFirstPage={() => {
          setPagination({ ...pagination, current: 1 });
        }}
        onLastPage={() => {
          setPagination({
            ...pagination,
            current: Math.ceil(Number(pagination.total) / Number(pagination.pageSize)),
          });
        }}
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        viewItem={{
          onChange: onChangeLimit,
          value: String(limit),
        }}
        filters={{
          show: true,
          options: [
            //customers want it like that (DESC <-> ASC)
            { value: 'DESC', label: 'Date Submitted (Ascending)' },
            { value: 'ASC', label: 'Date Submitted (Descending)' },
          ],
          onChange: onFilter,
          value: order,
        }}
        // onRow={(record) => ({
        //   onClick: () => {
        //     history(`${ROUTES.manage_acceptance_update}/${record.id}`);
        //   },
        // })}
        searchNotFound={
          dataManageAcceptance.length > 0 ? undefined : (
            <SearchNotFound
              isBackgroundWhite
              text={
                searchValue ? searchValue : centres ? centres.label : course ? course.label : ''
              }
            />
          )
        }
        // action={{
        //   show: selection.length > 0 ? true : false,
        //   options: [],
        // }}
      />
    </Layout>
  );
};

export default AutoEnrolled;
