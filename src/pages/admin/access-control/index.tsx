import { getListRoles, IPramGetRole, deleteRole } from 'api/access_control';
import { getAllTemplate } from 'api/theme';
import { Dropdown, Form, Input, Layout, Row, Col } from 'antd';
import images from 'assets/images';
import ButtonCustom from 'components/Button';
import Loading from 'components/Loading';
import PaginationCustom from 'components/Pagination';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import SelectCustom from 'components/Select';
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
import CardItem from './component/CardItem';
import ModalCreateNewRole from './component/ModalCreateNewRole';
import ModalWarning from './component/ModalWarning';

const { Header, Content } = Layout;

const optionsLimit = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '30', value: '30' },
];

interface IOptionsFilter {
  label?: string;
  value?: string;
}

const initOptionsFilter = [{ lable: 'All roles', value: 'All roles' }];

const AccessControl = () => {
  const [form] = Form.useForm();
  const history = useNavigate();
  const timeout: any = useRef(null);
  const [limit, setLimit] = useState<string>('5');
  const [filter, setFilter] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [visible, setVisible] = useState(false);
  const [dataList, setDataList] = useState<IPramGetRole>({ listRoles: [] });
  const [searchResults, setSearchResults] = useState<Array<{ id: number; roleName: string }>>([]);
  const [current, setCurrent] = useState(1);
  const [message, setMessage] = useState('');
  const [isShowWarning, setIsShowWarning] = useState<boolean>(false);
  const [optionsFilter, setOptionsFilter] = useState<IOptionsFilter[]>(initOptionsFilter);
  const keySearch = Form.useWatch('search', form);
  const { mutate: mutateRoleTypes } = useMutation('getAllTemplate', getAllTemplate, {
    onSuccess: ({ data }) => {
      const templates = data.templates;
      setOptionsFilter([
        ...initOptionsFilter,
        ...templates
          .filter(
            (template: { templateName: string; id: number | string }) =>
              template.templateName !== 'Student',
          )
          .map((template: { templateName: string; id: number | string }) => ({
            label: template.templateName,
            value: String(template.id),
          })),
      ]);
    },
  });

  useEffect(() => {
    mutateRoleTypes();
  }, []);

  const { mutate: mutateDataList, isLoading } = useMutation('getListRoles', getListRoles, {
    onSuccess: (data) => {
      const result = data?.data;
      setDataList(result);
    },
  });

  const { mutate: searchRole } = useMutation('searchRole', getListRoles, {
    onSuccess: (data) => {
      const result = data?.data?.listRoles;
      setSearchResults(result);
    },
  });

  const { mutate: mutateDeleteRole } = useMutation('deleteRole', deleteRole, {
    onSuccess: () => {
      setVisible(false);
      mutateDataList({ limit: Number(limit), page: current, search: searchValue });
    },
    onError: (error: { response: { data: { message: string }; status: number } }) => {
      const response = error.response;
      if (response.status === 400) {
        setMessage(response.data.message);
        setIsShowWarning(true);
      }
    },
  });

  const onChangeLimit = useCallback(
    (value: string) => {
      const total = dataList.total;
      const maxPage = Math.ceil(Number(total) / Number(value));
      setLimit(value);
      if (current > maxPage) setCurrent(maxPage);
      else setCurrent(current);
    },
    [current, dataList.total],
  );

  const onChangeFilter = useCallback(
    (value: string) => {
      setCurrent(1);
      setFilter(value);
      mutateDataList({ limit: Number(limit), page: 1, search: searchValue, filter: value });
    },
    [searchValue, current, limit],
  );

  const handleSearch = useCallback(
    ({ search }: { search: string }) => {
      setSearchValue(search);
      setCurrent(1);
      mutateDataList({ limit: Number(limit), page: current, search, filter });
    },
    [current, limit, filter],
  );

  const handleDelete = (id: number) => {
    mutateDeleteRole({ id: id });
  };

  useEffect(() => {
    mutateDataList({ limit: Number(limit), page: current, search: searchValue, filter });
  }, [current, limit]);

  const debounceSetSearchFor = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchRole({ limit: Number(10), page: 1, search: value });
      }, 500);
    },
    [limit, timeout],
  );

  const handleChangeSearch = useCallback((value: ChangeEvent<HTMLInputElement>) => {
    debounceSetSearchFor(value.target.value);
  }, []);

  const renderModalCreateNewRole = useCallback(() => {
    return <ModalCreateNewRole visible={visible} onCancel={() => setVisible(false)} />;
  }, [visible]);

  const handleResetData = useCallback(() => {
    mutateDataList({ limit: Number(limit), page: 1, search: '', filter: '' });
    form.setFieldsValue({ search: '' });
    setSearchValue('');
    setFilter('all');
    setLimit('5');
  }, [limit]);

  const searchResult = useMemo(
    () => (
      <>
        {keySearch ? (
          <div className="bg-white rounded-2xl p-4 min-h-[100px]">
            {searchResults?.length > 0 ? (
              searchResults?.map((role: { id: number; roleName: string }) => (
                <div
                  className="py-2 font-fontFamily font-normal cursor-pointer"
                  onClick={() => history(`/access-control/${role.id}`)}
                  key={role.id}
                >
                  {role.roleName}
                </div>
              ))
            ) : keySearch ? (
              <div className="text-center font-fontFamily font-normal pt-4 word-break">
                No results found for “{keySearch}”
              </div>
            ) : null}
          </div>
        ) : (
          <div />
        )}
      </>
    ),
    [searchResults, keySearch],
  ) as ReactElement<string>;

  const pageSize = useMemo(() => {
    return Math.ceil(Number(dataList.total) / Number(limit));
  }, [dataList]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <Row className="flex justify-between items-center bg-transparent px-0 ">
        <Col className="mb-2 mr-2">
          <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0 custom-font-header">
            Access Control
          </p>
        </Col>
        <Col className="mb-2">
          <ButtonCustom onClick={() => setVisible(true)} color="orange">
            Create new role
          </ButtonCustom>
        </Col>
      </Row>
      <Content className="flex flex-col gap-y-6">
        <div className="filter-card">
          <Form
            className="w-full"
            name="basic"
            autoComplete="off"
            onFinish={handleSearch}
            form={form}
          >
            <Row className="flex gap-4 flex-wrap ">
              <Col className="w-[calc(70%_-_0.75rem)] sm:w-full">
                <Dropdown
                  trigger={['click']}
                  overlay={searchResult}
                  placement="bottomRight"
                  className="w-full h-full"
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
              </Col>
              <ButtonCustom
                className="h-12 w-[calc(15%_-_0.75rem)] min-w-fit  "
                htmlType="submit"
                color="orange"
              >
                Search
              </ButtonCustom>
              <ButtonCustom
                onClick={handleResetData}
                className="h-12 w-[calc(15%_-_0.75rem)] min-w-fit"
                color="outline"
              >
                Reset
              </ButtonCustom>
            </Row>
          </Form>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-2xl font-fontFamily leading-9 font-bold mb-0">
            {searchValue ? 'Search results' : ''}
          </p>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="filter-item">
              <p className="font-fontFamily font-bold mb-0">Filter</p>
              <SelectCustom
                placeholder="All roles"
                color="transparent"
                className="min-w-[120px] min-w-270"
                value={filter}
                onChange={onChangeFilter}
                options={optionsFilter}
              />
            </div>
            <div className="filter-item">
              <p className="font-fontFamily font-bold mb-0">View Item</p>
              <SelectCustom
                color="transparent"
                value={limit}
                onChange={onChangeLimit}
                options={optionsLimit}
              />
            </div>
          </div>
        </div>
      </Content>
      <Loading isLoading={isLoading}>
        {dataList && dataList.listRoles.length < 1 && searchValue
          ? ''
          : dataList?.listRoles?.map(
              (
                item: {
                  id: number;
                  roleName: string;
                  accessAssetGroups: any;
                  accessControls: any;
                },
                index: React.Key | null | undefined,
              ) => (
                <CardItem
                  handleDelete={() => {
                    handleDelete(Number(item.id));
                  }}
                  key={index}
                  data={item}
                />
              ),
            )}
      </Loading>

      {dataList.total ? (
        <PaginationCustom
          total={dataList?.total}
          pageSize={Number(limit)}
          onChange={(page) => {
            setCurrent(page);
          }}
          current={current}
          onLastPage={() => {
            setCurrent(pageSize);
          }}
          onFirstPage={() => {
            setCurrent(1);
          }}
        />
      ) : (
        <SearchNotFound isBackgroundWhite text={searchValue} />
      )}
      {renderModalCreateNewRole()}
      <ModalWarning
        message={message}
        visible={isShowWarning}
        onCancel={() => setIsShowWarning(false)}
      />
    </Layout>
  );
};

export default AccessControl;
