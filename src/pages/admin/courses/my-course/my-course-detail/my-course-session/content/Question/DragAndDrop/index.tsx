import { Button, Checkbox, Modal } from 'antd';
import ButtonCustom from 'components/Button';
import {
  IContent,
  IUnit,
  UnitType,
} from 'pages/admin/content-management/session/add-content-session';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const MyCourseDragAndDropPreview = (props: IProps) => {
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

  const [listAnswerShuffled, setListAnswerShuffled] = useState<any[]>([]);
  const [listDnDAnswer, setListDnDAnswer] = useState<any>({});
  const [isWrongAnswer, setIsWrongAnswer] = useState<boolean>(false);
  const [isDisabledPreviewSubmitButton, setIsDisabledPreviewSubmitButton] = useState<boolean>(true);

  const removeFromList = (list: any[], index: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(index, 1);
    return [removed, result];
  };

  const addToList = (
    list: any[],
    index: number,
    element: any,
    startList?: any[],
    desId?: string,
  ) => {
    if (startList) {
      const result = Array.from(list);
      const resultStart = Array.from(startList);
      if (result && result[0]) {
        const temp = result[0];
        resultStart.push(temp);
        result[0] = element;
      } else {
        result.splice(index, 0, element);
        // const listAns = Object.entries(listDnDAnswer)
        // listAns.map((ans: any, indexAns) => {
        //     if(ans[0] == desId) {
        //         element.isChoose = true;
        //         resultStart.splice(indexAns, 0, element);
        //     }
        // })
      }
      return [result, resultStart];
    } else {
      const result = Array.from(list);
      result.splice(index, 0, element);
      return result;
    }
  };

  const onDragEnd = useCallback(
    (result: any) => {
      // console.log('result', result);
      if (!result.destination) {
        return;
      }

      const listCopy = { ...listDnDAnswer };

      const sourceList = listCopy[result.source.droppableId];
      const [removedElement, newSourceList] = removeFromList(sourceList, result.source.index);
      listCopy[result.source.droppableId] = newSourceList;
      const destinationList = listCopy[result.destination.droppableId];
      const startList = listCopy['droppable-start'];

      if (result.destination.droppableId !== 'droppable-start') {
        [listCopy[result.destination.droppableId], listCopy['droppable-start']] = addToList(
          destinationList,
          result.destination.index,
          removedElement,
          startList,
          result.destination.droppableId,
        );
      } else {
        listCopy[result.destination.droppableId] = addToList(
          destinationList,
          result.destination.index,
          removedElement,
        );
      }

      if (
        result.destination.droppableId !== 'droppable-start' ||
        result.source.droppableId !== 'droppable-start'
      ) {
        setIsDisabledPreviewSubmitButton(false);
      }

      setListDnDAnswer(listCopy);
    },
    [listDnDAnswer, content?.answers],
  );

  const handleCheckPreviewQuestion = useCallback(
    (isBack?: boolean) => {
      const initialListDnDAnswer = { ...listDnDAnswer };
      if (initialListDnDAnswer['droppable-start']) {
        delete initialListDnDAnswer['droppable-start'];
      }
      const answeredAnswers = Object.keys({ ...initialListDnDAnswer });

      if (listTestOptions?.checkNotContinueUntilCorrectAnswer && !isBack) {
        for (let i = 0; i < answeredAnswers.length; i++) {
          const titleValue = answeredAnswers[i].split('-')[2];
          const temp = listDnDAnswer[answeredAnswers[i]];
          if (!temp || temp.length === 0) {
            setIsWrongAnswer(true);
            setIsDisabledPreviewSubmitButton(true);
            return false;
          }
          if (answeredAnswers[i] && temp?.length > 0 && titleValue != temp[0].answerValue) {
            setIsWrongAnswer(true);
            setIsDisabledPreviewSubmitButton(true);
            return false;
          }
        }
      } else {
        for (let i = 0; i < answeredAnswers.length; i++) {
          const titleValue = answeredAnswers[i].split('-')[2];
          const temp = listDnDAnswer[answeredAnswers[i]];
          if (!temp || temp.length === 0) {
            return false;
          }
          if (answeredAnswers[i] && temp?.length > 0 && titleValue != temp[0].answerValue) {
            return false;
          }
        }
      }
      setIsWrongAnswer(false);
      setIsDisabledPreviewSubmitButton(false);
      // setListDnDAnswer({});
      return true;
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
      const dataSetListDnDAnswer: any = {};
      for (let i = 0; i < content?.answers.length; i++) {
        const initArr = [];
        initArr.push(content?.answers[i]);
        dataSetListDnDAnswer[
          `droppable-${content?.answers[i].answerTitle}-${content?.answers[i].answerValue}-${content?.answers[i].order}`
        ] = initArr;
      }
      dataSetListDnDAnswer[`droppable-start`] = [];
      setListDnDAnswer(dataSetListDnDAnswer);
      setIsWrongAnswer(false);
      setIsDisabledPreviewSubmitButton(false);
      setListAnswerShuffled(
        listTestOptions && listTestOptions?.shufflePossibleAnswers
          ? shuffle(content?.answers)
          : content.answers,
      );
    } else if (content?.savedAnswers) {
      setListAnswerShuffled(content?.savedAnswers.listAnswerShuffled || []);
      setListDnDAnswer(content.savedAnswers.listDnDAnswer || {});
      setIsWrongAnswer(content.savedAnswers.isWrongAnswer || false);
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
        };
      });
      if (listTestOptions && listTestOptions?.shufflePossibleAnswers) {
        temp = shuffle(temp);
      }
      const dataSetListDnDAnswer: any = {};
      for (let i = 0; i < content?.answers.length; i++) {
        dataSetListDnDAnswer[
          `droppable-${content?.answers[i].answerTitle}-${content?.answers[i].answerValue}-${content?.answers[i].order}`
        ] = [];
      }
      dataSetListDnDAnswer[`droppable-start`] = temp;
      setListDnDAnswer(dataSetListDnDAnswer);
      setListAnswerShuffled(
        listTestOptions && listTestOptions?.shufflePossibleAnswers
          ? shuffle(content?.answers)
          : content.answers,
      );
    } else {
      setListDnDAnswer({
        listStart: [],
      });
    }

    return () => {
      setIsDisabledPreviewSubmitButton(true);
      setListDnDAnswer(undefined);
      setIsWrongAnswer(false);
    };
  }, [content?.answers, listTestOptions?.shufflePossibleAnswers, unit]);

  useEffect(() => {
    const initialListDnDAnswer = { ...listDnDAnswer };
    if (initialListDnDAnswer['droppable-start']) {
      delete initialListDnDAnswer['droppable-start'];
    }
    const answeredAnswers = Object.keys({ ...initialListDnDAnswer });

    for (let i = 0; i < answeredAnswers.length; i++) {
      const temp = listDnDAnswer[answeredAnswers[i]];
      console.log('temp', answeredAnswers[i], temp[0]);
      if (!temp || temp.length === 0) {
        setIsDisabledPreviewSubmitButton(true);
      }
    }
  }, [listDnDAnswer]);

  const sortListDnd = useMemo(() => {
    const listData = Object.entries(listDnDAnswer);
    const listDndCopy = listData.map((e: any, index: number) => {
      if (e[0]) {
        listAnswerShuffled.forEach((val: any, indexVal: number) => {
          if (
            e[0]?.split('-')[1] === val.answerTitle &&
            e[0]?.split('-')[2] === val.answerValue &&
            e[0]?.split('-')[3] == val.order
          ) {
            e.indexTitle = indexVal;
          }
        });
      }
      return e;
    });
    return listDndCopy;
  }, [listDnDAnswer]);

  const listAnsNotChoose = useMemo(() => {
    const filterData: any = sortListDnd
      ?.sort((a, b) => a.indexTitle - b.indexTitle)
      ?.map((e: any, index) => {
        if (e[1]?.length == 0) {
          e.indexAns = index;
        }
        return e;
      });
    return filterData.filter((e: any) => e[1]?.length == 0);
  }, [sortListDnd]);

  const onClickBack = () => {
    if (handleClickBack) {
      const result = handleCheckPreviewQuestion(true);
      // if (result) {
      //     handleClickContinue()
      // }
      const initialListDnDAnswer = { ...listDnDAnswer };
      if (initialListDnDAnswer['droppable-start']) {
        delete initialListDnDAnswer['droppable-start'];
      }
      const getAnsweredAnswers = Object.keys({ ...initialListDnDAnswer });

      const tempAnsweredAnswers = [];
      for (let i = 0; i < getAnsweredAnswers.length; i++) {
        const temp = listDnDAnswer[getAnsweredAnswers[i]];
        tempAnsweredAnswers.push({
          answerTitle: getAnsweredAnswers[i].split('-')[1],
          answerValue: temp[0]?.answerValue || undefined,
        });
      }

      const answeredAnswers = renderToString(
        <div className="drag-drop-preview__title">
          <div className="relative flex flex-col">
            {tempAnsweredAnswers.map((x, index) => (
              <div className="droppable-container relative flex flex-col" key={index}>
                <div className="inner">
                  <div className="drag-drop-title list-answer-ordering-item absolute flex items-center justify-between bg-white text-xl">
                    {x.answerTitle}
                  </div>
                  <span className="tl-left-cell-puzzle pull-right">&nbsp;&nbsp;&nbsp;</span>
                  <div className="drag-drop-value relative flex">
                    <div className="ordering-answer-title text-xl w-full">{x.answerValue}</div>
                    <span className="tl-right-cell-puzzle pull-left top-unset left-minus-17px">
                      &nbsp;&nbsp;&nbsp;
                    </span>
                    <div
                      className="drag-item-layer"
                      style={{ position: 'absolute', inset: '0px', zIndex: 1 }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>,
      );

      const correctAnswers = renderToString(
        <div className="drag-drop-preview__title">
          <div className="relative flex flex-col">
            {(content.answers || [])?.map((x, index) => (
              <div className="droppable-container relative flex flex-col" key={index}>
                <div className="inner">
                  <div className="drag-drop-title list-answer-ordering-item absolute flex items-center justify-between bg-white text-xl">
                    {x.answerTitle}
                  </div>
                  <span className="tl-left-cell-puzzle pull-right">&nbsp;&nbsp;&nbsp;</span>
                  <div className="drag-drop-value relative flex">
                    <div className="ordering-answer-title text-xl w-full">{x.answerValue}</div>
                    <span className="tl-right-cell-puzzle pull-left top-unset left-minus-17px">
                      &nbsp;&nbsp;&nbsp;
                    </span>
                    <div
                      className="drag-item-layer"
                      style={{ position: 'absolute', inset: '0px', zIndex: 1 }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>,
      );

      const savedAnswers = {
        listAnswerShuffled,
        listDnDAnswer,
        // isWrongAnswer: listTestOptions?.checkNotContinueUntilCorrectAnswer ? (result ? false : true) : false,
        isWrongAnswer: isWrongAnswer || false,
        isDisabledPreviewSubmitButton,
        checkAnsweredAnswers: tempAnsweredAnswers,
      };
      handleClickBack(result, answeredAnswers, correctAnswers, savedAnswers);
    }
  };

  const onClickContinue = (isSubmitedAnswer?: boolean) => {
    const result = handleCheckPreviewQuestion();

    const initialListDnDAnswer = { ...listDnDAnswer };
    if (initialListDnDAnswer['droppable-start']) {
      delete initialListDnDAnswer['droppable-start'];
    }
    const getAnsweredAnswers = Object.keys({ ...initialListDnDAnswer });

    const tempAnsweredAnswers = [];
    for (let i = 0; i < getAnsweredAnswers.length; i++) {
      const temp = listDnDAnswer[getAnsweredAnswers[i]];
      tempAnsweredAnswers.push({
        answerTitle: getAnsweredAnswers[i].split('-')[1],
        answerValue: temp[0]?.answerValue || undefined,
      });
    }

    const answeredAnswers = renderToString(
      <div className="drag-drop-preview__title">
        <div className="relative flex flex-col">
          {tempAnsweredAnswers.map((x, index) => (
            <div className="droppable-container relative flex flex-col" key={index}>
              <div className="inner">
                <div className="drag-drop-title list-answer-ordering-item absolute flex items-center justify-between bg-white text-xl">
                  {x.answerTitle}
                </div>
                <span className="tl-left-cell-puzzle pull-right">&nbsp;&nbsp;&nbsp;</span>
                <div className="drag-drop-value relative flex">
                  <div className="ordering-answer-title text-xl w-full">{x.answerValue}</div>
                  <span className="tl-right-cell-puzzle pull-left top-unset left-minus-17px">
                    &nbsp;&nbsp;&nbsp;
                  </span>
                  <div
                    className="drag-item-layer"
                    style={{ position: 'absolute', inset: '0px', zIndex: 1 }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>,
    );

    const correctAnswers = renderToString(
      <div className="drag-drop-preview__title">
        <div className="relative flex flex-col">
          {(content.answers || [])?.map((x, index) => (
            <div className="droppable-container relative flex flex-col" key={index}>
              <div className="inner">
                <div className="drag-drop-title list-answer-ordering-item absolute flex items-center justify-between bg-white text-xl">
                  {x.answerTitle}
                </div>
                <span className="tl-left-cell-puzzle pull-right">&nbsp;&nbsp;&nbsp;</span>
                <div className="drag-drop-value relative flex">
                  <div className="ordering-answer-title text-xl w-full">{x.answerValue}</div>
                  <span className="tl-right-cell-puzzle pull-left top-unset left-minus-17px">
                    &nbsp;&nbsp;&nbsp;
                  </span>
                  <div
                    className="drag-item-layer"
                    style={{ position: 'absolute', inset: '0px', zIndex: 1 }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>,
    );

    const savedAnswers = {
      listAnswerShuffled,
      listDnDAnswer: initialListDnDAnswer,
      isWrongAnswer: listTestOptions?.checkNotContinueUntilCorrectAnswer
        ? result
          ? false
          : true
        : false,
      isDisabledPreviewSubmitButton,
      checkAnsweredAnswers: tempAnsweredAnswers,
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
            Please match the pairs together
          </p>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="drag-drop-container">
              <div className="drag-drop-preview__title">
                {listAnswerShuffled
                  // ?.sort((a, b) => a?.order - b?.order)
                  ?.map((answerInitial, indexInitial) => {
                    return (
                      <Droppable
                        droppableId={`droppable-${answerInitial.answerTitle}-${answerInitial.answerValue}-${answerInitial.order}`}
                        key={indexInitial}
                      >
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={'droppable-container relative'}
                          >
                            <div className="inner">
                              <div className="drag-drop-title list-answer-ordering-item absolute flex items-center justify-between bg-white text-xl">
                                {answerInitial.answerTitle || `Answer ${answerInitial + 1}`}
                              </div>
                              <span className="tl-left-cell-puzzle pull-right">
                                &nbsp;&nbsp;&nbsp;
                              </span>
                              {listDnDAnswer[
                                `droppable-${answerInitial.answerTitle}-${answerInitial.answerValue}-${answerInitial.order}`
                              ]?.map((answer: any, index: number) => {
                                return (
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
                                          <div className={`drag-drop-value relative`}>
                                            <div className="ordering-answer-title text-xl">
                                              {answer.answerValue || `Answer ${index + 1}`}
                                            </div>
                                            <span className="tl-right-cell-puzzle pull-left">
                                              &nbsp;&nbsp;&nbsp;
                                            </span>
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
                                );
                              })}
                              {provided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
              </div>
              <div className="drag-drop-preview__value">
                <Droppable droppableId="droppable-start">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        height: `${62 * (content?.answers ? content?.answers.length : 0)}px`,
                        width: '100%',
                      }}
                    >
                      {listDnDAnswer['droppable-start']?.map((answer: any, index: number) => (
                        // answer?.isChoose && answer?.isChoose == true ?
                        // <div style={{padding: '10px 0px'}}>
                        //     <div style={{height: 44}}></div>
                        // </div> :
                        <div
                          className="inner"
                          key={index}
                          // 82 = height box : 66 + gap : 16
                          style={{
                            marginTop:
                              listAnsNotChoose?.length == content?.answers?.length
                                ? 0
                                : index == 0
                                ? (listAnsNotChoose[index]?.indexAns || 0) * 82
                                : (listAnsNotChoose[index]?.indexAns -
                                    listAnsNotChoose[index - 1]?.indexAns -
                                    1 || 0) * 82,
                          }}
                        >
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
                                  <div className={`drag-drop-value relative`}>
                                    <div className="ordering-answer-title text-xl">
                                      {answer.answerValue || `Answer ${index + 1}`}
                                    </div>
                                    <span className="tl-right-cell-puzzle pull-left">
                                      &nbsp;&nbsp;&nbsp;
                                    </span>
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
                        </div>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
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

export default MyCourseDragAndDropPreview;
