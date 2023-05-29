import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Dropdown, Layout, Menu } from 'antd';
import { getClassById } from 'api/class';
import { getCourseDetail, IParamsSearch } from 'api/courses';
import { getModuleById } from 'api/module';
import { getAllSessionByClassModule, searchSessions } from 'api/session';
import ButtonCustom from 'components/Button';
import { ISession } from 'constants/types';
import { DATE_FORMAT, ROUTES } from 'constants/constants';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IUserUnit, saveUserUnitsStudent, searchUnits } from 'api/content_management';
import {
  ContentType,
  IUnit,
  ListUnit,
  UnitType,
} from 'pages/admin/content-management/session/add-content-session';
import MyCoursePreviewCheckbox from './content/Checkbox';
import MyCoursePreviewQuestion from './content/Question';
import Loading from 'components/Loading';
import TestPreview from 'pages/admin/content-management/session/add-content-session/CreateUnit/Test/TestPreview';
import {
  initialUnitOptions,
  IUnitOptions,
  shuffle,
} from 'pages/admin/content-management/session/add-content-session/CreateUnit/Test/TestConstantsAndInterface';
import { AppContext } from 'context';
import moment from 'moment';
import { RoleName } from 'pages/admin/content-management';

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

const MyCourseSession = () => {
  const { id, moduleId } = useParams();
  const [stateContext]: any = useContext(AppContext);
  const search = useLocation().search;
  const title = new URLSearchParams(search).get('title');
  const history = useNavigate();
  const [sessionChoose, setSessionChoose] = useState<number>();
  const [dataCourses, setDataCourses] = useState<ICourseDetail>();
  const [isShowDrop, setIsShowDrop] = useState<boolean>();

  const [moduleName, setModuleName] = useState<string>('');
  const [className, setClassName] = useState('');
  const classId = new URLSearchParams(search).get('classId');
  const sessionId = new URLSearchParams(search).get('sessionId');

  const [filter, setFilter] = useState<IParamsSearch>({
    page: 1,
    limit: 100,
    sort: 'sessionName',
    order: 'ASC',
    search: '',
  });

  const [listSessions, setListSessions] = useState<ISession[]>([]);
  const [listUnits, setListUnits] = useState<IUnit[]>([]);
  const [unitChoose, setUnitChoose] = useState<IUnit>();
  // const [listContentsAnswered, setListContentsAnswered] = useState<any[]>([]); console.log("tempListContentsAnswered", listContentsAnswered)

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

  const { mutate: getListSessionsByModuleId, isLoading: isLoadingSearchSessions } = useMutation(
    'searchSessions',
    getAllSessionByClassModule,
    {
      onSuccess: ({ data }: { data: ISession[] }) => {
        let temp = data;
        if (sessionId) {
          const findOne = temp.find((x) => x.id === Number(sessionId));
          if (findOne) {
            temp = temp.filter((x) => x.id !== Number(sessionId));
            temp.unshift(findOne);
          }
        }
        setListSessions(temp || []);
        if (temp.length > 0) {
          setSessionChoose(temp[0].id);
        }
      },
    },
  );

  const { mutate: getUnits, isLoading: isSearchingUnits } = useMutation(
    'searchUnits',
    searchUnits,
    {
      onSuccess: ({
        data,
      }: {
        data: { records: IUnit[]; total: number; page: number; limit: number };
      }) => {
        // setListContentsAnswered([]);
        const dataPush = data.records.map((el, index) => el);
        setListUnits(dataPush);
        console.log('stateContext?.user?.id', stateContext?.user?.id);
        if (dataPush.length > 0) {
          let unitChooseDefault;
          for (let i = 0; i < dataPush.length; i++) {
            const arr: IUserUnit[] = dataPush[i].userUnits || [];
            if (arr.length === 0) {
              unitChooseDefault = dataPush[i];
              break;
            } else if (
              arr &&
              arr.length > 0 &&
              !arr.find(
                (x) => x.userID && stateContext?.user?.id && x.userID === stateContext?.user?.id,
              )
            ) {
              unitChooseDefault = dataPush[i];
              break;
            } else if (
              arr &&
              arr.length > 0 &&
              arr.find(
                (x) => x.userID && stateContext?.user?.id && x.userID === stateContext?.user?.id,
              )
            ) {
              const currentCheckUserUnit = arr.find(
                (x) => x.userID && stateContext?.user?.id && x.userID === stateContext?.user?.id,
              );
              if (!currentCheckUserUnit?.isCompleted) {
                unitChooseDefault = dataPush[i];
                break;
              }
            }
          }
          // setUnitChoose(dataPush[0]);
          // console.log("unitChooseDefault", unitChooseDefault)
          setUnitChoose(unitChooseDefault || dataPush[0]);
        } else {
          setUnitChoose(undefined);
        }
      },
    },
  );

  const handleSetListUnitsAfterSaveResultTest = (data: IUserUnit) => {
    if (unitChoose && listUnits && listUnits.length > 0 && stateContext?.user?.id) {
      const currentIndex = listUnits.findIndex((x) => x.id === unitChoose.id);
      if (currentIndex >= 0) {
        const temp = [...listUnits];
        const fakeArr: IUserUnit[] = temp[currentIndex].userUnits
          ? (temp[currentIndex].userUnits as IUserUnit[])
          : [];
        const findExist = fakeArr.findIndex((x) => x.userID === stateContext?.user?.id);
        // console.log("findExist", findExist, temp)
        if (findExist >= 0) {
          fakeArr[findExist] = data;
          temp[currentIndex].userUnits = fakeArr;
          setListUnits(temp);

          if (unitChoose.unitType === UnitType.TEST) {
            const tempUnitChoose = { ...unitChoose };
            tempUnitChoose.userUnits = fakeArr;
            setUnitChoose(tempUnitChoose);
          }
        } else {
          fakeArr.push(data);
          temp[currentIndex].userUnits = fakeArr;
          setListUnits(temp);

          if (unitChoose.unitType === UnitType.TEST) {
            const tempUnitChoose = { ...unitChoose };
            tempUnitChoose.userUnits = fakeArr;
            setUnitChoose(tempUnitChoose);
          }
        }
      }
    }
  };

  const { mutate: mutatesaveUserUnitsStudent } = useMutation(
    'saveUserUnitsStudent',
    saveUserUnitsStudent,
    {
      onSuccess: ({ data }) => {
        // console.log("dataaaaaaaa", data)
        if (data && handleSetListUnitsAfterSaveResultTest) {
          handleSetListUnitsAfterSaveResultTest(data);
        }
      },
    },
  );

  useEffect(() => {
    if (id) {
      getCourse(Number(id));
    }
  }, [id]);

  useEffect(() => {
    if (moduleId) {
      getModuleDetail(Number(moduleId));
      getListSessionsByModuleId({
        ...filter,
        filters: JSON.stringify([{ moduleID: moduleId, classID: classId }]),
      });
    }
  }, [moduleId, classId, sessionId]);

  useEffect(() => {
    if (classId) {
      getClass(Number(classId));
    }
  }, [classId]);

  useEffect(() => {
    if (sessionChoose) {
      getUnits({
        ...filter,
        sort: 'order',
        filters: JSON.stringify([
          Object.fromEntries(
            Object.entries({
              sessionID: Number(sessionChoose),
            }).filter(([, v]) => (v as any)?.toString() !== ''),
          ),
        ]),
      });
    }
  }, [sessionChoose, stateContext?.user]);

  const menu = useCallback(
    () => (
      <Menu>
        {listSessions.length > 0 &&
          listSessions.map((x) => (
            <Menu.Item
              key={x.id}
              onClick={() => {
                setSessionChoose(x.id);
                setIsShowDrop(false);
              }}
            >
              {x.sessionName || ''}
            </Menu.Item>
          ))}
      </Menu>
    ),
    [listSessions],
  );

  const saveResult = (value: any, isButtonBack?: boolean) => {
    const savedData = {
      ...value,
    };

    const data: IUserUnit = {
      score: undefined,
      attempNumber: undefined,
      isPassed: !isButtonBack ? true : undefined,
      isCompleted: !isButtonBack ? true : undefined,
      // startTime: startTime,
      // endTime: endTime,
      // finishedTime: moment().toDate(),
      savedData: JSON.stringify(savedData),
    };
    if (stateContext?.user?.userRole?.roleName === RoleName.STUDENT) {
      // if (true) {
      if (unitChoose && unitChoose.id) {
        const dataPush = {
          unitID: unitChoose?.id,
          data: data,
        };
        mutatesaveUserUnitsStudent(dataPush);
      }
    }
  };

  const handleClickContinue = useCallback(
    (result: boolean, studentAnswers?: any, correctAnswers?: any, savedAnswers?: any) => {
      if (unitChoose) {
        if (listUnits?.length > 0) {
          const currentIndex = listUnits.findIndex((x) => x.id === unitChoose.id);
          // const tempListContentsAnswered = [...listContentsAnswered];

          const savedData = {
            ...(unitChoose.content && unitChoose.content.length > 0 ? unitChoose.content[0] : {}),
            result: result,
            studentAnswers: studentAnswers,
            correctAnswers: correctAnswers,
            savedAnswers: savedAnswers,
          };

          // tempListContentsAnswered[currentIndex] = savedData;

          // setListContentsAnswered(tempListContentsAnswered);

          if (unitChoose.unitType !== UnitType.TEST) {
            saveResult(savedData);
          }

          if (currentIndex < listUnits.length - 1) {
            const temp = listUnits[currentIndex + 1];
            setUnitChoose(temp);
          } else {
            const currentIndexSession = listSessions.findIndex((x) => x.id === sessionChoose);
            if (currentIndexSession < listSessions.length - 1) {
              const nextId = listSessions[currentIndexSession + 1]?.id;
              setSessionChoose(nextId);
            } else {
              history(-1);
            }
          }
        } else {
          const currentIndexSession = listSessions.findIndex((x) => x.id === sessionChoose);
          if (currentIndexSession < listSessions.length - 1) {
            const nextId = listSessions[currentIndexSession + 1]?.id;
            setSessionChoose(nextId);
          } else {
            history(-1);
          }
        }
      } else {
        const currentIndexSession = listSessions.findIndex((x) => x.id === sessionChoose);
        if (currentIndexSession < listSessions.length - 1) {
          const nextId = listSessions[currentIndexSession + 1]?.id;
          setSessionChoose(nextId);
        } else {
          history(-1);
        }
      }
    },
    [listUnits, unitChoose, sessionChoose, listSessions],
  );

  const handleClickBack = useCallback(
    (result: boolean, studentAnswers?: any, correctAnswers?: any, savedAnswers?: any) => {
      if (unitChoose) {
        const savedData = {
          ...(unitChoose.content && unitChoose.content.length > 0 ? unitChoose.content[0] : {}),
          result: result,
          studentAnswers: studentAnswers,
          correctAnswers: correctAnswers,
          savedAnswers: savedAnswers,
        };

        if (unitChoose.unitType !== UnitType.TEST) {
          saveResult(savedData, true);
        }

        if (listUnits?.length > 0) {
          const currentIndex = listUnits.findIndex((x) => x.id === unitChoose.id);
          if (currentIndex < listUnits.length && currentIndex > 0) {
            const temp = listUnits[currentIndex - 1];
            setUnitChoose(temp);
          } else {
            const currentIndexSession = listSessions.findIndex((x) => x.id === sessionChoose);
            if (currentIndexSession > 0) {
              const nextId = listSessions[currentIndexSession - 1]?.id;
              setSessionChoose(nextId);
            } else {
              history(-1);
            }
          }
        } else {
          const currentIndexSession = listSessions.findIndex((x) => x.id === sessionChoose);
          if (currentIndexSession > 0) {
            const nextId = listSessions[currentIndexSession - 1]?.id;
            setSessionChoose(nextId);
          } else {
            history(-1);
          }
        }
      } else {
        const currentIndexSession = listSessions.findIndex((x) => x.id === sessionChoose);
        if (currentIndexSession >= 1) {
          const nextId = listSessions[currentIndexSession - 1]?.id;
          setSessionChoose(nextId);
        } else {
          history(-1);
        }
      }
    },
    [listUnits, unitChoose],
  );

  const renderPreview = useCallback(() => {
    const currentIndexSession = listSessions.findIndex((x) => x.id === sessionChoose);
    if (unitChoose) {
      const currentIndex = listUnits.findIndex((x) => x.id === unitChoose.id);
      const savedContent: IUserUnit =
        unitChoose.userUnits &&
          unitChoose.userUnits?.length > 0 &&
          stateContext?.user?.userRole?.roleName === RoleName.STUDENT &&
          unitChoose.userUnits.findIndex((x) => x.userID === stateContext?.user?.id) >= 0
          ? unitChoose.userUnits[
          unitChoose.userUnits.findIndex((x) => x.userID === stateContext?.user?.id)
          ]
          : null;
      // console.log("savedContent", savedContent)
      switch (unitChoose.unitType) {
        case UnitType.CONTENT:
          if (unitChoose.content && unitChoose.content.length > 0) {
            const content = {
              ...unitChoose.content[0],
              isCompleted: savedContent?.isCompleted || false,
              isPassed: savedContent?.isPassed || false,
            };
            if (content.contentType === ContentType.QUESTION) {
              return (
                <MyCoursePreviewQuestion
                  unit={unitChoose}
                  // content={{
                  //   ...listContentsAnswered[currentIndex],
                  //   ...content,
                  // }}
                  content={{
                    ...(savedContent && savedContent.savedData
                      ? JSON.parse(savedContent.savedData)
                      : {}),
                    ...content,
                  }}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndexSession > 0 || currentIndex > 0 ? handleClickBack : undefined
                  }
                  isSpecialContent={unitChoose?.isUploadedFile ? true : false}
                  // shufflePossibleAnswers={true}
                  listTestOptions={{
                    ...initialUnitOptions,
                    shufflePossibleAnswers: true,
                    checkNotContinueUntilCorrectAnswer: true,
                  }}
                />
              );
            } else {
              return (
                <MyCoursePreviewCheckbox
                  unit={unitChoose}
                  // content={{
                  //   ...listContentsAnswered[currentIndex],
                  //   ...content,
                  // }}
                  content={{
                    ...(savedContent && savedContent.savedData
                      ? JSON.parse(savedContent.savedData)
                      : {}),
                    ...content,
                  }}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndexSession > 0 || currentIndex > 0 ? handleClickBack : undefined
                  }
                  isSpecialContent={unitChoose?.isUploadedFile ? true : false}
                  // shufflePossibleAnswers={true}
                  listTestOptions={{
                    ...initialUnitOptions,
                    shufflePossibleAnswers: true,
                    checkNotContinueUntilCorrectAnswer: true,
                  }}
                />
              );
            }
          } else {
            if (unitChoose?.isUploadedFile) {
              return (
                <MyCoursePreviewCheckbox
                  unit={unitChoose}
                  content={undefined}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndexSession > 0 || currentIndex > 0 ? handleClickBack : undefined
                  }
                  isSpecialContent={unitChoose?.isUploadedFile ? true : false}
                  // shufflePossibleAnswers={true}
                  listTestOptions={{
                    ...initialUnitOptions,
                    shufflePossibleAnswers: true,
                    checkNotContinueUntilCorrectAnswer: true,
                  }}
                />
              );
            }
            return (
              <>
                <div className="w-full border-solid border-[#D1CDCB] rounded-2xl h-[60vh]">
                  <div className="text-base text-[#6E6B68] flex flex-col justify-center items-center h-full">
                    <div className="text-center">
                      <div>Class content</div>
                      <div>Video / Quic / Short answers / presentation etc</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center gap-3">
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base text-[#32302D]"
                    onClick={() => history(-1)}
                  >
                    Exit
                  </Button>
                  {(currentIndex > 0 || currentIndexSession > 0) && (
                    <Button
                      className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                      onClick={() => handleClickBack(true)}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                    onClick={() => handleClickContinue(true)}
                  >
                    Continue
                  </Button>
                </div>
              </>
            );
          }
        case UnitType.WEB_CONTENT:
          if (unitChoose.content && unitChoose.content.length > 0) {
            const content = {
              ...unitChoose.content[0],
              isCompleted: savedContent?.isCompleted || false,
              isPassed: savedContent?.isPassed || false,
            };
            if (content.contentType === ContentType.QUESTION) {
              return (
                <MyCoursePreviewQuestion
                  unit={unitChoose}
                  // content={{
                  //   ...listContentsAnswered[currentIndex],
                  //   ...content,
                  // }}
                  content={{
                    ...(savedContent && savedContent.savedData
                      ? JSON.parse(savedContent.savedData)
                      : {}),
                    ...content,
                  }}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndexSession > 0 || currentIndex > 0 ? handleClickBack : undefined
                  }
                  isSpecialContent={true}
                  // shufflePossibleAnswers={true}
                  listTestOptions={{
                    ...initialUnitOptions,
                    shufflePossibleAnswers: true,
                    checkNotContinueUntilCorrectAnswer: true,
                  }}
                />
              );
            } else {
              return (
                <MyCoursePreviewCheckbox
                  unit={unitChoose}
                  // content={{
                  //   ...listContentsAnswered[currentIndex],
                  //   ...content,
                  // }}
                  content={{
                    ...(savedContent && savedContent.savedData
                      ? JSON.parse(savedContent.savedData)
                      : {}),
                    ...content,
                  }}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndexSession > 0 || currentIndex > 0 ? handleClickBack : undefined
                  }
                  isSpecialContent={true}
                  // shufflePossibleAnswers={true}
                  listTestOptions={{
                    ...initialUnitOptions,
                    shufflePossibleAnswers: true,
                    checkNotContinueUntilCorrectAnswer: true,
                  }}
                />
              );
            }
          } else {
            return (
              <>
                <div className="w-full border-solid border-[#D1CDCB] rounded-2xl h-[60vh]">
                  <div className="text-base text-[#6E6B68] flex flex-col justify-center items-center h-full">
                    <div className="text-center">
                      <div>Class content</div>
                      <div>Video / Quic / Short answers / presentation etc</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center gap-3">
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base text-[#32302D]"
                    onClick={() => history(-1)}
                  >
                    Exit
                  </Button>
                  {(currentIndex > 0 || currentIndexSession > 0) && (
                    <Button
                      className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                      onClick={() => handleClickBack(true)}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                    onClick={() => handleClickContinue(true)}
                  >
                    Continue
                  </Button>
                </div>
              </>
            );
          }
        case UnitType.VIDEO:
          if (unitChoose.content && unitChoose.content.length > 0) {
            const content = {
              ...unitChoose.content[0],
              isCompleted: savedContent?.isCompleted || false,
              isPassed: savedContent?.isPassed || false,
            };
            if (content.contentType === ContentType.QUESTION) {
              return (
                <MyCoursePreviewQuestion
                  unit={unitChoose}
                  // content={{
                  //   ...listContentsAnswered[currentIndex],
                  //   ...content,
                  // }}
                  content={{
                    ...(savedContent && savedContent.savedData
                      ? JSON.parse(savedContent.savedData)
                      : {}),
                    ...content,
                  }}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndexSession > 0 || currentIndex > 0 ? handleClickBack : undefined
                  }
                  isSpecialContent={true}
                  // shufflePossibleAnswers={true}
                  listTestOptions={{
                    ...initialUnitOptions,
                    shufflePossibleAnswers: true,
                    checkNotContinueUntilCorrectAnswer: true,
                  }}
                />
              );
            } else {
              return (
                <MyCoursePreviewCheckbox
                  unit={unitChoose}
                  // content={{
                  //   ...listContentsAnswered[currentIndex],
                  //   ...content,
                  // }}
                  content={{
                    ...(savedContent && savedContent.savedData
                      ? JSON.parse(savedContent.savedData)
                      : {}),
                    ...content,
                  }}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndexSession > 0 || currentIndex > 0 ? handleClickBack : undefined
                  }
                  isSpecialContent={true}
                  // shufflePossibleAnswers={true}
                  listTestOptions={{
                    ...initialUnitOptions,
                    shufflePossibleAnswers: true,
                    checkNotContinueUntilCorrectAnswer: true,
                  }}
                />
              );
            }
          } else {
            return (
              <>
                <div className="w-full border-solid border-[#D1CDCB] rounded-2xl h-[60vh]">
                  <div className="text-base text-[#6E6B68] flex flex-col justify-center items-center h-full">
                    <div className="text-center">
                      <div>Class content</div>
                      <div>Video / Quic / Short answers / presentation etc</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center gap-3">
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base text-[#32302D]"
                    onClick={() => history(-1)}
                  >
                    Exit
                  </Button>
                  {(currentIndex > 0 || currentIndexSession > 0) && (
                    <Button
                      className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                      onClick={() => handleClickBack(true)}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                    onClick={() => handleClickContinue(true)}
                  >
                    Continue
                  </Button>
                </div>
              </>
            );
          }
        case UnitType.AUDIO:
          if (unitChoose.content && unitChoose.content.length > 0) {
            const content = {
              ...unitChoose.content[0],
              isCompleted: savedContent?.isCompleted || false,
              isPassed: savedContent?.isPassed || false,
            };
            if (content.contentType === ContentType.QUESTION) {
              return (
                <MyCoursePreviewQuestion
                  unit={unitChoose}
                  // content={{
                  //   ...listContentsAnswered[currentIndex],
                  //   ...content,
                  // }}
                  content={{
                    ...(savedContent && savedContent.savedData
                      ? JSON.parse(savedContent.savedData)
                      : {}),
                    ...content,
                  }}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndexSession > 0 || currentIndex > 0 ? handleClickBack : undefined
                  }
                  isSpecialContent={true}
                  // shufflePossibleAnswers={true}
                  listTestOptions={{
                    ...initialUnitOptions,
                    shufflePossibleAnswers: true,
                    checkNotContinueUntilCorrectAnswer: true,
                  }}
                />
              );
            } else {
              return (
                <MyCoursePreviewCheckbox
                  unit={unitChoose}
                  // content={{
                  //   ...listContentsAnswered[currentIndex],
                  //   ...content,
                  // }}
                  content={{
                    ...(savedContent && savedContent.savedData
                      ? JSON.parse(savedContent.savedData)
                      : {}),
                    ...content,
                  }}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndexSession > 0 || currentIndex > 0 ? handleClickBack : undefined
                  }
                  isSpecialContent={true}
                  // shufflePossibleAnswers={true}
                  listTestOptions={{
                    ...initialUnitOptions,
                    shufflePossibleAnswers: true,
                    checkNotContinueUntilCorrectAnswer: true,
                  }}
                />
              );
            }
          } else {
            return (
              <>
                <div className="w-full border-solid border-[#D1CDCB] rounded-2xl h-[60vh]">
                  <div className="text-base text-[#6E6B68] flex flex-col justify-center items-center h-full">
                    <div className="text-center">
                      <div>Class content</div>
                      <div>Video / Quic / Short answers / presentation etc</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center gap-3">
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base text-[#32302D]"
                    onClick={() => history(-1)}
                  >
                    Exit
                  </Button>
                  {(currentIndex > 0 || currentIndexSession > 0) && (
                    <Button
                      className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                      onClick={() => handleClickBack(true)}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                    onClick={() => handleClickContinue(true)}
                  >
                    Continue
                  </Button>
                </div>
              </>
            );
          }
        case UnitType.DOCUMENT:
          if (unitChoose.content && unitChoose.content.length > 0) {
            const content = {
              ...unitChoose.content[0],
              isCompleted: savedContent?.isCompleted || false,
              isPassed: savedContent?.isPassed || false,
            };
            if (content.contentType === ContentType.QUESTION) {
              return (
                <MyCoursePreviewQuestion
                  unit={unitChoose}
                  // content={{
                  //   ...listContentsAnswered[currentIndex],
                  //   ...content,
                  // }}
                  content={{
                    ...(savedContent && savedContent.savedData
                      ? JSON.parse(savedContent.savedData)
                      : {}),
                    ...content,
                  }}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndexSession > 0 || currentIndex > 0 ? handleClickBack : undefined
                  }
                  isSpecialContent={true}
                  // shufflePossibleAnswers={true}
                  listTestOptions={{
                    ...initialUnitOptions,
                    shufflePossibleAnswers: true,
                    checkNotContinueUntilCorrectAnswer: true,
                  }}
                />
              );
            } else {
              return (
                <MyCoursePreviewCheckbox
                  unit={unitChoose}
                  // content={{
                  //   ...listContentsAnswered[currentIndex],
                  //   ...content,
                  // }}
                  content={{
                    ...(savedContent && savedContent.savedData
                      ? JSON.parse(savedContent.savedData)
                      : {}),
                    ...content,
                  }}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndexSession > 0 || currentIndex > 0 ? handleClickBack : undefined
                  }
                  isSpecialContent={true}
                  // shufflePossibleAnswers={true}
                  listTestOptions={{
                    ...initialUnitOptions,
                    shufflePossibleAnswers: true,
                    checkNotContinueUntilCorrectAnswer: true,
                  }}
                />
              );
            }
          } else {
            return (
              <>
                <div className="w-full border-solid border-[#D1CDCB] rounded-2xl h-[60vh]">
                  <div className="text-base text-[#6E6B68] flex flex-col justify-center items-center h-full">
                    <div className="text-center">
                      <div>Class content</div>
                      <div>Video / Quic / Short answers / presentation etc</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center gap-3">
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base text-[#32302D]"
                    onClick={() => history(-1)}
                  >
                    Exit
                  </Button>
                  {(currentIndex > 0 || currentIndexSession > 0) && (
                    <Button
                      className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                      onClick={() => handleClickBack(true)}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                    onClick={() => handleClickContinue(true)}
                  >
                    Continue
                  </Button>
                </div>
              </>
            );
          }
        case UnitType.ASSIGNMENT:
          if (unitChoose.content && unitChoose.content.length > 0) {
            const content = {
              ...unitChoose.content[0],
              isCompleted: savedContent?.isCompleted || false,
              isPassed: savedContent?.isPassed || false,
            };
            if (content.contentType === ContentType.QUESTION) {
              return (
                <MyCoursePreviewQuestion
                  unit={unitChoose}
                  // content={{
                  //   ...listContentsAnswered[currentIndex],
                  //   ...content,
                  // }}
                  content={{
                    ...(savedContent && savedContent.savedData
                      ? JSON.parse(savedContent.savedData)
                      : {}),
                    ...content,
                  }}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndexSession > 0 || currentIndex > 0 ? handleClickBack : undefined
                  }
                  // shufflePossibleAnswers={true}
                  listTestOptions={{
                    ...initialUnitOptions,
                    shufflePossibleAnswers: true,
                    checkNotContinueUntilCorrectAnswer: true,
                  }}
                />
              );
            } else {
              return (
                <MyCoursePreviewCheckbox
                  // content={{
                  //   ...listContentsAnswered[currentIndex],
                  //   ...content,
                  // }}
                  content={{
                    ...(savedContent && savedContent.savedData
                      ? JSON.parse(savedContent.savedData)
                      : {}),
                    ...content,
                  }}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndexSession > 0 || currentIndex > 0 ? handleClickBack : undefined
                  }
                  // shufflePossibleAnswers={true}
                  listTestOptions={{
                    ...initialUnitOptions,
                    shufflePossibleAnswers: true,
                    checkNotContinueUntilCorrectAnswer: true,
                  }}
                />
              );
            }
          } else {
            return (
              <>
                <div className="w-full border-solid border-[#D1CDCB] rounded-2xl h-[60vh]">
                  <div className="text-base text-[#6E6B68] flex flex-col justify-center items-center h-full">
                    <div className="text-center">
                      <div>Class content</div>
                      <div>Video / Quic / Short answers / presentation etc</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center gap-3">
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base text-[#32302D]"
                    onClick={() => history(-1)}
                  >
                    Exit
                  </Button>
                  {(currentIndex > 0 || currentIndexSession > 0) && (
                    <Button
                      className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                      onClick={() => handleClickBack(true)}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                    onClick={() => handleClickContinue(true)}
                  >
                    Continue
                  </Button>
                </div>
              </>
            );
          }
        case UnitType.TEST:
          const listTestOptions: IUnitOptions =
            unitChoose.unitOptions && unitChoose.unitOptions.length > 0
              ? unitChoose.unitOptions[0]
              : initialUnitOptions;
          // console.log("listTestOptions", listTestOptions, unitChoose.unitContents?.sort((a, b) => {
          //   if (a.order && b.order && a.order > b.order) {
          //     return 1;
          //   }
          //   if (a.order && b.order && a.order < b.order) {
          //     return -1;
          //   }
          //   return 0;
          // }))
          return (
            <>
              <div className="w-full bg-white border-solid border-transparent rounded-2xl min-height-60vh p-8">
                <TestPreview
                  listQuestionsAdded={
                    unitChoose.unitContents
                      ? listTestOptions && listTestOptions.shuffleQuestions
                        ? shuffle(unitChoose.unitContents)
                        : unitChoose.unitContents.sort((a, b) => {
                          if (a.order && b.order && a.order > b.order) {
                            return 1;
                          }
                          if (a.order && b.order && a.order < b.order) {
                            return -1;
                          }
                          return 0;
                        })
                      : []
                  }
                  isPreviewQuestion={false}
                  setIsPreviewQuestion={() => { }}
                  listTestOptions={listTestOptions}
                  isModal={false}
                  handleClickContinueCustom={() => handleClickContinue(true)}
                  selectedUnit={unitChoose}
                  handleSetListUnitsAfterSaveResultTest={handleSetListUnitsAfterSaveResultTest}
                />
              </div>
              <div className="flex justify-end items-center gap-3">
                <Button
                  className="w-[120px] h-[44px] rounded-xl font-semibold text-base text-[#32302D]"
                  onClick={() => history(-1)}
                >
                  Exit
                </Button>
                {(currentIndex > 0 || currentIndexSession > 0) && (
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                    onClick={() => handleClickBack(true)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                  onClick={() => handleClickContinue(true)}
                >
                  Continue
                </Button>
              </div>
            </>
          );
        default:
          return (
            <>
              <div className="w-full border-solid border-[#D1CDCB] rounded-2xl h-[60vh]">
                <div className="text-base text-[#6E6B68] flex flex-col justify-center items-center h-full">
                  <div className="text-center">
                    <div>Class content</div>
                    <div>Video / Quic / Short answers / presentation etc</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-3">
                <Button
                  className="w-[120px] h-[44px] rounded-xl font-semibold text-base text-[#32302D]"
                  onClick={() => history(-1)}
                >
                  Exit
                </Button>
                {(currentIndex > 0 || currentIndexSession > 0) && (
                  <Button
                    className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                    onClick={() => handleClickBack(true)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                  onClick={() => handleClickContinue(true)}
                >
                  Continue
                </Button>
              </div>
            </>
          );
      }
    } else {
      return (
        <>
          <div className="w-full border-solid border-[#D1CDCB] rounded-2xl h-[60vh]">
            <div className="text-base text-[#6E6B68] flex flex-col justify-center items-center h-full">
              <div className="text-center">
                <div>Class content</div>
                <div>Video / Quic / Short answers / presentation etc</div>
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center gap-3">
            <Button
              className="w-[120px] h-[44px] rounded-xl font-semibold text-base text-[#32302D]"
              onClick={() => history(-1)}
            >
              Exit
            </Button>
            {currentIndexSession > 0 && (
              <Button
                className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
                onClick={() => handleClickBack(true)}
              >
                Back
              </Button>
            )}
            <Button
              className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
              onClick={() => handleClickContinue(true)}
            >
              Continue
            </Button>
          </div>
        </>
      );
    }
  }, [unitChoose, listUnits, sessionChoose, listSessions]);

  return (
    <Layout className="bg-transparent flex flex-col gap-y-6 my-course-session">
      <div className="flex justify-between items-center bg-transparent px-0">
        <p className="custom-font-header text-[1.75rem] font-fontFamily leading-9 font-bold mb-0 custom-font-header">
          {/* <span className="text-[#AEA8A5] cursor-pointer" onClick={() => history(ROUTES.my_course)}>
            My Courses
          </span>
          <span className="text-[#AEA8A5] cursor-pointer" onClick={() => history(-2)}>
            {' '}
            / Course Name - Class Name
          </span>
          <span className="text-[#AEA8A5] cursor-pointer" onClick={() => history(-1)}>
            {' '}
            / Module3
          </span>{' '} */}
          <span className="text-[#AEA8A5] cursor-pointer" onClick={() => history(ROUTES.my_course)}>
            My Courses
          </span>

          <span className="text-[#AEA8A5] cursor-pointer" onClick={() => history(-2)}>
            / {dataCourses?.courseName} - {className}
          </span>

          <span className="text-[#AEA8A5] cursor-pointer" onClick={() => history(-2)}>
            / {moduleName}
          </span>
          <Dropdown
            overlay={menu}
            trigger={['click']}
            onVisibleChange={(e) => {
              setIsShowDrop(e);
            }}
          >
            <span className="cursor-pointer">
              {' '}
              /{' '}
              {sessionChoose
                ? listSessions.find((x) => x.id === sessionChoose)?.sessionName
                : '...'}{' '}
              <span className="relative bottom-1">
                {isShowDrop ? (
                  <UpOutlined className="text-[16px] text-[#ED7635]" />
                ) : (
                  <DownOutlined className="text-[16px]" />
                )}
              </span>
            </span>
          </Dropdown>
        </p>
      </div>
      <Loading isLoading={isLoadingSearchSessions || isSearchingUnits}>{renderPreview()}</Loading>
    </Layout>
  );
};

export default MyCourseSession;
