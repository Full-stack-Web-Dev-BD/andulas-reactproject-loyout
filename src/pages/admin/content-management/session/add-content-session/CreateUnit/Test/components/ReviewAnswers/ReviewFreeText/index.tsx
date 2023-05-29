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

const ReviewFreeText = (props: IProps) => {

    const {
        content,
        listTestOptions,
    } = props

    return (
        <div className='text-base'>
            {
                listTestOptions && listTestOptions.showGivenAnswers
                    ?
                    (
                        <p>{content.savedAnswers && content.savedAnswers.resultText ? content.savedAnswers.resultText : ""}</p>
                    )
                    :
                    ""
            }
            {
                listTestOptions && listTestOptions.showCorrectAnswers
                    ?
                    (
                        content.result
                            ?
                            <Progress className='w-[200px]' percent={100} strokeColor={{ '0%': '#0e90d2', '100%': '#0e90d2' }} showInfo={false} />
                            :
                            <Progress className='w-[200px]' percent={0} strokeColor={{ '0%': '#0e90d2', '100%': '#0e90d2' }} showInfo={false} />
                    )
                    :
                    ""
            }
        </div>
    );
}

export default ReviewFreeText;