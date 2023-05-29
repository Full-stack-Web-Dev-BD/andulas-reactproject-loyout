import { Breadcrumb, Layout, Tabs } from 'antd';
import {
  deleteCourses,
  getCourseClassType,
  getCourseProgramType,
  getCourseType,
  getLearningMode,
  getListCategories,
} from 'api/courses';
import ModalCustom from 'components/Modal';
import usePrompt from 'constants/function';
import { ICategory, ROUTES, WARNING_MESSAGE } from 'constants/index';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CertificateTab from './certificate';
import InformationTab from './information';
import ModuleTab from './module';
import RegistrationDetails from './registration-details';

const { TabPane } = Tabs;
const { Content } = Layout;

interface IState {
  courseName: string;
  courseTypeValue: string;
}

const CourseDetail = () => {
  const history = useNavigate();
  const location = useLocation();
  const { id, create } = useParams();
  const state = location.state as IState;
  const [learningModes, setLearningModes] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [courseTypes, setCourseTypes] = useState([]);
  const [programTypes, setProgramTypes] = useState([]);
  const [classTypes, setClassTypes] = useState([]);
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [activeKey, setActiveKey] = useState('1');
  const [tabNavigate, setTabNavigate] = useState('');
  const [submitted] = useState<string[]>(['1']);
  const [courseName, setCourseName] = useState('');
  const [editing, setEditing] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isOpenConfirmLeave, setIsOpenConfirmLeave] = useState(false);
  const [isOpenModalWarning, setIsOpenModalWarning] = useState<boolean>(false);
  const [isShowModalWarningFillFiled, setIsShowModalWarningFillFiled] = useState<boolean>(false);
  const [courseTypeValue, setCourseTypeValue] = useState('');
  const [isChangeCourseValue, setIsChangeCourseValue] = useState(false);
  const [isDeleteCourse, setIsDeleteCourse] = useState(false);

  const {mutate: deleteCourse} = useMutation('deleteCourse', deleteCourses);

  useEffect(() => {
    if(id) {
      setCourseId(id);
    }
  },[id])
  
  const handleDeleteCourse = () => {
    setIsDeleteCourse(true);
  }

  useEffect(() => {
    if(isDeleteCourse && courseId && !id) {
      deleteCourse({ id: Number(courseId) });
    }
  },[courseId, isDeleteCourse, id])

  usePrompt(WARNING_MESSAGE.LEAVE_MANAGE_COURSE, isOpenConfirmLeave, handleDeleteCourse);

  const { mutate: getLearningModes } = useMutation('getLearningMode', getLearningMode, {
    onSuccess: ({ data }) => {
      setLearningModes(
        data.map((item: string) => {
          return { label: item, value: item };
        }),
      );
    },
  });

  const { mutate: getCourseTypes } = useMutation('getCourseType', getCourseType, {
    onSuccess: ({ data }) => {
      setCourseTypes(
        data.map((item: string) => {
          return { label: item, value: item };
        }),
      );
    },
  });

  const { mutate: getCategories } = useMutation('getListCategories', getListCategories, {
    onSuccess: ({ data }: { data: { listCategories: ICategory[] } }) => {
      const newCategories = data.listCategories.map((item) => {
        return { label: item.categoryName, value: item.id.toString() };
      });

      setCategories(newCategories);
    },
  });

  const { mutate: getCourseProgramTypes } = useMutation(
    'getCourseProgramType',
    getCourseProgramType,
    {
      onSuccess: ({ data }) => {
        setProgramTypes(
          data.map((item: string) => {
            return { label: item, value: item };
          }),
        );
      },
    },
  );

  const { mutate: getCourseClassTypes } = useMutation('getCourseClassType', getCourseClassType, {
    onSuccess: ({ data }) => {
      setClassTypes(
        data.map((item: string) => {
          return { label: item, value: item };
        }),
      );
    },
  });

  useEffect(() => {
    getLearningModes();
    getCourseTypes();
    getCourseProgramTypes();
    getCourseClassTypes();
    getCategories({ limit: 10, page: 1, search: '' });
  }, []);

  const handleChangeTab = useCallback(
    (key: string) => {
      if (!submitted.includes(key) && !id) {
        setIsShowModalWarningFillFiled(true);
        return;
      }

      if (editing || isChanging) {
        setTabNavigate(key);
        setIsOpenModalWarning(true);
        return;
      }

      if ((submitted.includes(key) || id) && !editing && key !== "3") {
        setActiveKey(key);
        return;
      }
    },
    [submitted, id, courseId, editing, isChanging],
  );

  const handleNavigateTab = useCallback(() => {
    if (tabNavigate && (submitted.includes(tabNavigate) || id)) {
      setActiveKey(tabNavigate);
      setEditing(false);
      setIsChanging(false);
    }
  }, [tabNavigate, submitted]);

  const renderTabName = useCallback(() => {
    switch (activeKey) {
      case '1':
        return 'Information';
      case '2':
        return 'Module';
      case '3':
        return 'Certificate';
      case '4':
        return 'Registration Detail';

      default:
        break;
    }
  }, [activeKey]);

  useEffect(() => {
    if (create) setActiveKey('4');
  }, []);

  return (
    <Layout className="bg-transparent">
      <Breadcrumb className="content-title text-preview-theme-font-color !font-previewFontFamily custom-font-header">
        <Breadcrumb.Item
          onClick={() => {
            history(ROUTES.manage_course);
          }}
          className="!opacity-50 font-fontFamily text-main-font-color cursor-pointer"
        >
          Course
        </Breadcrumb.Item>
        <Breadcrumb.Item className="font-fontFamily text-main-font-color">
          {(state?.courseName &&
            `${editing ? 'Edit ' : ''}Course Details - ` + state?.courseName) ||
            (courseName && `${editing ? 'Edit ' : ''}Course Details - ${courseName}`) ||
            'New Course Details'}
        </Breadcrumb.Item>
      </Breadcrumb>
      <Tabs
        activeKey={activeKey}
        onChange={(key) => handleChangeTab(key)}
        className="custom-tab"
        defaultActiveKey="1"
        size={'small'}
        style={{ marginBottom: 32 }}
      >
        <TabPane tab="Information" key="1" style={{ outline: 'none' }}>
          <Content className="bg-white rounded-3xl p-8">
            <InformationTab
              editing={editing}
              courseId={courseId as string}
              setCourseId={setCourseId}
              onNextTab={() => setActiveKey('2')}
              onNextRegistrationDetail={() => setActiveKey('4')}
              learningModes={learningModes}
              courseTypes={courseTypes}
              programTypes={programTypes}
              classTypes={classTypes}
              onSubmitted={() => submitted.push('2')}
              categories={categories}
              setCourseName={setCourseName}
              setEditing={setEditing}
              setIsChanging={setIsChanging}
              isChanging={isChanging}
              setCourseTypeValue={setCourseTypeValue}
              courseTypeValue={courseTypeValue}
              setIsChangeCourseValue={setIsChangeCourseValue}
              setIsOpenConfirmLeave={setIsOpenConfirmLeave}
            />
          </Content>
        </TabPane>
        <TabPane tab="Module" key="2" style={{ outline: 'none' }}>
          <Content className="bg-white rounded-3xl p-8">
            <ModuleTab
              editing={editing}
              courseName={state?.courseName || courseName}
              onBackTab={() => setActiveKey('1')}
              setEditing={setEditing}
              courseId={courseId as string}
              onNextTab={() => setActiveKey('4')}
              onSubmitted={() => {
                if (!submitted.includes('4')) {
                  submitted.push('4');
                }
              }}
              setIsChanging={setIsChanging}
              isChanging={isChanging}
              setIsOpenConfirmLeave={setIsOpenConfirmLeave}
            />
          </Content>
        </TabPane>
        <TabPane tab="Certificates" key="3" style={{ outline: 'none' }}>
          <Content className="bg-white rounded-3xl p-8">
            <CertificateTab />
          </Content>
        </TabPane>
        <TabPane tab="Registration Details" key="4" style={{ outline: 'none' }}>
          <Content className="bg-white rounded-3xl p-8">
            <RegistrationDetails
              courseTypeValue={courseTypeValue}
              idCreate={Number(courseId)}
              onBackTab={() => setActiveKey('2')}
              // isEdit={editing}
              // setIsEdit={setEditing}
              setCheckEdit={setIsChanging}
              checkEdit={isChanging}
              isChangeCourseValue={isChangeCourseValue}
              courseName={courseName}
              setIsChangeCourseValue={setIsChangeCourseValue}
              setIsOpenConfirmLeave={setIsOpenConfirmLeave}
            />
          </Content>
        </TabPane>
      </Tabs>
      {isOpenModalWarning && (
        <ModalCustom
          title="Notice"
          okText="Confirm"
          cancelText="Cancel"
          titleCenter
          visible={true}
          onCancel={() => setIsOpenModalWarning(false)}
          onSubmit={handleNavigateTab}
          content={`You have modified the Course ${renderTabName()}. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving.`}
        />
      )}

      {isShowModalWarningFillFiled && (
        <ModalCustom
          title="Notice"
          cancelText="Cancel"
          titleCenter
          visible={true}
          onCancel={() => setIsShowModalWarningFillFiled(false)}
          content={`Please fill in the required details and click "Next".`}
        />
      )}
    </Layout>
  );
};

export default CourseDetail;
