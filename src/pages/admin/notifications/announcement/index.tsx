import { Form, Table, TablePaginationConfig, Tooltip } from 'antd';
import {
  countAnnouncement,
  getAnnouncement,
  IParamsSearch,
  readAnnouncement,
} from 'api/announcement';
import PaginationCustom from 'components/Pagination';
import { AppContext } from 'context';
import moment from 'moment';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import ModalDetail from '../component/ModalDetail';

import './cus-announcement.css';

export interface IAnnouncementInfo {
  limit?: number;
  page?: number;
  search?: string;
  total?: number;
  listAnnouncement?: {
    id: number;
    key?: string;
    message: string;
    author: string;
    createdAt: string;
    isRead: string;
  }[];
}

export interface IAnnouncementDetail {
  id: number;
  key?: string;
  title?: string;
  message?: string;
  author?: string;
  recipients?: string[];
  announcementDate?: string;
  endAnnouncementDate?: string;
  createdAt: string;
  isRead: string;
}

export interface ConfigBellAnnouncement extends IAnnouncementDetail {
  sortTime: Date;
}

const AnnouncementList = ({ limit, filter }: { limit?: string; filter?: string }) => {
  const queryClient = useQueryClient();
  const [dataList, setDataList] = useState<IAnnouncementInfo>({ listAnnouncement: [] });
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: Number(limit),
  });
  const [announcementSelected, setAnnouncementSelected] = useState<IAnnouncementDetail>();
  const [current, setCurrent] = useState(1);
  const [order, setOrder] = useState<string>();
  const [state, setState]: any = useContext(AppContext);

  const [from] = Form.useForm();
  const { mutate: listAnnouncement } = useMutation('listAnnouncement', getAnnouncement, {
    onSuccess(data, variables, context) {
      const addKeyList = data.data.listAnnouncement.map((item: any) => {
        return {
          ...item,
          key: item.id,
          author: `${item.author?.userProfile?.firstName} ${item.author?.userProfile?.lastName}`,
        };
      });
      setDataList({ ...data.data, listAnnouncement: addKeyList });
      setPagination({
        ...pagination,
        current: data.data.page,
        total: data?.data?.total,
      });
    },
  });

  const countUnreadAnnouncement = useQuery(
    ['countUnreadAnnouncement', state?.user?.id],
    async () => {
      const res = await countAnnouncement();
      return res.data;
    },
    {
      enabled: !!state?.user?.id,
      refetchOnWindowFocus: 'always',
      refetchOnReconnect: 'always',
    },
  );

  const fetchAnnouncement = useQuery({
    queryKey: ['getListAnnoucement', { pagination, filter, state: state?.countAnnouncement }],
    queryFn: async () => {
      const res = await getAnnouncement({
        limit: Number(pagination.pageSize),
        page: Number(pagination.current),
        order: 'DESC',
        sort: 'createdAt',
        filters: `[{"status": "Ongoing", "isCurrent": true, "isRead": "${filter || ''}"}]`,
      });
      return res.data;
    },
  });

  const { mutate: readAnnounce } = useMutation('readAnnoucement', readAnnouncement, {
    onSuccess(data, variables, context) {
      countUnreadAnnouncement.refetch();
      fetchAnnouncement.refetch();
    },
  });

  useEffect(() => {
    if (fetchAnnouncement?.data?.listAnnouncement) {
      const addKeyList = fetchAnnouncement?.data?.listAnnouncement.map((item: any) => {
        return {
          ...item,
          key: item.id,
          author: `${item.author?.userProfile?.firstName} ${item.author?.userProfile?.lastName}`,
        };
      });
      setDataList({ ...fetchAnnouncement?.data, listAnnouncement: addKeyList });
      if (
        Number(pagination.current) >
        Math.ceil(fetchAnnouncement?.data?.total / fetchAnnouncement?.data?.limit)
      ) {
        setPagination({
          ...pagination,
          current: Math.ceil(fetchAnnouncement?.data?.total / fetchAnnouncement?.data?.limit),
          total: undefined,
        });
      } else {
        setPagination({
          ...pagination,
          total: fetchAnnouncement?.data?.total,
        });
      }
    }
  }, [fetchAnnouncement?.data?.listAnnouncement]);

  useEffect(() => {
    setState({
      ...state,
      countAnnouncement: countUnreadAnnouncement.data,
    });
  }, [countUnreadAnnouncement.data]);

  useEffect(() => {
    setPagination({
      ...pagination,
      pageSize: Number(limit),
      current: 1,
    });
  }, [limit, filter]);

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

  const columns = [
    {
      title: <>Announcement</>,
      dataIndex: 'title',
      key: 'title',
      width: '45%',
      render: (text: string, recordValue: IAnnouncementDetail) => (
        <Tooltip title={text}>
          <span
            className={`title_annoucement_fix_width noti-content ${
              recordValue.isRead ? 'text-[#AEA8A5]' : 'cursor-pointer'
            }`}
            style={{ width: 470 }}
          >{`${text} by ${recordValue.author} at ${moment(recordValue.createdAt).format(
            'YYYY/MM/DD, h:mm a',
          )}`}</span>
        </Tooltip>
      ),
    },
    {
      title: <>Author</>,
      dataIndex: 'author',
      key: 'author',
      width: '15%',
      render: (text: string, recordValue: IAnnouncementDetail) => (
        <span
          className={`noti-content ${recordValue.isRead ? 'text-[#AEA8A5]' : 'cursor-pointer'}`}
        >
          {text}
        </span>
      ),
    },
    {
      title: <>Posted Date & Time</>,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string, recordValue: IAnnouncementDetail) => (
        <div className={`noti-content ${recordValue.isRead ? 'text-[#AEA8A5]' : 'cursor-pointer'}`}>
          {moment(text).format('YYYY/MM/DD, h:mm a')}
        </div>
      ),
      width: '30%',
    },
  ];

  return (
    <>
      <Table
        columns={columns as any}
        dataSource={dataList?.listAnnouncement}
        pagination={false}
        className={`bg-transparent table-component cursor-pointer cus-announcement-sp`}
        onRow={(record) => ({
          onClick: () => {
            setAnnouncementSelected(record);
          },
        })}
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
              setCurrent(page);
              setPagination({ ...pagination, current: Number(page) });
              fetchAnnouncement.refetch();
            }}
            onLastPage={() => {
              const currentPage = Math.ceil(Number(pagination.total) / Number(pagination.pageSize));
              setPagination({
                ...pagination,
                current: pageSize,
              });
              setCurrent(currentPage);
              fetchAnnouncement.refetch();
            }}
            onFirstPage={() => {
              setPagination({ ...pagination, current: 1 });
              setCurrent(1);
              fetchAnnouncement.refetch();
            }}
          ></PaginationCustom>
        </div>
      )}
      <ModalDetail
        data={announcementSelected}
        form={from}
        visible={announcementSelected ? true : false}
        // content={`Are you sure you want to restore ${isShowRestore}?`}
        onCancel={async () => {
          if (announcementSelected) {
            readAnnounce(announcementSelected.id);
          }
          setAnnouncementSelected(undefined);
        }}
      />
    </>
  );
};

export default AnnouncementList;
