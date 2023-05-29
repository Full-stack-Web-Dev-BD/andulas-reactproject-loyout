import { Table, TablePaginationConfig } from 'antd';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ReactComponent as SortSVG } from 'assets/icons/sort.svg';
import PaginationCustom from 'components/Pagination';
import { getCountUnreadNotification, getNotification, updateNotificationStatus, UserNotification } from 'api/notification';
import { useMutation, useQuery } from 'react-query';
import { AppContext } from 'context';
import moment from 'moment';
import './style.css';

// const initOptionsFilter = [{ lable: 'All', value: 'All' }];

// const optionsFilter = [
//   { lable: 'All Notifications', value: 'All Notifications' },
//   { lable: 'Read', value: 'Read' },
//   { lable: 'Unread', value: 'Unread' },
// ];

// const optionsLimit = [
//   { label: '10', value: '10' },
//   { label: '20', value: '20' },
//   { label: '30', value: '30' },
// ];

export interface INotificationInfo {
  limit?: number;
  page?: number;
  search?: string;
  total?: number;
  listNotification: UserNotification[];
}

const NotificationList = ({ limit, filter }: { limit?: string, filter?: string }) => {
  const [dataList, setDataList] = useState<INotificationInfo>({ listNotification: [] });
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: Number(limit),
  });
  const [state, setState]: any = useContext(AppContext);


  useEffect(() => {
    setPagination({
      ...pagination,
      current: 1,
      pageSize: Number(limit),
      total: undefined
    })
  }, [limit, filter])

  const countUnreadNotification = useQuery(
    ['countUnreadNotification', state?.user?.id],
    async () => {
      const res = await getCountUnreadNotification()
      return res.data
    },
    {
      enabled: !!state?.user?.id,
      refetchOnWindowFocus: 'always',
      refetchOnReconnect: 'always',
    },
  )

  useEffect(() => {
    setState({
      ...state,
      countNotification: countUnreadNotification.data
    })
  }, [countUnreadNotification.data])


  const { mutate: listNotification } = useMutation('listNotification', getNotification, {
    onSuccess(data, variables, context) {
      setDataList(data.data)
      if(pagination.current && (pagination.current > Math.ceil(data?.data?.total/data.data.limit))){
        setPagination({
          ...pagination,
          current: Math.ceil(data?.data?.total/data.data.limit),
          total: undefined
        });
      }else{
        setPagination({
          ...pagination,
          total: data?.data?.total,
        });
      }
    },
  });

  useEffect(() => {
    if (state?.user?.id && !pagination.total) {
      listNotification({ limit: Number(pagination.pageSize), page: Number(pagination.current), filters: JSON.stringify([{ isRead: filter }]) });
    }
  }, [state?.user?.id, pagination.current, pagination.pageSize, pagination.total]);

  const { mutate: updateStatusNotification } = useMutation('updateStatusNotification', updateNotificationStatus, {
    onSuccess(data, variables, context) {
      if (filter == 'Unread') {
        listNotification({ limit: Number(pagination.pageSize), page: Number(pagination.current), filters: JSON.stringify([{ isRead: filter }]) });
      } else {
        const arr = dataList.listNotification.map(item => {
          if (item.id == data.data.id) {
            return {
              ...item,
              isRead: data.data.isRead
            }
          } else return item
        })
        setDataList({ ...dataList, listNotification: arr })
      }
      countUnreadNotification.refetch();
    },
  });

  const pageSize = useMemo(() => {
    return Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
  }, [pagination, limit]);

  const startPageSize = useMemo(() => {
    const startSize =
      Number(pagination?.current) * Number(pagination?.pageSize) -
      (Number(pagination?.pageSize) - 1);

    return startSize;
  }, [pagination, limit]);

  const endPageSize = useMemo(() => {
    let endSize = Number(pagination?.current) * Number(pagination?.pageSize);
    endSize =
      pagination?.total && endSize < pagination?.total ? endSize : (pagination?.total as number);

    return endSize;
  }, [pagination, limit]);

  const updateNoti = (itemNoti: UserNotification) => {
    if (!itemNoti.isRead) {
      updateStatusNotification(itemNoti.id)
    }
  }

  const columns = [
    {
      title: (
        <>
          Notification
        </>
      ),
      dataIndex: 'notification',
      key: 'content',
      width: '70%',
      render: (text: any, recordValue: UserNotification) => {
        return <span className={`noti-content ${recordValue.isRead ? 'text-[#AEA8A5]' : 'cursor-pointer'}`}>
          {`${recordValue.notification.actionType} ${recordValue.notification.nameType} ${recordValue.notification.content.includes('by') ? 'by ' + recordValue.notification.createdByUser.userProfile.firstName + ' ' + recordValue.notification.createdByUser.userProfile.lastName : ''} at ${moment(recordValue.notification.createdAt).format('YYYY/MM/DD hh:mm a')}`}
        </span>
      }
    },
    {
      title: (
        <>
          Posted Date & Time
        </>
      ),
      dataIndex: 'notification',
      key: 'createdAt',
      width: '30%',
      render: (text: any, recordValue: UserNotification) => {
        return <span className={`${recordValue.isRead ? 'text-[#AEA8A5]' : 'cursor-pointer'}`}>{moment(recordValue.notification.createdAt).format('YYYY/MM/DD hh:mm a')}</span>
      }
    },
  ];
  return (
    <>
      <Table
        columns={columns}
        dataSource={dataList?.listNotification}
        pagination={false}
        className={`bg-transparent table-component`}
        onRow={(record, rowIndex) => {
          return {
            onClick: event => { updateNoti(record) }, // click row
          };
        }}
      //   onChange={handleTableChange}
      //   onRow={onRow}
      />
      {pagination?.total && (
        <div className="flex justify-between items-center mb-4 footer-course-sp gap-4">
          <span className="font-fontFamily text-sm text-main-font-color bottom-8">
            {startPageSize} - {endPageSize} of {pagination?.total}
          </span>
          <PaginationCustom
            total={Number(pagination?.total)}
            pageSize={Number(pagination?.pageSize)}
            current={Number(pagination?.current)}
            onChange={(page) => {
              setPagination({ ...pagination, current: Number(page), total: undefined });
            }}
            onLastPage={() => {
              setPagination({
                ...pagination,
                current: pageSize,
                total: undefined
              });
            }}
            onFirstPage={() => {
              setPagination({ ...pagination, current: 1, total: undefined });
            }}
          ></PaginationCustom>
        </div>
      )}
    </>
  );
}

export default NotificationList;
