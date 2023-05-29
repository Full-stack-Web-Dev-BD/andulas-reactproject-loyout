import { Button, Checkbox, Modal } from 'antd';
import ButtonCustom from 'components/Button';
import {
  IContent,
  IUnit,
  UnitType,
} from 'pages/admin/content-management/session/add-content-session';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { IUnitOptions } from 'pages/admin/content-management/session/add-content-session/CreateUnit/Test/TestConstantsAndInterface';
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

const MyCourseOrderingPreview = (props: IProps) => {
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
  const [listDnDAnswer, setListDnDUAnswer] = useState<any[]>([]);

  const onDragEnd = useCallback(
    (result: any) => {
      const newItems = Array.from(listDnDAnswer);
      const [removed] = newItems.splice(result.source.index, 1);
      newItems.splice(result.destination.index, 0, removed);
      setListDnDUAnswer(newItems);
      setIsDisabledPreviewSubmitButton(false);
    },
    [listDnDAnswer],
  );

  const handleCheckPreviewQuestion = useCallback(
    (isBack?: boolean) => {
      const answeredAnswers = [...listDnDAnswer];
      const findWrongOrder = answeredAnswers.find((answer, index) => answer.order !== index + 1);

      if (listTestOptions?.checkNotContinueUntilCorrectAnswer && !isBack) {
        if (findWrongOrder) {
          setIsWrongAnswer(true);
          setIsDisabledPreviewSubmitButton(true);
          return false;
        } else {
          setIsWrongAnswer(false);
          setListDnDUAnswer([]);
          return true;
        }
      } else {
        if (findWrongOrder) {
          return false;
        } else {
          return true;
        }
      }
    },
    [listDnDAnswer, content?.answers, listTestOptions],
  );

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
      content?.answers?.length > 0 &&
      content?.isCompleted &&
      content?.isPassed &&
      unit?.unitType !== UnitType.TEST
    ) {
      const temp = [...content?.answers].map((answer, index) => {
        return {
          ...answer,
          order: index + 1,
        };
      });
      setListDnDUAnswer(temp);
    } else if (content?.savedAnswers) {
      setListDnDUAnswer(content.savedAnswers.listDnDAnswer || []);
      setIsWrongAnswer(content.savedAnswers.isWrongAnswer || false);
      setIsDisabledPreviewSubmitButton(false);
      setIsDisabledPreviewSubmitButton(
        content.savedAnswers.isDisabledPreviewSubmitButton === true ||
          content.savedAnswers.isDisabledPreviewSubmitButton === false
          ? content.savedAnswers.isDisabledPreviewSubmitButton
          : true,
      );
    } else if (content?.answers && content?.answers?.length > 0) {
      let temp = [...content?.answers].map((answer, index) => {
        return {
          ...answer,
          order: index + 1,
        };
      });
      if (listTestOptions && listTestOptions.shufflePossibleAnswers) {
        temp = shuffle(temp);
      }
      setListDnDUAnswer(temp);
    } else {
      setListDnDUAnswer([]);
    }
    return () => {
      setListDnDUAnswer([]);
    };
  }, [content?.answers, listTestOptions?.shufflePossibleAnswers, unit]);

  const onClickBack = () => {
    if (handleClickBack) {
      const result = handleCheckPreviewQuestion(true);
      // if (result) {
      //     handleClickContinue()
      // }
      const answeredAnswers = renderToString(
        <div className="flex flex-col">
          {listDnDAnswer &&
            listDnDAnswer.length > 0 &&
            listDnDAnswer.map((answer, index) => (
              <div
                className={`list-answer-ordering-item relative flex items-center justify-between mb-4 bg-white`}
                key={index}
              >
                <div className="ordering-answer-title text-xl">
                  {answer.answerTitle || answer.answerValue || `Answer ${index + 1}`}
                </div>
                <div
                  className="drag-item-layer"
                  style={{
                    position: 'absolute',
                    top: '0',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    zIndex: '1',
                  }}
                ></div>
              </div>
            ))}
        </div>,
      );
      const correctAnswers = renderToString(
        <div className="flex flex-col">
          {content?.answers &&
            content?.answers.length > 0 &&
            content.answers.map((answer, index) => (
              <div
                className={`list-answer-ordering-item relative flex items-center justify-between mb-4 bg-white`}
                key={index}
              >
                <div className="ordering-answer-title text-xl">
                  {answer.answerTitle || answer.answerValue || `Answer ${index + 1}`}
                </div>
                <div
                  className="drag-item-layer"
                  style={{
                    position: 'absolute',
                    top: '0',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    zIndex: '1',
                  }}
                ></div>
              </div>
            ))}
        </div>,
      );
      const savedAnswers = {
        listDnDAnswer,
        // isWrongAnswer: listTestOptions?.checkNotContinueUntilCorrectAnswer ? (result ? false : true) : false,
        isWrongAnswer: isWrongAnswer || false,
        isDisabledPreviewSubmitButton,
      };
      console.log('savedAnswers', savedAnswers);
      handleClickBack(result, answeredAnswers, correctAnswers, savedAnswers);
    }
  };

  const onClickContinue = (isSubmitedAnswer?: boolean) => {
    const result = handleCheckPreviewQuestion();
    // if (result) {
    //     handleClickContinue()
    // }
    const answeredAnswers = renderToString(
      <div className="flex flex-col">
        {listDnDAnswer &&
          listDnDAnswer.length > 0 &&
          listDnDAnswer.map((answer, index) => (
            <div
              className={`list-answer-ordering-item relative flex items-center justify-between mb-4 bg-white`}
              key={index}
            >
              <div className="ordering-answer-title text-xl">
                {answer.answerTitle || answer.answerValue || `Answer ${index + 1}`}
              </div>
              <div
                className="drag-item-layer"
                style={{
                  position: 'absolute',
                  top: '0',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  zIndex: '1',
                }}
              ></div>
            </div>
          ))}
      </div>,
    );
    const correctAnswers = renderToString(
      <div className="flex flex-col">
        {content?.answers &&
          content?.answers.length > 0 &&
          content.answers.map((answer, index) => (
            <div
              className={`list-answer-ordering-item relative flex items-center justify-between mb-4 bg-white`}
              key={index}
            >
              <div className="ordering-answer-title text-xl">
                {answer.answerTitle || answer.answerValue || `Answer ${index + 1}`}
              </div>
              <div
                className="drag-item-layer"
                style={{
                  position: 'absolute',
                  top: '0',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  zIndex: '1',
                }}
              ></div>
            </div>
          ))}
      </div>,
    );
    const savedAnswers = {
      listDnDAnswer,
      isWrongAnswer: listTestOptions?.checkNotContinueUntilCorrectAnswer
        ? result
          ? false
          : true
        : false,
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
          <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight mb-6">
            Please place them in order
          </p>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div
                  className="abcccccc"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ height: `${62 * listDnDAnswer.length}px`, width: '100%' }}
                >
                  {listDnDAnswer.map((answer, index) => (
                    <Draggable
                      key={answer.order}
                      draggableId={answer.order.toString()}
                      index={index}
                    >
                      {(providedIn) => {
                        return (
                          <div
                            className=""
                            ref={providedIn.innerRef}
                            {...providedIn.draggableProps}
                            {...providedIn.dragHandleProps}
                          >
                            <div
                              className={`list-answer-ordering-item relative flex items-center justify-between mb-4 bg-white`}
                            >
                              <div className="ordering-answer-title text-xl">
                                {answer.answerTitle || answer.answerValue || `Answer ${index + 1}`}
                              </div>
                              <div
                                className="drag-item-layer"
                                style={{
                                  position: 'absolute',
                                  top: '0',
                                  bottom: '0',
                                  left: '0',
                                  right: '0',
                                  zIndex: '1',
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      }}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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
                className="w-[120px] h-[44px] custom-width rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF]"
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

export default MyCourseOrderingPreview;
