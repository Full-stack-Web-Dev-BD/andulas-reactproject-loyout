import { Breadcrumb, Form, Layout } from 'antd';
import { ReactComponent as DuplicateSVG } from 'assets/icons/duplicate.svg';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import FilterCard from 'components/SearchBar/FilterCard';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom from 'components/SearchBar/Table';
import CustomTooltip from 'components/Tooltip';
import { ROUTES, Status } from 'constants/index';
import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ISessionInfo } from '../../session';

interface IFields {
  search: string;
  modules: { label: string; value: string };
  categories: { label: string; value: string };
  topics: { label: string; value: string };
}

interface IProps {
  listSession: any[];
  searchResult: { id: number; sessionName: string }[];
  limit: string;
  order: string;
  categoriesOptions: { label: string; value: string; isDisabled?: boolean }[];
  pagination: { current: number; pageSize: number; total?: number };
  topicsOptions: { label: string; value: string; isDisabled?: boolean }[];
  modulesOptions: { label: string; value: string; isDisabled?: boolean }[];
  handleSearchCategories: (val: string) => void;
  handleSearchModules?: (val: string) => void;
  handleSearchTopics?: (val: string) => void;
  handleTableChange: () => void;
  onFinish: (values: IFields) => void;
  onChangeLimit: (value: string) => void;
  onFilter: (value: string) => void;
  handleReset: () => void;
  searchValue: string;
  setSessionId: (val: number) => void;
  onChangeSelect: (selectedRowKeys: React.Key[]) => void;
  setPagination: (val: { current: number; pageSize: number; total?: number }) => void;
  selection: React.Key[];
  onChangeAction: (value: string) => void;
  handleChangeSearch: (value: string) => void;
  renderModalWarning: () => void;
  renderModalConfirm: () => void;
  renderModalDuplicateSession: () => void;
  renderModalConfirmDelete: () => void;
  setIsModalDuplicateSession: (val: boolean) => void;
  setIsModalDeleteSession: (val: boolean) => void;
  isSessionOfModule?: boolean;
  moduleName?: string;
  topicName?: string;
  redirectSessionDetail: (id: number, status: string) => void;
  isDisabledFilterField?: boolean;
  handleSearchModuleOfTopic?: (val: string | number) => void;
  topicIdFilter?: string;
  setSessionDuplicate: (val: ISessionInfo) => void;
}

export const optionsOrder = [
  { label: 'Session Name (A-Z)', value: 'ASC' },
  { label: 'Session Name (Z-A)', value: 'DESC' },
  { label: 'Status (Completed)', value: 'Complete' },
  { label: 'Status (Incomplete)', value: 'Incomplete' },
];

const SessionList = (props: IProps) => {
  const {
    listSession,
    searchResult,
    limit,
    order,
    categoriesOptions,
    pagination,
    topicsOptions,
    modulesOptions,
    handleSearchCategories,
    handleTableChange,
    onFilter,
    onFinish,
    setPagination,
    handleReset,
    onChangeSelect,
    onChangeLimit,
    setSessionId,
    searchValue,
    selection,
    onChangeAction,
    handleChangeSearch,
    renderModalDuplicateSession,
    isSessionOfModule,
    renderModalWarning,
    renderModalConfirm,
    renderModalConfirmDelete,
    setIsModalDuplicateSession,
    setIsModalDeleteSession,
    moduleName,
    topicName,
    redirectSessionDetail,
    isDisabledFilterField,
    handleSearchModuleOfTopic,
    handleSearchModules,
    handleSearchTopics,
    topicIdFilter,
    setSessionDuplicate,
  } = props;
  const history = useNavigate();
  const { topicId, moduleId } = useParams();
  const [form] = Form.useForm();

  const optionsFilter = useMemo(() => {
    return [
      {
        name: 'categories',
        className: 'w-[calc(28.3%_-_0.8rem)] cus__width__topic mb-0',
        placeholder: 'All Categories',
        type: 'select-search',
        options: categoriesOptions,
        handleSearch: handleSearchCategories,
      },
      {
        name: 'topics',
        className: 'w-[calc(28.3%_-_0.8rem)] cus__width__topic mb-0',
        placeholder: 'All Topics',
        type: 'select-search',
        options: topicsOptions,
        disabled: isDisabledFilterField,
        handleSearch: handleSearchTopics,
        valueDefaultSelectSearch: {
          default: !!((topicName && topicId) || topicIdFilter),
          fieldsValue: { label: topicName, value: String(topicId) || topicIdFilter },
        },
      },
      {
        name: 'modules',
        className: 'w-[calc(28.3%_-_0.8rem)] cus__width__topic mb-0',
        placeholder: 'All Modules',
        type: 'select-search',
        options: modulesOptions,
        disabled: isDisabledFilterField,
        handleSearch: handleSearchModules,
        valueDefaultSelectSearch: {
          default: !!(moduleName && moduleName),
          fieldsValue: { label: moduleName, value: String(moduleName) },
        },
      },
    ];
  }, [
    categoriesOptions,
    topicsOptions,
    modulesOptions,
    isDisabledFilterField,
    moduleName,
    topicName,
    moduleId,
    topicId,
    topicIdFilter,
  ]);

  const columns = [
    {
      title: 'Session Name',
      dataIndex: 'sessionName',
      render: (text: string, record: ISessionInfo) => {
        return (
          <div>
            <CustomTooltip title={record.sessionName}>
              <div className="custom-text-ellipsis">{record.sessionName}</div>
            </CustomTooltip>
          </div>
        );
      },
    },

    {
      title: 'Category',
      dataIndex: 'categoryName',
      render: (text: string, record: ISessionInfo) => {
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
      title: 'Topic',
      dataIndex: 'topicName',
      render: (text: string, record: ISessionInfo) => {
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
      title: 'Module',
      dataIndex: 'moduleName',
      render: (text: string, record: ISessionInfo) => {
        return (
          <div>
            <CustomTooltip title={record.moduleName}>
              <div className="custom-text-ellipsis">{record.moduleName}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text: string, record: ISessionInfo) => {
        return (
          <div
            className={`${
              record.status === Status.COMPLETED || record.status === Status.COMPLETED.toLowerCase()
                ? 'bg-[#E6F2F2] text-[#006262]'
                : 'bg-[#FCECD9] text-[#BE5E2A]'
            } px-[5px] py-[4px] rounded-2xl text-xs uppercase text-center`}
          >
            {record?.status?.toLocaleUpperCase()}
          </div>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      fixed: true,
      width: 100,
      render: (text: string, record: ISessionInfo) => {
        return (
          <div
            className="cursor-pointer flex gap-x-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalDuplicateSession(true);
              setSessionId(Number(record.id));
              setSessionDuplicate(record);
            }}
          >
            <CustomTooltip title="Duplicate">
              <DuplicateSVG className="icon-hover" />
            </CustomTooltip>
            <span className="font-fontFamily text-sm font-semibold">Duplicate</span>
          </div>
        );
      },
    },
  ];

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination]);

  return (
    <>
      <Layout className="bg-transparent flex flex-col gap-y-6">
        <div className="flex justify-between items-center bg-transparent px-0">
          <Breadcrumb
            style={{
              color: '#AEA8A5',
              fontWeight: '700',
              lineHeight: '36px',
              fontSize: '28px',
            }}
            className="font-fontFamily text-main-font-color custom-font-header"
          >
            <Breadcrumb.Item
              className="opacity-50 cursor-pointer"
              onClick={() => {
                history(ROUTES.community_library);
              }}
            >
              Community Library...
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="opacity-50 cursor-pointer"
              onClick={() => {
                history(ROUTES.community_library + `/topic/${topicId}/module`);
              }}
            >
              {topicName}
            </Breadcrumb.Item>
            <Breadcrumb.Item className="font-fontFamily text-main-font-color">
              {moduleName}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <FilterCard
          handleChangeSearch={handleChangeSearch}
          onFinish={onFinish}
          form={form}
          fields={optionsFilter}
          handleReset={handleReset}
          searchResults={searchResult}
          keyResult="sessionName"
          handleSearchDependency={handleSearchModuleOfTopic}
          fieldNameReset={!isSessionOfModule ? 'modules' : ''}
          dependencyFiled={!isSessionOfModule ? 'topics' : ''}
          pathSearchDetail={`${ROUTES.community_library}/${topicId}/module/${moduleId}/session`}
          pathEndPointSearchDetail={'/overview'}
        />

        <TableCustom
          columns={columns}
          data={listSession}
          pagination={pagination}
          hideColSelection
          handleTableChange={handleTableChange}
          onChangeSelect={onChangeSelect}
          onChangePagination={(page) => {
            setPagination({ ...pagination, current: Number(page) });
          }}
          onRow={(record) => ({
            onClick: () => {
              redirectSessionDetail(record?.id as number, record.status);
            },
          })}
          searchNotFound={
            listSession?.length > 0 ? undefined : (
              <SearchNotFound isBackgroundWhite text={searchValue} />
            )
          }
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
          filters={{
            show: true,
            options: optionsOrder,
            onChange: onFilter,
            value: order,
            minWidth: 'min-w-[270px]',
          }}
          action={{
            show: selection.length > 0 ? true : false,
            onSelect: onChangeAction,
            options: [{ value: 'selection', label: 'Duplicate to' }],
          }}
        />
      </Layout>
      {renderModalDuplicateSession()}
      {renderModalWarning()}
      {renderModalConfirm()}
      {renderModalConfirmDelete()}
    </>
  );
};

export default SessionList;
