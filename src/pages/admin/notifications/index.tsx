import { Layout, Table, TablePaginationConfig } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import ButtonCustom from 'components/Button';
import PaginationCustom from 'components/Pagination';
import SelectCustom from 'components/Select';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ReactComponent as SortSVG } from 'assets/icons/sort.svg';
import AnnoucementList from './announcement';
import NotificationList from './notification';
import { useLocation } from 'react-router-dom';

import './cus-notification.css';

const initOptionsFilter = [{ lable: 'All', value: 'All' }];

const optionsLimit = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '30', value: '30' },
];

export interface INotificationInfo {
  limit?: number;
  page?: number;
  search?: string;
  total?: number;
  listNotification: {
    id: string;
    key: string;
    message: string;
    notificationDate: string;
  }[];
}

const Notifications = () => {
  const { state } = useLocation();
  const [tab, setTab] = useState<number>(Number(state) || 1);
  const [filter, setFilter] = useState<string>('');
  const [limit, setLimit] = useState<string>('10');

  const optionsFilter = [
    {
      lable: tab == 1 ? 'All Notifications' : 'All Announcements',
      value: tab == 1 ? 'All Notifications' : 'All Announcements',
    },
    { lable: 'Read', value: 'Read' },
    { lable: 'Unread', value: 'Unread' },
  ];

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <Header className="flex justify-between items-center bg-transparent px-0 header-trash">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
          Notifications
        </p>
      </Header>
      <Content className="flex flex-col gap-y-6">
        <div className="flex justify-between items-center cus-notification">
          <div className="flex cus-notification-mb">
            <ButtonCustom
              className="w-[118px] h-[34px] rounded-3xl min-w-fit px-4"
              color={tab == 1 ? 'orange' : ''}
              onClick={() => setTab(1)}
            >
              Notification
            </ButtonCustom>
            <ButtonCustom
              className="w-[118px] h-[34px] rounded-3xl px-4 ml-4 min-w-fit"
              color={tab == 2 ? 'orange' : ''}
              onClick={() => setTab(2)}
            >
              Announcement
            </ButtonCustom>
          </div>
          <div className="flex gap-4 items-center flex-wrap sm:flex-col">
            {
              <div className="flex gap-4 items-center flex-wrap sm:w-full">
                <p className="font-fontFamily font-bold mb-0">Filter</p>
                <SelectCustom
                  placeholder="All"
                  color="transparent"
                  className="min-w-[120px]"
                  value={
                    tab === 2
                      ? filter === 'All Notifications'
                        ? 'All Announcements'
                        : filter
                      : filter === 'All Announcements'
                      ? 'All Notifications'
                      : filter
                  }
                  onChange={(e) => setFilter(e)}
                  options={optionsFilter}
                />
              </div>
            }
            <div className=" flex items-center flex-wrap gap-4 sm:w-full">
              <p className="font-fontFamily font-bold mb-0">View Item</p>
              <SelectCustom
                color="transparent"
                value={limit}
                onChange={(e) => setLimit(e)}
                options={optionsLimit}
              />
            </div>
          </div>
        </div>
        {tab == 1 ? (
          <NotificationList limit={limit} filter={filter} />
        ) : (
          <AnnoucementList limit={limit} filter={filter} />
        )}
      </Content>
    </Layout>
  );
};

export default Notifications;
