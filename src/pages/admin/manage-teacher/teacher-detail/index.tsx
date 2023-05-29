import { Breadcrumb, Layout, Tabs } from 'antd';
import { getTeacherDetail, getTeacherDetailOfCentreAdmin } from 'api/teacher';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import SelectCustom from 'components/Select';
import { ROUTES } from 'constants/constants';
import usePrompt from 'constants/function';
import { WARNING_MESSAGE } from 'constants/messages';
import { IAdminProfile } from 'constants/types';
import { AppContext } from 'context';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import NewTeacher from '../new-teacher';
import TeacherAction from './teacher-action';
import TeacherCourse from './teacher-course';
import TeacherInformation from './teacher-information';
import TeacherProgress from './teacher-progress';
import './style.css';
export const optionsViewAs = [
  { label: 'Profile', value: 'profile' },
  // { label: 'Progress', value: 'progress' },
];

const TeacherDetail = () => {
  const history = useNavigate();
  const { id } = useParams();
  const [state]: any = useContext(AppContext);
  const isAdmin = state?.user?.centreAdmin;
  const adminId = state?.user?.centreAdmin?.id;
  const [activeKey, setActiveKey] = useState('1');
  const [isEdit, setIsEdit] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isModalNotice, setIsModalNotice] = useState(false);
  const [tabNavigate, setTabNavigate] = useState('');
  const [profile, setProfile] = useState<IAdminProfile>();
  const firstName = profile?.user?.userProfile?.firstName || '';
  const lastName = profile?.user?.userProfile?.lastName || '';
  const isDisableEdit = !profile?.isUpdatedProfile;
  const [layoutValue, setLayoutValue] = useState('profile');
  const [layout] = useState('profile');

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

  const { mutate: mutateGetTeacherDetail } = useMutation('getTeacherDetail', getTeacherDetail, {
    onSuccess: ({ data }) => {
      setProfile(data);
    },
  });

  const { mutate: mutateGetTeacherDetailOfCentreAdmin } = useMutation(
    'getTeacherDetailOfCentreAdmin',
    getTeacherDetailOfCentreAdmin,
    {
      onSuccess: ({ data }) => {
        setProfile(data);
      },
    },
  );

  usePrompt(WARNING_MESSAGE.LEAVE_MANAGE_ADMIN_INFO, isChanging);

  const handleGetTeacherDetail = useCallback(() => {
    if (adminId && isAdmin && id) {
      mutateGetTeacherDetailOfCentreAdmin({ id: Number(id), adminId: Number(adminId) });
      return;
    }
    if (id) {
      mutateGetTeacherDetail({ id: Number(id) });
    }
  }, [isAdmin, adminId, id]);

  useEffect(() => {
    handleGetTeacherDetail();
  }, [id, isAdmin, adminId]);

  const handleViewAs = useCallback(() => {
    if (layoutValue === optionsViewAs[0]?.value) {
      history(ROUTES.teacher_detail + `/${id}/view-as`);
    }
  }, [layoutValue, id]);

  return (
    <Layout className="bg-transparent gap-y-6">
      <div className="flex justify-between disable-flex">
        <Breadcrumb
          style={{
            color: '#AEA8A5',
            fontWeight: '700',
            lineHeight: '36px',
            fontSize: '28px',
          }}
          className="font-fontFamily text-main-font-color padding-bottom-15px"
        >
          <Breadcrumb.Item
            className="opacity-50 cursor-pointer cus_font  "
            onClick={() => {
              history(ROUTES.teacher);
            }}
          >
            Teachers
          </Breadcrumb.Item>
          <Breadcrumb.Item className="font-fontFamily text-main-font-color cus_font margin-10px">
            {id
              ? `${isEdit ? 'Edit' : ''} ${firstName + ' ' + lastName}${
                  isDisableEdit ? '(Not complete)' : ''
                }`
              : 'Create New Teacher'}
          </Breadcrumb.Item>
        </Breadcrumb>
        {id && (
          <div className="flex gap-x-2 items-center sm:w-full md:w-[50%] lg:w-[50%]">
            <SelectCustom
              className="w-[232px] lg:w-[calc(50%_-_0.25rem)]"
              options={optionsViewAs}
              value={layoutValue}
              onChange={(value) => {
                setLayoutValue(value);
              }}
            ></SelectCustom>
            <div className="lg:w-[calc(50%_-_0.25rem)]">
              <ButtonCustom color="orange" isWidthFitContent onClick={handleViewAs}>
                View As
              </ButtonCustom>
            </div>
          </div>
        )}
      </div>
      {id ? (
        layout === 'profile' ? (
          <Tabs
            className="custom-tab"
            onChange={(key) => handleChangeTab(key)}
            activeKey={activeKey}
            size={'small'}
            style={{ marginBottom: 32 }}
          >
            <Tabs.TabPane tab="Information" key="1" style={{ outline: 'none' }}>
              <TeacherInformation
                setIsEdit={setIsEdit}
                isEdit={isEdit}
                isChanging={isChanging}
                setIsChanging={setIsChanging}
                profile={profile}
                isDisableEdit={isDisableEdit}
                mutateGetTeacherDetail={handleGetTeacherDetail}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Course" key="2" style={{ outline: 'none' }}>
              <TeacherCourse />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Action" key="3" style={{ outline: 'none' }}>
              <TeacherAction
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
          <TeacherProgress />
        )
      ) : (
        <NewTeacher />
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

export default TeacherDetail;
