import { Checkbox, Modal } from 'antd';
import ButtonCustom from 'components/Button';
import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

interface IProps {
  contentTitle: string;
  listAnswers: any[];
  setIsPreviewQuestion: (value: boolean) => void;
  setIsPreviewQuestionInside: (value: boolean) => void;
  isPreviewQuestion: boolean;
  isPreviewQuestionInside: boolean;
  sessionData: any;
  unitName: string;
  title?: string;
  urlContent?: string;
}

const OrderingModalPreview = (props: IProps) => {
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

  const [listDnDAnswer, setListDnDUAnswer] = useState<any[]>([]);
  const [isWrongAnswer, setIsWrongAnswer] = useState<boolean>(false);
  const [isDisabledPreviewSubmitButton, setIsDisabledPreviewSubmitButton] =
    useState<boolean>(false);

  // useEffect(() => {
  //     if (selectedAnswerPreview.length === 0) {
  //         setIsDisabledPreviewSubmitButton(true);
  //     }
  //     else {
  //         setIsDisabledPreviewSubmitButton(false);
  //     }
  // }, [selectedAnswerPreview]);

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

  const handleCheckPreviewQuestion = useCallback(() => {
    const answeredAnswers = [...listDnDAnswer];
    const findWrongOrder = answeredAnswers.find((answer, index) => answer.order !== index + 1);

    if (findWrongOrder) {
      setIsWrongAnswer(true);
      setIsDisabledPreviewSubmitButton(true);
    } else {
      setIsWrongAnswer(false);
      setListDnDUAnswer([]);
      setIsPreviewQuestion(false);
      setIsPreviewQuestionInside(false);
    }
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
    if (listAnswers?.length > 0) {
      let temp = [...listAnswers].map((answer, index) => {
        return {
          ...answer,
          order: index + 1,
        };
      });
      temp = shuffle(temp);
      setListDnDUAnswer(temp);
    } else {
      setListDnDUAnswer([]);
    }
  }, [listAnswers]);

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
        setListDnDUAnswer([]);
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
      {title && (
        <div className="container fill-the-gap-preview mb-6">
          <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight mb-6 underline underline-offset-2">
            {title}
          </p>

          {urlContent && (
            <div
              className="overflow-auto w-full text-base text-[#6E6B68]"
              dangerouslySetInnerHTML={{ __html: urlContent }}
            ></div>
          )}
        </div>
      )}

      <div className="container">
        <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight mb-6">Question</p>
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
        <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight mb-6">
          Please place them in order
        </p>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  height: `${62 * listDnDAnswer.length}px`,

                  width: '100%',
                }}
              >
                {listDnDAnswer.map((unit, index) => (
                  <Draggable key={unit.order} draggableId={unit.order.toString()} index={index}>
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
                              {unit.title || unit.value || `Answer ${index + 1}`}
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
    </Modal>
  );
};

export default OrderingModalPreview;
