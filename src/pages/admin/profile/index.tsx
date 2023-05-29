import { Breadcrumb, Layout, Tabs } from 'antd';
import ButtonCustom from 'components/Button';
import { ROUTES } from 'constants/constants';
import { AppContext } from 'context';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LinkAccount from './link-account';
import MyInfo from './my-info';
import ParentInfo from './parent-info';
import './style.css';

const Profile = () => {
  const [state]: any = useContext(AppContext);
  const history = useNavigate();
  const [activeKey, setActiveKey] = useState('1');

  const handleChangeTab = (key: string) => {
    setActiveKey(key);
  };

  return (
    <Layout className="bg-transparent">
      <Breadcrumb className="text-[28px] text-main-font-color font-bold font-fontFamily leading-9">
        <Breadcrumb.Item
          onClick={() => history(ROUTES.dashboard)}
          className="!opacity-50 cursor-pointer"
        >
          Dashboard
        </Breadcrumb.Item>

        <Breadcrumb.Item className="text-main-font-color font-fontFamily">
          My Profile
        </Breadcrumb.Item>
      </Breadcrumb>

      {state.user?.userRole?.template?.templateName !== 'Student' ? (
        <MyInfo></MyInfo>
      ) : (
        <>
          <Tabs
            className="custom-tab my-profile-tab mt-3"
            onChange={(key) => handleChangeTab(key)}
            activeKey={activeKey}
            size={'small'}
          >
            <Tabs.TabPane tab="Info" key="1" style={{ outline: 'none' }}>
              <MyInfo></MyInfo>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Parent Info" key="2" style={{ outline: 'none' }}>
              <ParentInfo></ParentInfo>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Link Account" key="3" style={{ outline: 'none' }}>
              <LinkAccount></LinkAccount>
            </Tabs.TabPane>
          </Tabs>
        </>
      )}
    </Layout>
  );
};

export default Profile;
