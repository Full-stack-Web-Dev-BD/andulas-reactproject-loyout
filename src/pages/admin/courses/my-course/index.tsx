import { Dropdown, Form, Input, Layout, Select, TablePaginationConfig } from 'antd';
import { getAllCoursesStudent } from 'api/courses';
import images from 'assets/images';
import TopicDefault from 'assets/images/topic-default.jpg';
import ButtonCustom from 'components/Button';
import CardResult from './component/CardResult';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import { ROUTES } from 'constants/index';
import React, {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import './cus-my-course-style.css';
export interface ICardItemCourse {
  id: number;
  key?: string;
  classId: number;
  title: string;
  thumbnail?: string;
}

interface ICourse {
  course_id: number;
  class_id: number;
  class_className: string;
  course_courseName: string;
  course_catalogImageUrl: string;
}

const MyCourse = () => {
  const history = useNavigate();
  const timeout: any = useRef(null);
  const [form] = Form.useForm();
  const [listCourses, setListCourses] = useState<ICardItemCourse[]>([]);
  // const [searchResult, setSearchResult] = useState<{ id: number; courseName: string }[]>([]);
  const [limit, setLimit] = useState('9');
  const [filters, setFilters] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [statusChoose, setStatus] = useState('');

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 9,
  });
  const [searchResults, setSearchResults] = useState<
    Array<{ id: number; courseName: string; className: string; classId: number }>
  >([]);
  const keySearch = Form.useWatch('search', form);

  const { mutate: searchListCourses } = useMutation('searchTopics', getAllCoursesStudent, {
    onSuccess: ({
      data: coursesData,
    }: {
      data: {
        listCourses: ICourse[];
      };
    }) => {
      const newData = coursesData.listCourses.map((item) => {
        return {
          id: item.course_id,
          courseName: item.course_courseName,
          className: item.class_className,
          classId: item.class_id,
          title: item.course_courseName + '/' + item.class_className,
        };
      });
      setSearchResults(newData);
    },
  });

  const { mutate: getCourses, isLoading } = useMutation('getCourses', getAllCoursesStudent, {
    onSuccess: async ({
      data: courses,
    }: {
      data: { listCourses: ICourse[]; total: number; page: number; limit: number };
    }) => {
      if (courses?.listCourses?.length > 0) {
        const coursesData = await Promise.all(
          courses.listCourses.map(async (item: ICourse) => {
            return {
              id: Number(item.course_id),
              key: item.class_id?.toString() + item.course_id?.toString(),
              classId: Number(item.class_id),
              title: item.course_courseName + '/' + item.class_className,
              thumbnail: item?.course_catalogImageUrl ? item?.course_catalogImageUrl : TopicDefault,
            };
          }),
        );
        setListCourses(coursesData);
        setPagination({
          ...pagination,
          current: courses.page,
          pageSize: Number(courses.limit),
          total: courses?.total || 0,
        });
        return;
      }
      setListCourses([]);
    },
  });

  // const handleGetListTopics = useCallback(
  //   (page?: number) => {
  //     getCourses({
  //       limit: Number(limit),
  //       page: page ? page : Number(pagination.current),
  //       search: searchValue,
  //       order: renderOrder(),
  //       sort: renderSort(),
  //       filters: JSON.stringify([
  //         Object.fromEntries(
  //           Object.entries({ ...filters, topicType: TopicType.HQ_LIBRARY }).filter(
  //             ([, v]) => (v as string)?.toString() !== '',
  //           ),
  //         ),
  //       ]),
  //     });
  //   },
  //   [limit, pagination.current, searchValue, renderOrder, renderSort, filters],
  // );

  const searchResult = useMemo(
    () => (
      <>
        {keySearch && keySearch !== '' ? (
          <>
            <div className="bg-white rounded-2xl p-4 min-h-[100px]">
              {searchResults?.length > 0 ? (
                searchResults?.map(
                  (role: {
                    id: number;
                    courseName: string;
                    className: string;
                    classId: number;
                  }) => (
                    <div
                      className="py-2 font-fontFamily font-normal cursor-pointer"
                      onClick={() =>
                        history(`${ROUTES.my_course}/${role.id}?classId=${role?.classId}`)
                      }
                      key={role.id}
                    >
                      {role.courseName}/{role.className}
                    </div>
                  ),
                )
              ) : keySearch ? (
                <div className="text-center font-fontFamily font-normal pt-4 word-break">
                  No results found for “{keySearch}”
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div />
        )}
      </>
    ),
    [searchResults, keySearch],
  ) as ReactElement<string>;

  // const onFinish = useCallback(
  //   (values: IFields) => {
  //     setPagination({ ...pagination, pageSize: Number(limit), current: 1 });
  //     setSearchValue(values.search);
  //     setFilters({

  //     });
  //   },
  //   [limit, pagination, order],
  // );

  const debounceSearch = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        setSearchValue(value);
        searchListCourses({
          limit: Number(limit),
          page: Number(pagination.current),
          search: value,
          filters: JSON.stringify([
            Object.fromEntries(
              Object.entries({ ...filters, status: statusChoose }).filter(
                ([, v]) => (v as string)?.toString() !== '',
              ),
            ),
          ]),
        });
      }, 100);
    },
    [limit, timeout],
  );

  const handleChangeSearch = useCallback((value: ChangeEvent<HTMLInputElement>) => {
    debounceSearch(value.target.value);
  }, []);

  const onChangeLimit = (value: string) => {
    const total = pagination.total;
    const maxPage = Math.ceil(Number(total) / Number(value));
    setLimit(String(value));
    if (Number(pagination.current) > maxPage) setPagination({ ...pagination, current: maxPage });
    else setPagination(pagination);
  };

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination]);

  const handleResetData = useCallback(() => {
    form.setFieldsValue({ search: '', status: undefined });
    setLimit('9');
    setPagination({
      current: 1,
      pageSize: 9,
    });
    setFilters({});
    setSearchValue('');
    setStatus('');
  }, [limit]);

  useEffect(() => {
    getCourses({
      limit: Number(limit),
      page: Number(pagination.current),
      order: 'DESC',
      sort: 'createdAt',
      search: searchValue,
      filters: JSON.stringify([
        Object.fromEntries(
          Object.entries({ ...filters, status: statusChoose }).filter(
            ([, v]) => (v as string)?.toString() !== '',
          ),
        ),
      ]),
    });
  }, [limit, pagination.current, filters]);

  const handleSearch = useCallback(
    ({ search, status }: { search: string; status: string }) => {
      setSearchValue(search);
      setStatus(status);
      setPagination({
        ...pagination,
        current: 1,
      });
      getCourses({
        limit: Number(limit),
        page: Number(pagination.current),
        order: 'DESC',
        sort: 'createdAt',
        search: search,
        filters: JSON.stringify([
          Object.fromEntries(
            Object.entries({ ...filters, status }).filter(
              ([, v]) => (v as string)?.toString() !== '',
            ),
          ),
        ]),
      });
    },
    [pagination, limit],
  );

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <div className="flex justify-between items-center bg-transparent px-0">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0 custom-font-header">
          My Courses
        </p>
      </div>

      <div className="filter-card">
        <Form
          className="w-full"
          name="basic"
          autoComplete="off"
          onFinish={handleSearch}
          form={form}
        >
          <div className="flex gap-4 custom-my-course">
            <Dropdown
              trigger={['click']}
              overlay={searchResult}
              placement="bottomRight"
              className="h-full w-[50%] "
            >
              <Form.Item name="search" className="flex-1 mb-0">
                <Input
                  placeholder="Search"
                  suffix={<img src={images.search} alt="search" />}
                  className="style_input_custom_login_page"
                  onChange={(value: ChangeEvent<HTMLInputElement>) => handleChangeSearch(value)}
                />
              </Form.Item>
            </Dropdown>

            <Form.Item className="w-[20%] mb-0 lg:w-full" name="status">
              <Select
                className="input-field"
                // defaultValue=""
                placeholder="Status"
                allowClear
                options={[
                  //   {
                  //     value: '',
                  //     label: 'All Courses',
                  //   },
                  {
                    value: 'Ongoing',
                    label: 'Ongoing',
                  },
                  {
                    value: 'Completed',
                    label: 'Completed',
                  },
                  {
                    value: 'Pending Withdraw',
                    label: 'Pending Withdraw',
                  },
                  {
                    value: 'Pending Transfer',
                    label: 'Pending Transfer',
                  },
                ]}
              />
            </Form.Item>

            <Form.Item className="w-[calc(15%_-_0.75rem)] min-w-fit mb-0 sm:w-[calc(50%_-_0.5rem)]">
              <ButtonCustom className="h-12 min-w-fit w-full" htmlType="submit" color="orange">
                Search
              </ButtonCustom>
            </Form.Item>
            <ButtonCustom
              onClick={handleResetData}
              isWidthFitContent
              className="h-12 sm:w-[calc(50%_-_0.5rem)]"
              color="outline"
            >
              Reset
            </ButtonCustom>
          </div>
        </Form>
      </div>
      <div className="font-bold text-2xl text-[#32302D]">
        {statusChoose && statusChoose !== '' ? statusChoose : 'All'} Courses
      </div>
      <div className="relative top-[-65px]">
        <CardResult
          onRedirect={(id, classId) => {
            history(`${ROUTES.my_course}/${id}?classId=${classId}`);
          }}
          data={listCourses}
          pagination={pagination}
          onChangePagination={(page) => {
            setPagination({ ...pagination, current: Number(page) });
          }}
          searchNotFound={
            listCourses?.length > 0 ? undefined : (
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
        />
      </div>
    </Layout>
  );
};

export default MyCourse;
