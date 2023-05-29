import { ArrowLeftOutlined, MenuOutlined } from '@ant-design/icons';
import { Badge, Dropdown, Form, Input, Layout, Menu, Select } from 'antd';
import {
  ConfigBellNotification,
  getCountUnreadNotification,
  getNotification,
  updateNotificationStatus,
  UserNotification,
} from 'api/notification';
import images from 'assets/images';
import CustomTooltip from 'components/Tooltip';
import { ROUTES } from 'constants/index';
import { AppContext } from 'context';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import './style.css';
import { countAnnouncement, getAnnouncement, readAnnouncement } from 'api/announcement';
import ModalDetail from 'pages/admin/notifications/component/ModalDetail';
import {
  ConfigBellAnnouncement,
  IAnnouncementDetail,
} from 'pages/admin/notifications/announcement';
// import '.../styles/fix-style.css'
interface IHeader {
  drawerToggle?: () => void;
  visible?: boolean;
  isDisableNavigate: boolean;
  isViewAsStudent: boolean;
  getProfileMe: () => void;
  isOpenSidebarMobile: boolean;
  setIsOpenSidebarMobile: any;
}

const Header = (props: IHeader) => {
  const {
    drawerToggle,
    visible,
    isDisableNavigate,
    isViewAsStudent,
    getProfileMe,
    isOpenSidebarMobile,
    setIsOpenSidebarMobile,
  } = props;
  const [state, setState]: any = useContext(AppContext);
  const { id } = useParams();
  const history = useNavigate();
  const logoUrl = state?.commonTemplate?.logoUrl;
  const logoHeight = state?.commonTemplate?.logoHeight || '47px';
  const [showDropdownNoti, setShowDropdownNoti] = useState(false);
  const [dataListAnnouncement, setDataListAnnouncement] = useState<ConfigBellAnnouncement[]>([]);
  const [dataListNotification, setDataListNotification] = useState<ConfigBellNotification[]>([]);
  const [dataList, setDataList] = useState<any[]>([]);
  const [announcementSelected, setAnnouncementSelected] = useState<ConfigBellNotification>();
  // const [count, setCount] = useState<number>(0)
  const [from] = Form.useForm();

  useEffect(() => {
    if (logoHeight) {
      const logoSize = document.getElementById('logo');
      if (logoSize) {
        logoSize.style.height = logoHeight;
      }
    }
  }, [logoHeight]);

  const handleBackToAdmin = useCallback(() => {
    getProfileMe();
    if (isViewAsStudent) {
      history(ROUTES.student_detail + `/${id}`);
      return;
    }
    history(ROUTES.teacher_detail + `/${id}`);
  }, [isViewAsStudent, id]);

  const countUnreadNotification = useQuery(
    ['countUnreadNotification', state?.user?.id],
    async () => {
      const res = await getCountUnreadNotification();
      return res.data;
    },
    {
      enabled: !!state?.user?.id,
      refetchOnWindowFocus: 'always',
      refetchOnReconnect: 'always',
    },
  );

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

  useEffect(() => {
    setState({
      ...state,
      countNotification: countUnreadNotification.data,
      countAnnouncement: countUnreadAnnouncement.data,
    });
  }, [countUnreadNotification.data, countUnreadAnnouncement.data]);

  const count = useMemo(() => {
    return state.countNotification + state.countAnnouncement;
  }, [state]);

  useMemo(() => {
    if (dataListAnnouncement.length && dataListNotification.length) {
      const data = [...dataListAnnouncement, ...dataListNotification];
      const dataSort = data.sort((a, b) => {
        return moment(b.sortTime).unix() - moment(a.sortTime).unix();
      });
      dataSort.length = 4;
      setDataList(dataSort);
    }
  }, [dataListAnnouncement, dataListNotification]);

  const listNotification = useQuery(
    ['listNotification', state?.user?.id],
    async () => {
      const res = await getNotification({ limit: 4, page: 1, sort: 'createdAt' });
      return res.data;
    },
    {
      enabled: !!state?.user?.id && showDropdownNoti,
      refetchOnWindowFocus: 'always',
      refetchOnReconnect: 'always',
    },
  );

  const listAnnouncement = useQuery(
    ['listAnnouncement', state?.user?.id],
    async () => {
      const res = await getAnnouncement({
        limit: 4,
        page: 1,
        sort: 'createdAt',
        order: 'DESC',
        filters: `[{"status": "Ongoing", "isCurrent": true, "isRead": ""}]`,
      });
      return res.data;
    },
    {
      enabled: !!state?.user?.id && showDropdownNoti,
      refetchOnWindowFocus: 'always',
      refetchOnReconnect: 'always',
    },
  );
  useEffect(() => {
    if (listNotification?.data?.listNotification) {
      const handleData = listNotification?.data?.listNotification?.map(
        (item: ConfigBellNotification) => ({
          ...item,
          type: 'notification',
          sortTime: item.updatedAt,
        }),
      );
      setDataListNotification(handleData);
    }
  }, [listNotification?.data?.listNotification]);

  useEffect(() => {
    if (listAnnouncement?.data?.listAnnouncement) {
      const handleData = listAnnouncement?.data.listAnnouncement.map((item: any) => {
        return {
          ...item,
          key: item.id,
          author: `${item.author?.userProfile?.firstName} ${item.author?.userProfile?.lastName}`,
          type: 'announcement',
          sortTime: item.startDate,
        };
      });
      setDataListAnnouncement(handleData);
    }
  }, [listAnnouncement?.data?.listAnnouncement]);

  const { mutate: updateStatusNotification } = useMutation(
    'updateStatusNotification',
    updateNotificationStatus,
    {
      onSuccess(data, variables, context) {
        countUnreadNotification.refetch();
        const arr = dataList.map((item) => {
          if (item.id == data.data.id) {
            return {
              ...item,
              isRead: data.data.isRead,
            };
          } else return item;
        });
        setDataList(arr);
      },
    },
  );

  const { mutate: readAnnounce } = useMutation('readAnnoucement', readAnnouncement, {
    onSuccess(data, variables, context) {
      countUnreadAnnouncement.refetch();
    },
  });

  const handleReadAnnouncement = (recordValue: ConfigBellNotification) => {
    setAnnouncementSelected(recordValue);
    setShowDropdownNoti(false);
  };

  const menu = (
    <Menu className="w-[208px] custom-noti">
      {dataList.map((recordValue: any) => (
        <Menu.Item
          onClick={() => {
            if (recordValue.type === 'notification') {
              if (!recordValue.isRead) {
                updateStatusNotification(recordValue.id);
              }
            } else {
              handleReadAnnouncement(recordValue);
            }
          }}
          key={recordValue.id}
          className={`pr-3 header-noti-item ${
            recordValue.isRead ? 'header-noti-readed' : 'cursor-pointer'
          }`}
        >
          {recordValue.type === 'notification'
            ? `${recordValue.notification.actionType} ${recordValue.notification.nameType} ${
                recordValue.notification.content.includes('by')
                  ? 'by ' +
                    recordValue.notification.createdByUser.userProfile.firstName +
                    ' ' +
                    recordValue.notification.createdByUser.userProfile.lastName
                  : ''
              } at ${moment(recordValue.notification.createdAt).format('YYYY/MM/DD hh:mm a')}`
            : `${recordValue.title} by ${recordValue.author} at ${moment(
                recordValue.createdAt,
              ).format('YYYY/MM/DD, h:mm a')}`}
        </Menu.Item>
      ))}
      <Menu.Item
        className="text-[#ED7635] pr-3 btn-link"
        onClick={() => {
          history(ROUTES.notifications);
          setShowDropdownNoti(false);
        }}
      >
        See All...
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout.Header className="bg-[color:var(--main-top-menu-bar)] flex flex-row items-center justify-between py-3 pr-10 pl-6 fixed z-50 w-full custom-padding">
      <div className="w-[25%] sm:block lg:block md:block hidden">
        <MenuOutlined
          className={`hidden sm:block sm:block lg:block md:block cursor-pointer text-xl rounded-lg px-2.5 py-1.5 w-[20%]   ${
            isOpenSidebarMobile ? `bg-main-button-color text-white` : ``
          }`}
          onClick={() => setIsOpenSidebarMobile(!isOpenSidebarMobile)}
        />
      </div>
      <div className="flex flex-row items-center justify-start w-[25%]">
        <div className="logo bg-white flex items-center justify-center ">
          <img
            src={logoUrl ? logoUrl : images.logo}
            id="logo"
            alt="logo"
            className={`custom__w-135 object-contain`}
          />
        </div>
      </div>
      <div className="flex flex-row items-center w-[60%] ml-1 sm:hidden justify-center">
        <div className="relative w-[60%] mr-3 w-53">
          <Form.Item name="search" className="mb-0">
            <Input className="style_input_custom_login_page custom-font " placeholder="Search..." />
          </Form.Item>
          <img
            src={images.search}
            alt="search"
            className="absolute top-[50%] right-[2%] cursor-pointer translate-y-[-50%]"
          />
        </div>
        <Form.Item
          name="method"
          className="mb-0"
          rules={[{ required: true, message: 'Salutation Method is required!' }]}
        >
          <Select
            placeholder="Please select"
            allowClear
            className="text-[#32302D] font-fontFamily text-sm"
          >
            <Select.Option value="All Settings">All Settings</Select.Option>
            <Select.Option value="Student">Student</Select.Option>
          </Select>
        </Form.Item>
      </div>

      <div className="flex items-center gap-5 w-[25%] sm:gap-2 justify-end">
        {isDisableNavigate && (
          <CustomTooltip title="Back to Admin Portal">
            <ArrowLeftOutlined onClick={handleBackToAdmin} className="w-[40px] text-[1.5rem]" />
          </CustomTooltip>
        )}
        <Dropdown
          overlay={menu}
          visible={showDropdownNoti}
          trigger={['click']}
          onVisibleChange={setShowDropdownNoti}
        >
          <Badge
            count={count}
            overflowCount={9}
            className={showDropdownNoti ? 'badge-noti' : ''}
            color={showDropdownNoti ? '#fff' : '#ED7635'}
            offset={[1, 20]}
          >
            <img
              className="cursor-pointer"
              src={showDropdownNoti ? images.notiActive : images.noti}
              alt="Notification"
            />
          </Badge>
        </Dropdown>
        <img
          onClick={drawerToggle}
          className={`cursor-pointer rounded-lg ${
            !visible ? `bg-main-button-color text-white` : ``
          }`}
          src={!visible ? images.profileActive : images.profile}
          alt="Profile"
        />
      </div>

      <ModalDetail
        data={announcementSelected}
        form={from}
        visible={announcementSelected ? true : false}
        onCancel={async () => {
          if (announcementSelected) {
            readAnnounce(announcementSelected.id);
          }
          setAnnouncementSelected(undefined);
        }}
      />
    </Layout.Header>
  );
};

export default Header;
