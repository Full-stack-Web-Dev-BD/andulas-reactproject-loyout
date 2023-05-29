import { Breadcrumb, Layout, Tabs } from 'antd';
import { getCentreAdminDetail } from 'api/admin';
import ModalCustom from 'components/Modal';
import { ROUTES } from 'constants/constants';
import { WARNING_MESSAGE } from 'constants/messages';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import NewAdmin from '../new-admin';
import AdminAction from './admin-action';
import AdminInformation from './admin-information';
import { IAdminProfile } from 'constants/types';
import usePrompt from 'constants/function';

const AdminDetail = () => {
  const history = useNavigate();
  const { id } = useParams();
  const [activeKey, setActiveKey] = useState('1');
  const [isEdit, setIsEdit] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isModalNotice, setIsModalNotice] = useState(false);
  const [tabNavigate, setTabNavigate] = useState('');
  const [profile, setProfile] = useState<IAdminProfile>();
  const firstName = profile?.user?.userProfile?.firstName || '';
  const lastName = profile?.user?.userProfile?.lastName || '';
  const isDisableEdit = !profile?.isUpdatedProfile;

  const handleChangeTab = (key: string) => {
    if (!isDisableEdit) {
      setTabNavigate(key);
      if (isChanging) {
        setIsModalNotice(true);
        return;
      }
      setActiveKey(key);
    }
  };

  const { mutate: mutateGetCentreAdminDetail } = useMutation(
    'getCentreAdminDetail',
    getCentreAdminDetail,
    {
      onSuccess: ({ data }) => {
        setProfile(data);
      },
    },
  );

  usePrompt(WARNING_MESSAGE.LEAVE_MANAGE_ADMIN_INFO, isChanging);

  useEffect(() => {
    if (id) {
      mutateGetCentreAdminDetail({ id: Number(id) });
    }
  }, [id]);

  return (
    <Layout className="bg-transparent gap-y-6">
      <Breadcrumb
        style={{
          color: '#AEA8A5',
          fontWeight: '700',
          lineHeight: '36px',
          fontSize: '28px',
        }}
        className="font-fontFamily text-main-font-color custom-font-header"
      >
        <Breadcrumb.Item
          className="opacity-50 cursor-pointer"
          onClick={() => {
            history(ROUTES.manage_admin);
          }}
        >
          Admin
        </Breadcrumb.Item>
        <Breadcrumb.Item className="font-fontFamily text-main-font-color">
          {id
            ? `${isEdit ? 'Edit' : ''} ${firstName + ' ' + lastName}${
                isDisableEdit ? '(Not complete)' : ''
              }`
            : 'Create New Admin'}
        </Breadcrumb.Item>
      </Breadcrumb>
      {id ? (
        <Tabs
          className="custom-tab"
          onChange={(key) => handleChangeTab(key)}
          activeKey={activeKey}
          size={'small'}
          style={{ marginBottom: 32 }}
        >
          <Tabs.TabPane tab="Information" key="1" style={{ outline: 'none' }}>
            <AdminInformation
              setIsEdit={setIsEdit}
              isEdit={isEdit}
              isChanging={isChanging}
              setIsChanging={setIsChanging}
              profile={profile}
              isDisableEdit={isDisableEdit}
              mutateGetCentreAdminDetail={mutateGetCentreAdminDetail}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Action" key="2" style={{ outline: 'none' }}>
            <AdminAction
              profile={profile}
              setProfile={setProfile}
              setIsEdit={setIsEdit}
              isEdit={isEdit}
              isChanging={isChanging}
              setIsChanging={setIsChanging}
              setActiveKey={setActiveKey}
            />
          </Tabs.TabPane>
        </Tabs>
      ) : (
        <NewAdmin />
      )}
      {isModalNotice && (
        <ModalCustom
          visible={true}
          cancelText="Cancel"
          onCancel={() => {
            setIsModalNotice(false);
          }}
          okText="Leave"
          onSubmit={() => {
            setIsChanging(false);
            setIsEdit(false);
            setActiveKey(tabNavigate);
          }}
          title="Notice"
          titleCenter
          content={WARNING_MESSAGE.LEAVE_MANAGE_ADMIN_INFO}
        />
      )}
    </Layout>
  );
};

export default AdminDetail;
