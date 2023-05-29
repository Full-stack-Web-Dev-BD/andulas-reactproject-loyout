import { Button, Checkbox, Modal } from 'antd';
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

const MyCourseFillTheGapPreview = (props: IProps) => {
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
  const [isDisabledPreviewSubmitButton, setIsDisabledPreviewSubmitButton] = useState<boolean>(true);

  const [amountSelect, setAmountSelect] = useState<number>(0);
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
    console.log('valueeeeeeee', value);
    if (value?.length > 0) {
      let initialString = value;
      let indexKey = 0;
      const matchedPattern = initialString.match(/(?:\[)[^\][]*(?=])/g)
        ? initialString.match(/(?:\[)[^\][]*(?=])/g)?.map((x) => x.substring(1))
        : null;
      console.log('matchedPattern', matchedPattern);
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
              (x, index) => `<option value=${index === 0 ? true : false} name=${x}>${x}</option>`,
            );
            if (listTestOptions && listTestOptions.shufflePossibleAnswers) {
              temp = shuffle(temp);
            }
            temp.unshift(
              `<option value='default' selected name='defaultValue'>Please select</option>`,
            );
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
                } name=${x}>${x}</option>`,
            );
            if (listTestOptions && listTestOptions.shufflePossibleAnswers) {
              temp = shuffle(temp);
            }
            temp.unshift(
              `<option value='default' selected name='defaultValue'>Please select</option>`,
            );
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
      console.log('initialString', initialString);
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

  const parseFillTheGapCorrectAnswer = (value: string) => {
    if (value?.length > 0) {
      let initialString = value;
      const matchedPattern = initialString.match(/(?:\[)[^\][]*(?=])/g)
        ? initialString.match(/(?:\[)[^\][]*(?=])/g)?.map((x) => x.substring(1))
        : null;
      if (matchedPattern) {
        for (let i = 0; i < matchedPattern.length; i++) {
          if (matchedPattern[i].split('|').filter((x) => x !== '').length >= 1) {
            const temp = matchedPattern[i].split('|').filter((x) => x !== '');
            initialString = initialString.replace(`[${matchedPattern[i]}]`, `[${temp[0]}]`);
          }
        }
      }
      return initialString;
    } else {
      return '';
    }
  };

  const parseFillTheGapCurrentAnswer = () => {
    const selectedOptions = [];
    for (let i = 0; i < amountSelect; i++) {
      const e = document.getElementById(`fill-the-gap-select${i}`) as HTMLSelectElement;
      if (e && e.options) {
        const text = e.options[e.selectedIndex].text;
        selectedOptions.push(text);
      }
    }
    let tempString = content?.contentTitle || '';
    const matchedPattern = tempString.match(/(?:\[)[^\][]*(?=])/g)
      ? tempString.match(/(?:\[)[^\][]*(?=])/g)?.map((x) => x.substring(1))
      : null;
    if (matchedPattern) {
      for (let i = 0; i < matchedPattern.length; i++) {
        if (matchedPattern[i].split('|').filter((x) => x !== '').length >= 1) {
          tempString = tempString.replace(
            `[${matchedPattern[i]}]`,
            // `[${selectedOptions[i] || ''} ${selectedOptions[i] === matchedPattern[i].split("|").filter(x => x !== '')[0] ? '<span style="color: #46a546">✓</span>' : '<span style="color: #9d261d">✕</span>'}]`
            `[ <span class="">${
              selectedOptions[i] || ''
            }</span> <span style="display: none;" data-option-index='${i}'>${
              selectedOptions[i] || ''
            }</span>]`,
          );
        }
      }
    }
    return tempString;
  };

  const parseFillTheGapCorrectOrNotCurrentAnswer = () => {
    const selectedOptions = [];
    for (let i = 0; i < amountSelect; i++) {
      const e = document.getElementById(`fill-the-gap-select${i}`) as HTMLSelectElement;
      if (e && e.options) {
        const text = e.options[e.selectedIndex].text;
        selectedOptions.push(text);
      }
    }
    let tempString = content?.contentTitle || '';
    const matchedPattern = tempString.match(/(?:\[)[^\][]*(?=])/g)
      ? tempString.match(/(?:\[)[^\][]*(?=])/g)?.map((x) => x.substring(1))
      : null;
    if (matchedPattern) {
      for (let i = 0; i < matchedPattern.length; i++) {
        if (matchedPattern[i].split('|').filter((x) => x !== '').length >= 1) {
          tempString = tempString.replace(
            `[${matchedPattern[i]}]`,
            `[ <span class="">${
              selectedOptions[i] || ''
            }</span> <span style="display: none;" data-option-index='${i}'>${
              selectedOptions[i] || ''
            }</span> 
                        ${
                          selectedOptions[i] ===
                          matchedPattern[i].split('|').filter((x) => x !== '')[0]
                            ? '<span style="color: #46a546">✓</span>'
                            : `<span style="color: #9d261d">✕</span> | <span class="font-bold">${
                                matchedPattern[i].split('|').filter((x) => x !== '')[0] || ''
                              }</span><span style="display: none;" data-option-index='${i}'>${
                                matchedPattern[i].split('|').filter((x) => x !== '')[0] || ''
                              }</span>`
                        } ]`,
            // `[ <span class="">${selectedOptions[i] || ''}</span> <span style="display: none;" data-option-index='${i}'>${selectedOptions[i] || ''}</span>]`
          );
        }
      }
    }
    return tempString;
  };

  const parseFillTheGapCompletedAndPassed = (value: string) => {
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
              (x, index) =>
                `<option value=${index === 0 ? true : false} ${
                  index === 0 ? 'selected' : ''
                } name=${x}>${x}</option>`,
            );
            if (listTestOptions && listTestOptions.shufflePossibleAnswers) {
              temp = shuffle(temp);
            }
            temp.unshift(`<option value='default' name='defaultValue'>Please select</option>`);
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
                } ${
                  x === matchedPattern[i].split('|').filter((y) => y !== '')[0] ? 'selected' : ''
                } name=${x}>${x}</option>`,
            );
            if (listTestOptions && listTestOptions.shufflePossibleAnswers) {
              temp = shuffle(temp);
            }
            temp.unshift(`<option value='default' name='defaultValue'>Please select</option>`);
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
      console.log('initialString', initialString);
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

  const handleCheckPreviewQuestion = useCallback(
    (isBack?: boolean) => {
      for (let i = 0; i < amountSelect; i++) {
        const result = (document.getElementById(`fill-the-gap-select${i}`) as HTMLInputElement)
          ?.value;
        if (listTestOptions?.checkNotContinueUntilCorrectAnswer && !isBack) {
          if (!result || result === 'false' || result === 'default') {
            setIsWrongAnswer(true);
            setIsDisabledPreviewSubmitButton(true);
            return false;
          }
          if (i === amountSelect - 1 && result && result === 'true') {
            setIsWrongAnswer(false);
            return true;
          }
        } else {
          if (!result || result === 'false' || result === 'default') {
            return false;
          }
          if (i === amountSelect - 1 && result && result === 'true') {
            return true;
          }
        }
      }
    },
    [amountSelect, parsedContentTitle, listTestOptions],
  );

    useEffect(() => {
        const addEventSelect = (event: any) => {
          // console.log('eventtttttt', event.target)
            if ((event.target.tagName === 'SELECT' || event.target.tagName === 'OPTION') && amountSelect > 0) {
                let isDisabledButton = false;
                for (let i = 0; i < amountSelect; i++) {
                    // const result = (document.getElementById(`fill-the-gap-select${i}`) as HTMLSelectElement);
                    const result = (document.querySelector(`#fill-the-gap-select${i}`) as HTMLSelectElement);
                    const options = result?.getElementsByTagName('OPTION');
                    for (let j = 0; j < options.length; j++) {
                        if ((options[j] as HTMLOptionElement) && result.value) {
                            if (j === result.selectedIndex) {
                                options[j].setAttribute('selected', '');
                            }
                            else {
                                options[j].removeAttribute('selected');
                            }
                        }
                    }
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
        // const isIOS = /iPad|iPhone|iPod/.test((window?.navigator as any)?.platform);
        // console.log("isMobile", isMobile)
        // alert("is mobile" + " " + isMobile + " is ios " + isIOS);
        // if (isMobile || isIOS) {
        //     window.addEventListener('change', addEventSelect);
        // }
        // else {
        //     window.addEventListener('click', addEventSelect);
        // }

        return () => {
            window.removeEventListener('change', addEventSelect);
            // window.removeEventListener('click', addEventSelect);
        };
    }, [
        amountSelect,
        parsedContentTitle,
    ]);

  useEffect(() => {
    console.log('content', content, unit);
    if (
      content?.contentTitle &&
      content?.isCompleted &&
      content?.isPassed &&
      unit?.unitType !== UnitType.TEST
    ) {
      const temp = parseFillTheGapCompletedAndPassed(content.contentTitle);
      setParsedContentTitle(temp.string);
      setAmountSelect(temp.amount);
      setIsWrongAnswer(false);
      setIsDisabledPreviewSubmitButton(false);
    } else if (content?.savedAnswers) {
      setAmountSelect(content.savedAnswers.amountSelect || 0);
      setParsedContentTitle(content.savedAnswers.parsedContentTitle || '');
      setIsWrongAnswer(content.savedAnswers.isWrongAnswer || false);
      setIsDisabledPreviewSubmitButton(
        content.savedAnswers.isDisabledPreviewSubmitButton === true ||
          content.savedAnswers.isDisabledPreviewSubmitButton === false
          ? content.savedAnswers.isDisabledPreviewSubmitButton
          : true,
      );
    } else if (content?.contentTitle) {
      const temp = parseFillTheGap(content?.contentTitle);
      setParsedContentTitle(temp.string);
      setAmountSelect(temp.amount);
    } else {
      setParsedContentTitle('');
      setAmountSelect(0);
    }

    return () => {
      setParsedContentTitle('');
      setAmountSelect(0);
      setIsDisabledPreviewSubmitButton(true);
      setIsWrongAnswer(false);
    };
  }, [content, listTestOptions, unit]);

  const onClickBack = () => {
    if (handleClickBack) {
      const result = handleCheckPreviewQuestion(true);

      const tempAnswered = parseFillTheGapCurrentAnswer();
      const tempCorrect = parseFillTheGapCorrectAnswer(content?.contentTitle || '');
      const checkAnsweredAnswers = parseFillTheGapCorrectOrNotCurrentAnswer();
      const answeredAnswers = renderToString(
        <div className="text-base" dangerouslySetInnerHTML={{ __html: tempAnswered }}></div>,
      );
      const correctAnswers = renderToString(
        <div className="text-base" dangerouslySetInnerHTML={{ __html: tempCorrect }}></div>,
      );
      const savedAnswers = {
        amountSelect,
        // isWrongAnswer: listTestOptions?.checkNotContinueUntilCorrectAnswer ? (result ? false : true) : false,
        isWrongAnswer: isWrongAnswer || false,
        parsedContentTitle:
          document.getElementById('fill-the-gap__preview')?.innerHTML || parsedContentTitle,
        isDisabledPreviewSubmitButton,
        checkAnsweredAnswers,
      };
      handleClickBack(result || false, answeredAnswers, correctAnswers, savedAnswers);
    }
  };

  const onClickContinue = (isSubmitedAnswer?: boolean) => {
    const result = handleCheckPreviewQuestion();

    const tempAnswered = parseFillTheGapCurrentAnswer();
    const tempCorrect = parseFillTheGapCorrectAnswer(content?.contentTitle || '');
    const checkAnsweredAnswers = parseFillTheGapCorrectOrNotCurrentAnswer();
    const answeredAnswers = renderToString(
      <div className="text-base" dangerouslySetInnerHTML={{ __html: tempAnswered }}></div>,
    );
    const correctAnswers = renderToString(
      <div className="text-base" dangerouslySetInnerHTML={{ __html: tempCorrect }}></div>,
    );
    const savedAnswers = {
      amountSelect,
      // isWrongAnswer: listTestOptions?.checkNotContinueUntilCorrectAnswer ? (result ? false : true) : false,
      isWrongAnswer: false,
      parsedContentTitle:
        document.getElementById('fill-the-gap__preview')?.innerHTML || parsedContentTitle,
      isDisabledPreviewSubmitButton,
      checkAnsweredAnswers,
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
          result || false,
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
          result || false,
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
          <p className="text-2xl font-fontFamily font-bold mb-6 tracking-tight mb-6 underline underline-offset-2">
            Please fill in the gap:
          </p>

          <p
            className="text-base text-[#6E6B68]"
            id="fill-the-gap__preview"
            dangerouslySetInnerHTML={{ __html: parsedContentTitle }}
          ></p>
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
            <Button
              className="h-[44px] rounded-xl font-semibold text-base bg-[#ED7635] text-[#FFFFFF] sm:w-full"
              disabled={isDisabledPreviewSubmitButton}
              onClick={() => {
                onClickContinue(true);
              }}
            >
              Submit answer
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default MyCourseFillTheGapPreview;
