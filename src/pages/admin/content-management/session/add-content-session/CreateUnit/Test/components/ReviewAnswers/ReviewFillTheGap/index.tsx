import { Progress } from 'antd';
import React from 'react';
import { IContentAnswered } from '..';
import { IUnitOptions } from '../../../TestConstantsAndInterface';

interface IProps {
    content: IContentAnswered;
    listTestOptions: IUnitOptions;
}

interface ISavedAnswer {
    resultText: string;
    isWrongAnswer: boolean;
    isDisabledPreviewSubmitButton: boolean;
}

const ReviewFillTheGap = (props: IProps) => {

    const {
        content,
        listTestOptions,
    } = props;

    console.log('content fill the gap', content)

    const parseFillTheGapCorrectAnswer = (value: string) => {
        if (value?.length > 0) {
            let initialString = value;
            const matchedPattern = initialString.match(/(?:\[)[^\][]*(?=])/g) ? initialString.match(/(?:\[)[^\][]*(?=])/g)?.map((x) => x.substring(1)) : null;
            if (matchedPattern) {
                for (let i = 0; i < matchedPattern.length; i++) {
                    if (matchedPattern[i].split("|").filter(x => x !== '').length >= 1) {
                        const temp = matchedPattern[i].split("|").filter(x => x !== '');
                        initialString = initialString.replace(
                            `[${matchedPattern[i]}]`,
                            `[ <span class="font-bold">${temp[0]}</span> <span style="display: none;" data-option-index='${i}'>${temp[0]}</span>]`
                        );
                    }
                }
            }
            return initialString;
        } else {
            return '';
        }
    };

    return (
        <div className='text-base'>
            {
                listTestOptions && listTestOptions.showGivenAnswers && !listTestOptions.showCorrectAnswers
                    ?
                    (
                        <p dangerouslySetInnerHTML={{ __html: content.studentAnswers ? content.studentAnswers : ""}}></p>
                    )
                    :
                    ""
            }
            {
                listTestOptions && listTestOptions.showCorrectAnswers && !listTestOptions.showGivenAnswers
                    ?
                    (
                        <p dangerouslySetInnerHTML={{ __html: parseFillTheGapCorrectAnswer(content?.contentTitle || '')}}></p>
                    )
                    :
                    ""
            }
            {
                listTestOptions && listTestOptions.showCorrectAnswers && listTestOptions.showGivenAnswers
                    ?
                    (
                        <p dangerouslySetInnerHTML={{ __html: content.savedAnswers && content.savedAnswers.checkAnsweredAnswers ? content.savedAnswers.checkAnsweredAnswers : parseFillTheGapCorrectAnswer(content?.contentTitle || '')}}></p>
                    )
                    :
                    ""
            }
        </div>
    );
}

export default ReviewFillTheGap;