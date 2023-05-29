import { Button, Checkbox, Modal } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import ButtonCustom from 'components/Button';
import {
  IContent,
  IUnit,
  UnitType,
} from 'pages/admin/content-management/session/add-content-session';
import { IUnitOptions } from 'pages/admin/content-management/session/add-content-session/CreateUnit/Test/TestConstantsAndInterface';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

interface IProps {
  content: IContent;
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
  isUploadedFile?: boolean;
  urlContent?: string;
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

const MyCourseFreeTextPreview = (props: IProps) => {
  const {
    content,
    unit,
    handleClickContinue,
    handleClickBack,
    isSpecialContent,
    isUploadedFile,
    urlContent,
    // shufflePossibleAnswers,
    listTestOptions,
    pagination,
    isTest,
    handleClickLastSubmitAnswer,
  } = props;

  const history = useNavigate();

  const [isWrongAnswer, setIsWrongAnswer] = useState<boolean>(false);
  const [isDisabledPreviewSubmitButton, setIsDisabledPreviewSubmitButton] =
    useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');

  const handleCheckPreviewQuestion = useCallback(
    (isBack?: boolean) => {
      let total = 0;
      const targetPoint = content?.freeTextPoint || 0;
      const answeredText = ' ' + resultText.replace(/[\r\n]+/gm, ' ') + ' ';

      if (content?.answers) {
        const listAnswers = content.answers;
        for (let i = 0; i < listAnswers.length; i++) {
          if ((listAnswers[i].answerTitle || listAnswers[i].answerValue) && listAnswers[i].point) {
            if (
              listAnswers[i].isContain &&
              answeredText
                ?.toLowerCase()
                .includes(
                  ' ' +
                    (listAnswers[i].answerTitle?.toLowerCase() ||
                      listAnswers[i].answerValue?.toLowerCase()) +
                    ' ',
                )
            ) {
              const point = Number(listAnswers[i].point);
              total = total + point;
            }
            if (
              !listAnswers[i].isContain &&
              !answeredText
                ?.toLowerCase()
                .includes(
                  ' ' +
                    (listAnswers[i].answerTitle?.toLowerCase() ||
                      listAnswers[i].answerValue?.toLowerCase()) +
                    ' ',
                )
            ) {
              const point = Number(listAnswers[i].point);
              total = total + point;
            }
          }
        }

        if (listTestOptions?.checkNotContinueUntilCorrectAnswer && !isBack) {
          if (total < targetPoint) {
            setIsWrongAnswer(true);
            setIsDisabledPreviewSubmitButton(true);
            return false;
          } else {
            setIsWrongAnswer(false);
            setResultText('');
            return true;
          }
        } else {
          if (total < targetPoint) {
            return false;
          } else {
            return true;
          }
        }
      } else {
        return false;
      }
    },
    [content, resultText, listTestOptions],
  );

  useEffect(() => {
    if (content?.savedAnswers) {
      setResultText(content.savedAnswers.resultText || '');
      setIsDisabledPreviewSubmitButton(false);
      setIsWrongAnswer(content?.savedAnswers.isWrongAnswer || false);
      setIsDisabledPreviewSubmitButton(
        content.savedAnswers.isDisabledPreviewSubmitButton === true ||
          content.savedAnswers.isDisabledPreviewSubmitButton === false
          ? content.savedAnswers.isDisabledPreviewSubmitButton
          : true,
      );
    }
    return () => {
      setResultText('');
      setIsWrongAnswer(false);
      setIsDisabledPreviewSubmitButton(false);
    };
  }, [content, listTestOptions, unit]);

  const onClickBack = () => {
    if (handleClickBack) {
      const result = handleCheckPreviewQuestion(true);
      const answeredAnswers = renderToString(
        <div>
          <TextArea
            onChange={(e) => {
              setResultText(e.target.value);
              setIsDisabledPreviewSubmitButton(false);
            }}
            value={resultText}
            disabled
            className="mb-2"
          />
        </div>,
      );
      const correctAnswers = renderToString(
        <div className="">
          <table>
            <tr className="text-base">
              <td width={200}>Accumulated points:</td>
              <td width={50}></td>
              <td>{content?.freeTextPoint || 0} points</td>
            </tr>
            {content.answers &&
              content.answers.length > 0 &&
              content.answers.map((x, index) => (
                <tr className="text-base" key={index}>
                  <td>{x.isContain ? 'Contains: ' : 'Not contains: '}</td>
                  <td>{x.answerTitle || x.answerValue}</td>
                  <td>{x.point || 0} points</td>
                </tr>
              ))}
          </table>
        </div>,
      );
      const savedAnswers = {
        resultText,
        // isWrongAnswer: listTestOptions?.checkNotContinueUntilCorrectAnswer ? (result ? false : true) : false,
        isWrongAnswer: isWrongAnswer || false,
        isDisabledPreviewSubmitButton,
      };
      handleClickBack(result, answeredAnswers, correctAnswers, savedAnswers);
    }
  };

  const onClickContinue = (isSubmitedAnswer?: boolean) => {
    const result = handleCheckPreviewQuestion();
    // if (result) {
    //     handleClickContinue()
    // }
    const answeredAnswers = renderToString(
      <TextArea
        onChange={(e) => {
          setResultText(e.target.value);
          setIsDisabledPreviewSubmitButton(false);
        }}
        value={resultText}
        disabled
        className="mb-2"
      />,
    );
    const correctAnswers = renderToString(
      <div className="">
        <table>
          <tr className="text-base">
            <td width={200}>Accumulated points:</td>
            <td width={50}></td>
            <td>{content?.freeTextPoint || 0} points</td>
          </tr>
          {content.answers &&
            content.answers.length > 0 &&
            content.answers.map((x, index) => (
              <tr className="text-base" key={index}>
                <td>{x.isContain ? 'Contains: ' : 'Not contains: '}</td>
                <td>{x.answerTitle || x.answerValue}</td>
                <td>{x.point || 0} points</td>
              </tr>
            ))}
        </table>
      </div>,
    );
    const savedAnswers = {
      resultText,
      isWrongAnswer: listTestOptions?.checkNotContinueUntilCorrectAnswer
        ? result
          ? false
          : true
        : false,
      isDisabledPreviewSubmitButton,
    };

    if (!handleClickLastSubmitAnswer) {
      if (unit?.unitType !== UnitType.TEST && content?.isCompleted && content?.isPassed) {
        handleClickContinue(true, undefined, undefined, undefined, isSubmitedAnswer);
      } else if (listTestOptions?.checkNotContinueUntilCorrectAnswer) {
        if (result) {
          handleClickContinue(
            result,
            answeredAnswers,
            correctAnswers,
            savedAnswers,
            isSubmitedAnswer,
          );
        }
      } else {
        handleClickContinue(
          result,
          answeredAnswers,
          correctAnswers,
          savedAnswers,
          isSubmitedAnswer,
        );
      }
    } else {
      if (unit?.unitType !== UnitType.TEST && content?.isCompleted && content?.isPassed) {
        handleClickLastSubmitAnswer(true, undefined, undefined, undefined, isSubmitedAnswer);
      } else if (listTestOptions?.checkNotContinueUntilCorrectAnswer) {
        if (result) {
          handleClickLastSubmitAnswer(
            result,
            answeredAnswers,
            correctAnswers,
            savedAnswers,
            isSubmitedAnswer,
          );
        }
      } else {
        handleClickLastSubmitAnswer(
          result,
          answeredAnswers,
          correctAnswers,
          savedAnswers,
          isSubmitedAnswer,
        );
      }
    }
  };

  return (
    <>
      <div className="w-full bg-white border-solid border-transparent rounded-2xl min-height-60vh p-8">
        {isSpecialContent && (
          <>
            <div className="text-2xl font-fontFamily font-bold mb-6 tracking-tight underline underline-offset-2">
              {unit?.unitType || ''}
            </div>
            <div
              className="w-full mb-6 overflow-auto"
              dangerouslySetInnerHTML={{
                __html: isUploadedFile ? urlContent || '' : unit?.urlContent || '',
              }}
            ></div>
          </>
        )}

        <div className="">
          <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight">Question</p>
          <span
            className="text-base text-[#6E6B68]"
            dangerouslySetInnerHTML={{ __html: content?.contentTitle || '...' }}
          ></span>
        </div>

        {unit?.unitType !== UnitType.TEST && content?.isCompleted && content?.isPassed ? (
          ''
        ) : (
          <div className="mt-6 answer-container">
            <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight mb-6">
              Type your answer here:
            </p>

            <TextArea
              onChange={(e) => {
                setResultText(e.target.value);
                setIsDisabledPreviewSubmitButton(false);
              }}
              value={resultText}
            />
          </div>
        )}

        {isWrongAnswer ? (
          <span
            className="text-sm italic font-semibold text-[#EB5757] mt-3"
            style={{
              fontFamily: 'Montserrat',
            }}
          >
            Incorrect answer. Please try again.
          </span>
        ) : (
          ''
        )}
      </div>
      <div className="flex justify-between sm:gap-4">
        {pagination && (
          <div className="preview-pagination text-xl flex items-center sm:text-sm">
            {listTestOptions && listTestOptions.allowMovementQuestions ? (
              <>
                {handleClickBack ? (
                  <Button
                    className="text-[#32302D]"
                    ghost
                    icon={<LeftOutlined />}
                    onClick={onClickBack}
                  />
                ) : (
                  ''
                )}
                Question {pagination.currentIndex} of {pagination.totalIndex}
                {!handleClickLastSubmitAnswer ? (
                  <Button
                    className="text-[#32302D]"
                    ghost
                    icon={<RightOutlined />}
                    onClick={() => onClickContinue()}
                  />
                ) : (
                  ''
                )}
              </>
            ) : (
              <>
                Question {pagination.currentIndex} of {pagination.totalIndex}
              </>
            )}
          </div>
        )}
        <div className="flex justify-end items-center gap-3 flex-auto">
          {!isTest ? (
            <>
              <Button
                className="w-[120px] h-[44px] rounded-xl font-semibold text-base custom-width text-[#32302D]"
                onClick={() => history(-1)}
              >
                Exit
              </Button>
              {handleClickBack && (
                <Button
                  className="w-[120px] h-[44px] rounded-xl font-semibold text-base custom-width bg-[#ED7635] text-[#FFFFFF]"
                  onClick={onClickBack}
                >
                  Back
                </Button>
              )}
              <Button
                className="w-[120px] h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF] custom-width"
                disabled={
                  listTestOptions
                    ? listTestOptions.checkNotContinueUntilCorrectAnswer
                      ? isDisabledPreviewSubmitButton
                      : listTestOptions.allowMovementQuestions
                      ? false
                      : isDisabledPreviewSubmitButton
                    : isDisabledPreviewSubmitButton
                }
                onClick={() => {
                  onClickContinue(true);
                }}
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <Button
                className="h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF] sm:w-full"
                disabled={isDisabledPreviewSubmitButton}
                onClick={() => {
                  onClickContinue(true);
                }}
              >
                Submit answer
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MyCourseFreeTextPreview;
