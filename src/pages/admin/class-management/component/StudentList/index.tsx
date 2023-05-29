import {
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import {
  Breadcrumb,
  Checkbox,
  DatePicker,
  Form,
  Layout,
  Modal,
  notification,
  Popconfirm,
  Progress,
  TablePaginationConfig,
  Tag,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import {
  completeStudentUserUnits,
  deleteUserUnitsByClassIDAndUserID,
  deleteUserUnitsByUnitID,
  getAllUnits,
  IUserUnit,
  saveUserUnits,
  searchUnits,
} from 'api/content_management';
import { deleteCategory, deleteSelectionCategories, getListCategories } from 'api/courses';
import { getAllSessionByClassModule } from 'api/session';
import {
  countStudentResetableClassManagement,
  countStudentSynchronizableClassManagement,
  exportCSVClassManagementStudentList,
  getStudentDetailByIdClassManagement,
  resetAllUserUnitByClassID,
  searchStudentClassManagement,
} from 'api/student';
import { IUser } from 'api/user';
import { ReactComponent as EditSVG } from 'assets/icons/edit_icon.svg';
import { ReactComponent as TrashSVG } from 'assets/icons/trash_icon.svg';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import SearchNotFound from 'components/SearchBar/SearchNotFound';
import TableCustom from 'components/SearchBar/Table';
import CustomTooltip from 'components/Tooltip';
import { ISessionClassModule } from 'constants/types';
import { ROUTES } from 'constants/constants';
import { useDebounce } from 'hooks';
import moment from 'moment';
import { IUnit } from 'pages/admin/content-management/session/add-content-session';
import { renderUnitIcon } from 'pages/admin/content-management/session/add-content-session/ListUnit';
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import FilterCard from './components/FilterCard';
import './style.css';
import CheckboxCustom from 'components/Checkbox';
import { getClassById, IClass } from 'api/class';

interface IFields {
  search?: string;
}

interface IStudent {
  completedOn: any;
  completedPercent: number;
  createdAt: any;
  fullName: string;
  id: number;
  unitCompleted: IUnit[];
  unitPassed: IUnit[];
  user: IUser;
}

interface ISessionWithUnits extends ISessionClassModule {
  units: IUnit[];
}

const { Header, Content } = Layout;

const ClassManagementStudentList = () => {
  const history = useNavigate();
  const { classId } = useParams();
  const navigate = useNavigate();
  const [form] = useForm();
  const [formComplete] = useForm();
  const [detailClass, setDetailClass] = useState<IClass>();
  const [messageWarningSynchronize, setMessageWarningSynchronize] = useState<boolean>(false);
  const [messageWarningReset, setMessageWarningReset] = useState<boolean>(false);
  const [messageCompleteAStudent, setMessageCompleteAStudent] = useState<boolean>(false);
  const [messageSynchronizeAllStudent, setMessageSynchronizeAllStudent] = useState<boolean>(false);
  const [messageResetAllStudent, setMessageResetAllStudent] = useState<boolean>(false);
  const [isOpenListUnits, setIsOpenListUnits] = useState<boolean>(false);
  const [listSessions, setListSessions] = useState<ISessionClassModule[]>([]);
  const [listUnits, setListUnits] = useState<IUnit[]>([]);
  const [listStudents, setListStudents] = useState<IStudent[]>([]);
  const [dataDropdown, setDataDropdown] = useState([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchDropdown, setSearchDropdown] = useState<string>('');
  const [limit, setLimit] = useState<string>('5');
  const [order, setOrder] = useState<string>('ASC');
  const debounceValue = useDebounce(searchDropdown, 300);
  const [studentChoose, setStudentChoose] = useState<IStudent>();
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: Number(limit),
    position: [],
  });

  const [totalStudentSyncOrReset, setTotalStudentSyncOrReset] = useState<number>(0);

  const [listSessionsWithUnits, setListSessionsWithUnits] = useState<ISessionWithUnits[]>([]);

  const { mutate: getListSessions } = useMutation('searchSessions', getAllSessionByClassModule, {
    onSuccess: ({ data }: { data: ISessionClassModule[] }) => {
      setListSessions(data);
    },
  });

  const { mutate: getUnits, isLoading: isSearchingUnits } = useMutation(
    'getAllUnits',
    getAllUnits,
    {
      onSuccess: ({ data }: { data: { records: IUnit[] } }) => {
        const dataPush = data.records;
        setListUnits(dataPush);
      },
    },
  );

  const { mutate: mutateGetStudentList, isLoading: isLoadingListStudents } = useMutation(
    'searchStudentClassManagement',
    searchStudentClassManagement,
    {
      onSuccess: (result) => {
        const data = result?.data?.records;
        setLimit(String(result?.data.limit));
        setPagination({
          current: result?.data.page,
          pageSize: Number(limit),
          total: result?.data.total,
          position: [],
        });
        setListStudents(data);
        if (messageSynchronizeAllStudent) {
          setMessageSynchronizeAllStudent(false);
          notification.success({
            message: `Successfully synchronized the progress of ${
              totalStudentSyncOrReset || 0
            } users`,
          });
          setTotalStudentSyncOrReset(0);
        }
      },
    },
  );

  const { mutate: mutateDropdown } = useMutation(
    'searchStudentClassManagement',
    searchStudentClassManagement,
    {
      onSuccess: (result) => {
        const data = result?.data?.records;
        setDataDropdown(data);
      },
    },
  );

  const {
    mutate: mutateGetStudentDetailByIdClassManagement,
    isLoading: isLoadingGetStudentDetail,
  } = useMutation('getStudentDetailByIdClassManagement', getStudentDetailByIdClassManagement, {
    onSuccess: ({ data }) => {
      console.log('dataaaaaaaa', data);
      if (data && studentChoose) {
        setStudentChoose(data);
        if (listStudents && data.id && listStudents.findIndex((x) => x.id === data.id) >= 0) {
          const temp = [...listStudents];
          const index = listStudents.findIndex((x) => x.id === data.id);
          temp[index] = data;
          setListStudents(temp);
        }
        if (studentChoose && messageWarningSynchronize) {
          setStudentChoose(undefined);
          setMessageWarningSynchronize(false);
        }
        if (studentChoose && messageWarningReset) {
          setStudentChoose(undefined);
          setMessageWarningReset(false);
        }
        if (studentChoose && messageCompleteAStudent) {
          setStudentChoose(undefined);
          formComplete.resetFields();
          setMessageCompleteAStudent(false);
        }
      }
    },
    onError: () => {},
  });

  const { mutate: mutatesaveUserUnits } = useMutation('saveUserUnits', saveUserUnits, {
    onSuccess: ({ data }) => {
      console.log('dataaaaaaaa', data);
      if (studentChoose && studentChoose.user && studentChoose.user.id) {
        mutateGetStudentDetailByIdClassManagement({
          id: studentChoose.id,
          params: {
            filters: JSON.stringify([{ classID: classId }]),
          },
        });
      }
    },
    onError: () => {},
  });

  const { mutate: mutateDeleteUserUnitsByUnitID } = useMutation(
    'deleteUserUnitsByUnitID',
    deleteUserUnitsByUnitID,
    {
      onSuccess: ({ data }) => {
        console.log('dataaaaaaaa', data);
        if (studentChoose && studentChoose.user && studentChoose.user.id) {
          mutateGetStudentDetailByIdClassManagement({
            id: studentChoose.id,
            params: {
              filters: JSON.stringify([{ classID: classId }]),
            },
          });
        }
      },
      onError: () => {},
    },
  );

  const {
    mutate: mutateDeleteUserUnitsByClassIDAndUserID,
    isLoading: isDeletingUserUnitsByClassID,
  } = useMutation('deleteUserUnitsByClassID', deleteUserUnitsByClassIDAndUserID, {
    onSuccess: ({ data }) => {
      console.log('dataaaaaaaa', data);
      if (studentChoose && studentChoose.user && studentChoose.user.id) {
        mutateGetStudentDetailByIdClassManagement({
          id: studentChoose.id,
          params: {
            filters: JSON.stringify([{ classID: classId }]),
          },
        });
      }
    },
    onError: () => {},
  });

  const { mutate: mutateCompleteStudent } = useMutation(
    'completeStudentUserUnits',
    completeStudentUserUnits,
    {
      onSuccess: ({ data }) => {
        console.log('dataaaaaaaa', data);
        if (studentChoose && studentChoose.user && studentChoose.user.id) {
          mutateGetStudentDetailByIdClassManagement({
            id: studentChoose.id,
            params: {
              filters: JSON.stringify([{ classID: classId }]),
            },
          });
        }
      },
      onError: () => {},
    },
  );

  const { mutate: mutateCountSynchronizableStudent, isLoading: isCountingSynchronize } =
    useMutation(
      'countStudentSynchronizableClassManagement',
      countStudentSynchronizableClassManagement,
      {
        onSuccess: (result) => {
          const total = result?.data?.total;
          setTotalStudentSyncOrReset(total);
          setMessageSynchronizeAllStudent(true);
        },
      },
    );

  const { mutate: mutateCountResetableStudent, isLoading: isCountingReset } = useMutation(
    'countStudentResetableClassManagement',
    countStudentResetableClassManagement,
    {
      onSuccess: (result) => {
        const total = result?.data?.total;
        setTotalStudentSyncOrReset(total);
        setMessageResetAllStudent(true);
      },
    },
  );

  const { mutate: mutateResetAllByClassID, isLoading: isResetingAll } = useMutation(
    'resetAllUserUnitByClassID',
    resetAllUserUnitByClassID,
    {
      onSuccess: ({ data }) => {
        setMessageResetAllStudent(false);
        mutateGetStudentList({
          limit: Number(limit),
          page: pagination?.current as number,
          search: searchValue,
          order: order,
          filters: JSON.stringify([{ classID: classId }]),
        });
        notification.success({
          message: totalStudentSyncOrReset
            ? `Success! The progress of ${totalStudentSyncOrReset} user was reset.`
            : 'No users to reset progress',
        });
      },
      onError: () => {},
    },
  );

  const { mutate: mutateExportCSVStudentList, isLoading: isExporting } = useMutation(
    'exportCSVClassManagementStudentList',
    exportCSVClassManagementStudentList,
    {
      onSuccess: (result) => {
        console.log('result csv', result);
        const name = `andalus-class${classId ? '-' + classId : ''}-users`;

        const blob = new Blob(['\uFEFF' + result.data], {
          type: 'text/csv; charset=utf-18',
        });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        a.download = name;
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
    },
  );

  const { mutate: getClass } = useMutation('getClass', getClassById, {
    onSuccess: ({ data }) => {
      setDetailClass(data);
    },
  });

  useEffect(() => {
    mutateDropdown({
      limit: Number(limit),
      page: 1,
      search: debounceValue,
      order: order,
      filters: JSON.stringify([{ classID: classId }]),
    });
  }, [debounceValue, classId]);

  useEffect(() => {
    if (classId) {
      getClass(Number(classId));
    }
  }, [classId]);

  const onFinish = (values: IFields) => {
    const search = values.search || '';
    setSearchValue(search || '');
    mutateGetStudentList({
      limit: Number(limit),
      page: 1,
      search,
      order: order,
      filters: JSON.stringify([{ classID: classId }]),
    });
  };

  const onValuesChange = (values: IFields) => {
    const search = values.search || '';
    setSearchDropdown(search);
  };

  const searchResult = useMemo(
    () => (
      <>
        {debounceValue ? (
          <div className="bg-white rounded-2xl p-4 min-h-[100px] word-break">
            {dataDropdown?.length > 0 ? (
              dataDropdown?.map((x: any) => (
                <div
                  className="py-2 font-fontFamily font-normal cursor-pointer"
                  onClick={() => {
                    // history(`${ROUTES.update_category}/${x.id}`);
                    const values = {
                      search: x.fullName || '',
                    };
                    onFinish(values);
                    onValuesChange(values);
                    form.setFieldValue('search', x.fullName || '');
                  }}
                  key={x.id}
                >
                  {x.fullName}
                </div>
              ))
            ) : debounceValue ? (
              <div className="text-center font-fontFamily font-normal pt-4">
                No results found for “{debounceValue}”
              </div>
            ) : null}
          </div>
        ) : (
          <div />
        )}
      </>
    ),
    [debounceValue, dataDropdown],
  ) as ReactElement<string>;

  const handleTableChange = (paginate: TablePaginationConfig) => {
    setPagination({ ...pagination, ...paginate });
  };

  const onChangeLimit = (value: string) => {
    const total = pagination.total;
    const maxPage = Math.ceil(Number(total) / Number(value));
    setLimit(String(value));
    if (Number(pagination.current) > maxPage) setPagination({ ...pagination, current: maxPage });
    else setPagination(pagination);
  };

  const onFilter = useCallback(
    (value: string) => {
      setOrder(value);
      setPagination({ ...pagination, current: 1 });
    },
    [pagination],
  );

  const handleReset = useCallback(() => {
    setSearchDropdown('');
    setSearchValue('');
    setOrder('ASC');
    setLimit('5');
    form.resetFields();
    mutateGetStudentList({
      limit: Number(5),
      page: 1,
      search: '',
      order: 'ASC',
      filters: JSON.stringify([{ classID: classId }]),
    });
  }, [limit, classId]);

    const handleCompleteUnit = useCallback((unitID: number) => {
        if (studentChoose) {
            const data: IUserUnit = {
                isPassed: true,
                isCompleted: true,
                userID: studentChoose.user.id,
                finishedTime: moment().toDate(),
                score: 100,
            }
            const dataPush = {
                unitID: unitID,
                data: data,
            }
            mutatesaveUserUnits(dataPush);
        }
    }, [studentChoose, classId]);

  const handleResetUnit = useCallback(
    (unitID: number) => {
      if (studentChoose && studentChoose.user?.id) {
        const data = {
          userID: studentChoose.user.id,
        };
        const dataPush = {
          unitID: unitID,
          data: data,
        };
        mutateDeleteUserUnitsByUnitID(dataPush);
      }
    },
    [studentChoose, classId],
  );

  const handleResetAStudent = useCallback(() => {
    if (studentChoose && studentChoose.user?.id && classId) {
      const data = {
        userID: studentChoose.user.id,
      };
      const dataPush = {
        classID: Number(classId),
        data: data,
      };
      mutateDeleteUserUnitsByClassIDAndUserID(dataPush);
    }
  }, [studentChoose, classId]);

  const handleCompleteStudent = useCallback(() => {
    if (studentChoose && studentChoose.user?.id && classId) {
      const values = formComplete.getFieldsValue();
      if (!values.enrolledDate) {
        notification.error({ message: 'Completion date must be after Enrolled on date' });
        return;
      }
      const enrolledDate = moment(values.enrolledDate);
      const completedDate = values.completedDate ? moment(values.completedDate) : moment();
      if (enrolledDate.isAfter(completedDate)) {
        notification.error({ message: 'Completion date must be after Enrolled on date' });
        return;
      }

      console.log('difff', moment().diff(enrolledDate, 'day'));

      const data: {
        userID: number;
        classID: number;
        enrolledOn: any;
        completedOn: any;
      } = {
        userID: studentChoose.user.id,
        classID: Number(classId),
        enrolledOn: moment().diff(enrolledDate, 'day') ? enrolledDate.toDate() : moment(),
        completedOn: moment().diff(completedDate, 'day') ? completedDate.toDate() : moment(),
      };
      mutateCompleteStudent(data);
    }
  }, [studentChoose, classId, formComplete]);

  const findMostRecentCompletedUnit = (session: ISessionWithUnits) => {
    // const firstSessionIncludesCompletedUnit = listSessionsWithUnits.slice().reverse().find(
    //     session => session.units.slice().reverse().find(
    //         unit => studentChoose?.unitCompleted.find(
    //             complete => complete.id === unit.id
    //         )
    //     )
    // );
    const firstSessionIncludesCompletedUnit = { ...session };
    if (firstSessionIncludesCompletedUnit) {
      const unitId = firstSessionIncludesCompletedUnit.units
        .slice()
        .reverse()
        .find((unit) =>
          studentChoose?.unitCompleted.find((complete) => complete.id === unit.id),
        )?.id;
      return unitId;
    } else {
      return null;
    }
  };

  const findFirstUncompletedUnit = (session: ISessionWithUnits) => {
    // const firstSessionIncludesCompletedUnit = listSessionsWithUnits.find(
    //     session => session.units.find(
    //         unit => !studentChoose?.unitPassed.find(
    //             complete => complete.id === unit.id
    //         )
    //     )
    // );
    const firstSessionIncludesCompletedUnit = { ...session };
    if (firstSessionIncludesCompletedUnit) {
      const unitId = firstSessionIncludesCompletedUnit.units.find(
        (unit) => !studentChoose?.unitPassed.find((complete) => complete.id === unit.id),
      )?.id;
      return unitId;
    } else {
      return null;
    }
  };

  const estimateTimeAndCompletedOnUnit = (student: IStudent, unit: IUnit) => {
    const findUnit = student.unitCompleted.find((x: IUnit) => x.id === unit.id);
    if (findUnit) {
      const temp = findUnit.userUnits?.find(
        (y: IUserUnit) => y.userID === student.user.id,
      ).finishedTime;
      if (temp) {
        return moment(temp).format('YYYY/MM/DD, LT');
      } else {
        return '-';
      }
    } else {
      return '-';
    }
  };

    const renderTimeText = (time: string) => {
        if (time) {
            const parsedTime = moment(time);
            if (moment().isAfter(parsedTime) && moment().diff(parsedTime, 'seconds') < 10) {
                return 'Just now';
            }
            else if (moment().isAfter(parsedTime) && moment().diff(parsedTime, 'seconds') >= 10 && moment().diff(parsedTime, 'seconds') < 60) {
                return 'A few moments ago';
            }
            else if (moment().isAfter(parsedTime) && moment().diff(parsedTime, 'minutes') < 60) {
                return moment().diff(parsedTime, 'minutes') + " minutes ago";
            }
            else if (moment().isAfter(parsedTime) && moment().diff(parsedTime, 'hours') >= 1 && moment().diff(parsedTime, 'hours') < 24) {
                return moment().diff(parsedTime, 'hours') + " hours ago";
            }
            else if (moment().isAfter(parsedTime) && moment().diff(parsedTime, 'hours') >= 24 && moment().diff(parsedTime, 'hours') < 48) {
                return "Yesterday";
            }
            else if (moment().isAfter(parsedTime) && moment().diff(parsedTime, 'days') >= 1 && moment().diff(parsedTime, 'days') <= 7) {
                return moment().diff(parsedTime, 'days') + " days ago";
            }
            else {
                return moment(time).format("YYYY/MM/DD");
            }
        }
        else {
            return "";
        }
    }

  useEffect(() => {
    getListSessions({
      filters: JSON.stringify([{ classID: classId }]),
    });
    getUnits({
      filters: JSON.stringify([{ classID: classId }]),
    });
  }, [classId]);

  useEffect(() => {
    if (listSessions.length > 0) {
      const temp: ISessionWithUnits[] = [...listSessions].map((session) => {
        const tempUnits =
          listUnits
            ?.filter((unit) => unit.sessionID === session.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0)) || [];
        return {
          ...session,
          units: tempUnits,
        };
      });
      setListSessionsWithUnits(temp);
    } else {
      setListSessionsWithUnits([]);
    }
  }, [listSessions, listUnits]);

  useEffect(() => {
    mutateGetStudentList({
      limit: Number(limit),
      page: pagination?.current as number,
      search: searchValue,
      order: order,
      filters: JSON.stringify([{ classID: classId }]),
    });
  }, [pagination.current, limit, order, classId]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      fixed: true,
    },
    {
      title: 'Enrolled on',
      dataIndex: 'createdAt',
      fixed: true,
      align: 'center',
      render: (text: string) => {
        return (
          // <div>{moment(text).format('YYYY/MM/DD')}</div>
          <div>{renderTimeText(text)}</div>
        );
      },
    },
    {
      title: 'Progress',
      dataIndex: 'completedPercent',
      fixed: true,
      width: 200,
      align: 'center',
      render: (text: string, record: any) => {
        console.log('record', record);
        return (
          <div
            className="progress-container cursor-pointer"
            onClick={() => {
              setIsOpenListUnits(true);
              setStudentChoose(record);
            }}
          >
            <Progress
              percent={record?.completedPercent ? Math.round(Number(record?.completedPercent)) : 0}
              strokeColor={{ from: '#F1915D', to: '#F1915D' }}
              format={(percent) => {
                return <>{percent !== 100 ? `${Math.round(percent || 0)}%` : 'Completed'}</>;
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Completed on',
      dataIndex: 'completedOn',
      fixed: true,
      align: 'center',
      render: (text: string, record: any) => {
        if (record?.unitPassed && record?.unitPassed.length === listUnits.length) {
          return <div>{renderTimeText(text)}</div>;
        } else if (record?.unitCompleted && record?.unitCompleted.length > 0) {
          return '-';
        } else {
          return 'Not started';
        }
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      fixed: true,
      width: 100,
      render: (text: string, record: any) => (
        <div className="flex">
          <div
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setStudentChoose(record);
              setMessageCompleteAStudent(true);
            }}
          >
            <CustomTooltip title="Complete">
              <CheckOutlined className="icon-hover" />
            </CustomTooltip>
          </div>
          <div
            className="cursor-pointer ml-5"
            onClick={(e) => {
              e.stopPropagation();
              setStudentChoose(record);
              setMessageWarningSynchronize(true);
            }}
          >
            <CustomTooltip title="Synchronize">
              <SyncOutlined className="icon-hover" />
            </CustomTooltip>
          </div>
          <div
            className="cursor-pointer ml-5"
            onClick={(e) => {
              e.stopPropagation();
              setStudentChoose(record);
              setMessageWarningReset(true);
            }}
          >
            <CustomTooltip title="Reset">
              <UndoOutlined className="icon-hover" />
            </CustomTooltip>
          </div>
        </div>
      ),
    },
  ];

  const renderModalWarningSynchronizeAStudent = useCallback(() => {
    return (
      messageWarningSynchronize &&
      studentChoose && (
        <Modal
          visible={true}
          className="student-list__modal"
          onCancel={() => {
            setStudentChoose(undefined);
            setMessageWarningSynchronize(false);
          }}
          footer={[
            <ButtonCustom
              key={'Cancel'}
              onClick={() => {
                setStudentChoose(undefined);
                setMessageWarningSynchronize(false);
              }}
            >
              Cancel
            </ButtonCustom>,
            <ButtonCustom
              key={'Synchronize'}
              onClick={() => {
                mutateGetStudentDetailByIdClassManagement({
                  id: studentChoose.id,
                  params: {
                    filters: JSON.stringify([{ classID: classId }]),
                  },
                });
              }}
              color="orange"
              className="text-white"
              isLoading={isLoadingGetStudentDetail}
            >
              Synchronize
            </ButtonCustom>,
          ]}
          title={studentChoose?.fullName + ' (Synchronize)'}
        >
          <div>
            Are you sure you want to synchronize the user progress based on the current course
            material?
          </div>
        </Modal>
      )
    );
  }, [messageWarningSynchronize, studentChoose, classId]);

  const renderModalWarningResetAStudent = useCallback(() => {
    return (
      messageWarningReset &&
      studentChoose && (
        <Modal
          visible={true}
          className="student-list__modal"
          onCancel={() => {
            setStudentChoose(undefined);
            setMessageWarningReset(false);
          }}
          footer={[
            <ButtonCustom
              key={'Cancel'}
              onClick={() => {
                setStudentChoose(undefined);
                setMessageWarningReset(false);
              }}
            >
              Cancel
            </ButtonCustom>,
            <ButtonCustom
              key={'Reset'}
              onClick={() => {
                handleResetAStudent();
              }}
              color="orange"
              className="text-white"
              isLoading={isDeletingUserUnitsByClassID || isLoadingGetStudentDetail}
            >
              Reset
            </ButtonCustom>,
          ]}
          title="Reset progress"
        >
          <div>
            <p>Are you sure you want to reset the progress of {studentChoose?.fullName}?</p>
            <p>This action cannot be undone</p>
          </div>
        </Modal>
      )
    );
  }, [messageWarningReset, studentChoose, classId]);

  const renderModalCompleteAStudent = useCallback(() => {
    console.log('studentChoose', studentChoose);
    const enrolledDate = studentChoose?.createdAt ? moment(studentChoose?.createdAt) : undefined;

    const completedDate =
      studentChoose?.unitCompleted &&
      listUnits &&
      studentChoose.unitCompleted.length === listUnits.length &&
      studentChoose?.completedOn
        ? moment(studentChoose?.completedOn)
        : undefined;

    formComplete.setFieldsValue({
      enrolledDate,
      completedDate,
    });

    return (
      messageCompleteAStudent &&
      studentChoose && (
        <Modal
          visible={true}
          className="student-list__modal"
          onCancel={() => {
            setStudentChoose(undefined);
            formComplete.resetFields();
            setMessageCompleteAStudent(false);
          }}
          footer={[
            <ButtonCustom
              key={'Cancel'}
              onClick={() => {
                setStudentChoose(undefined);
                setMessageCompleteAStudent(false);
              }}
            >
              Cancel
            </ButtonCustom>,
            <ButtonCustom
              key={'Complete'}
              onClick={() => {
                handleCompleteStudent();
              }}
              color="orange"
              className="text-white"
              isLoading={isDeletingUserUnitsByClassID || isLoadingGetStudentDetail}
            >
              Complete
            </ButtonCustom>,
          ]}
          title="Complete"
        >
          <Form form={formComplete}>
            <Form.Item label={<span className="w-[120px]">Enrolled on</span>} name="enrolledDate">
              <DatePicker format={'YYYY/MM/DD'} className="w-[192px] custom-width" inputReadOnly />
            </Form.Item>

            <Form.Item label={<span className="w-[120px]">Complete on</span>} name="completedDate">
              <DatePicker format={'YYYY/MM/DD'} className="w-[192px] custom-width" inputReadOnly />
            </Form.Item>
          </Form>
        </Modal>
      )
    );
  }, [messageCompleteAStudent, studentChoose, classId, formComplete]);

  const renderModalSynchronizeAllStudent = useCallback(() => {
    return (
      messageSynchronizeAllStudent && (
        <Modal
          visible={true}
          className="student-list__modal"
          onCancel={() => {
            setMessageSynchronizeAllStudent(false);
            setTotalStudentSyncOrReset(0);
          }}
          footer={[
            <ButtonCustom
              key={'Cancel'}
              onClick={() => {
                setStudentChoose(undefined);
                setMessageSynchronizeAllStudent(false);
              }}
            >
              Cancel
            </ButtonCustom>,
            <ButtonCustom
              key={'Complete'}
              onClick={() => {
                mutateGetStudentList({
                  limit: Number(limit),
                  page: pagination?.current as number,
                  search: searchValue,
                  order: order,
                  filters: JSON.stringify([{ classID: classId }]),
                });
              }}
              color="orange"
              className="text-white"
              isLoading={isLoadingListStudents}
            >
              Synchronize
            </ButtonCustom>,
          ]}
          title="Synchronize"
        >
          <div className="">
            <p>
              Are you sure you want to synchronize user progress based on the current course
              material for all users in the course?
            </p>
            <p>
              <Checkbox
                onChange={(e) => {
                  mutateCountSynchronizableStudent({
                    classID: Number(classId),
                    isNotCompleted: e.target.checked || undefined,
                  });
                }}
                className="mr-3"
              />
              <span>Prevent syncing for users that have completed the course</span>
            </p>
            <p>{totalStudentSyncOrReset} users will be affected by this action</p>
          </div>
        </Modal>
      )
    );
  }, [
    messageSynchronizeAllStudent,
    studentChoose,
    classId,
    formComplete,
    pagination.current,
    limit,
    order,
    totalStudentSyncOrReset,
    isLoadingListStudents,
  ]);

  const renderModalResetAllStudent = useCallback(() => {
    return (
      messageResetAllStudent && (
        <Modal
          visible={true}
          className="student-list__modal"
          onCancel={() => {
            setMessageResetAllStudent(false);
            setTotalStudentSyncOrReset(0);
          }}
          footer={[
            <ButtonCustom
              key={'Cancel'}
              onClick={() => {
                setStudentChoose(undefined);
                setMessageResetAllStudent(false);
              }}
            >
              Cancel
            </ButtonCustom>,
            <ButtonCustom
              key={'Complete'}
              onClick={() => {
                if (classId) {
                  mutateResetAllByClassID({
                    classID: Number(classId),
                  });
                }
              }}
              color="orange"
              className="text-white"
              isLoading={isLoadingListStudents}
            >
              Reset
            </ButtonCustom>,
          ]}
          title="Reset progress"
        >
          <div className="">
            <p>Are you sure you want to reset the progress for all users in the course?</p>
            <p>{totalStudentSyncOrReset} users will be affected by this action</p>
          </div>
        </Modal>
      )
    );
  }, [messageResetAllStudent, classId, totalStudentSyncOrReset, isLoadingListStudents]);

  const renderListUnits = useCallback(() => {
    return (
      isOpenListUnits &&
      studentChoose && (
        <Modal
          visible={true}
          className="student-list__modal"
          onCancel={() => {
            setIsOpenListUnits(false);
            setStudentChoose(undefined);
          }}
          footer={[
            <ButtonCustom
              key={'Close'}
              onClick={() => {
                setIsOpenListUnits(false);
                setStudentChoose(undefined);
              }}
            >
              Close
            </ButtonCustom>,
          ]}
          title={studentChoose.fullName + ' (progress in units)'}
        >
          <div className="h-[400px] overflow-auto">
            {listSessionsWithUnits?.map((session) => {
              return (
                <div className="section-item" key={session.id}>
                  <Tag color="#999999" className="text-base mb-4 font-weight-600">
                    {session.sessionName}
                  </Tag>
                  <div className="section-item__list-units">
                    {session?.units.map((unit, index) => {
                      return (
                        <div
                          className="list-unit-item relative flex items-center gap-4 mb-4 w-full"
                          key={unit.id}
                        >
                          <div
                            className="ml-5 flex items-center justify-center content-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {studentChoose.unitCompleted &&
                            studentChoose.unitCompleted.length > 0 &&
                            studentChoose.unitCompleted.find((x: IUnit) => x.id === unit.id) ? (
                              studentChoose.unitPassed &&
                              studentChoose.unitPassed.length > 0 &&
                              studentChoose.unitPassed.find((x: IUnit) => x.id === unit.id) ? (
                                <CheckOutlined className="unit-passed-icon" />
                              ) : (
                                <CloseOutlined className="unit-failed-icon" />
                              )
                            ) : (
                              renderUnitIcon(unit)
                            )}
                          </div>
                          <div className="unit-title">{unit.unitName}</div>
                          <div className="unit-action text-xs gap-2">
                            {/* {listUnits.find((x: IUnit) => !studentChoose.unitCompleted.find((y: IUnit) => y.id === x.id))?.id === unit.id ? ( */}
                            {findFirstUncompletedUnit(session) &&
                            findFirstUncompletedUnit(session) === unit.id ? (
                              <Popconfirm
                                title="Are you sure？"
                                icon={<QuestionCircleOutlined />}
                                onConfirm={() => {
                                  if (unit.id) {
                                    handleCompleteUnit(unit.id);
                                  }
                                }}
                              >
                                <span className="cursor-pointer">Complete</span>
                              </Popconfirm>
                            ) : (
                              ''
                            )}

                                                                {/* {listUnits.slice().reverse().find((x: IUnit) => studentChoose.unitCompleted.find((y: IUnit) => y.id === x.id))?.id === unit.id ? ( */}
                                                                {findMostRecentCompletedUnit(session) && findMostRecentCompletedUnit(session) === unit.id ? (
                                                                    <Popconfirm
                                                                        title="Are you sure？"
                                                                        icon={<QuestionCircleOutlined />}
                                                                        onConfirm={
                                                                            () => {
                                                                                if (unit.id) {
                                                                                    handleResetUnit(unit.id)
                                                                                }
                                                                            }
                                                                        }
                                                                    >
                                                                        <span className='cursor-pointer'>
                                                                            Reset
                                                                        </span>
                                                                    </Popconfirm>
                                                                ) : ""}
                                                            </div>
                                                            <div className="unit-info">
                                                                {
                                                                    studentChoose
                                                                        && 
                                                                        studentChoose.unitPassed
                                                                        &&
                                                                        studentChoose.unitPassed.length > 0
                                                                        &&
                                                                        studentChoose.unitPassed.find((x: IUnit) => x.id === unit.id)
                                                                        ?
                                                                        (
                                                                            <CustomTooltip
                                                                                title={`Complete on: ${estimateTimeAndCompletedOnUnit(studentChoose, unit)}`}
                                                                            >
                                                                                <InfoCircleOutlined className='cursor-pointer' />
                                                                            </CustomTooltip>
                                                                        )
                                                                        :
                                                                        ""
                                                                }
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </Modal>
            )
        );
    }, [isOpenListUnits, studentChoose]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6 student-list">
      <Header className="flex justify-between items-center bg-transparent px-0">
        <Breadcrumb className="text-[1.75rem] leading-9 font-bold mb-0">
          <Breadcrumb.Item
            className="cursor-pointer font-fontFamily"
            onClick={() => navigate(ROUTES.class_management)}
          >
            Class Management
          </Breadcrumb.Item>
          <Breadcrumb.Item className="font-fontFamily">
            {detailClass && detailClass.className ? detailClass.className : ''}
          </Breadcrumb.Item>
          <Breadcrumb.Item className="font-fontFamily text-main-font-color">
            Student list
          </Breadcrumb.Item>
        </Breadcrumb>
      </Header>

      <div className="flex justify-end items-center bg-transparent px-0">
        <div className="flex gap-4 items-center w-full justify-end flex-wrap">
          <ButtonCustom
            className="lg:w-[calc(33.33%_-_0.67rem)] w-[20%]  min-w-fit sm:w-full"
            color="orange"
            onClick={() => {
              mutateCountSynchronizableStudent({
                classID: Number(classId),
              });
            }}
            isLoading={isCountingSynchronize}
          >
            Synchronize all
          </ButtonCustom>

          <ButtonCustom
            className="lg:w-[calc(33.33%_-_0.67rem)] w-[20%]  min-w-fit  sm:w-full"
            color="orange"
            onClick={() => {
              if (classId) {
                mutateCountResetableStudent({
                  classID: Number(classId),
                });
              }
            }}
            isLoading={isCountingReset}
          >
            Reset all
          </ButtonCustom>

          <ButtonCustom
            className="lg:w-[calc(33.33%_-_0.67rem)] w-[20%]  min-w-fit  sm:w-full"
            color="orange"
            onClick={() => {
              if (classId) {
                mutateExportCSVStudentList({
                  limit: Number(limit),
                  page: pagination?.current as number,
                  search: searchValue,
                  order: order,
                  filters: JSON.stringify([{ classID: classId }]),
                });
              }
            }}
            isLoading={isExporting}
          >
            Export CSV
          </ButtonCustom>
        </div>
      </div>

      <FilterCard
        onFinish={onFinish}
        form={form}
        onValuesChange={onValuesChange}
        handleReset={handleReset}
        dropdown={{ overlay: searchResult }}
      />

      <TableCustom
        isSearch={searchValue ? true : false}
        hidePageSize
        searchNotFound={
          listStudents.length > 0 ? undefined : (
            <SearchNotFound isBackgroundWhite text={searchValue} />
          )
        }
        columns={columns}
        data={listStudents}
        pagination={pagination}
        isLoading={isLoadingListStudents}
        handleTableChange={handleTableChange}
        onChangePagination={(page) => {
          setPagination({ ...pagination, current: Number(page) });
        }}
        onLastPage={() => {
          setPagination({
            ...pagination,
            current: Math.ceil(Number(pagination.total) / Number(pagination.pageSize)),
          });
        }}
        onFirstPage={() => {
          setPagination({ ...pagination, current: 1 });
        }}
        viewItem={{
          onChange: onChangeLimit,
          value: String(limit),
        }}
        filters={{
          show: true,
          options: [
            { label: 'Name (A-Z)', value: 'ASC' },
            { label: 'Name (Z-A)', value: 'DESC' },
          ],
          onChange: onFilter,
          value: order,
        }}
        hideColSelection
      />
      {renderModalWarningSynchronizeAStudent()}
      {renderModalWarningResetAStudent()}
      {renderModalCompleteAStudent()}
      {renderModalSynchronizeAllStudent()}
      {renderModalResetAllStudent()}
      {renderListUnits()}
    </Layout>
  );
};

export default ClassManagementStudentList;
