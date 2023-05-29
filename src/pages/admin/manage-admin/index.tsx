import { Form, Layout, TablePaginationConfig } from 'antd';
import { getListRoles, getListRolesAdmin } from 'api/access_control';
import { deleteAdmin, deleteMultipleAdmins, searchAdmins } from 'api/admin';
import { searchCentres } from 'api/centres';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import FilterCard from 'components/SearchBar/FilterCard';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom from 'components/SearchBar/Table';
import CustomTooltip from 'components/Tooltip';
import { PARAMS_SELECT_SEARCH, ROLE, Status, TEXT_SELECT_SEARCH } from 'constants/constants';
import { ROUTES } from 'constants/index';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { IRole } from './new-admin';
import './style.css';

interface IFields {
  search: string;
  centre: { label: string; value: string };
  roleType: { label: string; value: string };
}
export interface IAdminInfo {
  id: number;
  key: string;
  adminName: string;
  email: string;
  centre: string;
  roleType: string;
  status: boolean;
}

interface ICentreAdmin {
  id: number;
  isActive: boolean;
  remark: string;
  centres: { centreName: string }[];
  user: {
    email: string;
    userProfile: {
      firstName: string;
      lastName: string;
    };
    userRole: { roleName: string };
  };
}

export const optionsOrder = [
  { label: 'Admin Name (A-Z)', value: 'ASC' },
  { label: 'Admin Name (Z-A)', value: 'DESC' },
  { label: 'Status (Active)', value: 'ACTIVE' },
  { label: 'Status (Inactive)', value: 'INACTIVE' },
];

const ManageAdmin = () => {
  const history = useNavigate();
  const timeout: any = useRef(null);
  const [form] = Form.useForm();
  const [listAdmin, setListAdmin] = useState<IAdminInfo[]>([]);
  const [searchResult, setSearchResult] = useState<{ id: number; adminName: string }[]>([]);
  const [selection, setSelection] = useState<React.Key[]>([]);
  const [limit, setLimit] = useState('5');
  const [messageConfirmDelete, setMessageConfirmDelete] = useState<string | null>('');
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  const [filters, setFilters] = useState({});
  const [messageWarning, setMessageWarning] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState<string>('ASC');
  const [sort] = useState<string>('userProfile.firstName');
  const [isModalDeleteAdmin, setIsModalDeleteAdmin] = useState(false);
  const [idDeleteAdmin, setIdDeleteAdmin] = useState<number | undefined>();
  const [status, setStatus] = useState('');
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const [centreOptions, setCentreOptions] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });

  const { mutate: searchListAdmins } = useMutation('searchAdmins', searchAdmins, {
    onSuccess: ({
      data: centreAdmins,
    }: {
      data: {
        listCentreAdmins: {
          id: number;
          user: {
            userProfile: {
              firstName: string;
              lastName: string;
            };
          };
        }[];
      };
    }) => {
      const newData = centreAdmins.listCentreAdmins.map((item) => {
        return {
          id: item.id,
          adminName: item.user.userProfile.firstName + ' ' + item.user.userProfile.lastName,
        };
      });
      setSearchResult(newData);
    },
  });

  const { mutate: getRoles } = useMutation('getListRoles', getListRolesAdmin, {
    onSuccess: ({ data }: { data: { listRoles: IRole[] } }) => {
      const options = data.listRoles
        .map((item) => {
          return { label: item.roleName, value: item.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.role, value: '', isDisabled: true }]);
      setRoleOptions(options);
    },
  });

  const { mutate: getCentres } = useMutation('searchCentres', searchCentres, {
    onSuccess: ({ data }: { data: { listCentres: { centreName: string; id: number }[] } }) => {
      const options = data.listCentres
        .map((item) => {
          return { label: item.centreName, value: item.id.toString(), isDisabled: false };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.centre, value: '', isDisabled: true }]);
      setCentreOptions(options);
    },
  });

  const { mutate: getListAdmins, isLoading } = useMutation('searchAdmins', searchAdmins, {
    onSuccess: ({
      data: centreAdmins,
    }: {
      data: { listCentreAdmins: ICentreAdmin[]; total: number; page: 1 };
    }) => {
      if (centreAdmins?.listCentreAdmins?.length > 0) {
        const newData = centreAdmins.listCentreAdmins.map((item) => {
          return {
            id: item.id,
            key: item.id.toString(),
            centre: item.centres.map((centre) => centre.centreName).join(', '),
            roleType: item.user.userRole.roleName,
            email: item.user.email,
            adminName: item.user.userProfile.firstName + ' ' + item.user.userProfile.lastName,
            status: item.isActive,
          };
        });
        setListAdmin(newData);
        setPagination({
          ...pagination,
          current: centreAdmins.page,
          pageSize: Number(limit),
          total: centreAdmins?.total,
        });

        return;
      }
      setListAdmin([]);
    },
  });

  const renderOrder = useCallback(() => {
    switch (order) {
      case 'ASC':
        return 'ASC';
      case 'DESC':
        return 'DESC';
      // case Status.ACTIVE:
      //   return Status.ACTIVE;
      // case Status.INACTIVE:
      //   return Status.INACTIVE;

      default:
        return '';
    }
  }, [order]);

  const renderSort = useCallback(() => {
    switch (order) {
      case 'ASC':
        return sort;
      case 'DESC':
        return sort;

      default:
        return '';
    }
  }, [sort, order]);

  const messageWarningDeleteAdmins = useMemo(() => {
    return selection?.length > 1
      ? `You are not allowed to delete the selected admins as one of the admin that you have selected is an ongoing admin.`
      : `You are not allowed to delete the selected admin as the admin that you have selected is an ongoing admin.`;
  }, [selection]);

  const messageWarningDeleteAdmin = useMemo(() => {
    return `You are not allowed to delete the selected admin as the admin that you have selected is an ongoing admin.`;
  }, []);

  const { mutate: onDeleteAdmin } = useMutation('deleteAdmin', deleteAdmin, {
    onSuccess: () => {
      setIsModalDeleteAdmin(false);
      if (listAdmin?.length === 1 && Number(pagination.current) > 1) {
        setPagination({ ...pagination, current: Number(pagination.current) - 1 });
        return;
      }
      getListAdmins({
        page: Number(pagination.current),
        limit: Number(limit),
        search: searchValue,
        order: renderOrder(),
        sort: renderSort(),
        filters:
          Object.getOwnPropertyNames(filters).length > 0
            ? JSON.stringify([
                Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
              ])
            : '',
      });
    },
    onError: ({ response }) => {
      setIsModalDeleteAdmin(false);
      if (response.status == 403) {
        setMessageWarning('You are not allowed to delete admin.');
      } else {
        setMessageWarning(messageWarningDeleteAdmin);
      }
    },
  });

  const { mutate: deleteMultipleAdmin } = useMutation(
    'deleteMultipleAdmins',
    deleteMultipleAdmins,
    {
      onSuccess: () => {
        setPagination({ ...pagination, current: 1 });
        if (pagination.current === 1) {
          getListAdmins({
            page: 1,
            limit: Number(limit),
            search: searchValue,
            order: renderOrder(),
            sort: renderSort(),
            filters:
              Object.getOwnPropertyNames(filters).length > 0
                ? JSON.stringify([
                    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
                  ])
                : '',
          });
        }
      },
      onError: ({ response }) => {
        if (response.status == 403) {
          setMessageWarning('You are not allowed to delete admins.');
        } else {
          setMessageWarning(messageWarningDeleteAdmins);
        }
      },
    },
  );

  const handleSearchCentre = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        getCentres({ ...PARAMS_SELECT_SEARCH.centre, search: value });
      }, 500);
    },
    [timeout],
  );

  const optionsFilter = useMemo(() => {
    return [
      {
        name: 'centre',
        placeholder: 'All Centres',
        className: 'basis-[calc(42.5%_-_0.67rem)] xl:basis-[calc(50%_-_0.5rem)]',
        options: centreOptions,
        type: 'select-search',
        handleSearch: handleSearchCentre,
      },
      {
        name: 'roleType',
        className: 'basis-[calc(42.5%_-_0.67rem)] xl:basis-[calc(50%_-_0.5rem)]',
        placeholder: 'All Role Types',
        type: 'select-search',
        options: roleOptions,
      },
    ];
  }, [roleOptions, centreOptions]);

  useEffect(() => {
    getRoles({
      ...PARAMS_SELECT_SEARCH.role,
      filters: JSON.stringify([{ templateName: ROLE.ADMIN }]),
    });
    getCentres(PARAMS_SELECT_SEARCH.centre);
  }, []);

  const redirectEditAdmin = (id: number, adminName: string) => {
    history(`${ROUTES.admin_detail}/${id}`, {
      state: { adminName: adminName },
    });
  };

  const modalConfirmDeleteAdmin = useCallback(() => {
    return (
      isModalDeleteAdmin && (
        <ModalCustom
          visible={isModalDeleteAdmin}
          onCancel={() => {
            setIsModalDeleteAdmin(false);
          }}
          cancelText="Cancel"
          okText="Confirm"
          title="Delete"
          onSubmit={() => onDeleteAdmin({ id: Number(idDeleteAdmin) })}
          titleCenter
        >
          <div>Are you sure you want to delete this admin? This action cannot be undone.</div>
        </ModalCustom>
      )
    );
  }, [isModalDeleteAdmin]);

  const columns = [
    {
      title: 'Admin name',
      dataIndex: 'adminName',
      fixed: true,
      render: (text: string, record: IAdminInfo) => {
        return (
          <div>
            <CustomTooltip title={record.adminName}>
              <div className="custom-text-ellipsis">{record.adminName}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      fixed: true,
      render: (text: string, record: IAdminInfo) => {
        return (
          <div>
            <CustomTooltip title={record.email}>
              <div className="custom-text-ellipsis">{record.email}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Centre',
      dataIndex: 'centre',
      fixed: true,
      render: (text: string, record: IAdminInfo) => {
        return (
          <div>
            <CustomTooltip title={record.centre}>
              <div className="custom-text-ellipsis">{record.centre}</div>
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Role Type',
      dataIndex: 'roleType',
      fixed: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text: string, record: IAdminInfo) => {
        return (
          <div
            className={`${
              record.status ? 'bg-[#E6F2F2] text-[#006262]' : 'bg-[#FCECD9] text-[#BE5E2A]'
            } px-[5px] py-[4px] rounded-2xl text-xs uppercase text-center`}
          >
            {record.status ? Status.ACTIVE : Status.INACTIVE}
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
      render: (text: string, record: IAdminInfo) => {
        return (
          <div className="flex">
            <div
              className="cursor-pointer"
              onClick={() => redirectEditAdmin(record?.id as number, record?.adminName as string)}
            >
              <CustomTooltip title="Edit">
                <EditSVG className="icon-hover" />
              </CustomTooltip>
            </div>
            <div
              className="cursor-pointer ml-5"
              onClick={(e) => {
                e.stopPropagation();
                setIdDeleteAdmin(Number(record.id));
                setIsModalDeleteAdmin(true);
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

  useEffect(() => {
    getListAdmins({
      page: Number(pagination.current),
      limit: Number(limit),
      search: searchValue,
      order: renderOrder(),
      sort: renderSort(),
      filters:
        Object.getOwnPropertyNames(filters).length > 0
          ? JSON.stringify([
              Object.fromEntries(
                Object.entries(
                  status
                    ? { ...filters, isActive: status === Status.ACTIVE ? true : false }
                    : filters,
                ).filter(([, v]) => v?.toString() !== ''),
              ),
            ])
          : status
          ? JSON.stringify([{ isActive: status === Status.ACTIVE ? true : false }])
          : '',
    });
  }, [pagination.current, limit, order, sort, searchValue, filters, status]);
  const handleTableChange = () => {
    setPagination({ ...pagination, current: 2 });
  };

  const onFinish = useCallback(
    (values: IFields) => {
      setPagination({ ...pagination, pageSize: Number(limit), current: 1 });
      setSearchValue(values.search);
      setFilters({
        centreID: values?.centre?.value ? Number(values?.centre?.value) : '',
        userRoleID: values?.roleType?.value,
      });
    },
    [limit, pagination, order],
  );

  const onChangeSelect = (selectedRowKeys: React.Key[]) => {
    setSelection(selectedRowKeys.map((item) => Number(item)));
  };

  const debounceSearch = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchListAdmins({
          page: 1,
          limit: 10,
          search: value,
          order: 'DESC',
        });
      }, 500);
    },
    [limit, pagination.current, timeout],
  );

  const handleChangeSearch = useCallback((value: string) => {
    debounceSearch(value);
  }, []);

  const onChangeLimit = (value: string) => {
    const total = pagination.total;
    const maxPage = Math.ceil(Number(total) / Number(value));
    setLimit(String(value));
    if (Number(pagination.current) > maxPage) setPagination({ ...pagination, current: maxPage });
    else setPagination(pagination);
  };

  const onFilter = useCallback(
    (value: string) => {
      setPagination({ ...pagination, current: 1 });
      setOrder(value);
      if (value !== Status.ACTIVE && value !== Status.INACTIVE) {
        setStatus('');
        return;
      }
      setStatus(value);
    },
    [pagination],
  );

  const onChangeAction = useCallback(
    (value: string) => {
      if (value === 'selection') {
        setIsModalConfirm(true);
        setMessageConfirmDelete(
          `Are you sure you want to delete the selected ${
            selection?.length > 1 ? 'admins' : 'admin'
          }? This action cannot be undone.`,
        );
      }
    },
    [selection],
  );

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination]);

  const handleDeleteSelection = () => {
    deleteMultipleAdmin({ centreAdminIds: Array.isArray(selection) ? selection : [] });
  };

  const renderModalConfirm = useCallback(() => {
    return (
      isModalConfirm && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          okText="Confirm"
          onSubmit={handleDeleteSelection}
          onCancel={() => {
            setIsModalConfirm(false);
          }}
          title="Delete"
          titleCenter
          content={messageConfirmDelete}
        />
      )
    );
  }, [isModalConfirm]);

  const renderModalWarning = useCallback(() => {
    return (
      messageWarning && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setMessageWarning('');
          }}
          title="Warning"
          titleCenter
          content={messageWarning}
        />
      )
    );
  }, [messageWarning]);

  const handleReset = useCallback(() => {
    setOrder('ASC');
    setLimit('5');
    setFilters({});
    setSearchValue('');
    setStatus('');
  }, [limit, optionsOrder]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <div className="flex justify-between items-center bg-transparent px-0 mt-5 custom-gap">
        <p className="text-[1.75rem] font-fontFamily leading-9 font-bold mb-0 custom-font-header">
          Admin
        </p>

        <ButtonCustom
          className="button-fix w-fit"
          color="orange"
          onClick={() => history(ROUTES.admin_detail)}
        >
          New Admin
        </ButtonCustom>
      </div>

      <FilterCard
        handleChangeSearch={handleChangeSearch}
        onFinish={onFinish}
        form={form}
        fields={optionsFilter}
        handleReset={handleReset}
        searchResults={searchResult}
        pathSearchDetail={ROUTES.admin_detail}
        keyResult="adminName"
      />

      <TableCustom
        columns={columns}
        data={listAdmin}
        isLoading={isLoading}
        pagination={pagination}
        handleTableChange={handleTableChange}
        onChangeSelect={onChangeSelect}
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        onRow={(record) => ({
          onClick: () => {
            redirectEditAdmin(record?.id as number, record?.adminName as string);
          },
        })}
        searchNotFound={
          listAdmin.length > 0 ? undefined : <SearchNotFound isBackgroundWhite text={searchValue} />
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

      {renderModalWarning()}
      {modalConfirmDeleteAdmin()}
      {renderModalConfirm()}
    </Layout>
  );
};

export default ManageAdmin;
