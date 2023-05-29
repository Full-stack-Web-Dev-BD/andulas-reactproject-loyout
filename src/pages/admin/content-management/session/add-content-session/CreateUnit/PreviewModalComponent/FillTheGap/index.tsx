import { Checkbox, Modal } from 'antd';
import ButtonCustom from 'components/Button';
import React, { useCallback, useEffect, useState } from 'react';

interface IProps {
  contentTitle: string;
  setIsPreviewQuestion: (value: boolean) => void;
  setIsPreviewQuestionInside: (value: boolean) => void;
  isPreviewQuestion: boolean;
  isPreviewQuestionInside: boolean;
  sessionData: any;
  unitName: string;
  title?: string;
  urlContent?: string;
}

const FillTheGapModalPreview = (props: IProps) => {
  const {
    contentTitle,
    setIsPreviewQuestion,
    setIsPreviewQuestionInside,
    isPreviewQuestion,
    isPreviewQuestionInside,
    sessionData,
    unitName,
    title,
    urlContent,
  } = props;

  const [amountSelect, setAmountSelect] = useState<number>(0);
  const [isDisabledPreviewSubmitButton, setIsDisabledPreviewSubmitButton] = useState<boolean>(true);
  const [isWrongAnswer, setIsWrongAnswer] = useState<boolean>(false);
  const [parsedContentTitle, setParsedContentTitle] = useState<string>('');

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

  const parseFillTheGap = (value: string) => {
    if (value?.length > 0) {
      let initialString = value;
      let indexKey = 0;
      const matchedPattern = initialString.match(/(?:\[)[^\][]*(?=])/g)
        ? initialString.match(/(?:\[)[^\][]*(?=])/g)?.map((x) => x.substring(1))
        : null;
      if (matchedPattern) {
        const listSingleAnswers = [];
        for (let i = 0; i < matchedPattern.length; i++) {
          if (matchedPattern[i].split('|').filter((x) => x !== '').length === 1) {
            listSingleAnswers.push(matchedPattern[i].split('|').filter((x) => x !== '')[0]);
          }
        }
        for (let i = 0; i < matchedPattern.length; i++) {
          if (matchedPattern[i].split('|').filter((x) => x !== '').length > 1) {
            let temp = matchedPattern[i].split('|').filter((x) => x !== '');
            // console.log("temp", matchedPattern[i],`[${matchedPattern[i]}]`);
            temp = temp.map(
              (x, index) => `<option value=${index === 0 ? true : false}>${x}</option>`,
            );
            temp = shuffle(temp);
            temp.unshift(`<option value='default' selected>Please select</option>`);
            // console.log(temp);
            initialString = initialString.replace(
              `[${matchedPattern[i]}]`,
              `<select id='fill-the-gap-select${indexKey}' name='select${indexKey}'>${temp.join(
                '',
              )}</select>`,
            );
            indexKey += 1;
          }
          if (matchedPattern[i].split('|').filter((x) => x !== '').length === 1) {
            let temp = listSingleAnswers.map(
              (x, index) =>
                `<option value=${
                  x === matchedPattern[i].split('|').filter((y) => y !== '')[0] ? true : false
                }>${x}</option>`,
            );
            temp = shuffle(temp);
            temp.unshift(`<option value='default' selected>Please select</option>`);
            initialString = initialString.replace(
              `[${matchedPattern[i]}]`,
              `<select id='fill-the-gap-select${indexKey}' name='select${indexKey}'>${temp.join(
                '',
              )}</select>`,
            );
            indexKey += 1;
          }
        }
      }
      // console.log("initialString", initialString);
      return {
        string: initialString,
        amount: indexKey,
      };
    } else {
      return {
        string: '',
        amount: 0,
      };
    }
  };

  const handleCheckPreviewQuestion = useCallback(() => {
    for (let i = 0; i < amountSelect; i++) {
      const result = (document.getElementById(`fill-the-gap-select${i}`) as HTMLInputElement)
        ?.value;
      console.log('result', result);
      if (!result || result === 'false' || result === 'default') {
        setIsWrongAnswer(true);
        setIsDisabledPreviewSubmitButton(true);
        break;
      }
      if (i === amountSelect - 1 && result && result === 'true') {
        setIsWrongAnswer(false);
        setIsPreviewQuestion(false);
        setIsPreviewQuestionInside(false);
      }
    }
  }, [amountSelect, parsedContentTitle]);

  useEffect(() => {
    if (isPreviewQuestion || isPreviewQuestionInside) {
      const temp = parseFillTheGap(contentTitle);
      setParsedContentTitle(temp.string);
      setAmountSelect(temp.amount);
    }
    return () => {
      setAmountSelect(0);
      setParsedContentTitle('');
    };
  }, [contentTitle, isPreviewQuestion, isPreviewQuestionInside]);

    useEffect(() => {
        const addEventSelect = (event: any) => {
            if ((event.target.tagName === 'SELECT' || event.target.tagName === 'OPTION') && (isPreviewQuestion || isPreviewQuestionInside) && amountSelect > 0) {
                let isDisabledButton = false;
                for (let i = 0; i < amountSelect; i++) {
                    // const result = (document.getElementById(`fill-the-gap-select${i}`) as HTMLSelectElement);
                    const result = (document.querySelector(`#fill-the-gap-select${i}`) as HTMLInputElement);
                    if (result?.value === 'default') {
                        isDisabledButton = true;
                        break;
                    }
                }
                setIsDisabledPreviewSubmitButton(isDisabledButton);
            }
        }
        window.addEventListener('change', addEventSelect);
        // const isMobile = (window?.navigator as any)?.userAgentData?.mobile;
        // console.log("isMobile", isMobile)
        // alert("is mobile" + isMobile)
        // if (isMobile) {
        //     window.addEventListener('change', addEventSelect);
        // }
        // else {
        //     window.addEventListener('click', addEventSelect);
        // }

        return () => {
            window.removeEventListener('change', addEventSelect);
            // window.removeEventListener('click', addEventSelect);
            setIsDisabledPreviewSubmitButton(true);
        };
    }, [
        amountSelect,
        contentTitle,
        isPreviewQuestion,
        isPreviewQuestionInside,
    ]);

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
      }}
      footer={[
        <ButtonCustom
          key={'Submit'}
          color="orange"
          onClick={(event) => {
            // setIsPreviewQuestion(false);
            event?.preventDefault();
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

      <div className="container fill-the-gap-preview">
        <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight mb-6 underline underline-offset-2">
          Please fill in the gap:
        </p>

        <span
          className="text-base text-[#6E6B68] custom-fill-the-gap"
          dangerouslySetInnerHTML={{ __html: parsedContentTitle }}
        ></span>
      </div>

      {isWrongAnswer ? (
        <div
          className="text-sm italic font-semibold text-[#EB5757] mt-3"
          style={{
            fontFamily: 'Montserrat',
            maxHeight: '500px',
          }}
        >
          Incorrect answer. Please try again.
        </div>
      ) : (
        ''
      )}
    </Modal>
  );
};

export default FillTheGapModalPreview;
