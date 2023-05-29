import { Breadcrumb, Layout, Table } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { getStudents } from 'api/class';
import { changeAttendance, getAttendance } from 'api/student';
import { ReactComponent as SortSVG } from 'assets/images/sort.svg';
import CheckboxCustom from 'components/Checkbox';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import { ROUTES } from 'constants/constants';
import { IAttendance, IClassStudent, IListClassStudent } from 'constants/types';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const { Header } = Layout;

interface LocationState {
  className: string;
  moduleName: string;
  sessionName: string;
  date: string;
}

const ClassAttendanceStudent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classId, moduleId, sessionId, classSessionId, date } = useParams();

  const [dataList, setDataList] = useState<IListClassStudent>();
  const [listAttendance, setListAttendance] = useState<IAttendance[]>();
  const [sort, setSort] = useState(1);

  const { mutate: getStudentList } = useMutation('getSessionTime', getStudents, {
    onSuccess: ({ data }: { data: IListClassStudent }) => {
      const studentSort = data?.students.sort((a, b) => {
        const front = `${a.student.user.userProfile.firstName} ${a.student.user.userProfile.lastName}`;
        const back = `${b.student.user.userProfile.firstName} ${b.student.user.userProfile.lastName}`;

        if (front > back) return sort;
        else if (front < back) return -sort;
        else return 0;
      });

      setDataList({
        students: studentSort,
        totalStudents: data.totalStudents,
      });
    },
  });

  const { mutate: getAttendanceList } = useMutation('getAttendance', getAttendance, {
    onSuccess: ({ data }: { data: IAttendance[] }) => {
      setListAttendance(data);
    },
  });

  const { mutate: changeAttendanceStudent } = useMutation('changeAttendance', changeAttendance, {
    onSuccess: () => {
      getAttendanceList({
        classSessionId: Number(classSessionId),
        attendanceDate: moment(date, 'DD-MM-YYYY').toDate(),
      });
    },
  });

  useEffect(() => {
    if (classId) {
      getStudentList(+classId);
    }
  }, [classId, sort]);

  useEffect(() => {
    if (classSessionId && date) {
      getAttendanceList({
        classSessionId: +classSessionId,
        attendanceDate: moment(date, 'DD-MM-YYYY').toDate(),
      });
    }
  }, [classSessionId, date]);

  const onChangeAttendance = (checked: CheckboxChangeEvent, studentId: number) => {
    changeAttendanceStudent({
      classSessionId: Number(classSessionId),
      attendanceDate: moment(date, 'DD-MM-YYYY').toDate(),
      studentId,
    });
  };

  const columns: any = [
    {
      title: (
        <span className="font-fontFamily" onClick={() => setSort((prev) => -prev)}>
          Name <SortSVG />
        </span>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (value?: string, record?: IClassStudent) => (
        <>
          <span className="font-fontFamily font-semibold">
            {`${record?.student?.user?.userProfile?.firstName || ''} ${
              record?.student?.user?.userProfile?.lastName || ''
            }`}
          </span>
        </>
      ),
    },
    {
      title: <span className="font-fontFamily">Take Attendance</span>,
      dataIndex: 'isAttendance',
      key: 'isAttendance',
      render: (value?: string, record?: IClassStudent) => {
        const checked =
          listAttendance?.find((attendance) => attendance.studentId === record?.studentID)
            ?.isAttendance || false;

        return (
          <CheckboxCustom
            checked={checked}
            onChange={(checkedAttendance) =>
              onChangeAttendance(checkedAttendance, Number(record?.studentID))
            }
          />
        );
      },
    },
  ];

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6">
      <Header className="flex justify-between items-center bg-transparent px-0 h-auto">
        <Breadcrumb className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0">
          <Breadcrumb.Item
            className="cursor-pointer font-fontFamily"
            onClick={() => navigate(ROUTES.class_management)}
          >
            Class Management
          </Breadcrumb.Item>
          <Breadcrumb.Item className="font-fontFamily">
            {(location.state as LocationState).className}
          </Breadcrumb.Item>
          <Breadcrumb.Item
            className="cursor-pointer font-fontFamily"
            onClick={() =>
              navigate(`${ROUTES.class_management}/${classId}${ROUTES.attendance}`, {
                state: {
                  className: (location.state as LocationState).className,
                },
              })
            }
          >
            Attendance
          </Breadcrumb.Item>
          <Breadcrumb.Item
            className="cursor-pointer font-fontFamily"
            onClick={() =>
              navigate(
                `${ROUTES.class_management}/${classId}${ROUTES.attendance}/module/${moduleId}`,
                {
                  state: {
                    className: (location.state as LocationState).className,
                    moduleName: (location.state as LocationState).moduleName,
                  },
                },
              )
            }
          >
            {(location.state as LocationState).moduleName}
          </Breadcrumb.Item>
          <Breadcrumb.Item
            className="font-fontFamily cursor-pointer"
            onClick={() =>
              navigate(
                `${ROUTES.class_management}/${classId}${ROUTES.attendance}/module/${moduleId}/session/${sessionId}`,
                {
                  state: {
                    className: (location.state as LocationState).className,
                    moduleName: (location.state as LocationState).moduleName,
                    sessionName: (location.state as LocationState).sessionName,
                  },
                },
              )
            }
          >
            {(location.state as LocationState).sessionName}
          </Breadcrumb.Item>
          <Breadcrumb.Item className="font-fontFamily text-main-font-color">
            {(location.state as LocationState).date}
          </Breadcrumb.Item>
        </Breadcrumb>
      </Header>

      {dataList?.students && dataList.students.length > 0 ? (
        <>
          <Table
            pagination={false}
            columns={columns}
            dataSource={dataList?.students}
            className="bg-transparent table-component cursor-pointer"
            rowKey="id"
          />
          <div className="flex justify-between items-center">
            <span
              className="text-sm text-[#6E6B68]"
              style={{
                fontFamily: 'Montserrat',
              }}
            >
              Total {dataList?.totalStudents || 0} Students
            </span>
          </div>
        </>
      ) : (
        <SearchNotFound isBackgroundWhite text="" />
      )}
    </Layout>
  );
};

export default ClassAttendanceStudent;
