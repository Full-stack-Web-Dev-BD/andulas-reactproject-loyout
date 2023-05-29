import { Button, Checkbox, Modal } from 'antd';
import ButtonCustom from 'components/Button';
import {
  IContent,
  IUnit,
  UnitType,
} from 'pages/admin/content-management/session/add-content-session';
import { IUnitOptions } from 'pages/admin/content-management/session/add-content-session/CreateUnit/Test/TestConstantsAndInterface';
import React, { useEffect, useState } from 'react';
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

const MyCourseMultipleChoicePreview = (props: IProps) => {
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

  const [selectedAnswerPreview, setSelectedAnswerPreview] = useState<any[]>([]);
  const [isWrongAnswer, setIsWrongAnswer] = useState<boolean>(false);
  const [isDisabledPreviewSubmitButton, setIsDisabledPreviewSubmitButton] = useState<boolean>(true);
  const [listAnswers, setListAnswers] = useState<any[]>();

  useEffect(() => {
    if (selectedAnswerPreview.length === 0) {
      setIsDisabledPreviewSubmitButton(true);
    } else {
      setIsDisabledPreviewSubmitButton(false);
    }
  }, [selectedAnswerPreview]);

  const handleonChangePreviewQuestion = (values: any[]) => {
    console.log('handleonChangePreviewQuestion', values);
    setSelectedAnswerPreview(values);
    setIsDisabledPreviewSubmitButton(false);
  };

  const handleCheckPreviewQuestion = (isBack?: boolean) => {
    const answeredAnswers = [...selectedAnswerPreview];
    const correctAnswers = [
      ...(content.answers
        ?.filter((x) => x.isCorrect && x.answerTitle && x.answerValue)
        .map((y) => y.answerValue) || []),
    ];

    const difference = correctAnswers
      .filter((x) => !answeredAnswers.includes(x))
      .concat(answeredAnswers.filter((x) => !correctAnswers.includes(x)));

    if (listTestOptions?.checkNotContinueUntilCorrectAnswer && !isBack) {
      if (difference.length > 0) {
        setIsWrongAnswer(true);
        setIsDisabledPreviewSubmitButton(true);
        return false;
      } else {
        setIsWrongAnswer(false);
        setSelectedAnswerPreview([]);
        // handleClickContinue();
        return true;
      }
    } else {
      if (difference.length > 0) {
        return false;
      } else {
        return true;
      }
    }
  };

  function shuffle(array: any[]) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  useEffect(() => {
    if (
      content?.answers &&
      content?.answers.length > 0 &&
      content?.isCompleted &&
      content?.isPassed &&
      unit?.unitType !== UnitType.TEST
    ) {
      let temp = content.answers;
      if (listTestOptions && listTestOptions.shufflePossibleAnswers) {
        temp = shuffle(temp);
      }
      setListAnswers(temp);
      const tempArr = [];
      for (let i = 0; i < content.answers.length; i++) {
        if (content.answers[i].answerValue && content.answers[i].isCorrect) {
          tempArr.push(content.answers[i].answerValue);
        }
      }
      setSelectedAnswerPreview(tempArr);
      setIsWrongAnswer(false);
      setIsDisabledPreviewSubmitButton(false);
    } else if (content.savedAnswers) {
      setSelectedAnswerPreview(content.savedAnswers.selectedAnswerPreview || []);
      setIsWrongAnswer(content.savedAnswers.isWrongAnswer || false);
      setIsDisabledPreviewSubmitButton(false);
      setListAnswers(content.savedAnswers.listAnswers || []);
      setIsDisabledPreviewSubmitButton(
        content.savedAnswers.isDisabledPreviewSubmitButton === true ||
          content.savedAnswers.isDisabledPreviewSubmitButton === false
          ? content.savedAnswers.isDisabledPreviewSubmitButton
          : true,
      );
    } else if (content?.answers && content?.answers.length > 0) {
      let temp = content.answers;
      if (listTestOptions && listTestOptions.shufflePossibleAnswers) {
        temp = shuffle(temp);
      }
      setListAnswers(temp);
    } else {
      setListAnswers([]);
    }

    return () => {
      setListAnswers([]);
      setSelectedAnswerPreview([]);
      setIsWrongAnswer(false);
    };
  }, [content, listTestOptions, unit]);

  const onClickBack = () => {
    if (handleClickBack) {
      const result = handleCheckPreviewQuestion(true);
      // if (result) {
      //     handleClickContinue()
      // }
      const answeredAnswers = renderToString(
        <Checkbox.Group
          className="multiple-choose__list-answer__answer-item flex flex-col"
          value={selectedAnswerPreview}
          disabled
        >
          {listAnswers
            ?.filter((x) => x.answerTitle?.trim() && x.answerValue?.trim())
            .map((answer, index) => (
              <Checkbox
                value={answer.answerValue}
                key={index}
                className="table-component custom-checkbox m-0 mb-2"
              >
                {answer.answerTitle || answer.answerValue}
              </Checkbox>
            ))}
        </Checkbox.Group>,
      );
      const correctAnswers = renderToString(
        <Checkbox.Group
          className="multiple-choose__list-answer__answer-item flex flex-col"
          value={[
            ...(content.answers
              ?.filter((x) => x.isCorrect && x.answerTitle && x.answerValue)
              .map((y) => y.answerValue) || []),
          ]}
          disabled
        >
          {listAnswers
            ?.filter((x) => x.answerTitle?.trim() && x.answerValue?.trim())
            .map((answer, index) => {
              // console.log("listAnswers", listAnswers, answer)
              return (
                <Checkbox
                  value={answer.answerValue}
                  key={index}
                  className="table-component custom-checkbox m-0 mb-2"
                >
                  {answer.answerTitle || answer.answerValue}
                </Checkbox>
              );
            })}
        </Checkbox.Group>,
      );
      const savedAnswers = {
        selectedAnswerPreview,
        // isWrongAnswer: listTestOptions?.checkNotContinueUntilCorrectAnswer ? (result ? false : true) : false,
        isWrongAnswer: isWrongAnswer || false,
        listAnswers,
        isDisabledPreviewSubmitButton,
      };
      handleClickBack(result, answeredAnswers, correctAnswers, savedAnswers);
    }
  };

  const onClickContinue = (isSubmitedAnswer?: boolean) => {
    const result = handleCheckPreviewQuestion();

    const answeredAnswers = renderToString(
      <Checkbox.Group
        className="multiple-choose__list-answer__answer-item flex flex-col"
        value={selectedAnswerPreview}
        disabled
      >
        {listAnswers
          ?.filter((x) => x.answerTitle?.trim() && x.answerValue?.trim())
          .map((answer, index) => (
            <Checkbox
              value={answer.answerValue}
              key={index}
              className="table-component custom-checkbox m-0 mb-2"
            >
              {answer.answerTitle || answer.answerValue}
            </Checkbox>
          ))}
      </Checkbox.Group>,
    );
    const correctAnswers = renderToString(
      <Checkbox.Group
        className="multiple-choose__list-answer__answer-item flex flex-col"
        value={[
          ...(content.answers
            ?.filter((x) => x.isCorrect && x.answerTitle && x.answerValue)
            .map((y) => y.answerValue) || []),
        ]}
        disabled
      >
        {listAnswers
          ?.filter((x) => x.answerTitle?.trim() && x.answerValue?.trim())
          .map((answer, index) => {
            // console.log("listAnswers", listAnswers, answer)
            return (
              <Checkbox
                value={answer.answerValue}
                key={index}
                className="table-component custom-checkbox m-0 mb-2"
              >
                {answer.answerTitle || answer.answerValue}
              </Checkbox>
            );
          })}
      </Checkbox.Group>,
    );
    const savedAnswers = {
      selectedAnswerPreview,
      isWrongAnswer: listTestOptions?.checkNotContinueUntilCorrectAnswer
        ? result
          ? false
          : true
        : false,
      listAnswers,
      isDisabledPreviewSubmitButton,
    };

    if (!handleClickLastSubmitAnswer) {
      if (listTestOptions?.checkNotContinueUntilCorrectAnswer) {
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
      if (listTestOptions?.checkNotContinueUntilCorrectAnswer) {
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

        <div className="mt-6 answer-container">
          <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight mb-6">Answer</p>
          <Checkbox.Group
            // onChange={handleonChangePreviewQuestion}
            className="multiple-choose__list-answer__answer-item flex flex-col"
            value={selectedAnswerPreview}
          >
            {
              // shufflePossibleAnswers
              //     ?
              //     shuffle(content.answers?.filter((x) => x.answerTitle?.trim() && x.answerValue?.trim()) || []).map((answer, index) => (
              //         <Checkbox value={answer.answerValue} key={index} className='table-component custom-checkbox m-0 mb-2'>
              //             {answer.answerTitle || answer.answerValue}
              //         </Checkbox>
              //     ))
              //     :
              //     content.answers?.filter((x) => x.answerTitle?.trim() && x.answerValue?.trim()).map((answer, index) => (
              //         <Checkbox value={answer.answerValue} key={index} className='table-component custom-checkbox m-0 mb-2'>
              //             {answer.answerTitle || answer.answerValue}
              //         </Checkbox>
              //     ))
              listAnswers
                ?.filter((x) => x.answerTitle?.trim() && x.answerValue?.trim())
                .map((answer, index) => (
                  <Checkbox
                    onChange={(e) => {
                      let temp = [...selectedAnswerPreview];
                      if (e.target.checked && !temp.includes(answer.answerValue)) {
                        temp.push(answer.answerValue);
                        setSelectedAnswerPreview(temp);
                      } else if (!e.target.checked && temp.includes(answer.answerValue)) {
                        temp = temp.filter((x) => x !== answer.answerValue);
                        setSelectedAnswerPreview(temp);
                      }
                    }}
                    value={answer.answerValue}
                    key={index}
                    className="table-component custom-checkbox m-0 mb-2"
                  >
                    {answer.answerTitle || answer.answerValue}
                  </Checkbox>
                ))
            }
          </Checkbox.Group>
        </div>

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
                className="w-[120px] h-[44px] rounded-xl font-semibold text-base custom-width bg-[#ED7635] text-[#FFFFFF]"
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

export default MyCourseMultipleChoicePreview;
