import {
  Breadcrumb,
  Divider,
  Form,
  Input,
  Layout,
  Menu,
  MenuProps,
  notification,
  Select,
} from 'antd';
import { createTheme, editTheme, getTheme, IDataRequest } from 'api/theme';
import icons from 'assets/icons';
import images from 'assets/images';
import { ReactComponent as AccessControlSVG } from 'assets/images/accessControl.svg';
import { ReactComponent as AdminSVG } from 'assets/images/admin.svg';
import { ReactComponent as AnnouncementSVG } from 'assets/images/announcement.svg';
import { ReactComponent as NarrowLeftSVG } from 'assets/images/arrowLeftOutLined.svg';
import { ReactComponent as NarrowRightSVG } from 'assets/images/arrowRightOutLined.svg';
import { ReactComponent as CalendarSVG } from 'assets/images/calendar.svg';
import { ReactComponent as CommunityLibrarySVG } from 'assets/images/communityLibrary.svg';
import { ReactComponent as ContentManagementSVG } from 'assets/images/contentManagement.svg';
import { ReactComponent as CourseSVG } from 'assets/images/course.svg';
import { ReactComponent as DashboardSVG } from 'assets/images/dashboard.svg';
import { ReactComponent as HQLibrarySVG } from 'assets/images/HQLibrary.svg';
import { ReactComponent as MyDriveSVG } from 'assets/images/myDrive.svg';
import { ReactComponent as SettingSVG } from 'assets/images/setting.svg';
import { ReactComponent as StudentSVG } from 'assets/images/student.svg';
import { ReactComponent as TeacherSVG } from 'assets/images/teacher.svg';
import ButtonCustom from 'components/Button';
import CustomInput from 'components/Input';
import ModalCustom from 'components/Modal';
import { useOnClickOutside, WARNING_MESSAGE } from 'constants/index';
import { AppContext } from 'context';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ChromePicker, ColorResult } from 'react-color';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import usePrompt from 'constants/function';
import Drawer from 'layouts/admin/Drawer';
import './style.css';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: Array<{ label: string; icon: null; key: React.Key }> | null,
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

interface IState {
  themeName: string;
  templateID: number;
  themeID?: number;
  templateName: string;
}

const forms = [
  {
    label: 'Top Menu Bar',
    className: 'w-[476px] xl:w-full',
    name: 'topMenuBarColor',
    rules: [{ required: true, message: 'Top Menu Bar is required!' }],
  },
  {
    sectionLabel: 'Left Menu Bar',
    name: 'leftMenuBarColor',
    label: 'Left Menu Background Colour',
    className: 'item-half-width',
    rules: [{ required: true, message: 'Left Menu Background Colour is required!' }],
  },
  {
    label: 'Left Menu Font & Icon Colour',
    name: 'leftMenuFontAndIcon',
    className: 'item-half-width',
    rules: [{ required: true, message: 'Left Menu Font & Icon Colour is required!' }],
  },
  {
    name: 'leftMenuExtendBackground',
    label: 'Left Menu Highlight Background Colour',
    className: 'item-half-width',
    rules: [{ required: true, message: 'Left Menu Highlight Background Colour is required!' }],
  },
  {
    label: 'Left Menu Highlight Font & Icon Colour',
    name: 'leftMenuHighlightColor',
    className: 'item-half-width',
    rules: [{ required: true, message: 'Left Menu Highlight Font & Icon Colour is required!' }],
  },
  {
    label: 'Left Menu Highlight Stripe Colour',
    name: 'leftMenuHighlightStripeColor',
    className: 'item-half-width',
    rules: [{ required: true, message: 'Left Menu Highlight Stripe Colour is required!' }],
  },
  {
    label: 'Left Menu Collapsible/Expand Arrow',
    name: 'extendNarrow',
    className: 'item-half-width',
    rules: [{ required: true, message: 'Extend Narrow is required!' }],
  },
  {
    sectionLabel: 'General',
    label: 'Background Colour',
    name: 'backgroundColor',
    className: 'item-half-width',
    rules: [{ required: true, message: 'Background Colour is required!' }],
  },
  {
    label: 'Button Colour',
    name: 'buttonColor',
    className: 'item-half-width',
    rules: [{ required: true, message: 'Button Colour is required!' }],
  },
  {
    label: 'Main Background Colour',
    name: 'mainBackgroundColor',
    className: 'item-half-width',
    rules: [{ required: true, message: 'Main Background Colour is required!' }],
  },
  {
    label: 'Component Colour',
    name: 'componentColor',
    className: 'item-half-width',
    rules: [{ required: true, message: 'Component Colour is required!' }],
  },
  {
    label: 'Font Colour',
    name: 'fontColor',
    className: 'item-half-width',
    rules: [{ required: true, message: 'Font Colour is required!' }],
  },
  {
    label: 'Font',
    name: 'font',
    className: 'item-half-width',
    type: 'select',
    rules: [{ required: true, message: 'Font is required!' }],
  },
  {
    label: 'Profile Drawer Background Colour',
    name: 'profileDrawerBackground',
    className: 'item-half-width word-custom',
    rules: [{ required: true, message: 'Profile Drawer Background Colour is required!' }],
  },
  {
    label: 'Search Bar Background Colour',
    name: 'searchBarColor',
    className: 'item-half-width',
    rules: [{ required: true, message: 'Search Bar Background Colour is required!' }],
  },
];

const initialFormData = {
  topMenuBarColor: '#FFFFFF',
  leftMenuBarColor: '#FFFFFF',
  leftMenuExtendBackground: '#F7F5F4',
  leftMenuFontAndIcon: '#32302D',
  leftMenuHighlightColor: '#ED7635',
  leftMenuHighlightStripeColor: '#ED7635',
  backgroundColor: '#F7F5F4',
  buttonColor: '#ED7635',
  componentColor: '#FFFFFF',
  fontColor: '#32302D',
  font: 'Montserrat',
  searchBarColor: '#FFFFFF',
  profileDrawerBackground: '#FFFFFF',
  extendNarrow: '#FFFFFF',
  mainBackgroundColor: '#FFFFFF',
};

const menuLabels = [
  { label: 'Dashboard', icon: <DashboardSVG />, children: null, path: '/' },
  { label: 'Courses', icon: <CourseSVG />, children: null, path: '/courses' },
  { label: 'Student', icon: <StudentSVG />, children: null, path: '/student' },
  { label: 'Teacher', icon: <TeacherSVG />, children: null },
  { label: 'Admin', icon: <AdminSVG />, children: null },
  { label: null, icon: <Divider />, children: null },
  { label: 'Calendar', icon: <CalendarSVG />, children: null },
  { label: 'Announcement', icon: <AnnouncementSVG />, children: null },
  { label: null, icon: <Divider />, children: null },
  { label: 'My drive', icon: <MyDriveSVG />, children: null },
  {
    label: 'HQ Library',
    icon: <HQLibrarySVG />,
    children: [
      { label: 'HQ Library One', key: 'HQ Library One', icon: null, children: null },
      { label: 'HQ Library Two', key: 'HQ Library Two', icon: null, children: null },
    ],
  },
  {
    label: <span>Community Library</span>,
    icon: <CommunityLibrarySVG />,
  },
  { label: 'Content Management', icon: <ContentManagementSVG />, children: null },
  { label: null, icon: <Divider />, children: null },
  { label: 'Settings', icon: <SettingSVG />, children: null, path: '/settings' },
  { label: 'Access Control', icon: <AccessControlSVG />, children: null },
];

const optionFonts = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Meriweather', value: 'Meriweather' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Tahoma', value: 'Tahoma' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Times New Roman', value: 'Times New Roman ,serif' },
  { label: 'Georgia', value: 'Georgia ,serif' },
  { label: 'Garamond', value: 'Garamond ,serif' },
  { label: 'Courier New', value: 'Courier New ,monospace' },
  { label: 'Brush Script MT', value: 'Brush Script MT ,cursive' },
];

const items: MenuProps['items'] = menuLabels.map((item, index) => {
  return getItem(item.label, index, item.icon, item.children);
});

interface IField {
  item: {
    name: string;
    className: string;
    label: string;
    rules: Array<object>;
    type?: string;
    sectionLabel?: string;
  };
  handleChangeColor: (color: string, name: string) => void;
  colorValue: string;
}

const FieldItem = ({ item, handleChangeColor, colorValue }: IField) => {
  const [isOpenColorPicker, setIsOpenColorPicker] = useState<boolean>(false);
  const [color, setColor] = useState<string>('');
  const colorPicker = useRef(null);
  const buttonOpenColorPicker = useRef(null);

  const handleCloseColorPicker = useCallback(() => {
    setIsOpenColorPicker(false);
  }, []);

  useOnClickOutside(colorPicker, handleCloseColorPicker, buttonOpenColorPicker);

  const handleOpenColorPicker = useCallback(() => {
    setIsOpenColorPicker(!isOpenColorPicker);
  }, [isOpenColorPicker]);

  const onChangeColor = useCallback(
    (value: ColorResult) => {
      const colorRgba = `rgba(${value.rgb.r}, ${value.rgb.g}, ${value.rgb.b}, ${value.rgb.a})`;
      handleChangeColor(colorRgba, item.name);
      setColor(colorRgba);
    },
    [item],
  );

  useEffect(() => {
    setColor(colorValue);
  }, [colorValue]);

  return (
    <>
      {item.sectionLabel && (
        <span className="theme-title-section font-previewFontFamily !text-preview-theme-font-color">
          {item.sectionLabel}
        </span>
      )}
      <div className={item.className}>
        <Form.Item
          className="preview-field-item"
          name={item.name}
          colon={true}
          label={item.label}
          rules={item.rules}
        >
          {!item.type ? (
            <Input
              placeholder="Change color"
              className="style_input_custom_login_page"
              type="text"
              suffix={
                <img
                  ref={buttonOpenColorPicker}
                  className="cursor-pointer"
                  onClick={handleOpenColorPicker}
                  src={icons.open_color_icon}
                  alt="icon"
                />
              }
            />
          ) : (
            <Select
              placeholder="Please select"
              allowClear
              className="font-previewFontFamily text-sm"
            >
              {optionFonts.map((font, index) => (
                <Select.Option key={index} value={font.value}>
                  {font.label}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        {isOpenColorPicker && (
          <div className={`relative h-0 ${item.className}`} ref={colorPicker}>
            <Form.Item name={item.name}>
              <ChromePicker
                color={color}
                className="absolute bottom-[110px] left-[60%] z-50 custom-left custom-width-table-color sm:w-full sm:left-[0%] sm:top=[60%]"
                onChange={onChangeColor}
              />
            </Form.Item>
          </div>
        )}
      </div>
    </>
  );
};

const NewTheme = () => {
  const [form] = Form.useForm();
  const history = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const state = location.state as IState;
  const [isZoomOut, setIsZoomOut] = useState<boolean>(false);
  const [isOpenConfirmLeave, setIsOpenConfirmLeave] = useState<boolean>(true);
  const [keyOpen, setKeyOpen] = useState<string[]>(['10']);
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(true);
  const topMenuBarColor: string = Form.useWatch('topMenuBarColor', form);
  const searchBarColor: string = Form.useWatch('searchBarColor', form);
  const leftMenuBarColor: string = Form.useWatch('leftMenuBarColor', form);
  const leftMenuFontAndIcon: string = Form.useWatch('leftMenuFontAndIcon', form);
  const leftMenuHighlightColor: string = Form.useWatch('leftMenuHighlightColor', form);
  const leftMenuHighlightStripeColor: string = Form.useWatch('leftMenuHighlightStripeColor', form);
  const backgroundColor: string = Form.useWatch('backgroundColor', form);
  const buttonColor: string = Form.useWatch('buttonColor', form);
  const fontColor: string = Form.useWatch('fontColor', form);
  const fontFamily: string = Form.useWatch('font', form);
  const extendNarrow: string = Form.useWatch('extendNarrow', form);
  const profileDrawerBackground: string = Form.useWatch('profileDrawerBackground', form);
  const leftMenuExtendBackground: string = Form.useWatch('leftMenuExtendBackground', form);
  const mainBackgroundColor: string = Form.useWatch('mainBackgroundColor', form);
  const [stateContext, setStateContext]: any = useContext(AppContext);
  const [themeName, setThemeName] = useState(state.themeName);

  const {
    mutate: createThemeMutate,
    isLoading: isLoadingCreate,
  }: { mutate: (data: IDataRequest) => void; isLoading: boolean } = useMutation(
    'createTheme',
    createTheme,
    {
      onSuccess: () => {
        history(`/settings/templates/${state.templateID}/themes`);
      },
      onError: (err: any) => {
        notification.error(err.response.data.message);
      },
    },
  );

  const {
    mutate: editThemeMutate,
    isLoading,
  }: { mutate: (data: IDataRequest) => void; isLoading: boolean } = useMutation(
    'editTheme',
    editTheme,
    {
      onSuccess: () => {
        history(`/settings/templates/${state.templateID}/themes`);
      },
      onError: (err: any) => {
        notification.error(err.response.data.message);
      },
    },
  );

  const { mutate: getThemeMutate } = useMutation('getTheme', getTheme, {
    onSuccess: ({ data }) => {
      setThemeName(data.themeName);
      const formValue = {
        topMenuBarColor: data?.themeSetups.topMenuBarColor,
        leftMenuBarColor: data?.themeSetups.leftMenuBarColor,
        leftMenuExtendBackground: data?.themeSetups.leftMenuExtendBackground,
        leftMenuFontAndIcon: data?.themeSetups.leftMenuFontAndIcon,
        leftMenuHighlightColor: data?.themeSetups.leftMenuHighlightColor,
        leftMenuHighlightStripeColor: data?.themeSetups.leftMenuHighlightStripeColor,
        backgroundColor: data?.themeSetups.backgroundColor,
        buttonColor: data?.themeSetups.buttonColor,
        fontColor: data?.themeSetups.fontColor,
        font: data?.themeSetups.fontFamily,
        searchBarColor: data?.themeSetups.searchBarColor,
        extendNarrow: data?.themeSetups?.extendNarrow,
        profileDrawerBackground: data?.themeSetups?.profileDrawerBackground,
        mainBackgroundColor: data?.themeSetups?.mainBackgroundColor,
      };
      form.setFieldsValue({ ...formValue });
    },
  });

  usePrompt(WARNING_MESSAGE.LEAVE_PAGE, isOpenConfirmLeave);

  const checkColor = useCallback((color: string) => {
    if (CSS.supports('color', color)) {
      return true;
    }
    return;
  }, []);

  useEffect(() => {
    let statePreview = null;
    if (topMenuBarColor && checkColor(topMenuBarColor)) {
      document.documentElement.style.setProperty('--preview-theme-top-menu-bar', topMenuBarColor);
    }
    if (searchBarColor && checkColor(searchBarColor)) {
      document.documentElement.style.setProperty('--preview-theme-search-bar', searchBarColor);
    }
    if (leftMenuBarColor && checkColor(leftMenuBarColor)) {
      document.documentElement.style.setProperty(
        '--preview-theme-left-menu-bg-bar',
        leftMenuBarColor,
      );
    }
    if (leftMenuExtendBackground && checkColor(leftMenuExtendBackground)) {
      document.documentElement.style.setProperty(
        '--preview-theme-left-menu-extend-bg-bar',
        leftMenuExtendBackground,
      );
    }
    if (leftMenuFontAndIcon && checkColor(leftMenuFontAndIcon)) {
      document.documentElement.style.setProperty(
        '--preview-theme-left-menu-font-icon',
        leftMenuFontAndIcon,
      );
    }
    if (leftMenuHighlightColor && checkColor(leftMenuHighlightColor)) {
      document.documentElement.style.setProperty(
        '--preview-theme-left-menu-highlight-color',
        leftMenuHighlightColor,
      );
    }
    if (leftMenuHighlightStripeColor && checkColor(leftMenuHighlightStripeColor)) {
      document.documentElement.style.setProperty(
        '--preview-theme-left-menu-highlight-stripe-color',
        leftMenuHighlightStripeColor,
      );
    }
    if (backgroundColor && checkColor(backgroundColor)) {
      document.documentElement.style.setProperty(
        '--preview-theme-background-color',
        backgroundColor,
      );
      statePreview = { backgroundColor };
    }
    if (fontColor && checkColor(fontColor)) {
      document.documentElement.style.setProperty('--preview-theme-font-color', fontColor);
    }
    if (fontFamily) {
      document.documentElement.style.setProperty(
        '--preview-theme-font-family',
        fontFamily + ',' + 'sans-serif',
      );
    }
    if (extendNarrow && checkColor(extendNarrow)) {
      document.documentElement.style.setProperty('--preview-theme-extend-narrow-bg', extendNarrow);
    }
    if (profileDrawerBackground && checkColor(profileDrawerBackground)) {
      document.documentElement.style.setProperty(
        '--preview-theme-profile-drawer-bg',
        profileDrawerBackground,
      );
    }
    if (mainBackgroundColor && checkColor(mainBackgroundColor)) {
      document.documentElement.style.setProperty(
        '--preview-theme-layout-background-color',
        mainBackgroundColor,
      );
      statePreview = { ...statePreview, mainBackgroundColor };
    }
    if (buttonColor && checkColor(buttonColor)) {
      document.documentElement.style.setProperty('--preview-theme-button-color', buttonColor);
    }
    setStateContext({
      ...stateContext,
      preview: statePreview,
    });
  }, [
    topMenuBarColor,
    searchBarColor,
    leftMenuHighlightStripeColor,
    leftMenuHighlightColor,
    leftMenuFontAndIcon,
    leftMenuBarColor,
    backgroundColor,
    fontColor,
    fontFamily,
    buttonColor,
    leftMenuExtendBackground,
    extendNarrow,
    profileDrawerBackground,
    mainBackgroundColor,
  ]);

  const dataRequest: IDataRequest = useMemo(() => {
    return {
      themeName: state?.themeName || themeName,
      templateID: Number(state.templateID),
      themeSetups: {
        topMenuBarColor,
        searchBarColor,
        leftMenuHighlightStripeColor,
        leftMenuHighlightColor,
        leftMenuFontAndIcon,
        leftMenuBarColor,
        backgroundColor,
        fontColor,
        fontFamily,
        buttonColor,
        leftMenuExtendBackground,
        extendNarrow,
        profileDrawerBackground,
        mainBackgroundColor,
      },
    };
  }, [
    topMenuBarColor,
    searchBarColor,
    leftMenuHighlightStripeColor,
    leftMenuHighlightColor,
    leftMenuFontAndIcon,
    leftMenuBarColor,
    backgroundColor,
    fontColor,
    fontFamily,
    buttonColor,
    leftMenuExtendBackground,
    state.templateID,
    themeName,
    profileDrawerBackground,
    extendNarrow,
    mainBackgroundColor,
  ]);

  const handleSubmit = useCallback(() => {
    if (id) {
      editThemeMutate({ ...dataRequest, themeId: Number(id) });
      return;
    }
    createThemeMutate(dataRequest);
  }, [dataRequest, state]);

  const handleChangeColor = useCallback((color: string, name: string) => {
    form.setFieldsValue({ [name]: color });
  }, []);

  useEffect(() => {
    if (id) {
      getThemeMutate(Number(id));
    }
  }, []);

  return (
    <>
      <Breadcrumb className="content-title text-preview-theme-font-color !font-previewFontFamily custom-font-header">
        <Breadcrumb.Item
          onClick={() => {
            history(`/settings/themes`);
          }}
          className="!opacity-50 font-fontFamily text-main-font-color cursor-pointer"
        >
          Themes
        </Breadcrumb.Item>
        <Breadcrumb.Item
          onClick={() => {
            history(`/settings/templates/${state.templateID}/themes`);
          }}
          className="!opacity-50 font-fontFamily text-main-font-color cursor-pointer"
        >
          {state.templateName}
        </Breadcrumb.Item>
        <Breadcrumb.Item className="font-fontFamily text-main-font-color">
          {themeName || ''}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Layout.Header className="bg-preview-theme-top-menu-bar flex flex-row items-center justify-between py-3 pr-10 pl-6 w-full rounded-xl mb-6 xl:hidden h-fit flex-wrap">
        <div className="logo bg-white flex items-center justify-center ml-1">
          <img src={images.logo} alt="logo" className="w-full h-[47px]" />
        </div>
        <div className="flex flex-row items-center flex-wrap">
          <div className="relative w-[484px] mr-3 preview-input">
            <CustomInput
              type="text"
              placeholder="Search..."
              icon={<img src={images.search} alt="search" />}
            ></CustomInput>
          </div>
          <Select
            placeholder="All settings"
            allowClear
            className="text-preview-theme-font-color font-fontFamily text-sm preview-input"
          ></Select>
        </div>

        <div className="flex">
          <img className="cursor-pointer mr-5" src={images.noti} alt="Notification" />
          <img
            onClick={() => setIsOpenDrawer(!isOpenDrawer)}
            className={`cursor-pointer rounded-lg ${
              !isOpenDrawer ? `bg-preview-theme-button-color text-white` : ``
            }`}
            src={!isOpenDrawer ? images.profileActive : images.profile}
            alt="Profile"
          />
        </div>
      </Layout.Header>

      <div className="w-full rounded-3xl p-8 h-auto bg-preview-theme-search-bar mb-6 flex gap-3">
        <div className="w-[840px] preview-input">
          <CustomInput icon={<img src={images.search} alt="search" />}></CustomInput>
        </div>
        <ButtonCustom
          isWidthFitContent={true}
          color="orange"
          className="!bg-preview-theme-button-color border-preview-theme-button-color w-[120px] h-12"
        >
          Search
        </ButtonCustom>
      </div>

      <Layout className="bg-transparent layout-preview">
        <Layout.Sider
          trigger={null}
          collapsed={isZoomOut}
          collapsible
          className="bg-white font-fontFamily font-bold uppercase not-italic tracking-[0.02em] rounded-xl mr-6 preview-theme"
        >
          <Menu
            className={`h-full border-r-0 text-xs rounded-xl preview-menu
              !bg-preview-theme-left-menu-bg
            }`}
            mode="inline"
            onOpenChange={(value) => {
              setKeyOpen(value);
            }}
            onSelect={({ keyPath }) => {
              setKeyOpen(keyPath);
            }}
            selectable={true}
            openKeys={keyOpen}
            items={items}
          ></Menu>
          <div
            className="absolute right-[-16px] z-20 top-0 preview-arrow"
            onClick={() => setIsZoomOut(!isZoomOut)}
          >
            {!isZoomOut ? <NarrowLeftSVG /> : <NarrowRightSVG />}
          </div>
        </Layout.Sider>
        <Layout.Content className="p-10 bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.04)] rounded-3xl">
          <Form
            onFinish={handleSubmit}
            form={form}
            autoComplete="off"
            layout="vertical"
            className="flex flex-wrap gap-x-3"
            initialValues={initialFormData}
          >
            {forms.map((item, index) => (
              <FieldItem
                colorValue={form.getFieldValue(item.name)}
                key={index}
                item={item}
                handleChangeColor={handleChangeColor}
              />
            ))}
          </Form>
          <div className="flex justify-end gap-4 custom-padding-right flex-wrap">
            <ModalCustom
              title="Notice"
              cancelText="Cancel"
              okText="Confirm"
              titleCenter
              content={WARNING_MESSAGE.LEAVE_PAGE}
              onSubmit={() => {
                history(`/settings/templates/${state.templateID}/themes`);
              }}
              viewComponent={
                <ButtonCustom
                  isWidthFitContent={true}
                  onClick={() => setIsOpenConfirmLeave(false)}
                  className="!border-preview-theme-button-color !text-preview-theme-button-color !font-previewFontFamily"
                >
                  Cancel
                </ButtonCustom>
              }
            />
            <ButtonCustom
              isWidthFitContent={true}
              onClick={form.submit}
              isLoading={isLoadingCreate || isLoading}
              color="orange"
              className="!bg-preview-theme-button-color !font-previewFontFamily !border-preview-theme-button-color"
            >
              Save
            </ButtonCustom>
          </div>
        </Layout.Content>
        <Drawer isPreview collapsed={isOpenDrawer}></Drawer>
      </Layout>
    </>
  );
};

export default NewTheme;
