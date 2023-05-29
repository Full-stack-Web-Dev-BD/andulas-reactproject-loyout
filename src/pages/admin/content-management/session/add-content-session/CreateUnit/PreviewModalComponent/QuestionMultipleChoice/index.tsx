import { Checkbox, Modal } from 'antd';
import ButtonCustom from 'components/Button';
import React, { useEffect, useState } from 'react';
import { shuffle } from '../../Test/TestConstantsAndInterface';

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

const QuestionMultipleChoiceModalPreview = (props: IProps) => {
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

  const [selectedAnswerPreview, setSelectedAnswerPreview] = useState<string[]>([]);
  const [isWrongAnswer, setIsWrongAnswer] = useState<boolean>(false);
  const [isDisabledPreviewSubmitButton, setIsDisabledPreviewSubmitButton] = useState<boolean>(true);
  const [listDnDAnswer, setListDnDUAnswer] = useState<any[]>([]);

  useEffect(() => {
    if (selectedAnswerPreview.length === 0) {
      setIsDisabledPreviewSubmitButton(true);
    } else {
      setIsDisabledPreviewSubmitButton(false);
    }
  }, [selectedAnswerPreview]);

  const handleonChangePreviewQuestion = (values: any[]) => {
    setSelectedAnswerPreview(values);
    setIsDisabledPreviewSubmitButton(false);
  };

  const handleCheckPreviewQuestion = () => {
    const answeredAnswers = [...selectedAnswerPreview];
    const correctAnswers = [
      ...listAnswers.filter((x) => x.isCorrect && x.title && x.value).map((y) => y.value),
    ];

    const difference = correctAnswers
      .filter((x) => !answeredAnswers.includes(x))
      .concat(answeredAnswers.filter((x) => !correctAnswers.includes(x)));

    if (difference.length > 0) {
      setIsWrongAnswer(true);
      setIsDisabledPreviewSubmitButton(true);
    } else {
      setIsWrongAnswer(false);
      setSelectedAnswerPreview([]);
      setIsPreviewQuestion(false);
      setIsPreviewQuestionInside(false);
    }
  };

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
        setSelectedAnswerPreview([]);
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
        <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight mb-6">Answer</p>
        <Checkbox.Group
          // onChange={handleonChangePreviewQuestion}
          className="multiple-choose__list-answer__answer-item"
          value={selectedAnswerPreview}
        >
          {listDnDAnswer
            .filter((x) => x.title.trim() && x.value.trim())
            .map((answer, index) => (
              <Checkbox
                onChange={(e) => {
                  let temp = [...selectedAnswerPreview];
                  if (e.target.checked && !temp.includes(answer.value)) {
                    temp.push(answer.value);
                    setSelectedAnswerPreview(temp);
                  } else if (!e.target.checked && temp.includes(answer.value)) {
                    temp = temp.filter((x) => x !== answer.value);
                    setSelectedAnswerPreview(temp);
                  }
                }}
                value={answer.value}
                key={index}
                className="table-component custom-checkbox"
              >
                {answer.title || answer.value}
              </Checkbox>
            ))}
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
    </Modal>
  );
};

export default QuestionMultipleChoiceModalPreview;
