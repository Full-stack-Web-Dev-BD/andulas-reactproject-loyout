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

const ReviewDragAndDrop = (props: IProps) => {

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
                        content.savedAnswers && content.savedAnswers.checkAnsweredAnswers && content.savedAnswers.checkAnsweredAnswers.length > 0
                            ?
                            (
                                <div className="drag-drop-preview__title">
                                    <div className="relative flex flex-col">
                                        {content.savedAnswers.checkAnsweredAnswers.map((x: any, index: number) => (
                                            <div className="droppable-container relative flex flex-col" key={index}>
                                                <div className="inner">
                                                    <div className="drag-drop-title list-answer-ordering-item absolute flex items-center justify-between bg-white text-xl">
                                                        {x.answerTitle}
                                                    </div>
                                                    <span className="tl-left-cell-puzzle pull-right">&nbsp;&nbsp;&nbsp;</span>
                                                    <div className="drag-drop-value relative flex">
                                                        <div className="ordering-answer-title text-xl w-full">
                                                            {x.answerValue}
                                                        </div>
                                                        <span className="tl-right-cell-puzzle pull-left top-unset left-minus-17px">&nbsp;&nbsp;&nbsp;</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                            :
                            ""
                    ) : ""
            }
            {
                listTestOptions && listTestOptions.showCorrectAnswers && !listTestOptions.showGivenAnswers
                    ?
                    (
                        content.answers && content.answers.length > 0
                            ?
                            (
                                <div className="drag-drop-preview__title">
                                    <div className="relative flex flex-col">
                                        {(content.answers || [])?.map((x, index) => (
                                            <div className="droppable-container relative flex flex-col" key={index}>
                                                <div className="inner">
                                                    <div className="drag-drop-title list-answer-ordering-item absolute flex items-center justify-between bg-white text-xl">
                                                        {x.answerTitle}
                                                    </div>
                                                    <span className="tl-left-cell-puzzle pull-right">&nbsp;&nbsp;&nbsp;</span>
                                                    <div className="drag-drop-value relative flex">
                                                        <div className="ordering-answer-title text-xl w-full font-bold">
                                                            {x.answerValue}
                                                        </div>
                                                        <span className="tl-right-cell-puzzle pull-left top-unset left-minus-17px">&nbsp;&nbsp;&nbsp;</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                            :
                            ""
                    )
                    :
                    ""
            }
            {
                listTestOptions && listTestOptions.showCorrectAnswers && listTestOptions.showGivenAnswers
                    ?
                    (
                        content.savedAnswers && content.savedAnswers.checkAnsweredAnswers && content.savedAnswers.checkAnsweredAnswers.length > 0
                            ?
                            (
                                <div className="drag-drop-preview__title">
                                    <div className="relative flex flex-col">
                                        {content.savedAnswers.checkAnsweredAnswers.map((x: any, index: number) => (
                                            <div className="droppable-container relative flex flex-col" key={index}>
                                                <div className="inner">
                                                    <div className="drag-drop-title list-answer-ordering-item absolute flex items-center justify-between bg-white text-xl">
                                                        {x.answerTitle}
                                                    </div>
                                                    <span className="tl-left-cell-puzzle pull-right">&nbsp;&nbsp;&nbsp;</span>
                                                    <div className="drag-drop-value relative flex">
                                                        <div className="ordering-answer-title text-xl w-full">
                                                            {
                                                                content.answers && content.answers.length > 0
                                                                    &&
                                                                    x.answerValue
                                                                    &&
                                                                    content.answers.find(answer => answer.answerTitle === x.answerTitle)?.answerValue === x.answerValue
                                                                    ?
                                                                    <span style={{ width: "25px", marginRight: "10px", color: "#46a546" }}>✓</span>
                                                                    :
                                                                    <span style={{ width: "25px", marginRight: "10px", color: "#9d261d" }}>✕</span>
                                                            }
                                                            {x.answerValue}
                                                            {
                                                                content.answers && content.answers.length > 0
                                                                    &&
                                                                    x.answerValue
                                                                    &&
                                                                    content.answers.find(answer => answer.answerTitle === x.answerTitle)?.answerValue === x.answerValue
                                                                    ?
                                                                    ""
                                                                    :
                                                                    (
                                                                        content.answers && content.answers.length > 0
                                                                            ?
                                                                            <span className='font-bold'>
                                                                                {" "}
                                                                                ({content.answers.find(answer => answer.answerTitle === x.answerTitle)?.answerValue})
                                                                            </span>
                                                                            :
                                                                            ""
                                                                    )
                                                            }
                                                        </div>
                                                        <span className="tl-right-cell-puzzle pull-left top-unset left-minus-17px">&nbsp;&nbsp;&nbsp;</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                            :
                            (
                                content.answers && content.answers.length > 0
                                    ?
                                    (
                                        <div className="drag-drop-preview__title">
                                            <div className="relative flex flex-col">
                                                {(content.answers || [])?.map((x, index) => (
                                                    <div className="droppable-container relative flex flex-col" key={index}>
                                                        <div className="inner">
                                                            <div className="drag-drop-title list-answer-ordering-item absolute flex items-center justify-between bg-white text-xl">
                                                                {x.answerTitle}
                                                            </div>
                                                            <span className="tl-left-cell-puzzle pull-right">&nbsp;&nbsp;&nbsp;</span>
                                                            <div className="drag-drop-value relative flex">
                                                                <div className="ordering-answer-title text-xl w-full font-bold">
                                                                    {x.answerValue}
                                                                </div>
                                                                <span className="tl-right-cell-puzzle pull-left top-unset left-minus-17px">&nbsp;&nbsp;&nbsp;</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                    :
                                    ""
                            )
                    )
                    :
                    ""
            }
        </div>
    );
}

export default ReviewDragAndDrop;