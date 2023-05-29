import { Checkbox, Modal } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
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
  contentData: any;
  form: any;
  title?: string;
  urlContent?: string;
}

const FreeTextModalPreview = (props: IProps) => {
  const {
    contentTitle,
    listAnswers,
    setIsPreviewQuestion,
    setIsPreviewQuestionInside,
    isPreviewQuestion,
    isPreviewQuestionInside,
    sessionData,
    unitName,
    contentData,
    form,
    title,
    urlContent,
  } = props;

  const [isWrongAnswer, setIsWrongAnswer] = useState<boolean>(false);
  const [isDisabledPreviewSubmitButton, setIsDisabledPreviewSubmitButton] =
    useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');

  const handleCheckPreviewQuestion = useCallback(() => {
    const values = form.getFieldsValue();
    let total = 0;
    const targetPoint = contentData?.freeTextPoint || values?.freeTextPoint || 0;
    const answeredText = ' ' + resultText.replace(/[\r\n]+/gm, ' ') + ' ';
    console.log('answeredText', answeredText);

    // console.log("resultText", answeredText, listAnswers, targetPoint);

    for (let i = 0; i < listAnswers.length; i++) {
      if ((listAnswers[i].title || listAnswers[i].value) && listAnswers[i].point) {
        if (
          listAnswers[i].isContain &&
          answeredText
            ?.toLowerCase()
            .includes(
              ' ' +
                (listAnswers[i].title?.toLowerCase() || listAnswers[i].value?.toLowerCase()) +
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
                (listAnswers[i].title?.toLowerCase() || listAnswers[i].value?.toLowerCase()) +
                ' ',
            )
        ) {
          const point = Number(listAnswers[i].point);
          total = total + point;
        }
      }
    }

    if (total < targetPoint) {
      setIsWrongAnswer(true);
      setIsDisabledPreviewSubmitButton(true);
    } else {
      setIsWrongAnswer(false);
      setIsPreviewQuestion(false);
      setIsPreviewQuestionInside(false);
      setResultText('');
    }
  }, [listAnswers, resultText, contentData, form]);

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
        setIsWrongAnswer(false);
        setResultText('');
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

export default FreeTextModalPreview;
