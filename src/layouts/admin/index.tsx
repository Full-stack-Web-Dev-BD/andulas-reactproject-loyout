import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { getStudentProfile } from 'api/student';
import { getTeacherProfileOfCentreAdmin } from 'api/teacher';
import { getProfileMe, getProfileTeacher, IUser } from 'api/user';
// import images from 'assets/images';
import { ReactComponent as NarrowLeftSVG } from 'assets/images/arrowLeftOutLined.svg';
import { ReactComponent as NarrowRightSVG } from 'assets/images/arrowRightOutLined.svg';
import { ROUTES } from 'constants/index';
import { AppContext } from 'context';
import { FC, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Drawer from './Drawer';
import Header from './Header';
import Sidebar from './Sidebar';
import SidebarMobile from './SidebarMobile';
import SidebarUserMobile from './SidebarUserMobile';
import './style.css';
interface Props {
  children?: ReactElement;
}

const events = ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress'];

const DefaultLayoutAdminPage: FC<Props> = ({ children }) => {
  const history = useNavigate();
  const { pathname } = useLocation();
  const { id } = useParams();
  const [collapsed, setCollapse] = useState<boolean>(false);
  const [isShowSidebarMobile, setIsShowSidebarMobile] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);
  const isDisableNavigate = !!(
    (id && pathname.includes(ROUTES.teacher_detail) && pathname.includes(ROUTES.view_as)) ||
    (pathname.includes(ROUTES.student_detail) && pathname.includes(ROUTES.view_as))
  );
  const isViewAsStudent = !!(
    id &&
    pathname.includes(ROUTES.student_detail) &&
    pathname.includes(ROUTES.view_as)
  );
  const [state, setState]: any = useContext(AppContext);
  const isAdmin = !!state?.user?.centreAdmin;
  const adminId = state?.user?.centreAdmin?.id;
  const isUpdatedProfile =
    (state?.user?.centreAdmin && !state?.user?.centreAdmin?.isUpdatedProfile) ||
    (state?.user?.teacher && !state?.user?.teacher?.isUpdatedProfile);
  const checkColor = useCallback((color: string) => {
    if (CSS.supports('color', color)) {
      return true;
    }
    return;
  }, []);

  const { mutate: mutateGetProfileMe } = useMutation('getProfileMe', getProfileMe, {
    onSuccess: ({ data }: { data: IUser }) => {
      setState({
        ...state,
        themeMain: data.theme,
        commonTemplate: data?.commonTemplate?.templateSetups,
        sidebarMenus: data?.userRole?.sidebarMenus,
        user: data,
      });
      if (data?.centreAdmin && !data?.centreAdmin?.isChangedPassword) {
        history(ROUTES.new_password, { state: { isFirstLogin: true } });
        return;
      }

      if (data?.teacher && !data?.teacher?.isChangedPassword) {
        history(ROUTES.new_password, {
          state: { isFirstLogin: true, isChangePasswordTeacher: true },
        });
        return;
      }

      if (data?.teacher && !data?.teacher?.isUpdatedProfile) {
        history(ROUTES.profile_teacher_login_first_time);
        return;
      }

      if (data?.centreAdmin && !data?.centreAdmin?.isUpdatedProfile) {
        history(ROUTES.profile_admin_login_first_time);
      }
    },
  });

  const { mutate: mutateGetProfileTeacher } = useMutation('getProfileTeacher', getProfileTeacher, {
    onSuccess: ({ data }: { data: IUser }) => {
      setState({
        ...state,
        themeMain: data.theme,
        commonTemplate: data?.commonTemplate?.templateSetups,
        sidebarMenus: data?.userRole?.sidebarMenus,
        user: data,
      });
    },
  });

  const { mutate: getProfileOfCentreAdmin } = useMutation(
    'getTeacherProfileOfCentreAdmin',
    getTeacherProfileOfCentreAdmin,
    {
      onSuccess: ({ data }: { data: IUser }) => {
        setState({
          ...state,
          themeMain: data.theme,
          commonTemplate: data?.commonTemplate?.templateSetups,
          sidebarMenus: data?.userRole?.sidebarMenus,
          user: data,
        });
      },
    },
  );

  const { mutate: mutateGetStudentProfile } = useMutation('getStudentProfile', getStudentProfile, {
    onSuccess: ({ data }: { data: IUser }) => {
      setState({
        ...state,
        themeMain: data.theme,
        commonTemplate: data?.commonTemplate?.templateSetups,
        sidebarMenus: data?.userRole?.sidebarMenus,
        user: data,
      });
    },
  });

  useEffect(() => {
    mutateGetProfileMe();
  }, []);

  useEffect(() => {
    if (isDisableNavigate && id) {
      if (adminId && isAdmin) {
        getProfileOfCentreAdmin({ id: Number(id), adminId: Number(adminId) });
        return;
      }

      if (isViewAsStudent) {
        setTimeout(() => {
          mutateGetStudentProfile({ id: Number(id) });
        }, 100);
        return;
      }

      setTimeout(() => {
        mutateGetProfileTeacher(Number(id));
      }, 100);
    }
  }, [isDisableNavigate, id, isAdmin, adminId, isViewAsStudent]);

  useEffect(() => {
    if (state?.themeMain) {
      const theme = state.themeMain.themeSetups;
      if (theme?.topMenuBarColor && checkColor(theme?.topMenuBarColor)) {
        document.documentElement.style.setProperty('--main-top-menu-bar', theme?.topMenuBarColor);
      }
      if (theme?.searchBarColor && checkColor(theme?.searchBarColor)) {
        document.documentElement.style.setProperty('--main-search-bar', theme?.searchBarColor);
      }
      if (theme?.leftMenuBarColor && checkColor(theme?.leftMenuBarColor)) {
        document.documentElement.style.setProperty(
          '--main-left-menu-bg-bar',
          theme?.leftMenuBarColor,
        );
      }
      if (theme?.leftMenuExtendBackground && checkColor(theme?.leftMenuExtendBackground)) {
        document.documentElement.style.setProperty(
          '--main-left-menu-extend-bg-bar',
          theme?.leftMenuExtendBackground,
        );
      }
      if (theme?.leftMenuFontAndIcon && checkColor(theme?.leftMenuFontAndIcon)) {
        document.documentElement.style.setProperty(
          '--main-left-menu-font-icon',
          theme?.leftMenuFontAndIcon,
        );
      }
      if (theme?.leftMenuHighlightColor && checkColor(theme?.leftMenuHighlightColor)) {
        document.documentElement.style.setProperty(
          '--main-left-menu-highlight-color',
          theme?.leftMenuHighlightColor,
        );
      }
      if (theme?.leftMenuHighlightStripeColor && checkColor(theme?.leftMenuHighlightStripeColor)) {
        document.documentElement.style.setProperty(
          '--main-left-menu-highlight-stripe-color',
          theme?.leftMenuHighlightStripeColor,
        );
      }
      if (theme?.backgroundColor && checkColor(theme?.backgroundColor)) {
        document.documentElement.style.setProperty(
          '--main-background-color',
          theme?.backgroundColor,
        );
      }
      if (theme?.fontColor && checkColor(theme?.fontColor)) {
        document.documentElement.style.setProperty('--main-font-color', theme?.fontColor);
      }
      if (theme?.fontFamily) {
        document.documentElement.style.setProperty(
          '--main-font-family',
          theme?.fontFamily + ',' + 'sans-serif',
        );
      }
      if (theme?.buttonColor && checkColor(theme?.buttonColor)) {
        document.documentElement.style.setProperty('--main-button-color', theme?.buttonColor);
      }
      if (theme?.profileDrawerBackground && checkColor(theme?.profileDrawerBackground)) {
        document.documentElement.style.setProperty(
          '--main-profile-drawer-bg',
          theme?.profileDrawerBackground,
        );
      }
      if (theme?.extendNarrow && checkColor(theme?.extendNarrow)) {
        document.documentElement.style.setProperty('--main-extend-narrow-bg', theme?.extendNarrow);
      }
      if (theme?.mainBackgroundColor && checkColor(theme?.mainBackgroundColor)) {
        document.documentElement.style.setProperty(
          '--main-layout-background-color',
          theme?.mainBackgroundColor,
        );
      }
    }
  }, [state]);

  const toggle = () => {
    setCollapse(!collapsed);
  };

  const drawerToggle = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    document.title = 'Admin Portal';
  }, []);

  let timer: NodeJS.Timeout | undefined;

  const resetTimer = () => {
    if (timer) clearTimeout(timer);
  };

  const logoutAction = () => {
    window.location.href = '/login';
    sessionStorage.clear();
    localStorage.clear();
  };

  const handleLogoutTimer = () => {
    timer = setTimeout(() => {
      resetTimer();
      Object.values(events).forEach((item) => {
        window.removeEventListener(item, resetTimer);
      });

      logoutAction();
    }, 1800000);
  };

  useEffect(() => {
    if (!localStorage.getItem('isRemember')) {
      Object.values(events).forEach((item) => {
        window.addEventListener(item, () => {
          resetTimer();
          handleLogoutTimer();
        });
      });
    }
  }, []);

  useEffect(() => {
    if (!window.location.pathname.includes('/settings/themes')) {
      setState({ ...state, preview: {} });
    }
  }, [window.location.pathname]);

  return (
    <Layout>
      <Header
        isViewAsStudent={isViewAsStudent}
        isDisableNavigate={isDisableNavigate}
        drawerToggle={drawerToggle}
        visible={visible}
        getProfileMe={mutateGetProfileMe}
        isOpenSidebarMobile={isShowSidebarMobile}
        setIsOpenSidebarMobile={setIsShowSidebarMobile}
      />
      <Layout
        className={`${
          state?.preview?.mainBackgroundColor
            ? 'bg-preview-theme-layout-background-color'
            : 'bg-main-layout-background-color'
        }`}
      >
        <Sidebar isDisableNavigate={isDisableNavigate} collapsed={collapsed} pathname={pathname} />
        <SidebarMobile
          isDisableNavigate={isDisableNavigate}
          collapsed={collapsed}
          pathname={pathname}
          isOpen={isShowSidebarMobile}
          setIsOpen={setIsShowSidebarMobile}
        />
        <Layout
          className={`site-layout mt-16  relative bg-transparent margin-left-0 ${
            !collapsed ? `ml-[200px] delay-150` : `ml-[78px] `
          } sm:ml-0`}
        >
          <div
            className="absolute left-[-15px] z-20 top-1 narrow-collapse-menu sm:hidden isHide"
            onClick={toggle}
          >
            {!collapsed ? <NarrowLeftSVG /> : <NarrowRightSVG />}
          </div>
          <Content
            className={`rounded-3xl flex cus__width-padding !font-fontFamily justify-center lg:min-h-[calc(100vh-65px)] lg:h-auto  h-[calc(100vh-65px)] overflow-y-auto custom-height shadow-[0px_0px_8px_rgba(0,0,0,0.04)] ${
              state?.preview?.backgroundColor
                ? `bg-preview-theme-background-color`
                : 'bg-main-background-color'
            }`}
          >
            <div className="w-[1040px] max-w-full">{children}</div>
          </Content>
        </Layout>
        <Drawer
          isDisableNavigate={isDisableNavigate}
          collapsed={isUpdatedProfile ? true : visible}
        ></Drawer>
        <SidebarUserMobile
          isDisableNavigate={isDisableNavigate}
          collapsed={isUpdatedProfile ? true : visible}
          setVisible={setVisible}
        ></SidebarUserMobile>
      </Layout>
    </Layout>
  );
};

export default DefaultLayoutAdminPage;
