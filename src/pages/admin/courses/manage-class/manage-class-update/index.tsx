import { Breadcrumb, Layout, Tabs } from 'antd';
import { WARNING_MESSAGE } from 'constants/index';
import { ROUTES } from 'constants/constants';
import usePrompt from 'constants/function';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ManageClassUpdateInformation from './Information';
import ManageClassUpdateLetters from './Letters';
import { getClassById } from 'api/class';
import { useMutation } from 'react-query';
interface IState {
  className: string;
  isTeacher: boolean;
}

const ManageClassUpdate = () => {
  const { id } = useParams();
  const history = useNavigate();
  const location = useLocation();
  const state = location.state as IState;
  const [activeKey, setActiveKey] = useState('1');
  const [submitted, setSumitted] = useState<string[]>([]);
  const [tabNavigate, setTabNavigate] = useState('');
  const [editing, setEditing] = useState(false);
  const [isOpenConfirmLeave, setIsOpenConfirmLeave] = useState(false);
  const [isOpenModalWarning, setIsOpenModalWarning] = useState(false);
  const [className, setClassName] = useState('');

  usePrompt(WARNING_MESSAGE.LEAVE_MANAGE_CLASS, isOpenConfirmLeave);

  const handleChangeTab = useCallback(
    (key: string) => {
      if (editing) {
        setTabNavigate(key);
        setIsOpenModalWarning(true);
        return;
      }

      // if ((submitted.includes(key) || id) && !editing) {
      //   setActiveKey(key);
      // }
    },
    [id],
  );

  const { mutate: getClass } = useMutation('getClass', getClassById, {
    onSuccess: ({ data }) => {
      setClassName(data.className);
    },
  });

  useEffect(() => {
    if (id) {
      getClass(Number(id));
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
        className="font-fontFamily text-main-font-color"
      >
        <Breadcrumb.Item
          className="opacity-50 cursor-pointer custom-font-header"
          onClick={() => {
            history(state?.isTeacher ? ROUTES.class_management : ROUTES.manage_class);
          }}
        >
          {state?.isTeacher ? 'Class Management' : 'Manage Class'}
        </Breadcrumb.Item>
        <Breadcrumb.Item className="font-fontFamily text-main-font-color custom-font-header">
          {(id && `${editing ? 'Edit ' : ''}Class Detail - ` + className) ||
            (id && `${editing ? 'Edit ' : ''}Class Detail - ${className}`) ||
            'New Class Detail'}
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
            <ManageClassUpdateInformation
              setIsOpenConfirmLeave={setIsOpenConfirmLeave}
              setEditing={setEditing}
              onNextTab={() => setActiveKey('2')}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Letters" key="2" style={{ outline: 'none' }}>
            <ManageClassUpdateLetters />
          </Tabs.TabPane>
        </Tabs>
      ) : (
        <ManageClassUpdateInformation
          setIsOpenConfirmLeave={setIsOpenConfirmLeave}
          setEditing={setEditing}
        />
      )}
    </Layout>
  );
};

export default ManageClassUpdate;
