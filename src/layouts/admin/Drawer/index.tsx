import { Layout, Menu, MenuProps } from 'antd';
import ModalCustom from 'components/Modal';
import { IMenuSideBar } from 'constants/index';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ISidebar {
  collapsed: boolean;
  isPreview?: boolean;
  isDisableNavigate?: boolean;
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

const Drawer = (props: ISidebar) => {
  const { collapsed, isPreview, isDisableNavigate } = props;
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
      if (path) history(path);
    }
  };

  return (
    <Layout.Sider
      collapsible
      collapsedWidth={0}
      collapsed={collapsed}
      trigger={null}
      className={`rounded-tl-3xl rounded-bl-3xl ${
        isPreview && !collapsed
          ? 'bg-preview-theme-profile-drawer-bg ml-4 preview-profile-drawer'
          : !collapsed
          ? 'bg-main-profile-drawer-bg mt-16'
          : ''
      } sm:hidden`}
    >
      <Menu
        onClick={({ keyPath }) => {
          onDirection(keyPath);
        }}
        items={items}
        className="text-right bg-transparent mt-2 font-fontFamily font-semibold text-xs not-italic pr-4"
      ></Menu>
      {isPreview || isDisableNavigate ? (
        <div
          className="cursor-pointer text-main-left-menu-color logout-menu-item mt-4 pr-8 text-xs font-fontFamily text-right font-semibold"
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
              className="cursor-pointer mt-4 text-main-left-menu-color logout-menu-item text-xs pr-8 font-fontFamily font-semibold text-right"
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

export default Drawer;
