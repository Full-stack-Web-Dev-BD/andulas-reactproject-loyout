import { Dropdown, Form, Input, Layout, Menu, Table, Row, Col } from 'antd';
import { getListRoles } from 'api/access_control';
import images from 'assets/images';
import { ReactComponent as FolderSVG } from 'assets/images/folder.svg';
import { ReactComponent as SortSVG } from 'assets/images/sort.svg';
import { ReactComponent as TrashSVG } from 'assets/images/trash.svg';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import SelectCustom from 'components/Select';
import {
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
import './style.css';

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

const optionsFilter = [
  { lable: 'Trash Date', value: 'Trash Date' },
  { lable: 'Name', value: 'Name' },
  { lable: 'Last Modified', value: 'Last Modified' },
  { lable: 'Last Opened', value: 'Last Opened' },
];

export interface IDriveInfo {
  id: string;
  key: string;
  driveName: string;
  trashDate: string;
  size: string;
  owner: string;
}

const MyDriveTrashDrive = () => {
  const [form] = Form.useForm();
  const history = useNavigate();
  const timeout: any = useRef(null);
  const [limit, setLimit] = useState<string>('5');
  const [filter, setFilter] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [visible, setVisible] = useState(false);
  const [dataList, setDataList] = useState<IDriveInfo[]>([]);
  const [searchResults, setSearchResults] = useState<Array<{ id: number; roleName: string }>>([]);
  const [current, setCurrent] = useState(1);
  const [message, setMessage] = useState('');
  const [isShowRestore, setIsShowRestore] = useState('');
  const [isShowDelete, setIsShowDelete] = useState('');
  const [isShowDeleteAll, setIsShowDeleteAll] = useState<boolean>(false);
  //   const [optionsFilter, setOptionsFilter] = useState<IOptionsFilter[]>(initOptionsFilter);
  const keySearch = Form.useWatch('search', form);
  const [tab, setTab] = useState<number>(1);

  //   const { mutate: mutateDataList, isLoading } = useMutation('getListRoles', getListRoles, {
  //     onSuccess: (data) => {
  //       const result = data?.data;
  //       setDataList(result);
  //     },
  //   });

  const menu = (id: string) => (
    <Menu>
      <Menu.Item onClick={() => setIsShowRestore(id)}>Restore</Menu.Item>
      <Menu.Item onClick={() => setIsShowDelete(id)}>Delete Permanently</Menu.Item>
    </Menu>
  );

  const { mutate: searchRole } = useMutation('searchRole', getListRoles, {
    onSuccess: (data) => {
      const result = data?.data?.listRoles;
      setSearchResults(result);
    },
  });

  //   const { mutate: mutateDeleteRole } = useMutation('deleteRole', deleteRole, {
  //     onSuccess: () => {
  //       setVisible(false);
  //       mutateDataList({ limit: Number(limit), page: current, search: searchValue });
  //     },
  //     onError: (error: { response: { data: { message: string }; status: number } }) => {
  //       const response = error.response;
  //       if (response.status === 400) {
  //         setMessage(response.data.message);
  //         setIsShowWarning(true);
  //       }
  //     },
  //   });

  //   const onChangeFilter = useCallback(
  //     (value: string) => {
  //       setCurrent(1);
  //       setFilter(value);
  //       mutateDataList({ limit: Number(limit), page: 1, search: searchValue, filter: value });
  //     },
  //     [searchValue, current, limit],
  //   );

  //   const handleSearch = useCallback(
  //     ({ search }: { search: string }) => {
  //       setSearchValue(search);
  //       setCurrent(1);
  //       mutateDataList({ limit: Number(limit), page: current, search, filter });
  //     },
  //     [current, limit, filter],
  //   );

  //   useEffect(() => {
  //     mutateDataList({ limit: Number(limit), page: current, search: searchValue, filter });
  //   }, [current, limit]);

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

  //   const handleResetData = useCallback(() => {
  //     mutateDataList({ limit: Number(limit), page: 1, search: '', filter: '' });
  //     form.setFieldsValue({ search: '' });
  //     setSearchValue('');
  //     setFilter('all');
  //     setLimit('5');
  //   }, [limit]);

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

  const dataSource = [
    {
      id: '1',
      key: '1',
      name: 'Thiên',
      trashed_date: '10/10/2022',
      size: '10MB',
      owner: 'Khánh',
    },
    {
      id: '2',
      key: '2',
      name: 'Thiên',
      trashed_date: '10/10/2022',
      size: '10MB',
      owner: 'Khánh',
    },
  ];

  useEffect(() => {
    setDataList([
      {
        id: '1',
        key: '1',
        driveName: 'Thiên',
        trashDate: '10/10/2022',
        size: '10MB',
        owner: 'Khánh',
      },
      {
        id: '2',
        key: '2',
        driveName: 'Thiên',
        trashDate: '10/10/2022',
        size: '10MB',
        owner: 'Khánh',
      },
    ]);
  }, []);

  const columns: any = [
    {
      title: <></>,
      dataIndex: 'image',
      key: 'image',
      render: () => <FolderSVG />,
      width: '5%',
    },
    {
      title: (
        <>
          Name <SortSVG />
        </>
      ),
      dataIndex: 'driveName',
      key: 'driveName',
      width: '40%',
    },
    {
      title: (
        <>
          Trashed Date <SortSVG />
        </>
      ),
      dataIndex: 'trashDate',
      key: 'trashDate',
      width: '15%',
    },
    {
      title: (
        <>
          Size <SortSVG />
        </>
      ),
      dataIndex: 'size',
      key: 'size',
      width: '15%',
    },
    {
      title: (
        <>
          Owner <SortSVG />
        </>
      ),
      dataIndex: 'owner',
      key: 'owner',
      width: '15%',
    },
    {
      title: <></>,
      dataIndex: 'action',
      key: 'action',
      render: (text: string, record: IDriveInfo) => (
        <Dropdown overlay={menu(record.id)} trigger={['click']}>
          <a>...</a>
        </Dropdown>
      ),
      width: '10%',
    },
  ];

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <Header className="flex justify-between items-center bg-transparent px-0 header-trash">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
          Trash for Own Drive
        </p>
      </Header>
      <Content className="flex flex-col gap-y-6">
        <div className="filter-card">
          <Form
            className="w-full"
            name="basic"
            autoComplete="off"
            // onFinish={handleSearch}
            form={form}
          >
            <Row className="flex gap-4 items-center">
              <Col className="w-[calc(75%_-_0.5rem)]">
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

              <Col className="w-[calc(25%_-_0.5rem)]">
                <Form.Item className="mb-0">
                  <ButtonCustom className="h-12" htmlType="submit" color="orange">
                    Search
                  </ButtonCustom>
                </Form.Item>
              </Col>
              {/* <ButtonCustom
                onClick={handleResetData}
                isWidthFitContent
                className="h-12"
                color="outline"
              >
                Reset
              </ButtonCustom> */}
            </Row>
          </Form>
        </div>
        <div className="flex">
          <ButtonCustom
            className="w-20 h-10 rounded-3xl min-w-fit px-4"
            color={tab == 1 ? 'orange' : ''}
            onClick={() => setTab(1)}
          >
            Admin
          </ButtonCustom>
          <ButtonCustom
            className="w-20 h-10 rounded-3xl px-4 ml-4 min-w-fit"
            color={tab == 2 ? 'orange' : ''}
            onClick={() => setTab(2)}
          >
            Teacher
          </ButtonCustom>
        </div>
        {dataList && dataList?.length > 0 ? (
          <div className="">
            <Row className="flex justify-between items-center bg-white shadow-[0px 8px 32px rgba(0, 0, 0, 0.04)] rounded-3xl px-10 py-6">
              <Col className="font-normal text-lg">
                Items in trash will be permanently deleted after 90 days
              </Col>
              <Col
                className="font-bold text-2xl text-[#ED7635] cursor-pointer"
                onClick={() => setIsShowDeleteAll(true)}
              >
                Empty Trash
              </Col>
            </Row>
            <div className="cus-mt-1_25rem">
              <div className="flex justify-between items-center mt-4">
                <div className="text-lg font-semibold text-[#000000]">Today</div>
                <div className="flex gap-4 items-center flex-wrap">
                  <p className="font-fontFamily font-semibold mb-0">Filter</p>
                  <SelectCustom
                    placeholder="Select"
                    color="transparent"
                    className="min-w-[120px]"
                    value={filter}
                    // onChange={onChangeFilter}
                    options={optionsFilter}
                  />
                </div>
              </div>
              <div className="">
                {/* <Table
                  dataSource={dataSource}
                  columns={columns}
                  className="bg-transparent table-component trash-data-table"
                /> */}
                <Table
                  columns={columns}
                  dataSource={dataList}
                  className="bg-transparent table-component"
                  pagination={false}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="px-16 flex justify-between items-center bg-white shadow-[0px 8px 32px rgba(0, 0, 0, 0.04)] rounded-3xl">
            <div className="">
              <h3 className="font-bold text-2xl mb-0">Nothing in Trash</h3>
              <p className="font-normal text-lg mb-0">
                Items in trash will be permanently deleted after 90 days
              </p>
            </div>
            <TrashSVG className="mr-3" />
          </div>
        )}
      </Content>
      {isShowRestore != '' && (
        <ModalCustom
          onSubmit={() => setIsShowRestore('')}
          visible={true}
          content={`Are you sure you want to restore ${isShowRestore}?`}
          title="Restore"
          okText="Confirm"
          onCancel={() => setIsShowRestore('')}
          cancelText="Cancel"
          titleCenter
        />
      )}
      {isShowDelete != '' && (
        <ModalCustom
          onSubmit={() => setIsShowDelete('')}
          visible={true}
          content={`Are you sure you want to permanently delete ${isShowDelete}? You will not be able to restore it once confirmed.`}
          title="Delete"
          okText="Confirm"
          onCancel={() => setIsShowDelete('')}
          cancelText="Cancel"
          titleCenter
        />
      )}
      <ModalCustom
        onSubmit={() => setIsShowDeleteAll(false)}
        visible={isShowDeleteAll}
        content={`Are you sure you want to empty your trash? You will not be able to restore your folders or files once confirmed.`}
        title="Empty Trash"
        okText="Confirm"
        onCancel={() => setIsShowDeleteAll(false)}
        cancelText="Cancel"
        titleCenter
      />
    </Layout>
  );
};

export default MyDriveTrashDrive;
