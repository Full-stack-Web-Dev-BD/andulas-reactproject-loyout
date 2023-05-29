import { Breadcrumb, Layout, Table } from 'antd';
import { getTime } from 'api/session';
import { ReactComponent as SortSVG } from 'assets/images/sort.svg';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import SelectCustom from 'components/Select';
import { ROUTES } from 'constants/constants';
import { IListSessionTime } from 'constants/types';
import { getDaysArray } from 'helper/function';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const { Header, Content } = Layout;

const optionsLimit = [
  { label: 'January', value: '1' },
  { label: 'February', value: '2' },
  { label: 'March', value: '3' },
  { label: 'April', value: '4' },
  { label: 'May', value: '5' },
  { label: 'June', value: '6' },
  { label: 'July', value: '7' },
  { label: 'August', value: '8' },
  { label: 'September', value: '9' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

interface LocationState {
  className: string;
  moduleName: string;
  sessionName: string;
}

const ClassAttendanceDate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classId, moduleId, sessionId } = useParams();
  const [month, setMonth] = useState<string | null>(null);

  const [dataList, setDataList] = useState<IListSessionTime>();
  const [sort, setSort] = useState(1);

  const dataTable = useMemo(() => {
    return (
      dataList?.records
        .flatMap((item) => {
          const dates = getDaysArray(item.startTime as Date, item.endTime as Date);

          return dates.map((date) => ({ id: item.id, date }));
        })
        .filter((data) => (month ? moment(data.date).month() + 1 === +month : true))
        .sort((a, b) => {
          if (a.date > b.date) return sort;
          else if (a.date < b.date) return -sort;
          else return 0;
        }) || []
    );
  }, [dataList?.records, month, sort]);

  const { mutate: getSessionTime } = useMutation('getSessionTime', getTime, {
    onSuccess: ({ data }: { data: IListSessionTime }) => {
      setDataList(data);
    },
  });

  useEffect(() => {
    if (sessionId && classId) {
      getSessionTime({
        page: 1,
        limit: 5,
        sort: 'startTime',
        order: 'ASC',
        search: '',
        filters: JSON.stringify([{ sessionId, classId }]),
      });
    }
  }, [sessionId, classId]);

  const columns: any = [
    {
      title: (
        <span className="font-fontFamily" onClick={() => setSort((prev) => -prev)}>
          Date <SortSVG />
        </span>
      ),
      dataIndex: 'date',
      key: 'date',
      render: (value: string | Date) => (
        <>
          <span className="font-fontFamily font-semibold">
            {moment.utc(value).local().format('YYYY/MM/DD')}
          </span>
        </>
      ),
    },
  ];

  const onRow = (record?: { id?: number; date: Date }, rowIndex?: number) => {
    return {
      onClick: () => {
        const date = moment.utc(record?.date).local();
        navigate(
          `${ROUTES.class_management}/${classId}${ROUTES.attendance}/module/${
            // record?.id
            moduleId
          }/session/${sessionId}/date/${record?.id}/${date.format('DD-MM-YYYY')}`,
          {
            state: {
              sessionName: (location.state as LocationState).sessionName,
              moduleName: (location.state as LocationState).moduleName,
              className: (location.state as LocationState).className,
              date: date.format('YYYY/MM/DD'),
            },
          },
        );
      },
    };
  };

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <Header className="flex justify-between items-center bg-transparent px-0 h-auto">
        <Breadcrumb className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
          <Breadcrumb.Item
            className="cursor-pointer font-fontFamily"
            onClick={() => navigate(ROUTES.class_management)}
          >
            Class Management
          </Breadcrumb.Item>
          <Breadcrumb.Item className="font-fontFamily">
            {(location.state as LocationState).className}
          </Breadcrumb.Item>
          <Breadcrumb.Item
            className="cursor-pointer font-fontFamily"
            onClick={() =>
              navigate(`${ROUTES.class_management}/${classId}${ROUTES.attendance}`, {
                state: {
                  className: (location.state as LocationState).className,
                },
              })
            }
          >
            Attendance
          </Breadcrumb.Item>
          <Breadcrumb.Item
            className="cursor-pointer font-fontFamily"
            onClick={() =>
              navigate(
                `${ROUTES.class_management}/${classId}${ROUTES.attendance}/module/${moduleId}`,
                {
                  state: {
                    className: (location.state as LocationState).className,
                    moduleName: (location.state as LocationState).moduleName,
                  },
                },
              )
            }
          >
            {(location.state as LocationState).moduleName}
          </Breadcrumb.Item>
          <Breadcrumb.Item className="font-fontFamily text-main-font-color">
            {(location.state as LocationState).sessionName}
          </Breadcrumb.Item>
        </Breadcrumb>
      </Header>

      <Content className="flex flex-col gap-y-6">
        <div className="flex justify-between items-center">
          <p className="text-2xl font-fontFamily leading-9 font-bold mb-0"></p>
          <div className="flex gap-4 items-center flex-wrap">
            <p className="font-fontFamily font-bold mb-0">Filter by</p>
            <SelectCustom
              color="transparent"
              value={month}
              onChange={(value: string) => setMonth(value)}
              options={optionsLimit}
              placeholder="Month"
              allowClear={true}
            />
          </div>
        </div>
      </Content>

      {dataList?.records && dataList.records.length > 0 ? (
        <Table
          pagination={false}
          columns={columns}
          dataSource={dataTable}
          className="bg-transparent table-component cursor-pointer"
          rowKey="date"
          onRow={onRow}
        />
      ) : (
        <SearchNotFound isBackgroundWhite text="" />
      )}
    </Layout>
  );
};

export default ClassAttendanceDate;
