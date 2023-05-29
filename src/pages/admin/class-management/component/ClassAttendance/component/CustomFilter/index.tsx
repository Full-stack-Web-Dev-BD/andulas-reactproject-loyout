import { Dropdown, Form, Input, Select } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { searchSessions } from 'api/session';
import images from 'assets/images';
import ButtonCustom from 'components/Button';
import { IListSession, ISession } from 'constants/types';
import { ChangeEvent, ReactElement, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';

interface IProps {
  handleReset?: () => void;
  onFinish?: (values: any) => void;
  form?: FormInstance<any>;
  handleChangeSearch?: (value: string) => void;
  searchResults?: Array<{ id?: number; sessionName?: string }>;
  keyResult?: string;
  moduleId: number;
  redirectToListDate: (id?: number, sessionName?: string) => void;
}

const ClassAttendanceCustomFilter = (props: IProps) => {
  const {
    onFinish,
    handleReset,
    handleChangeSearch,
    searchResults,
    keyResult,
    form,
    redirectToListDate,
    moduleId,
  } = props;
  const [valueSearch, setValueSearch] = useState('');
  const [sessions, setSessions] = useState<ISession[]>([]);
  const { classId } = useParams();

  const { mutate: getListSessions } = useMutation('getListSessions', searchSessions, {
    onSuccess: ({ data }: { data: IListSession }) => {
      setSessions(data.records);
    },
  });

  useEffect(() => {
    if (moduleId) {
      getListSessions({
        page: 1,
        limit: 999999,
        sort: 'sessionName',
        order: 'ASC',
        search: '',
        filters: JSON.stringify([{ moduleID: moduleId, classManagement: true, classID: classId }]),
      });
    }
  }, [moduleId]);

  const onChangeSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setValueSearch(event.target.value);
    if (handleChangeSearch instanceof Function) {
      handleChangeSearch(event.target.value);
    }
  };

  const onSearch = (id?: number, sessionName?: string) => {
    setValueSearch(sessionName || '');
    form?.setFieldsValue({ search: sessionName });

    if (redirectToListDate instanceof Function) {
      redirectToListDate(id, sessionName);
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
                  onClick={() => onSearch(result?.id as number, result.sessionName)}
                >
                  {result.sessionName}
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
          <div className="flex w-full gap-4 flex-wrap relative">
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
            <Form.Item className="mb-0 lg:w-full w-[20%]" name="sessionId">
              <Select className="w-fit-content h-full relative" placeholder="All" allowClear>
                {sessions.map((session) => (
                  <Select.Option value={session.id} key={session.id}>
                    {session.sessionName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item className="basis-[15%] mb-0 sm:basis-[30%] lg:basis-[20%] ">
              <ButtonCustom className="h-12 min-w-fit w-full" htmlType="submit" color="orange">
                Search
              </ButtonCustom>
            </Form.Item>
            <Form.Item className="mb-0 w-48-class sm:basis-[20%] lg:basis-[20%] w-[10%]">
              <ButtonCustom
                className="h-12 w-full min-w-fit"
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

export default ClassAttendanceCustomFilter;
