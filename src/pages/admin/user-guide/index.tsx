import { Breadcrumb, Layout, Tabs } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import ButtonCustom from 'components/Button';
import { ROUTES } from 'constants/constants';
import { AppContext } from 'context';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Guide = () => {
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
          onClick={() => history(ROUTES.guide)}
          className="text-main-font-color font-fontFamily"
        >
          User Guide
        </Breadcrumb.Item>
      </Breadcrumb>
      <Content className="mt-8 p-8 bg-white rounded-3xl shadow[#0000000a]">
        <div className="text-2xl pb-4 font-bold">Common Help</div>
        <div className="grid gap-4 grid-cols-3">
          <div className="bg-main-search-bar rounded-2xl py-6 px-4 h-[76px] flex items-center text-lg">How To Change Password</div>
          <div className="bg-main-search-bar rounded-2xl py-6 px-4 h-[76px] flex items-center text-lg">How To Go Dashboard</div>
          <div className="bg-main-search-bar rounded-2xl py-6 px-4 h-[76px] flex items-center text-lg">How To Search</div>
          <div className="bg-main-search-bar rounded-2xl py-6 px-4 h-[76px] flex items-center text-lg">Learning to...</div>
          <div className="bg-main-search-bar rounded-2xl py-6 px-4 h-[76px] flex items-center text-lg">Trying to...</div>
          <div className="bg-main-search-bar rounded-2xl py-6 px-4 h-[76px] flex items-center text-lg">How To Logout</div>
        </div>
      </Content>
    </Layout>
  );
};

export default Guide;
