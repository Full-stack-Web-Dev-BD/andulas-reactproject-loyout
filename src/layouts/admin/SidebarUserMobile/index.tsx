import { CloseOutlined } from '@ant-design/icons';
import { Layout, Menu, MenuProps } from 'antd';
import ModalCustom from 'components/Modal';
import { IMenuSideBar } from 'constants/index';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ISidebar {
  collapsed: boolean;
  isPreview?: boolean;
  isDisableNavigate?: boolean;
  setVisible?: any;
}

const menus = [
  { label: 'My Profile', path: '/profile/me', key: '1', children: null, icon: null },
  { label: 'Use Guide', path: '/guide', key: '2', children: null, icon: null },
  { label: 'Help Desk', path: '/help-desk', key: '3', children: null, icon: null },
  { label: 'Term of Use', path: '/term', key: '4', children: null, icon: null },
  { label: 'Privacy Policy', path: '/policy', key: '5', children: null, icon: null },
  {
    label: 'Report Vulnerability',
    path: '/report-vulnerability',
    key: '6',
    children: null,
    icon: null,
  },
  { label: 'Copyright', path: '/copyright', key: '7', children: null, icon: null },
];

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: Array<IMenuSideBar> | null,
  type?: 'group',
): MenuItem {
  return {
    label,
    key,
    icon,
    children,
    type,
  } as MenuItem;
}

const SidebarUserMobile = (props: ISidebar) => {
  const { collapsed, isPreview, isDisableNavigate, setVisible } = props;
  const history = useNavigate();

  const items: MenuProps['items'] = menus.map((item: IMenuSideBar) => {
    return getItem(item.label, item.path, item.icon, item.children);
  });

  const confirmLogout = useCallback(() => {
    window.location.href = '/login';
    sessionStorage.clear();
    localStorage.clear();
  }, [history]);

  const onDirection = (keyPath: string[]) => {
    if (!isDisableNavigate) {
      const path = keyPath[0];
      if (path) {
        history(path);
        setVisible(true)
      }
    }
  };

  return (
    <Layout.Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      className={`w-full max-w-full hidden ${
        isPreview && !collapsed
          ? 'bg-preview-theme-profile-drawer-bg ml-4 preview-profile-drawer'
          : !collapsed
          ? 'bg-main-profile-drawer-bg'
          : ''
      } ${!collapsed ? 'sm:block display-none' : 'sm:hidden '} fixed right-0 top-0 bottom-0 z-30 overflow-y-auto`}
    >
        <CloseOutlined className='flex justify-end mr-3 my-4 text-xl' onClick={() => setVisible(true)}/>
      <Menu
        onClick={({ keyPath }) => {
          onDirection(keyPath);
        }}
        items={items}
        className="text-left bg-transparent mt-2 font-fontFamily font-semibold text-xs not-italic px-4"
      ></Menu>
      {isPreview || isDisableNavigate ? (
        <div
          className="cursor-pointer text-main-left-menu-color logout-menu-item mt-4 pl-8 text-xs font-fontFamily text-left font-semibold"
          key="8"
        >
          Log Out
        </div>
      ) : (
        <ModalCustom
          cancelText="Cancel"
          okText="Confirm"
          onSubmit={confirmLogout}
          title="Log out"
          titleCenter
          viewComponent={
            <div
              className="cursor-pointer mt-4 text-main-left-menu-color logout-menu-item text-xs pl-8 font-fontFamily font-semibold text-left mb-4"
              key="8"
            >
              Log Out
            </div>
          }
        >
          <div>Are you sure you want to log out?</div>
        </ModalCustom>
      )}
    </Layout.Sider>
  );
};

export default SidebarUserMobile;
