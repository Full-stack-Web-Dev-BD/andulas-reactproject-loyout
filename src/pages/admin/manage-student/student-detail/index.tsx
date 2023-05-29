import { Breadcrumb, Layout, Tabs } from 'antd';
import { getStudentDetailById } from 'api/student';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import SelectCustom from 'components/Select';
import { ROUTES } from 'constants/constants';
import usePrompt from 'constants/function';
import { WARNING_MESSAGE } from 'constants/messages';
import { IStudentProfile } from 'constants/types';
import { optionsViewAs } from 'pages/admin/manage-teacher/teacher-detail';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import FinancialDetail from './financial-detail';
import LinkedAccount from './linked-account';
import StudentAction from './student-action';
import StudentCourse from './student-course';
import StudentInformation from './student-information';
import StudentParentInfo from './student-parent-info';

import './custom-student-detail.css';

const StudentDetail = () => {
  const history = useNavigate();
  const { id } = useParams();
  const [activeKey, setActiveKey] = useState('1');
  const [isEdit, setIsEdit] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isModalNotice, setIsModalNotice] = useState(false);
  const [tabNavigate, setTabNavigate] = useState('');
  const [layoutValue, setLayoutValue] = useState('profile');
  const [profile, setProfile] = useState<IStudentProfile>();
  const firstName = profile?.user?.userProfile?.firstName || '';
  const lastName = profile?.user?.userProfile?.lastName || '';

  const handleChangeTab = (key: string) => {
    setTabNavigate(key);
    if (isChanging) {
      setIsModalNotice(true);
      return;
    }
    setActiveKey(key);
  };

  const { mutate: mutateGetStudentDetail } = useMutation(
    'getStudentDetailById',
    getStudentDetailById,
    {
      onSuccess: ({ data }) => {
        setProfile(data);
      },
    },
  );

  usePrompt(WARNING_MESSAGE.LEAVE_MANAGE_ADMIN_INFO, isChanging);

  useEffect(() => {
    if (id) {
      mutateGetStudentDetail({ id: Number(id) });
    }
  }, [id]);

  const handleViewAs = useCallback(() => {
    if (layoutValue === optionsViewAs[0]?.value) {
      history(ROUTES.student_detail + `/${id}/view-as`);
    }
  }, [layoutValue, id]);

  return (
    <Layout className="bg-transparent gap-y-6">
      <div className="flex justify-between items-center custom-student-detail">
        <Breadcrumb
          style={{
            color: '#AEA8A5',
            fontWeight: '700',
            lineHeight: '36px',
            fontSize: '28px',
          }}
          className="font-fontFamily text-main-font-color custom-sp-mb"
        >
          <Breadcrumb.Item
            className="opacity-50 cursor-pointer"
            onClick={() => {
              history(ROUTES.manage_student);
            }}
          >
            Students
          </Breadcrumb.Item>
          <Breadcrumb.Item className="font-fontFamily text-main-font-color">
            {isEdit ? 'Edit ' : ' '}
            {firstName + ' ' + lastName}
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
      <Tabs
        className="custom-tab"
        onChange={(key) => handleChangeTab(key)}
        activeKey={activeKey}
        size={'small'}
        style={{ marginBottom: 32 }}
      >
        <Tabs.TabPane tab="Information" key="1" style={{ outline: 'none' }}>
          <StudentInformation
            setIsEdit={setIsEdit}
            isEdit={isEdit}
            isChanging={isChanging}
            setIsChanging={setIsChanging}
            profile={profile}
            mutateGetStudentDetail={mutateGetStudentDetail}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Course" key="2" style={{ outline: 'none' }}>
          <StudentCourse />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Parent Info" key="3" style={{ outline: 'none' }} disabled>
          <StudentParentInfo />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Financial Details" key="4" style={{ outline: 'none' }} disabled>
          <FinancialDetail />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Action" key="5" style={{ outline: 'none' }}>
          <StudentAction
            profile={profile}
            setProfile={setProfile}
            setIsEdit={setIsEdit}
            isEdit={isEdit}
            isChanging={isChanging}
            setIsChanging={setIsChanging}
            setActiveKey={setActiveKey}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Linked Account" key="6" style={{ outline: 'none' }} disabled>
          <LinkedAccount />
        </Tabs.TabPane>
      </Tabs>

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

export default StudentDetail;
