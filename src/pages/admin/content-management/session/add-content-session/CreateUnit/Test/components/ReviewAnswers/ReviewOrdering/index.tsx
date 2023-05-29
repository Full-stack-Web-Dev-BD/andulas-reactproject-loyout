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

const ReviewOrdering = (props: IProps) => {

    const {
        content,
        listTestOptions,
    } = props

    return (
        <div className='text-base'>
            {
                listTestOptions && listTestOptions.showGivenAnswers && !listTestOptions.showCorrectAnswers
                    ?
                    (
                        content.savedAnswers && content.savedAnswers.listDnDAnswer && content.savedAnswers.listDnDAnswer.length > 0 && content.savedAnswers.listDnDAnswer.map((answer: any, index: number) => (
                            <div
                                className={`list-answer-ordering-item relative flex items-center justify-between mb-4 bg-white`}
                                key={index}
                            >
                                <div className="ordering-answer-title text-base">
                                    {answer.answerTitle || answer.answerValue || `Answer ${index + 1}`}
                                </div>
                            </div>
                        ))
                    )
                    :
                    ""
            }
            {
                listTestOptions && listTestOptions.showCorrectAnswers && !listTestOptions.showGivenAnswers
                    ?
                    (
                        content.answers && content.answers.length > 0 && content.answers.sort((a, b) => {
                            return (a.order || 0) - (b.order || 0)
                        }).map((answer: any, index: number) => (
                            <div
                                className={`list-answer-ordering-item relative flex items-center justify-between mb-4 bg-white`}
                                key={index}
                            >
                                <div className="ordering-answer-title text-base font-bold">
                                    {answer.answerTitle || answer.answerValue || `Answer ${index + 1}`}
                                </div>
                            </div>
                        ))
                    )
                    :
                    ""
            }
            {
                listTestOptions && listTestOptions.showCorrectAnswers && listTestOptions.showGivenAnswers
                    ?
                    (
                        content.savedAnswers && content.savedAnswers.listDnDAnswer && content.savedAnswers.listDnDAnswer.length > 0 ? content.savedAnswers.listDnDAnswer.map((answer: any, index: number) => (
                            <div
                                className={`list-answer-ordering-item relative flex items-center justify-between mb-4 bg-white`}
                                key={index}
                            >
                                <div className="ordering-answer-title text-base">
                                    {
                                        answer.order && answer.order === index + 1
                                            ?
                                            <span style={{ width: "25px", marginRight: "10px", color: "#46a546" }}>✓</span>
                                            :
                                            <span style={{ width: "25px", marginRight: "10px", color: "#9d261d" }}>✕</span>
                                    }
                                    {answer.answerTitle || answer.answerValue || `Answer ${index + 1}`}
                                    {" "}
                                    {
                                        !answer.order || (answer.order !== index + 1)
                                            ?
                                            <span className='font-bold'>
                                                ({
                                                    content.answers && content.answers.length > 0
                                                        ?
                                                        content.answers.find((x) => x.order && x.order === index + 1)?.answerTitle
                                                        :
                                                        ""
                                                })
                                            </span>
                                            :
                                            ""
                                    }
                                </div>
                            </div>
                        ))
                            :
                            (
                                (
                                    content.answers && content.answers.length > 0 && content.answers.sort((a, b) => {
                                        return (a.order || 0) - (b.order || 0)
                                    }).map((answer: any, index: number) => (
                                        <div
                                            className={`list-answer-ordering-item relative flex items-center justify-between mb-4 bg-white`}
                                            key={index}
                                        >
                                            <div className="ordering-answer-title text-base font-bold">
                                                {answer.answerTitle || answer.answerValue || `Answer ${index + 1}`}
                                            </div>
                                        </div>
                                    ))
                                )
                            )
                    )
                    :
                    ""
            }
        </div>
    );
}

export default ReviewOrdering;