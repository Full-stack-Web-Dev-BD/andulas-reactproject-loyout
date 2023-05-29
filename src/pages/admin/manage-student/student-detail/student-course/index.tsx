import { Layout, TablePaginationConfig } from 'antd';
import TableCustom from 'components/SearchBar/Table';
import CustomTooltip from 'components/Tooltip';
import { DATE_FORMAT, ROUTES } from 'constants/index';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactComponent as WithDraw } from 'assets/icons/withdraw_icon.svg';
import { ReactComponent as Transfer } from 'assets/icons/transfer_icon.svg';
import { useMutation } from 'react-query';
import { getStudentCourse } from 'api/student';
import moment from 'moment';
export interface IRecords {
  id: number;
  status: string;
  class: {
    className: string;
    startDate?: string;
    endDate?: string;
    course: {
      courseName: string;
    };
    centre: {
      centreName: string;
    };
  };
}

export interface IStudentInfo {
  id: number;
  key: string;
  centre: string;
  courseName: string;
  className: string;
  startDate: string;
  endDate: string;
  status: string;
}

export const optionsOrder = [
  { label: 'Start Date (Ascending)', value: 'startDateASC' },
  { label: 'Start Date (Descending)', value: 'startDateDESC' },
  { label: 'End Date (Ascending)', value: 'endDateASC' },
  { label: 'End Date (Descending)', value: 'endDateDESC' },
];

const StudentCourse = () => {
  const history = useNavigate();
  const [dataCourses, setDataCourses] = useState<IStudentInfo[]>([]);
  const [limit, setLimit] = useState('5');
  const [filters, setFilters] = useState({});
  const [order, setOrder] = useState<string>('startDateASC');
  const [sort] = useState<string>('courseName');
  const { id: studentId } = useParams();

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });

  const { mutate: mutateGetStudentCourse, isLoading } = useMutation(
    'getStudentCourse',
    getStudentCourse,
    {
      onSuccess: ({ data: courses }: { data: { records: IRecords[]; total: number; page: 1 } }) => {
        if (courses?.records?.length > 0) {
          const newData = courses.records.map((item) => {
            return {
              id: Number(item.id),
              key: item.id.toString(),
              centre: item.class.centre.centreName,
              courseName: item.class.course.courseName,
              className: item.class.className,
              endDate: moment.utc(item.class.endDate).local().format(DATE_FORMAT),
              status: item.status,
              startDate: moment.utc(item.class.startDate).local().format(DATE_FORMAT),
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

  const redirectEditCourse = useCallback((id: number, courseName: string) => {
    history(`${ROUTES.course_detail}/${id}`, {
      state: { courseName: courseName },
    });
  }, []);

  const columns = [
    {
      title: 'Centre Name',
      dataIndex: 'centre',
      fixed: true,
      width: 190,
      render: (text: string, record: IStudentInfo) => {
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
      width: 190,
      render: (text: string, record: IStudentInfo) => {
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
      dataIndex: 'categoryName',
      fixed: true,
      width: 190,
      render: (text: string, record: IStudentInfo) => {
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
      title: 'Start Date',
      dataIndex: 'startDate',
      fixed: true,
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      fixed: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text: string, record: IStudentInfo) => {
        return (
          <div
            className={`${
              record.status === 'Ongoing'
                ? 'bg-[#E6F2F2] text-[#006262]'
                : record.status === 'Pending Withdraw'
                ? 'bg-[#FCECD9] text-[#BE5E2A]'
                : 'bg-[#FFD3D3] text-[#EB5757]'
            } px-[5px] py-[4px] rounded-2xl text-xs uppercase text-center`}
          >
            {record.status}
          </div>
        );
      },
      fixed: true,
      width: 200,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      fixed: true,
      width: 100,
      render: (text: string, record: IStudentInfo) => {
        return (
          <div className="flex">
            <div className="cursor-not-allowed" onClick={() => {}}>
              <CustomTooltip title="Withdraw">
                <WithDraw className="icon-hover" />
              </CustomTooltip>
            </div>
            <div
              className="ml-5 cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <CustomTooltip title="Transfer">
                <Transfer className="icon-hover" />
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
      studentId: Number(studentId),
    };

    mutateGetStudentCourse(params);
  }, [pagination.current, limit, order, sort, filters]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <TableCustom
        hideColSelection
        columns={columns}
        data={dataCourses}
        pagination={pagination}
        isLoading={isLoading}
        handleTableChange={handleTableChange}
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        // onRow={(record) => ({
        //   onClick: () => {},
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

export default StudentCourse;
