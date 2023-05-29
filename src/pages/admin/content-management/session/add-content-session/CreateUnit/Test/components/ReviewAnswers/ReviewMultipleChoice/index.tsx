import { Progress } from 'antd';
import React from 'react';
import { IContentAnswered } from '..';
import { IUnitOptions } from '../../../TestConstantsAndInterface';

interface IProps {
    content: IContentAnswered;
    listTestOptions: IUnitOptions;
}

interface ISavedAnswer {
    selectedAnswerPreview: any[];
    isWrongAnswer: boolean;
    listAnswers: any[];
    isDisabledPreviewSubmitButton: boolean;
}

const ReviewMultipleChoice = (props: IProps) => {

    const {
        content,
        listTestOptions,
    } = props

    return (
        <div className='text-base'>
            <div className="multiple-choose__list-answer__answer-item flex flex-col">
                {
                    listTestOptions
                        ?
                        (
                            (listTestOptions.showCorrectAnswers || listTestOptions.showGivenAnswers)
                                ?
                                (
                                    content.answers && content.answers.length > 0
                                        ?
                                        content.answers.map((answer, index) => {
                                            return (
                                                <p
                                                    className={
                                                        // (listTestOptions.showCorrectAnswers && answer.isCorrect ? 'italic' : '')
                                                        // + " " +
                                                        // (listTestOptions.showGivenAnswers && content.savedAnswers
                                                        //     && content.savedAnswers.selectedAnswerPreview
                                                        //     && answer.answerValue
                                                        //     && content.savedAnswers.selectedAnswerPreview.includes(answer.answerValue)
                                                        //     ? 'font-bold' : '')
                                                        (listTestOptions.showCorrectAnswers && answer.isCorrect ? 'font-bold' : '')
                                                        + " " +
                                                        (listTestOptions.showGivenAnswers && content.savedAnswers
                                                            && content.savedAnswers.selectedAnswerPreview
                                                            && answer.answerValue
                                                            && content.savedAnswers.selectedAnswerPreview.includes(answer.answerValue)
                                                            ? 'italic' : '')
                                                    }
                                                    key={index}
                                                >
                                                    {answer.answerTitle || answer.answerValue}
                                                    {
                                                        listTestOptions.showCorrectAnswers
                                                            &&
                                                            listTestOptions.showGivenAnswers
                                                            ?
                                                            (
                                                                answer.isCorrect
                                                                    && content.savedAnswers
                                                                    && content.savedAnswers.selectedAnswerPreview
                                                                    && answer.answerValue
                                                                    && content.savedAnswers.selectedAnswerPreview.includes(answer.answerValue)
                                                                    ?
                                                                    <span style={{ width: "25px", marginLeft: "10px", color: "#46a546" }}>✓</span>
                                                                    :
                                                                    (
                                                                        !content.result
                                                                            ?
                                                                            (
                                                                                !answer.isCorrect
                                                                                    && content.savedAnswers
                                                                                    && content.savedAnswers.selectedAnswerPreview
                                                                                    && answer.answerValue
                                                                                    && content.savedAnswers.selectedAnswerPreview.includes(answer.answerValue)
                                                                                    ?
                                                                                    <span style={{ width: "25px", marginLeft: "10px", color: "#9d261d" }}>✕</span>
                                                                                    :
                                                                                    <span style={{ width: "25px", marginLeft: "10px", color: "#9d261d" }}></span>
                                                                            )
                                                                            :
                                                                            <span style={{ width: "25px", marginLeft: "10px", color: "#9d261d" }}></span>
                                                                    )
                                                            )
                                                            :
                                                            ""
                                                    }
                                                </p>
                                            )
                                        })
                                        :
                                        ""
                                )
                                :
                                ""
                        )
                        :
                        ""
                }
            </div>
        </div>
    );
}

export default ReviewMultipleChoice;