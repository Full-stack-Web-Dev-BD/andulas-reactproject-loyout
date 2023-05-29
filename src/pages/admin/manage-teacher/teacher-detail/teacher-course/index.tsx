import { Layout, TablePaginationConfig } from 'antd';
import { getTeacherCourse, getTeacherCourseOfCentreAdmin } from 'api/teacher';
import TableCustom, { DataType } from 'components/SearchBar/Table';
import CustomTooltip from 'components/Tooltip';
import { DATE_FORMAT, ROUTES } from 'constants/index';
import { AppContext } from 'context';
import moment from 'moment';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

export interface IRecords {
  id: number;
  className: string;
  course: {
    courseName: string;
    learningMethod: string;
    courseCategory: {
      categoryName: string;
    };
  };
  classSessions: {
    centre: {
      centreName: string;
    };
  }[];
  startDate?: string;
  endDate?: string;
}

export interface IDataCourse {
  id: number;
  key: string;
  centre: string;
  courseName: string;
  className: string;
  categoryName: string;
  learningMethod: string;
  endDate: string;
  startDate: string;
}

export const optionsOrder = [
  { label: 'Start Date (Ascending)', value: 'startDateASC' },
  { label: 'Start Date (Descending)', value: 'startDateDESC' },
  { label: 'End Date (Ascending)', value: 'endDateASC' },
  { label: 'End Date (Descending)', value: 'endDateDESC' },
];

const TeacherCourse = () => {
  const history = useNavigate();
  const [dataCourses, setDataCourses] = useState<IDataCourse[]>([]);
  const [limit, setLimit] = useState('5');
  const [filters, setFilters] = useState({});
  const [order, setOrder] = useState<string>('startDateASC');
  const [sort] = useState<string>('startDate');
  const { id: teacherId } = useParams();
  const [state,]: any = useContext(AppContext);
  const isAdmin = state?.user?.centreAdmin;
  const adminId = state?.user?.centreAdmin?.id;

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });

  const { mutate: mutateGetTeacherCourse, isLoading } = useMutation(
    'getTeacherCourse',
    getTeacherCourse,
    {
      onSuccess: ({ data: courses }: { data: { records: IRecords[]; total: number; page: 1 } }) => {
        if (courses?.records?.length > 0) {
          const newData = courses.records.map((item) => {
            return {
              id: Number(item.id),
              key: item.id.toString(),
              centre: Array.isArray(item?.classSessions)
                ? item.classSessions?.map((session) => session?.centre?.centreName)?.join('; ')
                : '',
              courseName: item.course.courseName,
              className: item?.className,
              categoryName: item?.course.courseCategory.categoryName,
              learningMethod: item?.course?.learningMethod,
              endDate: moment.utc(item.endDate).local().format(DATE_FORMAT),
              startDate: moment.utc(item.startDate).local().format(DATE_FORMAT),
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
    },
  );

  const { mutate: mutateGetTeacherCourseOfCentreAdmin, isLoading: isLoadingGetCourseOfCentreAdmin } = useMutation(
    'getTeacherCourseOfCentreAdmin',
    getTeacherCourseOfCentreAdmin,
    {
      onSuccess: ({ data: courses }: { data: { records: IRecords[]; total: number; page: 1 } }) => {
        if (courses?.records?.length > 0) {
          const newData = courses.records.map((item) => {
            return {
              id: Number(item.id),
              key: item.id.toString(),
              centre: Array.isArray(item?.classSessions)
                ? item.classSessions?.map((session) => session?.centre?.centreName)?.join('; ')
                : '',
              courseName: item.course.courseName,
              className: item?.className,
              categoryName: item?.course.courseCategory.categoryName,
              learningMethod: item?.course?.learningMethod,
              endDate: moment.utc(item.endDate).local().format(DATE_FORMAT),
              startDate: moment.utc(item.startDate).local().format(DATE_FORMAT),
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
    },
  );

  const renderOrder = useCallback(() => {
    switch (order) {
      case 'endDateDESC':
      case 'startDateDESC':
        return 'DESC';
      case 'endDateASC':
      case 'startDateASC':
        return 'ASC';
      default:
        break;
    }
  }, [order]);

  const renderSort = useCallback(() => {
    switch (order) {
      case 'startDateDESC':
      case 'startDateASC':
        return 'startDate';
      case 'endDateDESC':
      case 'endDateASC':
        return 'endDate';
      default:
        break;
    }
  }, [sort, order]);

  const columns = [
    {
      title: 'Centre Name',
      dataIndex: 'centre',
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
      title: 'Course name',
      dataIndex: 'courseName',
      fixed: true,
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
      title: 'Class Name',
      dataIndex: 'className',
      fixed: true,
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
      title: 'Category',
      dataIndex: 'categoryName',
      fixed: true,
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
      title: 'Start Date',
      dataIndex: 'startDate',
      fixed: true,
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      fixed: true,
    },
  ];

  useEffect(() => {
    const params = {
      params: {
        page: Number(pagination.current),
        limit: Number(limit),
        search: '',
        order: renderOrder(),
        sort: renderSort(),
        filters:
          Object.getOwnPropertyNames(filters).length > 0
            ? JSON.stringify([
                Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
              ])
            : '',
      },
      teacherId: Number(teacherId),
    }
    if(adminId && isAdmin) {
      mutateGetTeacherCourseOfCentreAdmin({...params, adminId: Number(adminId)});
      return;
    }
    mutateGetTeacherCourse(params);
  }, [pagination.current, limit, order, sort, filters, adminId, isAdmin]);

  const handleTableChange = () => {
    setPagination({ ...pagination, current: 2 });
  };

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

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <TableCustom
        hideColSelection
        columns={columns}
        data={dataCourses}
        isLoading={isLoading || isLoadingGetCourseOfCentreAdmin}
        pagination={pagination}
        handleTableChange={handleTableChange}
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        // onRow={(record) => ({
        //   onClick: () => {
        //     redirectEditCourse(record?.id as number, record?.courseName as string);
        //   },
        // })}
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
      />
    </Layout>
  );
};

export default TeacherCourse;
