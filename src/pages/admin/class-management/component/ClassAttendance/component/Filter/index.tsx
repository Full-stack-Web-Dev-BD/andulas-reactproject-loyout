import { Dropdown, Form, Input, Select } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { getModuleByClass } from 'api/module';
import images from 'assets/images';
import ButtonCustom from 'components/Button';
import { IListModule, IModule } from 'constants/types';
import { ChangeEvent, ReactElement, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';

interface IClassAttendanceFilter {
  handleReset?: () => void;
  onFinish?: (values: any) => void;
  form?: FormInstance<any>;
  handleChangeSearch?: (value: string) => void;
  searchResults?: IModule[];
  keyResult?: string;
  classId: number;
  redirectToListSession: (id?: number, moduleName?: string) => void;
}

const ClassAttendanceFilter = (props: IClassAttendanceFilter) => {
  const {
    onFinish,
    handleReset,
    handleChangeSearch,
    searchResults,
    keyResult,
    form,
    classId,
    redirectToListSession,
  } = props;

  const [valueSearch, setValueSearch] = useState('');
  const [modules, setModules] = useState<IModule[]>([]);

  const { mutate: getModules } = useMutation('getModuleByClass', getModuleByClass, {
    onSuccess: ({ data }: { data: IListModule }) => {
      setModules(data.listModules);
    },
  });

  useEffect(() => {
    if (classId) {
      getModules({
        page: 1,
        limit: 5,
        sort: 'moduleName',
        order: 'ASC',
        search: '',
        id: classId,
      });
    }
  }, []);

  const onChangeSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setValueSearch(event.target.value);
    if (handleChangeSearch instanceof Function) {
      handleChangeSearch(event.target.value);
    }
  };

  const onSearch = (moduleId?: number, moduleName?: string) => {
    setValueSearch(moduleName || '');
    form?.setFieldsValue({ search: moduleName });

    if (redirectToListSession instanceof Function) {
      redirectToListSession(moduleId, moduleName);
    }
  };

  const searchResult = useMemo(
    () => (
      <>
        {valueSearch && keyResult ? (
          <div className="bg-white rounded-2xl p-4 min-h-[100px] w-full">
            {searchResults && searchResults?.length > 0 ? (
              searchResults?.map((result) => {
                const codeMudule =
                  result?.moduleCode && result?.moduleCode !== '' ? `(${result?.moduleCode})` : '';
                return (
                  <div
                    className="py-2 font-fontFamily font-normal cursor-pointer text-truncate"
                    key={result.id}
                    onClick={() => onSearch(result?.id as number, result.moduleName)}
                  >
                    {result.moduleName + ' ' + codeMudule}
                  </div>
                );
              })
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
          <div className="flex w-full gap-4 relative  md:flex-wrap sm:flex-wrap lg:flex-wrap">
            <Dropdown
              trigger={['click']}
              overlay={searchResult}
              placement="bottom"
              className="w-[50%] h-auto relative lg:w-full"
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
            <Form.Item className="mb-0 lg:w-full w-[20%]" name="moduleId">
              <Select
                className="w-fit-content h-full relative "
                placeholder="All modules"
                allowClear
              >
                {(modules || [])?.map((module) => {
                  const codeMudule =
                    module?.moduleCode && module?.moduleCode !== ''
                      ? `(${module?.moduleCode})`
                      : '';
                  return (
                    <Select.Option value={module.id} key={module.id}>
                      {module.moduleName + ' ' + codeMudule}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item className="basis-[15%] mb-0 sm:basis-[30%] lg:basis-[20%] ">
              <ButtonCustom className="h-12 min-w-fit w-full" htmlType="submit" color="orange">
                Search
              </ButtonCustom>
            </Form.Item>
            <Form.Item className="mb-0 w-48-class sm:basis-[20%] lg:basis-[20%] w-[10%]">
              <ButtonCustom
                className="h-12 min-w-fit w-full"
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

export default ClassAttendanceFilter;
