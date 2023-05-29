import { Breadcrumb, Form, Layout, Table } from 'antd';
import { IParamsSearch } from 'api/courses';
import { getModuleByClass } from 'api/module';
import PaginationCustom from 'components/Pagination';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import SelectCustom from 'components/Select';
import { ROUTES } from 'constants/constants';
import { IListModule, IModule } from 'constants/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import ClassAttendanceFilter from './component/Filter';
import { ReactComponent as SortSVG } from 'assets/images/sort.svg';

const { Header, Content } = Layout;

const optionsLimit = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '30', value: '30' },
];

const ClassAttendance = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { classId } = useParams();
  const [dataList, setDataList] = useState<IListModule>();
  const [filter, setFilter] = useState<IParamsSearch>({
    page: 1,
    limit: 5,
    sort: 'moduleName',
    order: 'ASC',
    search: '',
  });
  const [searchResults, setSearchResults] = useState<IModule[]>([]);
  const timeout: any = useRef(null);

  const { mutate: getModules } = useMutation('getModuleByClass', getModuleByClass, {
    onSuccess: ({ data }: { data: IListModule }) => {
      setDataList({
        page: data.page,
        limit: data.limit,
        sort: data.sort,
        order: data.order,
        total: data.total,
        listModules: data.listModules,
        students: data.students,
        classDetail: data.classDetail,
      });
    },
  });

  const { mutate: searchModules } = useMutation('searchModuleByClass', getModuleByClass, {
    onSuccess: ({ data }: { data: IListModule }) => {
      setSearchResults(data.listModules);
    },
  });

  useEffect(() => {
    if (classId) {
      getModules({ ...filter, id: +classId });
    }
  }, [classId, filter]);

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
          onClick={() => {
            setFilter({
              ...filter,
              order: filter.order === 'ASC' ? 'DESC' : 'ASC',
            });
          }}
        >
          Module <SortSVG />
        </span>
      ),
      dataIndex: 'moduleName',
      key: 'moduleName',
      render: (value: string, record: any) => {
        const codeMudule = record?.moduleCode && record?.moduleCode !== "" ? `(${record?.moduleCode})` : ""
        return(
          <span className="font-fontFamily font-semibold">{value + " " + codeMudule}</span>
        )     
      },
      width: '80%',
    },
    {
      title: <span className="font-fontFamily">No. of Students</span>,
      dataIndex: 'students',
      key: 'students',
      render: (value: string, record: IListModule) => (
        <span className="font-fontFamily font-semibold text-left">{dataList?.students || 0}</span>
      ),
    },
  ];

  const debounceSearch = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchModules({
          search: value,
          page: 1,
          limit: 300,
          sort: 'moduleName',
          order: 'ASC',
          id: Number(classId),
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

  const handleReset = () => {
    setFilter((prev) => ({ ...prev, search: '', filters: undefined }));
    searchModules({
      search: '',
      page: 1,
      limit: 300,
      sort: 'moduleName',
      order: 'ASC',
      id: Number(classId),
    });
  };

  const onFinish = (values: { search: string; moduleId?: string | number }) => {
    setFilter((prev) => ({
      ...prev,
      search: values.search,
      filters: JSON.stringify([{ id: values.moduleId }]),
      page: 1,
    }));
  };

  const redirectToListSession = (id?: number, moduleName?: string) => {
    navigate(`${ROUTES.class_management}/${classId}${ROUTES.attendance}/module/${id}`, {
      state: {
        moduleName,
        className: dataList?.classDetail?.className,
      },
    });
  };

  const onRow = (record?: IModule, rowIndex?: number) => {
    const codeMudule = record?.moduleCode && record?.moduleCode !== "" ? `(${record?.moduleCode})` : ""
    return {
      onClick: () => redirectToListSession(record?.id, record?.moduleName + " " + codeMudule),
    };
  };

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <Header className="flex justify-between items-center bg-transparent px-0 h-auto">
        <Breadcrumb className="custom-font-header text-[1.75rem] leading-9 font-bold mb-0">
          <Breadcrumb.Item
            className="cursor-pointer font-fontFamily"
            onClick={() => navigate(ROUTES.class_management)}
          >
            Class Management
          </Breadcrumb.Item>
          <Breadcrumb.Item className="font-fontFamily">
            {dataList?.classDetail?.className}
          </Breadcrumb.Item>
          <Breadcrumb.Item className="font-fontFamily text-main-font-color">
            Attendance
          </Breadcrumb.Item>
        </Breadcrumb>
      </Header>

      <Content className="flex flex-col gap-y-6">
        <ClassAttendanceFilter
          form={form}
          searchResults={searchResults}
          keyResult="searchCourses"
          handleChangeSearch={handleChangeSearch}
          onFinish={onFinish}
          handleReset={handleReset}
          classId={Number(classId)}
          redirectToListSession={redirectToListSession}
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
            dataSource={dataList?.listModules}
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

export default ClassAttendance;
