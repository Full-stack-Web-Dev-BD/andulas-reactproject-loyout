import { Button, Dropdown, Layout, Menu } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { readAnnouncement } from 'api/announcement';
import { getAnnnoucementInClass, getClassById } from 'api/class';
import { getCourseDetail, getCourseModules } from 'api/courses';
import { ConfigBellNotification } from 'api/notification';
import { getAllSessionByClassModule } from 'api/session';
import { DATE_FORMAT, ROUTES, Status } from 'constants/constants';
import { AppContext } from 'context';
import moment from 'moment';
import ModalDetail from 'pages/admin/notifications/component/ModalDetail';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQueries, useQuery } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { calPercent } from './my-course-module';
import './style.css';

export interface ICourseDetail {
  id: number;
  courseName: string;
  catalogImageUrl?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  learningMethod?: string;
  programType?: string;
}

const MyCourseDetail = () => {
  const { id } = useParams();
  const search = useLocation().search;
  const classId = new URLSearchParams(search).get('classId');
  const history = useNavigate();
  const [dataCourses, setDataCourses] = useState<ICourseDetail>();
  const [dataModules, setDataModules] = useState<any>();
  const [dataModulesResult, setDataModulesResult] = useState<any>();
  const [className, setClassName] = useState('');
  const [form] = useForm();
  const [announcementSelected, setAnnouncementSelected] = useState<ConfigBellNotification>();
  const [listAnnouncement, setListAnnouncement] = useState<any>([]);
  const [state, setState]: any = useContext(AppContext);

  const { mutate: getCourse } = useMutation('getCourseDetail', getCourseDetail, {
    onSuccess: ({ data }: { data: ICourseDetail }) => {
      const formData = {
        id: data?.id,
        courseName: data?.courseName,
        learningMethod: data?.learningMethod,
        programType: data?.programType,
        description: data?.description,
        catalogImageUrl: data?.catalogImageUrl,
        startDate: data?.startDate,
        endDate: data?.endDate,
      };
      setDataCourses(formData);
      //   setCourseTypeValue(data.courseType as string);
      //   setCourseName(data.courseName as string);
      //   form.setFieldsValue(formData);
      //   setStatus(data?.isActive as boolean);
    },
  });

  const announcements = useQuery(['listAnnoucement', { state: state?.countAnnouncement }], () =>
    getAnnnoucementInClass(classId as any),
  );

  useEffect(() => {
    if (announcements?.data?.data) {
      const handleDataAnnouncement = announcements.data.data.map((item: any) => {
        return {
          ...item,
          author: `${item.author?.userProfile?.firstName} ${item.author?.userProfile?.lastName}`,
        };
      });
      setListAnnouncement(handleDataAnnouncement);
    }
  }, [announcements]);
  const { mutate: getCourseModule } = useMutation('getCourseModule', getCourseModules, {
    onSuccess: ({ data }: { data: ICourseDetail }) => {
      // console.log(data)
      setDataModules(data);
      // const formData = {
      //   id: data?.id,
      //   courseName: data?.courseName,
      //   learningMethod: data?.learningMethod,
      //   programType: data?.programType,
      //   description: data?.description,
      //   catalogImageUrl: data?.catalogImageUrl,
      //   startDate: data?.startDate,
      //   endDate: data?.endDate
      // };
      // setDataCourses(formData)
    },
  });

  const { mutate: readAnnounce } = useMutation('readAnnoucement', readAnnouncement, {
    onSuccess(data, variables, context) {
      announcements.refetch();
    },
  });

  const { mutate: getClass } = useMutation('getClass', getClassById, {
    onSuccess: ({ data }) => {
      setClassName(data.className);
    },
  });

  useEffect(() => {
    if (id) {
      getCourse(Number(id));
      getCourseModule(Number(id));
    }
  }, [id]);

  useEffect(() => {
    getClass(Number(classId));
  }, [classId]);

  const menu = (
    <Menu className="w-[116px] absolute left-[-15px]">
      {/* {
        dataList.map((recordValue: UserNotification) => <Menu.Item onClick={() => !recordValue.isRead && updateStatusNotification(recordValue.id)} key={recordValue.id} className={`pr-3 header-noti-item ${recordValue.isRead ? 'header-noti-readed' : 'cursor-pointer'}`}>
          {`${recordValue.notification.actionType} ${recordValue.notification.nameType} ${recordValue.notification.content.includes('by') ? 'by ' + recordValue.notification.createdByUser.userProfile.firstName + ' ' + recordValue.notification.createdByUser.userProfile.lastName : ''} at ${moment(recordValue.notification.createdAt).format('YYYY/MM/DD hh:mm a')}`}
        </Menu.Item>)
      } */}
      <Menu.Item className="pr-3 btn-link">Withdraw</Menu.Item>
      <Menu.Item className="pr-3 btn-link">Transfer</Menu.Item>
    </Menu>
  );

  const checkStatusModule = async () => {
    const filter = {
      page: 1,
      limit: 100,
      sort: 'sessionName',
      order: 'ASC',
      search: '',
    };
    const result = await Promise.all(
      dataModules.map(async (dataModule: any) => {
        const res = await getAllSessionByClassModule({
          ...filter,
          filters: JSON.stringify([{ moduleID: dataModule?.id, classID: classId }]),
        });
        if (res) {
          if (res?.data?.length === 0) {
            return { ...dataModule, percent: 0 };
          } else {
            let sum = 0;

            res?.data.forEach((session: any, index: number) => {
              // sum += calPercent(session?.startTime, session?.endTime);
              sum += session?.completedPercent || 0;
            });
            const avg = sum / res.data.length;

            return { ...dataModule, percent: Math.round(avg) };
          }
        }
        return dataModule;
      }),
    );

    setDataModulesResult(result);
  };

  useEffect(() => {
    checkStatusModule();
  }, [dataModules]);

  return (
    <Layout id="course-detail-student" className="bg-transparent flex flex-col gap-y-6">
      <div className="flex justify-between items-center bg-transparent px-0 custom-class-info">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0 custom-font-header">
          <span className="text-[#AEA8A5] cursor-pointer" onClick={() => history(ROUTES.my_course)}>
            My Courses
          </span>{' '}
          / {dataCourses?.courseName} - {className}
        </p>
        <Dropdown trigger={['click']} overlay={menu} placement="bottomRight" className="h-full">
          <div className="text-[#32302D] hover:text-[#BE5E2A] text-[16px] font-semibold border-solid border-[1px] border-[#D1CDCB] hover:border-[#ED7635] rounded-xl px-4 py-1.5 cursor-pointer">
            Action
          </div>
        </Dropdown>
      </div>
      <div className="flex items-start flex-row p-8 gap-10 bg-[#FFFFFF] rounded-3xl custom-class-info">
        <img className="w-[320px] h-[240px] rounded-2xl" src={dataCourses?.catalogImageUrl} />
        <div>
          <p className="text-2xl font-bold text-[#32302D] custom-font-header">
            {dataCourses?.courseName}
          </p>
          <p className="text-2xl font-bold text-[#32302D] custom-font-header">{className}</p>
          <p className="font-semibold text-[#6E6B68] text-lg">{dataCourses?.description}</p>
          <p className="font-semibold text-[#6E6B68] text-lg">
            Duration: {moment(dataCourses?.startDate).format(DATE_FORMAT)} to{' '}
            {moment(dataCourses?.endDate).format(DATE_FORMAT)}
          </p>
          <p className="font-semibold text-[#6E6B68] text-lg">
            Learning Method: {dataCourses?.learningMethod}
          </p>
          <p className="font-semibold text-[#6E6B68] text-lg">
            Program Type: {dataCourses?.programType}
          </p>
        </div>
      </div>
      <div className="p-8 bg-[#FFFFFF] rounded-3xl mt-4">
        <p className="text-2xl font-bold text-[#32302D] custom-font-header">
          Class Progress information
        </p>
        <div className="flex flex-col gap-4">
          <div className="font-semibold text-[#32302D] text-lg">Active Modules</div>
          {dataModulesResult &&
            dataModulesResult?.length > 0 &&
            dataModulesResult?.map((module: any) => {
              if (module?.percent > 0 && module?.percent < 100) {
                const codeMudule =
                  module?.moduleCode && module?.moduleCode !== '' ? `(${module?.moduleCode})` : '';
                return (
                  <div className="flex items-center" key={module?.id}>
                    <div
                      className="text-base text-[#6E6B68] w-[200px] cursor-pointer hover:text-[#ED7635]"
                      onClick={() =>
                        history(`${ROUTES.my_course}/${id}/module/${module?.id}?classId=${classId}`)
                      }
                    >
                      {module?.moduleName + ' ' + codeMudule}
                    </div>
                    <div id="myProgress" className="w-full bg-[#F7F5F4] h-[40px] rounded-xl">
                      <div
                        id="myBar"
                        className={`bg-[#F8C8AE] text-[#32302D] text-center h-[40px] rounded-xl`}
                        style={{ width: module?.percent + '%' }}
                      >
                        <span className="flex items-center h-full justify-center text-base font-semibold">
                          {module?.percent}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          {/* <div className="flex items-center">
            <div
              className="text-base text-[#6E6B68] w-[200px] cursor-pointer hover:text-[#ED7635]"
              onClick={() => history(`${ROUTES.my_course}/${id}/module`)}
            >
              Module 3
            </div>
            <div id="myProgress" className="w-full bg-[#F7F5F4] h-[40px] rounded-xl">
              <div
                id="myBar"
                className="w-[35%] bg-[#FBE4D7] text-[#32302D] text-center h-[40px] rounded-xl"
              >
                <span className="flex items-center h-full justify-center text-base font-semibold">
                  35%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div
              className="text-base text-[#6E6B68] w-[200px] cursor-pointer hover:text-[#ED7635]"
              onClick={() => history(`${ROUTES.my_course}/${id}/module`)}
            >
              Module 4
            </div>
            <div id="myProgress" className="w-full bg-[#F7F5F4] h-[40px] rounded-xl">
              <div
                id="myBar"
                className="w-[70%] bg-[#F8C8AE] text-[#32302D] text-center h-[40px] rounded-xl"
              >
                <span className="flex items-center h-full justify-center text-base font-semibold">
                  70%
                </span>
              </div>
            </div>
          </div> */}
        </div>
        <div className="flex flex-col gap-4">
          <div className="font-semibold text-[#32302D] text-lg mt-4">Upcoming Modules</div>
          {dataModulesResult &&
            dataModulesResult?.length > 0 &&
            dataModulesResult?.map((module: any) => {
              if (module?.percent === 0) {
                const codeMudule =
                  module?.moduleCode && module?.moduleCode !== '' ? `(${module?.moduleCode})` : '';
                return (
                  <div className="flex items-center" key={module?.id}>
                    <div
                      className="text-base text-[#6E6B68] w-[200px] cursor-pointer hover:text-[#ED7635]"
                      onClick={() =>
                        history(`${ROUTES.my_course}/${id}/module/${module?.id}?classId=${classId}`)
                      }
                    >
                      {module?.moduleName + ' ' + codeMudule}
                    </div>
                    <div id="myProgress" className="w-full bg-[#F7F5F4] h-[40px] rounded-xl">
                      <div id="myBar" className="text-[#32302D] text-center h-[40px] rounded-xl">
                        <span className="flex items-center h-full justify-center text-base font-semibold">
                          0%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          {/* <div className="flex items-center">
            <div
              className="text-base text-[#6E6B68] w-[200px] cursor-pointer hover:text-[#ED7635]"
              onClick={() => history(`${ROUTES.my_course}/${id}/module`)}
            >
              Module 5
            </div>
            <div id="myProgress" className="w-full bg-[#F7F5F4] h-[40px] rounded-xl">
              <div id="myBar" className="text-[#32302D] text-center h-[40px] rounded-xl">
                <span className="flex items-center h-full justify-center text-base font-semibold">
                  0%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div
              className="text-base text-[#6E6B68] w-[200px] cursor-pointer hover:text-[#ED7635]"
              onClick={() => history(`${ROUTES.my_course}/${id}/module`)}
            >
              Module 6
            </div>
            <div id="myProgress" className="w-full bg-[#F7F5F4] h-[40px] rounded-xl">
              <div id="myBar" className="text-[#32302D] text-center h-[40px] rounded-xl">
                <span className="flex items-center h-full justify-center text-base font-semibold">
                  0%
                </span>
              </div>
            </div>
          </div> */}
        </div>
        <div className="flex flex-col gap-4">
          <div className="font-semibold text-[#32302D] text-lg mt-4">Completed Modules</div>
          {dataModulesResult &&
            dataModulesResult?.length > 0 &&
            dataModulesResult?.map((module: any) => {
              if (module?.percent === 100) {
                const codeMudule =
                  module?.moduleCode && module?.moduleCode !== '' ? `(${module?.moduleCode})` : '';
                return (
                  <div className="flex items-center" key={module?.id}>
                    <div
                      className="text-base text-[#6E6B68] w-[200px] cursor-pointer hover:text-[#ED7635]"
                      onClick={() =>
                        history(`${ROUTES.my_course}/${id}/module/${module?.id}?classId=${classId}`)
                      }
                    >
                      {module?.moduleName + ' ' + codeMudule}
                    </div>
                    <div id="myProgress" className="w-full bg-[#F1915D] h-[40px] rounded-xl ml-2">
                      <div
                        id="myBar"
                        className="w-[100%] bg-[#F1915D] text-[#FFFFFF] text-center h-[40px] rounded-xl"
                      >
                        <span className="flex items-center h-full justify-center text-base font-semibold">
                          100%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          {/* <div className="flex items-center">
            <div
              className="text-base text-[#6E6B68] w-[200px] cursor-pointer hover:text-[#ED7635]"
              onClick={() => history(`${ROUTES.my_course}/${id}/module`)}
            >
              Module 1
            </div>
            <div id="myProgress" className="w-full bg-[#F1915D] h-[40px] rounded-xl">
              <div
                id="myBar"
                className="w-[100%] bg-[#F1915D] text-[#FFFFFF] text-center h-[40px] rounded-xl"
              >
                <span className="flex items-center h-full justify-center text-base font-semibold">
                  100%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div
              className="text-base text-[#6E6B68] w-[200px] cursor-pointer hover:text-[#ED7635]"
              onClick={() => history(`${ROUTES.my_course}/${id}/module`)}
            >
              Module 2
            </div>
            <div id="myProgress" className="w-full bg-[#F1915D] h-[40px] rounded-xl">
              <div
                id="myBar"
                className="w-[100%] bg-[#F1915D] text-[#FFFFFF] text-center h-[40px] rounded-xl"
              >
                <span className="flex items-center h-full justify-center text-base font-semibold">
                  100%
                </span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
      <div className="flex gap-4 mt-4 mb-4 h-full custom-class-info">
        <div className="course-detail-announcement p-8 bg-[#FFFFFF] rounded-3xl basis-1/2 flex flex-col gap-2 lg:w-full">
          <div className="course-detail-announcement-title text-2xl font-bold text-[#32302D] custom-font-header">
            Announcements
          </div>
          {announcements.status == 'success' &&
            listAnnouncement.map((item: any, index: any) => {
              return (
                <div
                  className={`flex justify-between items-center cursor-pointer  `}
                  key={index}
                  onClick={() => {
                    setAnnouncementSelected(item);
                  }}
                >
                  <div
                    className={`text-sm font-semibold text-[#32302D] title-announcement ${
                      item.isRead && 'text-[#AEA8A5]'
                    } `}
                  >
                    {item.title}
                  </div>
                  <div className="w-[30%] text-[#AEA8A5] flex flex-col">
                    {moment(item.createdAt).format('ddd YYYY/MM/DD, hh:mm a')}
                  </div>
                </div>
              );
            })}
        </div>
        <div className="course-detail-message p-8 bg-[#FFFFFF] rounded-3xl basis-1/2 flex flex-col gap-4 cus-my-course-w-full">
          <div className="course-detail-message-title text-2xl font-bold text-[#32302D] custom-font-header">
            Messages (show latest 3)
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-[#32302D]">Teacher 1</div>
            <Button className="w-[30%] text-[#32302D] rounded-lg">Chat</Button>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-[#32302D]">Teacher 2</div>
            <Button className="w-[30%] text-[#32302D] rounded-lg">Chat</Button>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-[#32302D]">Teacher 3</div>
            <Button className="w-[30%] text-[#32302D] rounded-lg">Chat</Button>
          </div>
        </div>
      </div>
      <ModalDetail
        data={announcementSelected}
        form={form}
        visible={announcementSelected ? true : false}
        onCancel={async () => {
          if (announcementSelected) {
            readAnnounce(announcementSelected.id);
          }
          setAnnouncementSelected(undefined);
        }}
      />
    </Layout>
  );
};

export default MyCourseDetail;
