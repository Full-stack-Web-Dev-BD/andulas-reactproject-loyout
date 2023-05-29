import { createMultipleClass, getClassById, updateClass } from 'api/class';
import ButtonCustom from 'components/Button';
import ModalCustom from 'components/Modal';
import { DATE_FORMAT, DATE_TIME_FORMAT, ROUTES } from 'constants/constants';
import { WARNING_MESSAGE } from 'constants/index';
import moment from 'moment';
import { ISession, ISessionsModule } from 'pages/admin/courses/component/CollapseModule';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import FormInfoClass, { IClassField } from './FormInfoClass';
import FormModule from './FormModule';
import { ReactComponent as DeleteIcon } from 'assets/icons/delete.svg';
import { AppContext } from 'context';

export interface IForm {
  formValue: IClassField;
  modules: Array<{ moduleName: string; sessions: ISession[] | [] }>;
}

interface IProps {
  onNextTab?: () => void;
  setEditing: (val: boolean) => void;
  setIsOpenConfirmLeave: (val: boolean) => void;
}

interface IClass {
  id: number;
  capacity: string;
  centre: { id: number; centreName: string };
  className: string;
  course: { courseName: string; id: number };
  startDate: string;
  endDate: string;
  combinedSessionsGroupByModule: {
    index: number;
    id: number;
    moduleName: string;
    moduleCode?: string;
    sessions: {
      id: number;
      sessionId?: number;
      centreID: number;
      centre: { centreName: string; id: number };
      classID: number;
      classroom: { id: number; roomName: string };
      endTime: string;
      session: { sessionName: string; id: number };
      disabled: boolean;
      startTime: string;
      teachers: {
        id: number;
        user: {
          id: number;
          userProfile: { firstName: string; lastName: string };
        };
      }[];
    }[];
  }[];
}

enum SessionField {
  TEACHERS = 'teachers',
  CENTRE = 'centre',
  DISABLED = 'disabled',
  ERROR = 'error',
}

const ManageClassUpdateInformation = (props: IProps) => {
  const { onNextTab, setEditing, setIsOpenConfirmLeave } = props;
  const { id } = useParams();
  const history = useNavigate();
  const forms: IForm = {
    formValue: {
      courseName: { label: '', value: '' },
      centre: { label: '', value: '' },
      className: '',
      capacity: '',
      startDate: '',
      endDate: '',
    },
    modules: [
      {
        moduleName: '',
        sessions: [],
      },
    ],
  };
  const [classes, setClasses] = useState([forms]);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isOpenConfirmCreateClass, setIsOpenConfirmCreateClass] = useState(false);
  const [isOpenModalWarning, setIsOpenModalWarning] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isChangeField, setIsChangeField] = useState<boolean>(false);
  const [isShowLessButton, setIsShowLessButton] = useState(false);
  const [isChangeCentre, setIsChangeCentre] = useState(false);
  const [isShowNoticeLeavePage, setIsShowNoticeLeavePage] = useState(false);
  const [isOpenModalCancelEdit, setIsOpenModalCancelEdit] = useState(false);
  const [isShowWarning, setIsShowWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [state]: any = useContext(AppContext);
  const isTeacher = state?.user?.userRole?.roleName === 'Teacher';

  const { mutate: handleCreateClass } = useMutation('createMultipleClass', createMultipleClass, {
    onSuccess: () => {
      // onNextTab();
      history(ROUTES.manage_class);
    },
    onError: ({ response }) => {
      if (response.status == 403) {
        setErrorMessage('You are not allowed to create class.');
      } else {
        setErrorMessage(response.data.message);
      }
      setIsShowWarning(true);
    },
  });

  const { mutate: getClass } = useMutation('getClass', getClassById, {
    onSuccess: ({ data }: { data: IClass }) => {
      setIsEdit(true);
      setIsChangeCentre(false);
      const formData = {
        formValue: {
          courseName: { label: data.course.courseName, value: data.course.id.toString() },
          centre: { label: data.centre.centreName, value: data.centre.id.toString() },
          className: data.className,
          capacity: data.capacity,
          startDate: data.startDate,
          endDate: data.endDate,
        },
        modules: data.combinedSessionsGroupByModule.map((module) => {
          const codeMudule =
            module?.moduleCode && module?.moduleCode !== '' ? `(${module?.moduleCode})` : '';
          return {
            moduleName: module.moduleName + ' ' + codeMudule,
            sessions: module.sessions.map((session) => {
              return {
                id: session.session.id,
                sessionId: session.id,
                sessionName: session.session.sessionName,
                centre: {
                  label: session?.centre?.centreName ? session.centre?.centreName : '',
                  value: session.centre?.id ? session.centre?.id.toString() : '',
                },
                classRoom: {
                  label: session.classroom?.roomName
                    ? session.classroom?.roomName
                    : 'Virtual classroom',
                  value: session.classroom?.id ? session.classroom?.id.toString() : '',
                },
                time:
                  session.startTime && session.endTime
                    ? [moment.utc(session.startTime), moment.utc(session.endTime)]
                    : undefined,
                teachers:
                  session?.teachers?.length > 0
                    ? session?.teachers?.map((teacher) => {
                        return {
                          label:
                            teacher?.user?.userProfile?.firstName +
                            ' ' +
                            teacher?.user?.userProfile?.lastName,
                          value: teacher.id.toString(),
                        };
                      })
                    : [],
                disabled: false,
              };
            }),
          };
        }),
      };
      setClasses([formData]);
    },
  });

  const { mutate: handleUpdateClass } = useMutation('updateClass', updateClass, {
    onSuccess: () => {
      // onNextTab();
      getClass(Number(id));
      setIsEdit(true);
      setEditing(false);
      setIsChangeField(false);
    },
    onError: ({ response }) => {
      if (response.status == 403) {
        setErrorMessage('You are not allowed to edit class.');
      } else {
        setErrorMessage(response.data.message);
      }
      setIsShowWarning(true);
    },
  });

  const handleBeforeSubmit = useCallback(() => {}, []);

  const validateClassForm = (
    item: IClassField,
    modules: Array<{ moduleName: string; sessions: ISession[] | [] }>,
  ) => {
    const isFillModule = modules.map((module) => {
      if (
        module.sessions.filter((ss) => {
          return (
            !ss?.centre?.value ||
            // !ss?.classRoom?.value ||
            !(ss?.teachers?.length > 0) ||
            !ss?.time ||
            ss?.error
          );
        })?.length === 0
      ) {
        return true;
      }
      return false;
    });

    const isFilledModule = !!(isFillModule.filter((fillItem) => !fillItem)?.length === 0);

    if (
      item.capacity &&
      item?.centre?.value &&
      item.className &&
      item?.courseName?.value &&
      item.endDate &&
      item.startDate &&
      isFilledModule
    ) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (id) {
      getClass(Number(id));
    }
  }, [id]);

  const checkFieldRequired = useCallback((classList: IForm[]) => {
    const classCheck = classList.map((item) => {
      if (validateClassForm(item.formValue, item.modules)) {
        return true;
      }
      return false;
    });
    if (classCheck?.filter((item) => !item).length > 0) {
      return false;
    }
    return true;
  }, []);

  const wrapDataSessions = useCallback(
    (classItem: IForm) => {
      const classSessions: {
        teacherIDs?: number[] | string[];
        sessionID?: number | string;
        centreID?: number | string;
        classroomID?: number | string;
        startTime?: string | string;
        endTime?: string | string;
      }[] = [];

      classItem.modules.map((md) => {
        md.sessions.map((ss) => {
          const session = {
            teacherIDs: ss.teachers.map((teacher: { label: string; value: string }) => {
              return Number(teacher.value);
            }),
            sessionID: ss.id,
            centreID: ss.centre.value ? Number(ss.centre.value) : '',
            classroomID: ss?.classRoom?.value ? Number(ss?.classRoom?.value) : undefined,
            startTime: Array.isArray(ss.time)
              ? ss.time[0].set({ second: 0, millisecond: 0 })?.toISOString()
              : '',
            endTime: Array.isArray(ss.time)
              ? ss.time[1].set({ second: 0, millisecond: 0 })?.toISOString()
              : '',
            id: ss?.sessionId ? ss?.sessionId : ss.id,
          };
          if (
            session?.teacherIDs &&
            session?.sessionID &&
            session?.centreID &&
            // session?.classroomID &&
            session?.endTime &&
            session?.startTime
          ) {
            classSessions.push(session);
          }
        });
      });

      return classSessions;
    },
    [id],
  );

  const verifiedSubmit = useCallback(() => {
    setIsOpenConfirmCreateClass(true);
  }, []);

  const confirmCreateOrUpdateClass = useCallback(() => {
    setIsOpenConfirmLeave(false);
    const dataClasses = classes.map((item) => {
      return {
        className: item.formValue.className,
        capacity: Number(item.formValue.capacity),
        centreID: Number(item.formValue.centre.value),
        courseID: Number(item.formValue.courseName.value),
        startDate: item.formValue.startDate,
        endDate: moment(item.formValue.endDate).endOf('day').toISOString(),
        classSessions: wrapDataSessions(item),
      };
    });
    if (id) {
      handleUpdateClass({ classId: Number(id), data: dataClasses });
      return;
    }
    handleCreateClass(dataClasses);
  }, [classes, id]);

  const handleSubmit = useCallback(() => {
    setIsSubmit(true);
    let validator = false;
    classes.map((item) => {
      if (validateClassForm(item.formValue, item.modules) && !isError) {
        validator = true;
        return;
      }
      validator = false;
    });
    if (validator) {
      verifiedSubmit();
      return;
    }
    setIsOpenModalWarning(true);
  }, [classes, isError]);

  const onAddNew = useCallback(() => {
    setIsSubmit(true);
    setIsShowLessButton(true);
    if (checkFieldRequired(classes) && !isError) {
      setClasses([...classes, forms]);
    }
  }, [classes, forms, isError]);

  const onChangeForm = useCallback(
    ({ index, key, value }: { index: number; key: string; value: any }) => {
      const newClasses = classes.map((item: IForm, indexClass: number) => {
        if ((key === 'startDate' || key === 'endDate') && Number(index) === Number(indexClass)) {
          return {
            ...item,
            formValue: {
              ...item.formValue,
              [key]: value ? value.startOf('day').toISOString() : '',
            },
          };
        }
        if (Number(index) === Number(indexClass)) {
          return { ...item, formValue: { ...item.formValue, [key]: value ? value : '' } };
        }
        return item;
      });
      setClasses(newClasses);
    },
    [classes, id],
  );

  const onChangeClasses = (
    prevClasses: IForm[],
    index: number[],
    key: string | boolean[],
    value: { label: string; value: string },
  ) => {
    return prevClasses.map((item, indexClass: number) => {
      if (indexClass === index[0]) {
        return {
          ...item,
          modules: item.modules.map((md, indexModule: number) => {
            if (indexModule === index[1]) {
              return {
                ...md,
                sessions: md.sessions.map((session) => {
                  if (session?.id === Number(key[0])) {
                    if (key[1] === SessionField.CENTRE) {
                      setIsChangeCentre(true);
                      return { ...session, [key[1]]: value, classRoom: null };
                    }
                    if (key[1] === SessionField.TEACHERS) {
                      setIsChangeCentre(true);
                      return { ...session, [key[1]]: value, centre: null, classRoom: null };
                    }
                    if (key[1] === SessionField.DISABLED) {
                      return { ...session, [key[1]]: key[2] as boolean };
                    }
                    return { ...session, [key[1] as string]: value };
                  }
                  return session;
                }),
              };
            }
            return md;
          }),
        };
      }
      return item;
    });
  };

  const onChangeModule = useCallback(
    (index: number[], key: string | boolean[]) => (value: { label: string; value: string }) => {
      setIsChangeField(true);

      setClasses((prev) => onChangeClasses(prev, index, key, value));
      setIsOpenConfirmLeave(true);
      if (id) {
        setEditing(true);
      }
    },
    [classes, id],
  );

  const validationSessionModule = (index: number[], key: string | boolean[]) => {
    const newClasses = classes.map((item, indexClass: number) => {
      if (indexClass === index[0]) {
        return {
          ...item,
          modules: item.modules.map((md, indexModule: number) => {
            if (indexModule === index[1]) {
              return {
                ...md,
                sessions: md.sessions.map((session) => {
                  if (session?.id === Number(key[0])) {
                    if (key[1] === SessionField.DISABLED) {
                      return { ...session, [key[1]]: key[2] as boolean, error: false };
                    }
                    if (key[1] === SessionField.ERROR) {
                      return { ...session, [key[1]]: key[2] as boolean };
                    }
                  }
                  return session;
                }),
              };
            }
            return md;
          }),
        };
      }
      return item;
    });
    setClasses(newClasses);
  };

  const returnSessionsModule = useCallback(
    (module: ISessionsModule[], index: number) => {
      const newClasses = classes.map((item, indx) => {
        if (indx === index) {
          return { ...item, modules: module };
        }
        return item;
      });
      setClasses(newClasses);
    },
    [classes],
  );

  const returnCentre = useCallback(
    (centre: { label: string; value: string }, index: number) => {
      const newClasses = classes.map((item, indx) => {
        if (indx === index) {
          return {
            ...item,
            modules: item.modules.map((md) => {
              return {
                ...md,
                sessions: md.sessions.map((ss) => {
                  return {
                    ...ss,
                    centre: centre,
                    classRoom: isChangeCentre ? null : ss.classRoom,
                    teachers: isChangeCentre ? [] : ss?.teachers,
                  };
                }),
              };
            }),
          };
        }
        return item;
      });
      setClasses(newClasses);
    },
    [classes, isChangeCentre],
  );

  const renderModalConfirm = useCallback(() => {
    const className = classes.map((item) => {
      return item.formValue.className;
    });
    if (isOpenConfirmCreateClass) {
      return (
        <ModalCustom
          okText="Confirm"
          titleCenter
          cancelText="Cancel"
          visible={isOpenConfirmCreateClass}
          onSubmit={confirmCreateOrUpdateClass}
          onCancel={() => setIsOpenConfirmCreateClass(false)}
          title="Confirmation"
          content={`Are you sure you want to ${
            id
              ? `update ${classes[0]?.formValue?.className} detail`
              : `create ${className.join(', ')}`
          }? `}
        />
      );
    }
  }, [id, isOpenConfirmCreateClass, classes]);

  const renderModalWarning = useCallback(() => {
    return (
      <ModalCustom
        titleCenter
        cancelText="Cancel"
        visible={isOpenModalWarning}
        onCancel={() => setIsOpenModalWarning(false)}
        title="Notice"
        content={`You must be fill all class and module session field or choose again fields displaying error.`}
      />
    );
  }, [isOpenModalWarning]);

  const handleLeaveCreateClass = useCallback(() => {
    setIsShowNoticeLeavePage(true);
    setIsOpenConfirmLeave(false);
  }, []);

  const handleCancelChangeField = useCallback(() => {
    if (isChangeField) {
      setIsOpenModalCancelEdit(true);
      return;
    }
    if (id) {
      setIsEdit(true);
    }
  }, [isChangeField, id]);

  const handleConfirmCancelEdit = useCallback(() => {
    setIsChangeField(false);
    setIsOpenConfirmLeave(false);
    if (id) {
      setIsEdit(false);
      setEditing(false);
      getClass(Number(id));
      return;
    }
    setClasses([forms]);
  }, [id]);

  const handleDeleteClass = (indexClass: number) => {
    const newClass = classes.filter((classItem: IForm, index: number) => index !== indexClass);
    setClasses(newClass);
  };

  return (
    <>
      {classes.map((x, index) => (
        <div
          className="p-10 bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.04)] rounded-3xl w-full mb-4"
          key={Number(index)}
        >
          <FormInfoClass
            setIsError={setIsError}
            isEdit={isEdit}
            isSubmit={isSubmit}
            data={x?.formValue}
            errorMessage={errorMessage}
            onChangeForm={onChangeForm}
            index={index}
            handleSubmit={handleBeforeSubmit}
            setIsChangeField={setIsChangeField}
            setEditing={setEditing}
            setIsOpenConfirmLeave={setIsOpenConfirmLeave}
          />
          <div className="content-title custom-font-header">Assign Teacher</div>

          <FormModule
            isShowLessButton={isShowLessButton}
            forms={forms}
            onChangeModule={onChangeModule}
            validationSessionModule={validationSessionModule}
            id={Number(id)}
            item={x}
            isEdit={isEdit}
            isShowError={isSubmit}
            indexClass={index}
            returnCentre={returnCentre}
            total={Number(classes.length)}
            returnSessionsModule={returnSessionsModule}
            setIsChangeField={setIsChangeField}
            classesList={classes}
          />

          {Number(index) === classes.length - 1 && !isTeacher && (
            <div className="flex justify-end gap-2 w-full mt-5 ">
              {isEdit ? (
                <ButtonCustom onClick={() => setIsEdit(false)} color="orange">
                  Edit
                </ButtonCustom>
              ) : (
                <>
                  {!id && (
                    <ButtonCustom
                      color="outline"
                      onClick={onAddNew}
                      className="min-w-fit lg:w-[calc(33.33%_-_0.5rem)] w-[20%]"
                    >
                      Add New
                    </ButtonCustom>
                  )}
                  {!id ? (
                    <ButtonCustom
                      onClick={handleLeaveCreateClass}
                      color="outline"
                      className="min-w-fit lg:w-[calc(33.33%_-_0.5rem)] w-[20%]"
                    >
                      Back
                    </ButtonCustom>
                  ) : (
                    !isEdit &&
                    id && (
                      <ButtonCustom
                        onClick={handleCancelChangeField}
                        color="outline"
                        className="min-w-fit lg:w-[calc(33.33%_-_0.5rem)] w-[20%]"
                      >
                        Cancel
                      </ButtonCustom>
                    )
                  )}
                  <ButtonCustom
                    onClick={handleSubmit}
                    color="orange"
                    className="min-w-fit lg:w-[calc(33.33%_-_0.5rem)] w-[20%]"
                  >
                    {id ? 'Update' : 'Add'}
                  </ButtonCustom>
                </>
              )}
              {classes?.length > 1 && (
                <ModalCustom
                  onSubmit={() => handleDeleteClass(index)}
                  title="Delete"
                  content={`Are you sure you want to remove this Class?`}
                  titleCenter
                  okText="Confirm"
                  cancelText="Cancel"
                  viewComponent={
                    <ButtonCustom
                      isRound
                      icon={<DeleteIcon className="icon-button" />}
                      color="outline"
                    />
                  }
                />
              )}
            </div>
          )}
        </div>
      ))}
      {renderModalConfirm()}
      {renderModalWarning()}
      <ModalCustom
        visible={isShowNoticeLeavePage}
        title="Notice"
        okText="Confirm"
        onCancel={() => setIsShowNoticeLeavePage(false)}
        cancelText="Cancel"
        titleCenter
        onSubmit={() => {
          history(ROUTES.manage_class);
        }}
        content={WARNING_MESSAGE.LEAVE_CLASS_DETAIL}
      />

      {isOpenModalCancelEdit && (
        <ModalCustom
          onSubmit={handleConfirmCancelEdit}
          visible={true}
          content="You have modified the Class Information. Are you sure you want to leave without saving? All changes will not be saved once you leave without saving"
          title="Notice"
          okText="Confirm"
          onCancel={() => setIsOpenModalCancelEdit(false)}
          cancelText="Cancel"
          titleCenter
        />
      )}

      {isShowWarning && (
        <ModalCustom
          visible={true}
          content={errorMessage}
          title="Warning"
          onCancel={() => setIsShowWarning(false)}
          cancelText="Cancel"
          titleCenter
        />
      )}
    </>
  );
};

export default ManageClassUpdateInformation;
