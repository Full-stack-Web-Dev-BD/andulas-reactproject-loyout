import { Breadcrumb, Form, Layout, Table } from 'antd';
import { IParamsSearch } from 'api/courses';
import { searchSessions } from 'api/session';
import { ReactComponent as SortSVG } from 'assets/images/sort.svg';
import PaginationCustom from 'components/Pagination';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import SelectCustom from 'components/Select';
import { ROUTES } from 'constants/constants';
import { IListSession, ISession } from 'constants/types';
import { AppContext } from 'context';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ClassAttendanceCustomFilter from '../CustomFilter';

const { Header, Content } = Layout;

const optionsLimit = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '30', value: '30' },
];

interface LocationState {
  className: string;
  moduleName: string;
}

const ClassAttendanceSession = () => {
  const timeout: any = useRef(null);
  const [form] = Form.useForm();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { classId, moduleId } = useParams();
  const [stateContext]: any = useContext(AppContext);
  const [dataList, setDataList] = useState<IListSession>();
  const [filter, setFilter] = useState<IParamsSearch>({
    page: 1,
    limit: 5,
    sort: 'sessionName',
    order: 'ASC',
    search: '',
  });

  const { mutate: getListSessions } = useMutation('getListSessions', searchSessions, {
    onSuccess: ({ data }: { data: IListSession }) => {
      // const dataSessions = data?.records?.forEach((sessions) => {
      //   if(sessions?.classSessions?.length > 0) {
      //     sessions?.classSessions?.forEach((session) => {
      //       console.log(session?.teachers[0]?.userID, stateContext?.user?.id)
      //       if(session?.teachers[0]?.userID === stateContext?.user?.id) {
      //         console.log("ok")
      //         return session
      //       }
      //     })
      //   }
      //   return sessions
      // })
      // console.log(dataSessions)
      setDataList(data);
    },
  });

  const { mutate: searchListSessions } = useMutation('searchListSessions', searchSessions, {
    onSuccess: ({ data }: { data: IListSession }) => {
      const result = data.records.map((record) => ({
        id: record.id,
        sessionName: record.sessionName,
      }));

      setSearchResults(result);
    },
  });

  useEffect(() => {
    if (moduleId) {
      getListSessions({
        ...filter,
        filters: filter.filters
          ? JSON.stringify([
              {
                moduleID: moduleId,
                classManagement: true,
                classID: classId,
                ...JSON.parse(filter.filters as string)[0],
              },
            ])
          : JSON.stringify([{ moduleID: moduleId, classManagement: true, classID: classId }]),
      });
    }
  }, [moduleId, filter]);

  const startPageSize = useMemo(() => {
    const startSize = Number(filter.page) * Number(filter?.limit) - (Number(filter?.limit) - 1);

    return startSize;
  }, [filter.page, filter?.limit]);

  const endPageSize = useMemo(() => {
    let endSize = Number(filter.page) * Number(filter?.limit);
    endSize = dataList?.total && endSize < dataList?.total ? endSize : (dataList?.total as number);

    return endSize;
  }, [filter.page, filter?.limit, dataList?.total]);

  const onChangeLimit = useCallback(
    (value: string) => {
      const total = dataList?.total;
      const maxPage = Math.ceil(Number(total) / Number(value));
      if (filter.page > maxPage) setFilter((prev) => ({ ...prev, page: maxPage, limit: +value }));
      else setFilter({ ...filter, limit: +value });
    },
    [filter.page, dataList?.total],
  );

  const columns: any = [
    {
      title: (
        <span
          className="font-fontFamily"
          onClick={() =>
            setFilter((prev) => ({ ...prev, order: prev.order === 'ASC' ? 'DESC' : 'ASC' }))
          }
        >
          Session <SortSVG />
        </span>
      ),
      dataIndex: 'sessionName',
      key: 'sessionName',
      render: (value: string) => <span className="font-fontFamily font-semibold">{value}</span>,
    },
  ];

  const redirectToListDate = (id?: number, sessionName?: string) => {
    navigate(
      `${ROUTES.class_management}/${classId}${ROUTES.attendance}/module/${moduleId}/session/${id}`,
      {
        state: {
          sessionName: sessionName,
          moduleName: (location.state as LocationState).moduleName,
          className: (location.state as LocationState).className,
        },
      },
    );
  };

  const onRow = (record?: ISession, rowIndex?: number) => {
    return {
      onClick: () => redirectToListDate(record?.id, record?.sessionName),
    };
  };

  const handleReset = () => {
    setFilter((prev) => ({ ...prev, search: '', filters: undefined }));
  };

  const onFinish = (values: { search: string; sessionId?: string | number }) => {
    setFilter((prev) => ({
      ...prev,
      search: values.search,
      filters: JSON.stringify([{ sessionId: values.sessionId }]),
      page: 1,
    }));
  };

  const debounceSearch = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchListSessions({
          limit: 300,
          page: 1,
          search: value,
          sort: 'sessionName',
          order: 'ASC',
          filters: JSON.stringify([{ moduleID: moduleId, classID: classId }]),
        });
      }, 500);
    },
    [timeout],
  );

  const handleChangeSearch = useCallback(
    (value: string) => {
      debounceSearch(value);
    },
    [filter?.search],
  );

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
          <Breadcrumb.Item className="font-fontFamily text-main-font-color">
            {(location.state as LocationState).moduleName}
          </Breadcrumb.Item>
        </Breadcrumb>
      </Header>

      <Content className="flex flex-col gap-y-6">
        <ClassAttendanceCustomFilter
          form={form}
          searchResults={searchResults}
          keyResult="searchCourses"
          handleChangeSearch={handleChangeSearch}
          onFinish={onFinish}
          handleReset={handleReset}
          moduleId={Number(moduleId)}
          redirectToListDate={redirectToListDate}
        />

        <div className="flex justify-between items-center">
          <p className="text-2xl font-fontFamily leading-9 font-bold mb-0"></p>
          <div className="flex gap-4 items-center flex-wrap">
            <p className="font-fontFamily font-bold mb-0">View Item</p>
            <SelectCustom
              color="transparent"
              value={filter.limit.toString()}
              onChange={onChangeLimit}
              options={optionsLimit}
            />
          </div>
        </div>
      </Content>

      {dataList?.total ? (
        <>
          <Table
            pagination={false}
            columns={columns}
            dataSource={dataList?.records}
            className="bg-transparent table-component cursor-pointer"
            rowKey="id"
            onRow={onRow}
          />
          <div className="flex justify-between items-center my-4 footer-course-sp sm:gap-3">
            <span className="font-fontFamily text-sm text-main-font-color bottom-8">
              {startPageSize} - {endPageSize} of {dataList?.total}
            </span>
            <PaginationCustom
              total={dataList?.total}
              pageSize={Number(filter.limit)}
              onChange={(page) => {
                setFilter((prev) => ({ ...prev, page }));
              }}
              current={filter.page}
              onLastPage={() => {
                setFilter((prev) => ({
                  ...prev,
                  page: Math.ceil(Number(dataList?.total) / Number(filter.limit)),
                }));
              }}
              onFirstPage={() => {
                setFilter((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
        </>
      ) : (
        <SearchNotFound isBackgroundWhite text={filter.search} />
      )}
    </Layout>
  );
};

export default ClassAttendanceSession;
