import { Checkbox, Modal } from 'antd';
import ButtonCustom from 'components/Button';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

interface IProps {
    contentTitle: string,
    listAnswers: any[],
    setIsPreviewQuestion: (value: boolean) => void,
    setIsPreviewQuestionInside: (value: boolean) => void,
    isPreviewQuestion: boolean,
    isPreviewQuestionInside: boolean,
    sessionData: any,
    unitName: string,
    title?: string,
    urlContent?: string,
}

const DragAndDropModalPreview = (props: IProps) => {

    const {
        contentTitle,
        listAnswers,
        setIsPreviewQuestion,
        setIsPreviewQuestionInside,
        isPreviewQuestion,
        isPreviewQuestionInside,
        sessionData,
        unitName,
        title,
        urlContent,
    } = props;

  const [listAnswerShuffled, setListAnswerShuffled] = useState<any[]>([]);
  const [listDnDAnswer, setListDnDAnswer] = useState<any>({});
  const [isWrongAnswer, setIsWrongAnswer] = useState<boolean>(false);
  const [isDisabledPreviewSubmitButton, setIsDisabledPreviewSubmitButton] = useState<boolean>(true);
  console.log('listAnswers', listAnswers, listAnswerShuffled, listDnDAnswer);
  // useEffect(() => {
  //     if (selectedAnswerPreview.length === 0) {
  //         setIsDisabledPreviewSubmitButton(true);
  //     }
  //     else {
  //         setIsDisabledPreviewSubmitButton(false);
  //     }
  // }, [selectedAnswerPreview]);

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
    [listDnDAnswer, listAnswers],
  );

  const handleCheckPreviewQuestion = useCallback(() => {
    const initialListDnDAnswer = { ...listDnDAnswer };
    if (initialListDnDAnswer['droppable-start']) {
      delete initialListDnDAnswer['droppable-start'];
    }
    const answeredAnswers = Object.keys({ ...initialListDnDAnswer });

    for (let i = 0; i < answeredAnswers.length; i++) {
      const titleValue = answeredAnswers[i].split('-')[2];
      const temp = listDnDAnswer[answeredAnswers[i]];
      if (!temp || temp.length === 0) {
        setIsWrongAnswer(true);
        setIsDisabledPreviewSubmitButton(true);
        return;
      }
      if (answeredAnswers[i] && temp?.length > 0 && titleValue != temp[0].value) {
        setIsWrongAnswer(true);
        setIsDisabledPreviewSubmitButton(true);
        return;
      }
    }
    setIsWrongAnswer(false);
    setIsDisabledPreviewSubmitButton(false);
    setListDnDAnswer([]);
    setIsPreviewQuestion(false);
    setIsPreviewQuestionInside(false);
  }, [listDnDAnswer, listAnswers]);

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
    if ((isPreviewQuestion || isPreviewQuestionInside) && listAnswers?.length > 0) {
      let temp = [...listAnswers].map((answer, index) => {
        return {
          ...answer,
        };
      });
      temp = shuffle(temp);
      const dataSetListDnDAnswer: any = {};
      for (let i = 0; i < listAnswers.length; i++) {
        dataSetListDnDAnswer[`droppable-${listAnswers[i].title}-${listAnswers[i].value}-${listAnswers[i].order}`] = [];
      }
      dataSetListDnDAnswer[`droppable-start`] = temp;
      setListDnDAnswer(dataSetListDnDAnswer);
      setListAnswerShuffled(shuffle(listAnswers));
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
  }, [listAnswers]);

  const sortListDnd = useMemo(() => {
    const listData = Object.entries(listDnDAnswer);
    const listDndCopy = listData.map((e: any, index: number) => {
      if(e[0]) {
        listAnswerShuffled.forEach((val: any, indexVal: number) => {
          if(e[0]?.split('-')[1] === val.title && e[0]?.split('-')[2] === val.value && e[0]?.split('-')[3] == val.order) {
            e.indexTitle = indexVal
          }
        })
      }
      return e
    })
    return listDndCopy
  }, [listDnDAnswer])

  const listAnsNotChoose = useMemo(() => {
    const filterData: any = sortListDnd?.sort((a,b) => a.indexTitle - b.indexTitle)?.map((e: any, index) => {
      if (e[1]?.length == 0) {
        e.indexAns = index;
      }
      return e;
    });
    return filterData.filter((e: any) => e[1]?.length == 0);
  }, [sortListDnd]);

  return (
    <Modal
      centered
      className="content-management__custom-modal drag-drop-preview-modal"
      title={
        isPreviewQuestion
          ? `${sessionData?.sessionName}${unitName ? ` - ${unitName}` : ''}`
          : 'Preview question'
      }
      onCancel={() => {
        setIsPreviewQuestion(false);
        setIsPreviewQuestionInside(false);
        setListDnDAnswer([]);
        setIsWrongAnswer(false);
      }}
      footer={[
        <ButtonCustom
          key={'Submit'}
          color="orange"
          onClick={() => {
            // setIsPreviewQuestion(false);
            handleCheckPreviewQuestion();
          }}
          className="text-white"
          disabled={isDisabledPreviewSubmitButton}
        >
          Submit
        </ButtonCustom>,
      ]}
      cancelText="Cancel"
      visible={isPreviewQuestion || isPreviewQuestionInside}
    >
      {
        title && (
            <div className="container fill-the-gap-preview mb-6">
                <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight underline underline-offset-2">
                    {title}
                </p>

                {
                    urlContent && (<div className='overflow-auto w-full text-base text-[#6E6B68]' dangerouslySetInnerHTML={{ __html: urlContent }}></div>)
                }
            </div>
        )
      }
      <div className="container">
        <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight">Question</p>
        <span
          className="text-base text-[#6E6B68]"
          dangerouslySetInnerHTML={{
            __html:
              contentTitle ||
              'Just text content that was filled up in previous page with a completed / continue button below',
          }}
        ></span>
      </div>

      <div className="container mt-6 answer-container">
        <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight">
          Please match the pairs together
        </p>

        <DragDropContext onDragEnd={onDragEnd} onDragUpdate={(e) => console.log('drag update', e)}>
          <div className="drag-drop-container">
            <div className="drag-drop-preview__title">
              {listAnswerShuffled
                // ?.sort((a, b) => a?.order - b?.order)
                ?.map((answerInitial, indexInitial) => {
                  return (
                    <Droppable
                      droppableId={`droppable-${answerInitial.title}-${answerInitial.value}-${answerInitial.order}`}
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
                              {answerInitial.title || `Answer ${answerInitial + 1}`}
                            </div>
                            <span className="tl-left-cell-puzzle pull-right">
                              &nbsp;&nbsp;&nbsp;
                            </span>
                            {listDnDAnswer[
                              `droppable-${answerInitial.title}-${answerInitial.value}-${answerInitial.order}`
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
                                            {answer.value || `Answer ${index + 1}`}
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
                    style={{ height: `${62 * listAnswers.length}px`, width: '100%' }}
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
                            listAnsNotChoose?.length == listAnswers?.length
                              ? 0
                              : index == 0
                              ? (listAnsNotChoose[index]?.indexAns || 0) * 82
                              : (listAnsNotChoose[index]?.indexAns - listAnsNotChoose[index - 1]?.indexAns - 1 || 0) *
                                82,
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
                                    {answer.value || `Answer ${index + 1}`}
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
    </Modal>
  );
};

export default DragAndDropModalPreview;
