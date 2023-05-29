import { CheckCircleOutlined, CloseCircleOutlined, CloseSquareOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, notification, Tag } from 'antd';
import {
  getQuestionsNotRandomized,
  getQuestionsTest,
  getQuestionsTestByIds,
  IUserUnit,
  saveUserUnitsStudent,
} from 'api/content_management';
import moment from 'moment';
import MyCoursePreviewCheckbox from 'pages/admin/courses/my-course/my-course-detail/my-course-session/content/Checkbox';
import MyCoursePreviewQuestion from 'pages/admin/courses/my-course/my-course-detail/my-course-session/content/Question';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { IUnitContent } from '.';
import { IContent, QuestionType } from '../..';
import { ContentType } from '../Content';
import { IUnitOptions, shuffle } from './TestConstantsAndInterface';
import './style.css';
import TestImagePath from './assets/images/empty_tests.svg';
import { AppContext } from 'context';
import { RoleName } from 'pages/admin/content-management';
import CountdownTimer from './components/CountdownTimer';
import ReviewAnswers from './components/ReviewAnswers';

interface IProps {
  listQuestionsAdded: IUnitContent[];
  isPreviewQuestion: boolean;
  setIsPreviewQuestion: (value: boolean) => void;
  sessionData?: any;
  unitName?: string;
  listTestOptions: IUnitOptions;
  isModal?: boolean;
  handleClickContinueCustom?: () => void;
  selectedUnit?: any;
  handleSetListUnitsAfterSaveResultTest?: (value: IUserUnit) => void;
  handleSaveTestViewAsStudent?: (data: IUserUnit) => void;
}

const TestPreview = (props: IProps) => {
  const {
    listQuestionsAdded,
    isPreviewQuestion,
    setIsPreviewQuestion,
    sessionData,
    unitName,
    listTestOptions,
    isModal,
    handleClickContinueCustom,
    selectedUnit,
    handleSetListUnitsAfterSaveResultTest,
    handleSaveTestViewAsStudent,
  } = props;

  const [form] = Form.useForm();

  const [stateContext]: any = useContext(AppContext);

  const [contentChoose, setContentChoose] = useState<IContent>();

  const [listContents, setListContents] = useState<IUnitContent[]>([]);

  const [isStart, setIsStart] = useState<boolean>(false);

  const [isFinished, setIsFinished] = useState<boolean>(true);

  const [listContentsAnswered, setListContentsAnswered] = useState<any[]>([]);

  const [totalPoints, setTotalPoints] = useState<number>(0);

  const [score, setScore] = useState<number>(0);
  const [startTime, setStartTime] = useState<any>();
  const [endTime, setEndTime] = useState<any>();
  const [finishedTime, setFinishedTime] = useState<any>();
  const [attempNumber, setAttempNumber] = useState<number>(1);

  const [listUserUnitsAttemped, setListUserUnitsAttemped] = useState<IUserUnit[]>([]);

  const [isPassed, setIsPassed] = useState<boolean>(false);


  const { mutate: mutateCompleteUserUnitsStudent } = useMutation('saveUserUnitsStudent', saveUserUnitsStudent, {
    onSuccess: ({ data }) => {
      if (data && handleSetListUnitsAfterSaveResultTest) {
        handleSetListUnitsAfterSaveResultTest(data);
        const fakeArr: IUserUnit[] = listUserUnitsAttemped;
        const findExist = fakeArr.findIndex((x) => x.userID === stateContext?.user?.id);
        if (findExist >= 0) {
          fakeArr[findExist] = data;
          setListUserUnitsAttemped(fakeArr);
        } else {
          fakeArr.push(data);
          setListUserUnitsAttemped(fakeArr);
        }
        setIsPassed(data.isPassed || false);
        setIsFinished(true);
        setScore(Number(data.score) || 0);
        setFinishedTime(data.finishedTime || moment().toDate());
      }
    },
    onError: () => {

    },
  });

  const { mutate: mutatesaveUserUnitsStudent } = useMutation('saveUserUnitsStudent', saveUserUnitsStudent, {
    onSuccess: ({ data }) => {
      if (data && handleSetListUnitsAfterSaveResultTest) {
        handleSetListUnitsAfterSaveResultTest(data);
        const fakeArr: IUserUnit[] = listUserUnitsAttemped;
        const findExist = fakeArr.findIndex((x) => x.userID === stateContext?.user?.id);
        if (findExist >= 0) {
          fakeArr[findExist] = data;
          setListUserUnitsAttemped(fakeArr);
        } else {
          fakeArr.push(data);
          setListUserUnitsAttemped(fakeArr);
        }
        setIsPassed(data.isPassed || false);
        if (data.isCompleted && data.isPassed && data.score && Number(data.score) === 100) {
          const listContentsCorrect = listContents.map((content) => ({
            ...content,
            result: true,
          }));
          const savedData = {
            listContentsAnswered: listContentsCorrect,
            listContents,
            contentChoose,
          };

          const dataPush = {
            unitID: selectedUnit?.id,
            data: {
              savedData: JSON.stringify(savedData),
            },
          };
          setListContentsAnswered(listContentsCorrect);
          mutateCompleteUserUnitsStudent(dataPush);
        }
      }
    },
  });

  const { mutate: mutateGetAllQuestions } = useMutation('getAllQuestions', getQuestionsTestByIds, {
    onSuccess: ({
      data,
    }: {
      data: { records: any[]; total: number; page: number; limit: number };
    }) => {
      let tempTotalPoints = 0;
      let newOptions = listQuestionsAdded?.map((item, index) => {
        tempTotalPoints += item.points || 1;
        const findOne: IContent = data?.records?.find(
          (x) => x.orginalId && item.contentID && x.orginalId === item.contentID,
        );
        if (findOne) {
          return {
            ...findOne,
            ...item,
            order: index + 1,
          };
        } else {
          return {
            ...item,
            order: index + 1,
          };
        }
      });
      if (listTestOptions && listTestOptions?.shuffleQuestions) {
        newOptions = shuffle(newOptions);
      }
      setListContents(newOptions);
      setContentChoose(newOptions[0] || undefined);
      setTotalPoints(tempTotalPoints);
      setListContentsAnswered(newOptions);
    },
    onError: ({ response }: { response: { data: { message: string } } }) => {
      notification.error({ message: response.data.message });
    },
  });

  const calculateScore = (list: { points: number; result: boolean }[], totalPts: number) => {
    let currentScore = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i].result) {
        currentScore += list[i].points;
      }
    }
    return (currentScore / totalPts) * 100;
  };

  const startTest = (listContentsAnsweredData: any[]) => {
    const savedData = {
      listContentsAnswered: listContentsAnsweredData,
      listContents,
      contentChoose,
      totalPoints,
    };

    const data: IUserUnit = {
      score: 0,
      isPassed: false,
      attempNumber: attempNumber,
      isCompleted: false,
      startTime: moment().toDate(),
      endTime:
        listTestOptions && listTestOptions.duration && listTestOptions.duration > 0
          ? moment().add(listTestOptions?.duration, 'minutes').toDate()
          : moment().toDate(),
      finishedTime: moment().toDate(),
      savedData: JSON.stringify(savedData),
    };
    if (handleSaveTestViewAsStudent) {
      handleSaveTestViewAsStudent(data);
    }
    if (stateContext?.user?.userRole?.roleName === RoleName.STUDENT) {
      // if (true) {
      if (selectedUnit && selectedUnit.id) {
        const dataPush = {
          unitID: selectedUnit?.id,
          data: data,
        };
        mutatesaveUserUnitsStudent(dataPush);
      }
    }
  };

  const handleSaveCurrentResult = (listContentsAnsweredData: any[]) => {
    let totalPts = 0;

    for (let i = 0; i < listContents.length; i++) {
      totalPts += listContents[i].points || 1;
    }

    const tempScore = calculateScore(listContentsAnsweredData, totalPts) || 0;

    const savedData = {
      listContentsAnswered: listContentsAnsweredData,
      listContents,
      contentChoose,
    };

    const data: IUserUnit = {
      // score: tempScore,
      isPassed: undefined,
      // tempScore >= (listTestOptions && listTestOptions.passScore ? listTestOptions.passScore : 0),
      finishedTime: moment().toDate(),
      savedData: JSON.stringify(savedData),
    };
    if (handleSaveTestViewAsStudent) {
      handleSaveTestViewAsStudent(data);
    }
    if (stateContext?.user?.userRole?.roleName === RoleName.STUDENT) {
      // if (true) {
      if (selectedUnit && selectedUnit.id) {
        const dataPush = {
          unitID: selectedUnit?.id,
          data: data,
        };
        mutatesaveUserUnitsStudent(dataPush);
      }
    }
    setScore(tempScore);
  };

  const saveResult = (listContentsAnsweredData: any[]) => {
    let totalPts = 0;

    for (let i = 0; i < listContents.length; i++) {
      totalPts += listContents[i].points || 1;
    }

    const tempScore = calculateScore(listContentsAnsweredData, totalPts) || 0;

    const savedData = {
      listContentsAnswered: listContentsAnsweredData,
      listContents,
      contentChoose,
    };

    const data: IUserUnit = {
      score: tempScore,
      // attempNumber: attempNumber,
      isPassed:
        tempScore >= (listTestOptions && listTestOptions.passScore ? listTestOptions.passScore : 0),
      isCompleted: true,
      // startTime: startTime,
      // endTime: endTime,
      finishedTime: moment().toDate(),
      savedData: JSON.stringify(savedData),
    };
    if (handleSaveTestViewAsStudent) {
      handleSaveTestViewAsStudent(data);
    }
    if (stateContext?.user?.userRole?.roleName === RoleName.STUDENT) {
      // if (true) {
      if (selectedUnit && selectedUnit.id) {
        const dataPush = {
          unitID: selectedUnit?.id,
          data: data,
        };
        mutatesaveUserUnitsStudent(dataPush);
      }
    }
    setScore(tempScore);
    setIsFinished(true);
    setIsPassed(tempScore >= (listTestOptions && listTestOptions.passScore ? listTestOptions.passScore : 0));
    setFinishedTime(moment().toDate());
  };

  const countAverageScore = (list: IUserUnit[]) => {
    if (list.length > 0) {
      let total = 0;
      for (let i = 0; i < list.length; i++) {
        total += Number(list[i].score) || 0;
      }
      if (total === 0) {
        return '0.00';
      } else {
        return (total / list.length).toFixed(2);
      }
    } else {
      return '0.00';
    }
  };

  function getNumberWithOrdinal(n: number) {
    const s = ['th', 'st', 'nd', 'rd'],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  const handleClickContinue = useCallback(
    (
      result: boolean,
      studentAnswers?: any,
      correctAnswers?: any,
      savedAnswers?: any,
      isSubmitedAnswer?: boolean,
    ) => {
      if (contentChoose && listContents?.length > 0) {
        const currentIndex = listContents.findIndex((x) => x.id === contentChoose.id);

        const tempListContentsAnswered = [...listContentsAnswered];

        tempListContentsAnswered[currentIndex] = {
          ...tempListContentsAnswered[currentIndex],
          ...contentChoose,
          result: result,
          studentAnswers: studentAnswers,
          correctAnswers: correctAnswers,
          savedAnswers: savedAnswers,
          isSubmitedAnswer: isSubmitedAnswer || false,
        };

        setListContentsAnswered(tempListContentsAnswered);

        if (currentIndex < listContents.length - 1) {
          const temp = listContents[currentIndex + 1];
          handleSaveCurrentResult(tempListContentsAnswered);
          setContentChoose(temp);
        } else {
          // notification.success({ message: "This is last!" })
          // if (handleClickContinueCustom) {
          //     handleClickContinueCustom();
          // }
          // setIsPreviewQuestion(false);
          saveResult(tempListContentsAnswered);
        }
      } else {
        notification.error({ message: 'Error!' });
      }
    },
    [listContents, contentChoose, listContentsAnswered],
  );

  const handleClickBack = useCallback(
    (result: boolean, studentAnswers?: any, correctAnswers?: any, savedAnswers?: any) => {
      if (contentChoose && listContents?.length > 0) {
        const currentIndex = listContents.findIndex((x) => x.id === contentChoose.id);

        const tempListContentsAnswered = [...listContentsAnswered];

        tempListContentsAnswered[currentIndex] = {
          ...tempListContentsAnswered[currentIndex],
          ...contentChoose,
          result: result,
          studentAnswers: studentAnswers,
          correctAnswers: correctAnswers,
          savedAnswers: savedAnswers,
        };

        setListContentsAnswered(tempListContentsAnswered);

        if (currentIndex < listContents.length && currentIndex > 0) {
          const temp = listContents[currentIndex - 1];
          setContentChoose(temp);
          handleSaveCurrentResult(tempListContentsAnswered);
        } else {
          notification.success({ message: 'This is first!' });
        }
      } else {
        notification.error({ message: 'Error!' });
      }
    },
    [listContents, contentChoose],
  );

  const handleClickLastSubmitAnswer = useCallback(
    (
      result: boolean,
      studentAnswers?: any,
      correctAnswers?: any,
      savedAnswers?: any,
      isSubmitedAnswer?: boolean,
    ) => {
      if (contentChoose && listContents?.length > 0) {
        const currentIndex = listContents.findIndex((x) => x.id === contentChoose.id);

        const tempListContentsAnswered = [...listContentsAnswered];

        tempListContentsAnswered[currentIndex] = {
          ...tempListContentsAnswered[currentIndex],
          ...contentChoose,
          result: result,
          studentAnswers: studentAnswers,
          correctAnswers: correctAnswers,
          savedAnswers: savedAnswers,
          isSubmitedAnswer: isSubmitedAnswer || false,
        };

        setListContentsAnswered(tempListContentsAnswered);
        handleSaveCurrentResult(tempListContentsAnswered);

        // if (currentIndex < listContents.length - 1) {
        //     const temp = listContents[currentIndex + 1];
        //     // handleSaveCurrentResult(tempListContentsAnswered);
        //     setContentChoose(temp);
        //     return true;
        // }
        // else {
        const listUnsubmitedAnswers: any[] = [];
        tempListContentsAnswered.map((x, index) => {
          if (!x.isSubmitedAnswer) {
            listUnsubmitedAnswers.push({
              ...x,
              index: index + 1,
            });
          }
        });
        if (listUnsubmitedAnswers.length > 0) {
          notification.error({
            message: `You have not completed question: ${listUnsubmitedAnswers.map(
              (x) => `${x.index}`,
            )}`,
          });
        } else {
          saveResult(tempListContentsAnswered);
        }
        // }
      } else {
        notification.error({ message: 'Error!' });
      }
    },
    [listContents, contentChoose, listContentsAnswered],
  );

  const renderPreview = useCallback(() => {
    if (contentChoose) {
      const currentIndex = listContents.findIndex((x) => x.id === contentChoose.id);
      switch (contentChoose.contentType) {
        case ContentType.QUESTION:
          return (
            <MyCoursePreviewQuestion
              content={{
                ...listContentsAnswered[currentIndex],
                ...contentChoose,
              }}
              handleClickContinue={handleClickContinue}
              handleClickBack={
                listTestOptions && listTestOptions.allowMovementQuestions
                  ? currentIndex
                    ? handleClickBack
                    : undefined
                  : undefined
              }
              // shufflePossibleAnswers={listTestOptions.shufflePossibleAnswers}
              listTestOptions={listTestOptions}
              pagination={{
                currentIndex: currentIndex + 1,
                totalIndex: listContents.length,
              }}
              isTest={true}
              handleClickLastSubmitAnswer={
                currentIndex && currentIndex === listContents.length - 1
                  ? handleClickLastSubmitAnswer
                  : undefined
              }
            />
          );
        case ContentType.QUESTION || ContentType.PERIOD:
          return (
            <MyCoursePreviewCheckbox
              content={{
                ...listContentsAnswered[currentIndex],
                ...contentChoose,
              }}
              handleClickContinue={handleClickContinue}
              handleClickBack={
                listTestOptions && listTestOptions.allowMovementQuestions
                  ? currentIndex
                    ? handleClickBack
                    : undefined
                  : undefined
              }
              // shufflePossibleAnswers={listTestOptions.shufflePossibleAnswers}
              listTestOptions={listTestOptions}
              pagination={{
                currentIndex: currentIndex + 1,
                totalIndex: listContents.length,
              }}
              isTest={true}
              handleClickLastSubmitAnswer={
                currentIndex && currentIndex === listContents.length - 1
                  ? handleClickLastSubmitAnswer
                  : undefined
              }
            />
          );
      }
    }
    return;
  }, [contentChoose, listContents, listTestOptions, listContentsAnswered]);

  const renderResult = () => (
    <>
      <div className="w-full bg-white border-solid border-transparent rounded-2xl min-height-60vh course-preview-container relative flex flex-col">
        <div className="preview-checkbox flex flex-col justify-center items-center w-full m-auto text-xl">
          {listTestOptions && listTestOptions.showTestScoreAndIfPass ? (
            // score >= (listTestOptions.passScore || 0) ? (
            isPassed ? (
              <CheckCircleOutlined className="test-preview__success-icon mb-3" />
            ) : (
              <CloseSquareOutlined className="test-preview__failed-icon mb-3" />
            )
          ) : (
            ''
          )}
          <span className="sm:text-center">
            You completed this test on{' '}
            {finishedTime
              ? moment(finishedTime).format('YYYY/MM/DD hh:mm A')
              : moment().format('YYYY/MM/DD hh:mm A')}
            {stateContext?.user?.userRole?.roleName === RoleName.STUDENT &&
              listTestOptions &&
              listTestOptions.showStatsAfterCompletion && (
                <div>
                  Out of {listUserUnitsAttemped.length} people that took the test, you rank{' '}
                  {getNumberWithOrdinal(
                    listUserUnitsAttemped
                      .sort((a, b) => {
                        return (a.score || 0) - (b.score || 0);
                      })
                      .findIndex((x) => x.userID === stateContext?.user?.id) + 1 || 1,
                  )}
                </div>
              )}
          </span>

          {listTestOptions && listTestOptions.showTestScoreAndIfPass && (
            <>
              <div className="text-center">
                Your score is {score.toFixed(2)}%
                {stateContext?.user?.userRole?.roleName === RoleName.STUDENT &&
                  listTestOptions &&
                  listTestOptions.showStatsAfterCompletion && (
                    <>
                      , while the average test score is {countAverageScore(listUserUnitsAttemped)}%
                    </>
                  )}
              </div>
              {/* {score >= (listTestOptions.passScore || 0) && listTestOptions.messageIfPass ? ( */}
              {isPassed ? (
                <div className="tl-test-status-message text-left w-full">
                  {listTestOptions.messageIfPass}
                </div>
              ) : score < (listTestOptions.passScore || 0) && listTestOptions.messageIfNotPass ? (
                <div className="tl-test-status-message test-not-passed text-left w-full">
                  {listTestOptions.messageIfNotPass}
                </div>
              ) : (
                ''
              )}
            </>
          )}
          {listTestOptions &&
            (listTestOptions.showCorrectAnswers || listTestOptions.showGivenAnswers) && (
              <ReviewAnswers
                listContentsAnswered={listContentsAnswered}
                listTestOptions={listTestOptions}
              />
            )}
        </div>
      </div>
      <div className="flex justify-end items-center gap-3">
        {
          // stateContext?.user?.userRole?.roleName !== RoleName.STUDENT
          // ||
          // (
          //   stateContext?.user?.userRole?.roleName === RoleName.STUDENT &&
          (
            listTestOptions &&
            listTestOptions.allowRepeatTest &&
            (!listTestOptions.maximumAttemps ||
              (listTestOptions.maximumAttemps &&
                attempNumber < (listTestOptions.numberOfMaximumAttemps || 1)))
          )
          && (
            <Button
              className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
              onClick={() => {
                setIsStart(false);
                setIsFinished(false);
                setListContentsAnswered([]);
                setAttempNumber((prev) => prev + 1);
                form.setFieldValue('password', undefined);
                const fakeArrIds: number[] = [];
                listQuestionsAdded.map((x) => {
                  fakeArrIds.push(x.contentID);
                });
                mutateGetAllQuestions({
                  // limit: 999,
                  Ids: JSON.stringify(fakeArrIds),
                });
              }}
            >
              Reset test
            </Button>
          )
        }
        <Button
          className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
          onClick={() => {
            setIsStart(false);
            setIsFinished(false);
            setIsPreviewQuestion(false);

            if (handleClickContinueCustom) {
              handleClickContinueCustom();
            }
          }}
        >
          Finished
        </Button>
      </div>
      {
        // stateContext?.user?.userRole?.roleName === RoleName.STUDENT &&
        listTestOptions &&
          listTestOptions.allowRepeatTest &&
          (!listTestOptions.maximumAttemps ||
            (listTestOptions.maximumAttemps &&
              listTestOptions.numberOfMaximumAttemps &&
              attempNumber < listTestOptions.numberOfMaximumAttemps)) ? (
          <div className="flex text-base justify-center items-center mt-6">
            You can retry this test{' '}
            {listTestOptions.maximumAttemps &&
              listTestOptions.numberOfMaximumAttemps &&
              attempNumber < listTestOptions.numberOfMaximumAttemps
              ? `up to ${listTestOptions.numberOfMaximumAttemps - attempNumber} more times`
              : ''}
          </div>
        ) : (
          ''
        )}
    </>
  );

  const renderStartView = () => (
    <>
      <div className="w-full bg-white border-solid border-transparent rounded-2xl min-height-60vh p-8 course-preview-container relative flex flex-col justify-center items-center">
        <div className="mb-2 text-center">
          <img className="tl-test-survey-header-img" src={TestImagePath} />
        </div>
        {listTestOptions?.description && listTestOptions?.description.trim() !== '' && (
          <>
            <div className="text-xl break-words">{listTestOptions?.description.trim()}</div>

            <hr className="w-full" />
          </>
        )}
        <div className="preview-checkbox flex flex-col justify-center items-center text-xl font-bold sm:text-center">
          The test contains {listQuestionsAdded?.length || 0} questions
        </div>

        {listTestOptions && listTestOptions.duration && listTestOptions.duration > 0 ? (
          <div className="preview-checkbox flex flex-col justify-center items-center text-xl font-bold sm:text-center">
            You have {listTestOptions.duration}{' '}
            {listTestOptions.duration === 1 ? 'minute' : 'minutes'} to complete it
          </div>
        ) : (
          ''
        )}

        {listTestOptions && listTestOptions.requirePasswordToStart && (
          <div className="text-xl">
            <p className="text-center mt-6">
              This test is password protected. Please enter the password below to continue.
            </p>
            <Form form={form}>
              <Form.Item name={'password'} className="w-[232px] m-auto">
                <Input
                  type="password"
                  onPressEnter={(e) => {
                    const passwordInputValue = e.target.value;
                    if (listTestOptions.password === passwordInputValue) {
                      setIsStart(true);
                      setIsFinished(false);
                      setStartTime(moment().toDate());
                      setEndTime(
                        listTestOptions && listTestOptions.duration && listTestOptions.duration > 0
                          ? moment().add(listTestOptions?.duration, 'minutes').toDate()
                          : undefined,
                      );
                      startTest(listContentsAnswered);
                    } else {
                      form.setFields([
                        {
                          name: 'password',
                          errors: ['Wrong password, please try again'],
                        },
                      ]);
                    }
                  }}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </div>
      <div className="flex justify-end items-center gap-3">
        <Button
          className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
          onClick={() => {
            if (listTestOptions && listTestOptions.requirePasswordToStart) {
              const passwordInputValue = form.getFieldValue('password');
              if (listTestOptions.password === passwordInputValue) {
                setIsStart(true);
                setIsFinished(false);
                setStartTime(moment().toDate());
                setEndTime(
                  listTestOptions && listTestOptions.duration && listTestOptions.duration > 0
                    ? moment().add(listTestOptions?.duration, 'minutes').toDate()
                    : undefined,
                );
                startTest(listContentsAnswered);
              } else {
                form.setFields([
                  {
                    name: 'password',
                    errors: ['Wrong password, please try again'],
                  },
                ]);
              }
            } else {
              setIsStart(true);
              setIsFinished(false);
              setStartTime(moment().toDate());
              setEndTime(
                listTestOptions && listTestOptions.duration && listTestOptions.duration > 0
                  ? moment().add(listTestOptions?.duration, 'minutes').toDate()
                  : undefined,
              );
              startTest(listContentsAnswered);
            }
          }}
        >
          Start
        </Button>
      </div>
    </>
  );

  useEffect(() => {
    const resultUserUnits: IUserUnit[] =
      selectedUnit && selectedUnit.userUnits && selectedUnit.userUnits.length > 0
        ? selectedUnit.userUnits
        : [];
    if (
      (
        stateContext?.user?.userRole?.roleName === RoleName.STUDENT &&
        stateContext?.user?.id &&
        resultUserUnits &&
        resultUserUnits.findIndex((x) => x.userID === stateContext?.user?.id) >= 0
      )
      ||
      (
        stateContext?.user?.userRole?.roleName !== RoleName.STUDENT
        && resultUserUnits.length > 0
        && handleSaveTestViewAsStudent
      )
    ) {
      setListUserUnitsAttemped(resultUserUnits);
      const index = (
        stateContext?.user?.userRole?.roleName !== RoleName.STUDENT
          && resultUserUnits.length > 0
          && handleSaveTestViewAsStudent
          ?
          0
          :
          resultUserUnits.findIndex((x) => x.userID === stateContext?.user?.id)
      );
      const resultUserUnit: IUserUnit = resultUserUnits[index];
      if (resultUserUnit.savedData) {
        const parsedSavedData = JSON.parse(resultUserUnit.savedData);
        if (parsedSavedData.listContentsAnswered) {
          const tempListContentAnswered = [...parsedSavedData.listContentsAnswered];
          setListContentsAnswered(tempListContentAnswered);
        }
        if (parsedSavedData.listContents) {
          const tempListContents = [...parsedSavedData.listContents];
          setListContents(tempListContents);
        }
        if (parsedSavedData.contentChoose) {
          const tempContentChoose = { ...parsedSavedData.contentChoose };
          setContentChoose(tempContentChoose);
        }
      }
      setAttempNumber(resultUserUnit.attempNumber || 1);
      setIsStart(true);
      setIsFinished(resultUserUnit.isCompleted || false);
      setStartTime(resultUserUnit.startTime || undefined);
      setEndTime(resultUserUnit.endTime || undefined);
      setScore(Number(resultUserUnit.score) || 0);
      setFinishedTime(resultUserUnit.finishedTime || undefined);
      setIsPassed(resultUserUnit.isPassed || false);
    } else if (listQuestionsAdded?.length > 0) {
      const fakeArrIds: number[] = [];
      listQuestionsAdded.map((x) => {
        fakeArrIds.push(x.contentID);
      });
      mutateGetAllQuestions({
        // limit: 999,
        Ids: JSON.stringify(fakeArrIds),
      });
    } else {
      setListContents([]);
    }
    return () => {
      setContentChoose(undefined);
      setListContents([]);
      setIsStart(false);
      setIsFinished(false);
      setListContentsAnswered([]);
      setTotalPoints(0);
      setScore(0);
      setStartTime(undefined);
      setEndTime(undefined);
      setFinishedTime(undefined);
      setAttempNumber(0);
      setListUserUnitsAttemped([]);
      setIsPassed(false);
    }
  }, [listQuestionsAdded, stateContext?.user?.userRole?.roleName, selectedUnit?.id]);

  return (
    <>
      {isModal ? (
        <Modal
          centered
          className="content-management__custom-modal drag-drop-preview-modal"
          // title={'Preview question'}
          title={
            sessionData || unitName
              ? `${sessionData?.sessionName}${unitName ? ` - ${unitName}` : ''}`
              : 'Preview questions'
          }
          footer={null}
          visible={isPreviewQuestion}
          onCancel={() => setIsPreviewQuestion(false)}
        >
          {!isStart ? (
            renderStartView()
          ) : !isFinished ? (
            <div className="">
              {renderPreview()}
              {listTestOptions && listTestOptions.duration && listTestOptions.duration > 0 ? (
                <CountdownTimer
                  endTime={endTime}
                  isStart={isStart}
                  isFinished={isFinished}
                  handleTimeOut={() => saveResult(listContentsAnswered)}
                />
              ) : (
                ''
              )}
            </div>
          ) : (
            renderResult()
          )}
        </Modal>
      ) : (
        <>
          {!isStart ? (
            renderStartView()
          ) : !isFinished ? (
            <div className="">
              {renderPreview()}
              {listTestOptions && listTestOptions.duration && listTestOptions.duration > 0 ? (
                <CountdownTimer
                  endTime={endTime}
                  isStart={isStart}
                  isFinished={isFinished}
                  handleTimeOut={() => saveResult(listContentsAnswered)}
                />
              ) : (
                ''
              )}
            </div>
          ) : (
            renderResult()
          )}
        </>
      )}
    </>
  );
};

export default TestPreview;
