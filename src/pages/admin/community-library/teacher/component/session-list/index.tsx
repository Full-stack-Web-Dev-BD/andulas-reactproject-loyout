import { Breadcrumb, Form, Layout } from 'antd';
import { ReactComponent as DuplicateSVG } from 'assets/icons/duplicate.svg';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import ButtonCustom from 'components/Button';
import ReorderSession from 'components/ReorderSession';
import FilterCard from 'components/SearchBar/FilterCard';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom from 'components/SearchBar/Table';
import CustomTooltip from 'components/Tooltip';
import { ROUTES, SCREEN, Status } from 'constants/index';
import { AppContext } from 'context';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
  setSessionDuplicate: (val: ISessionInfo) => void;
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
  isDisabledSelect?: (record: any) => {
    disabled: boolean;
  };
  onChangeListSession?: (sessions: ISessionInfo[]) => void;
  isFilter?: boolean;
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
    isDisabledSelect,
    onChangeListSession,
    isFilter,
  } = props;
  const history = useNavigate();
  const { pathname } = useLocation();
  const { topicId, moduleId } = useParams();
  const isSessionTab = !!pathname.includes(ROUTES.community_library_session);
  const [form] = Form.useForm();
  const [tabActive, setTabActive] = useState<string>('');
  const [state]: any = useContext(AppContext);

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
      fixed: true,
      render: (text: string, record: ISessionInfo) => {
        return (
          <div
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              // history(`${ROUTES.content_management_update_session}/${record.id}?content=true`);
              if (record?.authorID && state?.user?.id && record?.authorID === state?.user?.id) {
                history(`${ROUTES.content_management_update_session}/${record.id}?content=true`);
              } else {
                history(`${ROUTES.community_library}/session/${record?.id}/overview/teacher`);
              }
            }}
          >
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
      fixed: true,
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
      fixed: true,
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
      fixed: true,
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
      fixed: true,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      fixed: true,
      width: 100,
      render: (text: string, record: ISessionInfo) => {
        return (
          <div className="flex">
            {state?.user?.id === record.authorID && (
              <>
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    redirectSessionDetail(Number(record?.id), record?.status as string);
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
                    setSessionId(Number(record.id));
                    setIsModalDeleteSession(true);
                  }}
                >
                  <CustomTooltip title="Delete">
                    <TrashSVG className="icon-hover" />
                  </CustomTooltip>
                </div>
              </>
            )}
            <div
              className="cursor-pointer ml-5"
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
            </div>
          </div>
        );
      },
    },
  ];

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination]);
  useEffect(() => {
    if (
      location.pathname.includes('topic') &&
      location.pathname.includes('module') &&
      location.pathname.includes('session')
    ) {
      setTabActive(SCREEN.topic_tab);
    } else if (location.pathname.includes('module') && location.pathname.includes('/session')) {
      setTabActive(SCREEN.module_tap);
    } else {
      setTabActive(SCREEN.session_tap);
    }
  }, [location.pathname]);

  return (
    <>
      <Layout className="bg-transparent flex flex-col gap-y-6">
        <div className="flex justify-between items-center bg-transparent px-0">
          {!isSessionTab ? (
            <Breadcrumb
              style={{
                color: '#AEA8A5',
                fontWeight: '700',
                lineHeight: '36px',
                fontSize: '28px',
              }}
              className="font-fontFamily text-main-font-color"
            >
              <Breadcrumb.Item
                className="opacity-50 cursor-pointer"
                onClick={() => {
                  if (tabActive === SCREEN.topic_tab) {
                    history(`${ROUTES.community_library_topic}/teacher`);
                  } else if (tabActive === SCREEN.module_tap) {
                    history(`${ROUTES.community_library_module}/teacher`);
                  } else {
                    history(`${ROUTES.community_library_session}/teacher`);
                  }
                }}
              >
                Community Library - {tabActive.charAt(0).toUpperCase() + tabActive.slice(1)}
              </Breadcrumb.Item>
              {tabActive === SCREEN.topic_tab && (
                <Breadcrumb.Item
                  className="opacity-50 cursor-pointer"
                  onClick={() => {
                    history(ROUTES.community_library_topic + `/${topicId}/module/teacher`);
                  }}
                >
                  {topicName}
                </Breadcrumb.Item>
              )}
              <Breadcrumb.Item className="font-fontFamily text-main-font-color">
                {moduleName}
              </Breadcrumb.Item>
            </Breadcrumb>
          ) : (
            <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
              Community Library - Session
            </p>
          )}

          <ButtonCustom
            color="orange"
            onClick={() => {
              switch (tabActive) {
                case SCREEN.topic_tab:
                  history(
                    `${ROUTES.community_library_topic}/${topicId}/module/${moduleId}/session/new-session/teacher`,
                  );
                  break;
                case SCREEN.module_tap:
                  history(
                    `${ROUTES.community_library_module}/${moduleId}/session/new-session/teacher`,
                  );
                  break;
                case SCREEN.session_tap:
                  history(`${ROUTES.community_session_create_new_content}/teacher`);

                  break;
              }
            }}
          >
            New Session
          </ButtonCustom>
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
          pathSearchDetail={
            tabActive === SCREEN.topic_tab
              ? `${ROUTES.community_library_topic}/${topicId}/module/${moduleId}/session`
              : tabActive === SCREEN.module_tap
              ? `${ROUTES.community_library_module}/${moduleId}/session`
              : `${ROUTES.community_library_session}`
          }
          pathEndPointSearchDetail={'/overview/teacher'}
        />

        {pathname.includes('module') ? (
          <ReorderSession
            filters={{
              show: listSession.every((session) => session.order === 0),
              options: optionsOrder,
              onChange: onFilter,
              value: order,
              minWidth: 'min-w-[270px]',
            }}
            sessions={listSession}
            onRow={redirectSessionDetail}
            searchNotFound={
              listSession?.length > 0 ? undefined : (
                <SearchNotFound isBackgroundWhite text={searchValue} />
              )
            }
            action={{
              show: selection.length > 0 ? true : false,
              onSelect: onChangeAction,
              options: [{ value: 'selection', label: 'Delete' }],
            }}
            selection={selection}
            onChangeSessionId={setSessionId}
            onChangeModalDeleteSession={setIsModalDeleteSession}
            onChangeSessionDuplicate={setSessionDuplicate}
            onChangeModalDuplicateSession={setIsModalDuplicateSession}
            onChangeSelect={onChangeSelect}
            onChangeListSession={onChangeListSession}
            isFilter={isFilter}
          />
        ) : (
          <TableCustom
            getCheckboxProps={isDisabledSelect}
            columns={columns}
            data={listSession}
            pagination={pagination}
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
              options: [{ value: 'selection', label: 'Delete' }],
            }}
          />
        )}
      </Layout>
      {renderModalDuplicateSession()}
      {renderModalWarning()}
      {renderModalConfirm()}
      {renderModalConfirmDelete()}
    </>
  );
};

export default SessionList;
