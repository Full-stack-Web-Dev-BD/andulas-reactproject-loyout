import { DatePicker } from 'antd';
import { searchCentres, searchCentresOfAdmin } from 'api/centres';
import { checkValidationSession, IParamValidationSession, searchClassRoom } from 'api/class';
import { searchTeacher } from 'api/teacher';
import SelectSearch from 'components/SelectSearch';
import CustomTooltip from 'components/Tooltip';
import { DATE_TIME_FORMAT, PARAMS_SELECT_SEARCH, ROLE } from 'constants/index';
import { AppContext } from 'context';
import moment, { Moment, MomentInput } from 'moment';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { IForm } from '../../manage-class/manage-class-update/Information';
import { ISession } from '../CollapseModule';

const { RangePicker } = DatePicker;

interface IProps {
  indexClass: number;
  indexModule: number;
  onChangeModule: any;
  item: ISession;
  startDate: string;
  endDate: string;
  centre: { label: string; value: string };
  isShowError: boolean;
  setIsChangeField: (val: boolean) => void;
  indexSession: number;
  sessions: ISession[];
  validationSessionModule: (index: number[], key: string | boolean[]) => void;
  classesList: IForm[];
  disabled: boolean;
}

const CardSessionModule = (props: IProps) => {
  const {
    item,
    indexClass,
    indexModule,
    onChangeModule,
    startDate,
    endDate,
    centre,
    isShowError,
    indexSession,
    sessions,
    validationSessionModule,
    classesList,
    disabled,
  } = props;
  const timeout: any = useRef(null);
  const [state]: any = useContext(AppContext);
  const isAdmin = state?.user?.centreAdmin;
  const adminId = state?.user?.centreAdmin?.id;
  const [limit] = useState(10);
  const [order] = useState('DESC');
  const [centreOptions, setCentreOptions] = useState<{ label: string; value: string }[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<{ label: string; value: string }[]>([]);
  const [classRoomOptions, setClassRoomOptions] = useState<{ label: string; value: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const { mutate: searchCentre } = useMutation('searchCentres', searchCentres, {
    onSuccess: (res: { data: { listCentres: { centreName: string; id: number }[] } }) => {
      const options = res.data.listCentres.map((centreItem) => {
        return {
          label: centreItem.centreName,
          value: centreItem.id.toString(),
        };
      });
      setCentreOptions(options as { label: string; value: string }[]);
    },
  });

  const { mutate: searchCentreOfAdmin } = useMutation(
    'searchCentresOfAdmin',
    searchCentresOfAdmin,
    {
      onSuccess: (res: { data: { listCentres: { centreName: string; id: number }[] } }) => {
        const options = res.data.listCentres.map((centreItem) => {
          return {
            label: centreItem.centreName,
            value: centreItem.id.toString(),
          };
        });
        setCentreOptions(options as { label: string; value: string }[]);
      },
    },
  );

  const { mutate: searchTeachers } = useMutation('searchTeacher', searchTeacher, {
    onSuccess: (res: {
      data: {
        records: { user: { userProfile: { firstName: string; lastName: string } }; id: number }[];
      };
    }) => {
      const options = res.data.records.map((teacher) => {
        return {
          label: teacher?.user?.userProfile?.firstName + ' ' + teacher?.user?.userProfile?.lastName,
          value: teacher.id.toString(),
        };
      });
      setTeacherOptions(options as { label: string; value: string }[]);
    },
  });

  const { mutate: searchClassRooms } = useMutation('searchClassRoom', searchClassRoom, {
    onSuccess: (res: { data: { listClassrooms: { roomName: string; id: number }[] } }) => {
      const optionDefault = [{ label: 'Virtual classroom', value: '' }];
      const options = res.data.listClassrooms.map((classRoom) => {
        return {
          label: classRoom.roomName,
          value: classRoom.id.toString(),
        };
      });
      const newOptions = optionDefault.concat(options);
      setClassRoomOptions(newOptions as { label: string; value: string }[]);
    },
  });

  const { mutate: validationSession } = useMutation(
    'checkValidationSession',
    checkValidationSession,
    {
      onSuccess: () => {
        setErrorMessage('');
        if (validationSessionModule instanceof Function) {
          validationSessionModule([indexClass, indexModule], [
            item?.id?.toString() as string,
            'disabled',
            false,
          ] as string | boolean[]);
        }
      },
      onError: ({ response }) => {
        setErrorMessage(response.data.message);
        if (item?.classRoom && item?.classRoom?.value !== '') {
          if (validationSessionModule instanceof Function) {
            validationSessionModule([indexClass, indexModule], [
              item?.id?.toString() as string,
              'error',
              true,
            ] as string | boolean[]);
          }
        } else {
          if (validationSessionModule instanceof Function) {
            validationSessionModule([indexClass, indexModule], [
              item?.id?.toString() as string,
              'disabled',
              false,
            ] as string | boolean[]);
          }
        }
      },
    },
  );

  const handleSearchCentre = useCallback(
    (value: string) => {
      if (item?.teachers?.length > 0) {
        clearTimeout(timeout?.current);
        timeout.current = setTimeout(() => {
          if (isAdmin && adminId) {
            searchCentreOfAdmin({
              ...PARAMS_SELECT_SEARCH.centre,
              id: Number(adminId),
            });
            return;
          }
          searchCentre({
            ...PARAMS_SELECT_SEARCH.centre,
            search: value,
            limit,
            filters: JSON.stringify([
              {
                teacherIDs:
                  item?.teachers?.length > 0
                    ? item?.teachers?.map((teacher: { value: string }) => Number(teacher?.value))
                    : '',
              },
            ]),
          });
        }, 500);
      }
    },
    [timeout, limit, item?.teachers, isAdmin, adminId],
  );

  const disableDateRanges = (range: { startTime: boolean | string; endTime: boolean | string }) => {
    const { startTime, endTime } = range;
    return function disabledDate(current: Moment) {
      let startCheck = true;
      let endCheck = true;
      const formatCurrent = current.toISOString();
      if (startTime) {
        startCheck =
          current &&
          moment(formatCurrent, DATE_TIME_FORMAT) <
            moment(startTime as MomentInput, DATE_TIME_FORMAT);
      }
      if (endTime) {
        endCheck =
          current &&
          moment(formatCurrent, DATE_TIME_FORMAT) >
            moment(endTime as MomentInput, DATE_TIME_FORMAT).add(24, 'hours');
      }
      return !!(startTime && startCheck) || !!(endTime && endCheck);
    };
  };

  const handleSearchClassRoom = useCallback(
    (value: string) => {
      if (item?.centre?.value) {
        clearTimeout(timeout?.current);
        timeout.current = setTimeout(() => {
          searchClassRooms({
            page: 1,
            limit,
            search: value,
            filters: JSON.stringify([{ centreID: Number(item.centre.value) }]),
          });
        }, 500);
      }
    },
    [timeout, item?.centre?.value, limit],
  );

  const handleSearchTeacher = useCallback(
    (value: string) => {
      if (centre?.value) {
        clearTimeout(timeout?.current);
        timeout.current = setTimeout(() => {
          searchTeachers({
            ...PARAMS_SELECT_SEARCH.teacher,
            limit,
            search: value,
            filters: JSON.stringify([{ isActive: true, centreID: Number(centre?.value) }]),
          });
        }, 500);
      }
    },
    [timeout, limit, centre?.value],
  );

  useEffect(() => {
    if (item?.teachers?.length > 0) {
      if (isAdmin && adminId) {
        searchCentreOfAdmin({
          ...PARAMS_SELECT_SEARCH.centre,
          id: Number(adminId),
        });
        return;
      }
      searchCentre({
        ...PARAMS_SELECT_SEARCH.centre,
        limit,
        filters: JSON.stringify([
          {
            teacherIDs: item?.teachers?.map((teacher: { value: string }) => Number(teacher?.value)),
          },
        ]),
      });
      return;
    }
    setCentreOptions([]);
  }, [item?.teachers, isAdmin, adminId]);

  useEffect(() => {
    if (centre?.value) {
      searchTeachers({
        ...PARAMS_SELECT_SEARCH.teacher,
        limit,
        filters: JSON.stringify([{ isActive: true, centreID: Number(centre?.value) }]),
      });
      return;
    }
    setTeacherOptions([]);
  }, [centre]);

  useEffect(() => {
    if (item?.centre?.value) {
      searchClassRooms({
        limit,
        order,
        page: 1,
        search: '',
        filters: JSON.stringify([
          { centreID: item?.centre?.value ? Number(item.centre.value) : Number(centre?.value) },
        ]),
      });

      return;
    }
    setClassRoomOptions([{ label: 'Virtual classroom', value: '' }]);
  }, [item.centre, centre]);

  const checkClasses = useCallback(() => {
    const dataValidation: IParamValidationSession[] = [];

    classesList.map((cl) => {
      cl.modules.map((md) => {
        md.sessions.map((ss) => {
          if (
            ss?.centre?.value &&
            // ss?.classRoom?.value && ss?.classRoom?.value !== "" &&
            ss?.teachers?.length > 0 &&
            ss.id &&
            ss.time
          ) {
            dataValidation.push({
              sessionID: Number(ss.id),
              teacherIDs: ss.teachers.map((teacher: { label: string; value: string }) =>
                Number(teacher.value),
              ),

              startTime: Array.isArray(ss.time)
                ? ss.time[0].set({ second: 0, millisecond: 0 })?.toISOString()
                : '',
              endTime: Array.isArray(ss.time)
                ? ss.time[1].set({ second: 0, millisecond: 0 })?.toISOString()
                : '',
              classroomID: ss?.classRoom?.value ? Number(ss?.classRoom?.value) : undefined,
            });
          }
        });
      });
    });

    return dataValidation;
  }, [classesList]);

  const isDisable = useMemo(() => {
    return indexSession === 0
      ? false
      : !(
          sessions[indexSession - 1]?.centre?.value &&
          // sessions[indexSession - 1]?.classRoom?.value &&
          sessions[indexSession - 1]?.teachers?.length > 0 &&
          sessions[indexSession - 1]?.time &&
          !sessions[indexSession - 1]?.disabled
        );
  }, [sessions, indexSession]);

  useEffect(() => {
    if (
      item?.centre?.value &&
      // item?.classRoom?.value &&
      item?.teachers?.length > 0 &&
      item.id &&
      item.time
    ) {
      validationSession(checkClasses());
    }
  }, [item?.centre?.value, item?.classRoom?.value, item?.teachers, item?.id, item?.time]);

  const renderSession = useCallback(() => {
    return (
      <div className="mb-4 font-fontFamily text-sm text-main-font-color flex items-center gap-3 module-session flex-start">
        <div className="flex flex-col w-[9%] min-width-80">
          <div className="mb-4 text-[#6E6B68] session-title-column">&nbsp;</div>
          <div className="flex items-center">{item.sessionName}</div>
        </div>
        <div className="flex flex-col w-[20%] max-w-[20%] min-width-200">
          <div className="mb-4 text-[#6E6B68] session-title-column">Teacher</div>
          <SelectSearch
            tooltipTitle={
              Array.isArray(item.teachers)
                ? item.teachers
                    .map((teacher: { label: string; value: string }) => teacher.label)
                    .join(', ')
                : ''
            }
            isMultiple
            onChange={onChangeModule(
              [indexClass, indexModule],
              [item?.id?.toString() as string, 'teachers'],
            )}
            value={item.teachers}
            handleSearchOptions={handleSearchTeacher}
            options={teacherOptions}
            disable={isDisable || disabled}
            className={isShowError && item?.teachers?.length === 0 ? 'field-error' : ''}
          />
        </div>
        <div className="flex flex-col w-[20%] min-width-160">
          <div className="mb-4 text-[#6E6B68] session-title-column">Centre</div>
          <SelectSearch
            onChange={onChangeModule(
              [indexClass, indexModule],
              [item?.id?.toString() as string, 'centre'],
            )}
            handleSearchOptions={handleSearchCentre}
            value={item.centre}
            options={centreOptions}
            disable={isDisable || disabled}
            tooltipTitle={item?.centre?.label}
            className={isShowError && !item?.centre?.value ? 'field-error' : ''}
          />
        </div>
        {/* {returnClassRoom(item.centre.value)} */}
        <div className="flex flex-col w-[20%] min-width-160">
          <div className="mb-4 text-[#6E6B68] session-title-column">Classroom</div>
          <SelectSearch
            onChange={onChangeModule(
              [indexClass, indexModule],
              [item?.id?.toString() as string, 'classRoom'],
            )}
            value={item.classRoom || { label: 'Virtual classroom', value: '' }}
            tooltipTitle={item?.classRoom?.label}
            handleSearchOptions={handleSearchClassRoom}
            options={classRoomOptions}
            disable={isDisable || disabled}
            // className={isShowError ? 'field-error' : ''}
          />
        </div>
        <div className="flex flex-col w-[26%] min-width-200">
          <div className="mb-4 text-[#6E6B68] session-title-column">Schedule / Timing</div>
          <CustomTooltip
            title={
              item?.time && (isDisable || disabled)
                ? `${item?.time?.[0]?.local()?.format(DATE_TIME_FORMAT)} - ${item?.time?.[1]
                    ?.local()
                    ?.format(DATE_TIME_FORMAT)}`
                : ''
            }
          >
            <RangePicker
              onChange={onChangeModule(
                [indexClass, indexModule],
                [item?.id?.toString() as string, 'time'],
              )}
              value={item.time?.map((t) => t.local()) as any}
              placeholder={['Start time', 'End time']}
              showTime={{
                hideDisabledOptions: true,
              }}
              disabledDate={disableDateRanges({ startTime: startDate, endTime: endDate })}
              className="style_input_custom_login_page"
              ranges={{
                Today: [moment(), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
              }}
              format={DATE_TIME_FORMAT}
              disabled={isDisable || disabled}
              style={{ borderColor: isShowError && !item?.time ? 'red' : '' }}
              inputReadOnly
              allowClear
            />
          </CustomTooltip>
        </div>
      </div>
    );
  }, [
    classRoomOptions,
    teacherOptions,
    centreOptions,
    isDisable,
    disabled,
    isShowError,
    startDate,
    endDate,
    indexClass,
    indexModule,
    item,
    handleSearchTeacher,
  ]);

  return (
    <>
      {renderSession()}
      {item?.classRoom && item?.classRoom?.value !== '' && errorMessage && (
        <div className="w-full flex gap-3 mb-3">
          <div className=" w-[9%]" />
          <div className="font-fontFamily text-[#ff4d4f]">{errorMessage}</div>
        </div>
      )}
    </>
  );
};

export default CardSessionModule;
