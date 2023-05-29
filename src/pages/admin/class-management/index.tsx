import { Form, Layout } from 'antd';
import { getAllCourses, IParamsSearch } from 'api/courses';
import Loading from 'components/Loading';
import PaginationCustom from 'components/Pagination';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import SelectCustom from 'components/Select';
import { IListCourse } from 'constants/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import CourseItem from './component/CourseItem';
import ClassFilter from './component/Filter';

const { Header, Content } = Layout;

const optionsLimit = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '30', value: '30' },
];

const ClassManagement = () => {
  const [form] = Form.useForm();
  const [dataList, setDataList] = useState<IListCourse>();
  const [searchResults, setSearchResults] = useState<
    Array<{ id?: number | string; courseName?: string }>
  >([]);
  const [filter, setFilter] = useState<IParamsSearch>({
    page: 1,
    limit: 5,
    sort: 'courseName',
    order: 'ASC',
    search: '',
  });

  const timeout: any = useRef(null);

  const { mutate: searchCourses } = useMutation('searchCourses', getAllCourses, {
    onSuccess: ({ data }: { data: IListCourse }) => {
      const newData = data.listCourses.map((item) => {
        return {
          id: item.id,
          courseName: item.courseName,
        };
      });

      setSearchResults(newData);
    },
  });

  const { mutate: getCourses, isLoading } = useMutation('getAllCourses', getAllCourses, {
    onSuccess: ({ data }: { data: IListCourse }) => {
      setDataList({
        page: data.page,
        limit: data.limit,
        sort: data.sort,
        order: data.order,
        total: data.total,
        listCourses: data.listCourses,
      });
    },
  });

  useEffect(() => {
    getCourses(filter);
  }, [filter]);

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

  const debounceSearch = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchCourses({ search: value, page: 1, limit: 10, order: 'DESC' });
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

  const onFinish = (values: { search: string; courseId?: string | number }) => {
    setFilter((prev) => ({
      ...prev,
      search: values.search,
      filters: JSON.stringify([{ id: values.courseId }]),
      page: 1,
    }));
  };

  const handleReset = () => {
    setFilter((prev) => ({ ...prev, search: '', filters: undefined }));
    searchCourses({ search: '', page: 1, limit: 10, order: 'DESC' });
  };

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <Header className="flex justify-between items-center bg-transparent px-0 h-auto">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
          Class Management
        </p>
      </Header>

      <Content className="flex flex-col gap-y-6">
        <ClassFilter
          form={form}
          searchResults={searchResults}
          keyResult="searchCourses"
          handleChangeSearch={handleChangeSearch}
          onFinish={onFinish}
          handleReset={handleReset}
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

      <Loading isLoading={isLoading}>
        <CourseItem courses={dataList?.listCourses || []} />
      </Loading>

      {dataList?.total ? (
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
      ) : (
        <SearchNotFound isBackgroundWhite text={filter.search} />
      )}
    </Layout>
  );
};

export default ClassManagement;
