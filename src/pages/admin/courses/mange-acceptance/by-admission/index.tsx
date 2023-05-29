import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Form, Input, Layout, Modal, TablePaginationConfig } from 'antd';
import { searchCentres } from 'api/centres';
import { searchCourses } from 'api/courses';
import {
  getAllRegistrationStatus,
  getManageAcceptanceByAdmission,
  updateRegistrationSelection,
  updateRegistrationStatus,
} from 'api/courses_by_admission';
import FilterCard from 'components/SearchBar/FilterCard';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom from 'components/SearchBar/Table';
import { DATE_FORMAT, PARAMS_SELECT_SEARCH, ROUTES, TEXT_SELECT_SEARCH } from 'constants/constants';
import moment from 'moment';
import React, { Key, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
interface IFields {
  search: string;
  course: { label: string; value: string };
  centres: { label: string; value: string };
  status: string;
}

export interface IByAdmission {
  id: number;
  studentName: string;
  courseName: string;
  centre: string;
  dateSubmitted: string;
  status: string;
  key?: Key;
}

interface DataType {
  key?: React.Key;
  id?: number;
  courseName?: string;
  studentName?: string;
  status?: string;
}

const styleButton = {
  height: '44px',
  width: '50%',
  borderRadius: '12px',
  fontWeight: '600',
  fontSize: '16px',
  fontFamily: 'var(--main-font-family)',
  borderColor: 'var(--main-button-color)',
};

const sort = 'createdAt';
const titleAcceptApplication = 'Accept application';
const titleRejectApplication = 'Reject application';
const courseType = 'By Admission';

const ByAdmission = () => {
  // table component
  const history = useNavigate();
  const [dataManageAcceptance, setDataManageAcceptance] = useState<IByAdmission[]>([]);
  const [selection, setSelection] = useState<number[]>([]);
  const [limit, setLimit] = useState<string>('5');
  const [order, setOrder] = useState<string>('DESC');
  const [reason, setReason] = useState('');
  const [modalSelection, setModalSelection] = useState(false);
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [titleModal, setTitleModal] = useState('');
  const [contentModal, setContentModal] = useState(<div></div>);
  const [isRequireReason, setIsRequireReason] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: Number(limit),
    position: [],
  });

  const TextareaCustom = () => {
    return (
      <Input.TextArea
        placeholder="Please enter rejection reason"
        className="style_input_custom_login_page mt-2 h-[240px]"
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
          setReason(event.target.value);
          if (!event.target.value) {
            setIsRequireReason(true);
          } else {
            setIsRequireReason(false);
          }
        }}
      />
    );
  };

  const {
    mutate: mutateGetManageAcceptanceByAdmission,
    isLoading: isLoadingGetManageAcceptanceByAdmission,
  } = useMutation('getManageAcceptanceByAdmission', getManageAcceptanceByAdmission, {
    onSuccess: ({ data }) => {
      setSelection([]);
      setPagination({
        current: data.page,
        pageSize: Number(limit),
        total: data.total,
      });
      setDataManageAcceptance(
        data.listRegistrations.map((item: any) => ({
          studentName: item.student.userProfile.lastName + ' ' + item.student.userProfile.firstName,
          courseName: item.course.courseName,
          centre: item.centre.centreName,
          dateSubmitted: moment(item.createdAt)?.utc().format(DATE_FORMAT),
          status: item.status,
          id: item.id,
          key: item.id,
        })),
      );
    },
  });
  const { mutate: mutateUpdateRegistrationStatus } = useMutation(
    'updateRegistrationStatus',
    updateRegistrationStatus,
    {
      onSuccess: ({ data }) => {
        setReason('');
        setIsRequireReason(false);
        history(`${ROUTES.manage_acceptance_update}/${data.id}`);
      },
    },
  );

  const handleTableChange = (paginate: TablePaginationConfig) => {
    setPagination({ ...pagination, ...paginate });
  };

  const onChangeSelect = (selectedRowKeys: React.Key[]) => {
    setSelection(selectedRowKeys as number[]);
  };

  const onChangeLimit = (value: string) => {
    const total = pagination.total;
    const maxPage = Math.ceil(Number(total) / Number(value));
    setLimit(String(value));
    if (Number(pagination.current) > maxPage) setPagination({ ...pagination, current: maxPage });
    else setPagination(pagination);
  };

  const onFilter = (value: string) => {
    setOrder(value);
  };

  const [status, setStatus] = useState('');
  const [id, setId] = useState<number>(0);

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      fixed: true,
    },
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      fixed: true,
    },
    {
      title: 'Centre',
      dataIndex: 'centre',
      fixed: true,
    },
    {
      title: 'Date Submitted',
      dataIndex: 'dateSubmitted',
      fixed: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      fixed: true,
      render: (text: string) => {
        const className =
          text === 'Accepted'
            ? 'text-[#006262] bg-[#E6F2F2]'
            : text === 'Pending'
            ? 'text-[#BE5E2A] bg-[#FCECD9]'
            : 'text-[#EB5757] bg-[#FFD3D3]';
        return (
          <span
            className={`rounded-[100px] px-4 py-1 font-fontFamily text-xs tracking-wider ${className}`}
          >
            {text.toLocaleUpperCase()}
          </span>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      fixed: true,
      width: 100,
      render: (text: string, record: DataType) => {
        const className =
          record.status === 'Pending'
            ? '!text-black cursor-pointer ml-5'
            : '!text-[#bababa] cursor-not-allowed ml-5';
        return (
          <div className="flex">
            <div
              className={className}
              onClick={(e) => {
                e.stopPropagation();
                if (record.status !== 'Pending') return;
                setTitleModal(titleAcceptApplication);
                setIsVisibleModal(true);
                setContentModal(
                  <div>
                    Are you sure you want to allow {record.studentName} to subscribe to{' '}
                    {record.courseName}?
                  </div>,
                );
                setStatus('Accepted');
                setId(Number(record.id));
              }}
            >
              <CheckOutlined className="icon-hover" />
            </div>
            <div
              className={className}
              onClick={(e) => {
                e.stopPropagation();
                if (record.status !== 'Pending') return;
                setTitleModal(titleRejectApplication);
                setModalSelection(false);
                setIsVisibleModal(true);
                setContentModal(
                  <div>
                    Are you sure you want to reject {record.studentName} from subscribing to{' '}
                    {record.courseName}?
                    <TextareaCustom />
                  </div>,
                );
                setId(Number(record.id));
                setStatus('Rejected');
              }}
            >
              <CloseOutlined className="icon-hover" />
            </div>
          </div>
        );
      },
    },
  ];

  const onChangeAction = useCallback(
    (value: string) => {
      if (value === 'Rejected') {
        setTitleModal(titleRejectApplication);
        setIsVisibleModal(true);
        setContentModal(
          <div>
            Are you sure you want to reject the selected student/s from subscribing to the course
            that they have selected?
            <TextareaCustom />
          </div>,
        );
      } else {
        setTitleModal(titleAcceptApplication);
        setContentModal(
          <div>
            Are you sure you want to accept the selected student/s to subscribe to the course that
            they have selected?
          </div>,
        );
      }
      setIsVisibleModal(true);
      setStatus(value);
      setModalSelection(true);
    },
    [selection],
  );

  // handle filter card
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});
  const [searchResult, setSearchResult] = useState<{ id: number; student: string }[]>([]);
  const [coursesOptions, setCoursesOptions] = useState<{ label: string; value: string }[]>([]);
  const [centresOptions, setCentresOptions] = useState<{ label: string; value: string }[]>([]);
  const [statusOption, setStatusOption] = useState<{ label: string; value: string }[]>([]);
  const timeout: any = useRef(null);
  const [form] = Form.useForm();
  const centres = Form.useWatch('centres', form);
  const course = Form.useWatch('course', form);
  const { mutate: mutateDropdownSearch } = useMutation(
    'getManageAcceptanceByAdmission',
    getManageAcceptanceByAdmission,
    {
      onSuccess: ({ data }) => {
        const newData = data.listRegistrations.map((item: any) => {
          return {
            id: item.id,
            student: `${item.student.userProfile.lastName} ${item.student.userProfile.firstName} - ${item.course.courseName} - ${item.centre.centreName}`,
          };
        });
        setSearchResult(newData);
      },
    },
  );

  const { mutate: searchListCourses } = useMutation('searchCourses', searchCourses, {
    onSuccess: ({ data }: { data: { listCourses: Array<{ id: number; courseName: string }> } }) => {
      const newData = data.listCourses
        .map((item) => {
          return {
            value: item.id.toString(),
            label: item.courseName,
            isDisabled: false,
          };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.course, value: '', isDisabled: true }]);
      setCoursesOptions(newData);
    },
  });

  const { mutate: searchListCentres } = useMutation('searchCentres', searchCentres, {
    onSuccess: ({ data }: { data: { listCentres: Array<{ id: number; centreName: string }> } }) => {
      const newData = data.listCentres
        .map((item) => {
          return {
            value: item.id.toString(),
            label: item.centreName,
            isDisabled: false,
          };
        })
        .concat([{ label: TEXT_SELECT_SEARCH.centre, value: '', isDisabled: true }]);
      setCentresOptions(newData);
    },
  });

  const { mutate: mutateGetAllRegistrationStatus } = useMutation(
    'getAllRegistrationStatus',
    getAllRegistrationStatus,
    {
      onSuccess: ({ data }) => {
        setStatusOption(
          data.map((item: string) => ({
            value: item,
            label: item,
          })),
        );
      },
    },
  );

  const { mutate: mutateUpdateRegistrationSelection } = useMutation(
    'updateRegistrationSelection',
    updateRegistrationSelection,
    {
      onSuccess: () => {
        setModalSelection(false);
        setTitleModal('');
        setIsVisibleModal(false);
        setContentModal(<div></div>);
        setSelection([]);
        mutateGetManageAcceptanceByAdmission({
          page: Number(pagination.current),
          limit: Number(limit),
          search: searchValue,
          sort: sort,
          order: order,
          filters:
            Object.getOwnPropertyNames(filters).length > 0
              ? JSON.stringify([{ ...filters, courseType: courseType }])
              : JSON.stringify([{ courseType: courseType }]),
        });
      },
    },
  );

  const debounceSearch = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        mutateDropdownSearch({
          page: 1,
          limit: 10,
          search: value,
          sort: sort,
          order: 'DESC',
          filters: JSON.stringify([{ courseType: courseType }]),
        });
      }, 500);
    },
    [limit, pagination.current, timeout],
  );

  const handleReset = useCallback(() => {
    setOrder('DESC');
    setLimit('5');
    setFilters({});
    setSearchValue('');
    setSelection([]);
    setPagination({ current: 1, pageSize: Number(limit), position: [] });
    getManageAcceptanceByAdmission({
      limit: 5,
      page: 1,
      search: '',
      sort: sort,
      order: 'DESC',
    });
  }, [limit]);

  const handleChangeSearch = useCallback((keySearch: string) => {
    debounceSearch(keySearch);
  }, []);

  const onFinish = useCallback(
    (values: IFields) => {
      setPagination({ ...pagination, pageSize: Number(limit), current: 1 });
      setSearchValue(values.search as string);
      setFilters({
        courseType: courseType,
        centreID: values?.centres?.value ? Number(values?.centres?.value) : '',
        courseID: values?.course?.value ? Number(values?.course?.value) : '',
        status: values?.status || '',
      });
    },
    [limit, pagination, order],
  );

  const handleSearchCentre = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchListCentres({ ...PARAMS_SELECT_SEARCH.centre, search: value });
      }, 500);
    },
    [timeout],
  );

  const handleSearchCourse = useCallback(
    (value: string) => {
      clearTimeout(timeout?.current);
      timeout.current = setTimeout(() => {
        searchListCourses({ ...PARAMS_SELECT_SEARCH.course, search: value });
      }, 500);
    },
    [timeout],
  );

  const optionsFilter = useMemo(() => {
    return [
      {
        name: 'centres',
        placeholder: 'All Centres',
        className: 'basis-[calc(28.3%_-_0.75rem)] lg:w-[calc(50%_-_0.5rem)] lg:basis-auto',
        options: centresOptions,
        type: 'select-search',
        handleSearch: handleSearchCentre,
      },
      {
        name: 'course',
        className: 'basis-[calc(28.3%_-_0.75rem)] lg:w-[calc(50%_-_0.5rem)] lg:basis-auto',
        placeholder: 'All Courses',
        type: 'select-search',
        options: coursesOptions,
        handleSearch: handleSearchCourse,
      },
      {
        name: 'status',
        className: 'basis-[calc(28.3%_-_0.75rem)] lg:w-[calc(50%_-_0.5rem)] lg:basis-auto',
        placeholder: 'Status',
        type: 'select',
        options: statusOption,
        // handleSearch: handleSearchCourse,
      },
    ];
  }, [coursesOptions, centresOptions]);

  const renderModalConfirm = useCallback(() => {
    return (
      isVisibleModal && (
        <Modal
          visible={isVisibleModal}
          okText="Confirm"
          cancelText="Cancel"
          onCancel={() => {
            setTitleModal('');
            setIsVisibleModal(false);
            setReason('');
            setIsRequireReason(false);
          }}
          onOk={() => {
            if (!reason && titleModal !== titleAcceptApplication) {
              setIsRequireReason(true);
              return;
            }
            if (modalSelection) {
              mutateUpdateRegistrationSelection({
                status: status,
                listRegistrationIds: selection,
                reason: reason ? reason : undefined,
              });
            } else {
              mutateUpdateRegistrationStatus({
                status: status,
                id: id,
                reason: reason ? reason : undefined,
              });
            }
          }}
          okButtonProps={{
            style: {
              ...styleButton,
              background: 'var(--main-button-color)',
            },
          }}
          cancelButtonProps={{
            style: styleButton,
          }}
        >
          <span
            className={`font-fontFamily text-main-font-color flex justify-center text-center font-bold text-2xl tracking-tight mt-6`}
          >
            {titleModal}
          </span>
          <div
            className={`font-fontFamily text-main-font-color font-normal text-sm mt-3 text-center flex justify-center
      `}
          >
            {contentModal}
          </div>
          {isRequireReason && (
            <div className="!text-red-500 !text-left w-full font-fontFamily">
              Rejection reason cannot be empty!
            </div>
          )}
        </Modal>
      )
    );
  }, [isVisibleModal, isRequireReason, reason]);

  useEffect(() => {
    searchListCourses(PARAMS_SELECT_SEARCH.course);
    searchListCentres(PARAMS_SELECT_SEARCH.centre);
    mutateGetAllRegistrationStatus();
  }, []);

  useEffect(() => {
    mutateGetManageAcceptanceByAdmission({
      page: Number(pagination.current),
      limit: Number(limit),
      search: searchValue,
      sort: sort,
      order: order,
      filters:
        Object.getOwnPropertyNames(filters).length > 0
          ? JSON.stringify([{ ...filters, courseType: courseType }])
          : JSON.stringify([{ courseType: courseType }]),
    });
  }, [pagination.current, limit, order, filters]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <div className="flex justify-between items-center bg-transparent px-0">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
          Manage Acceptance - {courseType}
        </p>
      </div>

      <FilterCard
        handleChangeSearch={handleChangeSearch}
        onFinish={onFinish}
        form={form}
        fields={optionsFilter}
        searchResults={searchResult}
        handleReset={handleReset}
        pathSearchDetail={`${ROUTES.manage_acceptance_update}`}
        keyResult="student"
      />
      <TableCustom
        columns={columns}
        data={dataManageAcceptance}
        pagination={pagination}
        isLoading={isLoadingGetManageAcceptanceByAdmission}
        handleTableChange={handleTableChange}
        onChangeSelect={onChangeSelect}
        onFirstPage={() => {
          setPagination({ ...pagination, current: 1 });
        }}
        getCheckboxProps={(record) => {
          return {
            disabled: record.status !== 'Pending',
          };
        }}
        searchNotFound={
          dataManageAcceptance.length > 0 ? undefined : (
            <SearchNotFound
              isBackgroundWhite
              text={
                searchValue ? searchValue : centres ? centres.label : course ? course.label : ''
              }
            />
          )
        }
        onLastPage={() => {
          setPagination({
            ...pagination,
            current: Math.ceil(Number(pagination.total) / Number(pagination.pageSize)),
          });
        }}
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        viewItem={{
          onChange: onChangeLimit,
          value: String(limit),
        }}
        filters={{
          show: true,
          options: [
            //customers want it like that (DESC <-> ASC)
            { value: 'DESC', label: 'Date Submitted (Ascending)' },
            { value: 'ASC', label: 'Date Submitted (Descending)' },
          ],
          onChange: onFilter,
          value: order,
        }}
        onRow={(record) => ({
          onClick: () => {
            history(`${ROUTES.manage_acceptance_update}/${record.id}`);
          },
        })}
        action={{
          show: selection.length > 0 ? true : false,
          onSelect: onChangeAction,
          options: [
            { value: 'Accepted', label: 'Accept selection' },
            { value: 'Rejected', label: 'Reject selection' },
          ],
        }}
      />

      {renderModalConfirm()}
    </Layout>
  );
};

export default ByAdmission;
