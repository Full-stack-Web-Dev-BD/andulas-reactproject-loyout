import { Layout } from 'antd';
import { getClassById } from 'api/class';
import { getCourseDetail, IParamsSearch } from 'api/courses';
import { getModuleById } from 'api/module';
import { getAllSessionByClassModule, searchSessions } from 'api/session';
import ButtonCustom from 'components/Button';
import { DATE_FORMAT, ROUTES } from 'constants/constants';
import { IListSession, ISessionClassModule, ISessionDetail } from 'constants/types';
import moment from 'moment';
import { format } from 'path';
import { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

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

export const calPercent = (startTime: string, endTime: string) => {
  if (moment(startTime).isAfter(moment())) {
    return 0;
  } else if (moment(endTime).isBefore(moment())) {
    return 100;
  } else {
    const startTimeTe = moment(startTime).startOf('day');
    const endTimeTe = moment(endTime).startOf('day');
    const dateDuration = endTimeTe.diff(startTimeTe, 'days');
    const dateNowDuration = moment().startOf('day').diff(startTimeTe, 'days');
    return ((dateNowDuration + 1) / (dateDuration + 1)) * 100 < 0
      ? 0
      : ((dateNowDuration + 1) / (dateDuration + 1)) * 100 > 100
      ? 100
      : Math.round(((dateNowDuration + 1) / (dateDuration + 1)) * 100);
  }
};

const MyCourseModule = () => {
  const { id, moduleId } = useParams();
  const search = useLocation().search;
  const classId = new URLSearchParams(search).get('classId');
  const history = useNavigate();
  const [dataCourses, setDataCourses] = useState<ICourseDetail>();
  const [dataList, setDataList] = useState<ISessionClassModule[]>([]);
  const [moduleName, setModuleName] = useState<string>('');
  const [className, setClassName] = useState('');
  const [filter, setFilter] = useState<IParamsSearch>({
    page: 1,
    limit: 100,
    sort: 'sessionName',
    order: 'ASC',
    search: '',
  });

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

  const { mutate: getListSessions } = useMutation('searchSessions', getAllSessionByClassModule, {
    onSuccess: ({ data }: { data: ISessionClassModule[] }) => {
      setDataList(data);
    },
  });

  const { mutate: getModuleDetail } = useMutation('getModuleById', getModuleById, {
    onSuccess: ({ data }: { data: { moduleName: string; moduleCode?: string; id: number } }) => {
      const codeMudule = data?.moduleCode && data?.moduleCode !== '' ? `(${data?.moduleCode})` : '';
      setModuleName(data?.moduleName + ' ' + codeMudule);
    },
  });

  const { mutate: getClass } = useMutation('getClass', getClassById, {
    onSuccess: ({ data }) => {
      setClassName(data.className);
    },
  });

  useEffect(() => {
    if (moduleId) {
      getListSessions({
        ...filter,
        filters: JSON.stringify([{ moduleID: moduleId, classID: classId }]),
      });
      getModuleDetail(Number(moduleId));
    }
  }, [moduleId]);

  useEffect(() => {
    if (id) {
      getCourse(Number(id));
    }
  }, [id]);

  useEffect(() => {
    if (classId) {
      getClass(Number(classId));
    }
  }, [classId]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <div className="flex justify-between items-center bg-transparent px-0">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0 custom-font-header">
          <span
            className="text-[#AEA8A5] cursor-pointer "
            onClick={() => history(ROUTES.my_course)}
          >
            My Courses
          </span>
          <span className="text-[#AEA8A5] cursor-pointer" onClick={() => history(-1)}>
            {' '}
            / {dataCourses?.courseName} - {className}
          </span>{' '}
          / {moduleName}
        </p>
      </div>
      <div className="p-8 bg-[#FFFFFF] rounded-3xl mt-4">
        <p className="text-2xl font-bold text-[#32302D] custom-font-header">
          {moduleName} Progress information
        </p>
        <div className="flex flex-col gap-4">
          <div className="font-semibold text-[#32302D] text-lg">Sessions</div>
          <>
            {dataList &&
              dataList?.length > 0 &&
              dataList?.map((session) => {
                // const percent = calPercent(session?.startTime, session?.endTime)
                const percent = session.completedPercent ? Math.round(session.completedPercent) : 0;
                return (
                  <div className="flex items-center gap-2" key={session.id}>
                    <div
                      className="text-base text-[#6E6B68] basis-2/5 cursor-pointer"
                      onClick={() =>
                        history(
                          `${ROUTES.my_course}/${id}/module/${moduleId}/session?classId=${classId}&sessionId=${session.id}`,
                        )
                      }
                    >
                      {session?.sessionName} ({moment(session?.startTime).format(DATE_FORMAT)}-
                      {moment(session?.endTime).format(DATE_FORMAT)}) -{' '}
                      {session?.firstNameTeacher + session?.lastNameTeacher}
                    </div>
                    <div
                      id="myProgress"
                      className={`w-full bg-[${
                        percent === 100 ? '#F1915D' : '#F7F5F4'
                      }] h-[40px] rounded-xl basis-3/5`}
                    >
                      <div
                        id="myBar"
                        className={`bg-[${
                          percent === 0 ? '' : percent === 100 ? '' : '#F8C8AE'
                        }] text-[${
                          percent === 100 ? '#FFFFFF' : '#32302D'
                        }] text-center h-[40px] rounded-xl`}
                        style={{ width: percent > 0 && percent < 100 ? percent + '%' : '100%' }}
                      >
                        <span className="flex items-center h-full justify-center text-base font-semibold">
                          {percent}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </>

          {/* <div className="flex items-center gap-2">
            <div className='text-base text-[#6E6B68] basis-2/5'>Session 1 (Date&Time) - Teacher Name/s</div>
            <div id="myProgress" className='w-full bg-[#F1915D] h-[40px] rounded-xl basis-3/5'>
              <div id="myBar" className='w-[100%] bg-[#F1915D] text-[#FFFFFF] text-center h-[40px] rounded-xl'><span className='flex items-center h-full justify-center text-base font-semibold'>100%</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className='text-base text-[#6E6B68] basis-2/5'>Session 1 Exam  (Date&Time) - Teacher Name/s</div>
            <div id="myProgress" className='w-full bg-[#F7F5F4] h-[40px] rounded-xl basis-3/5'>
              <div id="myBar" className='w-[70%] bg-[#F8C8AE] text-[#32302D] text-center h-[40px] rounded-xl'><span className='flex items-center h-full justify-center text-base font-semibold'>70%</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className='text-base text-[#6E6B68] basis-2/5'>Session 2  (Date&Time) - Teacher Name/s</div>
            <div id="myProgress" className='w-full bg-[#F7F5F4] h-[40px] rounded-xl basis-3/5'>
              <div id="myBar" className='text-[#32302D] text-center h-[40px] rounded-xl'><span className='flex items-center h-full justify-center text-base font-semibold'>0%</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className='text-base text-[#6E6B68] basis-2/5'>Session 2 Exam  (Date&Time) - Teacher Name/s</div>
            <div id="myProgress" className='w-full bg-[#F7F5F4] h-[40px] rounded-xl basis-3/5'>
              <div id="myBar" className='text-[#32302D] text-center h-[40px] rounded-xl'><span className='flex items-center h-full justify-center text-base font-semibold'>Physical Class - Classroom 2</span></div>
            </div>
          </div> */}
        </div>
        <div className="flex justify-end items-center mt-5">
          <ButtonCustom
            className="h-10"
            color="orange"
            onClick={() =>
              history(`${ROUTES.my_course}/${id}/module/${moduleId}/session?classId=${classId}`)
            }
          >
            Start Class
          </ButtonCustom>
        </div>
      </div>
    </Layout>
  );
};

export default MyCourseModule;
