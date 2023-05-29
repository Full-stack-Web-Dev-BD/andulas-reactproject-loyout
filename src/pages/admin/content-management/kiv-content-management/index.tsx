import { Dropdown, Form, Input, Layout, TablePaginationConfig } from 'antd';
import { getListRoles } from 'api/access_control';
import images from 'assets/images';
import ButtonCustom from 'components/Button';
import Loading from 'components/Loading';
import FilterCard from 'components/SearchBar/FilterCard';
import SelectCustom from 'components/Select';
import CustomTooltip from 'components/Tooltip';
import { ORDER, ROUTES, TopicType } from 'constants/index';
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import TableCustomContent from '../component/Table';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import { searchTopics } from 'api/topic';
import moment from 'moment';
import { getListCategories } from 'api/courses';

const optionsLimit = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '30', value: '30' },
];

const fakeDataCate = [
  { id: 1, name: 'Session 1', updatedAt: '12/12/2021' },
  { id: 2, name: 'Session 2', updatedAt: '12/12/2021' },
  { id: 3, name: 'Session 3', updatedAt: '12/12/2021' },
];

const fakeDataTopic = [
  { id: 1, name: 'Session 1', updatedAt: '12/12/2021' },
  { id: 2, name: 'Session 2', updatedAt: '12/12/2021' },
  { id: 3, name: 'Session 3', updatedAt: '12/12/2021' },
];

export interface IContentTopicItem {
  id: number;
  createdAt?: string;
  topicName?: string;
  updatedAt?: string;
}

export interface IContentCateItem {
  id: number;
  createdAt?: string;
  categoryName?: string;
  updatedAt?: string;
}

enum SORT {
  TOPIC = 'topicName',
  QUANTITY = 'moduleQuantity ',
}

const { Header, Content } = Layout;

const ContentManagement = () => {
  const [form] = Form.useForm();

  const history = useNavigate();

  const keySearch = Form.useWatch('search', form);

  const [current, setCurrent] = useState(1);

  const [visible, setVisible] = useState(false);

  const [filter, setFilter] = useState<string>('');

  const [filters, setFilters] = useState({});

  const [order, setOrder] = useState<string>(ORDER.ASC);

  const [limitItem, setLimitItem] = useState<string>('5');

  const [searchValue, setSearchValue] = useState<string>('');

  const [searchResults, setSearchResults] = useState<Array<{ id: number; roleName: string }>>([]);

  const [listTopics, setListTopics] = useState<IContentTopicItem[]>([]);

  const [listCategories, setListCategories] = useState<IContentCateItem[]>([]);

  const [paginationTopic, setPaginationTopic] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    total: listTopics?.length,
  });

  const [paginationCate, setPaginationCate] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    total: listCategories?.length,
  });

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

  const pageSizeTopic = useMemo(() => {
    return Math.ceil(Number(paginationTopic.total) / Number(paginationTopic.pageSize));
  }, [paginationTopic]);

  const pageSizeCate = useMemo(() => {
    return Math.ceil(Number(paginationCate.total) / Number(paginationCate.pageSize));
  }, [paginationCate]);

  const onChangeLimitItem = useCallback(
    (value: string) => {
      setLimitItem(value);
    },
    [current],
  );

  const columns = [
    {
      fixed: true,
      render: (text: string, record: IContentTopicItem) => {
        return (
          <div>
            <CustomTooltip title={record.topicName}>
              <div className="custom-text-ellipsis">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 3C8 2.44772 8.44772 2 9 2H15C15.5523 2 16 2.44772 16 3H18C19.1046 3 20 3.89543 20 5V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V5C4 3.89543 4.89543 3 6 3H8ZM8 5H6V20H18V5H16V6C16 6.55228 15.5523 7 15 7H9C8.44772 7 8 6.55228 8 6V5ZM14 4H10V5H14V4Z"
                    fill="#32302D"
                  />
                </svg>
              </div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      fixed: true,
      render: (text: string, record: IContentTopicItem) => {
        return (
          <div>
            <CustomTooltip title={record.topicName}>
              <div className="custom-text-ellipsis">{record.topicName}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Update',
      dataIndex: 'updatedAt',
      fixed: true,
      render: (text: string, record: IContentTopicItem) => {
        return (
          <div>
            <CustomTooltip title={record.topicName}>
              <div className="custom-text-ellipsis">
                {record.updatedAt &&
                  `Last updated on: ${moment(record.updatedAt).format('MM/DD/YYYY')}`}
              </div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      fixed: true,
      width: 100,
      render: (text: string, record: IContentTopicItem) => {
        return (
          <div className="flex">
            <div
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <CustomTooltip title="Edit">
                <EditSVG className="icon-hover" />
              </CustomTooltip>
            </div>
            <div
              className="cursor-pointer ml-5"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <CustomTooltip title="Delete">
                <TrashSVG className="icon-hover" />
              </CustomTooltip>
            </div>
          </div>
        );
      },
    },
  ];

  const columnsCate = [
    {
      fixed: true,
      render: (text: string, record: IContentCateItem) => {
        return (
          <div>
            <CustomTooltip title={record.categoryName}>
              <div className="custom-text-ellipsis">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 3C8 2.44772 8.44772 2 9 2H15C15.5523 2 16 2.44772 16 3H18C19.1046 3 20 3.89543 20 5V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V5C4 3.89543 4.89543 3 6 3H8ZM8 5H6V20H18V5H16V6C16 6.55228 15.5523 7 15 7H9C8.44772 7 8 6.55228 8 6V5ZM14 4H10V5H14V4Z"
                    fill="#32302D"
                  />
                </svg>
              </div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      fixed: true,
      render: (text: string, record: IContentCateItem) => {
        return (
          <div>
            <CustomTooltip title={record.categoryName}>
              <div className="custom-text-ellipsis">{record.categoryName}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Update',
      dataIndex: 'updatedAt',
      fixed: true,
      render: (text: string, record: IContentCateItem) => {
        return (
          <div>
            <CustomTooltip title={record.categoryName}>
              <div className="custom-text-ellipsis">
                {record.updatedAt &&
                  `Last updated on: ${moment(record.updatedAt).format('MM/DD/YYYY')}`}
              </div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      fixed: true,
      width: 100,
      render: (text: string, record: IContentCateItem) => {
        return (
          <div className="flex">
            <div
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <CustomTooltip title="Edit">
                <EditSVG className="icon-hover" />
              </CustomTooltip>
            </div>
            <div
              className="cursor-pointer ml-5"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <CustomTooltip title="Delete">
                <TrashSVG className="icon-hover" />
              </CustomTooltip>
            </div>
          </div>
        );
      },
    },
  ];

  const { mutate: getTopics, isLoading: isLoadingTopic } = useMutation('getTopics', searchTopics, {
    onSuccess: async ({
      data: topics,
    }: {
      data: { records: IContentTopicItem[]; total: number; page: number; limit: number };
    }) => {
      if (topics?.records?.length > 0) {
        const topicsData = await Promise.all(
          topics.records.map(async (item: IContentTopicItem) => {
            return {
              id: Number(item.id),
              key: item.id.toString(),
              topicName: item.topicName,
              updatedAt: item.updatedAt,
            };
          }),
        );
        setListTopics(topicsData);
        setPaginationTopic({
          ...paginationTopic,
          current: topics.page,
          pageSize: Number(topics.limit),
          total: topics?.total || 0,
        });
        return;
      }
      setListTopics([]);
    },
  });

  const { mutate: getCategories, isLoading: isLoadingCate } = useMutation(
    'getListCategories',
    getListCategories,
    {
      onSuccess: async ({
        data: cates,
      }: {
        data: { listCategories: IContentCateItem[]; total: number; page: number; limit: number };
      }) => {
        if (cates?.listCategories?.length > 0) {
          const topicsData = await Promise.all(
            cates.listCategories.map(async (item: IContentCateItem) => {
              return {
                id: Number(item.id),
                key: item.id.toString(),
                categoryName: item.categoryName,
                updatedAt: item.updatedAt,
              };
            }),
          );
          setListCategories(topicsData);
          setPaginationCate({
            ...paginationCate,
            current: cates.page,
            pageSize: Number(cates.limit),
            total: cates?.total || 0,
          });
          return;
        }
        setListCategories([]);
      },
    },
  );

  const renderOrder = useCallback(() => {
    switch (order) {
      case ORDER.ASC:
        return ORDER.ASC;
      case ORDER.DESC:
        return ORDER.DESC;
      case ORDER.QUANTITY_DESC:
        return ORDER.DESC;
      case ORDER.QUANTITY_ASC:
        return ORDER.ASC;
      default:
        return '';
    }
  }, [order]);

  // const renderSort = useCallback(() => {
  //     switch (order) {
  //         case ORDER.ASC:
  //             return SORT.TOPIC;
  //         case ORDER.DESC:
  //             return SORT.TOPIC;
  //         case ORDER.QUANTITY_DESC:
  //             return SORT.QUANTITY;
  //         case ORDER.QUANTITY_ASC:
  //             return SORT.QUANTITY;
  //         default:
  //             return '';
  //     }
  // }, [order, SORT]);

  const handleGetListTopics = useCallback(
    (page?: number) => {
      getTopics({
        limit: Number(limitItem),
        page: page ? page : Number(paginationTopic.current),
        search: searchValue,
        filters: JSON.stringify([
          Object.fromEntries(
            Object.entries({ ...filters, topicType: TopicType.CONTENT_MANAGEMENT }).filter(
              ([, v]) => (v as string)?.toString() !== '',
            ),
          ),
        ]),
      });
    },
    [limitItem, paginationTopic.current, searchValue, renderOrder, filters],
  );

  useEffect(() => {
    getTopics({
      limit: Number(limitItem),
      page: Number(paginationTopic.current),
      search: searchValue,
      filters: JSON.stringify([
        Object.fromEntries(
          Object.entries({ ...filters, topicType: TopicType.CONTENT_MANAGEMENT }).filter(
            ([, v]) => (v as string)?.toString() !== '',
          ),
        ),
      ]),
    });
  }, [limitItem, paginationTopic.current, searchValue, order, filters]);

  useEffect(() => {
    getCategories({
      limit: Number(limitItem),
      page: Number(paginationCate.current),
      search: searchValue,
      filters: JSON.stringify([
        Object.fromEntries(
          Object.entries({ ...filters, topicType: TopicType.CONTENT_MANAGEMENT }).filter(
            ([, v]) => (v as string)?.toString() !== '',
          ),
        ),
      ]),
    });
  }, [limitItem, paginationCate.current, searchValue, order, filters]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <Header className="flex justify-between items-center bg-transparent px-0">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0 custom-font-header">
          Content Management
        </p>

        <ButtonCustom
          onClick={() => {
            setVisible(true);
            history(`${ROUTES.content_management}/new-session`);
          }}
          color="orange"
        >
          New Content
        </ButtonCustom>
      </Header>
      <Content className="flex flex-col gap-y-6">
        <div className="filter-card">
          <Form className="w-full" name="basic" autoComplete="off" onFinish={() => {}} form={form}>
            <div className="flex gap-4">
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
                    onChange={(value: ChangeEvent<HTMLInputElement>) => {}}
                  />
                </Form.Item>
              </Dropdown>

              <Form.Item className="mb-0">
                <ButtonCustom className="h-12" htmlType="submit" color="orange">
                  Search
                </ButtonCustom>
              </Form.Item>
            </div>
          </Form>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-2xl font-fontFamily leading-9 font-bold mb-0">
            {searchValue ? 'Search results' : ''}
          </p>
          <div className="flex gap-4 items-center flex-wrap">
            <p className="font-fontFamily font-bold mb-0">Filter</p>
            <SelectCustom
              placeholder="All"
              color="transparent"
              className="min-w-[120px]"
              value={filter}
              onChange={() => {}}
              options={[]}
            />
            <p className="font-fontFamily font-bold mb-0">View Item</p>
            <SelectCustom
              color="transparent"
              value={limitItem}
              onChange={onChangeLimitItem}
              options={optionsLimit}
            />
          </div>
        </div>
      </Content>

      <Loading isLoading={false}>
        <div className="mb-10">
          <TableCustomContent
            title="Category"
            columns={columnsCate}
            data={listCategories}
            isLoading={isLoadingCate}
            pagination={paginationCate}
            handleTableChange={() => {}}
            onChangeSelect={() => {}}
            onChangePagination={(page) => {
              setPaginationCate({ ...paginationCate, current: Number(page) });
            }}
            onRow={(record) => ({
              onClick: () => {},
            })}
            searchNotFound={
              listCategories?.length > 0 ? undefined : (
                <SearchNotFound isBackgroundWhite text={searchValue} />
              )
            }
            onLastPage={() => {
              setPaginationCate({
                ...paginationCate,
                current: pageSizeCate,
              });
            }}
            onFirstPage={() => {
              setPaginationCate({ ...paginationCate, current: 1 });
            }}
            viewItem={{
              onChange: () => {},
              value: String(limitItem),
            }}
          />

          <TableCustomContent
            title="Topic"
            columns={columns}
            data={listTopics}
            isLoading={isLoadingTopic}
            pagination={paginationTopic}
            handleTableChange={() => {}}
            onChangeSelect={() => {}}
            onChangePagination={(page) => {
              setPaginationTopic({ ...paginationTopic, current: Number(page) });
            }}
            onRow={(record) => ({
              onClick: () => {},
            })}
            searchNotFound={
              listTopics?.length > 0 ? undefined : (
                <SearchNotFound isBackgroundWhite text={searchValue} />
              )
            }
            onLastPage={() => {
              setPaginationTopic({
                ...paginationTopic,
                current: pageSizeTopic,
              });
            }}
            onFirstPage={() => {
              setPaginationTopic({ ...paginationTopic, current: 1 });
            }}
            viewItem={{
              onChange: () => {},
              value: String(limitItem),
            }}
          />
        </div>
      </Loading>
    </Layout>
  );
};

export default ContentManagement;
