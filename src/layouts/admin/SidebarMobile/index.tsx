import React, { useContext, useEffect, useState } from 'react';
// import images from 'assets/images';
import { Divider, Form, Input, Layout, Menu, MenuProps, Select } from 'antd';
import { ReactComponent as AccessControlSVG } from 'assets/images/accessControl.svg';
import { ReactComponent as AdminSVG } from 'assets/images/admin.svg';
import { ReactComponent as AnnouncementSVG } from 'assets/images/announcement.svg';
import { ReactComponent as CalendarSVG } from 'assets/images/calendar.svg';
import { ReactComponent as CommunityLibrarySVG } from 'assets/images/communityLibrary.svg';
import { ReactComponent as ContentManagementSVG } from 'assets/images/contentManagement.svg';
import { ReactComponent as CourseSVG } from 'assets/images/course.svg';
import { ReactComponent as DashboardSVG } from 'assets/images/dashboard.svg';
import { ReactComponent as HQLibrarySVG } from 'assets/images/HQLibrary.svg';
import { ReactComponent as LettersSVG } from 'assets/images/letters.svg';
import { ReactComponent as MyDriveSVG } from 'assets/images/myDrive.svg';
import { ReactComponent as ReportsSVG } from 'assets/images/reports.svg';
import { ReactComponent as SettingSVG } from 'assets/images/setting.svg';
import { ReactComponent as StudentSVG } from 'assets/images/student.svg';
import { ReactComponent as TeacherSVG } from 'assets/images/teacher.svg';
import { ReactComponent as ClassManagementSVG } from 'assets/images/classManagement.svg';
import { ReactComponent as ClassForumSVG } from 'assets/images/classForum.svg';
import { ReactComponent as ClassLibrarySVG } from 'assets/images/classLibrary.svg';
import { ReactComponent as MygroupSVG } from 'assets/images/myGroup.svg';
import { ReactComponent as TodoListSVG } from 'assets/images/todoList.svg';
import { ReactComponent as MessagesSVG } from 'assets/images/messages.svg';
import { ReactComponent as StudentListSVG } from 'assets/images/studentList.svg';
import { ReactComponent as AttendanceSVG } from 'assets/images/attendance.svg';

import { ROUTES } from 'constants/constants';
import { IMenuAccess, IMenuSideBar } from 'constants/index';
import { AppContext } from 'context';
import { useNavigate } from 'react-router-dom';
import '../Sidebar/style.css';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import images from 'assets/images';
import { CloseOutlined } from '@ant-design/icons';

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

const initMenus = [
  { icon: <DashboardSVG />, path: ROUTES.dashboard },
  { icon: <ClassManagementSVG />, path: ROUTES.class_management },
  { icon: <CourseSVG />, path: ROUTES.courses },
  { icon: <StudentSVG />, path: ROUTES.student },
  { icon: <TeacherSVG />, path: ROUTES.teacher },
  { icon: <AdminSVG />, path: ROUTES.admin },
  { label: null, icon: <Divider /> },
  { icon: <LettersSVG />, path: ROUTES.letters },
  { icon: <CalendarSVG />, path: ROUTES.calendar },
  { icon: <AnnouncementSVG />, path: ROUTES.announcement },
  { icon: <ReportsSVG />, path: ROUTES.reports },
  { label: null, icon: <Divider /> },
  { icon: <MyDriveSVG />, path: ROUTES.my_driver },
  { icon: <HQLibrarySVG />, children: null, path: ROUTES.hq_library },
  { icon: <CommunityLibrarySVG />, path: ROUTES.community_library },
  { icon: <ContentManagementSVG />, path: ROUTES.content_management },
  { label: null, icon: <Divider /> },
  { icon: <SettingSVG />, path: ROUTES.setting },
  { icon: <AccessControlSVG />, path: ROUTES.access_control },
];

export const classManagementMenus = [
  { label: 'Dashboard', path: ROUTES.dashboard, icon: <DashboardSVG />, children: null },
  { label: 'Calendar', path: ROUTES.calendar, icon: <CalendarSVG />, children: null },
  { label: 'Class Forum', path: ROUTES.class_forum, icon: <ClassForumSVG />, children: null },
  { label: 'Class Library', path: ROUTES.class_library, icon: <ClassLibrarySVG />, children: null },
  { label: 'My Group', path: ROUTES.my_group, icon: <MygroupSVG />, children: null },
  { label: 'To-do List', path: ROUTES.todo_list, icon: <TodoListSVG />, children: null },
  { label: 'Messages', path: ROUTES.messages, icon: <MessagesSVG />, children: null },
  { label: 'Student List', path: ROUTES.student_list, icon: <StudentListSVG />, children: null },
  { label: 'Attendance', path: ROUTES.attendance, icon: <AttendanceSVG />, children: null },
];

interface ISidebar {
  collapsed?: boolean;
  isDisableNavigate: boolean;
  pathname: string;
  isOpen: boolean;
  setIsOpen: any;
}

const SidebarMobile = (props: ISidebar) => {
  const { collapsed, isDisableNavigate, pathname, isOpen, setIsOpen } = props;
  const [menus, setMenus] = useState<Array<IMenuSideBar>>([]);
  const [stateContext]: any = useContext(AppContext);

  const items: MenuProps['items'] = menus.map((item: IMenuSideBar) => {
    return getItem(item.label, item.path, item.icon, item.children);
  });
  const [keyOpen, setKeyOpen] = useState(['10']);
  const history = useNavigate();
  const isUpdatedProfile =
    (stateContext?.user?.centreAdmin && !stateContext?.user?.centreAdmin?.isUpdatedProfile) ||
    (stateContext?.user?.teacher && !stateContext?.user?.teacher?.isUpdatedProfile);

  const onDirection = (keyPath: string[]) => {
    if (!isDisableNavigate) {
      const path = keyPath[0];
      const pathName = pathname.split('/').filter((x) => x);

      if (path) {
        if (
          stateContext?.user?.userRole?.roleName === 'Teacher' &&
          (path.includes('community-library') || path.includes('hq-library'))
        ) {
          history(`${path}/teacher`);
          setIsOpen(false)
          return;
        }

        if (
          pathName.length >= 2 &&
          pathName[0].includes('class-management') &&
          !isNaN(Number(pathName[1]))
        ) {
          history(`/${pathName[0]}/${pathName[1]}${path}`);
          setIsOpen(false)
          return;
        }
        history(path);
        setIsOpen(false)
      }
    }
  };

  useEffect(() => {
    const path = pathname.split('/').filter((x) => x);
    if (path.length > 2 && path[0].includes('class-management') && !isNaN(Number(path[1]))) {
      setMenus(classManagementMenus);
      return;
    }

    if (stateContext?.sidebarMenus) {
      const newMenu: Array<IMenuSideBar> = [];
      initMenus?.filter(function (initMenu) {
        const menu = stateContext?.sidebarMenus.find(
          (s: { resourcePath: string | undefined }) => s.resourcePath === initMenu.path,
        );
        if (menu) {
          if (
            stateContext?.user?.userRole?.roleName === 'Student' &&
            menu?.resourcePath === '/courses'
          ) {
            if (!(menu?.menuChildren?.find((e: IMenuAccess) => e?.resourcePath === ROUTES.my_course))) {
              menu.menuChildren = [
                ...menu?.menuChildren,
                {
                  id: 1000,
                  menuName: 'my courses',
                  menuParentID: 2,
                  menuChildren: [],
                  resourcePath: ROUTES.my_course,
                },
              ];
            }
          }
          const submenu =
            menu.menuChildren.length > 0
              ? menu.menuChildren.map((level2: IMenuAccess) => ({
                label: level2.menuName,
                key: level2.resourcePath,
                path: level2.resourcePath,
                icon: null,

                children:
                  level2.menuChildren.length > 0
                    ? level2.menuChildren.map((level3: IMenuAccess) => ({
                      label: level3.menuName,
                      key: level3.resourcePath,
                      path: level3.resourcePath,
                      icon: null,
                      children: null,
                    }))
                    : null,
              }))
              : null;
          newMenu.push({
            label: menu.menuName,
            ...initMenu,
            children: submenu,
          } as IMenuSideBar);
        }
      });
      setMenus(newMenu);
    }
  }, [stateContext?.sidebarMenus, pathname]);

  const onChangeOpen = (value: string[]) => {
    if (value.length > 1) {
      if (value[value.length - 1] == ROUTES.setting) {
        history(value[value.length - 1]);
        setIsOpen(false)
      }
    }
  };

  return (
    <Layout.Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className={`w-full max-w-full bg-white font-fontFamily font-semibold uppercase not-italic tracking-[0.02em] overflow-y-auto min-h-[calc(100vh-64px)] fixed left-0 top-0 bottom-0 overflow-x-hidden z-30 layout-sidebar ${isOpen ? 'block' : 'hidden'}`}
    >
        <CloseOutlined className='flex justify-end mr-3 my-4 text-xl' onClick={() => setIsOpen(false)}/>
        <div className="relative m-2">
          <Form.Item name="search" className="mb-0">
            <Input className="style_input_custom_login_page" placeholder="Search..." />
          </Form.Item>
          <img
            src={images.search}
            alt="search"
            className="absolute top-[50%] right-[2%] cursor-pointer translate-y-[-50%]"
          />
        </div>
        <Form.Item
          name="method"
          className="m-2 mb-0"
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
      <Menu
        className="h-full border-r-0 text-xs menu-sidebar"
        mode="inline"
        defaultSelectedKeys={['0']}
        defaultOpenKeys={['sub1']}
        onOpenChange={(value) => {
          onChangeOpen(value);
          setKeyOpen(value);
        }}
        onSelect={({ keyPath }) => setKeyOpen(keyPath)}
        openKeys={keyOpen}
        selectedKeys={keyOpen}
        items={isUpdatedProfile ? [] : (items as ItemType[])}
        onClick={({ keyPath }) => {
          onDirection(keyPath);
        }}
      ></Menu>
    </Layout.Sider>
  );
};

export default SidebarMobile;
