import { Button, notification } from 'antd';
import { getFileUrlNotExpire, UnitType } from 'api/content_management';
import { IUnit, QuestionType } from 'pages/admin/content-management/session/add-content-session';
import { IUnitOptions } from 'pages/admin/content-management/session/add-content-session/CreateUnit/Test/TestConstantsAndInterface';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import MyCourseDragAndDropPreview from './DragAndDrop';
import MyCourseFillTheGapPreview from './FillTheGap';
import MyCourseFreeTextPreview from './FreeText';
import MyCourseMultipleChoicePreview from './MultipleChoice';
import MyCourseOrderingPreview from './Ordering';
import MyCourseRandomizedPreview from './Randomized';

interface IProps {
  content: any;
  unit?: IUnit;
  handleClickContinue: (
    value: boolean,
    studentAnswers?: any,
    correctAnswers?: any,
    savedAnswers?: any,
    isSubmitedAnswer?: boolean,
  ) => void;
  handleClickBack?: (
    value: boolean,
    studentAnswers?: any,
    correctAnswers?: any,
    savedAnswers?: any,
  ) => void;
  isSpecialContent?: boolean;
  // shufflePossibleAnswers?: boolean;
  listTestOptions?: IUnitOptions;
  pagination?: {
    currentIndex: number;
    totalIndex: number;
  };
  isTest?: boolean;
  handleClickLastSubmitAnswer?: (
    value: boolean,
    studentAnswers?: any,
    correctAnswers?: any,
    savedAnswers?: any,
    isSubmitedAnswer?: boolean,
  ) => void;
}

const MyCoursePreviewQuestion = (props: IProps) => {
  const {
    content,
    unit,
    handleClickContinue,
    handleClickBack,
    isSpecialContent,
    // shufflePossibleAnswers,
    listTestOptions,
    pagination,
    isTest,
    handleClickLastSubmitAnswer,
  } = props;

  const history = useNavigate();

  const [isUploadedFile, setIsUploadedFile] = useState<boolean>(false);
  const [urlContent, setUrlContent] = useState<string>('');

    const { mutate: mutateGetFileUrl } = useMutation('getFileUrl', getFileUrlNotExpire, {
        onSuccess: ({ data }: { data: { fileUrl: string } }) => {
            console.log("data filepath", data)
            if (unit?.unitType === UnitType.VIDEO) {
                setUrlContent(`<video playsinline style='width: 100%' height="500" controls src='${data?.fileUrl || ''}'>Your browser does not support this video.</video>`)
            }
            else if (unit?.unitType === UnitType.AUDIO) {
                setUrlContent(`<audio style='width: 100%' controls src='${data?.fileUrl || ''}'>Your browser does not support this audio.</audio>`)
            }
            else if (unit?.unitType === UnitType.DOCUMENT) {
                const url = data.fileUrl?.split('?')[0] || '';
                if (url.includes('.pdf')) {
                    setUrlContent(`<iframe style='width: 100%' src='${data.fileUrl?.split('?')[0] || ''}' height='623px'></iframe>`)
                }
                else {
                    setUrlContent(`<iframe style='width: 100%' src='https://view.officeapps.live.com/op/embed.aspx?src=${data.fileUrl?.split('?')[0] || ''}' height='623px'></iframe>`)
                }
            }
        },
        onError: ({ response }: { response: { data: { message: string } } }) => {
            notification.error({ message: response.data.message });
        },
    });

  useEffect(() => {
    if (
      isSpecialContent &&
      unit &&
      [UnitType.VIDEO, UnitType.ASSIGNMENT, UnitType.DOCUMENT, UnitType.AUDIO].includes(
        unit.unitType,
      )
    ) {
      if (unit.isUploadedFile && unit.filePath) {
        setIsUploadedFile(true);
        mutateGetFileUrl(unit.filePath);
      } else {
        setIsUploadedFile(false);
        setUrlContent('');
      }
    }
    return () => {
      setIsUploadedFile(false);
      setUrlContent('');
    };
  }, [unit]);

  switch (content?.questionType) {
    case QuestionType.MULTIPLE_CHOICE:
      return (
        <MyCourseMultipleChoicePreview
          content={content}
          unit={unit}
          handleClickContinue={handleClickContinue}
          handleClickBack={handleClickBack}
          isSpecialContent={isSpecialContent}
          isUploadedFile={isUploadedFile}
          urlContent={urlContent}
          // // shufflePossibleAnswers={shufflePossibleAnswers}
          listTestOptions={listTestOptions}
          pagination={pagination}
          isTest={isTest}
          handleClickLastSubmitAnswer={handleClickLastSubmitAnswer}
        />
      );
    case QuestionType.FILL_THE_GAP:
      return (
        <MyCourseFillTheGapPreview
          content={content}
          unit={unit}
          handleClickContinue={handleClickContinue}
          handleClickBack={handleClickBack}
          isSpecialContent={isSpecialContent}
          isUploadedFile={isUploadedFile}
          urlContent={urlContent}
          // // shufflePossibleAnswers={shufflePossibleAnswers}
          listTestOptions={listTestOptions}
          pagination={pagination}
          isTest={isTest}
          handleClickLastSubmitAnswer={handleClickLastSubmitAnswer}
        />
      );
    case QuestionType.ORDERING:
      return (
        <MyCourseOrderingPreview
          content={content}
          unit={unit}
          handleClickContinue={handleClickContinue}
          handleClickBack={handleClickBack}
          isSpecialContent={isSpecialContent}
          isUploadedFile={isUploadedFile}
          urlContent={urlContent}
          // // shufflePossibleAnswers={shufflePossibleAnswers}
          listTestOptions={listTestOptions}
          pagination={pagination}
          isTest={isTest}
          handleClickLastSubmitAnswer={handleClickLastSubmitAnswer}
        />
      );
    case QuestionType.DRAG_DROP:
      return (
        <MyCourseDragAndDropPreview
          content={content}
          unit={unit}
          handleClickContinue={handleClickContinue}
          handleClickBack={handleClickBack}
          isSpecialContent={isSpecialContent}
          isUploadedFile={isUploadedFile}
          urlContent={urlContent}
          // // shufflePossibleAnswers={shufflePossibleAnswers}
          listTestOptions={listTestOptions}
          pagination={pagination}
          isTest={isTest}
          handleClickLastSubmitAnswer={handleClickLastSubmitAnswer}
        />
      );
    case QuestionType.FREE_TEXT:
      return (
        <MyCourseFreeTextPreview
          content={content}
          unit={unit}
          handleClickContinue={handleClickContinue}
          handleClickBack={handleClickBack}
          isSpecialContent={isSpecialContent}
          isUploadedFile={isUploadedFile}
          urlContent={urlContent}
          // // shufflePossibleAnswers={shufflePossibleAnswers}
          listTestOptions={listTestOptions}
          pagination={pagination}
          isTest={isTest}
          handleClickLastSubmitAnswer={handleClickLastSubmitAnswer}
        />
      );
    case QuestionType.RANDOMIZED:
      return (
        <MyCourseRandomizedPreview
          content={content}
          unit={unit}
          handleClickContinue={handleClickContinue}
          handleClickBack={handleClickBack}
          isSpecialContent={isSpecialContent}
          isUploadedFile={isUploadedFile}
          urlContent={urlContent}
          // // shufflePossibleAnswers={shufflePossibleAnswers}
          listTestOptions={listTestOptions}
          pagination={pagination}
          isTest={isTest}
          handleClickLastSubmitAnswer={handleClickLastSubmitAnswer}
        />
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
          <div className="flex justify-end items-center gap-3 flex-auto">
            <Button
              className="w-[120px] h-[44px] rounded-xl font-semibold text-base custom-width text-[#32302D]"
              onClick={() => history(-1)}
            >
              Exit
            </Button>
            {handleClickBack && (
              <Button
                className="w-[120px] h-[44px] rounded-xl font-semibold text-base custom-width bg-[#ED7635] text-[#FFFFFF]"
                onClick={() => handleClickBack(true)}
              >
                Back
              </Button>
            )}
            <Button
              className="w-[120px] h-[44px] rounded-xl font-semibold text-base custom-width bg-[#ED7635] text-[#FFFFFF]"
              onClick={() => handleClickContinue(true)}
            >
              Continue
            </Button>
          </div>
        </>
      );
  }
};

export default MyCoursePreviewQuestion;
