import { Button, Layout } from 'antd';
import { IUserUnit, searchUnits, UnitType } from 'api/content_management';
import ButtonCustom from 'components/Button';
import Loading from 'components/Loading';
import { ROUTES } from 'constants/constants';
import { ContentType, IUnit } from 'pages/admin/content-management/session/add-content-session';
import {
  initialUnitOptions,
  IUnitOptions,
  shuffle,
} from 'pages/admin/content-management/session/add-content-session/CreateUnit/Test/TestConstantsAndInterface';
import TestPreview from 'pages/admin/content-management/session/add-content-session/CreateUnit/Test/TestPreview';
import MyCoursePreviewCheckbox from 'pages/admin/courses/my-course/my-course-detail/my-course-session/content/Checkbox';
import MyCoursePreviewQuestion from 'pages/admin/courses/my-course/my-course-detail/my-course-session/content/Question';
import React, { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

interface IProps {
    topicId?: string;
    sessionId?: string;
    moduleId?: string;
}

const PreviewContentCreationComponent = (props: IProps) => {
  const history = useNavigate();
  const { topicId, sessionId, moduleId } = props;

  const [listUnits, setListUnits] = useState<IUnit[]>([]);
  console.log('listUnits', listUnits)
  const [unitChoose, setUnitChoose] = useState<IUnit>();

  const { mutate: getUnits, isLoading: isSearchingUnits } = useMutation(
    'searchUnits',
    searchUnits,
    {
      onSuccess: ({
        data,
      }: {
        data: { records: IUnit[]; total: number; page: number; limit: number };
      }) => {
        const tempUnits = data.records?.map((x, index) => ({
          ...x,
          userUnits: [],
        })) || [];
        if (tempUnits && tempUnits.length > 0) {
          setListUnits(tempUnits);
          setUnitChoose(tempUnits[0]);
        }
        else {
          setListUnits([]);
          setUnitChoose(undefined);
        }
      },
    },
  );

  const handleExit = () => {
    history(-1);
  };

  const handleClickContinue = useCallback(
    (result: boolean, studentAnswers?: any, correctAnswers?: any, savedAnswers?: any) => {
      if (unitChoose) {
        if (listUnits?.length > 0) {
          const currentIndex = listUnits.findIndex((x) => x.id === unitChoose.id);

          if (unitChoose.unitType !== UnitType.TEST) {
            const tempUserUnit: IUserUnit = {
              isCompleted: true,
              isPassed: true,
            }
            const fakeArr: IUserUnit[] = [];
            fakeArr.push(tempUserUnit);
            const tempListUnits = [...listUnits];
            tempListUnits[currentIndex].userUnits = fakeArr;
            setListUnits(tempListUnits);
          }


          if (currentIndex < listUnits.length - 1) {
            const temp = listUnits[currentIndex + 1];
            setUnitChoose(temp);
          }
          else {
            handleExit()
          }
        }
      }
    },
    [listUnits, unitChoose]
  );

  const handleClickBack = useCallback(
    (result: boolean, studentAnswers?: any, correctAnswers?: any, savedAnswers?: any) => {
      if (unitChoose) {

        if (unitChoose.unitType !== UnitType.TEST) {

        }

        if (listUnits?.length > 0) {
          const currentIndex = listUnits.findIndex((x) => x.id === unitChoose.id);
          if (currentIndex < listUnits.length && currentIndex > 0) {
            const temp = listUnits[currentIndex - 1];
            setUnitChoose(temp);
          }
        }
      }
    },
    [listUnits, unitChoose],
  );

  const handleSaveTestResultTemp = (data: IUserUnit) => {
    if (unitChoose && listUnits?.length > 0 && unitChoose.unitType === UnitType.TEST) {
      const currentIndex = listUnits.findIndex((x) => x.id === unitChoose.id);
      const tempListUnits = [...listUnits];
      const fakeArr: IUserUnit[] = [];
      const fakeExistUserUnit = tempListUnits[currentIndex].userUnits;
      fakeArr.push({
        ...(fakeExistUserUnit && fakeExistUserUnit[0] ? fakeExistUserUnit[0] : undefined),
        ...data,
      });
      tempListUnits[currentIndex].userUnits = fakeArr;
      setListUnits(tempListUnits);
    }
  }

  const renderPreview = useCallback(() => {
    if (unitChoose) {
      const currentIndex = listUnits.findIndex((x) => x.id === unitChoose.id);
      const savedContent: IUserUnit = (
        unitChoose.userUnits
          &&
          unitChoose.userUnits.length > 0
          ?
          unitChoose.userUnits[0]
          :
          null
      );
      switch (unitChoose.unitType) {
        case UnitType.CONTENT:
          if (unitChoose.content && unitChoose.content.length > 0) {
            const content = {
              ...unitChoose.content[0],
              isCompleted: savedContent?.isCompleted || false,
              isPassed: savedContent?.isPassed || false,
            };
            console.log("savedContent", unitChoose, content)
            if (content.contentType === ContentType.QUESTION) {
              return (
                <MyCoursePreviewQuestion
                  unit={unitChoose}
                  content={{
                    ...(savedContent && savedContent.savedData
                      ? JSON.parse(savedContent.savedData)
                      : {}),
                    ...content,
                  }}
                  handleClickContinue={handleClickContinue}
                  handleClickBack={
                    currentIndex > 0 ? handleClickBack : undefined
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
                    currentIndex > 0 ? handleClickBack : undefined
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
                    currentIndex > 0 ? handleClickBack : undefined
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
                    onClick={handleExit}
                  >
                    Exit
                  </Button>
                  {(currentIndex > 0) && (
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
                    currentIndex > 0 ? handleClickBack : undefined
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
                    currentIndex > 0 ? handleClickBack : undefined
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
                    onClick={handleExit}
                  >
                    Exit
                  </Button>
                  {(currentIndex > 0) && (
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
                    currentIndex > 0 ? handleClickBack : undefined
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
                    currentIndex > 0 ? handleClickBack : undefined
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
                    onClick={handleExit}
                  >
                    Exit
                  </Button>
                  {(currentIndex > 0) && (
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
                    currentIndex > 0 ? handleClickBack : undefined
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
                    currentIndex > 0 ? handleClickBack : undefined
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
                    onClick={handleExit}
                  >
                    Exit
                  </Button>
                  {(currentIndex > 0) && (
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
                    currentIndex > 0 ? handleClickBack : undefined
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
                    currentIndex > 0 ? handleClickBack : undefined
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
                    onClick={handleExit}
                  >
                    Exit
                  </Button>
                  {(currentIndex > 0) && (
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
                    currentIndex > 0 ? handleClickBack : undefined
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
                    currentIndex > 0 ? handleClickBack : undefined
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
                    onClick={handleExit}
                  >
                    Exit
                  </Button>
                  {(currentIndex > 0) && (
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
          console.log("listTestOptions choose", listTestOptions)
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
                  handleSetListUnitsAfterSaveResultTest={() => { }}
                  handleSaveTestViewAsStudent={handleSaveTestResultTemp}
                />
              </div>
              <div className="flex justify-end items-center gap-3">
                <Button
                  className="w-[120px] h-[44px] rounded-xl font-semibold text-base text-[#32302D]"
                  onClick={handleExit}
                >
                  Exit
                </Button>
                {(currentIndex > 0) && (
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
                  onClick={handleExit}
                >
                  Exit
                </Button>
                {(currentIndex > 0) && (
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
              onClick={handleExit}
            >
              Exit
            </Button>
          </div>
        </>
      );
    }
  }, [unitChoose, listUnits]);

  useEffect(() => {
    if (sessionId && !sessionId.includes('create-new')) {
      getUnits({
        limit: 9999,
        order: 'ASC',
        sort: 'order',
        filters: JSON.stringify([
          Object.fromEntries(
            Object.entries({
              sessionID: Number(sessionId),
            }).filter(([, v]) => (v as any)?.toString() !== ''),
          ),
        ]),
      });
    }
  }, [sessionId]);

  return (
    <div className='flex flex-col gap-4'>
        <Loading isLoading={false}>{renderPreview()}</Loading>
    </div>
  );
};

export default PreviewContentCreationComponent;
