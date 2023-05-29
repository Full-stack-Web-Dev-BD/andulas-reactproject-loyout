import { Dropdown, Form, Input, Select } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { getAllCourses } from 'api/courses';
import images from 'assets/images';
import ButtonCustom from 'components/Button';
import { IListCourse, InfoType } from 'constants/types';
import { ChangeEvent, ReactElement, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';

interface IClassFilter {
  handleReset?: () => void;
  onFinish?: (values: any) => void;
  form?: FormInstance<any>;
  handleChangeSearch?: (value: string) => void;
  searchResults?: Array<{ id?: string | number; courseName?: string }>;
  keyResult?: string;
}

const ClassFilter = (props: IClassFilter) => {
  const { onFinish, handleReset, handleChangeSearch, searchResults, keyResult, form } = props;
  const [valueSearch, setValueSearch] = useState('');
  const [courses, setCourses] = useState<InfoType[]>([]);

  const { mutate: getListCourses } = useMutation('searchCourses', getAllCourses, {
    onSuccess: ({ data }: { data: IListCourse }) => {
      setCourses(data.listCourses);
    },
  });

  useEffect(() => {
    getListCourses({ search: '', sort: 'courseName', limit: 300, page: 1, order: 'ASC' });
  }, []);

  const onChangeSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setValueSearch(event.target.value);
    if (handleChangeSearch instanceof Function) {
      handleChangeSearch(event.target.value);
    }
  };

  const onSearch = (courseId?: number, courseName?: string) => {
    setValueSearch(courseName || '');
    form?.setFieldsValue({ search: courseName });

    if (onFinish instanceof Function) {
      onFinish({ courseId });
    }
  };

  const searchResult = useMemo(
    () => (
      <>
        {valueSearch && keyResult ? (
          <div className="bg-white rounded-2xl p-4 min-h-[100px] w-full">
            {searchResults && searchResults?.length > 0 ? (
              searchResults?.map((result) => (
                <div
                  className="py-2 font-fontFamily font-normal cursor-pointer text-truncate"
                  key={result.id}
                  onClick={() => onSearch(result?.id as number, result.courseName)}
                >
                  {result.courseName}
                </div>
              ))
            ) : valueSearch ? (
              <div className="text-center font-fontFamily font-normal pt-4 word-break">
                No results found for “{valueSearch}”
              </div>
            ) : null}
          </div>
        ) : (
          <div />
        )}
      </>
    ),
    [searchResults, valueSearch, keyResult],
  ) as ReactElement<string>;

  return (
    <div className="filter-card">
      <div className="filter-content w-full">
        <Form
          form={form}
          className="w-full flex flex-wrap gap-4"
          name="basic"
          initialValues={{ layout: 'inline' }}
          autoComplete="off"
          onFinish={onFinish}
        >
          <div className="flex w-full gap-4 relative  md:flex-wrap sm:flex-wrap lg:flex-wrap ">
            <Dropdown
              trigger={['click']}
              overlay={searchResult}
              placement="bottom"
              className="w-full relative h-auto"
              getPopupContainer={(trigger: any) => trigger?.parentNode}
            >
              <div className="relative" onClick={(e) => e.preventDefault()}>
                <Form.Item name="search" className="w-full mb-0">
                  <Input
                    value={valueSearch}
                    placeholder="Search"
                    onChange={onChangeSearch}
                    suffix={<img src={images.search} alt="search" />}
                    className="style_input_custom_login_page rounded-xl"
                  />
                </Form.Item>
              </div>
            </Dropdown>
            <Form.Item className="mb-0 sm:w-full custom-width" name="courseId">
              <Select
                className="w-fit-content h-full relative "
                placeholder="All Courses"
                allowClear
              >
                {(courses || [])?.map((course) => (
                  <Select.Option value={course.id} key={course.id}>
                    {course.courseName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item className="basis-[15%] mb-0 sm:basis-[30%] lg:basis-[20%]">
              <ButtonCustom className="h-12" htmlType="submit" color="orange">
                Search
              </ButtonCustom>
            </Form.Item>
            <Form.Item className="mb-0 w-48-class sm:basis-[30%] lg:basis-[20%]">
              <ButtonCustom
                className="h-12 xl-min:min-w-fit"
                htmlType="button"
                color="outline"
                onClick={() => {
                  if (handleReset instanceof Function) {
                    handleReset();
                  }
                  form?.resetFields();
                  setValueSearch('');
                }}
              >
                Reset
              </ButtonCustom>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ClassFilter;
