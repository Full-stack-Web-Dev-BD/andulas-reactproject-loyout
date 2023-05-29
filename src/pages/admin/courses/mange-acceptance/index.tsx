import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Layout, Modal, TablePaginationConfig } from 'antd';
import ModalCustom from 'components/Modal';
import FilterCard from 'components/SearchBar/FilterCard';
import TableCustom from 'components/SearchBar/Table';
import React, { Key, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from 'constants/constants';
import CustomInput from 'components/Input';
interface IFields {
  search: string;
  category: { label: string; value: string };
  leaningMethod: { label: string; value: string };
  programType: { label: string; value: string };
}

export interface IByAdmissoin {
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

const ManageAcceptance = () => {
  // table component
  const [dataManageAccptance, setDataManageAccptance] = useState<IByAdmissoin[]>([
    {
      studentName: 'test',
      courseName: 'test',
      centre: 'bbbb',
      dateSubmitted: 'bbb',
      status: 'test',
      id: 1,
      key: 1,
    },
  ]);
  const [selection, setSelection] = useState<React.Key[]>([]);
  const history = useNavigate();

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 1,
    position: [],
  });

  const handleTableChange = () => {};

  const onChangeSelect = (selectedRowKeys: React.Key[]) => {
    setSelection(selectedRowKeys);
  };

  const [titleModal, setTitleModal] = useState('');
  const [contentModal, setContentModal] = useState(<div></div>);
  const [routeModal, setRouteModal] = useState('');

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      fixed: true,
    },
    {
      title: 'Course’s Name',
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
    },
    {
      title: 'Action',
      dataIndex: 'action',
      fixed: true,
      width: 100,
      render: (text: string, record: DataType) => {
        return (
          <div className="flex">
            <div
              className="cursor-pointer ml-5"
              onClick={(e) => {
                e.stopPropagation();
                setTitleModal('Accept application');
                setContentModal(
                  <div>
                    Are you sure you want to allow {record.studentName} to subscribe to{' '}
                    {record.courseName}?
                  </div>,
                );
                setRouteModal(`${ROUTES.manage_acceptance_update}/accept`);
              }}
            >
              <CheckOutlined />
            </div>
            <div
              className="cursor-pointer ml-5"
              onClick={(e) => {
                e.stopPropagation();
                setTitleModal('Reject application');
                setContentModal(
                  <div>
                    Are you sure you want to reject {record.studentName} from subscribing to{' '}
                    {record.courseName}?
                    <CustomInput type="textArea" classNameCustom="mt-2 h-[240px]" />
                  </div>,
                );
                setRouteModal(`${ROUTES.manage_acceptance_update}/reject`);
              }}
            >
              <CloseOutlined />
            </div>
          </div>
        );
      },
    },
  ];
  // handle filter card
  const [searchResult, setSearchResult] = useState<{ id: number; courseName: string }[]>([]);
  const handleChangeSearch = useCallback((keySearch: string) => {}, []);

  const onFinish = useCallback((values: IFields) => {}, []);

  const handleSearchCategory = useCallback((value: string) => {}, []);

  const optionsFilter = useMemo(() => {
    return [
      {
        name: 'centes',
        placeholder: 'All Centres',
        className: 'basis-[38%] custom-botton-content-management flex-basic-48',
        options: [],
        type: 'select',
      },
      {
        name: 'course',
        className: 'basis-[38%] custom-botton-content-management flex-basic-48',
        placeholder: 'All Courses',
        type: 'select',
        options: [],
      },
    ];
  }, []);
  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <div className="flex justify-between items-center bg-transparent px-0">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
          Manage Acceptance - By Admission
        </p>
      </div>

      <FilterCard
        handleChangeSearch={handleChangeSearch}
        onFinish={onFinish}
        fields={optionsFilter}
        searchResults={searchResult}
        // pathSearchDetail={ROUTES.course_detail}
        keyResult="courseName"
        handleSearchOptions={handleSearchCategory}
      />
      <TableCustom
        columns={columns}
        data={dataManageAccptance}
        pagination={pagination}
        handleTableChange={handleTableChange}
        onChangeSelect={onChangeSelect}
        filters={{ show: true }}
        onRow={(record) => ({
          onClick: () => {
            history(`${ROUTES.manage_acceptance_update}/pending`);
          },
        })}
        action={{
          show: selection.length > 0 ? true : false,
          options: [
            { value: 'all', label: 'Accept All' },
            { value: 'selection', label: 'Reject All' },
          ],
        }}
      />
      <Modal
        visible={titleModal ? true : false}
        okText="Confirm"
        cancelText="Cancel"
        onCancel={() => {
          setTitleModal('');
        }}
        onOk={() => {
          history(routeModal);
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
      </Modal>
    </Layout>
  );
};

export default ManageAcceptance;
